import siteContent from "../config/siteContent";
import Button from "./Button";
import FadeIn from "./FadeIn";
import RevealImage from "./RevealImage";
import { scrollToId } from "../utils/scroll";

export default function About() {
  const { about, images } = siteContent;

  return (
    <section id="about" className="scroll-mt-20 bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-10 px-4 sm:px-6 xl:grid-cols-2 xl:gap-16">
        <FadeIn variant="right">
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

        <FadeIn variant="left" delay={120} duration={900}>
          <RevealImage
            src={images.lobby}
            alt={images.alts.lobby}
            className="h-[280px] w-full rounded-xl sm:h-[360px] lg:h-[400px]"
            imgClassName="h-full w-full object-cover"
          />
        </FadeIn>
      </div>
    </section>
  );
}
