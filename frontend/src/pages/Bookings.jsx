import { useEffect, useState } from "react";
import { dummyBookingData } from "../assets/assets";
import Loading from "../components/Loading";
import Autocomplete from "../components/Autocomplete";
import Pagination from "../components/Pagination";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../common/timeFormat";
import { dateFormat } from "../common/dateFormat";
import formatCurrency from "../common/formatCurrency";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const Bookings = () => {
  const { user, axios, getToken } = useAppContext();

  const currentcy = import.meta.env.VITE_CURRENTCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  // Filter states
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [appliedMovie, setAppliedMovie] = useState("");
  const [appliedRoom, setAppliedRoom] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const paymentStatuses = [
    { _id: "1", name: "Đã thanh toán" },
    { _id: "2", name: "Thanh toán thất bại" },
    { _id: "3", name: "Chờ thanh toán" },
  ];

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit };
      if (appliedMovie) params.movieId = appliedMovie;
      if (appliedRoom) params.roomId = appliedRoom;
      if (appliedStatus) params.paidStatus = appliedStatus;

      const { data } = await axios.get("/users/bookings", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setBookings(data.bookings);
        setPagination(data.pagination);
      } else {
        toast.error("Lỗi khi lấy dữ liệu bookings", data.message);
        console.log("Lỗi khi lấy dữ liệu bookings", data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu bookings", error);
      console.log("Lỗi khi lấy dữ liệu bookings", error);
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
    setAppliedStatus(selectedStatus);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchMovies();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, currentPage, limit, appliedMovie, appliedRoom, appliedStatus]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>

      <h1 className="text-lg font-semibold mb-6">Vé của tôi</h1>

      {/* Filter Section */}
      <div className="mb-6">
        <p className="text-md font-medium mb-4">Lọc vé</p>
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
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <Autocomplete
              options={paymentStatuses}
              value={selectedStatus}
              onChange={setSelectedStatus}
              onSearch={() => {}}
              placeholder="Chọn trạng thái..."
              displayKey="name"
              valueKey="_id"
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

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>Chưa có vé nào</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-2">
            Tìm thấy {pagination?.total || 0} vé
          </p>
          {bookings.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
            >
              <div className="flex flex-col md:flex-row">
                <img
                  src={item.show.movie.image}
                  alt={item.show.movie.title}
                  className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
                />
                <div className="flex flex-col p-4">
                  <p className="font-semibold">{item.show.movie.title}</p>
                  <p className="text-gray-400 text-sm">
                    {timeFormat(item.show.movie.runtime)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {dateFormat(item.show.showDateTime)}
                  </p>
                  {item.show.room && (
                    <p className="text-gray-400 text-sm">
                      Phòng: {item.show.room.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:items-end md:text-right justify-between p-4">
                <div className="flex flex-col items-start md:items-end gap-2">
                  {item.paidStatus === 3 && (
                    <a href={item.paymentLink} target="_blank">
                      <button className="bg-primary px-4 py-1.5 text-sm rounded-full font-medium cursor-pointer">
                        Thanh toán
                      </button>
                    </a>
                  )}
                  {item.paidStatus === 1 && (
                    <div className="bg-green-700 px-4 py-1.5 text-sm rounded-full font-medium cursor-default whitespace-nowrap">
                      Đã thanh toán
                    </div>
                  )}
                  {item.paidStatus === 2 && (
                    <div className="bg-red-700 px-4 py-1.5 text-sm rounded-full font-medium cursor-default whitespace-nowrap">
                      Thanh toán thất bại
                    </div>
                  )}
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.amount)}
                    {currentcy}
                  </p>
                </div>
                <div className="text-sm">
                  <p>
                    <span className="text-gray-400">Tổng số vé:</span>{" "}
                    {item.bookedSeats.length}
                  </p>
                  <p>
                    <span className="text-gray-400">Số ghế:</span>{" "}
                    {item.bookedSeats.join(", ")}
                  </p>
                  <p>
                    <span className="text-gray-400">Thời gian đặt:</span>{" "}
                    {new Date(item.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default Bookings;
