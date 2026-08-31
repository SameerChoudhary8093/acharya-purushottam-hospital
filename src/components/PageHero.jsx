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
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <FadeIn>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            {label}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {title}
          </h1>
          {text ? (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">{text}</p>
          ) : null}
        </FadeIn>
      </div>
    </section>
  );
}
