import React, { useState, useEffect } from "react";
import "./Journal.css";

const API = "http://localhost:5000";

const PROMPTS = [
  "What made you smile today?",
  "What stressed you today and how did you handle it?",
  "What is something you are grateful for right now?",
  "What is a small win you achieved today?",
  "What emotion are you feeling the most lately?",
  "If you could restart today, what would you change?",
  "What is something you are proud of yourself for?",
  "What is draining your energy currently?",
  "If future you writes a letter to today you, what would it say?",
  "What is something you need to hear right now?",
];

const MOODS      = ["😊","😐","😔","😡","😴","🤩","🫠","😭","🧘","❤️"];
const CATEGORIES = ["Daily","Thoughts","Reflection","Gratitude","Stress","Goals","Memories"];

export default function Journal() {
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState("");
  const [category, setCategory] = useState("Daily");
  const [mood,     setMood]     = useState("😊");
  const [search,   setSearch]   = useState("");
  const [editId,   setEditId]   = useState(null);  // MongoDB _id of entry being edited
  const [editText, setEditText] = useState("");
  const [editMood, setEditMood] = useState("😊");
  const [editCat,  setEditCat]  = useState("Daily");
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState("");
  const [filterCat,setFilterCat]= useState("All");
  const [sortBy,   setSortBy]   = useState("newest");

  // ── HELPERS ──────────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  // ── LOAD ENTRIES FROM BACKEND ─────────────────────────────────────────────
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/journal`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      } else {
        console.error("Load failed:", data.error);
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error("Backend unreachable, loading from localStorage:", err.message);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem("gw_journal_v2") || "[]");
    setEntries(saved);
  };

  // ── ADD ENTRY ─────────────────────────────────────────────────────────────
  const addEntry = async () => {
    const trimmed = text.trim();
    if (!trimmed) { showToast("Write something first ✏️"); return; }
    if (saving) return;

    setSaving(true);

    const payload = {
      text:     trimmed,
      category,
      mood,
      date:  new Date().toLocaleDateString(),
      time:  new Date().toLocaleTimeString(),
      words: trimmed.split(/\s+/).length,
    };

    try {
      const res  = await fetch(`${API}/api/journal`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Server error");
      }

      const data = await res.json();
      if (data.success) {
        setEntries(prev => [data.data, ...prev]);
        setText("");
        showToast("Journal entry saved ✅");
      }
    } catch (err) {
      console.error("Save failed, using localStorage fallback:", err.message);
      // Fallback: save to localStorage with a local id
      const localEntry = { ...payload, _id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
      const updated = [localEntry, ...entries];
      setEntries(updated);
      localStorage.setItem("gw_journal_v2", JSON.stringify(updated));
      setText("");
      showToast("Saved locally (backend offline) 💾");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ENTRY ──────────────────────────────────────────────────────────
  const deleteEntry = async (entry) => {
    const id = entry._id?.toString();
    // Optimistic UI update
    setEntries(prev => prev.filter(e => (e._id?.toString() || e.id) !== id));

    if (id && !id.startsWith("local_")) {
      try {
        await fetch(`${API}/api/journal/${id}`, { method: "DELETE" });
        showToast("Entry deleted 🗑️");
      } catch (err) {
        console.error("Delete from backend failed:", err.message);
        showToast("Deleted locally");
      }
    } else {
      // Local-only entry
      const updated = entries.filter(e => (e._id?.toString() || e.id) !== id);
      localStorage.setItem("gw_journal_v2", JSON.stringify(updated));
      showToast("Entry deleted 🗑️");
    }
  };

  // ── OPEN EDIT ─────────────────────────────────────────────────────────────
  const openEdit = (entry) => {
    setEditId(entry._id?.toString() || entry.id);
    setEditText(entry.text);
    setEditMood(entry.mood || "😊");
    setEditCat(entry.category || "Daily");
  };

  // ── SAVE EDIT ─────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editText.trim()) return;
    const trimmed = editText.trim();

    // Optimistic update
    setEntries(prev => prev.map(e =>
      (e._id?.toString() || e.id) === editId
        ? { ...e, text: trimmed, mood: editMood, category: editCat, words: trimmed.split(/\s+/).length }
        : e
    ));
    setEditId(null);

    if (editId && !editId.startsWith("local_")) {
      try {
        await fetch(`${API}/api/journal/${editId}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ text: trimmed, mood: editMood, category: editCat }),
        });
        showToast("Entry updated ✅");
      } catch (err) {
        console.error("Edit backend sync failed:", err.message);
        showToast("Updated locally");
      }
    } else {
      showToast("Entry updated ✅");
    }
  };

  // ── GENERATE PROMPT ───────────────────────────────────────────────────────
  const generatePrompt = () => {
    const r = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setText(r + " ");
  };

  // ── FILTER + SORT ─────────────────────────────────────────────────────────
  const displayed = entries
    .filter(e => filterCat === "All" || e.category === filterCat)
    .filter(e => !search.trim() || e.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "words")  return (b.words || 0) - (a.words || 0);
      return 0;
    });

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="jRoot">

      {/* TOAST */}
      {toast && <div className="jToast">{toast}</div>}

      {/* HEADER */}
      <div className="jHeader">
        <div>
          <h1 className="jTitle">📝 Personal Journal</h1>
          <p className="jSub">Write freely. Heal gently. Grow beautifully 🌸</p>
        </div>
        <div className="jHeaderStats">
          <div className="jStatPill">📓 {entries.length} entries</div>
          <div className="jStatPill">📅 Today: {entries.filter(e => e.date === new Date().toLocaleDateString()).length}</div>
        </div>
      </div>

      {/* WRITE BOX */}
      <div className="jWriteCard">
        <h2 className="jWriteTitle">New Entry</h2>

        <div className="jMoodRow">
          {MOODS.map(m => (
            <button key={m} className={`jMoodBtn ${mood === m ? "active" : ""}`} onClick={() => setMood(m)}>{m}</button>
          ))}
        </div>

        <textarea
          className="jTextarea"
          placeholder="What's on your mind today? Write freely..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addEntry(); }}
        />

        <div className="jWordCount">{wordCount > 0 ? `${wordCount} words` : "Ctrl+Enter to save"}</div>

        <div className="jControls">
          <select className="jSelect" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="jPromptBtn" onClick={generatePrompt}>✨ Prompt</button>
          <button className="jSaveBtn" onClick={addEntry} disabled={saving}>
            {saving ? "Saving..." : "Save Entry 💾"}
          </button>
        </div>
      </div>

      {/* ENTRIES SECTION */}
      <div className="jEntriesSection">
        <div className="jEntriesHeader">
          <h2 className="jEntriesTitle">Your Journal</h2>
          <div className="jEntriesControls">
            <input className="jSearch" placeholder="🔍 Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="jSelect" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="jSelect" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="words">Most Words</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="jLoading">
            <div className="jSpinner" />
            <p>Loading your journal...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="jEmpty">
            <div className="jEmptyIcon">📓</div>
            <h3>No entries yet</h3>
            <p>Write your first journal entry above ✨</p>
          </div>
        ) : (
          <div className="jEntriesList">
            {displayed.map(e => {
              const id = e._id?.toString() || e.id;
              return (
                <div key={id} className="jEntryCard">
                  <div className="jEntryHeader">
                    <div className="jEntryMeta">
                      <span className="jEntryMood">{e.mood}</span>
                      <span className="jCatBadge">{e.category}</span>
                      <span className="jEntryDate">{e.date} · {e.time}</span>
                    </div>
                    <div className="jEntryActions">
                      <button className="jEditBtn"   onClick={() => openEdit(e)}>✏️ Edit</button>
                      <button className="jDeleteBtn" onClick={() => deleteEntry(e)}>🗑️</button>
                    </div>
                  </div>

                  <p className="jEntryText">{e.text}</p>

                  <div className="jEntryFooter">
                    <span className="jWordBadge">{e.words || 0} words</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editId && (
        <div className="jEditOverlay" onClick={() => setEditId(null)}>
          <div className="jEditModal" onClick={e => e.stopPropagation()}>
            <div className="jEditHeader">
              <h3>Edit Entry ✏️</h3>
              <button className="jModalClose" onClick={() => setEditId(null)}>✕</button>
            </div>

            <div className="jMoodRow" style={{ marginBottom: 12 }}>
              {MOODS.map(m => (
                <button key={m} className={`jMoodBtn ${editMood === m ? "active" : ""}`} onClick={() => setEditMood(m)}>{m}</button>
              ))}
            </div>

            <select className="jSelect" value={editCat} onChange={e => setEditCat(e.target.value)} style={{ marginBottom: 12, width: "100%" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <textarea
              className="jTextarea"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              style={{ minHeight: 160 }}
            />

            <div className="jEditActions">
              <button className="jPromptBtn" onClick={() => setEditId(null)}>Cancel</button>
              <button className="jSaveBtn"   onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}