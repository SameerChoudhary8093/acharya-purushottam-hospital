import { Link } from "react-router-dom";
import siteContent from "../config/siteContent";

export default function Logo({ variant = "light", compact = false, showName = true }) {
  const { hospital } = siteContent;
  const nameClass = variant === "dark" ? "text-white" : "text-navy";
  const subClass = variant === "dark" ? "text-white/80" : "text-accent";

  const image = (
    <img
      src={siteContent.images.logo}
      alt=""
      className={`w-auto shrink-0 object-contain ${
        compact
          ? "h-[4.5rem] max-h-[4.5rem] max-w-[4.75rem] sm:h-[5.25rem] sm:max-h-[5.25rem] sm:max-w-[5.5rem] lg:h-[6rem] lg:max-h-[6rem] lg:max-w-[6.25rem]"
          : "h-[4.75rem] max-h-[4.75rem] max-w-[5rem] sm:h-20 sm:max-h-20 sm:max-w-[6rem]"
      }`}
    />
  );

  return (
    <Link
      to="/"
      className="flex min-w-0 max-w-full items-center gap-2.5 no-underline sm:gap-3"
      aria-label="Acharya Purushottam Hospital & Medical College"
    >
      {variant === "dark" ? (
        <span className="inline-flex shrink-0 rounded-md bg-white px-1 py-1">{image}</span>
      ) : (
        image
      )}
      {showName ? (
        <span className={`min-w-0 leading-tight ${nameClass}`}>
          <span className="block text-[11px] font-extrabold tracking-[0.04em] sm:text-[13px] lg:text-[15px]">
            {hospital.line1}
          </span>
          <span className={`mt-0.5 block text-[9px] font-semibold tracking-[0.06em] sm:text-[11px] ${subClass}`}>
            {hospital.line2}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
