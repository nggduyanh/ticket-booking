import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import Loading from "../../components/Loading";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const GenreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [genre, setGenre] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAppContext();

  useEffect(() => {
    fetchGenre();
  }, [id]);

  const fetchGenre = async () => {
    try {
      const { data } = await axios.get(`/genres/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setGenre(data.genre);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu thể loại phim", error);
      console.log("Lỗi khi lấy dữ liệu thể loại phim", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa thể loại phim này không?")) return;

    try {
      const { data } = await axios.delete(`/genres/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/admin/genres");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa thể loại phim", error);
      console.log("Lỗi khi xóa thể loại phim", error);
    }
  };

  if (!genre && !isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Không tìm thấy thể loại phim</p>
      </div>
    );
  }

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admin/genres")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Trở về danh sách
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/genres/${id}/edit`)}
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
        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Tên thể loại</h3>
            <p className="text-xl font-semibold">{genre.name || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-1">Mô tả</h3>
            <p className="text-gray-300">
              {genre.description || "Chưa có mô tả"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreDetail;
