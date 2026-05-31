/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, 
  Mic, 
  MicOff,
  Map as MapIcon, 
  History, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon,
  Send,
  Loader2,
  RefreshCw,
  Compass,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// Constants
const MODEL_NAME = "gemini-3-flash-preview";

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const SYSTEM_PROMPT = `
Kamu adalah "Pemandu Sejarah Inklusif" yang ahli dalam materi Akulturasi Hindu-Buddha di Indonesia. 
Tugas utamanya adalah membantu siswa tunanetra memahami sejarah visual melalui deskripsi audio yang imersif, sensorik, dan mudah dibayangkan.

GAYA BICARA:
- Berbicaralah seperti TOUR GUIDE ASLI yang sedang jalan-jalan santai dengan teman di lokasi.
- Gunakan bahasa yang santai, hangat, dan tidak kaku. Jangan seperti membaca buku teks.
- HINDARI kalimat penutup yang terlalu puitis, formal, atau terdengar seperti pidato.
- Gunakan sapaan akrab seperti "Sahabat," "Teman-teman," atau "Kamu."
- Ceritakan detailnya secara mengalir. Jika selesai menjelaskan satu bagian, sambung dengan pertanyaan atau ajakan untuk "jalan" ke titik berikutnya.

PENTING - SUASANA REAL: 
Sertakan indikator suara latar dalam kurung siku untuk sistem audio, contoh: "[angin]", "[lonceng]", "[gemericik]". 

ATURAN DESKRIPSI:
1. DESKRIPSI SPASIAL: Gunakan patokan tubuh, contoh: "Coba bayangkan tanganmu meraba dinding di sebelah kiri..." atau "Tepat di depan wajahmu, ada relief yang..."
2. SENSORIK & TEKSTUR: "Batunya kerasa kasar dan agak dingin, seperti tekstur aspal tapi lebih solid dan berlumut tipis."
3. NARASI SEJARAH: Ceritakan kisah di baliknya seolah-olah ini adalah petualangan nyata.
4. ANALOGI AKULTURASI: Jelaskan perpaduan budaya dengan benda yang mudah dibayangkan (tumpeng, payung, susunan kue).
`;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hai! [lonceng] Senang sekali bisa menemani kamu hari ini. Anggap saja kita lagi jalan-jalan bareng di situs sejarah ya. Di sini udaranya sejuk, ada aroma tanah basah dan batu lama yang khas. Kamu mau kita mulai petualangan dari mana? Bisa kirim foto yang kamu punya, atau langsung tanya aja, aku siap ceritain apa pun soal candi dan budaya kita."
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAmbienceOn, setIsAmbienceOn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambienceRef = useRef<any>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Web Audio Procedural Sounds
  const playWindSFX = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    const duration = 4;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + duration/2);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);
  };

  const playBellSFX = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3);
  };

  const toggleAmbience = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;

    if (isAmbienceOn) {
      ambienceRef.current?.stop();
      setIsAmbienceOn(false);
    } else {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;
      const gain = ctx.createGain();
      gain.gain.value = 0.03;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      ambienceRef.current = noise;
      setIsAmbienceOn(true);
      speak("Suara latar Nusantara telah diaktifkan.");
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(undefined, transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Speech
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      // Trigger SFX
      if (text.toLowerCase().includes("[angin]") || text.toLowerCase().includes("suara angin")) playWindSFX();
      if (text.toLowerCase().includes("[lonceng]") || text.toLowerCase().includes("dentang")) playBellSFX();
      
      // Clean text for natural speech
      const cleaned = text
        .replace(/\[.*?\]/g, '') // Remove everything in brackets
        .replace(/[\*\#\_]/g, '') // Remove MD chars
        .replace(/\n/g, ' ') // Natural pauses
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85; 
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
    if (isSpeaking) stopSpeaking();
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeaking(); // Stop talking before listening
      recognitionRef.current?.start();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const parts: any[] = [{ text: textToSend || "Jelaskan gambar ini dengan panduan inklusif Anda." }];
      
      if (selectedImage) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: selectedImage.split(',')[1]
          }
        });
      }

      const history = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          ...history,
          { role: 'user', parts }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      const aiText = response.text || "Maaf, saya kesulitan mengolah informasi tersebut. Mari coba lagi.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
      if (autoSpeak) speak(aiText);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Terjadi kesalahan teknis. Mari kita coba lagi nanti." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        speak("Gambar berhasil diunggah. Silakan tanyakan apa saja tentang gambar ini.");
      };
      reader.readAsDataURL(file);
    }
  };

  const startVirtualTour = (location: string) => {
    const text = `Ceritakan tentang ${location} dengan fokus pada akulturasi.`;
    handleSendMessage(undefined, text);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f5f2ed] font-sans text-[#1a1a1a]">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-[#D2B48C] flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#5A5A40] rounded-full text-white">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Nusantara Inklusif</h1>
            <p className="text-xs text-[#5A5A40] font-medium uppercase tracking-wider">Audio Guide Akulturasi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleAmbience}
            className={cn(
              "p-3 rounded-full transition-all duration-300 shadow-sm",
              isAmbienceOn ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
            )}
            title="Aktifkan Suara Atmosfer"
            aria-label={isAmbienceOn ? "Matikan suara atmosfer" : "Aktifkan suara atmosfer"}
          >
            <RefreshCw className={cn("w-5 h-5", isAmbienceOn && "animate-spin-slow")} />
          </button>
          <button 
            onClick={toggleAutoSpeak}
            className={cn(
              "p-3 rounded-full transition-all duration-300 shadow-sm",
              autoSpeak ? "bg-[#5A5A40] text-white" : "bg-gray-200 text-gray-500"
            )}
            aria-label={autoSpeak ? "Matikan suara otomatis" : "Aktifkan suara otomatis"}
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[90%] md:max-w-[75%]",
                m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              {m.image && (
                <div className="mb-2 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                  <img src={m.image} alt="Unggahan Anda" className="max-w-full h-56 object-cover" />
                </div>
              )}
              
              <div className={cn(
                "p-6 rounded-2xl shadow-md",
                m.role === 'user' 
                  ? "bg-[#A0522D] text-white rounded-tr-none" 
                  : "bg-white text-[#1a1a1a] border border-[#D2B48C] rounded-tl-none"
              )}>
                <div className={cn(
                  "prose prose-sm max-w-none leading-relaxed",
                  m.role === 'user' ? "text-white prose-invert" : "text-[#1a1a1a]"
                )}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                
                {m.role === 'assistant' && (
                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => speak(m.content)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#5A5A40] bg-[#f5f2ed] rounded-full hover:bg-[#D2B48C] hover:text-white transition-all shadow-sm"
                    >
                      <Volume2 className="w-4 h-4" /> Dengarkan Narasi
                    </button>
                    {isSpeaking && (
                      <button 
                        onClick={stopSpeaking}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-all shadow-sm"
                      >
                        <Square className="w-4 h-4" /> Hentikan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-[#5A5A40] italic"
          >
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#5A5A40] rounded-full animate-bounce delay-0" />
              <span className="w-2.5 h-2.5 bg-[#5A5A40] rounded-full animate-bounce delay-150" />
              <span className="w-2.5 h-2.5 bg-[#5A5A40] rounded-full animate-bounce delay-300" />
            </div>
            <span className="text-sm font-semibold">Sang Pemandu sedang merangkai suasana...</span>
          </motion.div>
        )}
      </div>

      {/* Preset Tours */}
      <div className="px-4 py-2 flex gap-3 overflow-x-auto no-scrollbar pb-4 bg-[#f5f2ed]">
        <button 
          onClick={() => startVirtualTour("Candi Borobudur")}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#D2B48C] rounded-full text-sm font-bold text-[#5A5A40] shadow-md hover:scale-105 transition-all active:scale-95"
        >
          <MapIcon className="w-4 h-4" /> Tur Borobudur
        </button>
        <button 
          onClick={() => startVirtualTour("Candi Prambanan")}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#D2B48C] rounded-full text-sm font-bold text-[#5A5A40] shadow-md hover:scale-105 transition-all active:scale-95"
        >
          <MapIcon className="w-4 h-4" /> Tur Prambanan
        </button>
        <button 
          onClick={() => startVirtualTour("Relief Karmawibhangga")}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#D2B48C] rounded-full text-sm font-bold text-[#5A5A40] shadow-md hover:scale-105 transition-all active:scale-95"
        >
          <History className="w-4 h-4" /> Relief Karma
        </button>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t-2 border-[#D2B48C] shadow-2xl">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-4 max-w-4xl mx-auto">
          {selectedImage && (
            <div className="relative inline-block w-28 h-28">
              <img src={selectedImage} alt="Terpilih" className="w-full h-full object-cover rounded-2xl border-4 border-[#5A5A40] shadow-lg" />
              <button 
                type="button" 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl border-2 border-white"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex gap-4 items-end">
            {/* LARGE ACCESSIBLE MIC BUTTON */}
            <button 
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-6 rounded-3xl transition-all duration-300 flex-shrink-0 shadow-xl border-2 flex items-center justify-center",
                isListening 
                  ? "bg-red-500 text-white border-red-600 animate-pulse scale-110" 
                  : "bg-[#5A5A40] text-white border-[#3a3a2a] hover:bg-[#A0522D]"
              )}
              aria-label={isListening ? "Berhenti mendengarkan" : "Tekan untuk berbicara"}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>

            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-6 bg-[#f5f2ed] border-2 border-[#D2B48C] rounded-3xl text-[#5A5A40] hover:bg-[#D2B48C] hover:text-white transition-all shadow-md flex-shrink-0"
              aria-label="Ambil Foto Candi"
            >
              <Camera className="w-8 h-8" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />

            <div className="flex-1 relative">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanyakan atau bicaralah..."
                className="w-full p-5 pr-16 rounded-3xl border-2 border-[#D2B48C] bg-[#f5f2ed] font-medium focus:ring-4 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] outline-none resize-none h-[84px] transition-all shadow-inner text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                type="submit"
                disabled={isTyping || (!inputText.trim() && !selectedImage)}
                className="absolute right-4 bottom-4 p-4 text-[#5A5A40] disabled:text-gray-300 transition-transform active:scale-75"
              >
                {isTyping ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </form>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", isListening ? "bg-red-500 animate-ping" : "bg-gray-300")} />
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {isListening ? "ASISTEN MENDENGARKAN" : "MIKROFON SIAP"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", isSpeaking ? "bg-green-500" : "bg-gray-300")} />
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {isSpeaking ? "PEMANDU BERBICARA" : "SUARA STANDBY"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

