import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// MAIN MODULES ONLY
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Mood from "./components/Mood";
import MoodGraph from "./components/MoodGraph";
import Habit from "./components/Habit";
import Goals from "./components/Goals";
import Journal from "./components/Journal";

export default function App() {
  const [active, setActive] = useState("home");

  const bgAudio = useRef(null);

  useEffect(() => {
    if (bgAudio.current) {
      bgAudio.current.loop = true;
      bgAudio.current.volume = 0.5;
      bgAudio.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="gw-app">
      {/* Background Music */}
      <audio ref={bgAudio} src="/calm.mp3" preload="auto" style={{ display: "none" }} />

      {/* Sidebar */}
      <Sidebar active={active} onChange={setActive} />

      {/* Content */}
      <div className="gw-content">
        {active === "home" && <Home />}
        {active === "mood" && <Mood />}
        {active === "habit" && <Habit />}
        {active === "journal" && <Journal />}
        {active === "goals" && <Goals />}
        {active === "graphs" && <MoodGraph />}
      </div>
    </div>
  );
}