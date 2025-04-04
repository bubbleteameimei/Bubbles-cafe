/**
 * Eden's Hollow Choice Button
 * Interactive button for player choices
 */

import React from 'react';
import './ChoiceButton.css';
import { Choice } from '../types';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choice: Choice) => void;
  isSanityLimited?: boolean;
}

/**
 * Choice Button Component
 * Renders a styled button for player decisions with visual cues based on the choice type
 */
const ChoiceButton: React.FC<ChoiceButtonProps> = ({ 
  choice, 
  onClick,
  isSanityLimited = false
}) => {
  // Get the appropriate CSS class based on choice type
  const getChoiceTypeClass = () => {
    switch (choice.type) {
      case 'rational':
        return 'eden-choice-rational';
      case 'emotional':
        return 'eden-choice-emotional';
      case 'desperate':
        return 'eden-choice-desperate';
      case 'corrupted':
        return 'eden-choice-corrupted';
      default:
        return '';
    }
  };
  
  // Show "sanity locked" icon for inaccessible choices due to low sanity
  const renderSanityLock = () => {
    if (isSanityLimited && !choice.available) {
      return (
        <div className="eden-choice-sanity-lock">
          <div className="eden-lock-icon">🔒</div>
          <div className="eden-lock-text">Sanity too low</div>
        </div>
      );
    }
    return null;
  };
  
  // Handle click with confirmation for dangerous choices
  const handleClick = () => {
    if (choice.available) {
      onClick(choice);
    }
  };
  
  return (
    <button
      className={`eden-choice-button ${getChoiceTypeClass()} ${!choice.available ? 'eden-choice-unavailable' : ''}`}
      onClick={handleClick}
      disabled={!choice.available}
      data-choice-id={choice.id}
    >
      <div className="eden-choice-content">
        <span className="eden-choice-text">{choice.text}</span>
        
        {choice.sanityEffect !== 0 && (
          <span className={`eden-choice-effect-sanity ${choice.sanityEffect > 0 ? 'positive' : 'negative'}`}>
            {choice.sanityEffect > 0 ? '+' : ''}{choice.sanityEffect} Sanity
          </span>
        )}
        
        {choice.corruptionEffect !== 0 && (
          <span className={`eden-choice-effect-corruption ${choice.corruptionEffect < 0 ? 'positive' : 'negative'}`}>
            {choice.corruptionEffect > 0 ? '+' : ''}{choice.corruptionEffect} Corruption
          </span>
        )}
      </div>
      
      {renderSanityLock()}
    </button>
  );
};

export default ChoiceButton;