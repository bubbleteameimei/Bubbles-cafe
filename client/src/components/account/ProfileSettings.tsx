
"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function ProfileSettings() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [accountForm, setAccountForm] = useState({
    name: user?.username || "",
    email: user?.email || ""
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  })

  const updateAccountMutation = useMutation({
    mutationFn: async (data: typeof accountForm) => {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update account")
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] })
      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const response = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update password")
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated. You will be logged out.",
      })
      // Logout after password change
      setTimeout(() => {
        logout()
      }, 2000)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  })

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountForm({
      ...accountForm,
      [e.target.id]: e.target.value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.id]: e.target.value,
    })
  }

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateAccountMutation.mutate(accountForm)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePasswordMutation.mutate(passwordForm)
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Please log in to manage your account settings.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="account" className="w-full max-w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <form onSubmit={handleAccountSubmit}>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Username</Label>
                <Input 
                  id="name" 
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                disabled={updateAccountMutation.isPending}
              >
                {updateAccountMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <form onSubmit={handlePasswordSubmit}>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input 
                  id="currentPassword" 
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New password</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
