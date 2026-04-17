const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const app  = express();
const PORT = 5000;

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ── MONGODB CONNECTION ──────────────────────────────────────────────────────
const MONGO_URL =
  "mongodb+srv://subashree72003_db_user:Subashreebts123@glowwelldb.icorru.mongodb.net/glowwellDB?retryWrites=true&w=majority&appName=GlowWellDB";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

// ── SCHEMAS ─────────────────────────────────────────────────────────────────

// JOURNAL
const journalSchema = new mongoose.Schema(
  {
    text:     { type: String, required: true },
    category: { type: String, default: "Daily" },
    mood:     { type: String, default: "😊" },
    date:     { type: String },
    time:     { type: String },
    words:    { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Journal = mongoose.model("Journal", journalSchema);

// MOOD
const moodSchema = new mongoose.Schema(
  {
    mood: { type: String, required: true },
    time: { type: String },
  },
  { timestamps: true }
);
const Mood = mongoose.model("Mood", moodSchema);

// GRATITUDE
const gratitudeSchema = new mongoose.Schema(
  {
    note:     { type: String, required: true },
    emoji:    { type: String, default: "🌸" },
    category: { type: String, default: "Personal" },
    private:  { type: Boolean, default: false },
    fav:      { type: Boolean, default: false },
    date:     { type: String },
    time:     { type: String },
  },
  { timestamps: true }
);
const Gratitude = mongoose.model("Gratitude", gratitudeSchema);

// ── ROOT ─────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "GlowWell Backend is running 💗", status: "ok" });
});

// ════════════════════════════════════════════════════════════════
//  JOURNAL ROUTES
// ════════════════════════════════════════════════════════════════

// GET all journal entries (newest first)
app.get("/api/journal", async (req, res) => {
  try {
    const entries = await Journal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (err) {
    console.error("GET /api/journal error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST — create new journal entry
app.post("/api/journal", async (req, res) => {
  try {
    const { text, category, mood, date, time, words } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const entry = new Journal({
      text:     text.trim(),
      category: category || "Daily",
      mood:     mood     || "😊",
      date:     date     || new Date().toLocaleDateString(),
      time:     time     || new Date().toLocaleTimeString(),
      words:    words    || text.trim().split(/\s+/).length,
    });

    const saved = await entry.save();
    console.log("✅ Journal saved:", saved._id);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("POST /api/journal error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT — edit journal entry
app.put("/api/journal/:id", async (req, res) => {
  try {
    const { text, category, mood } = req.body;
    const updated = await Journal.findByIdAndUpdate(
      req.params.id,
      {
        text:     text?.trim(),
        category,
        mood,
        words: text ? text.trim().split(/\s+/).length : undefined,
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: "Entry not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/journal error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE — delete journal entry
app.delete("/api/journal/:id", async (req, res) => {
  try {
    const deleted = await Journal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Entry not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/journal error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  MOOD ROUTES
// ════════════════════════════════════════════════════════════════

// GET all mood history
app.get("/api/mood", async (req, res) => {
  try {
    const moods = await Mood.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: moods });
  } catch (err) {
    console.error("GET /api/mood error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST — save mood
app.post("/api/mood", async (req, res) => {
  try {
    const { mood, time } = req.body;
    if (!mood) return res.status(400).json({ success: false, error: "Mood is required" });

    const entry = new Mood({ mood, time: time || new Date().toLocaleString() });
    const saved = await entry.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("POST /api/mood error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  GRATITUDE ROUTES
// ════════════════════════════════════════════════════════════════

// GET all gratitude entries
app.get("/api/gratitude", async (req, res) => {
  try {
    const entries = await Gratitude.find().sort({ createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (err) {
    console.error("GET /api/gratitude error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST — add gratitude
app.post("/api/gratitude", async (req, res) => {
  try {
    const { note, emoji, category, private: isPrivate, fav, date, time } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ success: false, error: "Note is required" });

    const entry = new Gratitude({
      note:     note.trim(),
      emoji:    emoji    || "🌸",
      category: category || "Personal",
      private:  !!isPrivate,
      fav:      !!fav,
      date:     date || new Date().toISOString().slice(0, 10),
      time:     time || new Date().toLocaleTimeString(),
    });
    const saved = await entry.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("POST /api/gratitude error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE — remove gratitude entry
app.delete("/api/gratitude/:id", async (req, res) => {
  try {
    const deleted = await Gratitude.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "Entry not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/gratitude error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── START SERVER ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 GlowWell Backend running on http://localhost:${PORT}`);
});