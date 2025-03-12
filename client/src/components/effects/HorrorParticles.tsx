import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine, ISourceOptions } from "tsparticles-engine";

interface HorrorParticlesProps {
  type?: "ghost" | "blood" | "ash" | "flies" | "fog";
  intensity?: "low" | "medium" | "high";
  interactive?: boolean;
  className?: string;
}

const HorrorParticles: React.FC<HorrorParticlesProps> = ({
  type = "ash",
  intensity = "medium",
  interactive = true,
  className = "",
}) => {
  // Initialize the particle engine
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  
  // Determine particle count based on intensity
  const getParticleCount = () => {
    switch (intensity) {
      case "low": return 20;
      case "high": return 150;
      case "medium":
      default: return 70;
    }
  };

  // Get configuration based on horror particle type
  const getParticleOptions = (): ISourceOptions => {
    const baseConfig = {
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        detectsOn: "canvas",
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: interactive,
            mode: "repulse",
          },
          resize: true,
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "out" as const,
          },
          random: true,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: getParticleCount(),
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle" as const,
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    };

    // Customize based on type
    switch (type) {
      case "ghost":
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: "#a0c4ff",
            },
            opacity: {
              value: 0.3,
              random: true,
              anim: {
                enable: true,
                speed: 0.5,
                opacity_min: 0.1,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 10,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 1,
                sync: false,
              },
            },
            move: {
              ...baseConfig.particles.move,
              direction: "none",
              speed: 0.8,
              random: true,
              straight: false,
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
        };
      case "blood":
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: "#8B0000",
            },
            opacity: {
              value: 0.8,
              random: false,
            },
            size: {
              value: 4,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 1,
                sync: false,
              },
            },
            move: {
              ...baseConfig.particles.move,
              direction: "bottom",
              speed: 4,
              straight: true,
              random: true,
            },
          },
        };
      case "flies":
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: "#222222",
            },
            opacity: {
              value: 0.8,
              random: false,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 2,
              random: true,
            },
            move: {
              ...baseConfig.particles.move,
              enable: true,
              speed: 5,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
        };
      case "fog":
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            number: {
              ...baseConfig.particles.number,
              value: getParticleCount() * 0.5,
            },
            color: {
              value: "#cccccc",
            },
            opacity: {
              value: 0.1,
              random: true,
              anim: {
                enable: true,
                speed: 0.3,
                opacity_min: 0.05,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 30,
              random: true,
              anim: {
                enable: true,
                speed: 0.2,
                size_min: 15,
                sync: false,
              },
            },
            move: {
              ...baseConfig.particles.move,
              speed: 0.2,
              direction: "none",
              random: true,
              straight: false,
            },
          },
          interactivity: {
            ...baseConfig.interactivity,
            modes: {
              ...baseConfig.interactivity.modes,
              repulse: {
                distance: 200,
                duration: 2,
              },
            },
          },
        };
      case "ash":
      default:
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: {
              value: "#2c2c2c",
            },
            opacity: {
              value: 0.6,
              random: true,
              anim: {
                enable: true,
                speed: 0.5,
                opacity_min: 0.1,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                size_min: 0.5,
                sync: false,
              },
            },
            move: {
              ...baseConfig.particles.move,
              direction: "bottom",
              speed: 1,
              random: true,
              straight: false,
            },
          },
        };
    }
  };

  return (
    <Particles
      id={`horror-particles-${type}`}
      className={`absolute inset-0 ${className}`}
      init={particlesInit}
      options={getParticleOptions()}
    />
  );
};

export default HorrorParticles;