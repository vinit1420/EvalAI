import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  preferences: {
    // later: { creativity: 4, conciseness: 5, ... }
    type: Object,
    default: {}
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
