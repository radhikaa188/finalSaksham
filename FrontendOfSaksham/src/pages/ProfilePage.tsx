import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLang } from '../contexts/LanguageContext';
import { useUserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import AnimatedThemeToggler from '../components/AnimatedThemeToggler';
import {
  BookOpen, Briefcase, MessageSquare, User, Clock, TrendingUp,
  RotateCcw, ArrowLeft, CheckCircle2, Circle, ExternalLink,
  Sparkles, ChevronDown, ChevronUp, Target,
} from 'lucide-react';

// const API_BASE = 'http://localhost:5000/api';
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface SessionData {
  id: string;
  chosenCareer: string;
  preferredLanguage: string;
  preferredJobType: string;
  courseLevel: string;
  courses: any[];
  createdAt: string;
}

interface ProfileData {
  profile: any;
  sessions: SessionData[];
  stats: {
    totalCareersExplored: number;
    uniqueCareers: string[];
    totalCoursesSeen: number;
  };
  recentChats: ChatMessage[];
}

const goalLabel: Record<string, string> = {
  job: '💼 Full-time Job',
  freelance: '💻 Freelancing',
  both: '🚀 Both',
};

type Tab = 'overview' | 'interests' | 'courses' | 'jobs' | 'chats';

export function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { lang } = useLang();
  const { profile, savedCareer, clearData, interestHistory, fetchInterestHistory, historyLoading } = useUserContext();
  const navigate = useNavigate();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedInterest, setExpandedInterest] = useState<string | null>(null);
  const [expandedCourseGroup, setExpandedCourseGroup] = useState<string | null>(null);
  const [expandedJobGroup, setExpandedJobGroup] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchInterestHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────

  const completedSteps = savedCareer?.roadmap.filter(s => s.completed).length || 0;
  const totalSteps = savedCareer?.roadmap.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Course groups: each interest entry that has a selected career + courses
  const courseGroups = interestHistory
    .filter(e => e.selectedCareer && e.courses && e.courses.length > 0)
    .map(e => ({
      careerTitle: e.selectedCareer!.title,
      transcript: e.transcript,
      entryId: e._id,
      courses: e.courses || [],
      completedCourses: e.completedCourses || [],
      isActive: savedCareer?.title === e.selectedCareer!.title,
      createdAt: e.createdAt,
    }));

  // Fallback: savedCareer courses not already covered by history
  const historyCareerTitles = new Set(courseGroups.map(g => g.careerTitle));
  if (savedCareer?.courses?.length && !historyCareerTitles.has(savedCareer.title)) {
    courseGroups.unshift({
      careerTitle: savedCareer.title,
      transcript: '',
      entryId: 'local',
      courses: savedCareer.courses,
      completedCourses: savedCareer.completedCourses || [],
      isActive: true,
      createdAt: savedCareer.selectedAt,
    });
  }

  // Job groups: ALL jobs (applied + not), grouped by career+interest
  const jobGroups = interestHistory
    .filter(e => e.selectedCareer && e.jobs && e.jobs.length > 0)
    .map(e => ({
      careerTitle: e.selectedCareer!.title,
      transcript: e.transcript,
      entryId: e._id,
      jobs: e.jobs || [],
      appliedJobs: e.appliedJobs || [],
      isActive: savedCareer?.title === e.selectedCareer!.title,
      createdAt: e.createdAt,
    }));

  // Fallback for savedCareer jobs
  const historyJobTitles = new Set(jobGroups.map(g => g.careerTitle));
  if (savedCareer?.jobs?.length && !historyJobTitles.has(savedCareer.title)) {
    jobGroups.unshift({
      careerTitle: savedCareer.title,
      transcript: '',
      entryId: 'local',
      jobs: savedCareer.jobs,
      appliedJobs: savedCareer.appliedJobs || [],
      isActive: true,
      createdAt: savedCareer.selectedAt,
    });
  }

  const totalApplied = jobGroups.reduce((sum, g) => sum + g.appliedJobs.length, 0);
  const totalJobs = jobGroups.reduce((sum, g) => sum + g.jobs.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden pt-24 pb-20">
      {/* Theme Toggler Button */}
      <div className="absolute top-6 right-6 z-50">
        <AnimatedThemeToggler 
          className="p-3 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 text-gray-800 dark:text-white hover:bg-white dark:hover:bg-white/10 transition-all shadow-lg"
        />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors font-outfit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Account Info */}
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-orange-500" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-outfit">{user?.fullName || user?.firstName || 'User'}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-outfit">{user?.emailAddresses?.[0]?.emailAddress}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile ? (
                  <>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 font-outfit">{profile.education}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">{goalLabel[profile.goal] || profile.goal}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-outfit">📍 {profile.city}</span>
                  </>
                ) : data?.profile ? (
                  <>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 font-outfit">{data.profile.preferredLanguage === 'hindi' ? 'Hindi' : 'English'}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">{data.profile.workPreference || 'Both'}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          {(profile?.languages?.length ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/[0.08]">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {profile?.languages?.map((l: string) => (
                  <span key={l} className="px-3 py-1 rounded-full text-xs font-outfit bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-black/5 dark:border-white/10">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Interests Explored', value: interestHistory.length || 0, icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Careers Chosen', value: interestHistory.filter(e => e.selectedCareer).length || (savedCareer ? 1 : 0), icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Jobs Applied', value: totalApplied, icon: Briefcase, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Roadmap Progress', value: `${progressPercent}%`, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-black/5 dark:border-white/10 shadow text-center">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-outfit">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-outfit">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Current career progress */}
        {savedCareer && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-orange-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 font-outfit">Current Career Path</p>
              <button onClick={() => navigate('/dashboard')} className="text-xs text-gray-400 hover:text-orange-400 font-outfit transition-colors">View Dashboard →</button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit mb-3">{savedCareer.title}</h3>
            <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-600 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-gray-400 font-outfit mt-1.5">{completedSteps} of {totalSteps} roadmap steps completed</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-black/5 dark:border-white/10 overflow-x-auto">
          {([
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'interests', label: 'Interests', icon: Sparkles },
            { key: 'courses', label: 'Courses', icon: BookOpen },
            { key: 'jobs', label: 'Jobs', icon: Briefcase },
            { key: 'chats', label: 'Chats', icon: MessageSquare },
          ] as { key: Tab; label: string; icon: any }[]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all font-outfit whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {profile ? (
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white font-outfit">Your Profile</h3>
                {[
                  { label: 'Name', value: profile.name },
                  { label: 'Education', value: profile.education },
                  { label: 'City', value: profile.city },
                  { label: 'Goal', value: goalLabel[profile.goal] || profile.goal },
                  { label: 'Languages', value: profile.languages.join(', ') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-outfit">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-outfit">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 font-outfit mb-4">No local profile found.</p>
                <button onClick={() => navigate('/onboarding')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold font-outfit">Complete Onboarding</button>
              </div>
            )}
            {profile && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-500 font-outfit mb-1">Danger Zone</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit mb-3">This will delete all your local profile, career, and progress data.</p>
                <button onClick={() => { if (confirm('Are you sure? This cannot be undone.')) { clearData(); navigate('/onboarding'); } }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-outfit hover:bg-red-500/20 transition-all">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset My Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── INTERESTS ── */}
        {activeTab === 'interests' && (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : interestHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-orange-500/10">
                  <Sparkles className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-outfit text-sm">No interests explored yet. Talk to the Career Guide! 🎤</p>
                <button onClick={() => navigate('/guide')} className="mt-4 px-5 py-2.5 rounded-xl text-white font-semibold text-sm font-outfit" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                  Go to Career Guide
                </button>
              </div>
            ) : interestHistory.map(entry => {
              const isExpanded = expandedInterest === entry._id;
              const isActive = savedCareer?.title === entry.selectedCareer?.title;
              return (
                <div key={entry._id} className={`bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border shadow transition-all ${isActive ? 'border-orange-500/30' : 'border-black/5 dark:border-white/10'}`}>
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedInterest(isExpanded ? null : entry._id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {isActive && <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-500 font-outfit font-semibold">Active</span>}
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-outfit">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-outfit line-clamp-2 mb-2">🎤 "{entry.transcript}"</p>
                        {entry.selectedCareer ? (
                          <div className="flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400 font-outfit">{entry.selectedCareer.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/10 text-green-600 dark:text-green-400 font-outfit">{entry.selectedCareer.type}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit italic">No career selected from this search</p>
                        )}
                      </div>
                      <button className="flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    {entry.careers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {entry.careers.map((c, i) => (
                            <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-outfit ${
                              entry.selectedCareer?.title === c.title
                                ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold'
                                : 'bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400'
                            }`}>
                              {entry.selectedCareer?.title === c.title ? '✓ ' : ''}{c.title}
                            </span>
                          ))}
                        </div>
                        {entry.careers.length >= 2 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              navigate('/compare', {
                                state: {
                                  careers: entry.careers,
                                  interestId: entry._id,
                                  transcript: entry.transcript,
                                },
                              });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-outfit font-semibold text-white transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
                          >
                            <Sparkles className="w-3 h-3" /> Compare Careers
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isExpanded && entry.selectedCareer && (
                    <div className="px-5 pb-5 space-y-4 border-t border-black/5 dark:border-white/[0.08] pt-4">
                      {entry.selectedCareer.description && (
                        <div>
                          <p className="text-xs text-gray-400 font-outfit uppercase tracking-wider mb-1">About this career</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-outfit">{entry.selectedCareer.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Courses Done', value: entry.completedCourses?.length || 0, total: entry.courses?.length || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                          { label: 'Jobs Applied', value: entry.appliedJobs?.length || 0, total: entry.jobs?.length || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
                          { label: 'Roadmap', value: entry.roadmap?.filter((s: any) => s.completed).length || 0, total: entry.roadmap?.length || 0, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        ].map((stat, i) => (
                          <div key={i} className={`rounded-xl p-3 ${stat.bg} text-center`}>
                            <p className={`text-lg font-bold font-outfit ${stat.color}`}>
                              {stat.value}<span className="text-xs font-normal opacity-60">/{stat.total}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── COURSES — grouped by career, shows which interest ── */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            {courseGroups.length === 0 && !data?.sessions.flatMap(s => s.courses || []).length ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-outfit">No courses seen yet. Ask the agent "show me courses"! 🎓</p>
            ) : (
              <>
                {courseGroups.map(group => {
                  const isCourseOpen = expandedCourseGroup === group.entryId;
                  return (
                  <div key={group.entryId} className={`bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border shadow transition-all ${group.isActive ? 'border-orange-500/20' : 'border-black/5 dark:border-white/10'}`}>
                    {/* Clickable header */}
                    <div className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none" onClick={() => setExpandedCourseGroup(isCourseOpen ? null : group.entryId)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold font-outfit ${group.isActive ? 'text-orange-500' : 'text-gray-800 dark:text-gray-200'}`}>
                            {group.isActive && '⭐ '}{group.careerTitle}
                          </p>
                          {group.isActive && <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-500 font-outfit">Active</span>}
                        </div>
                        {group.transcript && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit mt-0.5 line-clamp-1">🎤 "{group.transcript}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 font-outfit">{group.completedCourses.length}/{group.courses.length} done</span>
                        {isCourseOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expandable courses */}
                    {isCourseOpen && (
                      <div className="px-4 pb-4 space-y-2 border-t border-black/5 dark:border-white/[0.08] pt-3">
                        {group.courses.map((course, i) => {
                          const done = group.completedCourses.includes(course.title);
                          return (
                            <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                              className={`block rounded-xl p-3 border transition-all hover:border-purple-500 ${done ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-50 dark:bg-white/[0.03] border-black/5 dark:border-white/[0.08]'}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                                    <h3 className={`font-semibold font-outfit text-sm ${done ? 'text-green-500 line-through opacity-70' : 'text-gray-900 dark:text-white'}`}>{course.title}</h3>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-outfit ml-5">{course.platform}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">{course.level}</span>
                                  {done && <span className="text-xs text-green-500 font-outfit">✓ Done</span>}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  );
                })}

                {/* Backend sessions fallback */}
                {courseGroups.length === 0 && data?.sessions.flatMap(s => s.courses || []).map((course: any, i: number) => (
                  <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                    className="block bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-black/5 dark:border-white/10 shadow hover:border-purple-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white font-outfit text-sm">{course.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-outfit">{course.platform}</p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">{course.level}</span>
                    </div>
                  </a>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── JOBS — all jobs grouped by career+interest, with applied status ── */}
        {activeTab === 'jobs' && (
          <div className="space-y-8">
            {jobGroups.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-orange-500/10">
                  <Briefcase className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-outfit text-sm">No job data yet. Choose a career in the Career Guide first! 🚀</p>
                <button onClick={() => navigate('/guide')} className="mt-4 px-5 py-2.5 rounded-xl text-white font-semibold text-sm font-outfit" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                  Go to Career Guide
                </button>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="rounded-2xl p-4 flex items-center gap-4 bg-green-500/5 dark:bg-green-500/5 border border-green-500/20">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-500/15">
                    <Briefcase className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white font-outfit text-sm">{totalApplied} of {totalJobs} platforms applied across all careers</p>
                    <p className="text-xs text-gray-500 font-outfit mt-0.5">Mark jobs applied from your Dashboard to track progress</p>
                  </div>
                </div>

                {jobGroups.map(group => {
                  const isJobOpen = expandedJobGroup === group.entryId;
                  return (
                  <div key={group.entryId} className={`bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border shadow transition-all ${group.isActive ? 'border-orange-500/20' : 'border-black/5 dark:border-white/10'}`}>
                    {/* Clickable header */}
                    <div className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none" onClick={() => setExpandedJobGroup(isJobOpen ? null : group.entryId)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold font-outfit ${group.isActive ? 'text-orange-500' : 'text-gray-800 dark:text-gray-200'}`}>
                            {group.isActive && '⭐ '}{group.careerTitle}
                          </p>
                          {group.isActive && <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-500 font-outfit">Active</span>}
                        </div>
                        {group.transcript && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit mt-0.5 line-clamp-1">🎤 "{group.transcript}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 font-outfit">{group.appliedJobs.length}/{group.jobs.length} applied</span>
                        {isJobOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expandable jobs */}
                    {isJobOpen && (
                      <div className="px-4 pb-4 border-t border-black/5 dark:border-white/[0.08] pt-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {group.jobs.map((job: any, i: number) => {
                            const applied = group.appliedJobs.includes(job.name);
                            return (
                              <div key={i} className={`rounded-xl p-3 transition-all ${
                                applied
                                  ? 'border border-green-500/20 bg-green-500/5'
                                  : 'border border-black/5 dark:border-white/[0.08] bg-white/60 dark:bg-white/5'
                              }`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      {applied
                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        : <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                      }
                                      <p className={`font-bold font-outfit text-sm ${applied ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                        {job.name}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit mt-0.5 ml-5">{job.tip}</p>
                                    <div className="flex items-center gap-2 mt-1 ml-5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded-full text-xs font-outfit bg-green-500/10 text-green-700 dark:text-green-400">{job.type}</span>
                                      {applied && <span className="text-xs text-green-500 font-outfit">✓ Applied</span>}
                                    </div>
                                  </div>
                                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                                    className="flex-shrink-0 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-400 hover:text-orange-500">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── CHATS ── */}
        {activeTab === 'chats' && (
          <div className="space-y-3">
            {!data?.recentChats?.length ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-outfit">No chats yet. Talk to the agent! 🎤</p>
            ) : data.recentChats.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-outfit ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-br-sm'
                    : 'bg-white/70 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-black/5 dark:border-white/10'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}