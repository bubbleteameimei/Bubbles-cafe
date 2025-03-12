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

  // Get configuration for our horror particle type
  const getOptions = (): ISourceOptions => {
    const count = getParticleCount();

    // Base configuration for all particle types
    const baseConfig = {
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
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
          value: count,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: {
            enable: interactive,
            mode: "repulse",
          },
          onClick: {
            enable: false,
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
    } as ISourceOptions;

    // Customize based on type
    switch (type) {
      case "ghost":
        return {
          ...baseConfig,
          particles: {
            ...(baseConfig.particles || {}),
            color: { 
              value: "#a0c4ff",
            },
            size: {
              value: { min: 5, max: 10 },
              animation: {
                enable: true,
                speed: 2,
                sync: false
              }
            },
            opacity: {
              value: 0.3,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.1,
                sync: false
              }
            },
            move: {
              ...(baseConfig.particles?.move || {}),
              speed: 0.8,
            }
          }
        };
      case "blood":
        return {
          ...baseConfig,
          particles: {
            ...(baseConfig.particles || {}),
            color: { 
              value: "#8B0000",
            },
            size: {
              value: { min: 1, max: 4 },
              animation: {
                enable: true,
                speed: 2, 
                sync: false
              }
            },
            opacity: {
              value: 0.8,
              random: false,
            },
            move: {
              ...(baseConfig.particles?.move || {}),
              direction: "bottom",
              speed: 4,
              straight: true,
            }
          }
        };
      case "flies":
        return {
          ...baseConfig,
          particles: {
            ...(baseConfig.particles || {}),
            color: { 
              value: "#222222",
            },
            size: {
              value: { min: 1, max: 2 },
            },
            opacity: {
              value: 0.8,
              random: false,
            },
            move: {
              ...(baseConfig.particles?.move || {}),
              speed: 5,
              bounce: false,
            }
          }
        };
      case "fog":
        return {
          ...baseConfig,
          particles: {
            ...(baseConfig.particles || {}),
            number: {
              ...(baseConfig.particles?.number || {}),
              value: Math.floor(count * 0.5),
            },
            color: { 
              value: "#cccccc",
            },
            size: {
              value: { min: 15, max: 30 },
              animation: {
                enable: true,
                speed: 0.2,
                sync: false
              }
            },
            opacity: {
              value: 0.1,
              random: true,
              animation: {
                enable: true,
                speed: 0.3,
                minimumValue: 0.05,
                sync: false
              }
            },
            move: {
              ...(baseConfig.particles?.move || {}),
              speed: 0.2,
            }
          },
          interactivity: {
            ...(baseConfig.interactivity || {}),
            modes: {
              ...(baseConfig.interactivity?.modes || {}),
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
            ...(baseConfig.particles || {}),
            color: { 
              value: "#2c2c2c",
            },
            size: {
              value: { min: 0.5, max: 3 },
              animation: {
                enable: true,
                speed: 1,
                sync: false
              }
            },
            opacity: {
              value: 0.6,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.1,
                sync: false
              }
            },
            move: {
              ...(baseConfig.particles?.move || {}),
              direction: "bottom",
              speed: 1,
            }
          }
        };
    }
  };

  return (
    <Particles
      id={`horror-particles-${type}`}
      className={`absolute inset-0 ${className}`}
      init={particlesInit}
      options={getOptions()}
    />
  );
};

export default HorrorParticles;