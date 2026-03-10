import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import type { UserProfile, SavedCareer } from '../types';

// const API_BASE = 'http://localhost:5000/api';
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
// ─── Types ────────────────────────────────────────────────────────────────────

export interface CareerSuggestion {
  title: string;
  type: string;
  description: string;
}

export interface InterestEntry {
  _id: string;
  transcript: string;
  careers: CareerSuggestion[];
  selectedCareer?: CareerSuggestion | null;
  courses?: any[];
  jobs?: any[];
  roadmap?: any[];
  completedCourses: string[];
  appliedJobs: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  profile: UserProfile | null;
  savedCareer: SavedCareer | null;

  // Interest history (persisted in MongoDB)
  interestHistory: InterestEntry[];
  activeHistoryId: string | null;           // the DB _id of the current session
  historyLoading: boolean;

  setProfile: (p: UserProfile) => void;
  setSavedCareer: (c: SavedCareer) => void;
  updateRoadmapStep: (stepId: string, completed: boolean) => void;
  addCompletedCourse: (courseTitle: string) => void;
  addAppliedJob: (jobName: string) => void;
  clearData: () => void;

  // History API helpers
  fetchInterestHistory: () => Promise<void>;
  saveNewSearch: (transcript: string, careers: CareerSuggestion[]) => Promise<string | null>;
  updateSearchWithCareer: (
    historyId: string,
    selectedCareer: CareerSuggestion,
    courses: any[],
    jobs: any[],
    roadmap: any[]
  ) => Promise<void>;
  updateProgress: (
    historyId: string,
    fields: { completedCourses?: string[]; appliedJobs?: string[]; roadmap?: any[] }
  ) => Promise<void>;
  deleteHistoryEntry: (historyId: string) => Promise<void>;
  resumeFromHistory: (entry: InterestEntry) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const storageKey = user?.id || 'guest';

  // ── Existing local state ──────────────────────────────────────────────────
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_profile`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [savedCareer, setSavedCareerState] = useState<SavedCareer | null>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_career`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ── Interest history state ────────────────────────────────────────────────
  const [interestHistory, setInterestHistory] = useState<InterestEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Auth helper ───────────────────────────────────────────────────────────
  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [getToken]);

  // ── Existing setters ──────────────────────────────────────────────────────
  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem(`${storageKey}_profile`, JSON.stringify(p));
  };

  const setSavedCareer = (c: SavedCareer) => {
    setSavedCareerState(c);
    localStorage.setItem(`${storageKey}_career`, JSON.stringify(c));
  };

  const updateRoadmapStep = (stepId: string, completed: boolean) => {
  if (!savedCareer) return;
  const updatedRoadmap = savedCareer.roadmap.map(s =>
    s.id === stepId ? { ...s, completed } : s
  );
  const updated = { ...savedCareer, roadmap: updatedRoadmap };
  setSavedCareer(updated);
  if (activeHistoryId) updateProgress(activeHistoryId, { roadmap: updatedRoadmap });
};

const addCompletedCourse = (courseTitle: string) => {
  if (!savedCareer) return;
  if (savedCareer.completedCourses.includes(courseTitle)) return;
  const updatedCourses = [...savedCareer.completedCourses, courseTitle];
  setSavedCareer({ ...savedCareer, completedCourses: updatedCourses });
  if (activeHistoryId) updateProgress(activeHistoryId, { completedCourses: updatedCourses });
};

