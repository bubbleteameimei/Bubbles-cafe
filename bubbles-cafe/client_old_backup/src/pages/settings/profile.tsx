import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserCircle, Upload, Loader2, ShieldAlert, CheckCircle, UserRoundX } from "lucide-react";
import { SettingsLayout } from "@/components/layouts/SettingsLayout";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Schema for profile form
const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().optional(),
  bio: z.string().max(250, "Bio cannot exceed 250 characters").optional(),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Schema for profile visibility settings
const visibilitySchema = z.object({
  displayMode: z.enum(["username", "anonymous"]),
  showReadingHistory: z.boolean(),
  showBookmarks: z.boolean(),
  allowMentions: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type VisibilityValues = z.infer<typeof visibilitySchema>;

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  
  // Form for personal information
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form for visibility settings
  const visibilityForm = useForm<VisibilityValues>({
    resolver: zodResolver(visibilitySchema),
    defaultValues: {
      displayMode: "username",
      showReadingHistory: true,
      showBookmarks: false,
      allowMentions: true,
    },
  });

  // Handle avatar file selection
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Basic validation
    if (!file.type.startsWith("image/")) {
      showToast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showToast({
        title: "File too large",
        description: "Avatar image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Show loading state
    setIsUploadingAvatar(true);
    
    // Create a preview of the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Simulate upload (would be replaced with actual API call)
    setTimeout(() => {
      setIsUploadingAvatar(false);
      showToast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    }, 1500);
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success notification
      toast.success("Profile updated successfully", {
        description: "Your profile settings have been updated."
      });
      
      // Clear password fields after successful update
      profileForm.setValue("currentPassword", "");
      profileForm.setValue("newPassword", "");
      profileForm.setValue("confirmPassword", "");
    } catch (error) {
      toast.error("Failed to update profile", {
        description: "Please try again."
      });
    }
  };

  const onVisibilitySubmit = async (data: VisibilityValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success notification
      toast.success("Visibility settings updated", {
        description: `Your profile is now set to ${data.displayMode === 'username' ? 'display your username' : 'remain anonymous'}.`,
      });
    } catch (error) {
      toast.error("Failed to update visibility settings", {
        description: "Please try again."
      });
    }
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Account deactivated", {
        description: "Your account has been deactivated successfully."
      });
    } catch (error) {
      toast.error("Failed to deactivate account", {
        description: "Please try again."
      });
    }
    setIsDeactivating(false);
  };

  return (
    <SettingsLayout title="Profile Settings">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full md:w-auto">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="visibility" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Visibility</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Your profile picture will be shown on your profile and in comments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex justify-center sm:justify-start">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview || undefined} alt={user?.username || "Avatar"} />
                      <AvatarFallback className="text-xl">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                    </Avatar>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground pb-2">
                      Upload a photo for your profile. This helps readers and authors recognize you in the community.
                    </p>
                    <div className="flex flex-col xs:flex-row gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative"
                        disabled={isUploadingAvatar}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Upload New Picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleAvatarChange}
                          disabled={isUploadingAvatar}
                        />
                      </Button>
                      {avatarPreview && (
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setAvatarPreview(null)}
                          disabled={isUploadingAvatar}
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Your name as it will appear on your profile page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your unique identifier on the platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for account notifications and recovery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell the community a little about yourself..." 
                            className="min-h-[120px] resize-y"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          <span className={`${profileForm.watch("bio")?.length || 0 > 200 ? "text-destructive" : ""}`}>
                            {profileForm.watch("bio")?.length || 0}/250
                          </span> characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button 
                type="submit" 
                form="profile-form"
                disabled={profileForm.formState.isSubmitting}
                className="ml-auto"
              >
                {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-destructive">
                <UserRoundX className="mr-2 h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Actions here will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you deactivate your account, all your data will be permanently deleted.
                This action cannot be undone.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Deactivate Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeactivateAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeactivating}
                    >
                      {isDeactivating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deactivating...
                        </>
                      ) : (
                        "Yes, deactivate my account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Visibility Settings Tab */}
        <TabsContent value="visibility" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility</CardTitle>
              <CardDescription>
                Control who can see your profile and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...visibilityForm}>
                <form id="visibility-form" onSubmit={visibilityForm.handleSubmit(onVisibilitySubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Identity Display</h3>
                      <FormField
                        control={visibilityForm.control}
                        name="displayMode"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="mt-2 flex flex-col space-y-3"
                              >
                                <div className="flex items-start space-x-3 bg-muted/40 rounded-md p-3">
                                  <RadioGroupItem value="username" id="display-username" className="mt-1" />
                                  <div className="space-y-1.5">
                                    <Label htmlFor="display-username" className="font-medium">
                                      Display Username
                                    </Label>
                                    <p className="text-sm text-muted-foreground leading-snug">
                                      Your username will be displayed with your comments and interactions.
                                      People can find and follow your contributions.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3 bg-muted/40 rounded-md p-3">
                                  <RadioGroupItem value="anonymous" id="remain-anonymous" className="mt-1" />
                                  <div className="space-y-1.5">
                                    <Label htmlFor="remain-anonymous" className="font-medium">
                                      Remain Anonymous
                                    </Label>
                                    <p className="text-sm text-muted-foreground leading-snug">
                                      Your activity will be posted anonymously without revealing your identity.
                                      Comments will show as "Anonymous Reader".
                                    </p>
                                  </div>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Additional Visibility Settings</h3>
                      
                      <FormField
                        control={visibilityForm.control}
                        name="showReadingHistory"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-muted/40 rounded-md p-3">
                            <FormControl>
                              <div className="mt-1">
                                <RadioGroupItem checked={field.value} onCheckedChange={field.onChange} />
                              </div>
                            </FormControl>
                            <div className="space-y-1.5">
                              <Label className="font-medium">Show Reading History</Label>
                              <FormDescription className="text-sm text-muted-foreground leading-snug">
                                Allow others to see what stories you've read recently on your profile page
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={visibilityForm.control}
                        name="showBookmarks"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-muted/40 rounded-md p-3">
                            <FormControl>
                              <div className="mt-1">
                                <RadioGroupItem checked={field.value} onCheckedChange={field.onChange} />
                              </div>
                            </FormControl>
                            <div className="space-y-1.5">
                              <Label className="font-medium">Show Bookmarks</Label>
                              <FormDescription className="text-sm text-muted-foreground leading-snug">
                                Allow others to see your bookmarked stories on your profile page
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={visibilityForm.control}
                        name="allowMentions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-muted/40 rounded-md p-3">
                            <FormControl>
                              <div className="mt-1">
                                <RadioGroupItem checked={field.value} onCheckedChange={field.onChange} />
                              </div>
                            </FormControl>
                            <div className="space-y-1.5">
                              <Label className="font-medium">Allow @Mentions</Label>
                              <FormDescription className="text-sm text-muted-foreground leading-snug">
                                Allow other users to mention you in comments using @username
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <Button
                type="submit"
                form="visibility-form"
                disabled={visibilityForm.formState.isSubmitting}
                className="flex items-center"
              >
                {visibilityForm.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                <span>Save Visibility Settings</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}
