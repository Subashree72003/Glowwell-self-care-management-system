// src/components/Affirm.jsx
import React, { useState, useEffect, useRef } from "react";
import "./Affirm.css";

export default function Affirm() {
  const [currentAffirm, setCurrentAffirm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [category, setCategory] = useState("all");
  const [autoPlay, setAutoPlay] = useState(false);
  const [search, setSearch] = useState("");

  // ===================== AFFIRMATION DATA =====================
  const affirmData = {
    all: [
      "I deserve good things in life.",
      "I am becoming a better version of myself every day.",
      "I welcome more joy into my life.",
      "I am safe, I am grounded, I am present.",
      "I choose calm in this moment.",
      "I am healing at my own pace.",
    ],
    selflove: [
      "I honor my emotions without judgment.",
      "I am enough just as I am.",
      "My heart is strong, gentle, and kind.",
      "I choose to be kind to myself.",
    ],
    confidence: [
      "I believe in my abilities.",
      "I am capable of achieving great things.",
      "Challenges help me grow stronger.",
      "My potential is unlimited.",
    ],
    calm: [
      "Peace flows through me with every breath.",
      "I choose patience over reaction.",
      "My mind is a steady, peaceful place.",
    ],
    healing: [
      "I forgive myself and move forward.",
      "I am healing at my own pace.",
      "Every breath I take brings calmness.",
    ],
    goals: [
      "I am moving closer to my goals every day.",
      "My future is full of possibilities.",
      "I attract abundance and opportunities.",
    ],
    mind: [
      "My mind is focused and clear.",
      "I release thoughts that no longer serve me.",
      "I trust the path I am on.",
    ],
  };

  // ===================== DAILY AFFIRMATION LOAD =====================
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("gw_daily_affirm_date");

    if (savedDate !== today) {
      const newAff =
        affirmData.all[Math.floor(Math.random() * affirmData.all.length)];
      localStorage.setItem("gw_daily_affirm_text", newAff);
      localStorage.setItem("gw_daily_affirm_date", today);
    }

    setCurrentAffirm(localStorage.getItem("gw_daily_affirm_text"));
  }, []);

  const list = category === "all" ? affirmData.all : affirmData[category];

  // ===================== GENERATE =====================
  const generateAffirm = () => {
    const random = list[Math.floor(Math.random() * list.length)];
    setCurrentAffirm(random);
  };

  // ===================== AUTO-PLAY =====================
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => generateAffirm(), 5000);
    return () => clearInterval(timer);
  }, [autoPlay, category]);

  // ===================== FAVORITES LOAD =====================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gw_affirm_fav") || "[]");
    setFavorites(saved);
  }, []);

  // ===================== SAVE FAVORITE =====================
  const saveFav = () => {
    if (!currentAffirm) return;

    const newFav = {
      id: Date.now(),
      text: currentAffirm,
      date: new Date().toLocaleString(),
    };

    const updated = [newFav, ...favorites];
    setFavorites(updated);
    localStorage.setItem("gw_affirm_fav", JSON.stringify(updated));
  };

  // ===================== DELETE FAVORITE =====================
  const deleteFav = (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("gw_affirm_fav", JSON.stringify(updated));
    setConfirmDelete(null);
  };

  // ===================== COPY =====================
  const copyAffirm = () => {
    navigator.clipboard.writeText(currentAffirm);
    alert("Copied to clipboard! 📋✨");
  };

  // ================================================================
  //                          UI
  // ================================================================
  return (
    <div className="affirmRoot">

      {/* HEADER */}
      <div className="card">
        <h1 className="headingGlow">✨ Affirmation Generator</h1>
        <p className="subGlow">
          Calm your mind & uplift your heart — one affirmation at a time.
        </p>

        <div className="categoryBar">
          {["all","selflove","confidence","calm","healing","goals","mind"].map((cat) => (
            <button
              key={cat}
              className={category === cat ? "catBtn active" : "catBtn"}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "All" :
               cat === "selflove" ? "💗 Self-Love" :
               cat === "confidence" ? "💪 Confidence" :
               cat === "calm" ? "😌 Calm" :
               cat === "healing" ? "🌿 Healing" :
               cat === "goals" ? "🎯 Goals" :
               "🧘 Mind"}
            </button>
          ))}
        </div>
      </div>

      {/* AFFIRM BOX */}
      <div className="card affirmBox">
        {currentAffirm ? (
          <div className="affirmGlow">
            <p className="affirmTextFade">{currentAffirm}</p>

            <div className="affirmActions">
              <button className="pinkBtn" onClick={saveFav}>💖 Save</button>
              <button className="pinkBtn" onClick={copyAffirm}>📋 Copy</button>
            </div>
          </div>
        ) : (
          <p className="noAffirm">Click generate to begin ✨</p>
        )}

        <button className="generateBtn" onClick={generateAffirm}>
          ✨ Generate Affirmation
        </button>

        <button
          className={autoPlay ? "autoBtn active" : "autoBtn"}
          onClick={() => setAutoPlay(!autoPlay)}
        >
          {autoPlay ? "⏸ Stop Auto-Play" : "▶ Start Auto-Play"}
        </button>
      </div>

      {/* FAVORITES */}
      <div className="card">
        <h2 className="favHeading">💗 Favorites</h2>

        <input
          className="searchBar"
          placeholder="Search your affirmations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {favorites.length === 0 ? (
          <p className="noFav">No saved affirmations yet...</p>
        ) : (
          <ul className="favList">
            {favorites
              .filter((f) =>
                f.text.toLowerCase().includes(search.toLowerCase())
              )
              .map((fav) => (
                <li key={fav.id} className="favItem">
                  <p className="favText">{fav.text}</p>
                  <p className="favDate">{fav.date}</p>

                  <button className="deleteBtn" onClick={() => setConfirmDelete(fav.id)}>
                    ❌
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* DELETE POPUP */}
      {confirmDelete && (
        <div className="popupOverlay">
          <div className="popupBox">
            <p>Delete this affirmation?</p>
            <div className="popupActions">
              <button className="yesBtn" onClick={() => deleteFav(confirmDelete)}>Yes</button>
              <button className="noBtn" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
