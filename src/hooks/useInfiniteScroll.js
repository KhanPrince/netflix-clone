import { useEffect, useRef, useCallback, use } from "react";

const useInfiniteScroll = (onLoadMore, options = {}) => {
  const { threshold = 500, delay = 200 } = options;
  const scrollTimeoutRef = useRef(null);

  const hancleScroll = useCallback(() => {
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
    window.addEventListener("scroll", hancleScroll);

    return () => {
      window.removeEventListener("scroll", hancleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [hancleScroll]);
};

export default useInfiniteScroll;
