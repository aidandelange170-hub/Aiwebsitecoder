import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Gallery({ onLoadProject, goToEditor }) {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:4000/api/projects").then(res => setProjects(res.data));
  }, []);
  return (
    <div>
      <h2>Community Gallery</h2>
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            <b>{p.title}</b> by {p.author}{" "}
            <button onClick={async () => {
              const { data } = await axios.get(`http://localhost:4000/api/projects/${p.id}`);
              onLoadProject(data.html);
              goToEditor();
            }}>Load</button>
          </li>
        ))}
      </ul>
    </div>
  );
}