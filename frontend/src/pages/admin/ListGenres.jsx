import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Plus, Search } from "lucide-react";
import Loading from "../../components/Loading";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListGenres = () => {
  const [genres, setGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken } = useAppContext();

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get("/genres/list", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setGenres(data.genres);
        setFilteredGenres(data.genres);
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

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    const filtered = genres.filter((genre) =>
      genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGenres(filtered);
  }, [searchTerm, genres]);

  const handleDelete = async (id) => {
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
        setGenres(genres.filter((genre) => genre._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa thể loại phim", error);
      console.log("Lỗi khi xóa thể loại phim", error);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thể loại phim</h1>
        <button
          onClick={() => navigate("/admin/genres/create")}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tạo thể loại mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên thể loại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
        />
      </div>

      {filteredGenres.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>
            {searchTerm
              ? "Không tìm thấy thể loại phù hợp"
              : "Không tìm thấy thể loại phim nào"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGenres.map((genre) => (
            <div
              key={genre._id}
              className="flex gap-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{genre.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {genre.description || "Chưa có mô tả"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/admin/genres/${genre._id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </button>
                <button
                  onClick={() => navigate(`/admin/genres/${genre._id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 transition rounded text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(genre._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListGenres;
