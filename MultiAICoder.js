import React, { useState } from "react";
import axios from "axios";
import ModelSelector, { CODE_MODELS } from "./ModelSelector";

export default function MultiAICoder({ onPublish }) {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("");
  const [selectedModel, setSelectedModel] = useState(CODE_MODELS[0].key);

  async function handleGenerate() {
    setStatus("Generating code...");
    try {
      const res = await axios.post("http://localhost:4000/api/ai/generate-multiai-code", {
        prompt,
        model: selectedModel
      });
      setCode(res.data.code);
      setStatus("Done!");
    } catch {
      setStatus("Generation error.");
    }
  }

  // ...rest unchanged, just add ModelSelector UI below...

  return (
    <div style={{ padding: 16 }}>
      <h2>MultiAI Model Lab</h2>
      <p>Combine the power of all our AI coders! Generate, edit, download, or publish your project.</p>
      <input
        type="text"
        placeholder="Describe your project..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <ModelSelector selected={selectedModel} onChange={setSelectedModel} />
      <button onClick={handleGenerate}>Generate with MultiAI</button>
      {/* ...rest unchanged... */}
      <textarea
        style={{ width: "100%", height: 200, marginTop: 8, fontFamily: "monospace" }}
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Your code will appear here"
      />
      {/* ...rest unchanged... */}
    </div>
  );
}