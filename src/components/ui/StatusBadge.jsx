import { CheckCircle2, CircleAlert, CircleDot, Trophy, XCircle } from "lucide-react";

const styles = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  accent: "bg-teal-500/12 text-teal-800 dark:text-teal-100",
  success: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-100",
  warning: "bg-amber-500/14 text-amber-800 dark:text-amber-100",
  danger: "bg-rose-500/12 text-rose-800 dark:text-rose-100"
};

const icons = {
  neutral: CircleDot,
  accent: CircleDot,
  success: CheckCircle2,
  warning: CircleAlert,
  danger: XCircle,
  mastered: Trophy
};

export default function StatusBadge({ tone = "neutral", children, className = "" }) {
  const Icon = icons[tone] || icons.neutral;
  const style = styles[tone] || styles.neutral;

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${style} ${className}`}>
      <Icon size={13} />
      {children}
    </span>
  );
}
