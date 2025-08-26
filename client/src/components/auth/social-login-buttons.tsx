// This is a simplified placeholder component that has removed all social login functionality
// It's retained as a stub to avoid breaking imports, but displays nothing

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  isSignIn?: boolean;
}

export function SocialLoginButtons({ onSuccess: _onSuccess, isSignIn: _isSignIn = true }: SocialLoginButtonsProps) {
  return null; // Return nothing - social login functionality has been removed
}