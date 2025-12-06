import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const EditGenre = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        const genre = data.genre;
        setFormData({
          name: genre.name || "",
          description: genre.description || "",
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await axios.put(`/genres/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate(`/admin/genres/${id}`);
        }, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật thể loại phim", error);
      console.log("Lỗi khi cập nhật thể loại phim", error);
    } finally {
      setSubmitting(false);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sửa thể loại phim</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tên thể loại</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none"
            placeholder="Nhập tên thể loại phim"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:border-primary focus:outline-none"
            placeholder="Nhập mô tả thể loại phim"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/genres")}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 transition rounded-md font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang cập nhật..." : "Cập nhật thể loại"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGenre;
