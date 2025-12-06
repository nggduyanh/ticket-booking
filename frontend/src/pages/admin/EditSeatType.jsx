import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const EditSeatType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    priceMultiplier: 1.0,
    description: "",
    color: "#3b82f6",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSeatType();
  }, [id]);

  const fetchSeatType = async () => {
    try {
      const { data } = await axios.get(`/seat-types/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        const st = data.seatType;
        setFormData({
          name: st.name,
          priceMultiplier: st.priceMultiplier,
          description: st.description || "",
          color: st.color || "#3b82f6",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy thông tin loại ghế");
      console.error("Lỗi khi lấy thông tin loại ghế:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await axios.put(`/seat-types/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        toast.success(data.message);
        navigate(`/admin/seat-types/${id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật loại ghế");
      console.error("Lỗi khi cập nhật loại ghế:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/admin/seat-types/${id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Trở về
        </button>
        <h1 className="text-2xl font-bold">Chỉnh sửa loại ghế</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4"
      >
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
            placeholder="VD: VIP, Standard, Couple..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-sm text-gray-400 mt-1">
            Giá vé = Giá suất chiếu × Hệ số giá
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Màu hiển thị</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-20 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="#3b82f6"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Mô tả về loại ghế này..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/seat-types/${id}`)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-lg font-medium"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSeatType;
