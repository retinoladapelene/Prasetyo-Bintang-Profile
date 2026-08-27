from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
import os
import scipy.io.wavfile
import logging

# We will load the model globally so it only loads once on startup
from pocket_tts import TTSModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pocket TTS Server")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold model and voice state
tts_model = None
voice_state = None

# Use a relative path so it works on cloud servers (Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_VOICE = os.path.join(BASE_DIR, "voice_samples", "rekaman_saya_processed.wav")

@app.on_event("startup")
async def startup_event():
    global tts_model, voice_state
    
    # Login to Hugging Face if HF_TOKEN is provided (required for Render deployment)
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        from huggingface_hub import login
        logger.info("HF_TOKEN found, logging into Hugging Face...")
        login(token=hf_token)
        
    logger.info("Loading Pocket TTS Model (this might take a while on first run)...")
    try:
        tts_model = TTSModel.load_model()
        logger.info(f"Loading voice state for: {DEFAULT_VOICE}...")
        voice_state = tts_model.get_state_for_audio_prompt(DEFAULT_VOICE)
        logger.info("Pocket TTS successfully initialized!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise e

class TTSRequest(BaseModel):
    text: str

@app.post("/generate")
async def generate_audio(req: TTSRequest):
    if tts_model is None or voice_state is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        logger.info(f"Generating audio for text: '{req.text}'")
        # Generate the audio tensor
        audio_tensor = tts_model.generate_audio(voice_state, req.text)
        
        import numpy as np
        import numpy as np
        
        # Convert tensor to 1D numpy array
        audio_np = audio_tensor.numpy().squeeze()
        
        # 1. NOISE REDUCTION
        # Remove background hiss/wind noise cloned from the original mic recording
        try:
            import noisereduce as nr
            # Perform noise reduction
            audio_np = nr.reduce_noise(y=audio_np, sr=tts_model.sample_rate, prop_decrease=0.8)
        except ImportError:
            logger.warning("noisereduce library not found, skipping noise reduction")
            
        # 2. DYNAMIC VOLUME BOOST
        # Use the 99th percentile for normalization to ignore random loud peaks/clicks
        p99 = np.percentile(np.abs(audio_np), 99)
        if p99 > 0:
            # Boost volume so the 99th percentile is at 95% maximum volume
            audio_np = (audio_np / p99) * 0.95
            
        # Ensure it's in the correct absolute range [-1.0, 1.0] before converting to int16 PCM
        audio_np = np.clip(audio_np, -1.0, 1.0)
        
        # Scale to 16-bit PCM
        audio_np = (audio_np * 32767.0).astype(np.int16)
        
        buffer = io.BytesIO()
        scipy.io.wavfile.write(buffer, tts_model.sample_rate, audio_np)
        buffer.seek(0)
        
        return StreamingResponse(buffer, media_type="audio/wav")
    except Exception as e:
        logger.error(f"Error generating audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": tts_model is not None}
