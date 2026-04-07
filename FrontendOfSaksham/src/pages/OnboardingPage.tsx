import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Mic, MicOff, Check, ArrowLeft, Volume2, Loader2 } from 'lucide-react';
import { TextClipPathReveal } from '../components/Textclippathreveal';
import { speakText, stopSpeaking } from '../utils/tts';
import AnimatedThemeToggler from '../components/AnimatedThemeToggler';
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';
const educationOptions = [
  { label: '10th Pass',     emoji: '📚', voiceMatch: ['10th', '10वीं', '10 वीं', 'tenth', 'दसवीं', 'दसवी', 'दस', 'matric', 'ten'] },
  { label: '12th Pass',     emoji: '🎒', voiceMatch: ['12th', '12वीं', '12 वीं', 'twelfth', 'बारहवीं', 'बारहवी', 'बारह', 'intermediate', 'twelve'] },
  { label: 'Graduate',      emoji: '🎓', voiceMatch: ['graduate', 'graduation', 'ग्रेजुएट', 'ग्रेजुएशन', 'degree', 'bachelor', 'b.a', 'b.sc', 'b.com', 'btech', 'b.tech'] },
  { label: 'Post Graduate', emoji: '🏅', voiceMatch: ['post graduate', 'postgraduate', 'post graduation', 'master', 'मास्टर', 'पोस्ट ग्रेजुएट', 'पोस्ट', 'pg', 'mba', 'm.a', 'm.sc', 'mtech', 'm.tech'] },
  { label: 'Dropout',       emoji: '💡', voiceMatch: ['dropout', 'drop out', 'drop', 'छोड़', 'छोड़ दी', 'नहीं पढ़ा', 'school nahi', 'padhai chhodi', 'padhai chodi', 'नहीं की'] },
];

const goalOptions = [
  { value: 'job',       label: 'Full-time Job', emoji: '💼', desc: 'I want a stable salaried job',  voiceMatch: ['job', 'नौकरी', 'salary', 'office', 'full time', 'fulltime'] },
  { value: 'freelance', label: 'Freelancing',   emoji: '💻', desc: 'I want to work independently', voiceMatch: ['freelance', 'freelancing', 'independent', 'खुद', 'अपना काम'] },
  { value: 'both',      label: 'Both',          emoji: '🚀', desc: 'Open to either option',        voiceMatch: ['both', 'दोनों', 'either', 'any', 'कुछ भी'] },
];

const languageOptions = ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Punjabi', 'Odia'];
const langVoiceMap: Record<string, string[]> = {
  Hindi:    ['hindi', 'हिंदी', 'हिन्दी'],
  English:  ['english', 'अंग्रेजी'],
  Tamil:    ['tamil', 'तमिल'],
  Telugu:   ['telugu', 'तेलुगु'],
  Bengali:  ['bengali', 'bangla', 'बंगाली'],
  Marathi:  ['marathi', 'मराठी'],
  Gujarati: ['gujarati', 'गुजराती'],
  Kannada:  ['kannada', 'कन्नड़'],
  Punjabi:  ['punjabi', 'पंजाबी'],
  Odia:     ['odia', 'oriya', 'ओड़िया'],
};

const stepQuestions = [
  'नमस्ते! आपकी शिक्षा के बारे में बताइए — क्या आप दसवीं पास हैं, बारहवीं पास, ग्रेजुएट, पोस्ट ग्रेजुएट, या आपने पढ़ाई बीच में छोड़ दी?',
  'आप किस शहर में रहते हैं? बस शहर का नाम बताइए।',
  'आप क्या चाहते हैं — फुल टाइम जॉब, फ्रीलांसिंग, या दोनों?',
  'आप कौन-कौन सी भाषाएं बोलते हैं? जैसे हिंदी, इंग्लिश, तमिल, बंगाली — जो भी आती हों बताइए।',
];

const stepHeadlines = ['Your Education', 'Your City', 'Your Goal', 'Your Languages'];

type RecordingState = 'idle' | 'recording' | 'processing' | 'done';

function matchEducation(transcript: string): string | null {
  const lower = transcript.toLowerCase().replace(/[।.,!?]/g, '');
  const sorted = [...educationOptions].sort((a, b) => b.voiceMatch[0].length - a.voiceMatch[0].length);
  for (const opt of sorted) {
    if (opt.voiceMatch.some(m => lower.includes(m.toLowerCase()))) return opt.label;
  }
  return null;
}

