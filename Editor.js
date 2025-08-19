// ...existing imports...
import React, { useState, useEffect } from "react";
import axios from "axios";
import ModelSelector, { CODE_MODELS } from "./ModelSelector";

export default function Editor({ initialHtml }) {
  // ...existing state...
  const [aiDescription, setAIDescription] = useState("");
  const [aiTags, setAITags] = useState([]);
  const [previewId, setPreviewId] = useState(null);

  // ...existing logic...

  async function handlePublish() {
    if (!title || !author || !html) {
      setStatus("Title, author, and code required.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:4000/api/projects", {
        title, author, html
      });
      setPublishId(res.data.id);
      setStatus("Project published!");

      // Fetch AI description & tags
      const ai = await axios.post("http://localhost:4000/api/ai/describe", { html });
      setAIDescription(ai.data.description);
      setAITags(ai.data.tags);

      // Generate instant preview link
      setPreviewId(res.data.id);
    } catch (e) {
      setStatus("Publish error.");
    }
  }

  return (
    <div>
      {/* ...existing UI code... */}
      {aiDescription && (
        <div className="ai-description">
          <b>AI Description:</b> {aiDescription}
          <br />
          <b>Tags:</b> {aiTags.join(", ")}
        </div>
      )}
      {previewId && (
        <div className="preview-link">
          <b>Preview Link:</b>{" "}
          <a
            href={`http://localhost:4000/api/preview/${previewId}`}
            target="_blank"
            rel="noopener noreferrer"
          >Open Live Preview</a>
        </div>
      )}
      {/* ...rest unchanged... */}
    </div>
  );
}