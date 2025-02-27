
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-4xl font-bold mb-4 text-center">Help Center</h1>
          <p className="text-muted-foreground text-center mb-8">
            Find answers and learn how to make the most of our platform
          </p>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="getting-started">
                <AccordionTrigger>Getting Started</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Creating an Account</h3>
                    <p>To create an account, click on the "Sign Up" button in the top-right corner of the homepage. Fill in your details and submit the form.</p>
                    
                    <h3 className="text-xl font-medium">Browsing Stories</h3>
                    <p>You can browse stories by clicking on the "Stories" link in the main navigation. From there, you can filter by categories and tags.</p>
                    
                    <h3 className="text-xl font-medium">Your Profile</h3>
                    <p>Your profile page shows your activity, bookmarks, and submitted stories. Access it by clicking on your username in the top navigation.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="reading">
                <AccordionTrigger>Reading Stories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Story Features</h3>
                    <p>Each story has options for adjusting font size, enabling dark mode, and audio playback if available.</p>
                    
                    <h3 className="text-xl font-medium">Bookmarking</h3>
                    <p>Click the bookmark icon on any story to save it to your reading list for later.</p>
                    
                    <h3 className="text-xl font-medium">Comments</h3>
                    <p>You can leave comments on stories if you're logged in. Please follow our community guidelines.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="writing">
                <AccordionTrigger>Writing & Submitting</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Submission Guidelines</h3>
                    <p>We accept original horror stories between 1,000 and 10,000 words. All content must adhere to our content policy.</p>
                    
                    <h3 className="text-xl font-medium">The Editor</h3>
                    <p>Our editor supports Markdown formatting, allowing you to add emphasis, headings, and other formatting to your stories.</p>
                    
                    <h3 className="text-xl font-medium">Publication Process</h3>
                    <p>After submission, your story will be reviewed by our moderators before being published on the site.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="account">
                <AccordionTrigger>Account Management</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Updating Profile</h3>
                    <p>You can update your profile information including your avatar, bio, and preferences from the settings page.</p>
                    
                    <h3 className="text-xl font-medium">Privacy Controls</h3>
                    <p>Manage your privacy settings to control what information is visible to other users.</p>
                    
                    <h3 className="text-xl font-medium">Deleting Account</h3>
                    <p>If you wish to delete your account, please go to settings and follow the account deletion process.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
