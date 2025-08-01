import { FirebaseAuthProvider } from "@/hooks/use-firebase-auth";

interface Props {
  children: React.ReactNode;
}

export function FirebaseAuthProviderWrapper({ children }: Props) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}