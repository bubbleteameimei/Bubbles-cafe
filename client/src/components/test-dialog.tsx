import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function TestDialog() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dialog Accessibility Test</h1>
      
      {/* Test 1: Regular Dialog with Title and Description */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 1: Complete Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Complete Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>
                This dialog has both a title and description explicitly provided.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Dialog content goes here.</p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Test 2: Dialog without Title */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 2: Missing Title</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog Without Title</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="sr-only">Dialog With Description Only</DialogTitle>
              <DialogDescription>
                This dialog has a visually hidden title for screen readers.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Dialog content goes here.</p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Test 3: Dialog without Description */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 3: Missing Description</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog Without Description</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Without Description</DialogTitle>
              <DialogDescription className="sr-only">
                This is a dialog with a visible title but a screen reader only description.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Dialog content goes here with a visible title but hidden description.</p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Test 4: Dialog without Title or Description */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 4: Missing Both</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Minimal Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="sr-only">Minimal Dialog</DialogTitle>
              <DialogDescription className="sr-only">
                This is a minimal dialog with only visually hidden accessibility elements.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>This dialog has neither a title nor description explicitly visible.</p>
              <p>But it's still accessible with screen reader only elements.</p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test 5: Interactive Form Dialog */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 5: Interactive Form Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Interactive Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscribe to Newsletter</DialogTitle>
              <DialogDescription>
                Enter your email to receive updates about our latest stories.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border rounded-md"
                    aria-describedby="email-description"
                  />
                  <p id="email-description" className="text-xs text-muted-foreground">
                    We'll never share your email with anyone else.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="consent"
                    type="checkbox"
                    className="rounded-sm"
                    aria-describedby="consent-description"
                  />
                  <label htmlFor="consent" className="text-sm">
                    I agree to receive marketing emails
                  </label>
                </div>
                <p id="consent-description" className="text-xs text-muted-foreground">
                  You can unsubscribe at any time by clicking the link in the footer of our emails.
                </p>
              </form>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Subscribe</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default TestDialog;