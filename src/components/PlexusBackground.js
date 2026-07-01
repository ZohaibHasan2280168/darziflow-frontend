import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const PlexusBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo(() => ({
    background: {
      color: { value: "transparent" },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "grab" },
      },
      modes: {
        grab: { distance: 150, links: { opacity: 0.5 } },
        push: { quantity: 4 },
      },
    },
    particles: {
      color: { value: "#ffffff" },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.15,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        outModes: { default: "out" },
      },
      number: { density: { enable: true, area: 800 }, value: 70 },
      opacity: { value: 0.2 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2 } },
    },
    detectRetina: true,
  }), []);

  if (init) {
    return (
      <div style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        zIndex: 0, 
        pointerEvents: "none" 
      }}>
        <Particles
          id="tsparticles"
          options={options}
        />
      </div>
    );
  }

  return null;
};

export default PlexusBackground;