import { ArrowRight, LockKeyhole, Moon, ShieldCheck, Sun } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import IconButton from "../components/ui/IconButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function LoginPage() {
  const { isAuthenticated, isAuthenticating, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [passwordToken, setPasswordToken] = useState("");
  const [error, setError] = useState("");
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const response = await login({ email, passwordToken });
    if (!response.ok) {
      setError(response.message);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="absolute right-4 top-4">
        <IconButton label={isDark ? "Use light mode" : "Use dark mode"} onClick={toggleTheme}>
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </IconButton>
      </div>

      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel flex min-h-[26rem] flex-col justify-between rounded-lg p-6 sm:p-8">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
              <ShieldCheck size={25} />
            </div>
            <p className="eyebrow mt-6">Exam preparation platform</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">MCQ Arena</h1>
            <p className="mt-3 max-w-md text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
              Focused practice, revision, analytics, and performance review for technical exam preparation.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {["Timed", "Tracked", "Review"].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-sm font-black text-slate-900 dark:text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-lg p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/14 text-amber-700 dark:text-amber-200">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Candidate login</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email and password token</p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
            <input
              className="focus-ring mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 transition placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@gmail.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password token</span>
            <input
              className="focus-ring mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 transition placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              type="password"
              value={passwordToken}
              onChange={(event) => setPasswordToken(event.target.value)}
              placeholder="abc123"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={isAuthenticating}>
            {isAuthenticating ? "Checking..." : "Enter platform"}
            <ArrowRight size={18} />
          </Button>

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Local preview: demo@mcqarena.dev / demo123
          </p>
        </form>
      </section>
    </main>
  );
}
