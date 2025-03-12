import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";

interface FloatingParticlesProps {
  className?: string;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ className = "" }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Initialize the tsParticles instance
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Optional callback when particles are loaded
  }, []);

  return (
    <Particles
      id="horror-particles"
      init={particlesInit}
      loaded={particlesLoaded}
      className={`absolute inset-0 z-0 ${className}`}
      options={{
        particles: {
          number: { 
            value: 50,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: { 
            value: "#9F8E80" 
          },
          opacity: { 
            value: 0.5, 
            random: true,
            anim: {
              enable: true,
              speed: 0.5,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: { 
            value: 3, 
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false
            }
          },
          move: { 
            enable: true, 
            speed: 0.5,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
          },
          line_linked: {
            enable: false
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "bubble"
            },
            onclick: {
              enable: true,
              mode: "repulse"
            },
            resize: true
          },
          modes: {
            bubble: {
              distance: 150,
              size: 4,
              duration: 2,
              opacity: 0.8,
              speed: 3
            },
            repulse: {
              distance: 200,
              duration: 0.4
            }
          }
        },
        retina_detect: true,
        background: {
          color: {
            value: "transparent"
          }
        }
      }}
    />
  );
};

export default FloatingParticles;