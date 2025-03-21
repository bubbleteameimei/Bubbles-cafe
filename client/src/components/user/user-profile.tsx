import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProfileFormData {
  username?: string;
  email?: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
}

interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  fullName?: string | null;
  bio?: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  // Query for user profile data
  const { data: profileData, isLoading } = useQuery<UserProfileResponse | null>({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      return apiRequest<UserProfileResponse>('/api/auth/profile');
    },
    enabled: isAuthenticated,
  });

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        fullName: profileData.fullName || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || '',
      });
    }
  }, [profileData]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { email, ...otherData } = data;
      
      // Prepare data in the format expected by the backend
      const updateData = {
        username: otherData.username,
        metadata: {
          fullName: otherData.fullName,
          bio: otherData.bio,
          avatar: otherData.avatar,
        }
      };
      
      return apiRequest<UserProfileResponse>('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (formData.fullName) {
      return formData.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (formData.username) {
      return formData.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center justify-start gap-4 min-w-[120px]">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar || ''} alt={formData.username || 'User'} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Profile Photo</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Your username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      disabled // Email can't be changed directly for security reasons
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL to an image for your profile picture
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="min-w-[120px]"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}