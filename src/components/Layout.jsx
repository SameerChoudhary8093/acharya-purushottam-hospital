import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { scrollToHash } from "../utils/scroll";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      scrollToHash(location.hash, { delay: 160 });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return (
    <div id="top">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
