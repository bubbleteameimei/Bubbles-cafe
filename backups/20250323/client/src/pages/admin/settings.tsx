import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect } from "wouter";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Site Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Site settings configuration coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
