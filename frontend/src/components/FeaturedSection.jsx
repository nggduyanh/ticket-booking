import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCarousel from "./MovieCarousel";
import { useAppContext } from "../context/AppContext";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { shows } = useAppContext();

  console.log("FeaturedSection shows:", shows);

  return (
    <div className="overflow-hidden">
      <div className="relative">
        <BlurCircle top="0" right="-80px" />
        <MovieCarousel movies={shows} title="Đang chiếu" />
      </div>

      <div className="flex justify-center mt-10 mb-20">
        <button
          type="button"
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Xem thêm
        </button>
      </div>
    </div>
  );
};

export default FeaturedSection;