function matchGoal(transcript: string): string | null {
  const lower = transcript.toLowerCase().replace(/[।.,!?]/g, '');
  for (const opt of goalOptions) {
    if (opt.voiceMatch.some(m => lower.includes(m.toLowerCase()))) return opt.value;
  }
  return null;
}

function extractCity(transcript: string): string {
  const cities = ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'hyderabad',
    'pune', 'kolkata', 'jaipur', 'lucknow', 'ahmedabad', 'surat', 'patna', 'bhopal',
    'indore', 'nagpur', 'chandigarh', 'noida', 'gurgaon', 'gurugram'];
  const lower = transcript.toLowerCase();
  for (const city of cities) {
    if (lower.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return transcript.trim();
}

function matchLanguages(transcript: string): string[] {
  const lower = transcript.toLowerCase().replace(/[।.,!?]/g, '');
  const found: string[] = [];
  for (const [lang, keywords] of Object.entries(langVoiceMap)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) found.push(lang);
  }
  return found;
}

export function OnboardingPage() {
  const { setProfile, profile } = useUserContext();
  const { user }      = useUser();
  const { getToken }  = useAuth();
  const navigate      = useNavigate();

  useEffect(() => {
    if (profile?.completedOnboarding) {
      navigate('/guide');
    }
  }, [profile, navigate]);
  const [step, setStep]               = useState(0);
  const [headlineKey, setHeadlineKey] = useState(0);
  const [education, setEducation]     = useState('');
  const [city, setCity]               = useState('');
  const [goal, setGoal]               = useState('');
  const [languages, setLanguages]     = useState<string[]>(['Hindi']);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError]   = useState('');
  const [isSpeaking, setIsSpeaking]   = useState(false);

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef         = useRef<Blob[]>([]);
  // Tracks which steps have already had their question spoken
  // Prevents duplicate fires if the effect re-runs
  const spokenSteps       = useRef<Set<number>>(new Set());
  // True after the very first speak() completes — avoids racing on cold start
  const ttsInitialized    = useRef(false);

  // ── Stop TTS on unmount (navigating away) ──────────────────────────────────
  useEffect(() => {
    return () => {
      stopSpeaking();
      spokenSteps.current.clear();
    };
  }, []);

  // ── Ask question on each step change ──────────────────────────────────────
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setVoiceTranscript('');
    setVoiceError('');
    setRecordingState('idle');
    setHeadlineKey(k => k + 1);

    // Don't re-speak a question we already spoke this session
    if (spokenSteps.current.has(step)) return;

    // Give extra time on first ever speak so backend is warm
    // (GlobalEffects in App.tsx pings /api/ping on load, so 600ms is usually enough)
    const delay = ttsInitialized.current ? 100 : 700;

    const timer = setTimeout(async () => {
      // Mark as spoken immediately so a fast re-render can't double-fire
      spokenSteps.current.add(step);
      ttsInitialized.current = true;
      await askQuestion(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [step]);

  const askQuestion = async (s: number) => {
    setIsSpeaking(true);
    const token = await getToken() || '';
    await speakText(stepQuestions[s], token);
    setIsSpeaking(false);
  };

  // Allow manual replay — clears the spokenSteps guard for this step
  const replayQuestion = async () => {
    if (isSpeaking) return;
    spokenSteps.current.delete(step); // allow re-speak
    spokenSteps.current.add(step);    // immediately re-add so effect doesn't re-fire
    await askQuestion(step);
  };

  const startRecording = async () => {
    if (isSpeaking) return;
    setVoiceError(''); setVoiceTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); processRecording(); };
      mediaRecorder.start();
      setRecordingState('recording');
    } catch {
      setVoiceError('Microphone access denied. Please tap your answer below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');
    }
  };

  const processRecording = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch(`${API_BASE}/speech/transcribe-only`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      const transcript = data.transcript || '';
      setVoiceTranscript(transcript);
      applyTranscript(transcript);
    } catch {
      setVoiceError('Could not process audio. Please tap your answer below.');
      setRecordingState('idle');
    }
  };

  const applyTranscript = useCallback((transcript: string) => {
    if (step === 0) {
      const matched = matchEducation(transcript);
      if (matched) { setEducation(matched); setRecordingState('done'); setTimeout(() => setStep(1), 1200); }
      else { setVoiceError('Could not detect education. Please tap your level below.'); setRecordingState('idle'); }
    } else if (step === 1) {
      const matchedCity = extractCity(transcript);
      if (matchedCity) { setCity(matchedCity); setRecordingState('done'); setTimeout(() => setStep(2), 1200); }
      else { setVoiceError('City not detected. Please type it below.'); setRecordingState('idle'); }
    } else if (step === 2) {
      const matchedGoal = matchGoal(transcript);
      if (matchedGoal) { setGoal(matchedGoal); setRecordingState('done'); setTimeout(() => setStep(3), 1200); }
      else { setVoiceError('Goal not detected. Please tap your choice below.'); setRecordingState('idle'); }
    } else if (step === 3) {
      const matched = matchLanguages(transcript);
      if (matched.length > 0) { setLanguages(matched); setRecordingState('done'); setTimeout(() => finish(matched), 1200); }
      else { setVoiceError('Could not detect languages. Please tap them below.'); setRecordingState('idle'); }
    }
  }, [step]);

  const toggleLanguage = (l: string) =>
    setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const finish = (langs?: string[]) => {
    stopSpeaking(); // kill any in-flight audio before navigating
    spokenSteps.current.clear();
    setProfile({
      name: user?.firstName || 'Friend',
      education, city, goal,
      languages: langs || languages,
      completedOnboarding: true,
    });
    navigate('/guide');
  };

  const micColor = isSpeaking ? 'rgba(139,92,246,0.8)'
    : recordingState === 'recording'  ? '#ef4444'
    : recordingState === 'processing' ? '#f97316'
    : recordingState === 'done'       ? '#22c55e'
    : 'linear-gradient(135deg, #f97316, #ec4899)';

  const micLabel = isSpeaking ? 'AI is speaking...'
    : recordingState === 'recording'  ? 'Listening... tap to stop'
    : recordingState === 'processing' ? 'Processing...'
    : recordingState === 'done'       ? 'Got it!'
    : 'Tap to speak';

  return (
    <div className="min-h-screen bg-[#080a12] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-50">
        <AnimatedThemeToggler 
          className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-all" 
        />
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <span className="text-3xl font-bold font-outfit">
            <span className="text-white">Sak</span><span className="text-orange-400 italic">sham</span>
          </span>
          <p className="text-white/30 text-sm mt-1 font-outfit">Let's set up your profile</p>
        </div>

        <div className="mb-5 text-center" key={headlineKey}>
          <TextClipPathReveal text={stepHeadlines[step]} revealDirection="bottom" duration={0.65}
            staggerDelay={0.18} color="#ffffff" once={false}
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, fontStyle: "italic",
              fontSize: "clamp(2.2rem, 6vw, 3rem)", lineHeight: 1.1, letterSpacing: "0.04em" }} />
          <div style={{ height: 1, width: 40, background: '#ff7a3d', margin: '10px auto 0', opacity: 0.6 }} />
        </div>

        <div className="flex gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: i < step ? '100%' : i === step ? '50%' : '0%', background: 'linear-gradient(90deg, #f97316, #ec4899)' }} />
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-8"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(249,115,22,0.02))',
            border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          <div className="flex flex-col items-center mb-6">
            <div className="w-full mb-5 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {isSpeaking ? (
                <p className="text-white/60 text-sm font-outfit text-center flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" /> Speaking...
                </p>
              ) : (
                <TextClipPathReveal key={`q-${step}`} text={stepQuestions[step]} revealDirection="bottom"
                  duration={0.5} staggerDelay={0} color="rgba(255,255,255,0.55)" once={false}
                  style={{ fontFamily: "'Outfit', 'Jost', sans-serif", fontSize: "0.875rem", lineHeight: 1.6, textAlign: "center" }} />
              )}
            </div>

            <button
              onClick={recordingState === 'recording' ? stopRecording : startRecording}
              disabled={isSpeaking || recordingState === 'processing' || recordingState === 'done'}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: micColor,
                boxShadow: recordingState === 'recording'
                  ? '0 0 0 8px rgba(239,68,68,0.2), 0 0 0 16px rgba(239,68,68,0.1)'
                  : '0 4px 20px rgba(249,115,22,0.3)',
              }}>
              {recordingState === 'processing' ? <Loader2 className="w-8 h-8 text-white animate-spin" />
                : recordingState === 'done'      ? <Check   className="w-8 h-8 text-white" />
                : recordingState === 'recording' ? <MicOff  className="w-8 h-8 text-white" />
                : <Mic className="w-8 h-8 text-white" />}
            </button>

            <p className="text-white/40 text-xs font-outfit">{micLabel}</p>

            {voiceTranscript && (
              <div className="w-full mt-3 p-3 rounded-xl text-sm font-outfit text-white/70 italic"
                style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
                🎤 "{voiceTranscript}"
              </div>
            )}
            {voiceError && <p className="text-orange-400 text-xs font-outfit mt-2 text-center">{voiceError}</p>}

            {/* Replay button now uses replayQuestion() instead of askQuestion() directly */}
            <button onClick={replayQuestion} disabled={isSpeaking}
              className="mt-3 text-xs text-white/20 hover:text-white/50 font-outfit flex items-center gap-1 transition-all disabled:opacity-30">
              <Volume2 className="w-3 h-3" /> Replay question
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-white/20 text-xs font-outfit">or tap below</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {step === 0 && (
            <div className="space-y-2">
              {educationOptions.map(opt => (
                <button key={opt.label}
                  onClick={() => {
                    stopSpeaking(); // stop current question before advancing
                    setEducation(opt.label);
                    setTimeout(() => setStep(1), 400);
                  }}
                  className="w-full p-3.5 rounded-2xl text-left text-sm font-outfit transition-all flex items-center gap-3"
                  style={education === opt.label
                    ? { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#fb923c' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                  <span>{opt.emoji}</span>
                  <span className="font-medium">{opt.label}</span>
                  {education === opt.label && <Check className="w-4 h-4 ml-auto text-orange-400" />}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="Your city (e.g. Delhi, Mumbai...)"
                className="w-full p-4 rounded-2xl text-sm font-outfit focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)',
                  border: city ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => { stopSpeaking(); setStep(0); }}
                  className="px-4 py-3 rounded-2xl text-white/40 font-outfit text-sm flex items-center gap-2 hover:text-white/70 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { stopSpeaking(); setStep(2); }} disabled={!city}
                  className="flex-1 py-3 rounded-2xl text-white font-semibold font-outfit flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {goalOptions.map(opt => (
                <button key={opt.value}
                  onClick={() => {
                    stopSpeaking(); // stop current question before advancing
                    setGoal(opt.value);
                    setTimeout(() => setStep(3), 400);
                  }}
                  className="w-full p-3.5 rounded-2xl text-left font-outfit transition-all"
                  style={goal === opt.value
                    ? { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${goal === opt.value ? 'text-orange-400' : 'text-white/60'}`}>{opt.label}</p>
                      <p className="text-xs text-white/30">{opt.desc}</p>
                    </div>
                    {goal === opt.value && <Check className="w-4 h-4 ml-auto text-orange-400" />}
                  </div>
                </button>
              ))}
              <button onClick={() => { stopSpeaking(); setStep(1); }}
                className="px-4 py-3 rounded-2xl text-white/40 font-outfit text-sm flex items-center gap-2 hover:text-white/70 transition-all mt-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                {languageOptions.map(l => (
                  <button key={l} onClick={() => toggleLanguage(l)}
                    className="px-4 py-2 rounded-full text-sm font-outfit transition-all flex items-center gap-1.5"
                    style={languages.includes(l)
                      ? { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#fb923c' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                    {languages.includes(l) && <Check className="w-3 h-3" />}{l}
                  </button>
                ))}
              </div>

              <div className="mb-5 p-4 rounded-2xl space-y-1.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/30 text-xs font-outfit uppercase tracking-widest mb-2">Your profile</p>
                <p className="text-white/60 text-sm font-outfit">📚 {education}</p>
                <p className="text-white/60 text-sm font-outfit">📍 {city}</p>
                <p className="text-white/60 text-sm font-outfit">🎯 {goalOptions.find(g => g.value === goal)?.label}</p>
                <p className="text-white/60 text-sm font-outfit">🗣️ {languages.join(', ')}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { stopSpeaking(); setStep(2); }}
                  className="px-4 py-3 rounded-2xl text-white/40 font-outfit text-sm flex items-center gap-2 hover:text-white/70 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => finish()} disabled={languages.length === 0}
                  className="flex-1 py-3 rounded-2xl text-white font-bold font-outfit flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 24px rgba(249,115,22,0.4)' }}>
                  Start My Journey 🚀
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-4 font-outfit">Step {step + 1} of 4</p>
      </div>
    </div>
  );
}