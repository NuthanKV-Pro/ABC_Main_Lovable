import { Phone, Mail, User } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">Nuthan Kaparthy</span>
          </div>
          <span className="hidden sm:inline text-muted-foreground/50">|</span>
          <a 
            href="tel:+919535951140" 
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+91 95-35-95-1140</span>
          </a>
          <span className="hidden sm:inline text-muted-foreground/50">|</span>
          <a 
            href="mailto:nuthankaparthy@gmail.com" 
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>nuthankaparthy@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
