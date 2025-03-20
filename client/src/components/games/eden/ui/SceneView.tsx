import React, { useState, useEffect, useRef } from 'react';
import { Scene, SceneFeature, SceneExit, SceneAction } from '../types';

interface SceneViewProps {
  scene: Scene;
  onFeatureInteract: (featureId: string) => void;
  onExitSelect: (exit: SceneExit) => void;
  playerStatus?: Record<string, any>;
  inventory?: string[];
}

/**
 * Renders a game scene with interactive features, exits, and ambient effects
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onFeatureInteract,
  onExitSelect,
  playerStatus = {},
  inventory = [],
}) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [hoveredExit, setHoveredExit] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  // Handle audio effects
  useEffect(() => {
    if (!scene) return;
    
    // Setup ambient audio if provided
    let ambientAudio: HTMLAudioElement | null = null;
    
    if (scene.audio?.ambient) {
      ambientAudio = new Audio(scene.audio.ambient);
      ambientAudio.loop = true;
      ambientAudio.volume = scene.audio.ambientVolume || 0.3;
      
      // Delay ambient audio slightly for better experience
      setTimeout(() => {
        ambientAudio?.play().catch(err => {
          console.log('Audio playback prevented by browser', err);
        });
      }, 300);
    }
    
    // Play entrance sound if provided
    if (scene.audio?.entrance) {
      const entranceSound = new Audio(scene.audio.entrance);
      entranceSound.volume = scene.audio.entranceVolume || 0.5;
      entranceSound.play().catch(err => {
        console.log('Audio playback prevented by browser', err);
      });
    }
    
    // Clean up audio on component unmount
    return () => {
      if (ambientAudio) {
        ambientAudio.pause();
        ambientAudio = null;
      }
    };
  }, [scene]);
  
  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    // Initial size
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  // Play sound effect for feature interaction
  const playInteractionSound = (featureId: string) => {
    const feature = scene.features.find(f => f.id === featureId);
    if (feature && scene.audio?.interactions?.[featureId]) {
      const sound = new Audio(scene.audio.interactions[featureId]);
      sound.volume = scene.audio?.interactionVolume || 0.5;
      sound.play().catch(err => {
        console.log('Audio playback prevented by browser', err);
      });
    } else if (scene.audio?.defaultInteraction) {
      // Play default interaction sound
      const sound = new Audio(scene.audio.defaultInteraction);
      sound.volume = scene.audio?.interactionVolume || 0.5;
      sound.play().catch(err => {
        console.log('Audio playback prevented by browser', err);
      });
    }
  };
  
  // Check if a feature or exit is available based on requirements
  const isInteractable = (
    item: { requiredItems?: string[]; requiredStatus?: Record<string, boolean> }
  ): boolean => {
    // Check required items
    if (item.requiredItems && item.requiredItems.length > 0) {
      const hasAllItems = item.requiredItems.every(itemId => inventory.includes(itemId));
      if (!hasAllItems) return false;
    }
    
    // Check required status
    if (item.requiredStatus && Object.keys(item.requiredStatus).length > 0) {
      const hasAllStatus = Object.entries(item.requiredStatus).every(
        ([key, value]) => playerStatus[key] === value
      );
      if (!hasAllStatus) return false;
    }
    
    return true;
  };
  
  // Handle scene effects (particles, overlays, etc.)
  const renderSceneEffects = () => {
    if (!scene.effects) return null;
    
    return (
      <>
        {/* Fog/mist effect */}
        {scene.effects.fog && (
          <div
            className="scene-fog"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              opacity: scene.effects.fogIntensity || 0.5,
              background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, ${scene.effects.fogColor || 'rgba(255,255,255,0.2)'} ${scene.effects.fogHeight || '70%'})`,
              zIndex: 3
            }}
          />
        )}
        
        {/* Rain effect */}
        {scene.effects.rain && (
          <div
            className="scene-rain"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              opacity: scene.effects.rainIntensity || 0.7,
              backgroundImage: 'url(/assets/effects/rain.png)',
              backgroundRepeat: 'repeat',
              animation: 'rainFall 0.5s linear infinite',
              zIndex: 4
            }}
          />
        )}
        
        {/* Color overlay */}
        {scene.effects.colorOverlay && (
          <div
            className="scene-color-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              opacity: scene.effects.colorIntensity || 0.2,
              backgroundColor: scene.effects.colorOverlay,
              mixBlendMode: scene.effects.blendMode || 'multiply',
              zIndex: 2
            }}
          />
        )}
        
        {/* Vignette */}
        {scene.effects.vignette && (
          <div
            className="scene-vignette"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              boxShadow: `inset 0 0 ${scene.effects.vignetteSize || '100px'} ${scene.effects.vignetteColor || 'rgba(0,0,0,0.8)'}`,
              zIndex: 5
            }}
          />
        )}
      </>
    );
  };
  
  // Handle feature interaction
  const handleFeatureClick = (featureId: string) => {
    const feature = scene.features.find(f => f.id === featureId);
    if (!feature || !isInteractable(feature)) return;
    
    // Play interaction sound
    playInteractionSound(featureId);
    
    // Set active feature briefly for visual feedback
    setActiveFeature(featureId);
    setTimeout(() => {
      setActiveFeature(null);
    }, 300);
    
    // Call parent handler
    onFeatureInteract(featureId);
  };
  
  // Handle exit selection
  const handleExitClick = (exit: SceneExit) => {
    if (!isInteractable(exit)) return;
    
    // Play exit sound if provided
    if (scene.audio?.exits?.[exit.id]) {
      const sound = new Audio(scene.audio.exits[exit.id]);
      sound.volume = scene.audio?.exitVolume || 0.5;
      sound.play().catch(err => {
        console.log('Audio playback prevented by browser', err);
      });
    }
    
    // Set transition state
    setIsTransitioning(true);
    
    // Call parent handler after a brief delay
    setTimeout(() => {
      onExitSelect(exit);
      setIsTransitioning(false);
    }, 500);
  };
  
  // Render scene exits (doors, paths, etc.)
  const renderExits = () => {
    if (!scene.exits || scene.exits.length === 0) return null;
    
    return scene.exits.map(exit => {
      // Skip hidden exits
      if (exit.isHidden) return null;
      
      // Check if exit is interactable
      const canUseExit = isInteractable(exit);
      
      // Default dimensions
      const exitWidth = exit.width || 80;
      const exitHeight = exit.height || 80;
      
      return (
        <div
          key={exit.id}
          className={`scene-exit ${hoveredExit === exit.id ? 'hovered' : ''} ${canUseExit ? 'available' : 'unavailable'}`}
          style={{
            position: 'absolute',
            top: typeof exit.position === 'string' ? exit.position : exit.position.top,
            left: typeof exit.position === 'string' ? '50%' : exit.position.left,
            right: typeof exit.position === 'string' ? undefined : exit.position.right, 
            bottom: typeof exit.position === 'string' ? undefined : exit.position.bottom,
            transform: typeof exit.position === 'string' ? 'translateX(-50%)' : undefined,
            width: `${exitWidth}px`,
            height: `${exitHeight}px`,
            cursor: canUseExit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canUseExit ? 1 : 0.6,
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onClick={() => canUseExit && handleExitClick(exit)}
          onMouseEnter={() => setHoveredExit(exit.id)}
          onMouseLeave={() => setHoveredExit(null)}
          title={exit.name}
        >
          {/* Exit Icon */}
          {exit.icon && (
            <div 
              className="exit-icon"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${exit.icon})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
          
          {/* Exit Tooltip */}
          {hoveredExit === exit.id && (
            <div
              className="exit-tooltip"
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '5px',
                whiteSpace: 'nowrap',
                fontFamily: 'serif',
                fontSize: '0.9rem',
                pointerEvents: 'none',
                zIndex: 11
              }}
            >
              {exit.name} {!canUseExit && exit.requiredItems?.length ? '(Need item)' : ''}
              {!canUseExit && exit.requiredStatus ? `(Need to ${exit.targetScene})` : ''}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Render interactive features
  const renderFeatures = () => {
    if (!scene.features || scene.features.length === 0) return null;
    
    return scene.features.map(feature => {
      // Skip hidden features
      if (feature.isHidden) return null;
      
      // Check if feature is interactable
      const canInteract = isInteractable(feature);
      
      // Default dimensions
      const featureWidth = feature.width || 60;
      const featureHeight = feature.height || 60;
      const featureShape = feature.shape || 'circle';
      
      // Determine hover effect style
      const highlightStyle = feature.highlight || {
        border: '2px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)'
      };
      
      return (
        <div
          key={feature.id}
          className={`scene-feature ${activeFeature === feature.id ? 'active' : ''} ${canInteract ? 'interactable' : 'locked'}`}
          style={{
            position: 'absolute',
            top: typeof feature.position === 'string' ? feature.position : feature.position.top,
            left: typeof feature.position === 'string' ? '50%' : feature.position.left,
            right: typeof feature.position === 'string' ? undefined : feature.position.right,
            bottom: typeof feature.position === 'string' ? undefined : feature.position.bottom,
            transform: typeof feature.position === 'string' ? 'translateX(-50%)' : undefined,
            width: `${featureWidth}px`,
            height: `${featureHeight}px`,
            borderRadius: featureShape === 'circle' ? '50%' : featureShape === 'rounded' ? '12px' : '0',
            cursor: canInteract ? 'pointer' : 'not-allowed',
            opacity: canInteract ? (feature.glow ? 1 : 0.001) : 0.001, // Nearly invisible until hovered
            transition: 'all 0.3s ease',
            zIndex: 20,
            ...(activeFeature === feature.id ? highlightStyle : {})
          }}
          onClick={() => canInteract && handleFeatureClick(feature.id)}
          onMouseEnter={() => {
            if (canInteract) {
              // Apply hover effect
              if (containerRef.current) {
                const element = containerRef.current.querySelector(`.scene-feature[data-id="${feature.id}"]`);
                if (element) {
                  element.classList.add('hovered');
                }
              }
            }
          }}
          onMouseLeave={() => {
            // Remove hover effect
            if (containerRef.current) {
              const element = containerRef.current.querySelector(`.scene-feature[data-id="${feature.id}"]`);
              if (element) {
                element.classList.remove('hovered');
              }
            }
          }}
          data-id={feature.id}
        >
          {/* Feature Icon (if present) */}
          {feature.icon && (
            <div 
              className="feature-icon"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${feature.icon})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: canInteract ? 1 : 0.5
              }}
            />
          )}
          
          {/* Feature Prompt - visible on hover */}
          {feature.prompt && (
            <div
              className="feature-prompt"
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: '5px',
                whiteSpace: 'nowrap',
                fontFamily: 'serif',
                fontSize: '0.9rem',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease',
                zIndex: 21
              }}
            >
              {feature.prompt}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Render lighting effects (if present)
  const renderLightingEffects = () => {
    if (!scene.effects?.lighting) return null;
    
    return scene.effects.lighting.map((light, index) => (
      <div
        key={`light-${index}`}
        style={{
          position: 'absolute',
          top: light.position.top || '50%',
          left: light.position.left || '50%',
          transform: 'translate(-50%, -50%)',
          width: light.size || '150px',
          height: light.size || '150px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${light.color || 'rgba(255, 220, 150, 0.8)'} 0%, transparent 70%)`,
          opacity: light.intensity || 0.7,
          pointerEvents: 'none',
          zIndex: 2,
          animation: light.flicker ? 'lightFlicker 3s infinite alternate' : 'none'
        }}
      />
    ));
  };
  
  // Render particle effects (if present)
  const renderParticleEffects = () => {
    if (!scene.effects?.particles) return null;
    
    return scene.effects.particles.map((particle, index) => (
      <div
        key={`particle-${index}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${particle.texture})`,
          backgroundRepeat: 'repeat',
          opacity: particle.opacity || 0.5,
          animation: `${particle.animation} ${particle.duration || '20s'} linear infinite`,
          pointerEvents: 'none',
          zIndex: 3
        }}
      />
    ));
  };
  
  // Render ambient weather effects (if present)
  const renderWeatherEffects = () => {
    if (!scene.effects?.weather) return null;
    
    return (
      <div
        className={`weather-effect ${scene.effects.weather}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 4
        }}
      />
    );
  };
  
  return (
    <div
      ref={containerRef}
      className={`scene-view ${scene.id} ${isTransitioning ? 'transitioning' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundImage: `url(${scene.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: isTransitioning ? 'opacity 0.5s ease' : 'none',
        opacity: isTransitioning ? 0 : 1
      }}
    >
      {/* Scene effects layer */}
      {renderSceneEffects()}
      
      {/* Lighting effects */}
      {renderLightingEffects()}
      
      {/* Particle effects */}
      {renderParticleEffects()}
      
      {/* Weather effects */}
      {renderWeatherEffects()}
      
      {/* Interactive features */}
      {renderFeatures()}
      
      {/* Scene exits */}
      {renderExits()}
      
      {/* Animation styles */}
      <style>
        {`
          @keyframes lightFlicker {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.5; }
            75% { opacity: 0.6; }
          }
          
          @keyframes rainFall {
            from { background-position: 0 0; }
            to { background-position: 0 100%; }
          }
          
          .scene-feature.hovered .feature-prompt {
            opacity: 1;
          }
          
          .scene-feature.active {
            animation: pulse 0.3s ease;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          .weather-effect.rain {
            background: url('/assets/effects/rain.png') repeat;
            animation: rainFall 0.5s linear infinite;
          }
          
          .weather-effect.snow {
            background: url('/assets/effects/snow.png') repeat;
            animation: snowFall 10s linear infinite;
          }
          
          .weather-effect.fog {
            background: linear-gradient(to bottom, transparent, rgba(200, 200, 220, 0.3));
          }
          
          @keyframes snowFall {
            from { background-position: 0 0; }
            to { background-position: 100px 1000px; }
          }
        `}
      </style>
    </div>
  );
};

export default SceneView;