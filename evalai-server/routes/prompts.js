import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Prompt from "../models/Prompt.js";
import { callModel } from "../services/llm.js";

const router = express.Router();

// ==============================
// POST /api/prompts/run
// ==============================
router.post("/run", requireAuth, async (req, res) => {
  const { prompt, models } = req.body;

  try {
    const results = await Promise.all(
      models.map(async (modelId) => {
        try {
          const r = await callModel({ modelId, prompt });
          return {
            modelId,
            output: r.output,
            latencyMs: r.latencyMs,
            tokens: r.tokens,
          };
        } catch (err) {
          return {
            modelId,
            output: `Error calling ${modelId}: ${err.message}`,
            latencyMs: 0,
            tokens: 0,
          };
        }
      })
    );

    const saved = await Prompt.create({
      userId: req.userId,
      text: prompt,
      models,
      responses: results,
    });

    res.json({
      _id: saved._id,
      text: saved.text,
      models: saved.models,
      responses: saved.responses,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// POST /api/prompts/:id/rate
// ==============================
router.post("/:id/rate", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { modelId, field, value } = req.body;

  const prompt = await Prompt.findOne({ _id: id, userId: req.userId });
  if (!prompt)
    return res.status(404).json({ message: "Prompt not found" });

  const resp = prompt.responses.find((r) => r.modelId === modelId);
  if (!resp)
    return res.status(404).json({ message: "Response not found" });

  if (!resp.userScores) resp.userScores = { correctness: 0, clarity: 0 };
  resp.userScores[field] = value;

  await prompt.save();
  res.json({ message: "Saved", prompt });
});

// ==============================
// GET /api/prompts/rankings
// ==============================
router.get("/rankings", requireAuth, async (req, res) => {
  try {
    const prompts = await Prompt.find({ userId: req.userId }).lean();

    const scores = {};

    for (const p of prompts) {
      for (const r of p.responses) {
        if (!scores[r.modelId]) scores[r.modelId] = { total: 0, count: 0 };

        const c = r.userScores?.correctness ?? 0;
        const l = r.userScores?.clarity ?? 0;
        scores[r.modelId].total += c + l;
        scores[r.modelId].count += 1;
      }
    }

    const ranking = Object.entries(scores)
      .map(([modelId, s]) => ({
        modelId,
        avgScore: s.count ? s.total / s.count : 0,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
export default router;
