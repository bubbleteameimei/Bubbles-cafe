import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
// Assuming EnhancedCollapsible is defined elsewhere, as per the thinking section.
//This is crucial for the code to function correctly.  Without this component, the code will fail.
const EnhancedCollapsible = ({ title, variant, children, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border rounded-md shadow-sm ${className}`}>
            <div 
                className="bg-gray-100 px-4 py-2 cursor-pointer flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
                <ChevronsUpDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="bg-white p-4 space-y-2">
                    {children}
                </div>
            )}
        </div>
    )
}


export default function Privacy() {
  const [sections, setSections] = useState({
    contentProtection: false,
    infoCollect: false,
    howWeUse: false,
    dataSecurity: false,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 prose prose-invert max-w-none">
            {/* Content Protection Section */}
            <EnhancedCollapsible 
              title="Content Protection Notice"
              variant="elegant"
              className="mb-4"
            >
              <p className="text-muted-foreground whitespace-pre-line mt-2">
                  ALL CONTENT ON THIS SITE IS ORIGINAL AND PROTECTED. UNAUTHORIZED REPRODUCTION, PLAGIARISM, OR COMMERCIAL TRANSLATION OF MY WORK IS STRICTLY PROHIBITED AND MAY RESULT IN LEGAL ACTION. IF YOU WISH TO SHARE OR USE ANY CONTENT, PLEASE OBTAIN PRIOR PERMISSION BY CONTACTING ME DIRECTLY.

                  THANK YOU FOR YOUR SUPPORT, AND ENJOY THE STORIES.
                </p>
            </EnhancedCollapsible>

            {/* Information We Collect Section */}
            <EnhancedCollapsible 
              title="Information We Collect"
              variant="elegant"
              className="mb-4"
            >
              <p className="text-muted-foreground">We may collect the following types of information:</p>

                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-muted-foreground">
                  When you register, comment, or interact with our Website, we may collect:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Any other information you voluntarily provide</li>
                </ul>

                <h3 className="text-lg font-semibold">Non-Personal Information</h3>
                <p className="text-muted-foreground">
                  We may collect data that does not directly identify you, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Browser type and version</li>
                  <li>IP address</li>
                  <li>Device information</li>
                  <li>Usage data (e.g., pages visited, time spent on the Website)</li>
                </ul>
            </EnhancedCollapsible>

            {/* How We Use Your Information Section */}
            <EnhancedCollapsible 
              title="How We Use Your Information"
              variant="elegant"
              className="mb-4"
            >
              <p className="text-muted-foreground">We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide and improve our services</li>
                  <li>Customize your experience on the Website</li>
                  <li>Enable interactive features (e.g., commenting, story tracking)</li>
                  <li>Respond to inquiries or requests</li>
                  <li>Monitor Website security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We do not sell or share your personal data with third parties for marketing purposes.
                </p>
            </EnhancedCollapsible>

            {/* Data Security Section */}
            <EnhancedCollapsible 
              title="Data Security"
              variant="elegant"
              className="mb-4"
            >
              <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your data. However, no online platform is completely secure. 
                  We encourage you to use strong passwords and exercise caution when sharing personal information.
                </p>
            </EnhancedCollapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}