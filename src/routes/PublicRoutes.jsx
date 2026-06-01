import { useAuth } from "@/lib/auth-context";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoutes = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
};

export default PublicRoutes;