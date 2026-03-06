import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';
import { useUserContext } from '../contexts/UserContext';
import type { InterestEntry } from '../contexts/UserContext';
import { t } from '../i18n/translations';
import { useAuth, useUser } from '@clerk/clerk-react';
import {
  Mic, MicOff, ArrowRight, ArrowLeft, RotateCcw,
  ExternalLink, Youtube, Globe, Sparkles, BookOpen, Briefcase,
  Volume2, User, Trash2, History, ChevronDown, ChevronUp,
  Clock, CheckCircle2, Loader2,
} from 'lucide-react';
import type { Career, Course, JobPlatform } from '../types';
import { AgentChat } from '../components/AgentChat';
import { speakText, stopSpeaking } from '../utils/tts'; // ← shared util

const API_BASE = 'http://localhost:5000/api';
type RecordingState = 'idle' | 'recording' | 'ready';

function generateRoadmap(careerTitle: string) {
  return [
    { id: 'step-1', title: `Learn the basics of ${careerTitle}`, description: 'Start with foundational skills and concepts', skillsToLearn: ['Core concepts', 'Basic tools'], estimatedWeeks: 4, completed: false },
    { id: 'step-2', title: 'Build your first project', description: 'Apply what you learned by building something real', skillsToLearn: ['Practical application', 'Problem solving'], estimatedWeeks: 3, completed: false },
    { id: 'step-3', title: 'Create a portfolio', description: 'Showcase your work to potential employers or clients', skillsToLearn: ['Portfolio building', 'Documentation'], estimatedWeeks: 2, completed: false },
    { id: 'step-4', title: 'Start applying', description: 'Apply to jobs or reach out to freelance clients', skillsToLearn: ['Resume writing', 'Interview prep'], estimatedWeeks: 2, completed: false },
  ];
}

