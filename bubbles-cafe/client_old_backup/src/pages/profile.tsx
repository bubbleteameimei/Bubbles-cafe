import { AuthGuard } from '@/components/auth/auth-guard';
import { UserProfile } from '@/components/user/user-profile';

export default function ProfilePage() {
  return (
    <AuthGuard requiredAuth={true}>
      <div className="container mx-auto py-8">
        <UserProfile />
      </div>
    </AuthGuard>
  );
}