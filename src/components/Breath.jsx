// src/components/Breath.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Breath.css";

/**
 * Breath.jsx — updated breathing circle
 * - Per-phase scale + per-phase transition durations
 * - Countdown for each phase
 * - Optional video fill: put /video2.mp4 in public folder (named exactly "video2.mp4")
 */

const PATTERNS = {
  normal: [
    { id: "inhale", name: "Inhale", dur: 4, target: 0.72 }, // inhale → shrink
    { id: "hold", name: "Hold", dur: 4, target: 0.72 },     // hold → steady
    { id: "exhale", name: "Exhale", dur: 4, target: 1.25 }, // exhale → expand
  ],

  "478": [
    { id: "inhale", name: "Inhale", dur: 4, target: 0.72 }, // inhale → shrink
    { id: "hold", name: "Hold", dur: 7, target: 0.72 },     // hold → steady
    { id: "exhale", name: "Exhale", dur: 8, target: 1.25 }, // exhale → expand
  ],
};



export default function Breath() {
  const [patternKey, setPatternKey] = useState("normal");
  const [isRunning, setIsRunning] = useState(false);
  const [phaseName, setPhaseName] = useState("Ready");
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [rounds, setRounds] = useState(0);

  // visuals
  const [circleScale, setCircleScale] = useState(1);
  const [transitionDuration, setTransitionDuration] = useState(1);

  // video presence
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  const intervalRef = useRef(null);
  const phaseIndexRef = useRef(0);

  const getPattern = (key) => PATTERNS[key] || PATTERNS.normal;

  // detect video existence / readiness (public/video2.mp4)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setVideoReady(true);
    const onError = () => setVideoReady(false);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

    // try to load (browser will request file if present)
    v.load();

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, []);

  // start breathing session
  const startSession = () => {
    if (isRunning) return;
    const pattern = getPattern(patternKey);

    phaseIndexRef.current = 0;
    setIsRunning(true);
    setSessionSeconds(0);
    setRounds(0);

    const first = pattern[0];
    setPhaseName(first.name);
    setPhaseLeft(first.dur);
    setTransitionDuration(first.dur);
    setCircleScale(first.target);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSessionSeconds((s) => s + 1);

      setPhaseLeft((left) => {
        const newLeft = left - 1;

        if (newLeft <= 0) {
          // advance
          const pat = getPattern(patternKey);
          phaseIndexRef.current = (phaseIndexRef.current + 1) % pat.length;
          const nextPhase = pat[phaseIndexRef.current];

          if (phaseIndexRef.current === 0) {
            setRounds((r) => r + 1);
          }

          // small delay to let transform settle
          setTimeout(() => {
            setPhaseName(nextPhase.name);
            setPhaseLeft(nextPhase.dur);
            setTransitionDuration(nextPhase.dur);
            setCircleScale(nextPhase.target);
          }, 60);

          return 0;
        }

        return newLeft;
      });
    }, 1000);
  };

  const stopSession = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setPhaseName("Stopped");
    setPhaseLeft(0);
    setTransitionDuration(0.4);
    setCircleScale(1);
  };

  // when pattern changes, stop and reset visuals
  useEffect(() => {
    stopSession();
    setPhaseName("Ready");
    setPhaseLeft(0);
    setCircleScale(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternKey]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="breathPage">
      <header className="breathHeader">
        <h1>Breathing Exercises for Instant Calm</h1>
        <p className="breathIntroSmall">
          Follow the circle: inhale as it grows, hold when steady, exhale as it shrinks.
        </p>
      </header>

      <section className="card introCard">
        <h2>Feel the calm with every breath</h2>
        <p>Select a pattern, press Start, and follow the rhythm.</p>
      </section>

      <section className="card centerCard">
        <div className="circleWrap">
          <div
            className="breathCircle"
            role="img"
            aria-label={`Breathing circle - ${phaseName}`}
            style={{
              transform: `scale(${circleScale})`,
              transition: `transform ${transitionDuration}s ease-in-out`,
            }}
          >
            {/* optional video fill; put public/video2.mp4 to enable */}
            <video
              ref={videoRef}
              src="/video2.mp4"
              loop
              muted
              playsInline
              style={{
                display: videoReady ? "block" : "none",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
              aria-hidden
            />
          </div>

          <div className="circleOverlay" aria-hidden={false}>
            <div className="phaseLabel">{phaseName}</div>
            <div className="phaseCountdown">{phaseLeft > 0 ? `${phaseLeft}s` : "-"}</div>

            <div className="sessionStats" aria-hidden>
              <div>
                Session: {pad(Math.floor(sessionSeconds / 60))}:{pad(sessionSeconds % 60)}
              </div>
              <div>Rounds: {rounds}</div>
            </div>
          </div>
        </div>

        <div className="controlsRow">
          {!isRunning ? (
            <button
              className="primaryBtn"
              onClick={startSession}
              aria-pressed="false"
            >
              ▶ Start Session
            </button>
          ) : (
            <button
              className="primaryBtn stop"
              onClick={stopSession}
              aria-pressed="true"
            >
              ■ Stop
            </button>
          )}

          <div className="patternSelect" aria-hidden={isRunning}>
            <label htmlFor="patternSelect" style={{ fontWeight: 700 }}>
              Pattern:
            </label>
            <select
              id="patternSelect"
              value={patternKey}
              onChange={(e) => {
                stopSession();
                setPatternKey(e.target.value);
              }}
              disabled={isRunning}
              style={{ opacity: isRunning ? 0.6 : 1 }}
            >
              <option value="normal">Normal (4/4)</option>
              <option value="478">4 - 7 - 8</option>
            </select>
          </div>
        </div>

       
      </section>

      {/* Patterns info */}
      <section className="breathPatternsCard">
        <h2 className="breathSectionTitle">Available Breathing Patterns</h2>

        <div className="patternGrid">
          <div className="patternBox">
            <h3>Normal Breathing (4 / 4)</h3>
            <ul>
              <li>Inhale for 4 seconds</li>
              <li>Exhale for 4 seconds</li>
              <li>Ideal for beginners</li>
              <li>Quick relaxation</li>
            </ul>
          </div>

          <div className="patternBox">
            <h3>4 – 7 – 8 Breathing</h3>
            <ul>
              <li>Inhale 4 seconds</li>
              <li>Hold 7 seconds</li>
              <li>Exhale 8 seconds</li>
              <li>Helps anxiety & sleep</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Techniques & Why */}
      <section className="breathTechniquesCard">
        <h2 className="breathSectionTitle">10 Breathing Exercises for Stress Relief</h2>
        <ol className="techList">
          <li>
            <h3>Pursed lip breathing</h3>
            <p>Inhale through nose for 2s, exhale through pursed lips for 4s.</p>
          </li>
          <li>
            <h3>Diaphragmatic breathing</h3>
            <p>Place hand on belly. Inhale to expand belly, exhale slowly.</p>
          </li>
          <li>
            <h3>Breath focus</h3>
            <p>Inhale calm, exhale tension with a focus word.</p>
          </li>
          <li>
            <h3>Lion’s breath</h3>
            <p>Open mouth and exhale loudly to release stress.</p>
          </li>
          <li>
            <h3>Alternate nostril breathing</h3>
            <p>Inhale left, exhale right. Switch. Repeat 3–5 minutes.</p>
          </li>
          <li>
            <h3>Equal breathing</h3>
            <p>Inhale & exhale for equal counts.</p>
          </li>
          <li>
            <h3>Coherent breathing</h3>
            <p>5 breaths per minute to calm nerves.</p>
          </li>
          <li>
            <h3>Sitali breath</h3>
            <p>Inhale through rolled tongue to cool body.</p>
          </li>
          <li>
            <h3>Deep breathing</h3>
            <p>Inhale deeply, hold, and exhale slowly.</p>
          </li>
          <li>
            <h3>Humming bee breath</h3>
            <p>Hum while exhaling to soothe the mind.</p>
          </li>
        </ol>
      </section>

      <section className="breathWhyCard">
        <h2>Why Deep Breathing Matters</h2>
        <ul>
          <li>Reduces anxiety & stress</li>
          <li>Improves sleep quality</li>
          <li>Calms rapid thoughts</li>
          <li>Boosts oxygen flow</li>
          <li>Stabilizes the nervous system</li>
        </ul>
      </section>

      <section className="card affirmCard">
        <h3>Affirmations to Support Your Calm</h3>
        <p>“You are safe.”</p>
        <p>“You deserve peace.”</p>
        <p>“Every breath restores your energy.”</p>
      </section>

      {!isRunning && rounds > 0 && (
        <section className="card endCard">
          <h3>Session Complete ✨</h3>
          <p>
            Total: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s | Rounds: {rounds}
          </p>
        </section>
      )}
    </div>
  );
}
