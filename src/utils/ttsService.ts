/**
 * Utility service to communicate with the local Python Pocket TTS backend.
 */

// The URL where the FastAPI backend is running
const TTS_API_URL = process.env.NEXT_PUBLIC_TTS_API_URL || 'http://localhost:8000';

export class TTSService {
  /**
   * Generates audio from text by calling the Python backend and plays it immediately.
   * 
   * @param text The text to synthesize
   * @returns A Promise that resolves when the audio finishes playing
   */
  static async speak(text: string): Promise<void> {
    if (!text || text.trim() === '') return;

    try {
      // Call the FastAPI endpoint
      const response = await fetch(`${TTS_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`TTS API Error: ${response.status} ${response.statusText}`);
      }

      // Convert the response to an audio blob
      const audioBlob = await response.blob();
      
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          // Clean up the URL once playback finishes
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          reject(e);
        };
        
        audio.play().catch(reject);
      });

    } catch (error) {
      console.error("Failed to generate or play TTS audio:", error);
      // Fallback: If TTS fails, we could use the browser's built-in speech synthesis
      // TTSService.fallbackSpeak(text);
    }
  }

  /**
   * Native browser TTS fallback just in case the Python server is offline.
   */
  static fallbackSpeak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Assuming Indonesian
      window.speechSynthesis.speak(utterance);
    }
  }
}
