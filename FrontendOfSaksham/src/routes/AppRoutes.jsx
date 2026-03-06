import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Onboarding from "../pages/Onboarding";
import ProfileSetup from "../pages/ProfileSetup";
import Dashboard from "../pages/Dashboard";
import Skills from "../pages/Skills";
import Course from "../pages/Course";
import Lesson from "../pages/Lesson";
import Quiz from "../pages/Quiz";
import Jobs from "../pages/Jobs";
import JobDetail from "../pages/JobDetail";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/learn/:id" element={<Course />} />
          <Route path="/learn/:id/lesson/:lessonId" element={<Lesson />} />
          <Route path="/learn/:id/quiz/:quizId" element={<Quiz />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}