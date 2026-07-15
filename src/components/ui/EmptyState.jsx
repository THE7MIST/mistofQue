import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction, to, className = "" }) {
  const content = (
    <Button variant="secondary" onClick={onAction}>
      {actionLabel}
    </Button>
  );

  return (
    <div className={`rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-5 text-center dark:border-white/15 dark:bg-white/[0.03] ${className}`}>
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-200">
        <Icon size={22} />
      </span>
      <h3 className="mt-3 text-base font-black text-slate-950 dark:text-white">{title}</h3>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p> : null}
      {actionLabel ? (
        <div className="mt-4">
          {to ? (
            <Link to={to} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
              {actionLabel}
            </Link>
          ) : content}
        </div>
      ) : null}
    </div>
  );
}
