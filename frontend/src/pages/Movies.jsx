import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import Autocomplete from "../components/Autocomplete";
import { useAppContext } from "../context/AppContext";

const Movies = () => {
  const { getToken } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    genreId: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [appliedFilters, currentPage, limit]);

  const fetchGenres = async (searchKeyword = "") => {
    try {
      const params = { page: 1, limit: 10 };
      if (searchKeyword) params.search = searchKeyword;

      const { data } = await axios.get("/genres/list", {
        params,
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
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.genreId) params.genreId = appliedFilters.genreId;

      const { data } = await axios.get("/shows/list", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setMovies(data.shows);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách phim", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    setAppliedFilters({
      search: searchTerm,
      genreId: selectedGenre,
    });
    setCurrentPage(1);
  };

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <h1 className="text-lg font-medium my-4">Đang chiếu</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-primary focus:outline-none"
          />
        </div>
        <Autocomplete
          options={genres}
          value={selectedGenre}
          onChange={setSelectedGenre}
          onSearch={fetchGenres}
          placeholder="Chọn thể loại..."
          displayKey="name"
          valueKey="_id"
          className="min-w-[200px]"
        />
        <button
          onClick={handleFilter}
          className="px-6 py-2 bg-primary hover:bg-primary/90 transition rounded-lg font-medium"
        >
          Lọc
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Đang tải...</p>
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {movies?.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold text-center">
            Không tìm thấy phim nào
          </h1>
        </div>
      )}
    </div>
  );
};

export default Movies;