const addAppliedJob = (jobName: string) => {
  if (!savedCareer) return;
  if (savedCareer.appliedJobs.includes(jobName)) return;
  const updatedJobs = [...savedCareer.appliedJobs, jobName];
  setSavedCareer({ ...savedCareer, appliedJobs: updatedJobs });
  if (activeHistoryId) updateProgress(activeHistoryId, { appliedJobs: updatedJobs });
};

  const clearData = () => {
    setProfileState(null);
    setSavedCareerState(null);
    localStorage.removeItem(`${storageKey}_profile`);
    localStorage.removeItem(`${storageKey}_career`);
  };

  // ── Interest History API calls ─────────────────────────────────────────────

  /** Load all past searches from DB */
  const fetchInterestHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/interest-history`, { headers });
      const data = await res.json();
      setInterestHistory(data.history || []);
    } catch (err) {
      console.error('fetchInterestHistory error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [authHeaders]);

  /**
   * Called right after audio transcription succeeds.
   * Saves transcript + AI career suggestions → returns the new DB _id.
   */
  const saveNewSearch = useCallback(async (
    transcript: string,
    careers: CareerSuggestion[]
  ): Promise<string | null> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/interest-history`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ transcript, careers }),
      });
      const data = await res.json();
      const newId = data.historyId;
      setActiveHistoryId(newId);

      // Optimistically add to local list
      const optimistic: InterestEntry = {
        _id: newId,
        transcript,
        careers,
        selectedCareer: null,
        courses: [],
        jobs: [],
        roadmap: [],
        completedCourses: [],
        appliedJobs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInterestHistory(prev => [optimistic, ...prev]);

      return newId;
    } catch (err) {
      console.error('saveNewSearch error:', err);
      return null;
    }
  }, [authHeaders]);

  /**
   * Called after user selects a career and courses/jobs are fetched.
   * Persists the selected career + resources to the existing history entry.
   */
  const updateSearchWithCareer = useCallback(async (
    historyId: string,
    selectedCareer: CareerSuggestion,
    courses: any[],
    jobs: any[],
    roadmap: any[]
  ) => {
    try {
      const headers = await authHeaders();
      await fetch(`${API_BASE}/interest-history/${historyId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ selectedCareer, courses, jobs, roadmap }),
      });

      // Update local state
      setInterestHistory(prev =>
        prev.map(e =>
          e._id === historyId
            ? { ...e, selectedCareer, courses, jobs, roadmap }
            : e
        )
      );
    } catch (err) {
      console.error('updateSearchWithCareer error:', err);
    }
  }, [authHeaders]);

  /**
   * Called when user marks a course done / job applied / roadmap step toggled.
   */
  const updateProgress = useCallback(async (
    historyId: string,
    fields: { completedCourses?: string[]; appliedJobs?: string[]; roadmap?: any[] }
  ) => {
    try {
      const headers = await authHeaders();
      await fetch(`${API_BASE}/interest-history/${historyId}/progress`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(fields),
      });

      setInterestHistory(prev =>
        prev.map(e => e._id === historyId ? { ...e, ...fields } : e)
      );
    } catch (err) {
      console.error('updateProgress error:', err);
    }
  }, [authHeaders]);

  /** Deletes a history entry from DB and local state */
  const deleteHistoryEntry = useCallback(async (historyId: string) => {
    try {
      const headers = await authHeaders();
      await fetch(`${API_BASE}/interest-history/${historyId}`, {
        method: 'DELETE',
        headers,
      });
      setInterestHistory(prev => prev.filter(e => e._id !== historyId));
      if (activeHistoryId === historyId) setActiveHistoryId(null);
    } catch (err) {
      console.error('deleteHistoryEntry error:', err);
    }
  }, [authHeaders, activeHistoryId]);

  /**
   * Restores a past InterestEntry into the current SavedCareer so the
   * user can pick up exactly where they left off.
   */
  const resumeFromHistory = useCallback((entry: InterestEntry) => {
    setActiveHistoryId(entry._id);
    if (entry.selectedCareer) {
      setSavedCareer({
        title: entry.selectedCareer.title,
        selectedAt: entry.createdAt,
        roadmap: entry.roadmap || [],
        completedCourses: entry.completedCourses,
        appliedJobs: entry.appliedJobs,
        courses: entry.courses || [],
        jobs: entry.jobs || [],
        transcript: entry.transcript,
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{
      profile,
      savedCareer,
      interestHistory,
      activeHistoryId,
      historyLoading,
      setProfile,
      setSavedCareer,
      updateRoadmapStep,
      addCompletedCourse,
      addAppliedJob,
      clearData,
      fetchInterestHistory,
      saveNewSearch,
      updateSearchWithCareer,
      updateProgress,
      deleteHistoryEntry,
      resumeFromHistory,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used inside UserProvider');
  return ctx;
}