import { Link } from "react-router-dom";
import siteContent from "../config/siteContent";
import FadeIn from "./FadeIn";

const TONE = {
  soft: "bg-[#d7eef6] text-navy",
  navy: "bg-navy text-white",
  accent: "bg-accent-soft text-navy",
};

function spanClass(span) {
  if (span === "hero") {
    return "md:col-span-8 md:row-span-2 min-h-[260px] md:min-h-[430px]";
  }
  return "md:col-span-4 min-h-[210px]";
}

function StoryCard({ story, index }) {
  const { images } = siteContent;
  const floatClass = story.kind !== "photo" ? (index % 2 === 0 ? "card-float" : "card-float-slow") : "";

  if (story.kind === "photo") {
    return (
      <article className="group relative h-full min-h-[210px] overflow-hidden rounded-3xl shadow-[0_10px_30px_rgba(0,45,98,0.08)] transition-transform duration-500 hover:-translate-y-1.5">
        <div className="reveal-media absolute inset-0">
          <img
            src={images[story.image]}
            alt={images.alts[story.image] || story.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="text-lg font-bold text-white">{story.title}</h3>
          <p className="mt-1 text-sm text-white/85">{story.text}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${floatClass} flex h-full min-h-[210px] flex-col justify-between rounded-3xl p-7 shadow-[0_10px_30px_rgba(0,45,98,0.08)] transition-transform duration-500 hover:-translate-y-1.5 ${TONE[story.tone] || TONE.soft}`}
    >
      <p className="text-lg font-semibold leading-snug sm:text-xl">
        {story.kind === "quote" ? `“${story.text}”` : story.text}
      </p>
      <p className="mt-6 text-sm font-bold uppercase tracking-wide">{story.title}</p>
    </article>
  );
}

export default function Highlights() {
  const { highlights } = siteContent;
  const marquee = [...highlights.marquee, ...highlights.marquee];

  return (
    <section id="highlights" className="scroll-mt-20 overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            {highlights.label}
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-extrabold text-navy sm:text-3xl">
            {highlights.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-body">{highlights.text}</p>
        </FadeIn>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          {highlights.stories.map((story, index) => (
            <FadeIn
              key={story.id}
              className={spanClass(story.span)}
              delay={Math.min(index, 5) * 80}
              duration={800}
            >
              <StoryCard story={story} index={index} />
            </FadeIn>
          ))}
        </div>
      </div>

      <FadeIn delay={160}>
      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />
        <div className="overflow-hidden">
          <p className="sr-only">
            Clinical services include {highlights.marquee.join(", ")}.
          </p>
          <ul className="marquee-track flex w-max gap-4 pr-4" aria-hidden="true">
            {marquee.map((item, index) => (
              <li key={`${item}-${index}`}>
                <Link
                  to="/services"
                  className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-wash px-5 py-3 text-sm font-semibold text-navy shadow-sm transition-transform hover:-translate-y-0.5 hover:border-navy/20 hover:bg-white"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </FadeIn>
    </section>
  );
}
