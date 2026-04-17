import React from "react";
import "./Sidebar.css";

const NAV = [
  { id: "home",    icon: "🏠", label: "Home"             },
  { id: "mood",    icon: "💗", label: "Wellness Hub"     },
  { id: "habit",   icon: "🔥", label: "Habit Tracker"   },
  { id: "journal", icon: "📝", label: "Journal"          },
  { id: "goals",   icon: "🎯", label: "Goals"            },
  { id: "graphs",  icon: "📊", label: "Mood Analytics"  },
];

export default function Sidebar({ active, onChange }) {
  return (
    <div className="sidebarRoot">

      {/* LOGO */}
      <div className="sideHeader">
        <div className="sideLogoRow">
          <div className="sideLogoIcon">🌸</div>
          <h1 className="sideTitle">GlowWell</h1>
        </div>
        <p className="sideSubtitle">Self-Care System</p>
      </div>

      {/* MENU */}
      <nav className="sideMenu">
        <div className="sideSectionLabel">Navigation</div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`sideBtn ${active === item.id ? "active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <span className="sideBtnIcon">{item.icon}</span>
            <span className="sideBtnLabel">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="sideFooter">
        <div className="sideFooterInner">
          <div className="sideFooterDot" />
          <span className="sideFooterText">Progress over perfection ✨</span>
        </div>
      </div>

    </div>
  );
}