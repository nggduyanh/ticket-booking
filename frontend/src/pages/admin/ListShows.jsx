import { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import Autocomplete from "../../components/Autocomplete";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../common/dateFormat";
import timeFormat from "../../common/timeFormat";
import formatCurrency from "../../common/formatCurrency";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { Search } from "lucide-react";

const ListShows = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENTCY || "đ";
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    movieId: "",
    roomId: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  const getAllShows = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit };
      if (appliedFilters.movieId) params.movieId = appliedFilters.movieId;
      if (appliedFilters.roomId) params.roomId = appliedFilters.roomId;
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const { data } = await axios.get("/admin/all-shows", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setShows(data.shows);
        setPagination(data.pagination);
      } else {
        toast.error("Lỗi khi lấy dữ liệu shows", data.message);
        console.log("Lỗi khi lấy dữ liệu shows", data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu shows", error);
      console.log("Lỗi khi lấy dữ liệu shows", error);
    }
    setIsLoading(false);
  };

  const handleFilter = () => {
    setAppliedFilters({
      search: searchTerm,
      movieId: selectedMovie,
      roomId: selectedRoom,
      startDate: startDate,
      endDate: endDate,
    });
    setCurrentPage(1);
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
      console.log("Lỗi khi lấy danh sách phim", error);
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
      console.log("Lỗi khi lấy danh sách phòng chiếu", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMovies();
      fetchRooms();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user, currentPage, limit, appliedFilters]);

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Title text1="List" text2="Shows" />

      <div className="mb-6">
        <p className="text-lg font-medium mb-4">Lọc suất chiếu</p>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
            </div>
          </div>

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
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition font-medium whitespace-nowrap"
          >
            Lọc
          </button>
        </div>
      </div>

      {shows.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Không tìm thấy suất chiếu phù hợp
        </p>
      ) : (
        <>
          <div className="max-w-4xl mt-6 overflow-x-auto">
            <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
              <thead>
                <tr className="bg-primary/20 text-left text-white">
                  <th className="p-2 font-medium pl-5">Tên phim</th>
                  <th className="p-2 font-medium">Phòng chiếu</th>
                  <th className="p-2 font-medium">Thời gian chiếu</th>
                  <th className="p-2 font-medium">Tổng đặt vé</th>
                  <th className="p-2 font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light">
                {shows.map((show, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
                    <td className="p-2">{show.room?.name || "N/A"}</td>
                    <td className="p-2">
                      {dateFormat(show.showDateTime)} -{" "}
                      {timeFormat(show.movie.runtime)}
                    </td>
                    <td className="p-2">
                      {Object.keys(show.occupiedSeats).length}
                    </td>
                    <td className="p-2">
                      {formatCurrency(
                        Object.keys(show.occupiedSeats).length * show.showPrice
                      )}
                      {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.page}
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

export default ListShows;
