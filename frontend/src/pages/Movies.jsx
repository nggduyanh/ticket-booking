import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";

const Movies = () => {
  const { getToken } = useAppContext();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGenres();
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [searchTerm, selectedGenre]);

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
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách thể loại", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedGenre) params.genreId = selectedGenre;

      const { data } = await axios.get("/shows/list", {
        params,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        setMovies(data.shows);
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách phim", error);
    } finally {
      setIsLoading(false);
    }
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
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-primary focus:outline-none"
        >
          <option value="">Tất cả thể loại</option>
          {genres.map((genre) => (
            <option key={genre._id} value={genre._id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Đang tải...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {movies?.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
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
