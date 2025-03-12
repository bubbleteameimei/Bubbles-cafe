import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine, RecursivePartial } from "tsparticles-engine";

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

  // Get configuration for our particle type
  const getOptions = () => {
    const count = getParticleCount();
    const moveSpeed = getParticleSpeed();
    
    // Common configuration for all particle types
    const baseOptions = {
      fpsLimit: 60,
      background: {
        color: {
          value: "transparent",
        },
      },
      particles: {
        color: {
          value: particleColor || "#ffffff",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "top",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: moveSpeed,
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
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
      interactivity: {
        events: {
          onHover: {
            enable: true,
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
    };

    // Type-specific configurations
    switch (type) {
      case "fog":
        return {
          ...baseOptions,
          particles: {
            ...baseOptions.particles,
            color: { 
              value: particleColor || "#919191" 
            },
            size: {
              value: { min: 15, max: 30 },
            },
            opacity: {
              value: 0.2,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.05,
                sync: false
              }
            },
            move: {
              ...baseOptions.particles.move,
              speed: moveSpeed * 0.3,
              straight: false,
            }
          }
        };
        
      case "embers":
        return {
          ...baseOptions,
          particles: {
            ...baseOptions.particles,
            color: { 
              value: particleColor || "#ff3300" 
            },
            size: {
              value: { min: 1, max: 3 },
            },
            opacity: {
              value: 0.8,
              random: true,
              animation: {
                enable: true,
                speed: 3,
                minimumValue: 0.3,
                sync: false
              }
            },
            move: {
              ...baseOptions.particles.move,
              direction: "top-right",
              straight: false,
            }
          }
        };
        
      case "paper":
        return {
          ...baseOptions,
          particles: {
            ...baseOptions.particles,
            color: { 
              value: particleColor || "#f0e9e1" 
            },
            size: {
              value: { min: 5, max: 12 },
            },
            move: {
              ...baseOptions.particles.move,
              speed: moveSpeed * 0.7,
            },
            rotate: {
              value: 45,
              random: true,
              direction: "random",
              animation: {
                enable: true,
                speed: 1.5,
                sync: false
              }
            }
          }
        };
        
      case "snow":
        return {
          ...baseOptions,
          particles: {
            ...baseOptions.particles,
            color: { 
              value: particleColor || "#ffffff" 
            },
            size: {
              value: { min: 1, max: 5 },
            },
            opacity: {
              value: 1,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.6,
                sync: false
              }
            },
            move: {
              ...baseOptions.particles.move,
              direction: "bottom",
            }
          }
        };
        
      case "blood":
        return {
          ...baseOptions,
          particles: {
            ...baseOptions.particles,
            color: { 
              value: particleColor || "#8b0000" 
            },
            size: {
              value: { min: 3, max: 8 },
            },
            opacity: {
              value: 1,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.7,
                sync: false
              }
            },
            move: {
              ...baseOptions.particles.move,
              direction: "bottom",
              speed: moveSpeed * 1.5,
            }
          }
        };
        
      case "dust":
      default:
        return {
          ...baseOptions,
          particles: {
            ...baseOptions.particles,
            color: { 
              value: particleColor || "#9c8c7e" 
            },
            size: {
              value: { min: 1, max: 3 },
            },
            opacity: {
              value: 0.7,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.3,
                sync: false
              }
            }
          }
        };
    }
  };

  return (
    <Particles
      id={`floating-particles-${type}`}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ ...style, zIndex: 10 }}
      init={particlesInit}
      options={getOptions() as any}
    />
  );
};

export default FloatingParticles;