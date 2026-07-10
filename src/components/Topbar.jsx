import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconButton from "./ui/IconButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <IconButton label="Open navigation" onClick={onMenuClick} className="lg:hidden">
            <Menu size={20} />
          </IconButton>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">MCQ Arena</p>
            <p className="max-w-[13rem] truncate text-sm font-semibold text-slate-900 dark:text-white sm:max-w-xs">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton label={isDark ? "Use light mode" : "Use dark mode"} onClick={toggleTheme}>
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <IconButton label="Log out" onClick={handleLogout}>
            <LogOut size={19} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
