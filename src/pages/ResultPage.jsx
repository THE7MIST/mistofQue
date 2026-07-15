import { BarChart3, Clock3, Target, XCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ResultReviewItem from "../components/ResultReviewItem.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { getLastResult } from "../services/resultsService.js";
import { formatDuration } from "../utils/time.js";

function performanceTone(score) {
  if (score >= 85) return "success";
  if (score >= 60) return "accent";
  return "warning";
}

function performanceLabel(score) {
  if (score >= 85) return "Mastery range";
  if (score >= 60) return "Passed";
  return "Needs review";
}

export default function ResultPage() {
  const location = useLocation();
  const result = location.state?.result || getLastResult();

  if (!result) {
    return (
      <>
        <PageHeader
          eyebrow="Result"
          title="No result available"
          description="Complete a quiz to generate a detailed result review."
          actions={
            <Link to="/dashboard">
              <Button>Back to dashboard</Button>
            </Link>
          }
        />
        <EmptyState
          icon={BarChart3}
          title="No result report yet"
          description="Submit a quiz to generate score, weak areas, and review guidance."
          actionLabel="Back to dashboard"
          to="/dashboard"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={result.subject}
        title="Performance Report"
        description={`${result.title} completed with ${result.correct} correct answers out of ${result.totalQuestions}.`}
        actions={
          <>
            <Link to="/analytics">
              <Button variant="secondary">Analytics</Button>
            </Link>
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="glass-panel rounded-lg p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Final score</p>
              <p className="metric-number mt-2 text-6xl">{result.score}%</p>
            </div>
            <StatusBadge tone={performanceTone(result.score)}>{performanceLabel(result.score)}</StatusBadge>
          </div>
          <div className="mt-5">
            <ProgressBar value={result.score} label="Score percentage" />
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
            {result.score >= 85
              ? "Strong performance. Review explanations to lock in edge cases."
              : result.score >= 60
                ? "Good base. Focus on weak topics before the next timed attempt."
                : "Revisit the weak areas, then retry the set in a focused session."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total" value={result.totalQuestions} icon={BarChart3} tone="teal" />
          <StatCard label="Correct" value={result.correct} icon={Target} tone="emerald" />
          <StatCard label="Wrong" value={result.wrong} icon={XCircle} tone="rose" />
          <StatCard label="Time" value={formatDuration(result.elapsedSeconds)} icon={Clock3} tone="amber" />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.4fr]">
        <div className="glass-panel h-fit rounded-lg p-4 sm:p-5">
          <SectionHeader eyebrow="Improve next" title="Weak-area insight" />
          <div className="mt-4 space-y-3">
            {result.weakAreas.length ? (
              result.weakAreas.map((area) => (
                <div key={area.name} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{area.name}</p>
                    <StatusBadge tone="warning">{area.count}</StatusBadge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Target} title="No weak areas detected" description="This attempt did not record repeated topic misses." />
            )}
          </div>
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            Recommendation: revise the top weak topic first, then retake the same set in Focus Mode.
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <SectionHeader eyebrow="Answer audit" title="Detailed review" description="Compare your response with the correct answer and explanation." />
          <div className="mt-4 space-y-4">
            {result.review.map((item, index) => (
              <ResultReviewItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
