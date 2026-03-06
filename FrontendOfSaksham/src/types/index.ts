// ─── Existing types (unchanged) ──────────────────────────────────────────────

export interface Career {
  title: string;
  type: string;
  description: string;
}

export interface Course {
  title: string;
  platform: string;
  url: string;
  level: string;
}

export interface JobPlatform {
  name: string;
  url: string;
  type: string;
  tip: string;
}

export interface TranscribeResponse {
  transcript: string;
  careers: Career[];
}

export interface CoursesResponse {
  courses: Course[];
}

export interface JobsResponse {
  platforms: JobPlatform[];
}

export interface ChatResponse {
  message: string;
  history: ChatMessage[];
  newCourses?: Course[];
  newCareers?: Career[];
  newJobs?: JobPlatform[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── New types ────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  education: string;   // "10th Pass" | "12th Pass" | "Graduate" | "Post Graduate" | "Dropout"
  city: string;
  languages: string[];
  goal: string;        // "job" | "freelance" | "both"
  completedOnboarding: boolean;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skillsToLearn: string[];
  estimatedWeeks: number;
  completed: boolean;
}

export interface SavedCareer {
  title: string;
  selectedAt: string;          // ISO date string
  roadmap: RoadmapStep[];
  completedCourses: string[];  // course titles marked done
  appliedJobs: string[];       // job platform names marked applied
  courses: Course[];           // saved from CareerGuidePage
  jobs: JobPlatform[];         // saved from CareerGuidePage
  transcript: string;          // what user said — for chatbot context
}