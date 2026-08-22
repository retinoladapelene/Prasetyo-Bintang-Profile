import { NextResponse } from 'next/server';
import { EdgeTTS } from '@andresaya/edge-tts';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Teks tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Inisialisasi Edge TTS
    const tts = new EdgeTTS();
    
    // Synthesize text menggunakan suara Ardi (Pria, Indonesia)
    // Pilihan lain: id-ID-GadisNeural (Wanita)
    await tts.synthesize(text, "id-ID-ArdiNeural", {
      rate: '-10%', // Diperlambat sedikit agar lebih santai dan pronounciation-nya jelas
      volume: '0%', // Volume normal
      pitch: '-5Hz' // Pitch sedikit diturunkan agar terkesan lebih maskulin/santai
    });

    // Ambil buffer MP3
    const audioBuffer = tts.toBuffer();

    // Return sebagai file audio mp3
    return new NextResponse(audioBuffer as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Error generating Edge TTS:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghasilkan suara' },
      { status: 500 }
    );
  }
}
