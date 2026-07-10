import { BarChart3, Clock3, Target, XCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ResultReviewItem from "../components/ResultReviewItem.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { getLastResult } from "../services/resultsService.js";
import { formatDuration } from "../utils/time.js";

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
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={result.subject}
        title={`${result.score}% Score`}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Percentage" value={`${result.score}%`} icon={Target} tone="teal" />
        <StatCard label="Total" value={result.totalQuestions} icon={BarChart3} tone="indigo" />
        <StatCard label="Correct" value={result.correct} icon={Target} tone="emerald" />
        <StatCard label="Wrong" value={result.wrong} icon={XCircle} tone="rose" />
        <StatCard label="Time" value={formatDuration(result.elapsedSeconds)} icon={Clock3} tone="amber" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.4fr]">
        <div className="glass-panel h-fit rounded-lg p-4 sm:p-5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Weak Areas</h2>
          <div className="mt-4 space-y-3">
            {result.weakAreas.length ? (
              result.weakAreas.map((area) => (
                <div key={area.name} className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{area.name}</p>
                    <span className="rounded-full bg-amber-500/14 px-2.5 py-1 text-xs font-black text-amber-700 dark:text-amber-200">
                      {area.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                No weak areas detected in this attempt.
              </p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Detailed review</h2>
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
