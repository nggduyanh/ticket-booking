import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Plus, Search } from "lucide-react";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import timeFormat from "../../common/timeFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListMovies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();
  const { getToken } = useAppContext();

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [currentPage, limit, searchTerm, selectedGenre]);

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get("/genres/list", {
        params: { all: true },
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setGenres(data.genres);
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách thể loại", error);
    }
  };

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit };
      if (searchTerm) params.search = searchTerm;
      if (selectedGenre) params.genreId = selectedGenre;

      const { data } = await axios.get("/movies/list", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setMovies(data.movies);
        setPagination(data.pagination);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu list movies", error);
      console.log("Lỗi khi lấy dữ liệu list movies", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
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
        setMovies(movies.filter((movie) => movie._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa dữ liệu movie", error);
      console.log("Lỗi khi xóa dữ liệu movie", error);
      //   toast.error(error.response?.data?.message || "Failed to delete movie");
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>
        <button
          onClick={() => navigate("/admin/movies/create")}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tạo phim mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        {/* Genre Filter */}
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        >
          <option value="">Tất cả thể loại</option>
          {genres.map((genre) => (
            <option key={genre._id} value={genre._id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )} */}

      {movies.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>
            {searchTerm || selectedGenre
              ? "Không tìm thấy phim nào"
              : "Chưa có phim nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="flex gap-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition"
              >
                {movie.image && (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-24 h-36 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  {movie.genreId && (
                    <p className="text-sm text-primary mb-1">
                      Thể loại: {movie.genreId.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {movie.description}
                  </p>
                  {movie.runtime && (
                    <p className="text-sm text-gray-500">
                      Thời lượng: {timeFormat(movie.runtime)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/admin/movies/${movie._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                  <button
                    onClick={() => navigate(`/admin/movies/${movie._id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 transition rounded text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ListMovies;
