import { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
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
  const [filteredShows, setFilteredShows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/admin/all-shows", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setShows(data.shows);
        setFilteredShows(data.shows);
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

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  useEffect(() => {
    const filtered = shows.filter((show) =>
      show.movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShows(filtered);
  }, [searchTerm, shows]);

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Title text1="List" text2="Shows" />

      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
        />
      </div>

      {filteredShows.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          {searchTerm
            ? "Không tìm thấy suất chiếu phù hợp"
            : "Chưa có suất chiếu nào"}
        </p>
      ) : (
        <div className="max-w-4xl mt-6 overflow-x-auto">
          <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
            <thead>
              <tr className="bg-primary/20 text-left text-white">
                <th className="p-2 font-medium pl-5">Tên phim</th>
                <th className="p-2 font-medium">Thời gian chiếu</th>
                <th className="p-2 font-medium">Tổng đặt vé</th>
                <th className="p-2 font-medium">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="text-sm font-light">
              {filteredShows.map((show, index) => (
                <tr
                  key={index}
                  className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
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
      )}
    </>
  );
};

export default ListShows;
