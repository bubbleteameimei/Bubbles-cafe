import React, { useState, useEffect } from 'react';
import { Scene, SceneHotspot, NavigationDirection } from '../types';

interface SceneViewProps {
  scene: Scene;
  onInteract: (hotspotId: string) => void;
  onNavigate: (direction: NavigationDirection) => void;
  onExamine: (hotspotId: string) => void;
}

/**
 * Displays the current scene with interactive hotspots and navigation controls
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onInteract,
  onNavigate,
  onExamine
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [hotspotVisibility, setHotspotVisibility] = useState<{[key: string]: boolean}>({});
  
  // Set up hotspot visibility based on scene data
  useEffect(() => {
    if (scene && scene.hotspots) {
      const visibility: {[key: string]: boolean} = {};
      scene.hotspots.forEach(hotspot => {
        visibility[hotspot.id] = !hotspot.hidden;
      });
      setHotspotVisibility(visibility);
    }
  }, [scene]);
  
  // Handle hotspot interaction
  const handleHotspotClick = (hotspotId: string, action: 'interact' | 'examine') => {
    if (action === 'interact') {
      onInteract(hotspotId);
    } else {
      onExamine(hotspotId);
    }
  };
  
  // Handle scene navigation
  const handleNavigation = (direction: NavigationDirection) => {
    onNavigate(direction);
  };
  
  // Find a hotspot by ID
  const getHotspot = (id: string): SceneHotspot | undefined => {
    return scene.hotspots?.find(hotspot => hotspot.id === id);
  };
  
  // Generate nav buttons based on available directions
  const renderNavigationButtons = () => {
    const directions: NavigationDirection[] = ['forward', 'back', 'left', 'right', 'up', 'down'];
    
    return (
      <div className="navigation-controls" style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        padding: '5px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 10
      }}>
        {directions.map(direction => {
          const isAvailable = scene.exits && scene.exits.includes(direction);
          
          return isAvailable ? (
            <button
              key={direction}
              onClick={() => handleNavigation(direction)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(40, 40, 60, 0.8)',
                border: '1px solid rgba(80, 100, 150, 0.5)',
                color: '#fff',
                fontSize: '18px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
              }}
              title={`Go ${direction}`}
            >
              {getDirectionIcon(direction)}
            </button>
          ) : null;
        })}
      </div>
    );
  };
  
  // Get icon for direction buttons
  const getDirectionIcon = (direction: NavigationDirection): string => {
    switch (direction) {
      case 'forward': return '↑';
      case 'back': return '↓';
      case 'left': return '←';
      case 'right': return '→';
      case 'up': return '⤴';
      case 'down': return '⤵';
      default: return '•';
    }
  };
  
  if (!scene) {
    return <div>Loading scene...</div>;
  }
  
  return (
    <div className="scene-container" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#121218',
      backgroundImage: scene.backgroundImage ? `url(${scene.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'hidden'
    }}>
      {/* Darkening overlay for better contrast */}
      <div className="scene-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 1
      }} />
      
      {/* Scene title */}
      <div className="scene-title" style={{
        position: 'absolute',
        top: '15px',
        left: '20px',
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
        zIndex: 10
      }}>
        {scene.title}
      </div>
      
      {/* Scene description */}
      <div className="scene-description" style={{
        position: 'absolute',
        top: '60px',
        left: '20px',
        maxWidth: '60%',
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
        color: '#ddd',
        fontSize: '16px',
        lineHeight: 1.6,
        zIndex: 10,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(5px)'
      }}>
        {scene.description}
      </div>
      
      {/* Hotspots */}
      {scene.hotspots && scene.hotspots.map((hotspot) => (
        hotspotVisibility[hotspot.id] && (
          <div
            key={hotspot.id}
            className={`scene-hotspot ${hoveredHotspot === hotspot.id ? 'hovered' : ''}`}
            style={{
              position: 'absolute',
              top: `${hotspot.position.y}%`,
              left: `${hotspot.position.x}%`,
              transform: 'translate(-50%, -50%)',
              width: `${hotspot.size || 40}px`,
              height: `${hotspot.size || 40}px`,
              borderRadius: '50%',
              backgroundColor: hoveredHotspot === hotspot.id 
                ? 'rgba(100, 150, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: hoveredHotspot === hotspot.id 
                ? '2px solid rgba(150, 200, 255, 0.8)' 
                : '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5,
              boxShadow: hoveredHotspot === hotspot.id 
                ? '0 0 15px rgba(100, 150, 255, 0.5)' 
                : 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setHoveredHotspot(hotspot.id)}
            onMouseLeave={() => setHoveredHotspot(null)}
          >
            <div className="hotspot-icon" style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
            }}>
              {getHotspotIcon(hotspot.type)}
            </div>
            
            {/* Hotspot tooltip */}
            {hoveredHotspot === hotspot.id && (
              <div className="hotspot-tooltip" style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(20, 30, 50, 0.9)',
                color: '#fff',
                borderRadius: '5px',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                zIndex: 10,
                textAlign: 'center',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(100, 150, 200, 0.3)'
              }}>
                <div className="tooltip-title" style={{
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {hotspot.name}
                </div>
                <div className="tooltip-actions" style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '5px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(hotspot.id, 'interact');
                    }}
                    style={{
                      padding: '3px 8px',
                      backgroundColor: 'rgba(70, 100, 150, 0.7)',
                      border: '1px solid rgba(100, 130, 180, 0.5)',
                      borderRadius: '3px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Interact
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(hotspot.id, 'examine');
                    }}
                    style={{
                      padding: '3px 8px',
                      backgroundColor: 'rgba(70, 120, 70, 0.7)',
                      border: '1px solid rgba(100, 150, 100, 0.5)',
                      borderRadius: '3px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Examine
                  </button>
                </div>
                <div className="tooltip-arrow" style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid rgba(20, 30, 50, 0.9)'
                }} />
              </div>
            )}
          </div>
        )
      ))}
      
      {/* Navigation controls */}
      {renderNavigationButtons()}
    </div>
  );
};

// Helper function to get an icon based on hotspot type
const getHotspotIcon = (type: string): string => {
  switch (type) {
    case 'item':
      return '📦';
    case 'door':
      return '🚪';
    case 'character':
      return '👤';
    case 'puzzle':
      return '🧩';
    case 'object':
      return '🔍';
    case 'secret':
      return '✨';
    case 'danger':
      return '⚠️';
    case 'note':
      return '📝';
    case 'key':
      return '🔑';
    default:
      return '•';
  }
};

export default SceneView;