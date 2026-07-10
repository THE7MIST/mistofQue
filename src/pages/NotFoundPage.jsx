import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="glass-panel max-w-lg rounded-lg p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">404</p>
        <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">The requested route is not available.</p>
        <Link to="/dashboard" className="mt-6 inline-flex">
          <Button>Back to dashboard</Button>
        </Link>
      </section>
    </main>
  );
}
