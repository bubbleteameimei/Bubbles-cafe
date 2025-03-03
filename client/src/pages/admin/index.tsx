import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect, useLocation } from "wouter";
import { 
  Book, 
  Users, 
  BarChart, 
  Settings, 
  Bell 
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const cards = [
    {
      title: "Content Management",
      description: "Manage stories and content",
      icon: Book,
      link: "/admin/posts"
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      link: "/admin/users"
    },
    {
      title: "Analytics",
      description: "View site statistics and metrics",
      icon: BarChart,
      link: "/admin/analytics"
    },
    {
      title: "Settings",
      description: "Configure site settings and preferences",
      icon: Settings,
      link: "/admin/settings"
    },
    {
      title: "Notifications",
      description: "Manage system notifications and alerts",
      icon: Bell,
      link: "/admin/notifications"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(card.link)}
            >
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}