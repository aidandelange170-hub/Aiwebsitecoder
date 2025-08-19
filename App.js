import React, { useState, useEffect } from "react";
import Editor from "./components/Editor";
import Gallery from "./components/Gallery";
import MultiAICoder from "./components/MultiAICoder";
import TemplateGallery from "./components/TemplateGallery";
import ThemeSwitcher from "./components/ThemeSwitcher";
import SearchBar from "./components/SearchBar";
import "./App.css"; // Add CSS for better UI

const SECTIONS = [
  { key: "editor", label: "Editor", icon: "📝" },
  { key: "gallery", label: "Gallery", icon: "🖼️" },
  { key: "multiAI", label: "MultiAI", icon: "🤖" },
  { key: "templates", label: "Templates", icon: "📦" }
];

export default function App() {
  const [section, setSection] = useState("editor");
  const [editorHtml, setEditorHtml] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={`app-container theme-${theme}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>OurPlace</h1>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </div>
        <ul>
          {SECTIONS.map(s => (
            <li key={s.key} className={section === s.key ? "active" : ""}>
              <button onClick={() => setSection(s.key)}>
                <span className="icon">{s.icon}</span> {s.label}
              </button>
            </li>
          ))}
        </ul>
        <SearchBar />
      </aside>
      <main>
        {section === "editor" && <Editor initialHtml={editorHtml} />}
        {section === "gallery" && <Gallery onLoadProject={setEditorHtml} goToEditor={() => setSection("editor")} />}
        {section === "multiAI" && <MultiAICoder />}
        {section === "templates" && <TemplateGallery onPick={setEditorHtml} goToEditor={() => setSection("editor")} />}
      </main>
    </div>
  );
}