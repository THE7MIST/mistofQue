import { BarChart3, ChevronDown, LayoutDashboard, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { sidebarSubjects } from "../data/subjects.js";
import IconButton from "./ui/IconButton.jsx";

function navClass({ isActive }) {
  return `focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-teal-500 text-white shadow-sm shadow-teal-900/20"
      : "text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10"
  }`;
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const activeSubject = useMemo(
    () => sidebarSubjects.find((subject) => location.pathname.includes(`/subjects/${subject.slug}`))?.slug,
    [location.pathname]
  );
  const [openSubjects, setOpenSubjects] = useState(() => new Set(["cybersecurity"]));

  useEffect(() => {
    if (activeSubject) {
      setOpenSubjects((current) => new Set([...current, activeSubject]));
    }
  }, [activeSubject]);

  const toggleSubject = (subjectSlug) => {
    setOpenSubjects((current) => {
      const next = new Set(current);
      if (next.has(subjectSlug)) next.delete(subjectSlug);
      else next.add(subjectSlug);
      return next;
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white/90 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/90 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-500 text-lg font-black text-white shadow-sm shadow-teal-900/20">
                M
              </span>
              <div>
                <p className="text-base font-black tracking-normal text-slate-950 dark:text-white">MCQ Arena</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Exam practice</p>
              </div>
            </NavLink>
            <IconButton label="Close navigation" className="lg:hidden" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </div>

          <nav className="space-y-2 overflow-y-auto pr-1">
            <NavLink to="/dashboard" className={navClass} onClick={onClose}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/analytics" className={navClass} onClick={onClose}>
              <BarChart3 size={18} />
              Analytics
            </NavLink>

            <div className="pt-3">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Subjects
              </p>
              <div className="mt-2 space-y-1">
                {sidebarSubjects.map((subject) => {
                  const Icon = subject.icon;
                  const isExpanded = openSubjects.has(subject.slug);

                  return (
                    <div key={subject.slug}>
                      <button
                        type="button"
                        onClick={() => toggleSubject(subject.slug)}
                        className="focus-ring flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={18} />
                          {subject.name}
                        </span>
                        <ChevronDown size={17} className={`transition ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      <div
                        className={`grid transition-all duration-200 ${
                          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-white/10">
                            {subject.stages.slice(0, 1).map((stage) => (
                              <NavLink key={stage.slug} to={stage.path} className={navClass} onClick={onClose}>
                                {stage.label}
                              </NavLink>
                            ))}
                            <NavLink to={subject.topicsPath} className={navClass} onClick={onClose}>
                              Topic Wise MCQ
                            </NavLink>
                            {subject.revisionPath ? (
                              <NavLink to={subject.revisionPath} className={navClass} onClick={onClose}>
                                Revision
                              </NavLink>
                            ) : null}
                            {subject.stages.slice(1).map((stage) => (
                              <NavLink key={stage.slug} to={stage.path} className={navClass} onClick={onClose}>
                                {stage.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
