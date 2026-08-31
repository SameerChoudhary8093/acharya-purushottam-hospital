import siteContent from "../config/siteContent";
import Button from "./Button";
import FadeIn from "./FadeIn";
import { scrollToId } from "../utils/scroll";

export default function About() {
  const { about, images } = siteContent;

  return (
    <section id="about" className="scroll-mt-28 bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
            {about.label}
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-snug text-navy sm:text-3xl">
            {about.heading}
          </h2>
          {about.paragraphs.map((p) => (
            <p key={p} className="mt-4 max-w-xl text-[15px] leading-relaxed text-body">
              {p}
            </p>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="mt-8"
            onClick={() => scrollToId("why-join")}
          >
            Learn More
          </Button>
        </FadeIn>

        <FadeIn delay={80}>
          <img
            src={images.lobby}
            alt={images.alts.lobby}
            className="h-[280px] w-full rounded-xl object-cover sm:h-[360px] lg:h-[400px]"
            loading="lazy"
          />
        </FadeIn>
      </div>
    </section>
  );
}
