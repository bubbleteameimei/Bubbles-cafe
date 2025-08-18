
interface AbsoluteLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  zIndex?: number;
  backdropColor?: string;
  textColor?: string;
  disableScroll?: boolean;
  showSpinner?: boolean;
  spinnerSize?: number;
  spinnerColor?: string;
  className?: string;
  hideAfter?: number;
  onHide?: () => void;
  useCustomLoader?: boolean;
}

/**
 * Empty AbsoluteLoadingOverlay Component
 * 
 * This component has been completely replaced with an empty implementation
 * that renders nothing, to eliminate all loading screen functionality.
 */
export default function AbsoluteLoadingOverlay({
  isLoading: _isLoading,
  message: _message,
  zIndex: _zIndex,
  backdropColor: _backdropColor,
  textColor: _textColor,
  disableScroll: _disableScroll,
  showSpinner: _showSpinner,
  spinnerSize: _spinnerSize,
  spinnerColor: _spinnerColor,
  className: _className,
  hideAfter: _hideAfter,
  onHide: _onHide,
  useCustomLoader: _useCustomLoader
}: AbsoluteLoadingOverlayProps) {
  // Don't render anything regardless of isLoading state
  return null;
}