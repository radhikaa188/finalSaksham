import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useCareerComparison } from '../hooks/useCareerComparison';
import type { CareerComparisonData } from '../hooks/useCareerComparison';
import {
  ArrowLeft, Sparkles, CheckCircle2, XCircle, TrendingUp,
  MapPin, Clock, Briefcase, BookOpen, Star, Zap, Trophy,
  ChevronRight, RotateCcw,
} from 'lucide-react';

interface LocationState {
  careers: { title: string; type: string; description: string }[];
  interestId: string;
  transcript: string;
}

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-500 bg-green-500/10',
  Moderate: 'text-orange-500 bg-orange-500/10',
  Hard: 'text-red-500 bg-red-500/10',
  'Easy to Moderate': 'text-green-500 bg-green-500/10',
  Challenging: 'text-red-500 bg-red-500/10',
};

const availabilityColor: Record<string, string> = {
  High: 'text-green-500 bg-green-500/10',
  Medium: 'text-orange-500 bg-orange-500/10',
  Moderate: 'text-orange-500 bg-orange-500/10',
  Low: 'text-red-500 bg-red-500/10',
  'Low to Moderate': 'text-yellow-500 bg-yellow-500/10',
  Challenging: 'text-red-500 bg-red-500/10',
};

const scoreColor = (score: number) => {
  if (score >= 8) return 'from-green-500 to-emerald-400';
  if (score >= 6) return 'from-orange-500 to-yellow-400';
  return 'from-red-500 to-pink-400';
};

