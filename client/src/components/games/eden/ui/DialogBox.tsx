import React from 'react';
import { Dialog } from '../types';

interface DialogBoxProps {
  dialog: Dialog;
  dialogIndex: number;
  onResponse: (responseIndex: number) => void;
}

/**
 * Displays dialog interactions with NPCs
 */
const DialogBox: React.FC<DialogBoxProps> = ({ dialog, dialogIndex, onResponse }) => {
  const currentDialog = dialog.content[dialogIndex];

  if (!currentDialog) return null;

  return (
    <div className="dialog-box">
      <div className="dialog-header">
        <h3 className="dialog-speaker">{currentDialog.speaker}</h3>
      </div>
      
      <div className="dialog-content">
        <p className="dialog-text">{currentDialog.text}</p>
      </div>
      
      <div className="dialog-responses">
        {currentDialog.responses?.map((response, index) => (
          <button 
            key={index} 
            className="dialog-response-button"
            onClick={() => onResponse(index)}
          >
            {response.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DialogBox;