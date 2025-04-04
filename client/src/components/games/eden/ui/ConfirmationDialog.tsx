/**
 * Eden's Hollow Confirmation Dialog
 * Dialog for confirming dangerous choices
 */

import React from 'react';
import './ConfirmationDialog.css';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation Dialog Component
 * Prompts the player to confirm potentially dangerous choices
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onConfirm,
  onCancel
}) => {
  // Prevent clicks on the dialog from closing it (only clicking buttons should)
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="eden-confirmation-overlay" onClick={onCancel}>
      <div className="eden-confirmation-dialog" onClick={handleDialogClick}>
        <h3 className="eden-confirmation-title">Are you certain?</h3>
        <p className="eden-confirmation-message">{message}</p>
        <div className="eden-confirmation-buttons">
          <button 
            className="eden-confirmation-btn eden-btn-confirm" 
            onClick={onConfirm}
          >
            Proceed
          </button>
          <button 
            className="eden-confirmation-btn eden-btn-cancel" 
            onClick={onCancel}
          >
            Reconsider
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;