import React, { useState, useEffect } from "react";
import Affirm from "./Affirm";
import Breath from "./Breath";
import Gratitude from "./Gratitude";
import "./Mood.css";

const API = "http://localhost:5000";

const TABS = ["😊 Mood", "✨ Affirm", "🌬 Breathing", "💗 Gratitude"];

export default function Mood() {
  const [activeTab, setActiveTab] = useState("😊 Mood");

  const moods = [
    { emoji: "😊", label: "Happy",       color: "#FFE08A" },
    { emoji: "🥺", label: "Sad",         color: "#9FC6FF" },
    { emoji: "🤩", label: "Excited",     color: "#FFA7B6" },
    { emoji: "😌", label: "Calm",        color: "#A0E7C6" },
    { emoji: "😡", label: "Angry",       color: "#FF8B8B" },
    { emoji: "😳", label: "Embarrassed", color: "#FFD1E3" },
    { emoji: "😴", label: "Sleepy",      color: "#C8E0FF" },
    { emoji: "😟", label: "Anxious",     color: "#D7BAFF" },
    { emoji: "🤒", label: "Sick",        color: "#B5E9D3" },
    { emoji: "😎", label: "Confident",   color: "#FFD28F" },
    { emoji: "🤗", label: "Loved",       color: "#FFE4A8" },
    { emoji: "🤯", label: "Mind-blown",  color: "#FFD88F" },
    { emoji: "😱", label: "Shocked",     color: "#B8C3FF" },
    { emoji: "😇", label: "Blessed",     color: "#F8E1FF" },
    { emoji: "😤", label: "Frustrated",  color: "#FFA58A" },
    { emoji: "😅", label: "Nervous",     color: "#FCB7AD" },
    { emoji: "🤤", label: "Relaxed",     color: "#C9FFD3" },
    { emoji: "🤔", label: "Thinking",    color: "#EBD6FF" },
    { emoji: "😍", label: "In Love",     color: "#FFB4CA" },
    { emoji: "🤬", label: "Furious",     color: "#FF7B7B" },
    { emoji: "😵", label: "Overwhelmed", color: "#FECBD2" },
    { emoji: "🫠", label: "Melting",     color: "#FFE3C1" },
    { emoji: "😜", label: "Playful",     color: "#FFD4A3" },
    { emoji: "😐", label: "Neutral",     color: "#E1E1E1" },
    { emoji: "😔", label: "Down",        color: "#C6C9FF" },
    { emoji: "😭", label: "Crying",      color: "#A3C7FF" },
    { emoji: "😖", label: "Upset",       color: "#FFC0C0" },
    { emoji: "🥱", label: "Bored",       color: "#F4D6FF" },
    { emoji: "🤢", label: "Nauseous",    color: "#C7F7CC" },
    { emoji: "😂", label: "Laughing",    color: "#FFE199" },
    { emoji: "😣", label: "Tensed",      color: "#F7C1DE" },
    { emoji: "🫤", label: "Unsure",      color: "#DCDCDC" },
    { emoji: "🤓", label: "Focused",     color: "#EAD3FF" },
    { emoji: "🤠", label: "Bold",        color: "#FFD8A8" },
    { emoji: "🫶", label: "Grateful",    color: "#FFDEEB" },
    { emoji: "🫣", label: "Shy",         color: "#FAD6FF" },
  ];

  const [selected,    setSelected]    = useState(null);
  const [history,     setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/mood`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setHistory(d.data); })
      .catch(() => {
        const saved = JSON.parse(localStorage.getItem("gw_mood_history") || "[]");
        setHistory(saved);
      });
  }, []);

  const saveMood = async () => {
    if (!selected) return;
    const newEntry = { mood: selected, time: new Date().toLocaleString() };
    try {
      const res  = await fetch(`${API}/api/mood`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newEntry),
      });
      const data = await res.json();
      if (data.success) {
        setHistory((prev) => [data.data, ...prev]);
        setSelected(null);
        alert(`Mood "${selected}" saved to database ✅`);
      }
    } catch {
      const updated = [newEntry, ...history];
      setHistory(updated);
      localStorage.setItem("gw_mood_history", JSON.stringify(updated));
      setSelected(null);
    }
  };

  return (
    <div className="moodRoot">

      {/* PAGE TITLE */}
      <h1 className="moodTitle">💗 Wellness Hub</h1>
      <p className="moodSmallDesc">Track emotions, find calm, and grow every day ✨</p>

      {/* TAB BAR */}
      <div className="gwTabBar">
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

      {/* ───────── MOOD TAB ───────── */}
      {activeTab === "😊 Mood" && (
        <div className="tabContent">
          <div className="introCard">
            <p>Your emotions always tell a story — and GlowWell helps you listen with compassion.</p>
            <p>Tracking your feelings helps you understand triggers, patterns, emotional cycles and growth.</p>
            <p className="highlightLine">✨ Every check-in is a step toward emotional clarity.</p>
          </div>

          <p className="moodSmallDesc">Choose your current mood from the options below. Every feeling is valid.</p>

          <div className="moodGridLarge">
            {moods.map((m, i) => (
              <div
                key={i}
                className={`moodCardSmall ${selected === m.label ? "active" : ""}`}
                style={{ background: m.color }}
                onClick={() => setSelected(m.label)}
              >
                <div className="smallEmoji">{m.emoji}</div>
                <div className="smallLabel">{m.label}</div>
              </div>
            ))}
          </div>

          {selected && (
            <button className="saveBtn" onClick={saveMood}>
              Save "{selected}" 💾
            </button>
          )}

          <button className="historyBtn" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Close History" : "Show Mood History"}
          </button>

          <div className="historyCardTop">
            <h2>Mood History ✨</h2>
            <p className="historyIntro">Your Mood History is more than a list — it's your emotional timeline.</p>
            <ul className="historyBullet">
              <li>Triggers behind each mood</li>
              <li>How habits influence your day</li>
              <li>Emotional shifts over time</li>
              <li>Patterns you may have missed</li>
              <li>Your emotional growth</li>
            </ul>
            <p className="historyClosing">When you reflect back, you see the strong, resilient person you are 💗</p>
          </div>

          {showHistory && (
            <div className="historyCardBottom">
              {history.length === 0 ? (
                <p className="emptyMsg">No moods saved yet 💗</p>
              ) : (
                <ul className="historyList">
                  {history.map((h, i) => (
                    <li key={i} className="historyItem">
                      <span>{h.mood}</span>
                      <span className="time">{h.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────── AFFIRM TAB ───────── */}
      {activeTab === "✨ Affirm" && (
        <div className="tabContent">
          <Affirm />
        </div>
      )}

      {/* ───────── BREATHING TAB ───────── */}
      {activeTab === "🌬 Breathing" && (
        <div className="tabContent">
          <Breath />
        </div>
      )}

      {/* ───────── GRATITUDE TAB ───────── */}
      {activeTab === "💗 Gratitude" && (
        <div className="tabContent">
          <Gratitude />
        </div>
      )}

    </div>
  );
}