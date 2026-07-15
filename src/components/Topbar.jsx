import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import IconButton from "./ui/IconButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const pageContext = location.pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.replaceAll("-", " "))
    .join(" / ") || "dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <IconButton label="Open navigation" onClick={onMenuClick} className="lg:hidden">
            <Menu size={20} />
          </IconButton>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">MCQ Arena</p>
            <p className="max-w-[14rem] truncate text-sm font-black capitalize text-slate-900 dark:text-white sm:max-w-md">
              {pageContext}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden border-r border-slate-200 pr-3 text-right dark:border-white/10 sm:block">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Signed in</p>
            <p className="max-w-[14rem] truncate text-sm font-black text-slate-900 dark:text-white">{user?.email}</p>
          </div>
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
