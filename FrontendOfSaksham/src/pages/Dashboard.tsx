import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useLang } from '../contexts/LanguageContext';
import {
  Mic, BookOpen, Briefcase, CheckCircle2, Circle,
  ArrowRight, ArrowLeft, RotateCcw, User, TrendingUp, Clock
} from 'lucide-react';

export function DashboardPage() {
  const { profile, savedCareer, updateRoadmapStep, addCompletedCourse, addAppliedJob, clearData } = useUserContext();
  const { lang } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.completedOnboarding) navigate('/onboarding');
  }, [profile, navigate]);

  if (!profile?.completedOnboarding) return null;

  const completedSteps   = savedCareer?.roadmap.filter(s => s.completed).length || 0;
  const totalSteps       = savedCareer?.roadmap.length || 0;
  const progressPercent  = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const completedCourses = savedCareer?.completedCourses.length || 0;
  const totalCourses     = savedCareer?.courses.length || 0;
  const appliedJobs      = savedCareer?.appliedJobs.length || 0;

  // Reusable card class
  const card = 'bg-white dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.07] shadow-sm';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080a12] relative overflow-hidden transition-colors duration-300">
      {/* blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/guide')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/70 transition-colors font-outfit">
            <ArrowLeft className="w-4 h-4" /> Back to Career Guide
          </button>
          <button onClick={() => navigate('/profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/80 transition-all font-outfit text-sm ${card}`}>
            <User className="w-4 h-4" /> Profile
          </button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-outfit">
            Welcome back, {profile.name} 👋
          </h1>
          <p className="text-gray-400 dark:text-white/40 text-sm mt-1 font-outfit">
            {savedCareer
              ? `You're tracking your journey to become a ${savedCareer.title}`
              : "You haven't started your career journey yet"}
          </p>
        </div>

        {/* No career yet */}
        {!savedCareer && (
          <div className="rounded-3xl p-10 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(236,72,153,0.05))', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 0 30px rgba(249,115,22,0.4)' }}>
              <Mic className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-outfit mb-2">Start Your Career Journey</h2>
            <p className="text-gray-400 dark:text-white/40 text-sm font-outfit mb-6 max-w-xs mx-auto">
              Tell us about yourself and we'll find the perfect career path for you
            </p>
            <button onClick={() => navigate('/guide')}
              className="px-8 py-3.5 rounded-2xl text-white font-semibold font-outfit flex items-center gap-2 mx-auto transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
              <Mic className="w-4 h-4" /> Go to Career Guide
            </button>
          </div>
        )}

        {/* Career dashboard */}
        {savedCareer && (
          <div className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Career',       value: savedCareer.title.split(' ').slice(0, 2).join(' '), icon: <Briefcase className="w-4 h-4" />, color: '#f97316' },
                { label: 'Progress',     value: `${progressPercent}%`,                              icon: <TrendingUp className="w-4 h-4" />, color: '#ec4899' },
                { label: 'Courses Done', value: `${completedCourses}/${totalCourses}`,               icon: <BookOpen className="w-4 h-4" />,   color: '#8b5cf6' },
                { label: 'Jobs Applied', value: `${appliedJobs}`,                                    icon: <CheckCircle2 className="w-4 h-4" />, color: '#22c55e' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-2xl p-4 ${card}`}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                    {stat.icon}
                    <span className="text-xs font-outfit text-gray-400 dark:text-white/30">{stat.label}</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-bold text-lg font-outfit leading-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className={`rounded-2xl p-5 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-800 dark:text-white font-semibold font-outfit text-sm">Overall Progress</p>
                <p className="text-orange-500 font-bold font-outfit text-sm">{progressPercent}%</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-white/[0.06]">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #f97316, #ec4899)', boxShadow: '0 0 8px rgba(249,115,22,0.5)' }} />
              </div>
              <p className="text-gray-400 dark:text-white/30 text-xs font-outfit mt-2">
                {completedSteps} of {totalSteps} roadmap steps completed
              </p>
            </div>

            {/* Roadmap */}
            {savedCareer.roadmap.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" /> Your Roadmap
                </h2>
                <div className="space-y-3">
                  {savedCareer.roadmap.map((step, idx) => (
                    <div key={step.id}
                      className={`rounded-2xl p-5 transition-all duration-200 ${step.completed ? '' : card}`}
                      style={step.completed ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' } : undefined}>
                      <div className="flex items-start gap-4">
                        <button onClick={() => updateRoadmapStep(step.id, !step.completed)} className="flex-shrink-0 mt-0.5">
                          {step.completed
                            ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                            : <Circle className="w-6 h-6 text-gray-300 dark:text-white/20 hover:text-orange-400 transition-colors" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-300 dark:text-white/20 font-outfit">Step {idx + 1}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/30 font-outfit">
                              <Clock className="w-3 h-3" /> ~{step.estimatedWeeks}w
                            </span>
                          </div>
                          <h3 className={`font-semibold font-outfit text-sm ${step.completed ? 'text-green-400 line-through opacity-60' : 'text-gray-900 dark:text-white'}`}>
                            {step.title}
                          </h3>
                          <p className="text-gray-400 dark:text-white/40 text-xs mt-1 font-outfit">{step.description}</p>
                          {step.skillsToLearn.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {step.skillsToLearn.map(skill => (
                                <span key={skill} className="px-2 py-0.5 rounded-full text-xs font-outfit text-orange-500 dark:text-orange-400/70"
                                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {savedCareer.courses.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" /> Courses
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {savedCareer.courses.map((course, idx) => {
                    const done = savedCareer.completedCourses.includes(course.title);
                    return (
                      <div key={idx}
                        className={`rounded-2xl p-4 flex items-start gap-3 transition-all ${done ? '' : card}`}
                        style={done ? { background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' } : undefined}>
                        <button onClick={() => addCompletedCourse(course.title)} className="flex-shrink-0 mt-0.5">
                          {done
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <Circle className="w-5 h-5 text-gray-300 dark:text-white/20 hover:text-purple-400 transition-colors" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold font-outfit ${done ? 'text-green-400/70 line-through' : 'text-gray-900 dark:text-white'}`}>
                            {course.title}
                          </p>
                          <p className="text-gray-400 dark:text-white/30 text-xs font-outfit mt-0.5">{course.platform}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs text-purple-500 dark:text-purple-400 font-outfit"
                            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                            {course.level}
                          </span>
                        </div>
                        <a href={course.url} target="_blank" rel="noopener noreferrer"
                          className="text-gray-300 dark:text-white/20 hover:text-purple-400 transition-colors flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Jobs */}
            {savedCareer.jobs.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-400" /> Job Platforms
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {savedCareer.jobs.map((job, idx) => {
                    const applied = savedCareer.appliedJobs.includes(job.name);
                    return (
                      <div key={idx}
                        className={`rounded-2xl p-4 transition-all ${applied ? '' : card}`}
                        style={applied ? { background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' } : undefined}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-bold font-outfit ${applied ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                              {job.name} {applied && '✓'}
                            </p>
                            <p className="text-gray-400 dark:text-white/30 text-xs font-outfit mt-0.5">{job.tip}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded-full text-xs text-green-600 dark:text-green-400 font-outfit"
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                {job.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <a href={job.url} target="_blank" rel="noopener noreferrer"
                              className={`px-3 py-1.5 rounded-xl text-xs font-outfit text-gray-500 dark:text-white/60 hover:text-gray-800 dark:hover:text-white transition-all ${card}`}>
                              Visit
                            </a>
                            {!applied && (
                              <button onClick={() => addAppliedJob(job.name)}
                                className="px-3 py-1.5 rounded-xl text-xs font-outfit text-green-600 dark:text-green-400 transition-all"
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                Mark Applied
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => navigate('/guide')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold font-outfit text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}>
                <Mic className="w-4 h-4" /> Explore a New Career
              </button>
              <button onClick={() => { if (confirm('This will clear all your saved data. Are you sure?')) clearData(); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-gray-400 dark:text-white/40 font-outfit text-sm transition-all hover:text-gray-700 dark:hover:text-white/70 ${card}`}>
                <RotateCcw className="w-4 h-4" /> Reset All
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}