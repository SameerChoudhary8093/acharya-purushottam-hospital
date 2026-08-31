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
  const heading = hero.headingLines.join(" ");

  return (
    <section
      id="hero"
      className="relative isolate overflow-x-clip bg-white"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute -left-16 top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl sm:-left-24 sm:h-72 sm:w-72"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-16 h-40 w-40 rounded-full bg-sky-100/80 blur-3xl sm:left-32 sm:h-56 sm:w-56"
        aria-hidden="true"
      />

      <div className="relative flex w-full min-w-0 max-w-full flex-col-reverse split:min-h-[calc(100svh-var(--header-h))] split:flex-row">
        <div className="relative z-10 flex w-full min-w-0 max-w-full flex-col justify-center px-5 py-8 sm:px-6 sm:py-10 md:px-8 split:w-[48%] split:px-8 split:py-10 xl:pl-12 xl:pr-8 min-[1440px]:w-[44%] min-[1440px]:pl-14">
          <p className="hero-copy max-w-full break-words text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-accent sm:text-[13px] sm:tracking-[0.18em]">
            {hero.label}
          </p>
          <h1
            id="hero-heading"
            className="hero-copy hero-copy-delay-1 mt-3 max-w-full break-words text-[clamp(1.7rem,1.05rem+4vw,4.35rem)] font-extrabold leading-[1.15] tracking-tight text-balance text-navy"
          >
            <span className="split:hidden">{heading}</span>
            <span className="hidden split:block">
              {hero.headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </h1>
          <p className="hero-copy hero-copy-delay-2 mt-4 max-w-xl text-[14px] leading-relaxed text-pretty text-body sm:text-[16px] lg:text-[17px]">
            {hero.text}
          </p>

          <ul className="hero-copy hero-copy-delay-3 mt-6 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 split:grid-cols-2 min-[1600px]:grid-cols-4">
            {hero.features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon] || Building2;
              return (
                <li
                  key={feature.title}
                  className="min-w-0 rounded-xl bg-white px-3 py-3.5 text-left shadow-[0_4px_18px_rgba(0,45,98,0.06)] ring-1 ring-slate-100/80 sm:text-center"
                >
                  <Icon
                    className="text-navy/70 sm:mx-auto"
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-[12px] font-bold leading-snug text-navy sm:text-[13px]">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{feature.text}</p>
                </li>
              );
            })}
          </ul>

          <div className="hero-copy hero-copy-delay-4 mt-6 flex w-full min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <Button
              type="button"
              variant="primary"
              className="w-full rounded-md px-5 py-3 text-[12px] tracking-[0.08em] shadow-[0_8px_20px_rgba(0,45,98,0.18)] hover:shadow-[0_10px_24px_rgba(0,45,98,0.22)] md:w-auto"
              onClick={() => scrollToId("positions")}
            >
              Explore Opportunities
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-md border-navy px-5 py-3 text-[12px] tracking-[0.08em] hover:border-accent hover:text-navy md:w-auto"
              onClick={() => scrollToId("apply")}
            >
              Join Our Team
            </Button>
          </div>
        </div>

        <div className="hero-visual-in relative h-[min(42vw,52vh)] min-h-[220px] max-h-[640px] w-full min-w-0 max-w-full overflow-hidden split:absolute split:inset-y-0 split:right-0 split:h-auto split:max-h-none split:min-h-0 split:w-[52%] min-[1440px]:w-[56%]">
          <img
            src={images.hero}
            alt={images.alts.hero}
            className="hero-zoom h-full w-full max-w-none object-cover object-[center_40%] split:object-[58%_center]"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent split:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-white via-white/75 to-transparent split:block split:w-28 xl:w-40"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
