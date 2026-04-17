import React, { useState, useEffect } from "react";
import Wheel from "./Wheel";
import "./Goals.css";

const TABS = ["🎯 Goals", "🎡 Wheel"];

const CATEGORIES = ["Career", "Health", "Learning", "Personal", "Finance"];
const PRIORITIES  = ["Low", "Medium", "High"];
const EMOJIS      = ["🎯","🚀","📚","💪","💡","🏆","🌱","💼","🧘","✨"];

// ── Inline step adder (small helper component) ─────────────────────────────
function AddStepInline({ onAdd }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (!val.trim()) return;
    onAdd(val);
    setVal("");
  };
  return (
    <div className="gp-add-step-row">
      <input
        className="gp-step-input"
        placeholder="Add a step..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="gp-step-add-btn" onClick={submit}>+</button>
    </div>
  );
}

export default function Goals() {
  const [activeTab, setActiveTab] = useState("🎯 Goals");

  // ── GOALS STATE ───────────────────────────────────────────────────────────
  const [goals,         setGoals]         = useState([]);
  const [filter,        setFilter]        = useState("All");
  const [showForm,      setShowForm]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedCard,  setExpandedCard]  = useState(null);

  const [form, setForm] = useState({
    text:       "",
    deadline:   "",
    priority:   "Medium",
    category:   "Personal",
    emoji:      "🎯",
    stepsInput: "",
  });

  // ── LOAD ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gw_goals_final") || "[]");
    const fixed = saved.map((g) => ({
      ...g,
      steps:         g.steps         || [],
      streak:        g.streak        || 0,
      completedDays: g.completedDays || [],
      progress:      g.progress      ?? 0,
      emoji:         g.emoji         || "🎯",
    }));
    setGoals(fixed);
  }, []);

  const persist = (data) => {
    setGoals(data);
    localStorage.setItem("gw_goals_final", JSON.stringify(data));
  };

  // ── ADD GOAL ──────────────────────────────────────────────────────────────
  const addGoal = () => {
    if (!form.text.trim()) return;
    const parsedSteps = form.stepsInput
      ? form.stepsInput.split(",").map((t) => ({ text: t.trim(), done: false })).filter((s) => s.text)
      : [];
    persist([
      {
        id:            Date.now(),
        text:          form.text.trim(),
        deadline:      form.deadline,
        priority:      form.priority,
        category:      form.category,
        emoji:         form.emoji,
        steps:         parsedSteps,
        progress:      0,
        streak:        0,
        completedDays: [],
        createdAt:     new Date().toISOString(),
      },
      ...goals,
    ]);
    setForm({ text: "", deadline: "", priority: "Medium", category: "Personal", emoji: "🎯", stepsInput: "" });
    setShowForm(false);
  };

  // ── DELETE GOAL ───────────────────────────────────────────────────────────
  const deleteGoal = (id) => {
    persist(goals.filter((g) => g.id !== id));
    setConfirmDelete(null);
  };

  // ── TOGGLE STEP ───────────────────────────────────────────────────────────
  const toggleStep = (goalId, stepIndex) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const newSteps   = g.steps.map((s, i) => i === stepIndex ? { ...s, done: !s.done } : s);
      const doneCount  = newSteps.filter((s) => s.done).length;
      const newProgress = newSteps.length === 0 ? 0 : Math.round((doneCount / newSteps.length) * 100);
      return { ...g, steps: newSteps, progress: newProgress };
    });
    persist(updated);
  };

  // ── ADD STEP INLINE ───────────────────────────────────────────────────────
  const addStepInline = (goalId, text) => {
    if (!text.trim()) return;
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const newSteps  = [...g.steps, { text: text.trim(), done: false }];
      const doneCount = newSteps.filter((s) => s.done).length;
      return { ...g, steps: newSteps, progress: Math.round((doneCount / newSteps.length) * 100) };
    });
    persist(updated);
  };

  // ── DELETE STEP ───────────────────────────────────────────────────────────
  const deleteStep = (goalId, index) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const newSteps  = g.steps.filter((_, i) => i !== index);
      const doneCount = newSteps.filter((s) => s.done).length;
      return { ...g, steps: newSteps, progress: newSteps.length === 0 ? 0 : Math.round((doneCount / newSteps.length) * 100) };
    });
    persist(updated);
  };

  // ── SAVE TODAY ────────────────────────────────────────────────────────────
  const saveTodayProgress = (goalId) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const doneCount = g.steps.filter((s) => s.done).length;
      const total     = g.steps.length;
      if (doneCount === 0) { alert("At least try to complete 1 step 😊"); return g; }
      return { ...g, progress: Math.round((doneCount / total) * 100) };
    });
    persist(updated);
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const getDaysLeft = (date) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Overdue",    urgent: true  };
    if (diff === 0) return { label: "Due today", urgent: true  };
    if (diff <= 3)  return { label: `${diff}d left`, urgent: true };
    return                 { label: `${diff}d left`, urgent: false };
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === "Completed")          return g.progress === 100;
    if (filter === "Pending")            return g.progress < 100;
    if (CATEGORIES.includes(filter))     return g.category === filter;
    return true;
  });

  const total    = goals.length;
  const done     = goals.filter((g) => g.progress === 100).length;
  const pending  = goals.filter((g) => g.progress < 100).length;
  const avgProg  = total === 0 ? 0 : Math.round(goals.reduce((s, g) => s + g.progress, 0) / total);
  const highPrio = goals.filter((g) => g.priority === "High" && g.progress < 100).length;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="gp-root">
      <div className="gp-blob gp-blob1" />
      <div className="gp-blob gp-blob2" />

      {/* TAB BAR */}
      <div className="gwTabBar" style={{ marginBottom: 28 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`gwTabBtn ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─────────── GOALS TAB ─────────── */}
      {activeTab === "🎯 Goals" && (
        <div className="tabContent">

          {/* HEADER */}
          <header className="gp-header">
            <div>
              <h1 className="gp-title">🎯 Goal Dashboard</h1>
              <p className="gp-subtitle">Track, prioritize, and accomplish what matters most</p>
            </div>
            <button className="gp-add-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Cancel" : "+ New Goal"}
            </button>
          </header>

          {/* STATS */}
          <section className="gp-stats">
            {[
              { icon: "🎯", num: total,          label: "Total"         },
              { icon: "✅", num: done,            label: "Completed"     },
              { icon: "⏳", num: pending,         label: "Pending"       },
              { icon: "📊", num: `${avgProg}%`,   label: "Avg Progress"  },
              { icon: "🔥", num: highPrio,        label: "High Priority" },
            ].map((s) => (
              <div className="gp-stat-card" key={s.label}>
                <div className="gp-stat-icon">{s.icon}</div>
                <div>
                  <div className="gp-stat-num">{s.num}</div>
                  <div className="gp-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
            <div className="gp-overall-bar">
              <div className="gp-overall-bar-label">
                <span>Overall Progress</span>
                <span className="gp-overall-pct">{avgProg}%</span>
              </div>
              <div className="gp-bar-track">
                <div className="gp-bar-fill" style={{ width: `${avgProg}%` }} />
              </div>
            </div>
          </section>

          {/* ADD FORM */}
          {showForm && (
            <section className="gp-form-panel">
              <h3 className="gp-form-title">Create New Goal</h3>
              <div className="gp-form-grid">
                <div className="gp-field gp-field-wide">
                  <label>Goal Title *</label>
                  <input
                    className="gp-input"
                    placeholder="e.g. Finish React project by April"
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  />
                </div>
                <div className="gp-field">
                  <label>Category</label>
                  <select className="gp-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="gp-field">
                  <label>Priority</label>
                  <select className="gp-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="gp-field">
                  <label>Target Date</label>
                  <input className="gp-input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div className="gp-field gp-field-wide">
                  <label>Icon</label>
                  <div className="gp-emoji-row">
                    {EMOJIS.map((em) => (
                      <button key={em} className={`gp-emoji-btn ${form.emoji === em ? "active" : ""}`} onClick={() => setForm({ ...form, emoji: em })}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="gp-field gp-field-wide">
                  <label>Steps (comma separated)</label>
                  <input
                    className="gp-input"
                    placeholder="e.g. Read 30 mins, Revise notes, Practice problems"
                    value={form.stepsInput}
                    onChange={(e) => setForm({ ...form, stepsInput: e.target.value })}
                  />
                  <p className="gp-field-hint">💡 Tick each step to update progress automatically.</p>
                </div>
              </div>
              <div className="gp-form-actions">
                <button className="gp-btn-ghost"    onClick={() => setShowForm(false)}>Cancel</button>
                <button className="gp-btn-primary"  onClick={addGoal}>Create Goal →</button>
              </div>
            </section>
          )}

          {/* FILTER BAR */}
          <div className="gp-controls">
            <div className="gp-filters">
              {["All", "Pending", "Completed", ...CATEGORIES].map((f) => (
                <button key={f} className={`gp-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* EMPTY */}
          {filteredGoals.length === 0 && (
            <div className="gp-empty">
              <div className="gp-empty-icon">🌱</div>
              <h3>No goals here yet</h3>
              <p>Click "+ New Goal" to start your journey</p>
            </div>
          )}

          {/* GOALS GRID */}
          <div className="gp-grid">
            {filteredGoals.map((g) => {
              const daysInfo     = getDaysLeft(g.deadline);
              const doneCount    = g.steps.filter((s) => s.done).length;
              const allStepsDone = g.steps.length > 0 && doneCount === g.steps.length;
              const isExpanded   = expandedCard === g.id;
              const today        = new Date().toDateString();
              const savedToday   = g.completedDays.includes(today);

              return (
                <div
                  key={g.id}
                  className={`gp-card gp-priority-${g.priority.toLowerCase()} ${savedToday ? "gp-card-saved" : ""}`}
                >
                  {/* TOP ROW */}
                  <div className="gp-card-top">
                    <div className="gp-card-emoji">{g.emoji}</div>
                    <div className="gp-card-badges">
                      <span className={`gp-badge gp-badge-${g.priority.toLowerCase()}`}>{g.priority}</span>
                      <span className="gp-badge gp-badge-cat">{g.category}</span>
                      {savedToday && <span className="gp-badge gp-badge-done">✓ Today Done</span>}
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="gp-card-title">{g.text}</h3>

                  {/* META */}
                  <div className="gp-card-meta-row">
                    {g.deadline ? (
                      <span className={`gp-deadline ${daysInfo?.urgent ? "urgent" : ""}`}>
                        📅 {new Date(g.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        {daysInfo && <span className={`gp-days-pill ${daysInfo.urgent ? "urgent" : ""}`}>{daysInfo.label}</span>}
                      </span>
                    ) : (
                      <span className="gp-deadline muted">📅 No deadline</span>
                    )}
                    <span className="gp-streak">🔥 {g.streak} day streak</span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="gp-progress-section">
                    <div className="gp-progress-header">
                      <span>Progress{g.steps.length > 0 ? ` (${doneCount}/${g.steps.length} steps)` : ""}</span>
                      <span className="gp-progress-pct">{g.progress}%</span>
                    </div>
                    <div className="gp-bar-track">
                      <div className="gp-bar-fill" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>

                  {/* STEPS */}
                  {g.steps.length > 0 && (
                    <div className="gp-steps-section">
                      <button className="gp-expand-btn" onClick={() => setExpandedCard(isExpanded ? null : g.id)}>
                        {isExpanded ? "▲ Hide steps" : `▼ Show steps (${doneCount}/${g.steps.length})`}
                      </button>
                      {isExpanded && (
                        <div className="gp-steps">
                          {g.steps.map((s, i) => (
                            <label key={i} className={`gp-step-label ${s.done ? "done" : ""}`}>
                              <input type="checkbox" checked={s.done} onChange={() => toggleStep(g.id, i)} disabled={savedToday} />
                              <span>{s.text}</span>
                              <button className="gp-step-del" onClick={() => deleteStep(g.id, i)} disabled={savedToday}>×</button>
                            </label>
                          ))}
                          {!savedToday && <AddStepInline onAdd={(text) => addStepInline(g.id, text)} />}
                        </div>
                      )}
                    </div>
                  )}

                  {/* NO STEPS YET */}
                  {g.steps.length === 0 && !savedToday && (
                    <div className="gp-no-steps">
                      <p className="gp-no-steps-msg">No steps yet — add one below 👇</p>
                      <AddStepInline onAdd={(text) => addStepInline(g.id, text)} />
                    </div>
                  )}

                  {/* BOTTOM ACTIONS */}
                  <div className="gp-card-actions">
                    {savedToday && (
                      <div className="gp-saved-banner">✅ Saved for today — come back tomorrow!</div>
                    )}
                    {!savedToday && g.steps.length > 0 && (
                      <button className="gp-action-btn gp-btn-complete" onClick={() => saveTodayProgress(g.id)}>
                        💾 Save Progress
                      </button>
                    )}
                    {!savedToday && !allStepsDone && g.steps.length > 0 && (
                      <div className="gp-partial-msg">
                        {doneCount === 0 ? "Tick steps to track progress 👆" : `${doneCount}/${g.steps.length} done — almost there! 💪`}
                      </div>
                    )}
                    <button className="gp-action-btn gp-btn-delete" onClick={() => setConfirmDelete(g.id)}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DELETE MODAL */}
          {confirmDelete && (
            <div className="gp-overlay" onClick={() => setConfirmDelete(null)}>
              <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Delete this goal?</h3>
                <p>This action cannot be undone.</p>
                <div className="gp-modal-actions">
                  <button className="gp-btn-ghost"  onClick={() => setConfirmDelete(null)}>Cancel</button>
                  <button className="gp-btn-danger" onClick={() => deleteGoal(confirmDelete)}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────── WHEEL TAB ─────────── */}
      {activeTab === "🎡 Wheel" && (
        <div className="tabContent">
          <Wheel />
        </div>
      )}

    </div>
  );
}