
"use client"

import { useAuth } from "@/hooks/use-auth"
import { ProfileSettings } from "@/components/account/ProfileSettings"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <h1 className="text-2xl font-bold">You need to log in first</h1>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
            <p className="text-muted-foreground mb-4">
              Update your account information and change your password
            </p>
            <ProfileSettings />
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Danger Zone</h2>
            <p className="text-muted-foreground mb-4">
              Permanently delete your account and all associated data
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                    fetch("/api/users/me", {
                      method: "DELETE",
                    }).then(() => {
                      logout();
                      navigate("/");
                    });
                  }
                }}
              >
                Delete Account
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your reading history?")) {
                    fetch("/api/users/me/reading-history", {
                      method: "DELETE",
                    });
                  }
                }}
              >
                Clear Reading History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
