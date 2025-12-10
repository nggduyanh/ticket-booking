import { useEffect, useState } from "react";
import { dummyBookingData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../common/dateFormat";
import timeFormat from "../../common/timeFormat";
import formatCurrency from "../../common/formatCurrency";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENTCY || "đ";
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  const getAllBookings = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/admin/all-bookings", {
        params: { page: currentPage, limit },
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setBookings(data.bookings);
        setFilteredBookings(data.bookings);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Ỗi khi lấy dữ liệu bookings", error);
      console.log("Ỗi khi lấy dữ liệu bookings", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user, currentPage, limit]);

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const userName = booking.user.name.toLowerCase();
      const movieTitle = booking.show.movie.title.toLowerCase();
      const search = searchTerm.toLowerCase();
      return userName.includes(search) || movieTitle.includes(search);
    });
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người dùng hoặc tên phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
        />
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          {searchTerm ? "Không tìm thấy đặt vé phù hợp" : "Chưa có đặt vé nào"}
        </p>
      ) : (
        <>
          <div className="max-w-4xl mt-6 overflow-x-auto">
            <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
              <thead>
                <tr className="bg-primary/20 text-left text-white">
                  <th className="p-2 font-medium pl-5">Tên người dùng</th>
                  <th className="p-2 font-medium">Tên phim</th>
                  <th className="p-2 font-medium">Thời gian chiếu</th>
                  <th className="p-2 font-medium">Ghế ngồi</th>
                  <th className="p-2 font-medium">Số tiền</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light">
                {filteredBookings.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-2 min-w-45 pl-5">{item.user.name}</td>
                    <td className="p-2">{item.show.movie.title}</td>
                    <td className="p-2">
                      {dateFormat(item.show.showDateTime)} -{" "}
                      {timeFormat(item.show.movie.runtime)}
                    </td>
                    <td className="p-2">
                      {Object.keys(item.bookedSeats)
                        .map((seat) => item.bookedSeats[seat])
                        .join(", ")}
                    </td>
                    <td className="p-2">
                      {formatCurrency(item.amount)}
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

export default ListBookings;
