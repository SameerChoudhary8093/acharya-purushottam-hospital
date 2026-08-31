import { useState } from "react";
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
  const { careerCategories } = siteContent;
  const [activeId, setActiveId] = useState(careerCategories[0].id);
  const active = careerCategories.find((cat) => cat.id === activeId) || careerCategories[0];

  return (
    <section id="opportunities" className="scroll-mt-20 bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <FadeIn variant="right">
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
              const selected = cat.id === activeId;
              return (
                <FadeIn key={cat.id} className="h-full" delay={index * 80}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveId(cat.id)}
                    onFocus={() => setActiveId(cat.id)}
                    onClick={() => setActiveId(cat.id)}
                    className={`h-full w-full rounded-xl border p-5 text-left shadow-[0_6px_20px_rgba(0,45,98,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,45,98,0.1)] ${
                      selected
                        ? "border-navy bg-wash ring-1 ring-navy/20"
                        : "border-slate-100 bg-white"
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-[15px] font-bold text-navy">{cat.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-body">{cat.text}</p>
                  </button>
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

        <FadeIn variant="left" delay={120} duration={900}>
          <div className="relative h-[320px] overflow-hidden rounded-xl sm:h-[420px] lg:h-[520px]">
            {careerCategories.map((cat) => (
              <img
                key={cat.id}
                src={cat.image}
                alt={cat.id === activeId ? cat.imageAlt : ""}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
                  cat.id === activeId ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-white">
                {active.title}
              </p>
              <p className="mt-1 text-sm text-white/85">{active.text}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
