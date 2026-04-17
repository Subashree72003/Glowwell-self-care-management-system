import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "./MoodGraph.css";

export default function MoodGraph() {

  const [view, setView] = useState("weekly");
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // 🔥 Mood → Number mapping
  const moodValueMap = {
    Happy: 5,
    Excited: 5,
    Calm: 4,
    Loved: 4,
    Confident: 4,
    Neutral: 3,
    Thinking: 3,
    Sad: 2,
    Anxious: 2,
    Down: 2,
    Angry: 1,
    Crying: 1,
    Furious: 1
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gw_mood_history") || "[]");

    if (saved.length === 0) return;

    // ✅ WEEKLY (last 7 entries)
    const last7 = saved.slice(0, 7).reverse();

    const weekly = last7.map((m, i) => ({
      day: `Day ${i + 1}`,
      mood: moodValueMap[m.mood] || 3
    }));

    setWeeklyData(weekly);

    // ✅ MONTHLY (group by date)
    const grouped = {};

    saved.forEach((m) => {
      const date = new Date(m.time).getDate(); // 1–31

      if (!grouped[date]) grouped[date] = [];

      grouped[date].push(moodValueMap[m.mood] || 3);
    });

    const monthly = Object.keys(grouped).map((d) => {
      const avg =
        grouped[d].reduce((a, b) => a + b, 0) / grouped[d].length;

      return {
        date: `Day ${d}`,
        mood: Math.round(avg)
      };
    });

    setMonthlyData(monthly);

  }, []);

  return (
    <div className="graphRoot">

      {/* HEADER */}
      <div className="card">
        <h1 className="mainTitle">Mood Insights 📊</h1>
        <p className="subText">
          Track your emotional patterns weekly and monthly.
        </p>

        {/* TOGGLE */}
        <div className="toggleWrap">
          <button
            className={view === "weekly" ? "toggleBtn active" : "toggleBtn"}
            onClick={() => setView("weekly")}
          >
            Weekly
          </button>

          <button
            className={view === "monthly" ? "toggleBtn active" : "toggleBtn"}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* GRAPH */}
      <div className="card">

        {view === "weekly" ? (
          <>
            <h2 className="sectionTitle">Weekly Mood 📈</h2>

            {weeklyData.length === 0 ? (
              <p>No data yet 💗</p>
            ) : (
              <div className="graphBox">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#ff5aa6"
                      fill="#ffbcd9"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="sectionTitle">Monthly Mood 🌙</h2>

            {monthlyData.length === 0 ? (
              <p>No data yet 💗</p>
            ) : (
              <div className="graphBox">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#9146ff"
                      fill="#d6c7ff"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

      </div>

      {/* INSIGHT */}
      <div className="card">
        <h2>Insight 🌿</h2>
        <p>
          Weekly view shows short-term emotions.
          Monthly view reveals deeper patterns.
        </p>

        <ul>
          <li>📊 Track emotional ups & downs</li>
          <li>🧠 Understand triggers</li>
          <li>💗 Improve mental wellness</li>
        </ul>
      </div>

      {/* AFFIRMATION */}
      <div className="card">
        <p className="affirm">
          🌷 “I observe my emotions without judgment. I grow every day.”
        </p>
      </div>

    </div>
  );
}