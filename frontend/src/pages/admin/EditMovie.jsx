import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import Autocomplete from "../../components/Autocomplete";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    runtime: "",
    genreId: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [genres, setGenres] = useState([]);
  const { getToken } = useAppContext();
  //   const [error, setError] = useState("");
  //   const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMovie();
    fetchGenres();
  }, [id]);

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

  const fetchMovie = async () => {
    try {
      const { data } = await axios.get(`/movies/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        const movie = data.movie;
        setFormData({
          title: movie.title || "",
          description: movie.description || "",
          runtime: movie.runtime || "",
          genreId: movie.genreId?._id || movie.genreId || "",
        });
        if (movie.image) {
          setImagePreview(movie.image);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu detail movie", error);
      console.log("Lỗi khi lấy dữ liệu detail movie", error);
      //   setError(err.response?.data?.message || "Failed to fetch movie");
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
    setSubmitting(true);
    // setError("");
    // setSuccess("");

    try {
      if (!formData.genreId) {
        toast.error("Vui lòng chọn thể loại phim");
        setSubmitting(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("runtime", String(formData.runtime));
      if (formData.genreId) {
        submitData.append("genreId", formData.genreId);
      }

      // Chỉ gửi file ảnh nếu user chọn file mới
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const { data } = await axios.put(`/movies/${id}`, submitData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate(`/admin/movies/${id}`);
        }, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật dữ liệu movie", error);
      console.log("Lỗi khi cập nhật dữ liệu movie", error);
      //   setError(err.response?.data?.message || "Failed to update movie");
    } finally {
      setSubmitting(false);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sửa thông tin phim</h1>

      {/* {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )} */}

      {/* {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
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
          <p className="text-sm text-gray-400 mt-2">
            Chọn ảnh mới để thay đổi (để trống nếu giữ nguyên ảnh cũ)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Mô tả <span className="text-red-500">*</span>
          </label>
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
            Thời lượng (phút) <span className="text-red-500">*</span>
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
            Thể loại phim <span className="text-red-500">*</span>
          </label>
          <Autocomplete
            options={genres}
            value={formData.genreId}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, genreId: value }))
            }
            onSearch={fetchGenres}
            placeholder="Chọn thể loại..."
            displayKey="name"
            valueKey="_id"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/movies")}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 transition rounded-md font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang cập nhật..." : "Cập nhật phim"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMovie;
