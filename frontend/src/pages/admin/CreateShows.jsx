import { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const CreateShows = () => {
  const { axios, getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENTCY || "đ";
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [creatingShow, setCreatingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/movies/list", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/rooms/list", {
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

  useEffect(() => {
    fetchNowPlayingMovies();
    fetchRooms();
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = (prev[date] || []).filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setCreatingShow(true);
      if (
        !selectedMovie ||
        !selectedRoom ||
        !showPrice ||
        Object.keys(dateTimeSelection).length === 0
      ) {
        setCreatingShow(false);
        return toast("Thiếu trường thông tin");
      }

      const showInputs = Object.entries(dateTimeSelection).map(
        ([date, time]) => ({
          date,
          time,
        })
      );
      const payload = {
        movieId: selectedMovie,
        roomId: selectedRoom,
        showInputs,
        showPrice: Number(showPrice),
      };
      const { data } = await axios.post("/shows/create", payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
        setDateTimeInput("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setCreatingShow(false);
      console.log("Tạo giờ chiếu thất bại", error);
      toast.error("Tạo giờ chiếu thất bại");
    }
    setCreatingShow(false);
  };

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium">Phim đang chiếu</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie._id}
              className={`relative w-40 cursor-pointer 
          group-hover:not-hover:opacity-40 hover:-translate-y-1 
          transition duration-300`}
              onClick={() => setSelectedMovie(movie._id)}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-40 h-60 object-cover brightness-90"
                />
                {/* <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>

                  <p className="text-gray-300">{movie.vote_count} Votes</p>
                </div> */}
              </div>
              {selectedMovie === movie._id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}
              <p className="font-medium truncate mt-2">{movie.title}</p>
              {/* <p className="text-gray-400 text-sm">{movie.release_date}</p> */}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">
          Chọn phòng chiếu <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedRoom || ""}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">-- Chọn phòng chiếu --</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.name} ({room.totalSeats} ghế)
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Giá vé</label>

        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>

          <input
            min={0}
            step={1}
            type="number"
            value={showPrice}
            onChange={(e) => {
              const value = e.target.value;
              // Chỉ cho phép số nguyên dương (không có dấu chấm)
              if (value === "" || /^\d+$/.test(value)) {
                setShowPrice(value);
              }
            }}
            onKeyDown={(e) => {
              // Chặn các phím . , e E + - và phím lên/xuống
              if (
                [".", ",", "e", "E", "+", "-", "ArrowUp", "ArrowDown"].includes(
                  e.key
                )
              ) {
                e.preventDefault();
              }
            }}
            onWheel={(e) => {
              // Ngăn thay đổi giá trị khi scroll chuột
              e.target.blur();
              e.preventDefault();
            }}
            onFocus={(e) => {
              // Ngăn thay đổi giá trị khi scroll chuột
              e.target.addEventListener(
                "wheel",
                (event) => event.preventDefault(),
                { passive: false }
              );
            }}
            placeholder="Nhập giá vé (số nguyên)"
            className="outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Chọn ngày và giờ
        </label>

        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md"
          />

          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Thêm giờ
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2">Ngày-Giờ đã chọn</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium mb-2">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={creatingShow}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 
      transition-all cursor-pointer"
      >
        Tạo suất chiếu
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default CreateShows;
