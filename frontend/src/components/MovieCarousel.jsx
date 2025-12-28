import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MovieCard from "./MovieCard";

const MovieCarousel = ({
  movies,
  title,
  autoPlay = true,
  autoPlayInterval = 3000,
}) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScroll);
      return () => carousel.removeEventListener("scroll", checkScroll);
    }
  }, [movies]);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoPlay || isPaused || !movies || movies.length === 0) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const scrollAmount = 304; // 280px card + 24px gap

        // If already at or very close to the end (within 10px), or next scroll would exceed max
        if (
          scrollLeft >= maxScroll - 10 ||
          scrollLeft + scrollAmount > maxScroll - 10
        ) {
          carouselRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          // Scroll by one movie card width
          carouselRef.current.scrollTo({
            left: scrollLeft + scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, movies]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 304; // Scroll 1 movie at a time (280px + 24px gap)
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;

      if (direction === "left") {
        // Scroll left - if at the start, go to end
        if (scrollLeft <= 10) {
          carouselRef.current.scrollTo({
            left: maxScroll,
            behavior: "smooth",
          });
        } else {
          carouselRef.current.scrollTo({
            left: scrollLeft - scrollAmount,
            behavior: "smooth",
          });
        }
      } else {
        // Scroll right - if at or near the end, or next scroll would exceed, go back to start
        if (
          scrollLeft >= maxScroll - 10 ||
          scrollLeft + scrollAmount > maxScroll - 10
        ) {
          carouselRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          carouselRef.current.scrollTo({
            left: scrollLeft + scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-10">
        <p className="text-gray-300 font-medium text-lg mb-6">{title}</p>
        <p className="text-gray-400 text-center py-10">Không có phim</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-10 relative">
      <p className="text-gray-300 font-medium text-lg mb-6">{title}</p>

      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 
            text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300
            shadow-lg backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingRight: "max(24px, calc((100vw - 1280px) / 2 + 176px))",
          }}
        >
          {movies.map((movie) => (
            <div key={movie._id} className="flex-shrink-0 w-[280px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 
            text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300
            shadow-lg backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCarousel;
