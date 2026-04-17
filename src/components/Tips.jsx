import React, { useEffect, useState } from "react";
import "./Tips.css";

const TIPS_DB = {
  "Self-Care": [
    {
      id: "sc1",
      title: "Start small and realistic",
      text: "Choose one tiny, repeatable self-care action (5–10 minutes) and make it a daily habit. Small wins build momentum."
    },
    {
      id: "sc2",
      title: "Create a Gentle Routine",
      text: "Design a short morning or evening ritual—tea, stretch, or 3 deep breaths—to anchor your day and calm the nervous system."
    },
    {
      id: "sc3",
      title: "Boundaries protect energy",
      text: "Say no to tasks that drain you. Setting a simple boundary frees time for what truly matters."
    }
  ],
  "Study & Focus": [
    {
      id: "st1",
      title: "Pomodoro bursts",
      text: "Work for 25 minutes, rest for 5. Repeat 4 times then take a longer break—this rhythm keeps focus high and fatigue low."
    },
    {
      id: "st2",
      title: "One-task rule",
      text: "Pick the single most important study task for the session. Finish it or make meaningful progress before switching."
    },
    {
      id: "st3",
      title: "Active recall",
      text: "After reading, close the book and recall the key ideas — this strengthens memory better than passive review."
    }
  ],
  "Sleep & Rest": [
    {
      id: "sl1",
      title: "Wind-down ritual",
      text: "Turn off screens 30–60 minutes before bed. Read, write, or breathe to cue your body for rest."
    },
    {
      id: "sl2",
      title: "Consistent sleep window",
      text: "Go to bed and wake up within a 30–60 minute range daily — your body loves predictability and better sleep follows."
    },
    {
      id: "sl3",
      title: "Limit heavy meals & caffeine",
      text: "Avoid heavy food and caffeine close to bedtime to reduce nighttime wakefulness and improve sleep quality."
    }
  ],
  "Stress & Anxiety": [
    {
      id: "sa1",
      title: "Name the feeling",
      text: "Label the emotion (e.g., “I feel anxious”) — naming reduces emotional intensity and gives you space to respond calmly."
    },
    {
      id: "sa2",
      title: "5-4-3-2-1 grounding",
      text: "Look for 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste — grounding brings you back to the present."
    },
    {
      id: "sa3",
      title: "Breathe with intention",
      text: "Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 3–4 times to activate the relaxation response."
    }
  ],
  "Productivity & Planning": [
    {
      id: "pr1",
      title: "Theme your day",
      text: "Assign a theme to each day (e.g., 'Study', 'Creative', 'Admin') to reduce decision fatigue and increase output."
    },
    {
      id: "pr2",
      title: "Two-minute rule",
      text: "If a task takes less than two minutes, do it now. It prevents small tasks from piling up."
    },
    {
      id: "pr3",
      title: "Weekly review",
      text: "Spend 15 minutes weekly reviewing progress, updating goals, and planning the next week—this keeps momentum steady."
    }
  ],
  "Social & Relationships": [
    {
      id: "sr1",
      title: "Ask open questions",
      text: "When checking in with someone, ask 'How are you feeling about that?' — open questions invite deeper connection."
    },
    {
      id: "sr2",
      title: "Micro-kindnesses",
      text: "Little acts (a message, a small favor) maintain relationships more consistently than grand gestures."
    },
    {
      id: "sr3",
      title: "Set a check-in ritual",
      text: "Weekly 10-minute calls or messages with loved ones build closeness without overwhelming your schedule."
    }
  ]
};

export default function Tips() {
  const categories = Object.keys(TIPS_DB);
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gw_tips_fav") || "[]");
    setFavorites(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("gw_tips_fav", JSON.stringify(favorites));
  }, [favorites]);

  const filtered = (TIPS_DB[activeCat] || []).filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.text.toLowerCase().includes(query.toLowerCase())
  );

  const toggleFav = (tip) => {
    if (favorites.find((f) => f.id === tip.id)) {
      setFavorites((s) => s.filter((f) => f.id !== tip.id));
    } else {
      setFavorites((s) => [tip, ...s]);
    }
  };

  const copyTip = async (tip) => {
    try {
      await navigator.clipboard.writeText(`${tip.title} — ${tip.text}`);
      alert("Tip copied to clipboard ✨");
    } catch {
      alert("Copy failed — use manual select.");
    }
  };

  return (
    <div className="tipsRoot">
      <header className="tipsHeader">
        <div>
          <h1>💡 Self-Care & Life Tips</h1>
          <p className="tipsSub">Short, practical tips you can try today — organized by category.</p>
        </div>

        <div className="tipsActions">
          <input
            className="tipsSearch"
            placeholder="Search tips (keyword)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <nav className="tipsNav">
        {categories.map((c) => (
          <button
            key={c}
            className={c === activeCat ? "navBtn active" : "navBtn"}
            onClick={() => { setActiveCat(c); setQuery(""); }}
          >
            {c}
          </button>
        ))}

        <div className="spacer" />
        <button
          className="navBtn ghost"
          onClick={() => {
            const txt = favorites.length ? favorites.map(f => `${f.title}: ${f.text}`).join("\n\n") : "No favorites saved yet.";
            navigator.clipboard?.writeText(txt).then(() => alert("Favorites copied ✨")).catch(() => alert("Copy failed"));
          }}
        >
          Copy Favorites
        </button>
      </nav>

      <main className="tipsMain">
        <section className="tipsList">
          {filtered.length === 0 ? (
            <div className="noTips">No tips found. Try another keyword or category.</div>
          ) : (
            filtered.map((tip) => (
              <article key={tip.id} className="tipCard">
                <div className="tipLeft">
                  <div className="tipTitle">{tip.title}</div>
                  <p className="tipText">{tip.text}</p>
                </div>

                <div className="tipRight">
                  <button className="tipBtn" onClick={() => copyTip(tip)}>Copy</button>
                  <button
                    className={favorites.find((f) => f.id === tip.id) ? "tipBtn heart active" : "tipBtn heart"}
                    onClick={() => toggleFav(tip)}
                    aria-pressed={favorites.find((f) => f.id === tip.id) ? "true" : "false"}
                    title="Save to favorites"
                  >
                    {favorites.find((f) => f.id === tip.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="tipsAside">
          <div className="asideCard">
            <h3>How to use these tips</h3>
            <ul>
              <li>Pick one tip to try for a week — consistency beats intensity.</li>
              <li>Pair a tip with an existing habit (e.g., after tea, do 2 minutes of stretching).</li>
              <li>Save tips you like — review them during your weekly check-in.</li>
            </ul>
          </div>

          <div className="asideCard">
            <h3>Favorites</h3>
            {favorites.length === 0 ? (
              <p className="muted">No favorites yet — tap “Save” on any tip.</p>
            ) : (
              <ul className="favList">
                {favorites.map((f) => (
                  <li key={f.id} className="favRow">
                    <div>
                      <div className="favTitle">{f.title}</div>
                      <div className="favText">{f.text}</div>
                    </div>
                    <button className="tiny" onClick={() => setFavorites(s => s.filter(x => x.id !== f.id))}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
