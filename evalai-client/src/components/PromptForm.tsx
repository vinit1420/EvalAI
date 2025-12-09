// src/components/PromptForm.tsx
import { useState, FormEvent, ChangeEvent } from "react";
import axiosClient from "../api/axiosClient";
import { PromptResult } from "../types";
import "./PromptForm.css";

interface PromptFormProps {
  onResults: (result: PromptResult) => void;
}

const MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "deepseek-chat",
  "deepseek-chat-v3",
  "claude-3-haiku",
  "gemini-2-flash",
  "llama3-70b",
  "nvidia-nemotron"
];

export default function PromptForm({ onResults }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((m) => m !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");

  if (!prompt.trim()) {
    setError("Please enter a prompt.");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const res = await axiosClient.post(
      "/prompts/run",
      {
        prompt,
        models: selectedModels,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    onResults(res.data);
    setPrompt(""); // clear prompt box
  } catch (err: any) {
    setError("Error running comparison.");
    console.log(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <label className="prompt-label">Enter Prompt Here:</label>

      <textarea
        className="prompt-textbox"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your question..."
      />

      <div className="models">
        {MODELS.map((m) => (
          <label key={m} className="model-chip">
            <input
              type="checkbox"
              checked={selectedModels.includes(m)}
              onChange={() => toggleModel(m)}
            />
            {m}
          </label>
        ))}
      </div>

      {error && <p className="prompt-error">{error}</p>}

      <button className="compare-btn" type="submit" disabled={loading}>
        {loading ? "Comparing..." : "Compare"}
      </button>
    </form>
  );
}
