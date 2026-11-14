import { useRef } from "react";
import astronaut from "../assets/hero-astronaut.png";
import marsVideo from "../assets/rotating-mars.mp4";
import "./CinematicLanding.css";

const features = [
  {
    number: "01",
    icon: "◈",
    title: "Mars Terrain",
    description: "Explore imagery and inspect simulated Martian surface conditions.",
  },
  {
    number: "02",
    icon: "◇",
    title: "Hazards & Science",
    description: "Discover hazard zones and scientific locations across the mission area.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Route Intelligence",
    description: "Generate exploration routes and evaluate simulated mission risks.",
  },
];

export default function CinematicLanding() {
  const cursorRef = useRef(null);

  function moveCursor(event) {
    if (cursorRef.current && event.pointerType === "mouse") {
      cursorRef.current.style.left = `${event.clientX}px`;
      cursorRef.current.style.top = `${event.clientY}px`;
      cursorRef.current.style.opacity = "1";
    }
  }

  function hideCursor() {
    if (cursorRef.current) {
      cursorRef.current.style.opacity = "0";
    }
  }

  function enterMission() {
    document.getElementById("mission-dashboard")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <div
      className="oo-landing"
      onPointerMove={moveCursor}
      onPointerLeave={hideCursor}
    >
      <div ref={cursorRef} className="oo-cursor" aria-hidden="true">
        <img src={astronaut} alt="" />
      </div>

      <section className="oo-hero" id="mission-home">
        <div className="oo-stars" aria-hidden="true" />

        <nav className="oo-navigation">
          <a href="#mission-home" className="oo-brand">
            <span className="oo-brand-mark">◎</span>
            ORBIT <span>&</span> ORIGIN
          </a>

          <span className="oo-mission-label">
            <i /> EXPLORATION SYSTEM
          </span>

          <button className="oo-nav-action" onClick={enterMission}>
            ENTER MISSION ↗
          </button>
        </nav>

        <div className="oo-hero-layout">
          <div className="oo-copy">
            <p className="oo-eyebrow">
              NASA SPACE APPS · SAFER MARSWALKS
            </p>

            <h1>
              THE NEXT
              <span>FRONTIER</span>
              <em>IS OURS.</em>
            </h1>

            <p className="oo-description">
              One planet. Endless possibilities.
              Navigate Martian terrain, discover scientific
              destinations, and evaluate exploration routes
              with an interactive mission intelligence system.
            </p>

            <div className="oo-actions">
              <button className="oo-primary" onClick={enterMission}>
                <span>↗</span> LAUNCH EXPLORATION
              </button>

              <a href="#mission-capabilities" className="oo-secondary">
                EXPLORE CAPABILITIES ↓
              </a>
            </div>

            <div className="oo-mission-details">
              <div>
                <small>TARGET</small>
                <strong>JEZERO CRATER</strong>
              </div>

              <div>
                <small>MISSION</small>
                <strong>SAFER MARSWALKS</strong>
              </div>

              <div>
                <small>ANALYSIS</small>
                <strong>SIMULATED</strong>
              </div>
            </div>
          </div>

          <div className="oo-planet-zone">
            <div className="oo-planet-glow" />

            <div className="oo-orbit-ring oo-orbit-one" />
            <div className="oo-orbit-ring oo-orbit-two" />

            <div className="oo-planet">
              <video
                src={marsVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Rotating Mars visual"
              />
            </div>

            <div className="oo-planet-caption">
              <span className="oo-pulse" />
              MARS / PLANETARY EXPLORATION
            </div>

            <div className="oo-float-card oo-card-top">
              <small>MISSION AREA</small>
              <strong>JEZERO CRATER</strong>
              <span>18.4° N · 77.7° E</span>
            </div>

            <div className="oo-float-card oo-card-bottom">
              <small>MISSION MODE</small>
              <strong>ROUTE ANALYSIS</strong>
              <span>SIMULATED SCIENTIFIC DATA</span>
            </div>
          </div>
        </div>

        <div className="oo-scroll">
          <span>SCROLL TO EXPLORE</span>
          <div className="oo-scroll-line" />
        </div>
      </section>

      <section className="oo-capabilities" id="mission-capabilities">
        <div className="oo-capabilities-heading">
          <p className="oo-eyebrow">BUILT FOR EXPLORATION</p>
          <h2>
            ONE MISSION.
            <span> THREE SYSTEMS.</span>
          </h2>
          <p>
            From terrain intelligence to safer route planning,
            explore the integrated systems powering Orbit & Origin.
          </p>
        </div>

        <div className="oo-feature-grid">
          {features.map((feature) => (
            <button
              key={feature.number}
              className="oo-feature-card"
              onClick={enterMission}
            >
              <div className="oo-feature-top">
                <span>{feature.number} / 03</span>
                <span className="oo-feature-symbol">
                  {feature.icon}
                </span>
              </div>

              <div className="oo-feature-bottom">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="oo-feature-link">
                  ACCESS SYSTEM ↗
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="oo-disclaimer">
          Orbit & Origin is a prototype. Hazard, terrain, and route
          analysis values are simulated and not suitable for real
          astronaut navigation.
        </p>
      </section>
    </div>
  );
}
