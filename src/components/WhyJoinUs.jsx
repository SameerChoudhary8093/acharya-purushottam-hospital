import { useEffect, useRef, useState } from "react";
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
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const hovered = useRef(false);

  const slides = [...items, ...items.slice(0, perView)];
  const loopAt = items.length;
  const activeDot = index >= loopAt ? 0 : index;

  useEffect(() => {
    setIndex(0);
    setAnimate(true);
  }, [perView]);

  useEffect(() => {
    if (prefersReducedMotion() || items.length <= perView) return undefined;
    const timer = window.setInterval(() => {
      if (hovered.current) return;
      setIndex((current) => (current >= loopAt ? current : current + 1));
    }, 4200);
    return () => window.clearInterval(timer);
  }, [items.length, perView, loopAt]);

  useEffect(() => {
    if (animate) return undefined;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [animate]);

  function handleTransitionEnd() {
    if (index >= loopAt) {
      setAnimate(false);
      setIndex(0);
    }
  }

  function next() {
    setIndex((current) => (current >= loopAt ? current : current + 1));
  }

  function prev() {
    if (index === 0) {
      setAnimate(false);
      setIndex(loopAt);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(loopAt - 1);
        });
      });
      return;
    }
    setIndex((current) => current - 1);
  }

  function goTo(page) {
    setAnimate(true);
    setIndex(page);
  }

  return (
    <section
      id="why-join"
      className="scroll-mt-20 overflow-hidden bg-wash py-16 sm:py-24"
      onMouseEnter={() => {
        hovered.current = true;
      }}
      onMouseLeave={() => {
        hovered.current = false;
      }}
    >
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
                onClick={prev}
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy hover:bg-navy hover:text-white"
                onClick={next}
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80} duration={900} className="mt-10">
          <div className="overflow-hidden">
            <div
              className={`flex ${animate ? "transition-transform duration-700 ease-out" : ""}`}
              style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {slides.map((item, slideIndex) => (
                <article
                  key={`${item.title}-${slideIndex}`}
                  className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3"
                >
                  <div className="group h-full overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,45,98,0.08)]">
                    <div className="reveal-media overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        className="h-52 w-full object-cover sm:h-56"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-[16px] font-bold text-navy">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-body">{item.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="mt-6 flex justify-center gap-2">
          {items.map((item, dot) => (
            <button
              key={item.title}
              type="button"
              className={`h-2 rounded-full transition-all ${
                dot === activeDot ? "w-6 bg-navy" : "w-2 bg-navy/25"
              }`}
              onClick={() => goTo(dot)}
              aria-label={`Go to ${item.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
