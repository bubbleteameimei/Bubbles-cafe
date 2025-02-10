import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10">
      <div 
        className="relative bg-cover bg-center py-16"
        style={{
          backgroundImage: 'url("/IMG_4480.jpeg")',
          backgroundBlendMode: 'multiply',
          backgroundColor: 'rgba(20, 20, 20, 0.85)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/75" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">Veritas Vincit Omnia</h2>
              <p className="text-sm text-muted-foreground/90 italic font-serif">Truth Conquers All</p>
            </div>

            <div className="w-full max-w-2xl mx-auto border-t border-primary/10 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-sm text-muted-foreground/80 font-serif">
                  © Bubble's Cafe {new Date().getFullYear()}. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground/80 font-serif">
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-primary/30">•</span>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}