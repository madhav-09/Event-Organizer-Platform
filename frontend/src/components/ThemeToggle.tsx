import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
      } ${className}`}
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-slate-700" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      <div className="flex justify-between items-center h-full px-2">
        <Sun className={`w-3.5 h-3.5 ${theme === "dark" ? "text-slate-500" : "opacity-0"}`} />
        <Moon className={`w-3.5 h-3.5 ${theme === "light" ? "text-slate-400" : "opacity-0"}`} />
      </div>
    </button>
  );
}
