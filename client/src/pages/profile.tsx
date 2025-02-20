import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, BookOpen, PenTool, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { Achievement, ReadingStreak, WriterStreak } from "@shared/schema";

interface UserStats {
  achievements: Achievement[];
  readingStreak: ReadingStreak;
  writerStreak: WriterStreak;
  totalPosts: number;
  totalReads: number;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Reading Streak Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Reading Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Current Streak</span>
                  <span className="font-bold">{stats?.readingStreak?.currentStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Longest Streak</span>
                  <span className="font-bold">{stats?.readingStreak?.longestStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Stories Read</span>
                  <span className="font-bold">{stats?.totalReads || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Streak Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Writing Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Current Streak</span>
                  <span className="font-bold">{stats?.writerStreak?.currentStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Longest Streak</span>
                  <span className="font-bold">{stats?.writerStreak?.longestStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Stories Written</span>
                  <span className="font-bold">{stats?.totalPosts || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {stats?.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          {achievement.badgeIcon && (
                            <span className="text-primary text-xl">
                              {achievement.badgeIcon}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
