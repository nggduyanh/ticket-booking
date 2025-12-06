import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import Loading from "../../components/Loading";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAppContext();
  const [room, setRoom] = useState(null);
  const [seatTypes, setSeatTypes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoomDetail();
    fetchSeatTypes();
  }, [id]);

  const fetchRoomDetail = async () => {
    try {
      const { data } = await axios.get(`/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setRoom(data.room);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy thông tin phòng chiếu");
      console.log("Lỗi khi lấy thông tin phòng chiếu", error);
    } finally {
      setIsLoading(false);
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
      console.log("Lỗi khi lấy danh sách loại ghế", error);
    }
  };

  const renderSeatLayout = () => {
    if (!room || !room.seatLayout) return null;

    const rows = [];
    for (let i = 0; i < room.rows; i++) {
      const rowLabel = String.fromCharCode(65 + i);
      const seats = [];

      for (let j = 1; j <= room.seatsPerRow; j++) {
        const seatId = `${rowLabel}${j}`;
        const seatTypeId = room.seatLayout[seatId];
        const seatType = seatTypes[seatTypeId];
        const bgColor = seatType?.color || "#3b82f6";

        seats.push(
          <div
            key={seatId}
            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-medium shadow-sm"
            style={{ backgroundColor: bgColor }}
            title={`${seatId} - ${seatType?.name || "N/A"}`}
          >
            {seatId}
          </div>
        );
      }

      rows.push(
        <div key={rowLabel} className="flex gap-2 items-center">
          <span className="w-6 text-center font-medium text-gray-400">
            {rowLabel}
          </span>
          {seats}
        </div>
      );
    }

    return <div className="flex flex-col gap-2">{rows}</div>;
  };

  return isLoading ? (
    <Loading />
  ) : room ? (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/rooms")}
          className="p-2 hover:bg-gray-700 rounded-md transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Chi tiết phòng chiếu</h1>
        <button
          onClick={() => navigate(`/admin/rooms/${id}/edit`)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          <Edit className="w-4 h-4" />
          Chỉnh sửa
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Tên phòng
            </label>
            <p className="text-lg font-medium">{room.name}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Tổng số ghế
            </label>
            <p className="text-lg font-medium">{room.totalSeats}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Số hàng</label>
            <p className="text-lg font-medium">{room.rows}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Số ghế mỗi hàng
            </label>
            <p className="text-lg font-medium">{room.seatsPerRow}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-3">Sơ đồ ghế</label>
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <div className="mb-4 text-center">
              <div className="inline-block px-20 py-2 bg-gray-700 rounded-md text-sm font-medium">
                MÀN HÌNH
              </div>
            </div>
            {renderSeatLayout()}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-3">
            Chú thích loại ghế
          </label>
          <div className="flex flex-wrap gap-3">
            {Object.values(seatTypes).map((st) => (
              <div
                key={st._id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-md"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: st.color }}
                ></div>
                <span className="text-sm">
                  {st.name} (×{st.priceMultiplier})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="p-6 text-center">
      <p className="text-gray-400">Không tìm thấy phòng chiếu</p>
    </div>
  );
};

export default RoomDetail;
