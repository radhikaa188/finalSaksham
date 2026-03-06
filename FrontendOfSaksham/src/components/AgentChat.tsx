import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '@clerk/clerk-react';
import type { ChatMessage } from '../types';

const API_BASE = 'http://localhost:5000/api';

interface AgentChatProps {
  selectedCareer: string;
  transcript?: string;
  onAction?: (action: string, payload?: any) => void;
}

type VoiceState = 'idle' | 'recording' | 'thinking' | 'speaking';

export function AgentChat({ selectedCareer, transcript, onAction }: AgentChatProps) {
  const { lang} = useLang();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [history, setHistory] = useState<any[]>([]);
  const [statusText, setStatusText] = useState('Mic dabao aur bolo...');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAudio = (base64Audio: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processVoice(blob);
      };

      mediaRecorder.start();
      setVoiceState('recording');
      setStatusText('Bol raha/rahi ho... (dobara dabao rokne ke liye)');
    } catch (err) {
      console.error('Mic error:', err);
      setStatusText('Mic permission do pehle!');
      setVoiceState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && voiceState === 'recording') {
      mediaRecorderRef.current.stop();
      setVoiceState('thinking');
      setStatusText('Samajh raha hoon...');
    }
  };

  const handleMicClick = () => {
    if (voiceState === 'idle') {
      startRecording();
    } else if (voiceState === 'recording') {
      stopRecording();
    } else if (voiceState === 'speaking') {
      audioRef.current?.pause();
      audioRef.current = null;
      setVoiceState('idle');
      setStatusText('Mic dabao aur bolo...');
    }
  };

  const processVoice = async (audioBlob: Blob) => {
    try {
      const token = await getToken();

      // Step 1: Transcribe
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      const sttRes = await fetch(`${API_BASE}/speech/transcribe-only`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!sttRes.ok) throw new Error('Transcription failed');
      const { transcript: userText } = await sttRes.json();

      if (!userText?.trim()) {
        setStatusText('Kuch suna nahi, dobara bolo...');
        setVoiceState('idle');
        return;
      }

      setMessages(prev => [...prev, { role: 'user', content: userText }]);
      setStatusText('Agent soch raha hai... 🤔');

      // Step 2: Agent
      const agentRes = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userText,
          history,
          context: { selectedCareer, transcript },
        }),
      });

      if (!agentRes.ok) throw new Error('Agent failed');
      const data = await agentRes.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      setHistory(data.history);

      // Step 3: UI action trigger karo
      if (data.action && onAction) {
        onAction(data.action, data.actionPayload);
      }

      // Step 4: Audio play
      if (data.audio) {
        setVoiceState('speaking');
        setStatusText('Agent bol raha hai... (dabao rokne ke liye)');
        await playAudio(data.audio);
      }

      setVoiceState('idle');
      setStatusText('Mic dabao aur bolo...');

    } catch (err) {
      console.error('Voice processing error:', err);
      setVoiceState('idle');
      setStatusText('Kuch gadbad hui, dobara try karo');
    }
  };

  const getMicButtonStyle = () => {
    switch (voiceState) {
      case 'recording': return 'bg-red-500 hover:bg-red-600 scale-110';
      case 'thinking':  return 'bg-yellow-500 cursor-not-allowed opacity-70';
      case 'speaking':  return 'bg-green-500 hover:bg-green-600';
      default:          return 'bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-lg hover:scale-105';
    }
  };

  const getMicIcon = () => {
    if (voiceState === 'recording') return <MicOff className="w-7 h-7 text-white" />;
    if (voiceState === 'speaking')  return <Volume2 className="w-7 h-7 text-white animate-pulse" />;
    return <Mic className="w-7 h-7 text-white" />;
  };

  const getDotColor = () => {
    switch (voiceState) {
      case 'recording': return 'bg-red-500';
      case 'thinking':  return 'bg-yellow-500';
      case 'speaking':  return 'bg-green-500';
      default:          return 'bg-gray-400';
    }
  };

  return (
    <div className="mt-8 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${getDotColor()}`}></div>
          <h3 className="font-bold text-gray-900 dark:text-white font-outfit">AI Career Guide 🎯</h3>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-outfit">{selectedCareer}</span>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-outfit">
            Mic dabao aur <span className="font-semibold text-orange-500">{selectedCareer}</span> ke baare mein kuch pucho! 🎤
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-br-sm'
                : 'bg-gray-800/80 dark:bg-white/10 text-gray-100 dark:text-gray-200 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {voiceState === 'thinking' && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 dark:bg-white/10 px-6 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-black/5 dark:border-white/10 flex flex-col items-center gap-3">
        <button
          onClick={handleMicClick}
          disabled={voiceState === 'thinking'}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${getMicButtonStyle()}`}
        >
          {getMicIcon()}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-outfit text-center">{statusText}</p>
      </div>
    </div>
  );
}