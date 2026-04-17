import React, { useRef, useState, useEffect } from "react";
import "./Wheel.css";

const TASKS = {
  Health: {
    daily: ["Drink 2–3 liters of water", "10-minute stretching", "Eat one fruit", "15–20 min walk"],
    weekly: ["Meal prep for 3–4 days", "30 min workout (3x/wk)", "Track sleep hours"],
    reflection: ["How is my energy level this week?", "What one change will improve my health next week?"]
  },
  Relationships: {
    daily: ["Call/text a loved one", "Spend quality time", "Express gratitude to someone"],
    weekly: ["Plan a small outing", "Resolve a pending misunderstanding"],
    reflection: ["Am I listening more than reacting?", "Who makes me feel valued?"]
  },
  Career: {
    daily: ["Complete one meaningful task", "Learn something new (10-20 min)"],
    weekly: ["Apply for opportunities", "Update resume/portfolio"],
    reflection: ["Am I growing or staying stuck?", "One small step to improve my career?"]
  },
  Finances: {
    daily: ["Track expenses", "Avoid impulse spending"],
    weekly: ["Set a small budget", "Review bank balance"],
    reflection: ["Where did I overspend?", "One thing to save next week?"]
  },
  "Personal Growth": {
    daily: ["Read 10 minutes", "Practice mindfulness"],
    weekly: ["Attend one workshop", "Try a new hobby"],
    reflection: ["What did I learn about myself?", "Which habit helped me grow?"]
  },
  "Fun & Recreation": {
    daily: ["Listen to favourite music", "Spend 10 minutes on hobby"],
    weekly: ["Plan a mini break", "Try a new activity"],
    reflection: ["Did I allow myself to enjoy life today?", "What makes me happiest?"]
  },
  "Home Environment": {
    daily: ["Make your bed", "Declutter one small area"],
    weekly: ["Deep clean a corner", "Organize clothes"],
    reflection: ["Does my space feel peaceful?", "One improvement to feel relaxed?"]
  },
  "Mental Wellness": {
    daily: ["5 min deep breathing", "One positive affirmation"],
    weekly: ["Journal your thoughts", "Talk to someone you trust"],
    reflection: ["What emotions affected me most this week?", "What protects my mental peace?"]
  }
};

