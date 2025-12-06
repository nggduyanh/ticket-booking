import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import { StarIcon } from "lucide-react";
import timeFormat from "../common/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const MovieDetail = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomStats, setRoomStats] = useState({}); // Thống kê ghế cho từng phòng
  const [selectedRoom, setSelectedRoom] = useState("");
  const [filteredDateTime, setFilteredDateTime] = useState(null);
  const { user, axios, getToken, shows } = useAppContext();

  const getShow = async (roomId = null) => {
    try {
      const url = roomId ? `/shows/${id}?roomId=${roomId}` : `/shows/${id}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setShow(data.show);
        setFilteredDateTime(data.show.dateTime);

        // Lấy danh sách phòng unique từ shows - luôn luôn lấy
        const uniqueRooms = new Map();
        const stats = {};

        Object.values(data.show.dateTime).forEach((showTimes) => {
          showTimes.forEach((showTime) => {
            if (showTime.room && !uniqueRooms.has(showTime.room._id)) {
              uniqueRooms.set(showTime.room._id, showTime.room);
              // Khởi tạo stats cho phòng
              stats[showTime.room._id] = {
                totalSeats: showTime.room.totalSeats,
                occupiedCount: 0,
              };
            }
            // Cộng dồn số ghế đã chiếm
            if (showTime.room && showTime.occupiedCount) {
              stats[showTime.room._id].occupiedCount += showTime.occupiedCount;
            }
          });
        });

        const roomsList = Array.from(uniqueRooms.values());

        // Chỉ set rooms khi load lần đầu (không có roomId filter)
        if (!roomId) {
          setRooms(roomsList);
          setRoomStats(stats);
          console.log("Rooms loaded:", roomsList);
          console.log("Room stats:", stats);
        }
      } else {
        toast.error("Lỗi khi lấy dữ liệu movie detail", data.message);
        console.log("Lỗi khi lấy dữ liệu movie detail", data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu movie detail", error);
      console.log("Lỗi khi lấy dữ liệu movie detail", error);
    }
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    if (roomId) {
      getShow(roomId);
    } else {
      getShow();
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);
  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.movie.image}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          {/* <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div> */}

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p className="text-gray-400 mt-2 text-sm">
            {timeFormat(show.movie.runtime)} •{" "}
            {/* {show.movie.genres.map((genre) => genre.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]} */}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <a
              href="#roomSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull 
              transition rounded-full font-medium cursor-pointer active:scale-95"
            >
              Mua vé
            </a>
          </div>
        </div>
      </div>

      {/* Room Selection */}
      <div id="roomSelect" className="mt-10 pt-10 max-w-6xl mx-auto">
        {rooms.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Chọn phòng chiếu</h2>
            <p className="text-gray-400 text-sm mb-4">
              Vui lòng chọn phòng chiếu để xem lịch chiếu
            </p>
            <select
              value={selectedRoom}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full md:w-96 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md 
              focus:ring-2 focus:ring-primary focus:border-transparent text-white"
            >
              <option value="">-- Chọn phòng chiếu --</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">Chưa có lịch chiếu cho phim này</p>
          </div>
        )}
      </div>

      {/* Date Selection - Only show when room is selected */}
      {selectedRoom &&
        filteredDateTime &&
        Object.keys(filteredDateTime).length > 0 && (
          <DateSelect
            id={id}
            dateTime={filteredDateTime}
            selectedRoom={selectedRoom}
          />
        )}

      <p className="text-lg font-medium mt-20 mb-8">Có thể bạn cũng thích</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate(`/movies`);
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Xem thêm
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetail;
