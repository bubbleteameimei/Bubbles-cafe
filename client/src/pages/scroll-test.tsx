import React from 'react';
import { Button } from '@/components/ui/button';

const ScrollTestPage: React.FC = () => {
  // Function to scroll to specific positions for testing
  const scrollToPosition = (position: number) => {
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Scroll-to-Top Button Test Page</h1>
      
      <div className="mb-8 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => scrollToPosition(0)}>Scroll to Top</Button>
          <Button onClick={() => scrollToPosition(500)}>Scroll to 500px</Button>
          <Button onClick={() => scrollToPosition(1000)}>Scroll to 1000px</Button>
          <Button onClick={() => scrollToPosition(2000)}>Scroll to 2000px</Button>
          <Button onClick={() => scrollToPosition(5000)}>Scroll to 5000px</Button>
        </div>
      </div>
      
      <div className="space-y-16">
        {/* Generate multiple sections to create scrollable content */}
        {Array.from({ length: 20 }).map((_, index) => (
          <section key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Section {index + 1}</h3>
            <p className="mb-4">
              This is a test section to provide scrollable content for testing the scroll-to-top button.
              As you scroll down, the button should appear in the bottom-right corner of the screen.
              Clicking the button should smoothly scroll back to the top of the page.
            </p>
            <p className="text-gray-500">
              Current scroll position: {index * 250}px (approximately)
            </p>
          </section>
        ))}
      </div>
      
      <div className="h-screen flex items-center justify-center bg-gray-100 my-16 rounded-lg">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">End of Test Page</h3>
          <p className="mb-6">
            You've reached the end of the test page. The scroll-to-top button should be visible.
            Click it to return to the top, or use the buttons below to test specific scroll positions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => scrollToPosition(0)} variant="outline">
              Return to Top
            </Button>
            <Button onClick={() => scrollToPosition(500)} variant="outline">
              Scroll to 500px
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollTestPage;