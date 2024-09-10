import { useMediaQuery } from "react-responsive";

const useSize = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 580px)" });
  const isTablet = useMediaQuery({
    query: "(min-width: 768px) and (max-width: 1023px)",
  });
  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

  return { isMobile, isTablet, isDesktop };
};

export default useSize;
