import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Autocomplete from "../../components/Autocomplete";
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

  // Filter states
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedMovie, setAppliedMovie] = useState("");
  const [appliedRoom, setAppliedRoom] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

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
      const params = { page: currentPage, limit };
      if (appliedMovie) params.movieId = appliedMovie;
      if (appliedRoom) params.roomId = appliedRoom;
      if (appliedStartDate) params.startDate = appliedStartDate;
      if (appliedEndDate) params.endDate = appliedEndDate;

      const { data } = await axios.get("/admin/dashboard", {
        params,
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

  const fetchMovies = async (searchKeyword = "") => {
    try {
      const params = { page: 1, limit: 10 };
      if (searchKeyword) params.search = searchKeyword;

      const { data } = await axios.get("/movies/list", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        setMovies(data.movies);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async (searchKeyword = "") => {
    try {
      const params = { page: 1, limit: 10 };
      if (searchKeyword) params.search = searchKeyword;

      const { data } = await axios.get("/rooms/list", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilter = () => {
    setAppliedMovie(selectedMovie);
    setAppliedRoom(selectedRoom);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchMovies();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [
    user,
    currentPage,
    limit,
    appliedMovie,
    appliedRoom,
    appliedStartDate,
    appliedEndDate,
  ]);
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

      {/* Filter Section */}
      <div className="mt-10">
        <p className="text-lg font-medium mb-4">Lọc suất chiếu hoạt động</p>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Phim</label>
            <Autocomplete
              options={movies}
              value={selectedMovie}
              onChange={setSelectedMovie}
              onSearch={fetchMovies}
              placeholder="Chọn phim..."
              displayKey="title"
              valueKey="_id"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">
              Phòng chiếu
            </label>
            <Autocomplete
              options={rooms.map((r) => ({
                ...r,
                displayName: `${r.name} (${r.totalSeats} ghế)`,
              }))}
              value={selectedRoom}
              onChange={setSelectedRoom}
              onSearch={fetchRooms}
              placeholder="Chọn phòng..."
              displayKey="displayName"
              valueKey="_id"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
            />
          </div>

          <button
            onClick={handleFilter}
            className="px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
          >
            Lọc
          </button>
        </div>
      </div>

      <p className="mt-6 text-lg font-medium">Suất chiếu hoạt động</p>
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
                <p className="px-2 text-sm text-gray-400">
                  Phòng: {show.room?.name || "N/A"}
                </p>
                <p className="px-2 pt-1 text-sm text-gray-500">
                  {dateFormat(show.showDateTime)} -{" "}
                  {timeFormat(show.movie.runtime)}
                </p>
              </div>
            ))}
          </div>
          {pagination && (
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
