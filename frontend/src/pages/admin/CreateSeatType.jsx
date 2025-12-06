import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const CreateSeatType = () => {
  const navigate = useNavigate();
  const { getToken } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    priceMultiplier: "1.0",
    description: "",
    color: "#3b82f6",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post("/seat-types/create", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        toast.success(data.message);
        navigate(`/admin/seat-types/${data.seatType._id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo loại ghế");
      console.error("Lỗi khi tạo loại ghế:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/admin/seat-types")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Trở về danh sách
      </button>

      <h1 className="text-2xl font-bold mb-6">Tạo loại ghế mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên loại ghế <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="VD: VIP, Standard, Couple"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Hệ số giá <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="priceMultiplier"
            value={formData.priceMultiplier}
            onChange={handleChange}
            required
            step="0.1"
            min="0.1"
            placeholder="1.0 = giá gốc, 1.5 = +50%, 2.0 = +100%"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-400 mt-1">
            1.0 = giá gốc, 1.5 = +50%, 2.0 = +100%
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Màu hiển thị</label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-20 h-10 rounded cursor-pointer"
            />
            <span className="text-gray-400">{formData.color}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Mô tả loại ghế..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? "Đang tạo..." : "Tạo loại ghế"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/seat-types")}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-lg font-medium"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSeatType;
