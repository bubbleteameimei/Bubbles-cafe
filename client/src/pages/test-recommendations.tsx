import { useState } from 'react';
import { DirectRecommendations } from '../components/direct-recommendations';
import { StoryRecommendations } from '../components/story-recommendations';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestRecommendationsPage() {
  const [layout, setLayout] = useState<"grid" | "carousel" | "sidebar">("grid");
  const [limit, setLimit] = useState(3);
  
  const handleBookmark = (postId: number) => {
    console.log(`Bookmarked post ${postId}`);
    alert(`Bookmarked post ${postId}`);
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Testing Recommendations</h1>
      <p className="text-muted-foreground mb-6">Testing different recommendation components and layouts</p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Adjust the settings to test different layouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Layout Style</h3>
              <RadioGroup 
                value={layout} 
                onValueChange={(val) => setLayout(val as "grid" | "carousel" | "sidebar")}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="grid" id="grid" className="peer sr-only" />
                  <Label
                    htmlFor="grid"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Grid
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="carousel" id="carousel" className="peer sr-only" />
                  <Label
                    htmlFor="carousel"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Carousel
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="sidebar" id="sidebar" className="peer sr-only" />
                  <Label
                    htmlFor="sidebar"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Sidebar
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="mb-2 font-medium">Number of Items</h3>
              <RadioGroup 
                value={String(limit)} 
                onValueChange={(val) => setLimit(Number(val))}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="2" id="limit-2" className="peer sr-only" />
                  <Label
                    htmlFor="limit-2"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    2
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="3" id="limit-3" className="peer sr-only" />
                  <Label
                    htmlFor="limit-3"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    3
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="5" id="limit-5" className="peer sr-only" />
                  <Label
                    htmlFor="limit-5"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    5
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="direct">Direct Recommendations</TabsTrigger>
          <TabsTrigger value="story">Story Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="p-2 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Testing Direct Recommendations</h2>
          <p className="text-muted-foreground mb-6">
            This component uses the direct recommendations API endpoint which is simpler and more reliable.
          </p>
          
          <DirectRecommendations 
            layout={layout}
            limit={limit}
            showAuthor={true}
            showExcerpt={true}
            onBookmark={handleBookmark}
          />
        </TabsContent>
        
        <TabsContent value="story" className="p-2 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Testing Story Recommendations</h2>
          <p className="text-muted-foreground mb-6">
            This is the more complex component with fallback to Direct Recommendations.
          </p>
          
          <StoryRecommendations 
            currentPostId={1}
            layout={layout}
            maxRecommendations={limit}
            showAnalytics={true}
            onBookmark={handleBookmark}
          />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>The DirectRecommendations component uses the /api/recommendations/direct endpoint</li>
            <li>The StoryRecommendations component attempts to use /api/posts/recommendations but falls back to DirectRecommendations</li>
            <li>Error states and loading states are handled in both components</li>
            <li>Different layouts (grid, carousel, sidebar) can be tested</li>
            <li>Bookmark functionality is implemented but just shows an alert for demo purposes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}