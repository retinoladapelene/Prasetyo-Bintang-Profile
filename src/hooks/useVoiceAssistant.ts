'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  // Load memori dari localStorage saat pertama kali dimuat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('stars_user_name');
      if (savedName) setUserName(savedName);

      const savedHistory = localStorage.getItem('stars_chat_history');
      if (savedHistory) {
        try {
          setChatHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse chat history");
        }
      }
    }
  }, []);

  // Simpan nama ke localStorage jika berubah
  useEffect(() => {
    if (userName) localStorage.setItem('stars_user_name', userName);
  }, [userName]);

  // Simpan riwayat chat ke localStorage jika berubah
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('stars_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVoiceInput = useCallback(async (text: string) => {
    if (!text || !text.trim()) {
      setIsListening(false);
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Kirim text dan riwayat obrolan ke Groq LLM API
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory, userName }),
      });

      if (!chatRes.ok) {
        const err = await chatRes.json();
        throw new Error(err.error || 'Gagal menghubungi Groq API');
      }

      let { reply, audioUrl } = await chatRes.json();
      
      // Deteksi jika AI mengenali nama user (format [USER_NAME: Andi])
      const nameMatch = reply.match(/\[USER_NAME:\s*(.+?)\]/i);
      if (nameMatch && nameMatch[1]) {
        setUserName(nameMatch[1].trim());
      }
      
      // Hapus tag rahasia agar tidak dibaca oleh TTS
      reply = reply.replace(/\[USER_NAME:\s*.+?\]/gi, '').trim();
      
      // Simpan percakapan ke memori (maksimal 6 pesan terakhir agar konteks tidak terlalu berat)
      setChatHistory(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: reply }].slice(-6));

      // Jika server mengembalikan audioUrl (misal untuk suara ngorok), mainkan file lokal tersebut
      if (audioUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        audioRef.current.src = audioUrl;
        audioRef.current.onplay = () => setIsSpeaking(true);
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          setError("Gagal memutar audio lokal.");
        };
        
        await audioRef.current.play();
        return;
      }

      // 2. Gunakan Edge Neural TTS API
      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply }),
        });

        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          const audioUrlStr = URL.createObjectURL(audioBlob);
          
          if (!audioRef.current) {
            audioRef.current = new Audio();
          }
          
          audioRef.current.src = audioUrlStr;
          audioRef.current.onplay = () => setIsSpeaking(true);
          audioRef.current.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrlStr);
          };
          audioRef.current.onerror = () => {
            setIsSpeaking(false);
            setError("Gagal memutar audio Edge TTS.");
          };
          
          await audioRef.current.play();
        } else {
          throw new Error("Server TTS mengembalikan respon error.");
        }
      } catch (err) {
        console.error("Gagal menghubungi Edge TTS:", err);
        throw new Error("Gagal menghasilkan suara Neural.");
      }

    } catch (err: any) {
      console.error('AI Voice Assistant Error:', err);
      setError(err.message || 'Terjadi kesalahan pada server AI.');
    } finally {
      setIsProcessing(false);
    }
  }, [chatHistory]);

  useEffect(() => {
    // Inisialisasi Web Speech API (Speech to Text)
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = async (event: any) => {
          const currentTranscript = event.results[0][0].transcript;
          setTranscript(currentTranscript);
          setIsListening(false);
          await handleVoiceInput(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError(`Gagal merekam suara: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setTimeout(() => setError('Browser Anda tidak mendukung Web Speech API. Gunakan Chrome atau Safari.'), 0);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [handleVoiceInput]);

  const startListening = useCallback(() => {
    setError(null);
    if (!recognitionRef.current) {
      setError('Web Speech API tidak didukung browser ini.');
      return;
    }
    
    // Stop audio jika sedang berbicara
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.error(e);
      if (e.name === 'InvalidStateError') {
         recognitionRef.current.stop();
         setIsListening(false);
      }
    }
  }, [isListening]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    error,
    startListening,
    userName,
  };
}
