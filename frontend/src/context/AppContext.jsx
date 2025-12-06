import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
export const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

export const AppProvider = ({ children }) => {
  console.log("---------");

  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    const api = import.meta.env.VITE_API_BASE_URL;
    console.log("-------import.meta.env.VITE_API_BASE_URL;", api);

    try {
      const { data } = await axios.get("/admin/is-admin", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("Truy cập bị từ chối. Chỉ dành cho quản trị viên.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/shows/list", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
    }
  }, [user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
