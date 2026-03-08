import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { getBreadcrumbs } from "@/lib/routeConfig";

const BreadcrumbNav = () => {
  const { pathname } = useLocation();
  const crumbs = getBreadcrumbs(pathname);

  // Don't show breadcrumbs on landing page or if no crumbs
  if (pathname === "/" || crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-0 z-40 bg-muted/80 border-b border-border/50 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center gap-1 py-2 text-xs sm:text-sm overflow-x-auto">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={crumb.path} className="flex items-center gap-1 shrink-0">
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                )}
                {isLast ? (
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[150px]"
                  >
                    {isFirst && <Home className="h-3 w-3 shrink-0" />}
                    <span>{crumb.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default BreadcrumbNav;