function formatDateTime(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const time = d.toLocaleTimeString();
  return `${dd}/${mm}/${yyyy} ${time}`;
}
function dateKey(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function Wheel() {
  const sectors = Object.keys(TASKS);
  const wheelRef = useRef(null);
  const currentRotation = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedMode, setSelectedMode] = useState("daily"); // daily | weekly | reflection
  const [selectedChecks, setSelectedChecks] = useState([]); // for daily/weekly
  const [reflectionText, setReflectionText] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const [dailyHistory, setDailyHistory] = useState([]);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [reflectionHistory, setReflectionHistory] = useState([]);

  useEffect(() => {
    setDailyHistory(JSON.parse(localStorage.getItem("gw_wheel_daily_history") || "[]"));
    setWeeklyHistory(JSON.parse(localStorage.getItem("gw_wheel_weekly_history") || "[]"));
    setReflectionHistory(JSON.parse(localStorage.getItem("gw_wheel_reflection_history") || "[]"));
  }, []);

  // SPIN logic (smooth easing)
  const spin = () => {
    if (isSpinning) return;
    setResult(null);
    setIsSpinning(true);
    if (wheelRef.current) {
      wheelRef.current.classList.add("spinning");
      wheelRef.current.classList.remove("stopped");
    }

    const chosenIndex = Math.floor(Math.random() * sectors.length);
    const sectorAngle = 360 / sectors.length;
    const sectorStart = chosenIndex * sectorAngle;
    const offsetInside = Math.random() * sectorAngle;
    const finalAngle = 360 - (sectorStart + offsetInside);

    const extra = 6 + Math.floor(Math.random() * 4);
    const target = currentRotation.current + extra * 360 + finalAngle;
    const duration = 4200 + Math.floor(Math.random() * 900);
    const start = performance.now();
    const startRot = currentRotation.current;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function animate(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const newRot = startRot + (target - startRot) * eased;
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${newRot}deg)`;
      if (t < 1) requestAnimationFrame(animate);
      else {
        currentRotation.current = target % 360;
        if (wheelRef.current) {
          wheelRef.current.classList.remove("spinning");
          setTimeout(() => wheelRef.current && wheelRef.current.classList.add("stopped"), 120);
        }
        setIsSpinning(false);
        const normalized = (360 - (currentRotation.current % 360) + 360) % 360;
        const finalIndex = Math.floor(normalized / sectorAngle) % sectors.length;
        setResult(sectors[finalIndex]);
        setSelectedChecks([]);
        setReflectionText("");
        setSelectedMode("daily");
      }
    }
    requestAnimationFrame(animate);
  };

  // toggle checkbox
  const toggleCheck = (task) => {
    setSelectedChecks((s) => (s.includes(task) ? s.filter((x) => x !== task) : [...s, task]));
  };

  // Save selected tasks (daily/weekly)
  const saveSelectedTasks = () => {
    if (!result) return alert("Spin and choose a focus area first.");
    if (selectedChecks.length === 0) return alert("Please tick at least one task to save.");

    const entry = {
      dateKey: dateKey(),
      dateTime: formatDateTime(),
      area: result,
      tasks: selectedChecks.slice()
    };
    if (selectedMode === "daily") {
      const updated = [entry, ...dailyHistory];
      setDailyHistory(updated);
      localStorage.setItem("gw_wheel_daily_history", JSON.stringify(updated));
    } else {
      const updated = [entry, ...weeklyHistory];
      setWeeklyHistory(updated);
      localStorage.setItem("gw_wheel_weekly_history", JSON.stringify(updated));
    }
    setSelectedChecks([]);
    alert("Saved ✅ — you can view it in History.");
  };

  // Save reflection
  const saveReflection = () => {
    if (!result) return alert("Spin and choose a focus area first.");
    if (!reflectionText.trim()) return alert("Write something for reflection before saving.");

    const entry = {
      dateKey: dateKey(),
      dateTime: formatDateTime(),
      area: result,
      text: reflectionText.trim()
    };
    const updated = [entry, ...reflectionHistory];
    setReflectionHistory(updated);
    localStorage.setItem("gw_wheel_reflection_history", JSON.stringify(updated));
    setReflectionText("");
    alert("Reflection saved ✅");
  };

  // Group history by dateKey (A style requested)
  const groupByDate = (arr) => {
    const grouped = {};
    arr.forEach((e) => {
      const k = e.dateKey || dateKey(new Date(e.dateTime ? new Date(e.dateTime) : new Date()));
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(e);
    });
    // return entries sorted by date descending
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const [ad, am, ay] = a.split("-").map(Number);
      const [bd, bm, by] = b.split("-").map(Number);
      const da = new Date(ay, am - 1, ad);
      const db = new Date(by, bm - 1, bd);
      return db - da;
    });
    return sortedKeys.map((k) => ({ date: k, items: grouped[k] }));
  };

  // render tasks list (checkbox mode)
  const renderTasksForMode = () => {
    if (!result) return <div className="blankMsg">Spin the wheel to choose a focus area</div>;
    const areaObj = TASKS[result];
    if (!areaObj) return null;
    if (selectedMode === "reflection") {
      return (
        <div className="reflectionBox">
          <h4>Reflection Prompts 🌿</h4>
          {areaObj.reflection.map((q, idx) => (
            <div key={idx} className="reflectPrompt">
              <div className="promptLabel">✍️ {q}</div>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write your reflection here..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="saveBtnPink" onClick={saveReflection}>Save Reflection</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const list = selectedMode === "daily" ? areaObj.daily : areaObj.weekly;
    return (
      <div className="tasksListWrap">
        <h4>{selectedMode === "daily" ? "Daily Tasks" : "Weekly Tasks"}</h4>
        <ul className="tasksCheckboxList">
          {list.map((t, i) => (
            <li key={i}>
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  checked={selectedChecks.includes(t)}
                  onChange={() => toggleCheck(t)}
                />
                <span className="taskText">{t}</span>
              </label>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className="saveBtnPink" onClick={saveSelectedTasks}>Save Selected Tasks</button>
        </div>
      </div>
    );
  };

  // render history card (ONLY this toggles)
  const renderHistoryCard = () => {
    const gDaily = groupByDate(dailyHistory);
    const gWeekly = groupByDate(weeklyHistory);
    const gRef = groupByDate(reflectionHistory);

    return (
      <div className="historyCardBottom">
        <h3>Mood / Wheel History</h3>

        <div className="historySection">
          <h4>Daily Tasks History</h4>
          {gDaily.length === 0 ? <p className="mutedSmall">No daily tasks saved yet.</p> :
            gDaily.map((g) => (
              <div key={g.date} className="historyGroup">
                <div className="historyDate">{g.date}</div>
                <ul>
                  {g.items.map((it, idx) => (
                    <li key={idx} className="historyItemRow">
                      <strong>{it.area}</strong>: {it.tasks.join(", ")} <span className="timeRight">{it.dateTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>

        <div className="historySection">
          <h4>Weekly Tasks History</h4>
          {gWeekly.length === 0 ? <p className="mutedSmall">No weekly tasks saved yet.</p> :
            gWeekly.map((g) => (
              <div key={g.date} className="historyGroup">
                <div className="historyDate">{g.date}</div>
                <ul>
                  {g.items.map((it, idx) => (
                    <li key={idx} className="historyItemRow">
                      <strong>{it.area}</strong>: {it.tasks.join(", ")} <span className="timeRight">{it.dateTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>

        <div className="historySection">
          <h4>Reflection History</h4>
          {gRef.length === 0 ? <p className="mutedSmall">No reflections saved yet.</p> :
            gRef.map((g) => (
              <div key={g.date} className="historyGroup">
                <div className="historyDate">{g.date}</div>
                <ul>
                  {g.items.map((it, idx) => (
                    <li key={idx} className="historyItemRow">
                      <strong>{it.area}</strong>: {it.text} <span className="timeRight">{it.dateTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <div className="moduleRoot wheelModule">
      <div className="wheelCardTop">
        <h2 className="wheelTitleTop">Wheel of Life — Spin for a Focus Area 🎡</h2>
        <p className="wheelDescTop">Spin to choose an area — then save daily/weekly progress or write a reflection.</p>

        <div className="wheelStageWrap">
          <div className="wheelPointer">▼</div>
 <svg
  ref={wheelRef}
  className="wheelSvg"
  viewBox="-220 -220 440 440"
  style={{ width: "420px", height: "420px" }}
>
  <defs>
    <linearGradient id="slicePink" x1="0" x2="1">
      <stop offset="0%" stopColor="#ffd4e8" />
      <stop offset="100%" stopColor="#ffeaf6" />
    </linearGradient>

    <linearGradient id="sliceLav" x1="0" x2="1">
      <stop offset="0%" stopColor="#e8d7ff" />
      <stop offset="100%" stopColor="#f3e6ff" />
    </linearGradient>
  </defs>

  {/* OUTER LIGHT RING */}
  <circle r="215" fill="rgba(255,255,255,0.4)" />

  {sectors.map((sec, i) => {
    const angleStart = (i * 360) / sectors.length;
    const angleEnd = ((i + 1) * 360) / sectors.length;

    const startRad = (angleStart * Math.PI) / 180;
    const endRad = (angleEnd * Math.PI) / 180;

    const x1 = Math.cos(startRad) * 200;
    const y1 = Math.sin(startRad) * 200;

    const x2 = Math.cos(endRad) * 200;
    const y2 = Math.sin(endRad) * 200;

    const midAngle = (angleStart + angleEnd) / 2;
    const midRad = (midAngle * Math.PI) / 180;

    const textX = Math.cos(midRad) * 120;
    const textY = Math.sin(midRad) * 120;

    const displayText = sec.replace(/ & /g, "\n& ");

    return (
      <g key={sec}>
        <path
          d={`M 0 0 L ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} Z`}
          fill={i % 2 === 0 ? "url(#slicePink)" : "url(#sliceLav)"}
          stroke="#ffffffaa"
          strokeWidth="1"
        />

        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${midAngle} ${textX} ${textY})`}
          style={{
            fontSize: "14px",
            fontWeight: "700",
            fill: "#5a2d55",
            whiteSpace: "pre-line",
            lineHeight: "1.2",
          }}
        >
          {displayText}
        </text>
      </g>
    );
  })}

  {/* INNER CIRCLE */}
  <circle r="55" fill="white" stroke="#f5cfe6" strokeWidth="3" />
  
  <text
    x="0"
    y="5"
    textAnchor="middle"
    style={{
      fontSize: "20px",
      fontWeight: "800",
      fill: "#b02b79"
    }}
  >
    Spin
  </text>
