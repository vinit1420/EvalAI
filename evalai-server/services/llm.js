// evalai-server/services/llm.js
import axios from "axios";

const OPENAI_BASE = "https://api.openai.com/v1/chat/completions";
const AIMLAPI_BASE = "https://api.aimlapi.com/v1/chat/completions";

/**
 * CLEAN MODEL NAMES USED BY FRONTEND
 * These map to real provider/model IDs
 */
export const MODEL_MAP = {
  // ------------------------------------------
  // OPENAI MODELS
  // ------------------------------------------
  "gpt-4o": { provider: "openai", model: "gpt-4o" },
  "gpt-4o-mini": { provider: "openai", model: "gpt-4o-mini" },

  // ------------------------------------------
  // AIMLAPI MODELS (FREE)
  // ------------------------------------------
  "deepseek-chat": {
    provider: "aimlapi",
    model: "deepseek/deepseek-chat"
  },
  "deepseek-chat-v3": {
    provider: "aimlapi",
    model: "deepseek/deepseek-chat-v3-0324"
  },
  "claude-3-haiku": {
    provider: "aimlapi",
    model: "anthropic/claude-3-haiku"
  },
  "gemini-2-flash": {
    provider: "aimlapi",
    model: "google/gemini-2.0-flash"
  },
  "llama3-70b": {
    provider: "aimlapi",
    model: "meta-llama/Llama-3-70b-chat-hf"
  },
  "nvidia-nemotron": {
    provider: "aimlapi",
    model: "nvidia/nemotron-nano-9b-v2"
  }
};

/**
 * UNIVERSAL MODEL CALL HANDLER
 */
export async function callModel({ modelId, prompt }) {
  const cfg = MODEL_MAP[modelId];

  if (!cfg) {
    return {
      modelId,
      output: `No provider configured for ${modelId}`,
      latencyMs: 0,
      tokens: 0
    };
  }

  const start = Date.now();

  try {
    // --------------------------------------------------
    // OPENAI MODELS
    // --------------------------------------------------
    if (cfg.provider === "openai") {
      const res = await axios.post(
        OPENAI_BASE,
        {
          model: cfg.model,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      const end = Date.now();

      return {
        modelId,
        output: res.data.choices[0].message.content,
        latencyMs: end - start,
        tokens: res.data.usage?.total_tokens ?? 0
      };
    }

    // --------------------------------------------------
    // AIMLAPI MODELS (FREE)
    // --------------------------------------------------
    if (cfg.provider === "aimlapi") {
      const res = await axios.post(
        AIMLAPI_BASE,
        {
          model: cfg.model, // EXACT model string like deepseek/deepseek-chat
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.AIMLAPI_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const end = Date.now();

      return {
        modelId,
        output: res.data.choices[0].message.content,
        latencyMs: end - start,
        tokens: res.data.usage?.total_tokens ?? 0
      };
    }
  } catch (err) {
    const end = Date.now();

    const msg =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message;

    console.error(`[${modelId}] provider error:`, msg);

    return {
      modelId,
      output: `Error calling ${modelId}: ${msg}`,
      latencyMs: end - start,
      tokens: 0
    };
  }
}