function timeAgo(iso: string, lang: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (lang === 'hi') {
    if (mins < 2)   return 'अभी';
    if (mins < 60)  return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    return `${days} दिन पहले`;
  }
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Past Searches Panel
// ─────────────────────────────────────────────────────────────────────────────
function PastSearchesPanel({ history, loading, lang, onResume, onDelete }: {
  history: InterestEntry[]; loading: boolean; lang: string;
  onResume: (e: InterestEntry) => void; onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!loading && history.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-black/8 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-orange-500/5 transition-colors">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-white font-outfit">
            {lang === 'hi' ? 'पुरानी Searches' : 'Past Searches'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 font-outfit">
            {loading ? '…' : history.length}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-outfit">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
            </div>
          ) : (
            history.map(entry => (
              <div key={entry._id} className="px-5 py-4 flex items-start gap-3 group hover:bg-orange-500/3 transition-colors">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-orange-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-100 font-outfit font-medium truncate">
                    "{entry.transcript}"
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-outfit">
                      <Clock className="w-3 h-3" />{timeAgo(entry.createdAt, lang)}
                    </span>
                    {entry.selectedCareer && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 font-outfit">
                        <CheckCircle2 className="w-3 h-3" />{entry.selectedCareer.title}
                      </span>
                    )}
                    {entry.careers.length > 0 && (
                      <span className="text-xs text-gray-400 font-outfit">
                        {entry.careers.length} career options
                      </span>
                    )}
                  </div>
                  {(entry.completedCourses.length > 0 || entry.appliedJobs.length > 0) && (
                    <div className="flex gap-2 mt-2">
                      {entry.completedCourses.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">
                          📚 {entry.completedCourses.length} courses done
                        </span>
                      )}
                      {entry.appliedJobs.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600 dark:text-green-400 font-outfit">
                          💼 {entry.appliedJobs.length} jobs applied
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onResume(entry)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold font-outfit text-white transition-all hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                    {lang === 'hi' ? 'खोलें' : 'Resume'}
                  </button>
                  <button onClick={() => onDelete(entry._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CareerGuidePage
// ─────────────────────────────────────────────────────────────────────────────
export function CareerGuidePage() {
  const { lang, setLang } = useLang();
  const {
    setSavedCareer, profile,
    interestHistory, historyLoading,
    fetchInterestHistory,
    saveNewSearch,
    updateSearchWithCareer,
    deleteHistoryEntry,
    resumeFromHistory,
    activeHistoryId,
  } = useUserContext();
  const { getToken } = useAuth();
  const { user }     = useUser();
  const navigate     = useNavigate();

  const [isSpeaking, setIsSpeaking]   = useState(false);
  const hasWelcomedRef = useRef(false);

  const [step, setStep] = useState<number>(() => {
    const s = sessionStorage.getItem('careerGuideStep');
    return s ? parseInt(s, 10) : 0;
  });
  const goToStep = (n: number) => { setStep(n); sessionStorage.setItem('careerGuideStep', String(n)); };

  // Load history from DB on mount
  useEffect(() => { fetchInterestHistory(); }, []);

  useEffect(() => {
  return () => { stopSpeaking(); };
}, []);

  // Welcome TTS — only once, only on step 0
  useEffect(() => {
    if (hasWelcomedRef.current || step !== 0) return;
    hasWelcomedRef.current = true;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const name = profile?.name || user?.firstName || 'दोस्त';
      const goal = profile?.goal === 'freelance' ? 'फ्रीलांसिंग' : profile?.goal === 'job' ? 'जॉब' : 'जॉब या फ्रीलांसिंग';
      setIsSpeaking(true);
      await speakText(`नमस्ते ${name}! आपका Career Guide में स्वागत है। माइक बटन दबाइए और बताइए कि आपको किस field में interest है। हम आपके लिए सबसे अच्छे ${goal} के options ढूंढेंगे।`, token);
      setIsSpeaking(false);
    })();
  }, []);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob]           = useState<Blob | null>(null);
  const [loading, setLoading]               = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [highlightSection, setHighlightSection] = useState<'courses' | 'jobs' | null>(null);

  // ── Session state (UI cache) — source of truth is DB via interestHistory ──
  const [transcript, setTranscript]       = useState<string>(() => { try { return sessionStorage.getItem('cg_transcript') || ''; } catch { return ''; } });
  const [careers, setCareers]             = useState<Career[]>(() => { try { return JSON.parse(sessionStorage.getItem('cg_careers') || '[]'); } catch { return []; } });
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(() => { try { const s = sessionStorage.getItem('cg_selectedCareer'); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [courses, setCourses]             = useState<Course[]>(() => { try { return JSON.parse(sessionStorage.getItem('cg_courses') || '[]'); } catch { return []; } });
  const [jobs, setJobs]                   = useState<JobPlatform[]>(() => { try { return JSON.parse(sessionStorage.getItem('cg_jobs') || '[]'); } catch { return []; } });

  useEffect(() => { try { sessionStorage.setItem('cg_transcript', transcript); } catch {} }, [transcript]);
  useEffect(() => { try { sessionStorage.setItem('cg_careers', JSON.stringify(careers)); } catch {} }, [careers]);
  useEffect(() => { try { sessionStorage.setItem('cg_selectedCareer', JSON.stringify(selectedCareer)); } catch {} }, [selectedCareer]);
  useEffect(() => { try { sessionStorage.setItem('cg_courses', JSON.stringify(courses)); } catch {} }, [courses]);
  useEffect(() => { try { sessionStorage.setItem('cg_jobs', JSON.stringify(jobs)); } catch {} }, [jobs]);

  // ── "Previous search" banner: pulled from DB (interestHistory[0]) ──────────
  // This replaces the old sessionStorage-only approach — now survives refresh,
  // new devices, browser clears, etc.
  const latestDbEntry = interestHistory[0] ?? null;  // newest search from DB

  // Only show the banner when: there's a DB entry AND it doesn't match the
  // current active session (i.e. user came back fresh)
  const showPrevBanner =
    latestDbEntry !== null &&
    step === 0 &&
    !transcript; // if transcript is already loaded in session, banner is redundant

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const coursesRef       = useRef<HTMLDivElement>(null);
  const jobsRef          = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob); setRecordingState('ready');
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(); setRecordingState('recording');
    } catch { alert('Could not access microphone. Please check permissions.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') mediaRecorderRef.current.stop();
  };

  const handleRecordClick = () => {
    if (recordingState === 'idle' || recordingState === 'ready') { setAudioBlob(null); setRecordingState('idle'); startRecording(); }
    else if (recordingState === 'recording') stopRecording();
  };

  const submitAudio = async () => {
    if (!audioBlob) return;
    setLoading(true); setLoadingMessage(t('listening', lang));
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', lang);
      if (profile) { formData.append('education', profile.education); formData.append('goal', profile.goal); formData.append('city', profile.city); }
      const res  = await fetch(`${API_BASE}/speech/transcribe`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      setTranscript(data.transcript); setCareers(data.careers);
      await saveNewSearch(data.transcript, data.careers); // ← persist to DB
      goToStep(1);
    } catch { alert('Failed to process audio. Please try again.'); }
    finally { setLoading(false); setLoadingMessage(''); }
  };

  const selectCareer = async (career: Career) => {
    setSelectedCareer(career);
    setLoading(true); setLoadingMessage(t('finding_courses', lang));
    try {
      const token   = await getToken();
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const [cRes, jRes] = await Promise.all([
        fetch(`${API_BASE}/courses/suggest`, { method: 'POST', headers, body: JSON.stringify({ career: career.title }) }),
        fetch(`${API_BASE}/jobs/platforms`,  { method: 'POST', headers, body: JSON.stringify({ career: career.title }) }),
      ]);
      const cData = await cRes.json();
      const jData = await jRes.json();
      setCourses(cData.courses); setJobs(jData.platforms);
      const roadmap = generateRoadmap(career.title);
      setSavedCareer({ title: career.title, selectedAt: new Date().toISOString(), roadmap, completedCourses: [], appliedJobs: [], courses: cData.courses, jobs: jData.platforms, transcript });
      if (activeHistoryId) await updateSearchWithCareer(activeHistoryId, career, cData.courses, jData.platforms, roadmap); // ← persist to DB
      goToStep(2);
    } catch { alert('Failed to fetch data. Please try again.'); }
    finally { setLoading(false); setLoadingMessage(''); }
  };

  const resetWizard = () => {
    ['careerGuideStep','cg_transcript','cg_careers','cg_selectedCareer','cg_courses','cg_jobs'].forEach(k => sessionStorage.removeItem(k));
    setTranscript(''); setCareers([]); setSelectedCareer(null); setCourses([]); setJobs([]); setHighlightSection(null);
    goToStep(0); setRecordingState('idle'); setAudioBlob(null);
  };

  // Resume a DB history entry
 const handleResumeHistory = (entry: InterestEntry) => {
  console.log('resuming entry:', JSON.stringify(entry, null, 2));
  setTranscript(entry.transcript);
  setCareers(entry.careers as Career[]);

  if (entry.selectedCareer && (entry.courses || []).length > 0) {
    setSelectedCareer(entry.selectedCareer as Career);
    setCourses(entry.courses as Course[]);
    setJobs((entry.jobs || []) as JobPlatform[]);
    resumeFromHistory(entry);
    setTimeout(() => goToStep(2), 50); // ← small delay so state settles
  } else if (entry.selectedCareer) {
    setSelectedCareer(entry.selectedCareer as Career);
    resumeFromHistory(entry);
    goToStep(1);
  } else {
    resumeFromHistory(entry);
    goToStep(1);
  }
};

  const handleAgentAction = (action: string, payload?: any) => {
    switch (action) {
      case 'scroll_to_courses': setHighlightSection('courses'); coursesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => setHighlightSection(null), 2500); break;
      case 'scroll_to_jobs':    setHighlightSection('jobs');    jobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });    setTimeout(() => setHighlightSection(null), 2500); break;
      case 'open_url':          if (payload?.url) window.open(payload.url, '_blank'); break;
      case 'highlight_job':     setHighlightSection('jobs');    jobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });    setTimeout(() => setHighlightSection(null), 2500); break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {step > 0 && (
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => step === 1 ? goToStep(0) : goToStep(1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors font-outfit">
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? (lang === 'hi' ? 'वापस जाएं' : 'Back to interests') : (lang === 'hi' ? 'Career बदलें' : 'Change career')}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium transition-all ${lang === 'hi' ? 'font-hindi' : 'font-outfit'}`}>
                <span>{lang === 'en' ? '🇮🇳' : '🇺🇸'}</span>
                <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>
              <button onClick={() => navigate('/dashboard')} title="My Dashboard"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all">
                {profile?.name ? <span className="text-sm font-bold text-orange-600 dark:text-orange-400 font-outfit">{profile.name[0].toUpperCase()}</span> : <User className="w-4 h-4 text-orange-500" />}
              </button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === i ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white scale-110' : step > i ? 'bg-green-500 text-white' : 'bg-white/50 dark:bg-white/10 text-gray-400 dark:text-gray-600'}`}>
                  {step > i ? '✓' : i + 1}
                </div>
                {i < 2 && <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all ${step > i ? 'bg-gradient-to-r from-orange-500 to-pink-600' : 'bg-white/50 dark:bg-white/10'}`} />}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-8 mt-4">
            {['step_0', 'step_1', 'step_2'].map((key, i) => (
              <span key={key} className={`text-sm font-medium ${step === i ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'} ${lang === 'hi' ? 'font-hindi' : 'font-outfit'}`}>
                {t(key as any, lang)}
              </span>
            ))}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={`text-lg font-medium text-gray-900 dark:text-white ${lang === 'hi' ? 'font-hindi' : 'font-outfit'}`}>{loadingMessage}</p>
            </div>
          </div>
        )}

        {step === 0 && (
          <>
            <Step0
              recordingState={recordingState}
              onRecordClick={handleRecordClick}
              onSubmit={submitAudio}
              hasAudio={!!audioBlob}
              language={lang}
              profile={profile}
              isSpeaking={isSpeaking}
              // ── FIX: prev banner now uses DB entry, not sessionStorage ──
              prevEntry={showPrevBanner ? latestDbEntry : null}
              onResumePrev={() => latestDbEntry && handleResumeHistory(latestDbEntry)}
              onDeletePrev={() => latestDbEntry && deleteHistoryEntry(latestDbEntry._id)}
              onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
              onReplayWelcome={async () => {
                const token = await getToken();
                if (!token) return;
                const name = profile?.name || user?.firstName || 'दोस्त';
                const goal = profile?.goal === 'freelance' ? 'फ्रीलांसिंग' : profile?.goal === 'job' ? 'जॉब' : 'जॉब या फ्रीलांसिंग';
                setIsSpeaking(true);
                await speakText(`माइक बटन दबाइए और बताइए कि आपको किस field में interest है। हम आपके लिए सबसे अच्छे ${goal} के options ढूंढेंगे।`, token);
                setIsSpeaking(false);
              }}
            />

            {/* Past Searches Panel — all history, collapsible */}
            <div className="mt-6">
              <PastSearchesPanel
                history={interestHistory}
                loading={historyLoading}
                lang={lang}
                onResume={handleResumeHistory}
                onDelete={id => deleteHistoryEntry(id)}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <Step1
            transcript={transcript} careers={careers} onSelectCareer={selectCareer}
            onBack={() => goToStep(0)} language={lang}
            onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
            selectedCareer={selectedCareer} onContinueToRoadmap={() => goToStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            selectedCareer={selectedCareer!} courses={courses} jobs={jobs}
            onChangeCareer={() => goToStep(1)} onStartOver={resetWizard}
            onGoToDashboard={() => navigate('/dashboard')} language={lang}
            transcript={transcript} highlightSection={highlightSection}
            coursesRef={coursesRef} jobsRef={jobsRef} onAgentAction={handleAgentAction}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 0
// ─────────────────────────────────────────────────────────────────────────────
function Step0({ recordingState, onRecordClick, onSubmit, hasAudio, language, profile, isSpeaking,
  onReplayWelcome, onToggleLang, prevEntry, onResumePrev, onDeletePrev }: any) {

  const goalLabel: Record<string, string> = { job: 'Full-time Job 💼', freelance: 'Freelancing 💻', both: 'Job & Freelance 🚀' };
  const examplePrompts =
    profile?.goal === 'freelance' ? ['मुझे graphic design पसंद है', 'I enjoy writing content', 'मैं video editing सीखना चाहता हूं']
    : profile?.goal === 'job'     ? ['मुझे IT sector में जाना है', 'I like working with numbers', 'मुझे teaching पसंद है']
    :                               ['मुझे technology में interest है', 'I enjoy helping people', 'मुझे creative काम पसंद है'];

  const micLabel =
    recordingState === 'recording' ? (language === 'hi' ? 'सुन रहे हैं... रोकने के लिए दबाएं' : 'Listening... tap to stop')
    : recordingState === 'ready'   ? (language === 'hi' ? 'रिकॉर्डिंग तैयार है ✓' : 'Recording ready ✓')
    : isSpeaking                   ? (language === 'hi' ? 'AI बोल रही है...' : 'AI is speaking...')
    :                                (language === 'hi' ? 'माइक दबाएं और बोलें' : 'Tap the mic and speak');

  return (
    <div className="animate-fadeUp space-y-5">
      <div className="flex items-center gap-3">
        {profile && (
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.09), rgba(236,72,153,0.05))', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 dark:text-white font-semibold text-sm font-outfit leading-tight">Hey {profile.name}! 👋</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[{ emoji: '📚', label: profile.education }, { emoji: '📍', label: profile.city }, { emoji: '🎯', label: goalLabel[profile.goal] || profile.goal }]
                  .map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs font-outfit font-medium text-gray-700 dark:text-gray-200"
                      style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
        <button onClick={onToggleLang}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium transition-all font-outfit">
          <span>{language === 'en' ? '🇮🇳' : '🇺🇸'}</span>
          <span className="hidden sm:inline">{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </div>

      {/* ── Previous search banner — now DB-backed ── */}
      {prevEntry && (
        <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))', border: '1px solid rgba(34,197,94,0.25)' }}>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-green-600 dark:text-green-400 font-outfit uppercase tracking-wider mb-0.5">
              {language === 'hi' ? '✅ पिछली search' : '✅ Previous search'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-outfit truncate">"{prevEntry.transcript}"</p>
            {prevEntry.selectedCareer && (
              <p className="text-xs text-orange-500 font-outfit mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {prevEntry.selectedCareer.title}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onDeletePrev} title={language === 'hi' ? 'Delete करें' : 'Delete search'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onResumePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm font-outfit transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
              {language === 'hi' ? 'जारी रखें' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-[#0f1117] border border-orange-500/15 dark:border-white/8">
  <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-orange-500/5 to-pink-500/3 dark:from-orange-500/8 dark:to-pink-500/5">
  
          <h2 className="text-3xl font-bold text-gray-900 font-outfit mb-2 leading-tight">
            {profile
              ? <>{profile.name}, <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">अपने interests बताइए</span> 🎤</>
              : <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">Tell us about yourself</span>}
          </h2>
          <p className="text-gray-600 font-outfit text-base leading-relaxed max-w-md mx-auto">
            {language === 'hi' ? 'आपको क्या काम अच्छा लगता है? किस field में आगे जाना चाहते हैं?' : 'What kind of work do you enjoy? What field interests you most?'}
          </p>
        </div>

        <div className="flex justify-center pt-4 pb-2 px-8">
          <button onClick={onReplayWelcome} disabled={isSpeaking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-outfit text-sm font-semibold transition-all disabled:opacity-50"
            style={isSpeaking
              ? { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#7c3aed' }
              : { background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: '#ea580c' }}>
            {isSpeaking ? <><Volume2 className="w-4 h-4 animate-pulse" /> AI बोल रही है...</> : <><Volume2 className="w-4 h-4" /> {language === 'hi' ? 'निर्देश सुनें' : 'Play instructions'}</>}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 px-8 pt-3 pb-6">
          {examplePrompts.map((p, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-sm font-outfit font-medium text-gray-600"
              style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)' }}>
              💬 {p}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center px-8 pb-8">
          <div className="relative mb-4">
            {recordingState === 'recording' && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: 'radial-gradient(circle, #ef4444, transparent)', transform: 'scale(1.8)' }} />
                <div className="absolute inset-0 rounded-full animate-pulse opacity-30"
                  style={{ background: 'radial-gradient(circle, #ef4444, transparent)', transform: 'scale(1.4)' }} />
              </>
            )}
            <button onClick={onRecordClick} disabled={isSpeaking}
              className="relative w-28 h-28 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: recordingState === 'recording' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : recordingState === 'ready' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #f97316, #ec4899)',
                boxShadow: recordingState === 'recording' ? '0 0 0 0 rgba(239,68,68,0.4), 0 8px 32px rgba(239,68,68,0.4)' : '0 8px 32px rgba(249,115,22,0.35)',
              }}>
              {recordingState === 'recording' ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
            </button>
          </div>

          <p className={`text-base font-semibold font-outfit mb-1 ${recordingState === 'recording' ? 'text-red-500' : recordingState === 'ready' ? 'text-green-600' : isSpeaking ? 'text-purple-500' : 'text-gray-700 dark:text-gray-300'}`}>
            {micLabel}
          </p>
          {recordingState === 'idle' && !isSpeaking && (
            <p className="text-sm text-gray-400 font-outfit text-center max-w-xs">
              {language === 'hi' ? 'अपनी hobby, skills, या पसंदीदा काम के बारे में बताइए' : 'Mention your hobbies, skills, or any work you enjoy'}
            </p>
          )}

          {hasAudio && (
            <div className="flex gap-3 mt-6">
              <button onClick={onRecordClick}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-all text-sm font-outfit font-medium">
                {language === 'hi' ? 'फिर से बोलें' : 'Record again'}
              </button>
              <button onClick={onSubmit}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all font-outfit"
                style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}>
                <Sparkles className="w-4 h-4" />
                {language === 'hi' ? 'Career सुझाव पाएं' : 'Get Career Suggestions'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Mic,      label: language === 'hi' ? '१. बोलें'       : '1. Speak',       desc: language === 'hi' ? 'अपने interests बताएं' : 'Tell us your interests', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: Sparkles, label: language === 'hi' ? '२. AI मैच करे'  : '2. AI Matches',  desc: language === 'hi' ? 'बेस्ट careers ढूंढें' : 'We find best careers',  color: 'text-pink-500',   bg: 'bg-pink-500/10'   },
          { icon: BookOpen, label: language === 'hi' ? '३. रोडमैप पाएं' : '3. Get Roadmap', desc: language === 'hi' ? 'Courses + jobs तैयार' : 'Courses + jobs ready',  color: 'text-purple-500', bg: 'bg-purple-500/10'  },
        ].map((item, i) => (
          <div key={i} className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 text-center border border-black/5 dark:border-white/8 shadow-sm">
            <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-white font-outfit">{item.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1
// ─────────────────────────────────────────────────────────────────────────────
function Step1({ transcript, careers, onSelectCareer, onBack, language, onToggleLang, selectedCareer, onContinueToRoadmap }: any) {
  const careerEmojis   = ['🚀', '💡', '🎯', '⚡', '🌟'];
  const careerBorders  = ['hover:border-orange-400','hover:border-blue-400','hover:border-green-400','hover:border-yellow-400','hover:border-purple-400'];
  const careerAccents  = ['text-orange-500','text-blue-500','text-green-500','text-yellow-500','text-purple-500'];
  const gradients      = ['linear-gradient(90deg,#f97316,#ec4899)','linear-gradient(90deg,#3b82f6,#8b5cf6)','linear-gradient(90deg,#22c55e,#14b8a6)','linear-gradient(90deg,#eab308,#f97316)','linear-gradient(90deg,#8b5cf6,#ec4899)'];
  const badgeBg        = ['rgba(249,115,22,0.1)','rgba(59,130,246,0.1)','rgba(34,197,94,0.1)','rgba(234,179,8,0.1)','rgba(139,92,246,0.1)'];

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex gap-3 items-start px-5 py-4 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <Mic className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-600 dark:text-purple-300 font-outfit uppercase tracking-wider mb-1">
            {language === 'hi' ? 'आपने कहा' : 'You said'}
          </p>
          <p className="text-gray-800 dark:text-gray-100 text-sm font-outfit leading-relaxed">"{transcript}"</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-outfit">
            {language === 'hi'
              ? <>आपके लिए <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">बेस्ट Careers</span> 🎯</>
              : <>Best <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">Career Options</span> for You 🎯</>}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-outfit mt-1">
            {language === 'hi' ? 'एक career चुनें और अपना roadmap पाएं' : 'Tap one to get your personalized roadmap'}
          </p>
        </div>
        <button onClick={onToggleLang}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium transition-all font-outfit mt-1">
          <span>{language === 'en' ? '🇮🇳' : '🇺🇸'}</span>
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </div>

      {selectedCareer && (
        <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(236,72,153,0.05))', border: '1px solid rgba(249,115,22,0.25)' }}>
          <div className="min-w-0">
            <p className="text-xs font-bold text-orange-500 font-outfit uppercase tracking-wider mb-0.5">
              {language === 'hi' ? '✅ आपका चुना career' : '✅ Your selected career'}
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white font-outfit truncate">{selectedCareer.title}</p>
          </div>
          <button onClick={onContinueToRoadmap}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm font-outfit transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}>
            {language === 'hi' ? 'Roadmap देखें' : 'View Roadmap'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {careers.map((career: Career, idx: number) => (
          <button key={idx} onClick={() => onSelectCareer(career)}
            className={`group text-left rounded-2xl bg-white dark:bg-white/5 border border-black/8 dark:border-white/10 ${careerBorders[idx % 5]} transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden`}>
            <div className="h-1 w-full" style={{ background: gradients[idx % 5] }} />
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg" style={{ background: badgeBg[idx % 5] }}>
                <span>{careerEmojis[idx % 5]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit leading-tight">{career.title}</h3>
                  <ArrowRight className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-all group-hover:translate-x-1 ${careerAccents[idx % 5]} opacity-0 group-hover:opacity-100`} />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-outfit mt-1.5 leading-relaxed">{career.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-outfit ${career.type.toLowerCase().includes('freelance') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                    {career.type.toLowerCase().includes('freelance') ? '💻 Freelance' : '🏢 Job'}
                  </span>
                  <span className="text-xs text-gray-400 font-outfit">{language === 'hi' ? 'चुनने के लिए tap करें →' : 'Tap to explore →'}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all text-sm font-outfit font-medium">
        <ArrowLeft className="w-4 h-4" />{language === 'hi' ? 'वापस जाएं' : 'Go back'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2
// ─────────────────────────────────────────────────────────────────────────────
function Step2({ selectedCareer, courses, jobs, onChangeCareer, onStartOver, onGoToDashboard, language, transcript, highlightSection, coursesRef, jobsRef, onAgentAction }: any) {
  return (
    <div className="animate-fadeUp space-y-8">
      <div className="text-center">
        <span className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-300 font-bold text-lg font-outfit">
          {selectedCareer.title}
        </span>
        <p className="text-gray-400 dark:text-gray-500 text-sm font-outfit mt-2">Your personalized learning path is ready 🎉</p>
      </div>

      <div ref={coursesRef} className={`transition-all duration-500 rounded-2xl p-1 ${highlightSection === 'courses' ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${language === 'hi' ? 'font-hindi' : 'font-outfit'}`}>{t('learn_courses', language)}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((course: Course, idx: number) => (
            <a key={idx} href={course.url} target="_blank" rel="noopener noreferrer"
              className="group p-5 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start gap-3">
                {course.platform.toLowerCase().includes('youtube') ? <Youtube className="w-6 h-6 text-red-500 flex-shrink-0" /> : <Globe className="w-6 h-6 text-purple-500 flex-shrink-0" />}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 font-outfit text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{course.platform}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">{course.level}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div ref={jobsRef} className={`transition-all duration-500 rounded-2xl p-1 ${highlightSection === 'jobs' ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-green-500" />
          <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${language === 'hi' ? 'font-hindi' : 'font-outfit'}`}>{t('get_hired', language)}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job: JobPlatform, idx: number) => (
            <a key={idx} href={job.url} target="_blank" rel="noopener noreferrer"
              className="group p-5 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 font-outfit text-sm">{job.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{job.tip}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">{job.type}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.12)' }}>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-white font-outfit">
            {language === 'hi' ? '✅ Career save हो गया!' : '✅ Career saved to your Dashboard!'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit mt-0.5">
            {language === 'hi' ? 'Dashboard पर अपना progress track करें' : 'Track your progress, mark courses done & jobs applied'}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onStartOver}
            className={`px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all text-sm flex items-center gap-1.5 ${language === 'hi' ? 'font-hindi' : 'font-outfit'}`}>
            <RotateCcw className="w-3.5 h-3.5" />{language === 'hi' ? 'नया search' : 'New search'}
          </button>
          <button onClick={onGoToDashboard}
            className={`px-4 py-2.5 rounded-xl text-white font-semibold hover:shadow-lg transition-all text-sm flex items-center gap-2 ${language === 'hi' ? 'font-hindi' : 'font-outfit'}`}
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
            {language === 'hi' ? 'Dashboard देखें' : 'Go to Dashboard'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AgentChat selectedCareer={selectedCareer.title} transcript={transcript} onAction={onAgentAction} />
    </div>
  );
}