import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    rows: 5,
    seatsPerRow: 10,
  });
  const [seatTypes, setSeatTypes] = useState([]);
  const [seatLayout, setSeatLayout] = useState({});
  const [selectedSeatType, setSelectedSeatType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSeatTypes();
    fetchRoomDetail();
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
        setFormData({
          name: data.room.name,
          rows: data.room.rows,
          seatsPerRow: data.room.seatsPerRow,
        });
        setSeatLayout(data.room.seatLayout || {});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy thông tin phòng chiếu");
      console.error("Lỗi khi lấy thông tin phòng chiếu:", error);
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
        setSeatTypes(data.seatTypes);
        if (data.seatTypes.length > 0) {
          setSelectedSeatType(data.seatTypes[0]._id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại ghế:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rows" || name === "seatsPerRow") {
      // Cho phép xóa hết để nhập số mới
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }));
        return;
      }

      const numValue = Number(value);
      // Chỉ chặn nếu giá trị nằm ngoài khoảng 1-20
      if (numValue < 1 || numValue > 20) {
        toast.error(
          `${name === "rows" ? "Số hàng" : "Số ghế mỗi hàng"} phải từ 1 đến 20`
        );
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : value === "" ? "" : Number(value),
    }));
  };

  const generateLayout = () => {
    const newLayout = {};
    const rows = Number(formData.rows);
    const seatsPerRow = Number(formData.seatsPerRow);

    for (let row = 0; row < rows; row++) {
      const rowLetter = String.fromCharCode(65 + row);
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${rowLetter}${seat}`;
        newLayout[seatId] = selectedSeatType;
      }
    }
    setSeatLayout(newLayout);
    toast.success("Đã tạo lại sơ đồ ghế");
  };

  const handleSeatClick = (seatId) => {
    if (selectedSeatType) {
      setSeatLayout((prev) => ({
        ...prev,
        [seatId]: selectedSeatType,
      }));
    }
  };

  const applyToRow = (rowLetter) => {
    if (!selectedSeatType) return;

    const newLayout = { ...seatLayout };
    const seatsPerRow = Number(formData.seatsPerRow);

    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatId = `${rowLetter}${seat}`;
      newLayout[seatId] = selectedSeatType;
    }

    setSeatLayout(newLayout);
    toast.success(`Đã áp dụng cho hàng ${rowLetter}`);
  };

  const getSeatTypeColor = (seatTypeId) => {
    const seatType = seatTypes.find((st) => st._id === seatTypeId);
    return seatType?.color || "#3b82f6";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(seatLayout).length === 0) {
      toast.error("Vui lòng tạo sơ đồ ghế");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await axios.put(
        `/rooms/${id}`,
        {
          ...formData,
          seatLayout,
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
        navigate(`/admin/rooms/${id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật phòng chiếu");
      console.error("Lỗi khi cập nhật phòng chiếu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSeatLayout = () => {
    const rows = Number(formData.rows);
    const seatsPerRow = Number(formData.seatsPerRow);
    const layout = [];

    for (let row = 0; row < rows; row++) {
      const rowLetter = String.fromCharCode(65 + row);
      const rowSeats = [];

      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${rowLetter}${seat}`;
        const seatTypeId = seatLayout[seatId];

        rowSeats.push(
          <button
            key={seatId}
            type="button"
            onClick={() => handleSeatClick(seatId)}
            className="w-8 h-8 rounded text-xs font-medium hover:opacity-80 transition"
            style={{
              backgroundColor: seatTypeId
                ? getSeatTypeColor(seatTypeId)
                : "#4b5563",
            }}
            title={seatId}
          >
            {seat}
          </button>
        );
      }

      layout.push(
        <div key={rowLetter} className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => applyToRow(rowLetter)}
            className="w-8 h-8 text-center font-medium text-gray-400 hover:bg-primary/20 hover:text-primary rounded transition text-xs"
            title={`Áp dụng loại ghế đang chọn cho cả hàng ${rowLetter}`}
          >
            {rowLetter}
          </button>
          {rowSeats}
        </div>
      );
    }

    return layout;
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/rooms")}
          className="p-2 hover:bg-gray-700 rounded-md transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Chỉnh sửa phòng chiếu</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Left Panel - Form */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="VD: Phòng A1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Số hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rows"
              value={formData.rows}
              onChange={handleChange}
              required
              min="1"
              max="20"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Từ 1 đến 20 hàng</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Số ghế mỗi hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="seatsPerRow"
              value={formData.seatsPerRow}
              onChange={handleChange}
              required
              min="1"
              max="20"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Từ 1 đến 20 ghế</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Loại ghế đang chọn
            </label>
            <select
              value={selectedSeatType}
              onChange={(e) => setSelectedSeatType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {seatTypes.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} (×{st.priceMultiplier})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              💡 Click vào ghế để đổi loại, hoặc click vào chữ cái hàng (A, B,
              C...) để áp dụng cho cả hàng
            </p>
          </div>

          <button
            type="button"
            onClick={generateLayout}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
          >
            Tạo lại sơ đồ
          </button>

          <div className="border-t border-gray-700 pt-4">
            <label className="block text-sm font-medium mb-2">
              Chú thích loại ghế
            </label>
            <div className="flex flex-wrap gap-2">
              {seatTypes.map((st) => (
                <div
                  key={st._id}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-md text-sm"
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: st.color }}
                  ></div>
                  <span>{st.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium transition"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật phòng"}
          </button>
        </div>

        {/* Right Panel - Seat Layout */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Sơ đồ ghế</h2>
          <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-[600px]">
            <div className="mb-4 text-center">
              <div className="inline-block px-16 py-2 bg-gray-700 rounded-md text-sm font-medium">
                MÀN HÌNH
              </div>
            </div>
            <div className="flex flex-col gap-2">{renderSeatLayout()}</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRoom;
