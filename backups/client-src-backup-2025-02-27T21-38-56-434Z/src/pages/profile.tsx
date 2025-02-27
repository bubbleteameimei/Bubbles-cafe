import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, BookOpen, PenTool, Star, Calendar, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Achievement, ReadingStreak, WriterStreak } from "@shared/schema";
import { cn } from "@/lib/utils";

interface UserStats {
  achievements: (Achievement & {
    unlocked: boolean;
    unlockedAt: string | null;
    progress: {
      current: number;
      required: number;
    };
  })[];
  readingStreak: ReadingStreak;
  writerStreak: WriterStreak;
  featured: {
    monthYear: string;
    description: string;
  } | null;
  stats: {
    totalPosts: number;
    totalLikes: number;
    postsThisMonth: number;
  };
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
          {stats?.featured && (
            <Badge variant="secondary" className="px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              Featured Author {stats.featured.monthYear}
            </Badge>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <PenTool className="h-8 w-8 mb-2 mx-auto text-primary" />
                <div className="text-2xl font-bold">{stats?.stats.totalPosts}</div>
                <p className="text-sm text-muted-foreground">Total Stories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="h-8 w-8 mb-2 mx-auto text-primary" />
                <div className="text-2xl font-bold">{stats?.stats.totalLikes}</div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mb-2 mx-auto text-primary" />
                <div className="text-2xl font-bold">{stats?.stats.postsThisMonth}</div>
                <p className="text-sm text-muted-foreground">Posts This Month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-8 w-8 mb-2 mx-auto text-primary" />
                <div className="text-2xl font-bold">
                  {stats?.achievements.filter(a => a.unlocked).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </CardContent>
          </Card>
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
                  <span className="font-bold">{stats?.readingStreak?.totalReads || 0}</span>
                </div>
                {stats?.readingStreak?.lastReadAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Last read: {new Date(stats.readingStreak.lastReadAt).toLocaleDateString()}
                  </p>
                )}
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
                  <span className="font-bold">{stats?.writerStreak?.totalPosts || 0}</span>
                </div>
                {stats?.writerStreak?.lastWriteAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Last write: {new Date(stats.writerStreak.lastWriteAt).toLocaleDateString()}
                  </p>
                )}
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
                  <Card className={cn(
                    "bg-card/50 backdrop-blur-sm",
                    achievement.unlocked && "border-primary"
                  )}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "rounded-full p-2",
                          achievement.unlocked ? "bg-primary/10" : "bg-muted"
                        )}>
                          {achievement.badgeIcon && (
                            <span className={cn(
                              "text-xl",
                              achievement.unlocked ? "text-primary" : "text-muted-foreground"
                            )}>
                              {achievement.badgeIcon}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          {achievement.progress && (
                            <div className="space-y-1">
                              <Progress 
                                value={(achievement.progress.current / achievement.progress.required) * 100} 
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {achievement.progress.current} / {achievement.progress.required}
                              </p>
                            </div>
                          )}
                          {achievement.unlockedAt && (
                            <p className="text-xs text-primary mt-2">
                              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
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