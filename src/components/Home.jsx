import React from "react";
import "./Home.css";

const FEATURES = [
  {
    icon: "🔥",
    title: "Habit Tracking",
    desc: "Build daily routines with streak tracking, categories, and visual progress rings.",
  },
  {
    icon: "📊",
    title: "Progress Analytics",
    desc: "See weekly trends, completion rates, and performance across all your habits.",
  },
  {
    icon: "📝",
    title: "Personal Journal",
    desc: "Write freely with mood tagging, AI prompts, and category filtering.",
  },
  {
    icon: "🎯",
    title: "Goal Dashboard",
    desc: "Set milestones, break them into steps, and track your progress day by day.",
  },
  {
    icon: "💗",
    title: "Wellness Hub",
    desc: "Track moods, practice affirmations, breathing exercises and gratitude.",
  },
  {
    icon: "🎡",
    title: "Life Wheel",
    desc: "Visualize balance across all key areas of your life with the wheel of life.",
  },
];

const WHY_CARDS = [
  {
    icon: "🌿",
    title: "Why GlowWell?",
    body: "In today's fast-paced world, stress and inconsistency take a toll. GlowWell provides a structured yet calming space to rebuild balance — one small habit at a time.",
  },
  {
    icon: "🎯",
    title: "Our Purpose",
    body: "We believe in progress over perfection. GlowWell helps you build emotional clarity and self-growth through visual tracking and a motivation-driven design.",
  },
  {
    icon: "🎓",
    title: "Who Is It For?",
    body: "Designed for students and individuals who want to strengthen focus, mental wellness, and daily discipline — without overwhelming complexity.",
  },
];

export default function Home() {
  return (
    <div className="homeWrapper">

      {/* ── HERO ── */}
      <section className="heroSection">
        <div className="heroInner">
          <div className="heroLeft">
            <div className="heroPill">🌸 Final Year MCA Project</div>
            <h1 className="heroTitle">
              Your daily<br />
              <em>self-care</em> companion
            </h1>
            <p className="heroTagline">
              GlowWell helps you build healthy routines, track your emotions,
              and grow into a more balanced, resilient version of yourself.
            </p>
            <div className="heroCTARow">
              <button className="primaryCTA">Get Started →</button>
              <button className="secondaryCTA">Learn More</button>
            </div>
          </div>

          <div className="heroStats">
            <div className="heroStatCard">
              <div className="heroStatNum">6</div>
              <div className="heroStatLabel">Core Modules</div>
            </div>
            <div className="heroStatCard">
              <div className="heroStatNum">36+</div>
              <div className="heroStatLabel">Mood Types</div>
            </div>
            <div className="heroStatCard">
              <div className="heroStatNum">∞</div>
              <div className="heroStatLabel">Daily Habits</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY GLOWWELL ── */}
      <section className="whySection">
        <p className="sectionEyebrow">About GlowWell</p>
        <h2 className="sectionHeading">Built for real people,<br />real habits</h2>
        <p className="sectionSubtext">
          GlowWell isn't just another productivity app. It's a mindful space
          designed to make self-care achievable, consistent, and meaningful.
        </p>
        <div className="cardGrid">
          {WHY_CARDS.map((card) => (
            <div className="infoCard" key={card.title}>
              <div className="infoCardIcon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="featuresSection">
        <div className="featuresInner">
          <p className="sectionEyebrow">What's Inside</p>
          <h2 className="sectionHeading">Everything you need to glow</h2>
          <p className="sectionSubtext">
            Six powerful modules, thoughtfully designed to work together.
          </p>
          <div className="featureGrid">
            {FEATURES.map((f) => (
              <div className="featureCard" key={f.title}>
                <div className="featureCardIcon">{f.icon}</div>
                <div className="featureCardBody">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section className="impactSection">
        <div className="impactCard">
          <div className="impactLeft">
            <h2>Small habits.<br />Powerful results.</h2>
            <p>
              GlowWell focuses on progress over perfection. Tracking even one
              small habit daily builds discipline naturally — and a healthier
              relationship with yourself.
            </p>
          </div>
          <div className="impactSteps">
            {[
              ["Track", "Log your habits, moods, and journal entries each day"],
              ["Reflect", "Review your analytics and patterns weekly"],
              ["Grow", "Build consistency and emotional clarity over time"],
            ].map(([title, desc], i) => (
              <div className="impactStep" key={title}>
                <div className="impactStepNum">{i + 1}</div>
                <div className="impactStepText">
                  <strong>{title}</strong> — {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ctaSection">
        <div className="ctaCard">
          <h2>Start your self-care journey today</h2>
          <p>Small habits practiced daily create powerful long-term change.</p>
          <button className="primaryCTA">Begin with GlowWell →</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="homeFooter">
        <p>© 2025 GlowWell — Final Year MCA Project · Built with care 🌸</p>
      </footer>

    </div>
  );
}