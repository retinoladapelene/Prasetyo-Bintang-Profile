import { NextResponse } from 'next/server';
import { getSystemPrompt } from '@/config/ai-persona';

// In-memory rate limiting berdasarkan IP (Membatasi token Groq API)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const MAX_REQUESTS_PER_DAY = 15; // Maksimal 15 chat per hari per IP
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 jam (dalam milidetik)

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Secret keyword untuk testing fitur ngorok tanpa menghabiskan limit
    if (message.toLowerCase().includes('coba suara ngorok') || message.toLowerCase().includes('test ngorok')) {
      return NextResponse.json({ 
        reply: '*Zzzzz... (Terdengar suara ngorok)*',
        audioUrl: '/snoring.mp3'
      });
    }

    // Rate Limiting Logic berdasarkan IP Address
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const currentTime = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, lastReset: currentTime });
    } else {
      const rateData = rateLimitMap.get(ip)!;
      if (currentTime - rateData.lastReset > WINDOW_MS) {
        // Reset limit setelah lewat 24 jam
        rateLimitMap.set(ip, { count: 1, lastReset: currentTime });
      } else {
        rateData.count += 1;
        rateLimitMap.set(ip, rateData);

        if (rateData.count > MAX_REQUESTS_PER_DAY) {
          const overLimitCount = rateData.count - MAX_REQUESTS_PER_DAY;
          
          if (overLimitCount === 1) {
            // Pelanggaran pertama (ke-16)
            return NextResponse.json({ reply: 'udahan dulu yaa ngobrolnya gua mau tidur' });
          } else {
            // Pelanggaran kedua dan seterusnya (ke-17, 18, dst)
            // Mengirim audioUrl agar frontend memutar file lokal alih-alih menggunakan TTS
            return NextResponse.json({ 
              reply: '*Zzzzz... (Terdengar suara ngorok)*',
              audioUrl: '/snoring.mp3'
            });
          }
        }
      }
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API Key tidak ditemukan. Harap isi GROQ_API_KEY di file .env.local Anda.' },
        { status: 500 }
      );
    }

    const systemPrompt = await getSystemPrompt();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b', // Menggunakan model gpt-oss-120b karena terbukti memiliki gaya bahasa gaul Jakarta yang jauh lebih natural daripada Qwen
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Jika kuota Groq API habis atau limit tercapai, kembalikan pesan santai ini sebagai balasan normal
        return NextResponse.json({ reply: 'nnti lagi ya ngobrolnya gua mau tidur' });
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gagal menghubungi Groq API');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.warn("Groq API mengembalikan respon kosong. Raw data:", JSON.stringify(data));
    }
    
    const reply = content || 'Duh, otak gua nge-blank bentar. Coba tanya lagi dah.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
