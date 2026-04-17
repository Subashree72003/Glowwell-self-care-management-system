import React, { useEffect, useRef, useState, useMemo } from "react";
import Tips from "./Tips";
import "./Habit.css";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TABS = ["🔥 Habits", "💡 Tips"];

const TIMES = ["Morning", "Afternoon", "Evening", "Anytime"];
const CATEGORIES = ["Health", "Fitness", "Mindfulness", "Learning", "Work", "Self-Care", "Sleep", "Social"];
const FREQUENCIES = ["Daily", "Weekdays", "Weekends", "3x/week", "Weekly"];
const COLORS = ["#ff9ec7", "#b07dff", "#67e8c0", "#ffd166", "#ff6b6b", "#74b9ff", "#fd79a8", "#a29bfe"];

const HABIT_TEMPLATES = [
  { text: "Drink 8 glasses of water 💧", emoji: "💧", time: "Morning",   category: "Health",       frequency: "Daily",    color: "#74b9ff" },
  { text: "Morning meditation 🧘",       emoji: "🧘", time: "Morning",   category: "Mindfulness",  frequency: "Daily",    color: "#a29bfe" },
  { text: "30 min exercise 🏃",          emoji: "🏃", time: "Morning",   category: "Fitness",      frequency: "Daily",    color: "#67e8c0" },
  { text: "Read 20 pages 📚",            emoji: "📚", time: "Evening",   category: "Learning",     frequency: "Daily",    color: "#ffd166" },
  { text: "No phone after 10 pm 📵",     emoji: "📵", time: "Evening",   category: "Sleep",        frequency: "Daily",    color: "#ff9ec7" },
  { text: "Journal writing ✍️",          emoji: "✍️", time: "Evening",   category: "Mindfulness",  frequency: "Daily",    color: "#fd79a8" },
  { text: "10 min walk 🚶",              emoji: "🚶", time: "Afternoon", category: "Fitness",      frequency: "Daily",    color: "#67e8c0" },
  { text: "Healthy breakfast 🥗",        emoji: "🥗", time: "Morning",   category: "Health",       frequency: "Daily",    color: "#ffd166" },
  { text: "Cold shower ❄️",             emoji: "❄️", time: "Morning",   category: "Health",       frequency: "Daily",    color: "#74b9ff" },
  { text: "Call a friend 📞",            emoji: "📞", time: "Anytime",   category: "Social",       frequency: "Weekly",   color: "#ff9ec7" },
  { text: "Plan tomorrow 📋",            emoji: "📋", time: "Evening",   category: "Work",         frequency: "Weekdays", color: "#a29bfe" },
  { text: "Stretch 10 min 🤸",           emoji: "🤸", time: "Morning",   category: "Fitness",      frequency: "Daily",    color: "#67e8c0" },
];

const QUOTES = [
  "We are what we repeatedly do. Excellence is not an act, but a habit.",
  "Small habits create massive results over time.",
  "You showed up today — that matters 💗",
  "Progress over perfection, always.",
  "Consistency is the bridge between goals and results.",
  "Every habit you build is an investment in your future self.",
];

const MILESTONES = [3, 7, 14, 21, 30, 60, 100];

function getDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function buildMonthDates(y, m) {
  const first = new Date(y, m, 1), last = new Date(y, m+1, 0), days = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}
