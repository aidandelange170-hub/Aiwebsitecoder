import React from "react";
export default function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  );
}