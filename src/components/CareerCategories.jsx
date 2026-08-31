import { Briefcase, FlaskConical, HeartPulse, Stethoscope } from "lucide-react";
import siteContent from "../config/siteContent";
import Button from "./Button";
import FadeIn from "./FadeIn";
import { scrollToId } from "../utils/scroll";

const ICONS = {
  stethoscope: Stethoscope,
  nursing: HeartPulse,
  lab: FlaskConical,
  briefcase: Briefcase,
};

export default function CareerCategories() {
  const { careerCategories, images } = siteContent;

  return (
    <section id="opportunities" className="scroll-mt-28 bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <FadeIn>
            <h2 className="text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
              Career Opportunities
            </h2>
            <p className="mt-3 text-[15px] text-body">
              Find your opportunity and become part of our journey.
            </p>
          </FadeIn>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {careerCategories.map((cat, index) => {
              const Icon = ICONS[cat.icon] || Briefcase;
              return (
                <FadeIn key={cat.id} delay={index * 50}>
                  <article className="h-full rounded-xl border border-slate-100 bg-white p-5 shadow-[0_6px_20px_rgba(0,45,98,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,45,98,0.1)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-[15px] font-bold text-navy">{cat.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-body">{cat.text}</p>
                  </article>
                </FadeIn>
              );
            })}
          </div>
          <FadeIn>
            <Button
              type="button"
              className="mt-8 w-full sm:w-auto"
              onClick={() => scrollToId("positions")}
            >
              View Open Positions
            </Button>
          </FadeIn>
        </div>

        <FadeIn delay={80}>
          <img
            src={images.corridorWood}
            alt={images.alts.corridorWood}
            className="h-[320px] w-full rounded-xl object-cover object-top sm:h-[420px] lg:h-[520px]"
            loading="lazy"
          />
        </FadeIn>
      </div>
    </section>
  );
}
