import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
          <ul className="space-y-2">
            {data?.recentPosts?.map((post: any) => (
              <li key={post.id} className="text-sm">
                {post.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Comments</h2>
          <ul className="space-y-2">
            {data?.recentComments?.map((comment: any) => (
              <li key={comment.id} className="text-sm">
                {comment.content.substring(0, 50)}...
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Admin Users</h2>
          <ul className="space-y-2">
            {data?.adminUsers?.map((admin: any) => (
              <li key={admin.id} className="text-sm">
                {admin.username} ({admin.email})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
"use client"

import { VisitorAnalytics } from "@/components/admin/VisitorAnalytics"
import { StoryInsights } from "@/components/admin/StoryInsights"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/auth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, LineChart, Users, BookOpen, ThumbsUp, MessageSquare } from "lucide-react"

export default function AdminDashboard() {
  const { user, isLoading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/")
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button onClick={() => window.location.reload()}>Refresh Data</Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+58 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+1,643 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+4,387</div>
            <p className="text-xs text-muted-foreground">+573 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <VisitorAnalytics />
        <StoryInsights />
      </div>
    </div>
  )
}
