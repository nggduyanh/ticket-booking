import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../common/dateFormat";
import timeFormat from "../../common/timeFormat";
import formatCurrency from "../../common/formatCurrency";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import Pagination from "../../components/Pagination";

const Dashboard = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENTCY || "đ";
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    totalMovies: 0,
    activeShows: [],
    totalUsers: 0,
    totalActiveShows: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  const dashboardCards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(dashboardData.totalEarnings || 0) + currency,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Tổng đặt vé",
      value: dashboardData.totalBookings || 0,
      icon: ChartLineIcon,
    },
    {
      title: "Tổng số phim",
      value: dashboardData.totalMovies || 0,
      icon: ChartLineIcon,
    },
    {
      title: "Suất chiếu hoạt động",
      value: dashboardData.totalActiveShows || 0,
      icon: PlayCircleIcon,
    },
    {
      title: "Tổng người dùng",
      value: dashboardData.totalUsers || 0,
      icon: UserIcon,
    },
  ];
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/admin/dashboard", {
        params: { page: currentPage, limit },
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
        setPagination(data.pagination);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu dashboard", error);
      console.log("Lỗi khi lấy dữ liệu dashboard", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, currentPage, limit]);
  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Title text1="Admin" text2="Dashboard" />
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />

        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border 
              border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-10 text-lg font-medium">Suất chiếu hoạt động</p>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      ) : (
        <>
          <div className="relative flex flex-wrap gap-6 mt-4">
            <BlurCircle top="100px" left="-10%" />
            {dashboardData.activeShows.map((show) => (
              <div
                key={show._id}
                className="w-[18%] min-w-[200px] rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border 
            border-primary/20 hover:-translate-y-1 transition duration-300"
              >
                <img
                  src={show.movie.image}
                  alt={show.movie.title}
                  className="w-full h-60 object-cover"
                />
                <p className="font-medium p-2 truncate">{show.movie.title}</p>
                <div className="flex items-center justify-between px-2">
                  <p className="text-lg font-medium">
                    {formatCurrency(show.showPrice)}
                    {currency}
                  </p>
                </div>
                <p className="px-2 pt-2 text-sm text-gray-500">
                  {dateFormat(show.showDateTime)} -{" "}
                  {timeFormat(show.movie.runtime)}
                </p>
              </div>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default Dashboard;
