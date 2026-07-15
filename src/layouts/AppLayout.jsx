import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { FocusModeProvider, useFocusMode } from "../context/FocusModeContext.jsx";

function AppLayoutShell() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { isFocusMode } = useFocusMode();

  return (
    <div className="min-h-screen text-slate-950 dark:text-slate-100">
      {!isFocusMode && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className={`min-h-screen ${isFocusMode ? "" : "lg:pl-72"}`}>
        {!isFocusMode && <Topbar onMenuClick={() => setSidebarOpen(true)} />}
        <main className={`mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 ${isFocusMode ? "max-w-5xl" : "max-w-7xl"}`}>
          <div className="route-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <FocusModeProvider>
      <AppLayoutShell />
    </FocusModeProvider>
  );
}
