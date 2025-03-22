import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FileInput } from '@/components/ui/file-input';

interface ProfileFormData {
  username?: string;
  email?: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  avatarFile?: File | null;
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    avatarFile: null,
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);

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
        avatarFile: null,
      });
    }
  }, [profileData]);

  // Handle file selection for profile image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileError(undefined);
    
    if (!files || files.length === 0) {
      setPreviewUrl(null);
      setFormData(prev => ({ ...prev, avatarFile: null }));
      return;
    }
    
    const file = files[0];
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Image must be less than 5MB");
      setPreviewUrl(null);
      setFormData(prev => ({ ...prev, avatarFile: null }));
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG, and WebP images are supported");
      setPreviewUrl(null);
      setFormData(prev => ({ ...prev, avatarFile: null }));
      return;
    }
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData(prev => ({ ...prev, avatarFile: file }));
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { email, avatarFile, ...otherData } = data;
      
      // If we have a file, handle it differently (upload to server)
      if (avatarFile) {
        const formData = new FormData();
        formData.append('username', otherData.username || '');
        formData.append('avatarFile', avatarFile);
        
        if (otherData.fullName) formData.append('fullName', otherData.fullName);
        if (otherData.bio) formData.append('bio', otherData.bio);
        
        return apiRequest<UserProfileResponse>('/api/auth/profile-with-image', {
          method: 'PATCH',
          body: formData,
        });
      }
      
      // Otherwise send a regular JSON update
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
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFormData(prev => ({ ...prev, avatarFile: null }));
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

  // Determine the avatar source (preview URL or stored URL)
  const avatarSrc = previewUrl || formData.avatar || '';

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
              <div className="flex flex-col items-center justify-start gap-4 min-w-[150px]">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarSrc} alt={formData.username || 'User'} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                
                <div className="w-full">
                  <FileInput
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    error={fileError}
                    helperText="Upload a profile picture (max 5MB)"
                    className="w-full"
                  />
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
                
                {/* Removed the URL input field in favor of the file upload component */}
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