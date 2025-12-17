import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";

const CreateGenre = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAppContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post("/genres/create", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (data.success) {
        toast.success(data.message);
        navigate(`/admin/genres/${data.genre._id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo thể loại phim", error);
      console.log("Lỗi khi tạo thể loại phim", error);
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tạo thể loại phim mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên thể loại <span className="text-red-500">*</span>
          </label>
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang tải..." : "Tạo thể loại"}
        </button>
      </form>
    </div>
  );
};

export default CreateGenre;
