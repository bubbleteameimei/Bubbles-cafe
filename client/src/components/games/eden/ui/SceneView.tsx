import React from 'react';
import { Scene } from '../types';

interface SceneViewProps {
  scene: Scene;
  onExitClick: (exitId: string) => void;
  onItemClick: (itemId: string) => void;
  onCharacterClick: (characterId: string) => void;
  onActionClick: (actionId: string) => void;
}

/**
 * Displays the current scene with its interactive elements
 */
const SceneView: React.FC<SceneViewProps> = ({
  scene,
  onExitClick,
  onItemClick,
  onCharacterClick,
  onActionClick
}) => {
  // Handle non-existent scene (fallback)
  if (!scene) {
    return (
      <div className="scene-error">
        <h3>Scene not found</h3>
        <p>There was an error loading this scene.</p>
      </div>
    );
  }

  return (
    <div className="scene-view">
      <div 
        className="scene-background"
        style={{
          backgroundImage: `url(/images/eden/scenes/${scene.id}.jpg)`,
          backgroundColor: '#1a1a1a', // Fallback color
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '70vh',
          position: 'relative'
        }}
      >
        {/* Scene title and description overlay */}
        <div className="scene-info" style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '80%'
        }}>
          <h2 className="scene-title" style={{
            margin: '0 0 10px 0',
            color: '#ffffff'
          }}>{scene.title}</h2>
          <p className="scene-description" style={{
            margin: '0',
            color: '#cccccc'
          }}>{scene.description}</p>
        </div>
        
        {/* Exit points to other scenes */}
        <div className="scene-exits" style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {scene.exits.map((exit) => (
            <button
              key={exit.id}
              onClick={() => onExitClick(exit.id)}
              disabled={exit.isLocked}
              style={{
                padding: '8px 12px',
                background: exit.isLocked ? '#555' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: exit.isLocked ? 'not-allowed' : 'pointer'
              }}
            >
              {exit.name}
            </button>
          ))}
        </div>
        
        {/* Other interactive actions */}
        <div className="scene-actions" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {scene.actions?.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              style={{
                padding: '8px 12px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {action.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SceneView;