</svg>


        </div>

        <div className="wheelActions">
          <button className="wheelBtn" onClick={spin} disabled={isSpinning}>
            {isSpinning ? "Spinning…" : "Spin the Wheel"}
          </button>
        </div>
      </div>

      {/* Result + mode + tasks/reflection */}
      <div className="wheelResultWrap">
        <div className="resultHeader">
          <h3>🎯 Focus Area: {result || "—"}</h3>

          <div className="modeButtons">
            <button className={selectedMode === "daily" ? "modeBtn active" : "modeBtn"} onClick={() => setSelectedMode("daily")}>Daily</button>
            <button className={selectedMode === "weekly" ? "modeBtn active" : "modeBtn"} onClick={() => setSelectedMode("weekly")}>Weekly</button>
            <button className={selectedMode === "reflection" ? "modeBtn active" : "modeBtn"} onClick={() => setSelectedMode("reflection")}>Reflection</button>
          </div>
        </div>

        <div className="taskAreaCard">
          {renderTasksForMode()}
        </div>

        {/* History toggle button */}
        <div style={{ marginTop: 12 }}>
          <button className="historyToggleBtn" onClick={() => setShowHistory((s) => !s)}>
            {showHistory ? "Close History" : "Show History"}
          </button>
        </div>

        {/* ONLY THIS CARD TOGGLES */}
        {showHistory && renderHistoryCard()}
      </div>
    </div>
  );
}
