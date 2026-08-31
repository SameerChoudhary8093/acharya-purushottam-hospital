import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import siteContent from "../config/siteContent";
import FadeIn from "./FadeIn";
import { prefersReducedMotion } from "../utils/scroll";

function usePerView() {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    function update() {
      if (window.innerWidth >= 1024) setPerView(3);
      else if (window.innerWidth >= 640) setPerView(2);
      else setPerView(1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

export default function WhyJoinUs() {
  const items = siteContent.whyJoinUs;
  const perView = usePerView();
  const maxIndex = Math.max(0, items.length - perView);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (prefersReducedMotion() || maxIndex === 0) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 5200);
    return () => window.clearInterval(timer);
  }, [maxIndex]);

  function go(next) {
    setIndex(Math.max(0, Math.min(maxIndex, next)));
  }

  return (
    <section id="why-join" className="scroll-mt-28 overflow-hidden bg-wash py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
                Life at Acharya Purushottam
              </p>
              <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
                Why Join Us?
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy hover:bg-navy hover:text-white"
                onClick={() => go(index === 0 ? maxIndex : index - 1)}
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy hover:bg-navy hover:text-white"
                onClick={() => go(index >= maxIndex ? 0 : index + 1)}
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="mt-10 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
          >
            {items.map((item) => (
              <article
                key={item.title}
                className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3"
              >
                <div className="h-full overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,45,98,0.08)]">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="h-52 w-full object-cover sm:h-56"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h3 className="text-[16px] font-bold text-navy">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-body">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
          {Array.from({ length: maxIndex + 1 }).map((_, dot) => (
            <button
              key={dot}
              type="button"
              className={`h-2 rounded-full transition-all ${
                dot === index ? "w-6 bg-navy" : "w-2 bg-navy/25"
              }`}
              onClick={() => go(dot)}
              aria-label={`Go to slide ${dot + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
