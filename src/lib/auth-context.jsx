import axiosInstance from "@/API/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getTokens = () => ({
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  });

  const logoutLocal = () => {
    setUser(null);
    setBusiness(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

  };

  const normalizeBusiness = (businessData) => {
    if (!businessData) return null;

    const trust =
      businessData.trustScore ||
      businessData.trust_score ||
      {};

    return {
      ...businessData,

      overall:
        businessData.overall ??
        trust.overall ??
        0,

      kycScore:
        businessData.kycScore ??
        trust.kycScore ??
        0,

      complianceScore:
        businessData.complianceScore ??
        trust.complianceScore ??
        0,

      dealPerformanceScore:
        businessData.dealPerformanceScore ??
        trust.dealPerformanceScore ??
        0,

      activityScore:
        businessData.activityScore ??
        trust.activityScore ??
        0,
    };

  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const { data } =
        await axiosInstance.get("/auth/me");

      const userData =
        data?.user ||
        data?.data?.user ||
        null;

      const scope = data.membership?.scope || data.scope || "";

      const businessData =
        data?.business ||
        data?.data?.business ||
        null;

      setUser({ ...userData, scope });
      setBusiness(
        normalizeBusiness(businessData)
      );
    } catch (error) {
      console.error(
        "Profile fetch failed:",
        error
      );

      if (error.response?.status === 401) {
        logoutLocal();
      }
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken } = getTokens();


      if (accessToken) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };

    initializeAuth();


  }, []);

  const login = async (payload) => {
    localStorage.setItem(
      "accessToken",
      payload.accessToken
    );


    localStorage.setItem(
      "refreshToken",
      payload.refreshToken
    );

    await fetchUserProfile();

  };

  const logout = async () => {
    try {
      await axiosInstance.post(
        "/auth/logout",
        {
          refreshToken:
            localStorage.getItem(
              "refreshToken"
            ),
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      logoutLocal();
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        login,
        logout,
        fetchUserProfile,
        logoutLocal,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
