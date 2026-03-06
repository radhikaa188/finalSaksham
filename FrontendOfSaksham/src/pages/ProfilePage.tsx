import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLang } from '../contexts/LanguageContext';
import { useUserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Briefcase, MessageSquare, User, Clock, TrendingUp, RotateCcw, ArrowLeft, CheckCircle2, Circle, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

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

export function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { lang } = useLang();
  const { profile, savedCareer, clearData } = useUserContext(); // ← local data
  const navigate = useNavigate();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'careers' | 'courses' | 'jobs' | 'chats'>('overview');

  useEffect(() => {
    fetchProfile();
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

  const completedSteps = savedCareer?.roadmap.filter(s => s.completed).length || 0;
  const totalSteps = savedCareer?.roadmap.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Back nav ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors font-outfit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* ── Account Info ── */}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-outfit">
                {user?.fullName || user?.firstName || 'User'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-outfit">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
              {/* Show local profile tags if available, else fall back to backend */}
              <div className="flex flex-wrap gap-2 mt-2">
                {profile ? (
                  <>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 font-outfit">
                      {profile.education}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">
                      {goalLabel[profile.goal] || profile.goal}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-outfit">
                      📍 {profile.city}
                    </span>
                  </>
                ) : data?.profile ? (
                  <>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 font-outfit">
                      {data.profile.preferredLanguage === 'hindi' ? 'Hindi' : 'English'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">
                      {data.profile.workPreference || 'Both'}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Languages known */}
          {profile?.languages && profile.languages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/8">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((l: string) => (
                  <span key={l} className="px-3 py-1 rounded-full text-xs font-outfit bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-black/5 dark:border-white/10">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Careers Explored',
              value: data?.stats.totalCareersExplored || (savedCareer ? 1 : 0),
              icon: Briefcase,
              color: 'text-orange-400',
              bg: 'bg-orange-500/10',
            },
            {
              label: 'Courses Seen',
              value: data?.stats.totalCoursesSeen || savedCareer?.courses.length || 0,
              icon: BookOpen,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
            },
            {
              label: 'Courses Done',
              value: savedCareer?.completedCourses.length || 0,
              icon: BookOpen,
              color: 'text-green-400',
              bg: 'bg-green-500/10',
            },
            {
              label: 'Roadmap Progress',
              value: `${progressPercent}%`,
              icon: TrendingUp,
              color: 'text-pink-400',
              bg: 'bg-pink-500/10',
            },
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

        {/* ── Current career card ── */}
        {savedCareer && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-orange-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 font-outfit">Current Career Path</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs text-gray-400 hover:text-orange-400 font-outfit transition-colors"
              >
                View Dashboard →
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit mb-3">{savedCareer.title}</h3>
            <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-600 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 font-outfit mt-1.5">
              {completedSteps} of {totalSteps} roadmap steps completed
            </p>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-black/5 dark:border-white/10">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'careers', label: 'Careers', icon: Briefcase },
            { key: 'courses', label: 'Courses', icon: BookOpen },
            { key: 'jobs', label: 'Jobs', icon: CheckCircle2 },
            { key: 'chats', label: 'Chats', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all font-outfit ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
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
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold font-outfit"
                >
                  Complete Onboarding
                </button>
              </div>
            )}

            {/* Danger zone */}
            {profile && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-500 font-outfit mb-1">Danger Zone</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit mb-3">
                  This will delete all your local profile, career, and progress data.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure? This cannot be undone.')) {
                      clearData();
                      navigate('/onboarding');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-outfit hover:bg-red-500/20 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset My Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Careers Tab ── */}
        {activeTab === 'careers' && (
          <div className="space-y-4">
            {/* Local saved career */}
            {savedCareer && (
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-orange-500/30 shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-orange-500 font-outfit font-semibold uppercase tracking-wider">Current</span>
                    <h3 className="font-bold text-gray-900 dark:text-white font-outfit mt-1">{savedCareer.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-600 dark:text-green-400 font-outfit">
                        {progressPercent}% complete
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-outfit">
                    <Clock className="w-3 h-3" />
                    {new Date(savedCareer.selectedAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            )}
            {/* Backend sessions */}
            {data?.sessions.length === 0 && !savedCareer ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-outfit">
                No careers explored yet. Go to Career Guide! 🚀
              </p>
            ) : (
              data?.sessions.map((session, i) => (
                <div key={i} className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-black/5 dark:border-white/10 shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white font-outfit">
                        {session.chosenCareer || 'Unknown Career'}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-outfit">
                          {session.preferredLanguage}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-600 dark:text-green-400 font-outfit">
                          {session.preferredJobType}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">
                          {session.courseLevel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-outfit">
                      <Clock className="w-3 h-3" />
                      {new Date(session.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Courses Tab ── */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {/* Local saved courses */}
            {savedCareer?.courses && savedCareer.courses.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-orange-500 font-outfit font-semibold uppercase tracking-wider">
                    Courses — {savedCareer.title}
                  </p>
                  <span className="text-xs text-gray-500 font-outfit">
                    {savedCareer.completedCourses?.length || 0}/{savedCareer.courses.length} completed
                  </span>
                </div>
                {savedCareer.courses.map((course, i) => {
                  const done = savedCareer.completedCourses.includes(course.title);
                  return (
                    <a key={i} href={course.url} target="_blank" rel="noopener noreferrer"
                      className={`block backdrop-blur-sm rounded-xl p-5 border shadow hover:border-purple-500 transition-all ${
                        done
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-white/70 dark:bg-white/5 border-black/5 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-bold font-outfit ${done ? 'text-green-500 line-through opacity-70' : 'text-gray-900 dark:text-white'}`}>
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-outfit">
                            {course.platform} · {savedCareer.title}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">
                            {course.level}
                          </span>
                          {done && <span className="text-xs text-green-500 font-outfit">✓ Done</span>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </>
            )}
            {/* Backend courses */}
            {data?.sessions.flatMap(s => s.courses || []).length === 0 && !savedCareer?.courses.length ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-outfit">
                No courses seen yet. Ask the agent "show me courses"! 🎓
              </p>
            ) : (
              data?.sessions.flatMap((s, si) =>
                (s.courses || []).map((course: any, ci: number) => (
                  <a key={`${si}-${ci}`} href={course.url} target="_blank" rel="noopener noreferrer"
                    className="block bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-black/5 dark:border-white/10 shadow hover:border-purple-500 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white font-outfit">{course.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-outfit">
                          {course.platform} · {s.chosenCareer}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">
                        {course.level}
                      </span>
                    </div>
                  </a>
                ))
              )
            )}
          </div>
        )}

        {/* ── Jobs Tab ── */}
        {activeTab === 'jobs' && (
          <div className="space-y-5">

            {/* Applied Jobs */}
            {savedCareer?.jobs && savedCareer.jobs.length > 0 ? (
              <>
                <div>
                  <p className="text-xs text-orange-500 font-outfit font-semibold uppercase tracking-wider mb-3">
                    Job Platforms — {savedCareer.title}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {savedCareer.jobs.map((job: any, i: number) => {
                      const applied = savedCareer.appliedJobs?.includes(job.name);
                      return (
                        <div key={i}
                          className="rounded-2xl p-4 transition-all"
                          style={applied
                            ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }
                            : { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.06)' }
                          }
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {applied
                                  ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                }
                                <p className={`font-bold font-outfit text-sm ${applied ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                  {job.name} {applied && '✓ Applied'}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit mt-1 ml-6">{job.tip}</p>
                              <span className="inline-block ml-6 mt-1.5 px-2 py-0.5 rounded-full text-xs font-outfit"
                                style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                                {job.type}
                              </span>
                            </div>
                            <a href={job.url} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-400 hover:text-orange-500">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(16,185,129,0.04))', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <Briefcase className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white font-outfit text-sm">
                      {savedCareer.appliedJobs?.length || 0} of {savedCareer.jobs.length} platforms applied
                    </p>
                    <p className="text-xs text-gray-500 font-outfit mt-0.5">
                      Mark jobs applied from your Dashboard to track progress
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <Briefcase className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-outfit text-sm">
                  No job data yet. Choose a career in the Career Guide first! 🚀
                </p>
                <button onClick={() => navigate('/guide')}
                  className="mt-4 px-5 py-2.5 rounded-xl text-white font-semibold text-sm font-outfit transition-all"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                  Go to Career Guide
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Chat History Tab ── */}
        {activeTab === 'chats' && (
          <div className="space-y-3">
            {data?.recentChats.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-outfit">
                No chats yet. Talk to the agent! 🎤
              </p>
            ) : (
              data?.recentChats.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-outfit ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-br-sm'
                      : 'bg-white/70 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-black/5 dark:border-white/10'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}