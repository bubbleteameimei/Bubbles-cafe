import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-8">
      <div 
        className="relative bg-cover bg-center py-12"
        style={{
          backgroundImage: 'url("/IMG_4480.jpeg")',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <h2 className="font-serif text-2xl md:text-3xl text-primary/90 mb-2">Veritas Vincit Omnia</h2>
              <p className="text-sm text-muted-foreground italic">Truth Conquers All</p>
            </div>

            <div className="w-full max-w-2xl mx-auto border-t border-border/20 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground font-serif">
                  © Bubble's Cafe {new Date().getFullYear()}. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-serif">
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-primary/50">•</span>
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