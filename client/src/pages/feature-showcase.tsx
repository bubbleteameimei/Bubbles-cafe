"use client"

import React, { useRef, useState } from "react"
import { useReadingProgress } from "@/hooks/use-reading-progress"
import { ReadingProgress } from "@/components/ui/reading-progress"
import { StoryRecommendations } from "@/components/story-recommendations"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Search, Sparkles } from "lucide-react"

export default function FeatureShowcasePage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const { progress } = useReadingProgress({
    target: contentRef,
    updateInterval: 50,
    persistProgress: true,
    progressKey: "showcase-demo"
  })
  
  // Demo tabs state
  const [activeTab, setActiveTab] = useState("reading-progress")
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-2">Feature Showcase</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Explore the new features we've added to enhance your horror story experience
      </p>
      
      <Tabs 
        defaultValue="reading-progress" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reading-progress" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Reading Progress
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <Sparkles className="mr-2 h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </TabsTrigger>
        </TabsList>
        
        {/* Reading Progress Demo */}
        <TabsContent value="reading-progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading Progress Indicator</CardTitle>
              <CardDescription>
                Track your reading progress automatically as you scroll through content.
                Progress is saved between sessions so you can pick up where you left off.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Default Position (Top)</h3>
                <ReadingProgress progress={progress} />
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Slim Variant</h3>
                <ReadingProgress progress={progress} variant="slim" />
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Accent Color</h3>
                <ReadingProgress progress={progress} variant="accent" />
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Gradient Style with Percentage</h3>
                <ReadingProgress progress={progress} variant="gradient" showPercentage={true} />
              </div>
              
              <Separator className="my-8" />
              
              <h3 className="text-xl font-bold mb-4">Demo Content</h3>
              <p className="mb-2 text-muted-foreground">
                Scroll through this content to see the progress indicators update in real-time:
              </p>
              
              <div 
                ref={contentRef}
                className="border rounded-md p-4 h-[400px] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-4">The Whispering Shadows</h2>
                <p className="mb-4">
                  The old house at the end of Blackwood Lane had been abandoned for as long as anyone could remember. 
                  Local legends spoke of strange disappearances and eerie sounds that echoed through the valley on moonless nights. 
                  Most folks in town avoided it completely, crossing to the other side of the street when they had to pass by.
                </p>
                
                <p className="mb-4">
                  Sarah had never believed in ghost stories. As a skeptic and aspiring journalist, she saw the abandoned house 
                  as nothing more than an opportunity for an interesting article for the local paper. Armed with her camera and recorder, 
                  she decided to spend one night investigating the supposedly haunted property.
                </p>
                
                <p className="mb-4">
                  The floorboards creaked beneath her feet as she stepped inside. The air was thick with dust and the unmistakable scent 
                  of decay. Despite the warm summer evening outside, a peculiar chill permeated the house.
                </p>
                
                <p className="mb-4">
                  "Hello?" Sarah called out, her voice echoing through the empty rooms. "Is anyone here?"
                </p>
                
                <p className="mb-4">
                  Only silence answered her, but as she ventured deeper into the house, she couldn't shake the feeling 
                  that she was being watched. At first, she attributed it to nerves—after all, even skeptics could get spooked 
                  in the right setting. But when she reviewed her recordings later, she would discover something that would challenge 
                  everything she believed about the supernatural.
                </p>
                
                <p className="mb-4">
                  In the attic, Sarah found an old trunk filled with yellowed letters and faded photographs. The correspondence told 
                  the story of the house's former occupants—the Blackwood family—and the tragic fate that had befallen them in the winter of 1887.
                </p>
                
                <p className="mb-4">
                  Absorbed in her reading, Sarah failed to notice the sun setting outside. It wasn't until the room plunged into 
                  darkness that she realized how late it had become. She reached for her flashlight, but before she could switch it on, 
                  a soft whisper emanated from the corner of the attic.
                </p>
                
                <p className="mb-4">
                  "You shouldn't be here," the voice hissed, barely audible yet unmistakably clear.
                </p>
                
                <p className="mb-4">
                  Sarah's heart thundered in her chest as she fumbled with the flashlight. When she finally managed to turn it on, 
                  the beam illuminated an empty room. But in the dust coating the floor, fresh footprints led to the wall—and simply stopped.
                </p>
                
                <p className="mb-4">
                  As the night wore on, the whispers grew more frequent, more insistent. The temperature dropped until Sarah could see her breath 
                  in the air. Objects moved when she wasn't looking. Doors that she had left open would be closed; windows that were shut would be found ajar.
                </p>
                
                <p className="mb-4">
                  By midnight, Sarah was no longer alone in the house—at least, that's what every instinct told her. The rational part of her brain 
                  tried to explain away the phenomena: old houses settled; drafts caused temperature changes; her mind was playing tricks in the darkness.
                </p>
                
                <p className="mb-4">
                  But when she checked her camera and saw the shadowy figure standing behind her in every photograph, wearing clothes from another 
                  century and a smile that didn't reach its hollow eyes, Sarah knew she had found her story—and perhaps much more than she had bargained for.
                </p>
                
                <p className="mb-4">
                  The question was: would she live to write it?
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recommendations Demo */}
        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Story Recommendations</CardTitle>
              <CardDescription>
                Discover new stories based on your reading preferences and the themes you enjoy.
                Our recommendation engine analyzes content similarity and reading patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Grid Layout (Default)</h3>
                <StoryRecommendations 
                  currentPostId={1} 
                  themeCategories={['SUPERNATURAL', 'PSYCHOLOGICAL']}
                  maxRecommendations={3}
                  layout="grid"
                />
              </div>
              
              <Separator className="my-8" />
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Carousel Layout</h3>
                <StoryRecommendations 
                  currentPostId={1} 
                  themeCategories={['DEATH', 'GOTHIC']}
                  maxRecommendations={5}
                  layout="carousel"
                />
              </div>
              
              <Separator className="my-8" />
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Sidebar Layout</h3>
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2">
                    <div className="border rounded-md p-4">
                      <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
                      <p className="text-muted-foreground">
                        This is where your main story content would appear. The sidebar layout
                        places recommendations in a vertical column to the right, perfect for
                        "You might also like" suggestions while reading.
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <StoryRecommendations 
                      currentPostId={1} 
                      themeCategories={['BODY_HORROR', 'ISOLATION']}
                      maxRecommendations={2}
                      layout="sidebar"
                      showAnalytics={false}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Search Demo */}
        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Find exactly what you're looking for with our powerful search features.
                Filter by theme, reading time, and more to discover the perfect horror story.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button size="lg" asChild>
                  <a href="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Try Advanced Search
                  </a>
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Features Include:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Full-text search across titles and content</li>
                  <li>Filter by theme categories (Psychological, Supernatural, etc.)</li>
                  <li>Reading time filters to find stories that fit your schedule</li>
                  <li>Multiple sorting options (newest, popular, recommended)</li>
                  <li>Responsive design that works on all devices</li>
                  <li>URL-based search parameters for sharing results</li>
                </ul>
              </div>
              
              <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md border">
                <iframe 
                  src="/search" 
                  className="w-full h-[500px] border-0" 
                  title="Advanced Search Preview"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          We're constantly working to improve your reading experience.
          Have suggestions for new features? Let us know!
        </p>
        <Button asChild>
          <a href="/feedback">Send Feedback</a>
        </Button>
      </div>
    </div>
  )
}