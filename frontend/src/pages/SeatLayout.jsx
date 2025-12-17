import React, { use, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../common/isoTimeFormat";
import formatCurrency from "../common/formatCurrency";
import BlurCircle from "../components/BlurCircle";
import { toast } from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import { useClerk } from "@clerk/clerk-react";

const SeatLayout = () => {
  const { id, date } = useParams();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get("roomId");
  const currency = import.meta.env.VITE_CURRENTCY || "đ";
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [room, setRoom] = useState(null);
  const [seatTypes, setSeatTypes] = useState({});
  const [seatPrices, setSeatPrices] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  const { axios, getToken, user, isAdmin } = useAppContext();
  const { openSignIn } = useClerk();

  const getShow = async () => {
    try {
      const url = roomIdParam
        ? `/shows/${id}?roomId=${roomIdParam}`
        : `/shows/${id}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setShow(data.show);
      } else {
        toast.error("Lỗi khi lấy dữ liệu shows", data.message);
        console.log("Lỗi khi lấy dữ liệu shows", data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu shows", error);
      console.log("Lỗi khi lấy dữ liệu shows", error);
    }
  };

  const fetchSeatTypes = async () => {
    try {
      const { data } = await axios.get("/seat-types/list", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        const seatTypeMap = {};
        data.seatTypes.forEach((st) => {
          seatTypeMap[st._id] = st;
        });
        setSeatTypes(seatTypeMap);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại ghế:", error);
    }
  };

  const fetchRoomDetails = async () => {
    if (!selectedTime) return;

    try {
      console.log("Fetching show details for showId:", selectedTime.showId);
      const { data } = await axios.get(`/shows/detail/${selectedTime.showId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        const showDetail = data.show;
        console.log("Show detail received:", showDetail);

        if (showDetail.room) {
          const roomData =
            typeof showDetail.room === "string"
              ? await fetchRoom(showDetail.room)
              : showDetail.room;

          console.log("Room data:", roomData);
          setRoom(roomData);

          // Tính giá ghế dựa trên showPrice và seatType
          if (roomData && roomData.seatLayout && show) {
            const prices = {};
            const basePrice =
              showDetail.showPrice ||
              show.movie?.showPrice ||
              selectedTime.showPrice ||
              0;

            Object.entries(roomData.seatLayout).forEach(
              ([seatId, seatTypeId]) => {
                const seatType = seatTypes[seatTypeId];
                const multiplier = seatType?.priceMultiplier || 1.0;
                prices[seatId] = basePrice * multiplier;
              }
            );

            console.log("Calculated seat prices:", prices);
            setSeatPrices(prices);
          }
        } else {
          console.error("No room found in show detail");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phòng:", error);
    }
  };

  const fetchRoom = async (roomId) => {
    try {
      const { data } = await axios.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      return data.success ? data.room : null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phòng:", error);
      return null;
    }
  };

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/bookings/get-occupied-seats/${selectedTime.showId}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "ngrok-skip-browser-warning": "1",
          },
        }
      );

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error("Lỗi khi lấy dữ liệu Occupied Seats", data.message);
        console.log("Lỗi khi lấy dữ liệu Occupied Seats", data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu Occupied Seats", error);
      console.log("Lỗi khi lấy dữ liệu Occupied Seats", error);
    }
  };
  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Xin hãy chọn thời gian chiếu trước");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast("Có người đã chiếm chỗ ngồi này");
    }
    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((seat) => seat !== seatId)
        : [...prevSeats, seatId]
    );
  };

  const bookTickets = async () => {
    if (isBooking) return; // Chặn nếu đang xử lý

    try {
      if (!user) {
        return openSignIn();
      }
      if (isAdmin) {
        return toast.error("Quản trị viên không thể đặt vé");
      }
      if (!selectedTime || selectedSeats.length === 0) {
        return toast("Vui lòng chọn thời gian chiếu và ghế ngồi đặt vé");
      }

      setIsBooking(true);
      console.log("---------selected set", selectedSeats);

      const { data } = await axios.post(
        `/bookings/create`,
        {
          showId: selectedTime.showId,
          selectedSeats,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "ngrok-skip-browser-warning": "1",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        console.log("----------data.paymentResult", data.paymentResult);

        navigate("/bookings");
      } else {
        toast.error(data.message);
        setIsBooking(false);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo dữ liệu Booking", error);
      console.log("Lỗi khi tạo dữ liệu Booking", error);
      setIsBooking(false);
    }
  };

  const renderSeats = () => {
    if (!room || !room.seatLayout) {
      return (
        <div className="text-center py-10 text-gray-400">
          Đang tải sơ đồ ghế...
        </div>
      );
    }

    const rows = room.rows || 10;
    const seatsPerRow = room.seatsPerRow || 15;
    const layout = [];

    for (let row = 0; row < rows; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C...
      const rowSeats = [];

      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${rowLetter}${seat}`;
        const seatTypeId = room.seatLayout[seatId];
        const seatType = seatTypes[seatTypeId];
        const isSelected = selectedSeats.includes(seatId);
        const isOccupied = occupiedSeats.includes(seatId);

        rowSeats.push(
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            disabled={isOccupied}
            className={`h-8 w-8 rounded border text-xs font-medium cursor-pointer transition
              ${isOccupied ? "opacity-30 cursor-not-allowed" : ""}
              ${isSelected ? "ring-2 ring-white scale-110" : ""}
            `}
            style={{
              backgroundColor: isSelected
                ? seatType?.color || "#3b82f6"
                : isOccupied
                ? "#4b5563"
                : seatType?.color || "#3b82f6",
              borderColor: seatType?.color || "#3b82f6",
              opacity: isOccupied ? 0.3 : isSelected ? 1 : 0.7,
            }}
            title={`${seatId}${seatType ? ` - ${seatType.name}` : ""}${
              seatPrices[seatId]
                ? ` - ${seatPrices[seatId].toLocaleString()}₫`
                : ""
            }`}
          >
            {seat}
          </button>
        );
      }

      layout.push(
        <div key={rowLetter} className="flex items-center gap-2 mt-2">
          <span className="w-6 text-center font-medium text-gray-400">
            {rowLetter}
          </span>
          <div className="flex gap-2">{rowSeats}</div>
        </div>
      );
    }

    return <div className="space-y-1">{layout}</div>;
  };

  useEffect(() => {
    fetchSeatTypes();
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime && show && Object.keys(seatTypes).length > 0) {
      getOccupiedSeats();
      fetchRoomDetails();
    }
  }, [selectedTime, show, seatTypes]);

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-10 md:pt-20">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Giờ chiếu</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date]
            ?.sort((a, b) => new Date(a.time) - new Date(b.time))
            .map((item) => (
              <div
                key={item.time}
                onClick={() => setSelectedTime(item)}
                className={`flex flex-col gap-1 px-6 py-2 rounded-r-md cursor-pointer transition 
                ${
                  selectedTime?.time === item.time
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <p className="text-sm">{isoTimeFormat(item.time)}</p>
                </div>
                <p className="text-xs font-semibold ml-6">
                  {formatCurrency(item.showPrice)}
                  {currency}
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2xl font-semibold mb-4">Chọn ghế của bạn</h1>
        <svg
          className="w-9/12 h-2/12 "
          viewBox="0 0 200 120"
          preserveAspectRatio="none"
          overflow="visible"
        >
          <polygon
            points="0 0 200 0 197 120 3 120"
            fill="white"
            style={{ filter: "drop-shadow(0 3px 10px rgba(255,255,255,0.7))" }}
          />
        </svg>
        {/* <div className="bg-white w-full h-1/2 shadow-[0_3px_10px_rgba(255,255,255,0.7)] transform rotate-x-[-45deg]"></div> */}
        {/* <div className="screen"></div> */}

        <p className="text-gray-400 text-sm mb-6">MÀN HÌNH</p>

        {/* Chú thích loại ghế */}
        {room && Object.keys(seatTypes).length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium mb-2">Chú thích:</p>
            {Object.values(seatTypes).map((st) => (
              <div key={st._id} className="flex items-center gap-2 text-sm">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: st.color }}
                ></div>
                <span>
                  {st.name} ({st.priceMultiplier}x)
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          {renderSeats()}
        </div>

        {/* Tổng tiền */}
        {selectedSeats.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-sm mb-2">
              Ghế đã chọn: {selectedSeats.join(", ")}
            </p>
            <p className="text-lg font-semibold">
              Tổng tiền:{" "}
              {selectedSeats
                .reduce((total, seatId) => {
                  return total + (seatPrices[seatId] || 0);
                }, 0)
                .toLocaleString()}
              ₫
            </p>
          </div>
        )}

        <button
          onClick={bookTickets}
          disabled={selectedSeats.length === 0 || isBooking}
          className="flex items-center gap-1 mt-6 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking ? "Đang xử lý..." : "Tiến hành đặt vé"}
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
