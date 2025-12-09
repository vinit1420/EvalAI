import "./ModelComparisonGrid.css";
import axiosClient from "../api/axiosClient";
import { PromptResult, ModelResponse } from "../types";
import { useState } from "react";

interface Props {
  result: PromptResult;
  onScoreUpdate?: () => void;
}

export default function ModelComparisonGrid({ result, onScoreUpdate }: Props) {
  // Track unsaved slider values for each model
  const [pendingScores, setPendingScores] = useState<{
    [modelId: string]: { correctness: number; clarity: number; changed: boolean };
  }>({});

  // Handle slider change (does not save yet)
  const updateSlider = (
    modelId: string,
    field: "correctness" | "clarity",
    value: number
  ) => {
    const existing = result.responses.find((r) => r.modelId === modelId);

    setPendingScores((prev) => ({
      ...prev,
      [modelId]: {
        correctness:
          field === "correctness"
            ? value
            : prev[modelId]?.correctness ??
              existing?.userScores?.correctness ??
              0,
        clarity:
          field === "clarity"
            ? value
            : prev[modelId]?.clarity ??
              existing?.userScores?.clarity ??
              0,
        changed: true,
      },
    }));
  };

  // Save scores to backend
  const submitScores = async (resp: ModelResponse) => {
    const modelId = resp.modelId;
    const pending = pendingScores[modelId];

    const correctness =
      pending?.correctness ?? resp.userScores?.correctness ?? 0;
    const clarity = pending?.clarity ?? resp.userScores?.clarity ?? 0;

    // Save correctness
    await axiosClient.post(
      `/prompts/${result._id}/rate`,
      {
        modelId,
        field: "correctness",
        value: correctness,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Save clarity
    await axiosClient.post(
      `/prompts/${result._id}/rate`,
      {
        modelId,
        field: "clarity",
        value: clarity,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Reset changed flag so button disables
    setPendingScores((prev) => ({
      ...prev,
      [modelId]: {
        correctness,
        clarity,
        changed: false,
      },
    }));

    if (onScoreUpdate) onScoreUpdate();
  };

  return (
    <div className="mcg-grid">
      {result.responses.map((resp: ModelResponse) => {
        const modelId = resp.modelId;

        const savedScores = resp.userScores ?? {
          correctness: 0,
          clarity: 0,
        };

        const pending = pendingScores[modelId];
        const correctness = pending?.correctness ?? savedScores.correctness;
        const clarity = pending?.clarity ?? savedScores.clarity;

        return (
          <div key={modelId} className="mcg-card">
            <h4 className="mcg-title">{modelId}</h4>

            <div className="mcg-output">{resp.output}</div>

            <div className="mcg-sliders">
              <label>
                Correctness: {correctness}
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={correctness}
                  onChange={(e) =>
                    updateSlider(modelId, "correctness", Number(e.target.value))
                  }
                />
              </label>

              <label>
                Clarity: {clarity}
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={clarity}
                  onChange={(e) =>
                    updateSlider(modelId, "clarity", Number(e.target.value))
                  }
                />
              </label>

              <button
                className="rating-submit-btn"
                disabled={!pendingScores[modelId]?.changed}
                onClick={() => submitScores(resp)}
              >
                Submit Rating
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
