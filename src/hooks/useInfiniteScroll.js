import { useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = (onLoadMore, options = {}) => {
  const { threshold = 500, delay = 200 } = options;
  const scrollTimeoutRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - threshold;

      if (isNearBottom) {
        onLoadMore();
      }
    }, delay);
  }, [onLoadMore, threshold, delay]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);
};

export default useInfiniteScroll;
