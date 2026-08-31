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
      className={`w-auto shrink-0 object-contain ${
        compact
          ? "h-10 max-h-10 max-w-[2.75rem] sm:h-11 sm:max-h-11 sm:max-w-12 lg:h-12 lg:max-h-12 lg:max-w-[3.25rem]"
          : "h-[4.75rem] max-h-[4.75rem] max-w-[5rem] sm:h-20 sm:max-h-20 sm:max-w-[6rem]"
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
