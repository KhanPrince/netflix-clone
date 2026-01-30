import { useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = (onLoadMore, options = {}) => {
  const { threshold = 500, delay = 200 } = options;
  const scrollTimeoutRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      // cross-browser compatible scroll position and document height
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop;
      const documentHeight =
        document.body.offsetHeight || document.documentElement.scrollHeight;

      const isNearBottom =
        window.innerHeight + scrollPosition >= documentHeight - threshold;

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
