import React from "react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen pt-20 bg-base-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold">Theme Settings</h2>
            <p className="text-base-content/70">
              Customize your chat interface with over 30 beautiful themes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`group flex flex-col gap-1.5 p-3 rounded-lg border transition-all duration-200
                  ${theme === t ? "border-primary bg-base-300 ring-2 ring-primary/30" : "border-base-300 hover:border-primary/50 hover:bg-base-300/50"}
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-16 w-full rounded-md overflow-hidden bg-base-100" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-base-content/80 text-left px-1">
                  {t}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
