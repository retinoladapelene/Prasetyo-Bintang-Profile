const { EdgeTTS } = require('@andresaya/edge-tts');
const fs = require('fs');

async function testTTS() {
  try {
    const tts = new EdgeTTS();
    await tts.synthesize("Halo bro, ini adalah tes suara yang sangat natural menggunakan Edge TTS.", "id-ID-ArdiNeural", {
      rate: '0%',
      volume: '0%',
      pitch: '0Hz'
    });
    
    // The library writes to a file or stream, but let's check its docs via code
    tts.toFile('test-audio.mp3');
    console.log("TTS successful");
  } catch (err) {
    console.error("TTS failed:", err);
  }
}

testTTS();
