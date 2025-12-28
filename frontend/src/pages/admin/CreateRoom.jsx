import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Autocomplete from "../../components/Autocomplete";
import { useAppContext } from "../../context/AppContext";

const CreateRoom = () => {
  const navigate = useNavigate();
  const { getToken } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    rows: 5,
    seatsPerRow: 10,
  });
  const [seatTypes, setSeatTypes] = useState([]);
  const [seatLayout, setSeatLayout] = useState({});
  const [selectedSeatType, setSelectedSeatType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSeatTypes();
  }, []);

  const fetchSeatTypes = async () => {
    try {
      const params = { all: "true" }; // Lấy tất cả loại ghế

      const { data } = await axios.get("/seat-types/list", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setSeatTypes(data.seatTypes);
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
      const rowLetter = String.fromCharCode(65 + row); // A, B, C...
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        newLayout[`${rowLetter}${seat}`] = selectedSeatType;
      }
    }
    setSeatLayout(newLayout);
    toast.success("Đã tạo sơ đồ ghế");
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
      const { data } = await axios.post(
        "/rooms/create",
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
        navigate(`/admin/rooms/${data.room._id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo phòng chiếu");
      console.error("Lỗi khi tạo phòng chiếu:", error);
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/rooms")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Trở về
        </button>
        <h1 className="text-2xl font-bold">Tạo phòng chiếu mới</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Form bên trái */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
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
              placeholder="VD: Phòng 1, Cinema Hall A..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Từ 1 đến 20 hàng</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Ghế mỗi hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="seatsPerRow"
                value={formData.seatsPerRow}
                onChange={handleChange}
                required
                min="1"
                max="20"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Từ 1 đến 20 ghế</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Loại ghế mặc định
            </label>
            <select
              value={selectedSeatType || ""}
              onChange={(e) => setSelectedSeatType(e.target.value || null)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
            >
              <option value="">-- Chọn loại ghế --</option>
              {seatTypes.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} ({st.priceMultiplier}x)
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
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-medium"
          >
            Tạo sơ đồ ghế
          </button>

          <div className="border-t border-gray-600 pt-4">
            <p className="text-sm text-gray-400 mb-2">Chú thích:</p>
            <div className="space-y-2">
              {seatTypes.map((st) => (
                <div key={st._id} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: st.color }}
                  ></div>
                  <span className="text-sm">
                    {st.name} ({st.priceMultiplier}x)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-600">
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(seatLayout).length === 0}
              className="flex-1 px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo phòng"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/rooms")}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-lg font-medium"
            >
              Hủy
            </button>
          </div>
        </div>

        {/* Sơ đồ ghế bên phải */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Sơ đồ ghế</h2>
          <p className="text-sm text-gray-400 mb-4">
            Click vào ghế để thay đổi loại ghế
          </p>
          {Object.keys(seatLayout).length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p>Chưa có sơ đồ ghế</p>
              <p className="text-sm mt-2">
                Nhập thông tin và nhấn "Tạo sơ đồ ghế"
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-auto max-h-[600px]">
              {renderSeatLayout()}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
