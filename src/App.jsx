import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const TopicWisePage = lazy(() => import("./pages/TopicWisePage.jsx"));
const QuizPage = lazy(() => import("./pages/QuizPage.jsx"));
const RevisionPage = lazy(() => import("./pages/RevisionPage.jsx"));
const ResultPage = lazy(() => import("./pages/ResultPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <div className="glass-panel rounded-lg px-5 py-4 text-sm">Loading workspace...</div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects/:subjectSlug/revision" element={<RevisionPage />} />
          <Route path="/subjects/:subjectSlug/topics" element={<TopicWisePage />} />
          <Route path="/subjects/:subjectSlug/topics/:setSlug" element={<QuizPage quizType="topic" />} />
          <Route path="/subjects/:subjectSlug/:stageSlug" element={<QuizPage quizType="stage" />} />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
