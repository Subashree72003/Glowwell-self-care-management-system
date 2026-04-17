import React, { useEffect, useMemo, useState } from "react";
import "./Gratitude.css";

const API = "http://localhost:5000";
const DEFAULT_EMOJIS = ["🌸","💗","🙏","😊","✨","🌞","🌙","🍵","📚","🎵"];
const CATEGORIES = ["Personal","Relationships","Health","Study","Work","Small Joys","Other"];

function dateKeyISO(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function Gratitude() {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState(DEFAULT_EMOJIS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [sortBy, setSortBy] = useState("new");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load from backend
  useEffect(() => {
    fetch(`${API}/api/gratitude`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setList(data.data);
      })
      .catch(() => {
        const saved = JSON.parse(localStorage.getItem("gw_gratitude_v2") || "[]");
        setList(saved);
      });
  }, []);

  const addEntry = async () => {
    const note = text.trim();
    if (!note) return;

    const entry = {
      note,
      emoji,
      category,
      private: !!isPrivate,
      fav: false,
      date: dateKeyISO(new Date()),
      time: new Date().toLocaleTimeString()
    };

    try {
      const res = await fetch(`${API}/api/gratitude`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      const data = await res.json();
      if (data.success) {
        setList(prev => [data.data, ...prev]);
        setText("");
        setEmoji(DEFAULT_EMOJIS[0]);
        setCategory(CATEGORIES[0]);
        setIsPrivate(false);
        const el = document.querySelector(".gratToast");
        if (el) { el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1600); }
      }
    } catch (err) {
      console.error("Backend error", err);
    }
  };

  const toggleFav = (id) => {
    const updated = list.map(l => l._id === id || l.id === id ? { ...l, fav: !l.fav } : l);
    setList(updated);
  };

  const removeEntry = async (id) => {
    try {
      await fetch(`${API}/api/gratitude/${id}`, { method: "DELETE" });
      setList(prev => prev.filter(l => (l._id?.toString() || l.id) !== id));
    } catch (err) {
      setList(prev => prev.filter(l => (l._id?.toString() || l.id) !== id));
    }
    setConfirmDelete(null);
  };

  const clearAll = () => {
    if (!window.confirm("Clear ALL gratitude entries?")) return;
    setList([]);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "glowwell_gratitude_export.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    let arr = [...list];
    if (onlyFav) arr = arr.filter(x => x.fav);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(x => x.note.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
    }
    if (sortBy === "new") arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortBy === "old") arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (sortBy === "category") arr.sort((a, b) => a.category.localeCompare(b.category));
    return arr;
  }, [list, onlyFav, search, sortBy]);

  const today = list[0] && list[0].date === dateKeyISO(new Date()) ? list[0] : null;

  const weeklyCounts = useMemo(() => {
    const res = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      res[dateKeyISO(d)] = 0;
    }
    list.forEach(item => { if (res[item.date] !== undefined) res[item.date] += 1; });
    return res;
  }, [list]);

  return (
    <div className="gratRootV2">
      <div className="gratTop">
        <div>
          <h1>💗 Gratitude Journal</h1>
          <p className="gratSub">Collect tiny grateful moments — sunlight, a kind word, one deep breath.</p>
        </div>
        <div className="gratControls">
          <div className="smallStats">
            <div className="statItem"><div className="statNum">{list.length}</div><div className="statLabel">Entries</div></div>
            <div className="statItem"><div className="statNum">{Object.values(weeklyCounts).reduce((a,b)=>a+b,0)}</div><div className="statLabel">Last 7 days</div></div>
          </div>
          <div className="topBtns">
            <button className="ghostBtn" onClick={exportJSON}>Export JSON</button>
            <button className="dangerBtn" onClick={clearAll}>Clear All</button>
          </div>
        </div>
      </div>

      <section className="gratAddSection">
        <div className="gratCard">
          <div className="left">
            <div className="emojiPickerRow">
              {DEFAULT_EMOJIS.map(e => (
                <button key={e} className={`emojiPick ${emoji === e ? "active" : ""}`} onClick={() => setEmoji(e)}>{e}</button>
              ))}
            </div>
            <textarea className="gratTextareaV2" placeholder="What are you grateful for today?" value={text} onChange={(e) => setText(e.target.value)} />
            <div className="metaRow">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="privateToggle">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                Private
              </label>
              <button className="addBtn primary" onClick={addEntry}>Add Gratitude ✨</button>
            </div>
          </div>

          <div className="right">
            <div className="todayCard">
              <div className="todayLabel">Today's Highlight</div>
              {today ? (
                <>
                  <div className="todayEmoji">{today.emoji}</div>
                  <div className="todayNote">{today.private ? "— Private entry —" : today.note}</div>
                  <div className="todayTime">{today.date} • {today.time}</div>
                </>
              ) : (
                <div className="todayEmpty">Add your first gratitude for today 💗</div>
              )}
            </div>
            <div className="weekMini">
              {Object.entries(weeklyCounts).map(([k, v]) => (
                <div key={k} className="weekMiniRow">
                  <div className="wLabel">{k.slice(5)}</div>
                  <div className="wBar"><div className="wFill" style={{ width: `${Math.min(100, v * 20)}%` }} /></div>
                  <div className="wNum">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="gratListSection">
        <div className="listControls">
          <input className="searchInput" placeholder="Search notes or categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="filterGroup">
            <button className={`chip ${onlyFav ? "active" : ""}`} onClick={() => setOnlyFav(s => !s)}>⭐ Favorites</button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        <div className="gratList">
          {filtered.length === 0 ? (
            <div className="emptyState">No entries found ✨</div>
          ) : (
            filtered.map(item => {
              const itemId = item._id?.toString() || item.id;
              return (
                <div key={itemId} className="gratItem">
                  <div className="itemLeft">
                    <div className="itemEmoji">{item.emoji}</div>
                    <div className="itemBody">
                      <div className="itemNote">{item.private ? "— Private entry —" : item.note}</div>
                      <div className="itemMeta">
                        <span className="itemCat">{item.category}</span>
                        <span className="itemTime">{item.date} • {item.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="itemActions">
                    <button className={`iconBtn ${item.fav ? "active" : ""}`} onClick={() => toggleFav(itemId)}>⭐</button>
                    <button className="iconBtn" onClick={() => setConfirmDelete(itemId)}>🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="gratToast">Saved ✨</div>

      {confirmDelete && (
        <div className="modalOverlay" onClick={() => setConfirmDelete(null)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <p>Delete this gratitude?</p>
            <div className="modalActions">
              <button className="primary" onClick={() => removeEntry(confirmDelete)}>Yes, delete</button>
              <button className="ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
