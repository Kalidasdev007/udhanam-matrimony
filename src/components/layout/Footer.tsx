import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold">
                <span className="font-display text-lg font-bold text-primary-foreground">U</span>
              </div>
              <span className="font-display text-xl font-semibold text-foreground">
                Udhanam
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted partner in finding the perfect match through traditional astrology and matrimony services.
            </p>
          </div>
          
          <div>
            <h3 className="font-display text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/astrologers" className="text-sm text-muted-foreground hover:text-foreground">
                  Our Astrologers
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display text-lg font-semibold">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Email: info@udhanam.com</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Udhanam Matrimony. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
