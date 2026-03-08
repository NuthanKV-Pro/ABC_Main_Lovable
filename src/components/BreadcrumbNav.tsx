import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { getBreadcrumbs } from "@/lib/routeConfig";

const BreadcrumbNav = () => {
  const { pathname } = useLocation();
  const crumbs = getBreadcrumbs(pathname);

  if (pathname === "/" || crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-0 z-40 backdrop-blur-xl border-b border-border/30"
      style={{
        background: `linear-gradient(90deg, hsl(var(--card) / 0.85), hsl(var(--muted) / 0.7))`,
      }}
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm overflow-x-auto">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={crumb.path} className="flex items-center gap-1.5 shrink-0">
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 text-primary/40 shrink-0" />
                )}
                {isLast ? (
                  <span className="font-semibold text-primary truncate max-w-[220px] tracking-tight">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 truncate max-w-[160px] group"
                  >
                    {isFirst && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                        <Home className="h-3 w-3 text-primary shrink-0" />
                      </span>
                    )}
                    <span className="group-hover:underline underline-offset-2 decoration-primary/30">
                      {crumb.label}
                    </span>
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
