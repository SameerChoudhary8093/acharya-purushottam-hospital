import FadeIn from "./FadeIn";

export default function PageHero({ label, title, text, image, imageAlt }) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={image}
        alt={imageAlt || ""}
        className="hero-zoom absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy/78" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
        <FadeIn>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent sm:text-[13px] sm:tracking-[0.18em]">
            {label}
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(1.6rem,1rem+3vw,2.5rem)] font-extrabold leading-tight text-balance text-white">
            {title}
          </h1>
          {text ? (
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-pretty text-white/85 sm:text-[15px]">{text}</p>
          ) : null}
        </FadeIn>
      </div>
    </section>
  );
}
