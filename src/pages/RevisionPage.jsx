import { CheckCircle2, Circle, Download, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import RevisionAudioPlayer from "../components/RevisionAudioPlayer.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSubject } from "../data/subjects.js";
import { getRevisionProgress, loadRevisionIndex, loadRevisionPhase, resolveRevisionAssetPath, saveRevisionPhaseProgress } from "../services/revisionService.js";

function ListBlock({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RevisionItem({ item }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="text-base font-black text-slate-950 dark:text-white">{item.title}</h3>
      {item.definition ? <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{item.definition}</p> : null}
      <div className="mt-4 grid gap-4">
        <ListBlock title="Key Points" items={item.keyPoints || item.examPoints} />
        <ListBlock title="Comparisons" items={item.comparisons} />
        <ListBlock title="Commands" items={item.commands} />
        <ListBlock title="Workflows" items={item.workflows} />
        <ListBlock title="One-Liners" items={item.oneLiners} />
      </div>
    </article>
  );
}

function SectionBlock({ section }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="border-b border-slate-200 pb-3 dark:border-white/10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">{section.terms?.length || 0} terms</p>
        <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{section.title}</h3>
        {section.description ? <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{section.description}</p> : null}
      </div>
      <div className="divide-y divide-slate-200 dark:divide-white/10">
        {(section.terms || []).map((term) => (
          <div key={term.id} className="py-4 first:pt-4 last:pb-0">
            <h4 className="text-base font-black text-slate-950 dark:text-white">{term.title}</h4>
            {term.definition ? <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{term.definition}</p> : null}
            <ListBlock title="Meaning" items={term.keyPoints || term.examPoints} />
          </div>
        ))}
      </div>
    </section>
  );
}

function getItemCount(phase) {
  if (phase?.sections?.length) return phase.sections.reduce((total, section) => total + (section.terms?.length || 0), 0);
  return phase?.topics?.length || 0;
}

function DownloadResources({ downloads }) {
  if (!downloads?.length) return null;

  return (
    <div className="glass-panel rounded-lg p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-200">
          <Download size={20} />
        </span>
        <div>
          <p className="eyebrow">Download</p>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Revision Files</h2>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {downloads.map((item) => (
          <a
            key={item.id || item.file}
            href={resolveRevisionAssetPath(item.file)}
            download
            className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-soft dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-300/50"
          >
            <span className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
              <Download size={16} />
              {item.title}
            </span>
            {item.description ? <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">{item.description}</span> : null}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function RevisionPage() {
  const { subjectSlug } = useParams();
  const { user } = useAuth();
  const subject = getSubject(subjectSlug);
  const [index, setIndex] = useState(null);
  const [phase, setPhase] = useState(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    setProgress(getRevisionProgress(user.email, subjectSlug));

    loadRevisionIndex(subjectSlug)
      .then((data) => {
        if (ignore) return;
        setIndex(data);
        setPhaseIndex(0);
        setStatus("ready");
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [subjectSlug, user.email]);

  useEffect(() => {
    if (!index?.phases?.[phaseIndex]) return;
    let ignore = false;
    setPhase(null);

    loadRevisionPhase(index.phases[phaseIndex].file)
      .then((data) => {
        if (!ignore) setPhase(data);
      })
      .catch(() => {
        if (!ignore) setPhase({ ...index.phases[phaseIndex], topics: [] });
      });

    return () => {
      ignore = true;
    };
  }, [index, phaseIndex]);

  const phases = index?.phases || [];
  const currentProgress = phase ? progress[phase.id] || {} : {};
  const completedCount = phases.filter((item) => progress[item.id]?.completed).length;
  const progressPercent = phases.length ? Math.round((completedCount / phases.length) * 100) : 0;

  const phaseSummary = useMemo(() => `${completedCount}/${phases.length} phases complete`, [completedCount, phases.length]);

  function updatePhaseProgress(patch) {
    if (!phase) return;
    const next = saveRevisionPhaseProgress(user.email, subjectSlug, phase.id, patch);
    setProgress((current) => ({
      ...current,
      [phase.id]: next
    }));
  }

  if (!subject || status === "error") {
    return (
      <>
        <PageHeader eyebrow="Revision" title="Revision unavailable" description="Revision content is not configured for this subject yet." />
        <EmptyState
          icon={FileText}
          title="No revision content"
          description="Choose another subject or add revision index files for this subject."
          to="/dashboard"
          actionLabel="Back to dashboard"
        />
      </>
    );
  }

  if (status === "loading" || !index) {
    return (
      <>
        <PageHeader eyebrow="Revision" title="Loading revision" description="Preparing revision phases..." />
        <EmptyState icon={FileText} title="Preparing reader" description="Loading phase index and saved revision progress." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${subject.name} Revision`}
        title={phase?.title || index.title}
        description={`${phaseSummary}. Audio is optional; text revision works even when MP3 files are not present.`}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="glass-panel rounded-lg p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Study reader</p>
                <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{index.title}</h2>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{progressPercent}% complete</p>
              </div>
              <Button
                variant={currentProgress.completed ? "secondary" : "primary"}
                onClick={() => updatePhaseProgress({ completed: true, listenedSeconds: currentProgress.durationSeconds || 1, lastPosition: currentProgress.durationSeconds || 0 })}
              >
                <CheckCircle2 size={17} />
                Mark phase complete
              </Button>
            </div>
            <ProgressBar value={progressPercent} />
          </div>

          <DownloadResources downloads={index.downloads} />

          {phase ? (
            <>
              <RevisionAudioPlayer
                phase={phase}
                progress={currentProgress}
                onProgress={updatePhaseProgress}
                onPrevious={() => setPhaseIndex((value) => Math.max(0, value - 1))}
                onNext={() => setPhaseIndex((value) => Math.min(phases.length - 1, value + 1))}
                hasPrevious={phaseIndex > 0}
                hasNext={phaseIndex < phases.length - 1}
              />

              <div className="glass-panel rounded-lg p-4 sm:p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-200">
                    <FileText size={20} />
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">{phase.sections?.length ? "Terminology Packs" : "Topics"}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {phase.sections?.length ? `${phase.sections.length} packs - ${getItemCount(phase)} terms` : `${getItemCount(phase)} revision items`}
                    </p>
                  </div>
                </div>
                {phase.description ? (
                  <p className="mb-5 rounded-lg border border-teal-300/40 bg-teal-500/10 px-3 py-2 text-sm font-semibold leading-6 text-teal-900 dark:text-teal-100">
                    {phase.description}
                  </p>
                ) : null}

                <div className="space-y-4">
                  {phase.sections?.length
                    ? phase.sections.map((section) => <SectionBlock key={section.id} section={section} />)
                    : (phase.topics || []).map((topic) => <RevisionItem key={topic.id} item={topic} />)}
                </div>
              </div>
            </>
          ) : (
            <EmptyState icon={FileText} title="Loading phase" description="Preparing the selected revision section." />
          )}
        </div>

        <aside className="glass-panel h-fit rounded-lg p-4 xl:sticky xl:top-20">
          <SectionHeader eyebrow="Navigation" title="Phases" />
          <div className="mt-4 space-y-2">
            {phases.map((item, indexValue) => {
              const done = progress[item.id]?.completed;
              const active = indexValue === phaseIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPhaseIndex(indexValue)}
                  className={`focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition ${
                    active
                      ? "bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-950"
                      : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                  <span>{item.title}</span>
                  {done ? <StatusBadge tone="success" className="ml-auto hidden sm:inline-flex">Done</StatusBadge> : null}
                </button>
              );
            })}
          </div>
        </aside>
      </section>
    </>
  );
}
