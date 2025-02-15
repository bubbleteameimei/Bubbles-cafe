import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function AdminNav() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <nav className="space-x-4">
      <Link href="/admin/dashboard">
        <a className="text-sm font-medium transition-colors hover:text-primary">
          Admin Dashboard
        </a>
      </Link>
      <Link href="/admin/posts">
        <a className="text-sm font-medium transition-colors hover:text-primary">
          Manage Posts
        </a>
      </Link>
      <Link href="/admin/comments">
        <a className="text-sm font-medium transition-colors hover:text-primary">
          Manage Comments
        </a>
      </Link>
    </nav>
  );
}
