import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import Loading from "../../components/Loading";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const SeatTypeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seatType, setSeatType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAppContext();

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
        setSeatType(data.seatType);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy thông tin loại ghế");
      console.log("Lỗi khi lấy thông tin loại ghế", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại ghế này không?")) return;

    try {
      const { data } = await axios.delete(`/seat-types/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/admin/seat-types");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa loại ghế");
      console.log("Lỗi khi xóa loại ghế", error);
    }
  };

  if (!seatType) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Không tìm thấy loại ghế</p>
      </div>
    );
  }

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admin/seat-types")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Trở về danh sách
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/seat-types/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 transition rounded"
          >
            <Edit className="w-4 h-4" />
            Sửa
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded"
            style={{ backgroundColor: seatType.color }}
          ></div>
          <div>
            <h1 className="text-2xl font-bold">{seatType.name}</h1>
            <p className="text-gray-400">
              Hệ số giá: {seatType.priceMultiplier}x
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Màu hiển thị</h3>
            <p className="text-gray-300">{seatType.color}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-1">Mô tả</h3>
            <p className="text-gray-300">
              {seatType.description || "Không có mô tả"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatTypeDetail;
