import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Background = () => {
  const navigate = useNavigate();
  return (
    <div
      className='flex flex-col items-start justify-center gap-4 px-6 
    md:px-16 lg:px-36 bg-[url("/backgroundImage.jpg")] bg-cover bg-center h-screen'
    >
      <p className="max-w-md text-gray-300">
        Trải nghiệm điện ảnh sống động — đặt vé nhanh, xem liền.
      </p>
      <p className="max-w-md text-gray-300">
        Ghế tốt, giá hợp lý, trải nghiệm tuyệt vời.
      </p>
      <p className="max-w-md text-gray-300">
        Đặt chỗ, chọn ghế, thanh toán trong vài giây.
      </p>
      <button
        className="flex items-center gap-1 px-6 py-3 text-sm bg-primary 
      hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        onClick={() => navigate("/movies")}
      >
        Explore Movies
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Background;
