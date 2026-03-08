import { useNavigate, useLocation } from "react-router-dom";
import { routeMap } from "@/lib/routeConfig";

/**
 * Returns a goBack function that navigates to the parent route
 * from routeConfig, or falls back to "/prototypes" if no parent is defined.
 */
export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    const routeInfo = routeMap[location.pathname];
    const parentRoute = routeInfo?.parent || "/prototypes";
    navigate(parentRoute);
  };

  return goBack;
}