function monthLabel(y, m) { return new Date(y, m).toLocaleString(undefined, { month: "long", year: "numeric" }); }

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Habit() {
  const [activeTab,  setActiveTab]  = useState("🔥 Habits");

  // habits & history
  const [habits,  setHabits]  = useState([]);
  const [history, setHistory] = useState([]);

  // UI state
  const [showAdd,       setShowAdd]       = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterTime,    setFilterTime]    = useState("All");
  const [filterCat,     setFilterCat]     = useState("All");
  const [viewMode,      setViewMode]      = useState("grid"); // grid | list
  const [quoteIdx,      setQuoteIdx]      = useState(0);
  const [toast,         setToast]         = useState("");
  const [calYear,       setCalYear]       = useState(new Date().getFullYear());
  const [calMonth,      setCalMonth]      = useState(new Date().getMonth());
  const [modalDate,     setModalDate]     = useState(null);
  const [modalTasks,    setModalTasks]    = useState([]);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [activeSection, setActiveSection] = useState("habits"); // habits | stats | calendar

  // form
  const [form, setForm] = useState({
    text: "", emoji: "✨", time: "Morning", category: "Health",
    frequency: "Daily", color: COLORS[0], note: ""
  });

  const quoteRef = useRef(null);
  const today = new Date();

  // ── PERSIST ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setHabits( JSON.parse(localStorage.getItem("gw_habits_v3")  || "[]"));
    setHistory(JSON.parse(localStorage.getItem("gw_habit_hist") || "[]"));
  }, []);

  const persistHabits  = (a) => { setHabits(a);   localStorage.setItem("gw_habits_v3",  JSON.stringify(a)); };
  const persistHistory = (a) => { setHistory(a);  localStorage.setItem("gw_habit_hist", JSON.stringify(a)); };

  useEffect(() => {
    quoteRef.current = setInterval(() => setQuoteIdx(q => (q+1) % QUOTES.length), 5000);
    return () => clearInterval(quoteRef.current);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // ── ADD HABIT ─────────────────────────────────────────────────────────────
  const addHabit = () => {
    if (!form.text.trim()) return;
    const newHabit = {
      id: Date.now(), text: form.text.trim(), emoji: form.emoji,
      time: form.time, category: form.category, frequency: form.frequency,
      color: form.color, note: form.note, completed: false,
      streak: 0, bestStreak: 0, totalDone: 0, lastDone: null,
      createdAt: new Date().toISOString(),
      completionHistory: [], // [{date, done}]
    };
    persistHabits([newHabit, ...habits]);
    setForm({ text: "", emoji: "✨", time: "Morning", category: "Health", frequency: "Daily", color: COLORS[0], note: "" });
    setShowAdd(false);
    showToast("Habit added! 🎉");
  };

  const addTemplate = (tpl) => {
    const newHabit = {
      id: Date.now(), ...tpl, completed: false,
      streak: 0, bestStreak: 0, totalDone: 0, lastDone: null,
      note: "", createdAt: new Date().toISOString(), completionHistory: [],
    };
    persistHabits([newHabit, ...habits]);
    setShowTemplates(false);
    showToast(`"${tpl.text.substring(0,20)}..." added! 🎉`);
  };

  // ── TOGGLE HABIT ──────────────────────────────────────────────────────────
  const toggleHabit = (id) => {
    const today = getDateKey();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const wasCompleted = h.completed;
      const newCompleted = !wasCompleted;

      // update completion history
      const hist = [...(h.completionHistory || [])];
      const todayEntry = hist.find(e => e.date === today);
      if (todayEntry) todayEntry.done = newCompleted;
      else hist.push({ date: today, done: newCompleted });

      // streak calculation
      let streak = h.streak;
      let totalDone = h.totalDone || 0;
      if (newCompleted) {
        const yesterday = getDateKey(new Date(Date.now() - 86400000));
        const hadYesterday = hist.find(e => e.date === yesterday && e.done);
        streak = hadYesterday ? streak + 1 : 1;
        totalDone += 1;
      } else {
        streak = Math.max(0, streak - 1);
        totalDone = Math.max(0, totalDone - 1);
      }

      const bestStreak = Math.max(h.bestStreak || 0, streak);
      return { ...h, completed: newCompleted, streak, bestStreak, totalDone, lastDone: newCompleted ? today : h.lastDone, completionHistory: hist };
    });
    persistHabits(updated);

    // check milestone
    const habit = updated.find(h => h.id === id);
    if (habit?.completed && MILESTONES.includes(habit.streak)) {
      showToast(`🏆 ${habit.streak}-day streak milestone! Amazing!`);
    } else if (habit?.completed) {
      showToast("Great job! ✅");
    }
  };

  const deleteHabit = (id) => { persistHabits(habits.filter(h => h.id !== id)); showToast("Habit removed."); };

  // ── SAVE TODAY ─────────────────────────────────────────────────────────────
  const saveToday = () => {
    if (habits.length === 0) { showToast("Add a habit first! 💡"); return; }
    const key = getDateKey();
    const snap = habits.map(h => ({ id: h.id, text: h.text, emoji: h.emoji, category: h.category, time: h.time, completed: !!h.completed }));
    const comp = habits.filter(h => h.completed).length;
    const entry = { date: key, completed: comp, total: habits.length, rate: Math.round((comp/habits.length)*100), tasks: snap };
    persistHistory([entry, ...history.filter(h => h.date !== key)]);
    persistHabits(habits.map(h => ({ ...h, completed: false })));
    showToast(`Day saved! ${comp}/${habits.length} habits completed 🌟`);
  };

  // ── FILTERED HABITS ────────────────────────────────────────────────────────
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      const timeOk = filterTime === "All" || h.time === filterTime;
      const catOk  = filterCat  === "All" || h.category === filterCat;
      return timeOk && catOk;
    });
  }, [habits, filterTime, filterCat]);

  // grouped by time
  const groupedHabits = useMemo(() => {
    const groups = {};
    TIMES.forEach(t => { groups[t] = []; });
    filteredHabits.forEach(h => { if (groups[h.time]) groups[h.time].push(h); else groups["Anytime"].push(h); });
    return groups;
  }, [filteredHabits]);

  // ── STATS ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total       = habits.length;
    const doneToday   = habits.filter(h => h.completed).length;
    const pct         = total === 0 ? 0 : Math.round((doneToday / total) * 100);
    const bestStreak  = habits.reduce((m, h) => Math.max(m, h.bestStreak || 0), 0);
    const totalDone   = habits.reduce((s, h) => s + (h.totalDone || 0), 0);
    const avgRate     = history.length === 0 ? 0 : Math.round(history.reduce((s, h) => s + (h.rate || 0), 0) / history.length);
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6-i));
      const k = getDateKey(d);
      const f = history.find(h => h.date === k);
      return { label: k.slice(5), rate: f?.rate || 0, comp: f?.completed || 0, total: f?.total || 0 };
    });
    return { total, doneToday, pct, bestStreak, totalDone, avgRate, last7 };
  }, [habits, history]);

  // ── CALENDAR ───────────────────────────────────────────────────────────────
  const monthDates = buildMonthDates(calYear, calMonth);
  const rateForDate = (d) => {
    if (!d) return 0;
    const f = history.find(h => h.date === getDateKey(d));
    return f?.rate || 0;
  };
  const heatColor = (r) => {
    if (r === 0)   return "transparent";
    if (r < 25)    return "#ffd1e8";
    if (r < 50)    return "#ffb2d6";
    if (r < 75)    return "#ff82b8";
    if (r < 100)   return "#ff5aa6";
    return "#c0006b";
  };

  const openModal = (d) => {
    if (!d) return;
    const norm    = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const normNow = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (norm > normNow) return;
    const f = history.find(h => h.date === getDateKey(d));
    setModalTasks(f?.tasks || []);
    setModalDate(d);
    setModalOpen(true);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount     = habits.length;
  const circumference  = 2 * Math.PI * 54;
  const offset         = circumference - (stats.pct / 100) * circumference;

  return (
    <div className="hb-root">

      {/* TOAST */}
      {toast && <div className="hb-toast">{toast}</div>}

      {/* TAB BAR */}
      <div className="gwTabBar">
        {TABS.map(t => (
          <button key={t} className={`gwTabBtn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {activeTab === "💡 Tips" && <div className="tabContent"><Tips /></div>}

      {activeTab === "🔥 Habits" && (
        <div className="hb-page">

          {/* ── HERO HEADER ── */}
          <div className="hb-hero">
            <div className="hb-hero-left">
              <h1 className="hb-title">🔥 Daily Habits</h1>
              <p className="hb-subtitle">Build the life you want, one habit at a time.</p>
              <div className="hb-quote-box">
                <span className="hb-quote">"{QUOTES[quoteIdx]}"</span>
              </div>
            </div>

            {/* RING PROGRESS */}
            <div className="hb-ring-wrap">
              <svg viewBox="0 0 120 120" width="130" height="130">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#ff9ec7"/>
                    <stop offset="100%" stopColor="#b07dff"/>
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" stroke="rgba(255,255,255,0.15)"/>
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" stroke="url(#ringGrad)"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
                <text x="60" y="56" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">{stats.pct}%</text>
                <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">{completedCount}/{totalCount}</text>
              </svg>
              <p className="hb-ring-label">Today's Progress</p>
            </div>
          </div>

          {/* ── MINI STATS ROW ── */}
          <div className="hb-stat-row">
            {[
              { icon: "🔥", val: habits.reduce((m,h) => Math.max(m, h.streak||0), 0), label: "Best Streak" },
              { icon: "✅", val: stats.totalDone, label: "Total Done" },
              { icon: "📊", val: `${stats.avgRate}%`, label: "Avg Rate" },
              { icon: "🏆", val: stats.bestStreak, label: "Record Streak" },
            ].map(s => (
              <div className="hb-stat-pill" key={s.label}>
                <span className="hb-stat-icon">{s.icon}</span>
                <span className="hb-stat-val">{s.val}</span>
                <span className="hb-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── SECTION NAV ── */}
          <div className="hb-section-nav">
            {["habits", "stats", "calendar"].map(s => (
              <button key={s} className={`hb-sec-btn ${activeSection === s ? "active" : ""}`} onClick={() => setActiveSection(s)}>
                {s === "habits" ? "🏠 Habits" : s === "stats" ? "📊 Stats" : "📅 Calendar"}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════
              SECTION: HABITS
          ═══════════════════════════════════════════ */}
          {activeSection === "habits" && (
            <>
              {/* ACTION BAR */}
              <div className="hb-action-bar">
                <div className="hb-filters">
                  <select className="hb-select" value={filterTime} onChange={e => setFilterTime(e.target.value)}>
                    <option value="All">⏰ All Times</option>
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select className="hb-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="All">🏷 All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button className={`hb-view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>⊞</button>
                  <button className={`hb-view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>☰</button>
                </div>
                <div className="hb-action-btns">
                  <button className="hb-btn-secondary" onClick={() => setShowTemplates(true)}>📋 Templates</button>
                  <button className="hb-btn-primary" onClick={() => setShowAdd(s => !s)}>
                    {showAdd ? "✕ Close" : "+ Add Habit"}
                  </button>
                  <button className="hb-btn-save" onClick={saveToday}>💾 Save Day</button>
                </div>
              </div>

              {/* ADD FORM */}
              {showAdd && (
                <div className="hb-add-form">
                  <h3 className="hb-form-title">Create New Habit</h3>
                  <div className="hb-form-grid">
                    <div className="hb-field hb-field-wide">
                      <label>Habit Name *</label>
                      <input className="hb-input" placeholder="e.g. Morning meditation" value={form.text}
                        onChange={e => setForm({...form, text: e.target.value})}
                        onKeyDown={e => e.key === "Enter" && addHabit()} />
                    </div>
                    <div className="hb-field">
                      <label>Time of Day</label>
                      <select className="hb-input" value={form.time} onChange={e => setForm({...form, time: e.target.value})}>
                        {TIMES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="hb-field">
                      <label>Category</label>
                      <select className="hb-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="hb-field">
                      <label>Frequency</label>
                      <select className="hb-input" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                        {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="hb-field hb-field-wide">
                      <label>Emoji</label>
                      <div className="hb-emoji-row">
                        {["✨","💧","🧘","📚","🏃","🥗","😴","💪","🎯","🌿","☕","🎵"].map(e => (
                          <button key={e} className={`hb-emoji-btn ${form.emoji === e ? "active" : ""}`} onClick={() => setForm({...form, emoji: e})}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div className="hb-field hb-field-wide">
                      <label>Color</label>
                      <div className="hb-color-row">
                        {COLORS.map(c => (
                          <button key={c} className={`hb-color-btn ${form.color === c ? "active" : ""}`}
                            style={{ background: c }} onClick={() => setForm({...form, color: c})} />
                        ))}
                      </div>
                    </div>
                    <div className="hb-field hb-field-wide">
                      <label>Note (optional)</label>
                      <input className="hb-input" placeholder="Why does this habit matter to you?" value={form.note}
                        onChange={e => setForm({...form, note: e.target.value})} />
                    </div>
                  </div>
                  <div className="hb-form-actions">
                    <button className="hb-btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                    <button className="hb-btn-primary" onClick={addHabit}>Create Habit →</button>
                  </div>
                </div>
              )}

              {/* TEMPLATES MODAL */}
              {showTemplates && (
                <div className="hb-overlay" onClick={() => setShowTemplates(false)}>
                  <div className="hb-modal" onClick={e => e.stopPropagation()}>
                    <div className="hb-modal-header">
                      <h3>📋 Habit Templates</h3>
                      <button className="hb-modal-close" onClick={() => setShowTemplates(false)}>✕</button>
                    </div>
                    <p className="hb-modal-sub">Pick a template to get started instantly</p>
                    <div className="hb-template-grid">
                      {HABIT_TEMPLATES.map((tpl, i) => (
                        <button key={i} className="hb-template-card" onClick={() => addTemplate(tpl)} style={{ borderLeft: `4px solid ${tpl.color}` }}>
                          <span className="hb-tpl-emoji">{tpl.emoji}</span>
                          <div className="hb-tpl-info">
                            <div className="hb-tpl-name">{tpl.text}</div>
                            <div className="hb-tpl-meta">{tpl.time} · {tpl.frequency} · {tpl.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HABITS — GROUPED BY TIME */}
              {habits.length === 0 ? (
                <div className="hb-empty">
                  <div className="hb-empty-icon">🌱</div>
                  <h3>No habits yet</h3>
                  <p>Start with a template or create your own habit</p>
                  <button className="hb-btn-primary" onClick={() => setShowTemplates(true)}>Browse Templates</button>
                </div>
              ) : (
                TIMES.map(time => {
                  const group = groupedHabits[time];
                  if (group.length === 0) return null;
                  return (
                    <div key={time} className="hb-time-group">
                      <div className="hb-time-label">
                        <span>{time === "Morning" ? "🌅" : time === "Afternoon" ? "☀️" : time === "Evening" ? "🌙" : "⭐"} {time}</span>
                        <span className="hb-time-count">{group.filter(h => h.completed).length}/{group.length}</span>
                      </div>

                      <div className={viewMode === "grid" ? "hb-habit-grid" : "hb-habit-list"}>
                        {group.map(h => {
                          const nextMilestone = MILESTONES.find(m => m > h.streak) || "∞";
                          const toNext = nextMilestone === "∞" ? "∞" : nextMilestone - h.streak;
                          return (
                            <div key={h.id} className={`hb-habit-card ${h.completed ? "done" : ""} ${viewMode === "list" ? "list-style" : ""}`}
                              style={{ borderTop: `3px solid ${h.color}` }}>

                              {/* CHECK BUTTON */}
                              <button className={`hb-check ${h.completed ? "checked" : ""}`}
                                style={{ background: h.completed ? h.color : "transparent", borderColor: h.color }}
                                onClick={() => toggleHabit(h.id)}>
                                {h.completed ? "✓" : ""}
                              </button>

                              <div className="hb-habit-body">
                                <div className="hb-habit-top">
                                  <span className="hb-habit-emoji">{h.emoji}</span>
                                  <div className="hb-habit-info">
                                    <div className={`hb-habit-name ${h.completed ? "striked" : ""}`}>{h.text}</div>
                                    <div className="hb-habit-meta">
                                      <span className="hb-badge" style={{ background: h.color + "33", color: h.color }}>{h.category}</span>
                                      <span className="hb-badge-freq">{h.frequency}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* STREAK + MILESTONE */}
                                <div className="hb-habit-footer">
                                  <div className="hb-streak-info">
                                    <span className="hb-streak-fire">🔥</span>
                                    <span className="hb-streak-num">{h.streak}</span>
                                    <span className="hb-streak-lbl">day streak</span>
                                    {h.streak > 0 && (
                                      <span className="hb-milestone-hint">· {toNext} to {nextMilestone}🏆</span>
                                    )}
                                  </div>
                                  <button className="hb-delete-btn" onClick={() => deleteHabit(h.id)}>✕</button>
                                </div>

                                {/* STREAK BAR */}
                                {nextMilestone !== "∞" && (
                                  <div className="hb-streak-bar-wrap">
                                    <div className="hb-streak-bar" style={{ width: `${Math.min(100, (h.streak / nextMilestone) * 100)}%`, background: h.color }} />
                                  </div>
                                )}

                                {h.note && <div className="hb-habit-note">💬 {h.note}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════
              SECTION: STATS
          ═══════════════════════════════════════════ */}
          {activeSection === "stats" && (
            <div className="hb-stats-section">
              <h2 className="hb-sec-title">📊 Analytics</h2>

              {/* WEEKLY BARS */}
              <div className="hb-stats-card">
                <h3>Last 7 Days</h3>
                <div className="hb-bar-chart">
                  {stats.last7.map((d, i) => (
                    <div key={i} className="hb-bar-col">
                      <div className="hb-bar-pct">{d.rate > 0 ? `${d.rate}%` : ""}</div>
                      <div className="hb-bar-wrap">
                        <div className="hb-bar-fill" style={{ height: `${d.rate}%` }} />
                      </div>
                      <div className="hb-bar-label">{d.label}</div>
                      <div className="hb-bar-sub">{d.comp}/{d.total}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PER-HABIT STATS */}
              <div className="hb-stats-card">
                <h3>Habit Performance</h3>
                {habits.length === 0 ? <p className="hb-muted">No habits yet.</p> : (
                  <div className="hb-perf-list">
                    {[...habits].sort((a,b) => (b.streak||0) - (a.streak||0)).map(h => (
                      <div key={h.id} className="hb-perf-row">
                        <div className="hb-perf-left">
                          <span>{h.emoji}</span>
                          <span className="hb-perf-name">{h.text}</span>
                        </div>
                        <div className="hb-perf-right">
                          <div className="hb-perf-bar-wrap">
                            <div className="hb-perf-bar" style={{ width: `${Math.min(100, (h.streak/30)*100)}%`, background: h.color }} />
                          </div>
                          <span className="hb-perf-streak">🔥 {h.streak}</span>
                          <span className="hb-perf-total">✅ {h.totalDone || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CATEGORY BREAKDOWN */}
              <div className="hb-stats-card">
                <h3>By Category</h3>
                {CATEGORIES.filter(c => habits.some(h => h.category === c)).map(cat => {
                  const catHabits = habits.filter(h => h.category === cat);
                  const done      = catHabits.filter(h => h.completed).length;
                  const pct       = Math.round((done / catHabits.length) * 100);
                  return (
                    <div key={cat} className="hb-cat-row">
                      <span className="hb-cat-name">{cat}</span>
                      <div className="hb-cat-bar-wrap">
                        <div className="hb-cat-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="hb-cat-pct">{done}/{catHabits.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              SECTION: CALENDAR
          ═══════════════════════════════════════════ */}
          {activeSection === "calendar" && (
            <div className="hb-cal-section">
              <div className="hb-cal-header">
                <span className="hb-cal-title">📅 {monthLabel(calYear, calMonth)}</span>
                <div className="hb-cal-nav">
                  <button className="hb-cal-btn" onClick={() => { const d = new Date(calYear, calMonth-1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}>◀</button>
                  <button className="hb-cal-btn" onClick={() => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); }}>Today</button>
                  <button className="hb-cal-btn" onClick={() => { const d = new Date(calYear, calMonth+1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }}>▶</button>
                </div>
              </div>

              {/* LEGEND */}
              <div className="hb-legend">
                {[0,25,50,75,100].map(r => (
                  <div key={r} className="hb-legend-item">
                    <div className="hb-legend-dot" style={{ background: r === 0 ? "rgba(255,255,255,0.1)" : heatColor(r) }} />
                    <span>{r === 0 ? "None" : r === 100 ? "100%" : `${r}%+`}</span>
                  </div>
                ))}
              </div>

              <div className="hb-cal-grid">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="hb-cal-weekday">{d}</div>)}
                {monthDates.map((dt, i) => {
                  const rate  = rateForDate(dt);
                  const isT   = dt && getDateKey(dt) === getDateKey();
                  const hasDt = dt && history.some(h => h.date === getDateKey(dt));
                  return (
                    <div key={i} className={`hb-cal-cell ${isT ? "today" : ""} ${hasDt ? "has-data" : ""}`}
                      style={{ background: dt ? (rate > 0 ? heatColor(rate) : "rgba(255,255,255,0.06)") : "transparent" }}
                      onClick={() => dt && openModal(dt)}
                      title={dt ? `${getDateKey(dt)} — ${rate}% completion` : ""}>
                      <span className="hb-cal-day">{dt ? dt.getDate() : ""}</span>
                      {dt && rate === 100 && <span className="hb-cal-star">⭐</span>}
                    </div>
                  );
                })}
              </div>

              {/* HISTORY LOG */}
              <div className="hb-history-log">
                <h3>Recent Days</h3>
                {history.slice(0, 10).map((h, i) => (
                  <div key={i} className="hb-hist-row">
                    <span className="hb-hist-date">{h.date}</span>
                    <div className="hb-hist-bar-wrap">
                      <div className="hb-hist-bar" style={{ width: `${h.rate}%` }} />
                    </div>
                    <span className="hb-hist-pct">{h.completed}/{h.total} ({h.rate}%)</span>
                    {h.rate === 100 && <span>⭐</span>}
                  </div>
                ))}
                {history.length === 0 && <p className="hb-muted">No history yet — save your first day!</p>}
              </div>
            </div>
          )}

        </div>
      )}

      {/* DAY DETAIL MODAL */}
      {modalOpen && (
        <div className="hb-overlay" onClick={() => setModalOpen(false)}>
          <div className="hb-modal" onClick={e => e.stopPropagation()}>
            <div className="hb-modal-header">
              <h3>📅 {modalDate ? getDateKey(modalDate) : ""}</h3>
              <button className="hb-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            {modalTasks.length === 0 ? (
              <p className="hb-muted" style={{ padding: 16 }}>No data for this day.</p>
            ) : (
              <div className="hb-modal-tasks">
                {modalTasks.map((t, i) => (
                  <div key={i} className={`hb-modal-task ${t.completed ? "done" : ""}`}>
                    <span>{t.emoji}</span>
                    <span className="hb-modal-task-name">{t.text}</span>
                    <span className="hb-modal-task-status">{t.completed ? "✅" : "⭕"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}