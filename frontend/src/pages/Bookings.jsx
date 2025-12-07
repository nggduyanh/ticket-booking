import { useEffect, useState } from "react";
import { dummyBookingData } from "../assets/assets";
import Loading from "../components/Loading";
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

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/users/bookings", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setBookings(data.bookings);
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

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>

      <h1 className="text-lg font-semibold mb-4">Vé của tôi</h1>

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
    </div>
  );
};

export default Bookings;
