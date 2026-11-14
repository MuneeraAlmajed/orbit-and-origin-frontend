import { useEffect, useRef } from "react";
import astronaut from "../assets/hero-astronaut.png";
import "./MissionCursor.css";

export default function MissionCursor() {
  const cursorRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    function activate() {
      document.body.classList.add("oo-cursor-ready");
    }

    if (imageRef.current?.complete &&
        imageRef.current.naturalWidth > 0) {
      activate();
    }

    function move(event) {
      if (event.pointerType !== "mouse") return;

      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;

      const target = event.target;

      const typing = target instanceof Element &&
        Boolean(target.closest("input, textarea, select"));

      const clickable = target instanceof Element &&
        Boolean(target.closest(
          "button, a, [role='button'], .leaflet-interactive"
        ));

      cursor.classList.toggle("is-typing", typing);
      cursor.classList.toggle("is-clickable", clickable);
      cursor.classList.add("is-visible");
    }

    function hide() {
      cursor.classList.remove("is-visible");
    }

    function down() {
      cursor.classList.add("is-pressed");
    }

    function up() {
      cursor.classList.remove("is-pressed");
    }

    function leave(event) {
      if (!event.relatedTarget) hide();
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", hide);
    document.addEventListener("mouseout", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseout", leave);

      document.body.classList.remove("oo-cursor-ready");
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="oo-global-cursor"
      aria-hidden="true"
    >
      <img
        ref={imageRef}
        src={astronaut}
        alt=""
        onLoad={() => {
          document.body.classList.add("oo-cursor-ready");
        }}
        onError={() => {
          document.body.classList.remove("oo-cursor-ready");
        }}
      />
    </div>
  );
}