export function CareerComparePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { profile, resumeFromHistory, interestHistory } = useUserContext();
  const { compare, loading, error, result } = useCareerComparison();

  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const careers = state?.careers || [];

  const toggleCareer = (title: string) => {
    setSelectedCareers(prev =>
      prev.includes(title)
        ? prev.filter(c => c !== title)
        : prev.length < 3 ? [...prev, title] : prev
    );
  };

  const handleCompare = async () => {
    if (selectedCareers.length < 2) return;
    setHasCompared(true);
    await compare(
      selectedCareers,
      profile?.city || '',
      profile?.goal || 'job',
      profile?.education || 'Graduate'
    );
  };

  const handleChooseCareer = (careerTitle: string) => {
    // Find the matching history entry and resume from it
    const entry = interestHistory.find(e =>
      e._id === state?.interestId && e.selectedCareer?.title === careerTitle
    );
    if (entry) {
      resumeFromHistory(entry);
    }
    navigate('/dashboard');
  };

  if (!state || careers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-outfit mb-4">No careers to compare. Go back to your profile.</p>
          <button onClick={() => navigate('/profile')} className="px-5 py-2.5 rounded-xl text-white font-semibold font-outfit" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors relative overflow-hidden pt-24 pb-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Back */}
        <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors font-outfit">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-outfit">
            Career Comparison
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-outfit text-sm max-w-md mx-auto">
            {profile?.city ? `Personalised for ${profile.city}` : 'India job market insights'} · AI-powered analysis
          </p>
          {state.transcript && (
            <p className="text-xs text-gray-400 dark:text-gray-500 font-outfit mt-1 italic">
              🎤 Based on: "{state.transcript}"
            </p>
          )}
        </div>

        {/* Career Selection */}
        {!hasCompared && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-black/5 dark:border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white font-outfit">Select careers to compare</h2>
              <span className="text-xs text-gray-400 font-outfit">{selectedCareers.length}/3 selected</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit">Pick 2 or 3 careers from your interest search to compare side by side.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {careers.map((career) => {
                const isSelected = selectedCareers.includes(career.title);
                return (
                  <button
                    key={career.title}
                    onClick={() => toggleCareer(career.title)}
                    className={`text-left p-4 rounded-xl border transition-all font-outfit ${
                      isSelected
                        ? 'border-orange-500/50 bg-orange-500/5 dark:bg-orange-500/10'
                        : 'border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] hover:border-orange-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm font-outfit ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                          {career.title}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-gray-400 font-outfit">
                          {career.type}
                        </span>
                        {career.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-outfit line-clamp-2">{career.description}</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCompare}
              disabled={selectedCareers.length < 2}
              className={`w-full py-3 rounded-xl font-semibold font-outfit text-sm transition-all flex items-center justify-center gap-2 ${
                selectedCareers.length >= 2
                  ? 'text-white shadow-lg hover:shadow-orange-500/25 hover:scale-[1.01]'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
              style={selectedCareers.length >= 2 ? { background: 'linear-gradient(135deg, #f97316, #ec4899)' } : {}}
            >
              <Sparkles className="w-4 h-4" />
              {selectedCareers.length < 2 ? 'Select at least 2 careers' : `Compare ${selectedCareers.length} Careers with AI`}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-orange-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-outfit font-semibold">Analysing careers for {profile?.city || 'India'}...</p>
            <p className="text-gray-400 dark:text-gray-500 font-outfit text-sm">Gemini AI is comparing salary, jobs, skills & more</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 space-y-3">
            <p className="text-red-500 font-outfit">{error}</p>
            <button onClick={() => { setHasCompared(false); }} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-outfit text-sm hover:bg-red-500/20 transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8">

            {/* Verdict banner */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 dark:border-orange-500/10">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 font-outfit mb-1">AI Verdict</p>
                  <p className="text-gray-700 dark:text-gray-300 font-outfit text-sm">{result.verdict}</p>
                  <p className="text-gray-600 dark:text-gray-400 font-outfit text-sm mt-2">{result.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Score overview */}
            <div className={`grid gap-4 ${result.careers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {result.careers.map((career: CareerComparisonData) => (
                <div key={career.career} className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-black/5 dark:border-white/10 shadow text-center space-y-2">
                  <p className="text-xs text-gray-400 font-outfit uppercase tracking-wider">Score</p>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${scoreColor(career.score)} bg-clip-text text-transparent font-outfit`}>
                    {career.score}/10
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-outfit">{career.career}</p>
                </div>
              ))}
            </div>

            {/* Detailed comparison cards */}
            {result.careers.map((career: CareerComparisonData) => (
              <div key={career.career} className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/10 shadow-xl overflow-hidden">

                {/* Card header */}
                <div className="p-5 border-b border-black/5 dark:border-white/[0.08]" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(236,72,153,0.04))' }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">{career.career}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-outfit mt-0.5">{career.bestFor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-outfit font-semibold ${difficultyColor[career.difficulty.level] || difficultyColor['Moderate']}`}>
                        {career.difficulty.level}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-outfit font-semibold ${availabilityColor[career.jobAvailability.overall] || availabilityColor['Moderate']}`}>
                        {career.jobAvailability.overall} Jobs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* Salary */}
                  <div>
                    <p className="text-xs text-gray-400 font-outfit uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Salary in India
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Entry', value: career.avgSalary.entry },
                        { label: 'Mid', value: career.avgSalary.mid },
                        { label: 'Senior', value: career.avgSalary.senior },
                      ].map((s: { label: string; value: string }, j: number) => (
                        <div key={`salary-${j}`} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 text-center border border-black/5 dark:border-white/[0.08]">
                          <p className="text-xs text-gray-400 font-outfit">{s.label}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white font-outfit mt-0.5">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Job availability */}
                  <div>
                    <p className="text-xs text-gray-400 font-outfit uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Jobs in {profile?.city || 'India'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-outfit">{career.jobAvailability.inCity}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {career.jobAvailability.topCities.map((city: string, j: number) => (
                        <span key={`city-${j}`} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-outfit">{city}</span>
                      ))}
                    </div>
                  </div>

                  {/* Time to job */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-outfit">Time to first job: <span className="font-semibold text-gray-900 dark:text-white">{career.difficulty.timeToJob}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-outfit">Freelance: <span className={`font-semibold ${(availabilityColor[career.freelanceScope] || availabilityColor['Medium']).split(' ')[0]}`}>{career.freelanceScope}</span></span>
                    </div>
                  </div>

                  {/* Top skills */}
                  <div>
                    <p className="text-xs text-gray-400 font-outfit uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Top Skills Needed
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.topSkills.map((skill: string, j: number) => (
                        <span key={`skill-${j}`} className="px-2.5 py-1 rounded-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-outfit">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* India scope */}
                  <div className="bg-orange-500/5 dark:bg-orange-500/5 rounded-xl p-3 border border-orange-500/10">
                    <p className="text-xs text-orange-500 font-outfit font-semibold mb-1">🇮🇳 India Scope</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-outfit">{career.indiaScope}</p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-500 font-outfit font-semibold mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pros
                      </p>
                      <ul className="space-y-1.5">
                        {career.pros.map((pro: string, j: number) => (
                          <li key={`item-${j}`} className="text-xs text-gray-600 dark:text-gray-400 font-outfit flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>{pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-500 font-outfit font-semibold mb-2 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Cons
                      </p>
                      <ul className="space-y-1.5">
                        {career.cons.map((con: string, j: number) => (
                          <li key={`item-${j}`} className="text-xs text-gray-600 dark:text-gray-400 font-outfit flex items-start gap-1.5">
                            <span className="text-red-500 mt-0.5 flex-shrink-0">−</span>{con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleChooseCareer(career.career)}
                    className="w-full py-3 rounded-xl font-semibold font-outfit text-sm text-white transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
                  >
                    Choose {career.career} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Compare again */}
            <div className="text-center">
              <button
                onClick={() => { setHasCompared(false); setSelectedCareers([]); }}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-600 dark:text-gray-400 font-outfit text-sm hover:border-orange-500/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Compare Different Careers
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}