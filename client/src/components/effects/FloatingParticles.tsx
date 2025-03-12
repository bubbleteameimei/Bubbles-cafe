import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface FloatingParticlesProps {
  type?: "dust" | "fog" | "embers" | "paper" | "snow" | "blood";
  particleColor?: string;
  density?: "low" | "medium" | "high";
  speed?: "slow" | "medium" | "fast";
  className?: string;
  style?: React.CSSProperties;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  type = "dust",
  particleColor,
  density = "medium",
  speed = "medium",
  className = "",
  style = {}
}) => {
  // Initialize the particle engine
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Determine number of particles based on density
  const getParticleCount = () => {
    switch (density) {
      case "low": return 15;
      case "high": return 80;
      case "medium":
      default: return 40;
    }
  };

  // Determine movement speed based on speed prop
  const getParticleSpeed = () => {
    switch (speed) {
      case "slow": return 0.5;
      case "fast": return 2;
      case "medium":
      default: return 1;
    }
  };

  // Determine particle size and behavior based on type
  const getParticleConfig = () => {
    const baseConfig = {
      count: getParticleCount(),
      speed: getParticleSpeed(),
      color: particleColor || "#ffffff",
      blur: 0,
      size: {
        min: 1,
        max: 3
      },
      move: {
        direction: "top" as const,
        random: true,
        straight: false,
      }
    };

    switch (type) {
      case "fog":
        return {
          ...baseConfig,
          color: particleColor || "#919191",
          blur: 2,
          size: { min: 15, max: 30 },
          opacity: { min: 0.05, max: 0.2 },
          speed: baseConfig.speed * 0.3,
        };
      case "embers":
        return {
          ...baseConfig,
          color: particleColor || "#ff3300",
          size: { min: 1, max: 3 },
          opacity: { min: 0.3, max: 0.8 },
          glow: true,
          flicker: true,
          move: {
            ...baseConfig.move,
            direction: "top-right" as const,
          }
        };
      case "paper":
        return {
          ...baseConfig,
          color: particleColor || "#f0e9e1",
          size: { min: 5, max: 12 },
          rotateY: true,
          flutter: true,
          speed: baseConfig.speed * 0.7,
        };
      case "snow":
        return {
          ...baseConfig,
          color: particleColor || "#ffffff",
          size: { min: 1, max: 5 },
          opacity: { min: 0.6, max: 1 },
          blur: 0.5,
          move: {
            ...baseConfig.move,
            direction: "bottom" as const,
          }
        };
      case "blood":
        return {
          ...baseConfig,
          color: particleColor || "#8b0000",
          size: { min: 3, max: 8 },
          opacity: { min: 0.7, max: 1 },
          speed: baseConfig.speed * 1.5,
          move: {
            ...baseConfig.move,
            direction: "bottom" as const,
          }
        };
      case "dust":
      default:
        return {
          ...baseConfig,
          color: particleColor || "#9c8c7e",
          size: { min: 1, max: 3 },
          opacity: { min: 0.3, max: 0.7 },
          blur: 0.5,
        };
    }
  };

  const particleConfig = getParticleConfig();

  // Convert our simplified config to tsParticles options format
  const options = {
    background: {
      opacity: 0,
    },
    particles: {
      number: {
        value: particleConfig.count
      },
      color: {
        value: particleConfig.color
      },
      opacity: {
        value: particleConfig.opacity?.max || 0.5,
        random: !!particleConfig.opacity,
        anim: {
          enable: !!particleConfig.opacity,
          speed: 0.5,
          opacity_min: particleConfig.opacity?.min || 0.3,
          sync: false
        }
      },
      size: {
        value: particleConfig.size.max,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          size_min: particleConfig.size.min,
          sync: false
        }
      },
      line_linked: {
        enable: false
      },
      move: {
        enable: true,
        speed: particleConfig.speed,
        direction: particleConfig.move.direction,
        random: particleConfig.move.random,
        straight: particleConfig.move.straight,
        out_mode: "out" as const,
        bounce: false,
      },
      ...(particleConfig.rotateY && {
        rotate: {
          value: 45,
          random: true,
          direction: "random" as const,
          animation: {
            enable: true,
            speed: 1.5,
            sync: false
          }
        }
      }),
      ...(particleConfig.flutter && {
        wobble: {
          enable: true,
          distance: 10,
          speed: 1
        }
      }),
      ...(particleConfig.blur && {
        shape: {
          type: "circle",
          options: {
            blur: particleConfig.blur
          }
        }
      }),
      ...(particleConfig.glow && {
        shadow: {
          enable: true,
          color: particleConfig.color,
          blur: 3
        }
      }),
      ...(particleConfig.flicker && {
        opacity: {
          value: 0.7,
          random: true,
          anim: {
            enable: true,
            speed: 3,
            opacity_min: 0.1,
            sync: false
          }
        }
      })
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: false
        }
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        }
      }
    },
    retina_detect: true
  };

  return (
    <Particles
      id={`floating-particles-${type}`}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ ...style, zIndex: 10 }}
      init={particlesInit}
      options={options}
    />
  );
};

export default FloatingParticles;