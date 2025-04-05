import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Post } from "../../pages/admin/content";

// Define the theme categories
const themeCategories = [
  { id: "gothic", name: "Gothic", description: "Dark, mysterious, and atmospheric" },
  { id: "haunted", name: "Haunted", description: "Ghosts, spirits, and supernatural phenomena" },
  { id: "psychological", name: "Psychological", description: "Mind games, unreliable narrators, and mental horror" },
  { id: "cosmic", name: "Cosmic Horror", description: "Lovecraftian unknown and existential dread" },
  { id: "folk", name: "Folk Horror", description: "Rural settings, ancient rituals, and isolated communities" },
  { id: "body", name: "Body Horror", description: "Graphic physical transformations and mutations" },
  { id: "paranormal", name: "Paranormal", description: "Supernatural entities and phenomena" },
  { id: "occult", name: "Occult", description: "Rituals, cults, and dark magic" },
  { id: "monster", name: "Monster", description: "Creatures, beasts, and inhuman threats" },
  { id: "apocalyptic", name: "Apocalyptic", description: "End of the world scenarios and aftermath" },
  { id: "science", name: "Science Fiction Horror", description: "Technology gone wrong and alien threats" },
  { id: "slasher", name: "Slasher", description: "Stalkers, killers, and physical violence" },
  { id: "survival", name: "Survival Horror", description: "Isolation, limited resources, and desperate circumstances" },
  { id: "dark-fantasy", name: "Dark Fantasy", description: "Fantastical worlds with horror elements" },
  { id: "historical", name: "Historical Horror", description: "Horror set in specific historical periods" }
];

// Define status options
const statusOptions = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending Review" }
];

// Define the form schema
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  status: z.enum(["published", "draft", "pending"]),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  featuredImage: z.string().optional(),
  allowComments: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
});

export type PostFormValues = z.infer<typeof postSchema>;

export interface PostEditorProps {
  post?: Post;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export default function PostEditor({ post, onClose, onSaveSuccess }: PostEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [isSaving, setIsSaving] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  // Set up form with default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      status: post?.status || "draft",
      categories: post?.categories || [],
      featuredImage: post?.featuredImage || "",
      allowComments: true,
      isFeatured: false
    }
  });

  // Watch content for preview
  const contentValue = useWatch({
    control: form.control,
    name: "content",
  });

  // Update preview when content changes
  useEffect(() => {
    setPreviewContent(contentValue || "");
  }, [contentValue]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    // Only auto-generate slug if it hasn't been manually edited or is empty
    if (!post?.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      
      form.setValue("slug", slug);
    }
  };

  // Handle form submission
  const onSubmit = async (data: PostFormValues) => {
    setIsSaving(true);
    
    try {
      // Determine if this is a create or update operation
      const url = post ? `/api/posts/${post.id}` : '/api/posts';
      const method = post ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save post');
      }
      
      toast({
        title: post ? "Post Updated" : "Post Created",
        description: post ? "Your post has been updated successfully." : "Your post has been created successfully.",
      });
      
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter post title" 
                        {...field} 
                        onChange={handleTitleChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="enter-post-slug" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly version of the title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief summary of the post" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary displayed in listings and search results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your story content here..." 
                        className="min-h-[300px] font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Publication Settings</CardTitle>
                    <CardDescription>Configure how and when this post appears</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Control whether the post is publicly visible.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Image displayed in listings and at the top of the post.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="allowComments"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Allow Comments</FormLabel>
                              <FormDescription>
                                Let readers leave comments on this post.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Featured Story</FormLabel>
                              <FormDescription>
                                Highlight this story on the homepage and listings.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Categories</CardTitle>
                    <CardDescription>Select themes that best describe this story</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <FormField
                        control={form.control}
                        name="categories"
                        render={() => (
                          <FormItem>
                            <div className="space-y-2">
                              {themeCategories.map((category) => (
                                <FormField
                                  key={category.id}
                                  control={form.control}
                                  name="categories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={category.id}
                                        className="flex items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(category.id)}
                                            onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                                ? [...field.value, category.id]
                                                : field.value?.filter(
                                                    (value) => value !== category.id
                                                  );
                                              field.onChange(updatedValue);
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1">
                                          <FormLabel className="text-base">
                                            {category.name}
                                          </FormLabel>
                                          <FormDescription>
                                            {category.description}
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{form.getValues().title || "Post Title"}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{form.getValues().status}</Badge>
                    {form.getValues().categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {themeCategories.find(c => c.id === category)?.name || category}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="mb-4">
                      {form.getValues().excerpt || "No excerpt provided."}
                    </div>
                    <Separator className="my-4" />
                    <div className="whitespace-pre-wrap">
                      {previewContent || "No content to preview."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save {post ? "Changes" : "Post"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}