import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    modelId: String,
    output: String,
    latencyMs: Number,
    tokens: Number,

    userScores: {
      correctness: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const promptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    models: [String],
    responses: [responseSchema],
    versionTag: { type: String, default: "v1" },
  },
  { timestamps: true }
);

export default mongoose.model("Prompt", promptSchema);
