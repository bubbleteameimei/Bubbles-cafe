"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AccessibilityTestPage() {
  return (
    <div className="container mx-auto py-10 grid gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Accessibility Test Page</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Standard Dialog Test</h2>
        <p>Tests that a standard dialog with title and description passes accessibility checks.</p>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Standard Dialog</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input id="username" defaultValue="@peduarte" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Minimal Dialog Test</h2>
        <p>Tests that a dialog without explicit title still has accessible elements for screen readers.</p>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Minimal Dialog</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="sr-only">Minimal Dialog Example</DialogTitle>
              <DialogDescription className="sr-only">
                This dialog demonstrates accessibility with visually hidden elements
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>This dialog has visually hidden title and description elements.</p>
              <p>They are accessible to screen readers while not visible in the UI.</p>
            </div>
            <DialogFooter>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Alert Dialog Test</h2>
        <p>Tests that alert dialogs have proper accessibility features.</p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Open Alert Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Minimal Alert Dialog Test</h2>
        <p>Tests that an alert dialog without explicit title still has accessible elements.</p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Open Minimal Alert Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="sr-only">Minimal Alert Dialog Example</AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                This alert dialog demonstrates accessibility with visually hidden elements
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p>This alert dialog has visually hidden title and description elements.</p>
              <p>They are accessible to screen readers while not visible in the UI.</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}