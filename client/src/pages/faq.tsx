
import React from "react";
import { FAQ } from "@/components/ui/faq";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-center mb-8">
            Find answers to common questions about our platform
          </p>
          <FAQ />
        </CardContent>
      </Card>
    </div>
  );
}
