import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Form,
  FormControl,
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

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [visibilityOption, setVisibilityOption] = useState("display"); // "display" or "anonymous"

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Here you would implement the API call to update the profile
      toast.success("Profile updated successfully", {
        description: "Your profile settings have been updated."
      });
      
      // Also show in the traditional toast for demonstration
      showToast({
        title: "Profile updated",
        description: "Your profile settings have been updated successfully.",
      });
    } catch (error) {
      toast.error("Failed to update profile", {
        description: "Please try again."
      });
      
      // Also show in the traditional toast for demonstration
      showToast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      // Here you would implement the API call to deactivate the account
      toast.success("Account deactivated", {
        description: "Your account has been deactivated successfully."
      });
      
      // Also show in the traditional toast for demonstration
      showToast({
        title: "Account deactivated",
        description: "Your account has been deactivated successfully.",
      });
    } catch (error) {
      toast.error("Failed to deactivate account", {
        description: "Please try again."
      });
      
      // Also show in the traditional toast for demonstration
      showToast({
        title: "Error",
        description: "Failed to deactivate account. Please try again.",
        variant: "destructive",
      });
    }
    setIsDeactivating(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Visibility</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="mb-4">
              <label className="text-sm font-medium">
                Profile Visibility Options
              </label>
              <RadioGroup 
                value={visibilityOption} 
                onValueChange={setVisibilityOption}
                className="mt-3"
              >
                <div className="flex items-start space-x-2 mb-3">
                  <RadioGroupItem value="display" id="display-username" />
                  <Label
                    htmlFor="display-username"
                    className="font-normal cursor-pointer"
                  >
                    <div>Display Username</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your username will be displayed with your comments and interactions.
                    </p>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="anonymous" id="remain-anonymous" />
                  <Label
                    htmlFor="remain-anonymous"
                    className="font-normal cursor-pointer"
                  >
                    <div>Remain Anonymous</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your activity will be posted anonymously without revealing your identity.
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => {
                  toast.success("Visibility updated!", {
                    description: `Your profile is now set to ${visibilityOption === 'display' ? 'display your username' : 'remain anonymous'}.`,
                  });
                }}
              >
                Save Visibility Preference
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
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
                control={form.control}
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

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </Card>

      <Card className="p-6 border-destructive/50">
        <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
        <p className="text-muted-foreground mb-4">
          Once you deactivate your account, all your data will be permanently deleted.
          This action cannot be undone.
        </p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
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
                {isDeactivating ? "Deactivating..." : "Yes, deactivate my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
