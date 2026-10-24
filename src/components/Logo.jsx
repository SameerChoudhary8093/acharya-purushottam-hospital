import { Link, useLocation, useNavigate } from "react-router-dom";
import siteContent from "../config/siteContent";
import { prefersReducedMotion } from "../utils/scroll";

export default function Logo({ variant = "light", compact = false, showName = true }) {
  const { hospital } = siteContent;
  const location = useLocation();
  const navigate = useNavigate();
  const nameClass = variant === "dark" ? "text-white" : "text-navy";
  const subClass = variant === "dark" ? "text-white/80" : "text-accent";

  function goToHero(event) {
    event.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      return;
    }
    if (location.hash) {
      navigate("/");
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  const image = (
    <img
      src={siteContent.images.logo}
      alt=""
      className={`shrink-0 object-cover object-center ${
        compact
          ? "h-[2.1rem] w-[11rem] max-w-[54vw] sm:h-9 sm:w-[12.5rem] lg:h-[3rem] lg:w-[17rem]"
          : "h-[3.5rem] w-[18.5rem] sm:h-16 sm:w-[21rem]"
      }`}
    />
  );

  return (
    <Link
      to="/"
      onClick={goToHero}
      className="flex min-w-0 max-w-full items-center gap-2.5 no-underline sm:gap-3"
      aria-label="Acharya Purushottam Hospital & Medical College — back to home"
    >
      {variant === "dark" ? (
        <span className="inline-flex shrink-0 rounded-md bg-white px-1 py-1">{image}</span>
      ) : (
        image
      )}
      {showName ? (
        <span className={`hidden min-w-0 leading-tight min-[400px]:block ${nameClass}`}>
          <span className="block truncate text-[10px] font-extrabold tracking-[0.04em] sm:text-[12px] lg:text-[13px]">
            {hospital.line1}
          </span>
          <span className={`mt-0.5 hidden truncate text-[8px] font-semibold tracking-[0.06em] min-[400px]:block sm:text-[10px] ${subClass}`}>
            {hospital.line2}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
