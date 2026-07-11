import { AlertTriangle, ArrowRight, BarChart3, BookOpenCheck, Clock3, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { subjects } from "../data/subjects.js";
import { loadQuizFile, loadTopicIndex } from "../services/quizService.js";
import { getLocalResults } from "../services/resultsService.js";
import { formatDuration, formatShortDate } from "../utils/time.js";

function averageScore(results) {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
}

async function getQuestionCount(file) {
  try {
    const quiz = await loadQuizFile(file);
    return quiz.questions?.length || 0;
  } catch {
    return 0;
  }
}

async function getSubjectCounts(subject) {
  const stageCounts = await Promise.all(
    subject.stages.map(async (stage) => ({
      label: stage.label,
      count: await getQuestionCount(stage.file)
    }))
  );

  let topicCount = 0;
  try {
    const topicIndex = await loadTopicIndex(subject.topicIndexFile);
    const topicCounts = await Promise.all(
      (topicIndex.sets || []).map((set) => getQuestionCount(`/data/${subject.slug}/topics/${set.slug}.json`))
    );
    topicCount = topicCounts.reduce((sum, count) => sum + count, 0);
  } catch {
    topicCount = 0;
  }

  return [
    stageCounts[0],
    { label: "Topic Wise MCQ", count: topicCount },
    ...stageCounts.slice(1)
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subjectCounts, setSubjectCounts] = useState({});
  const results = getLocalResults(user.email);
  const recentResults = results.slice(0, 5);
  const bestScore = results.reduce((best, result) => Math.max(best, result.score), 0);
  const totalTime = results.reduce((sum, result) => sum + result.elapsedSeconds, 0);

  useEffect(() => {
    let ignore = false;

    Promise.all(subjects.map(async (subject) => [subject.slug, await getSubjectCounts(subject)])).then((entries) => {
      if (!ignore) setSubjectCounts(Object.fromEntries(entries));
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Candidate dashboard"
        title={`Welcome, ${user.name || "Candidate"}`}
        description="Pick a subject, continue stage practice, or review your latest performance trends."
      />

      <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-100/80 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Notice: Some answer keys may contain mistakes. If you find a wrong answer, report it so it can be corrected.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attempts" value={results.length} icon={BookOpenCheck} detail="Saved on this device" tone="teal" />
        <StatCard label="Average" value={`${averageScore(results)}%`} icon={Target} detail="Across completed tests" tone="amber" />
        <StatCard label="Best Score" value={`${bestScore}%`} icon={BarChart3} detail="Highest result" tone="emerald" />
        <StatCard label="Practice Time" value={formatDuration(totalTime)} icon={Clock3} detail="Total focused time" tone="rose" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Subjects</h2>
            <Link to="/analytics" className="text-sm font-bold text-teal-700 hover:text-teal-600 dark:text-teal-300">
              Analytics
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              const primaryStage = subject.stages[0];

              return (
                <article
                  key={subject.slug}
                  className="rounded-lg border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-200">
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-950 dark:text-white">{subject.name}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{subject.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(subjectCounts[subject.slug] || [
                      { label: "Warm Up MCQ", count: "..." },
                      { label: "Topic Wise MCQ", count: "..." },
                      { label: "Quarter Final", count: "..." },
                      { label: "Semi Final", count: "..." },
                      { label: "Final Boss", count: "..." }
                    ]).map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
                      >
                        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{item.count}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={primaryStage.path}
                      className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      Warm up <ArrowRight size={16} />
                    </Link>
                    <Link
                      to={subject.topicsPath}
                      className="focus-ring inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      Topics
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Recent attempts</h2>
          <div className="mt-4 space-y-3">
            {recentResults.length ? (
              recentResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{result.subject}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{result.stage}</p>
                    </div>
                    <span className="rounded-lg bg-teal-500/12 px-2.5 py-1 text-sm font-black text-teal-700 dark:text-teal-200">
                      {result.score}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{formatShortDate(result.completedAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                No attempts yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
