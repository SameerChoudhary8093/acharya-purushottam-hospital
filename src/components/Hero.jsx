import { ArrowRight, BedDouble, Building2, FlaskConical, Stethoscope } from "lucide-react";
import siteContent from "../config/siteContent";
import Button from "./Button";
import { scrollToId } from "../utils/scroll";

const FEATURE_ICONS = {
  bed: BedDouble,
  campus: Building2,
  doctors: Stethoscope,
  research: FlaskConical,
};

export default function Hero() {
  const { hero, images } = siteContent;

  return (
    <section
      className="relative isolate overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-32 bottom-0 h-56 w-56 rounded-full bg-sky-100/80 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col lg:min-h-[700px] lg:flex-row xl:min-h-[740px]">
        <div className="relative z-10 flex w-full flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 lg:w-[42%] lg:px-8 lg:py-14 xl:w-[40%] xl:pl-12 xl:pr-6">
          <p className="hero-copy text-[13px] font-semibold uppercase tracking-[0.22em] text-accent sm:text-[14px]">
            {hero.label}
          </p>
          <h1
            id="hero-heading"
            className="hero-copy hero-copy-delay-1 mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-navy sm:text-[2.75rem] lg:text-[3.5rem] xl:text-[4rem]"
          >
            {hero.headingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-copy hero-copy-delay-2 mt-5 max-w-xl text-[15px] leading-relaxed text-body sm:text-base">
            {hero.text}
          </p>

          <ul className="hero-copy hero-copy-delay-3 mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {hero.features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon] || Building2;
              return (
                <li
                  key={feature.title}
                  className="rounded-xl bg-white px-2 py-3 text-center shadow-[0_4px_18px_rgba(0,45,98,0.06)] ring-1 ring-slate-100/80"
                >
                  <Icon className="mx-auto text-navy/70" size={18} strokeWidth={1.75} aria-hidden="true" />
                  <p className="mt-2 text-[12px] font-bold leading-snug text-navy sm:text-[13px]">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{feature.text}</p>
                </li>
              );
            })}
          </ul>

          <div className="hero-copy hero-copy-delay-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="primary"
              className="rounded-md px-6 py-3 text-[12px] tracking-[0.08em] shadow-[0_8px_20px_rgba(0,45,98,0.18)] hover:shadow-[0_10px_24px_rgba(0,45,98,0.22)]"
              onClick={() => scrollToId("positions")}
            >
              Explore Opportunities
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-md border-navy px-6 py-3 text-[12px] tracking-[0.08em] hover:border-accent hover:text-navy"
              onClick={() => scrollToId("apply")}
            >
              Join Our Team
            </Button>
          </div>
        </div>

        <div className="hero-visual-in relative h-[280px] w-full overflow-hidden sm:h-[380px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[58%] xl:w-[60%]">
          <img
            src={images.hero}
            alt={images.alts.hero}
            className="hero-zoom h-full w-full object-cover object-[center_42%] lg:object-[center_center]"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/70 to-transparent sm:w-24 lg:w-40 xl:w-52"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
