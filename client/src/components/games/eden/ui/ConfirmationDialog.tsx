/**
 * Confirmation Dialog Component
 * 
 * This component displays a confirmation dialog for important choices.
 * The appearance is affected by the corruption level.
 */
import React from 'react';
import { ConfirmationDialogProps } from '../types';
import '../styles/dialog.css';

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isOpen,
  corruption = 0
}) => {
  if (!isOpen) return null;
  
  // Determine if the dialog should have corrupted styling
  const isCorrupted = corruption > 50;
  const dialogClass = `eden-dialog-overlay ${isCorrupted ? 'eden-dialog-corrupted' : ''}`;
  
  return (
    <div className={dialogClass}>
      <div className="eden-dialog-container">
        <h2 className="eden-dialog-title">{title}</h2>
        <div className="eden-dialog-content">{message}</div>
        <div className="eden-dialog-buttons">
          <button
            className="eden-dialog-button confirm"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="eden-dialog-button cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;