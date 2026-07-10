export default function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/75 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
