import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PromptForm from "../components/PromptForm";
import ModelComparisonGrid from "../components/ModelComparisonGrid";
import { PromptResult, ModelRanking } from "../types";
import "./Dashboard.css";

export default function Dashboard() {
  const [history, setHistory] = useState<PromptResult[]>([]);
  const [rankings, setRankings] = useState<ModelRanking[]>([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const loadRankings = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await axiosClient.get("/prompts/rankings", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const BLOCKED_MODELS = [
    "mistral",
    "mistral-7b",
    "mistral-medium",
    "minimax-m2",
    "minimax",
    "gpt-4.1"
  ];

  const filtered = res.data.filter(
    (r: ModelRanking) => !BLOCKED_MODELS.includes(r.modelId)
  );

  setRankings(filtered);
  };

  useEffect(() => {
    loadRankings();
  }, []);

  useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await axiosClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserName(res.data.name);
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  loadUser();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dash-container">
      <div className="leaderboard">
        <h3>🏆 Model Leaderboard</h3>
        <ul>
          {rankings.map((r, i) => (
            <li key={i}>
              <span className="rank-number">{i + 1}</span>
              <span className="rank-model">{r.modelId}</span>
              <span className="rank-score">{r.avgScore.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-content">
        <header className="dash-topbar">
          <div className="dash-logo">
            <span className="logo-circle">E</span>
            <span className="logo-text">EvalAI</span>
          </div>

          <div className="dash-user">
            <span className="dash-welcome">Welcome, {userName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>


        <PromptForm
            onResults={(result) => {
              setHistory((prev) => [result, ...prev]);
              loadRankings();
            }}
        />

        <div className="results-section">
          {history.map((item) => (
              <div key={item._id} className="history-entry">
                <div className="prompt-box">
                <strong>Prompt:</strong>
                <p>{item.text}</p>
              </div>

              <ModelComparisonGrid
                result={item}
                onScoreUpdate={loadRankings}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
