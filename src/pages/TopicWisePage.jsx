import { ArrowRight, Layers3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { getSubject } from "../data/subjects.js";
import { loadTopicIndex } from "../services/quizService.js";

export default function TopicWisePage() {
  const { subjectSlug } = useParams();
  const subject = getSubject(subjectSlug);
  const [topics, setTopics] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;
    setStatus("loading");

    if (!subject) {
      setStatus("error");
      return () => {
        ignore = true;
      };
    }

    loadTopicIndex(subject.topicIndexFile)
      .then((data) => {
        if (!ignore) {
          setTopics(data.sets || []);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [subject]);

  if (!subject) {
    return (
      <PageHeader
        eyebrow="Topic practice"
        title="Subject not found"
        description="Choose another subject from the sidebar."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={subject.name}
        title="Topic Wise MCQ"
        description="Select a focused set to practice one concept at a time."
      />

      <div className="glass-panel overflow-hidden rounded-lg">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-white/10 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-200">
              <Layers3 size={20} />
            </span>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{subject.name} topic sets</h2>
          </div>
        </div>

        {status === "loading" ? (
          <div className="p-5">
            <EmptyState icon={Layers3} title="Loading topic sets" description="Reading the topic index for this subject." />
          </div>
        ) : status === "error" ? (
          <div className="p-5">
            <EmptyState icon={Layers3} title="Topic data unavailable" description="Choose another subject or check the topic index file." to="/dashboard" actionLabel="Back to dashboard" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-white/10">
              <thead className="bg-slate-100/70 text-xs uppercase tracking-[0.16em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-bold sm:px-5">Set Number</th>
                  <th className="px-4 py-3 font-bold sm:px-5">Topic</th>
                  <th className="px-4 py-3 text-right font-bold sm:px-5">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {topics.map((topic) => (
                  <tr key={topic.slug} className="transition hover:bg-slate-50/80 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-slate-950 dark:text-white sm:px-5">
                      {topic.setNumber}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:px-5">{topic.topic}</td>
                    <td className="px-4 py-4 text-right sm:px-5">
                      <Link
                        to={`/subjects/${subject.slug}/topics/${topic.slug}`}
                        className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-bold text-white transition hover:bg-teal-600 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                      >
                        Start <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
