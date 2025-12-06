import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import Loading from "../../components/Loading";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AdminMovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAppContext();
  // const [error, setError] = useState("");

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const { data } = await axios.get(`/movies/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setMovie(data.movie);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu detail movie", error);
      console.log("Lỗi khi lấy dữ liệu detail movie", error);
      // setError(err.response?.data?.message || "Failed to fetch movie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa phim này không?")) return;

    try {
      const { data } = await axios.delete(`/movies/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/admin/movies");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa dữ liệu movie", error);
      console.log("Lỗi khi xóa dữ liệu movie", error);
      // toast.error(error.response?.data?.message || "Failed to delete movie");
    }
  };

  // if (error) {
  //   return (
  //     <div className="p-6">
  //       <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded">
  //         {error}
  //       </div>
  //     </div>
  //   );
  // }

  if (!movie) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Không tìm thấy phim</p>
      </div>
    );
  }

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admin/movies")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Trở về danh sách
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/movies/${id}/edit`)}
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
        {movie.image && (
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full max-w-md mx-auto rounded-lg mb-6"
          />
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Tiêu đề</h3>
            <p className="text-xl font-semibold">{movie.title || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-1">Thể loại</h3>
            <p className="text-gray-300">
              {movie.genreId?.name || "Chưa phân loại"}
            </p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-1">Mô tả</h3>
            <p className="text-gray-300">{movie.description || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-1">Thời lượng</h3>
            <p className="text-gray-300">
              {movie.runtime ? `${movie.runtime} phút` : "N/A"}
            </p>
          </div>

          {/* <div>
            <h3 className="text-sm text-gray-400 mb-1">Movie ID</h3>
            <p className="text-gray-500 text-sm font-mono">{movie._id}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminMovieDetail;
