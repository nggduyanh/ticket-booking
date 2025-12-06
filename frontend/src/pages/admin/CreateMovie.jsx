import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";

const CreateMovie = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    runtime: "",
    genreId: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const { getToken } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // setError("");
    // setSuccess("");

    try {
      if (!imageFile) {
        toast.error("Vui lòng chọn ảnh phim");
        setIsLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("runtime", String(formData.runtime));
      if (formData.genreId) {
        submitData.append("genreId", formData.genreId);
      }
      submitData.append("image", imageFile);

      const { data } = await axios.post("/movies/create", submitData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
          "Content-Type": "multipart/form-data",
        },
      });

      // setSuccess("Movie created successfully!");
      if (data.success) {
        setFormData({
          title: "",
          description: "",
          runtime: "",
          genreId: "",
        });
        setImageFile(null);
        setImagePreview("");
        navigate(`/admin/movies/${data.movie._id}`);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo dữ liệu movie", error);
      console.log("Lỗi khi tạo dữ liệu movie", error);
      // setError(err.response?.data?.message || "Failed to create movie");
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tạo phim mới</h1>

      {/* {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none"
            placeholder="Nhập tiêu đề phim"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ảnh phim</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary-dull cursor-pointer"
            required
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md h-auto rounded-lg border border-gray-700"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none"
            placeholder="Nhập mô tả phim"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Thời lượng (phút)
          </label>
          <input
            type="number"
            name="runtime"
            value={formData.runtime}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none"
            placeholder="Nhập thời lượng tính bằng phút"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Thể loại phim
          </label>
          <select
            name="genreId"
            value={formData.genreId}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none"
          >
            <option value="">-- Chọn thể loại --</option>
            {genres.map((genre) => (
              <option key={genre._id} value={genre._id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang tải..." : "Tạo phim"}
        </button>
      </form>
    </div>
  );
};

export default CreateMovie;
