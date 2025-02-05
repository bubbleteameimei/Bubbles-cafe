export default function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          © Bubble's Cafe {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
