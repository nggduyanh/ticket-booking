import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import BlurCircle from "./BlurCircle";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DateSelect = ({ dateTime, id, selectedRoom }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const onBookHandler = () => {
    if (selectedDate) {
      const url = selectedRoom
        ? `/movies/${id}/${selectedDate}?roomId=${selectedRoom}`
        : `/movies/${id}/${selectedDate}`;
      navigate(url);
      scrollTo(0, 0);
    } else {
      return toast("Vui lòng chọn ngày để tiếp tục đặt vé.");
    }
  };
  return (
    <div id="dateSelect" className="pt-30">
      <div
        className="flex flex-col md:flex-row items-center justify-between 
      gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg"
      >
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div>
          <p className="text-lg font-semibold">Chọn ngày</p>
          <div className="flex items-center gap-6 text-sm mt-5">
            <ChevronLeft width={28} />
            <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {Object.keys(dateTime).map((date) => (
                <button
                  onClick={() => setSelectedDate(date)}
                  key={date}
                  className={`flex flex-col items-center justify-center h-14 w-14 
                  aspect-square rounded cursor-pointer ${
                    selectedDate === date
                      ? "bg-primary text-white"
                      : "border border-primary/70"
                  }`}
                >
                  <span>{new Date(date).getDate()}</span>
                  <span>
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                </button>
              ))}
            </span>
            <ChevronRight width={28} />
          </div>
        </div>
        <button
          onClick={onBookHandler}
          className="bg-primary text-white px-8 py-2 mt-6 rounded-full hover:bg-primary/90 
        transition-all cursor-pointer"
        >
          Đặt vé ngay
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
