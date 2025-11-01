import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function AdminNav() {
  const { user } = useAuth();

  // Only render admin navigation if user exists and is an admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-4">
      <Link href="/admin/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
        Admin Dashboard
      </Link>
      <Link href="/admin/manage-posts" className="text-sm font-medium transition-colors hover:text-primary">
        Manage Posts
      </Link>
      <Link href="/admin/comments" className="text-sm font-medium transition-colors hover:text-primary">
        Manage Comments
      </Link>
    </nav>
  );
}

export default AdminNav;