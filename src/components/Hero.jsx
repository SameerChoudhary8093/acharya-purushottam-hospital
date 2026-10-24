import { ArrowRight, BedDouble, GraduationCap, MapPin, UsersRound } from "lucide-react";
import siteContent from "../config/siteContent";
import Button from "./Button";
import { scrollToId } from "../utils/scroll";

const HOSPITAL_INFO = [
  { title: "750 Beds", text: "Upcoming multispeciality hospital", Icon: BedDouble },
  { title: "Rajawas, Jaipur", text: "Hospital location", Icon: MapPin },
  { title: "Care & Education", text: "Hospital & medical college", Icon: GraduationCap },
  { title: "Founding Team", text: "Four hiring categories", Icon: UsersRound },
];

export default function Hero() {
  const { hero, images } = siteContent;

  return (
    <section id="hero" className="recruitment-hero bg-white" aria-labelledby="hero-heading">
      <div className="recruitment-hero__layout">
        <div className="recruitment-hero__copy">
          <p className="hero-copy text-xs font-semibold uppercase tracking-[0.16em] text-accent sm:text-[13px] sm:tracking-[0.2em]">{hero.label}</p>
          <h1 id="hero-heading" className="recruitment-hero__heading hero-copy hero-copy-delay-1 font-extrabold text-navy">
            {hero.headingLines.map((line, index) => (
              <span key={line}>{line}{index < hero.headingLines.length - 1 ? " " : ""}</span>
            ))}
          </h1>
          <p className="recruitment-hero__description hero-copy hero-copy-delay-2 mt-5 text-[15px] leading-relaxed text-body sm:text-base">{hero.text}</p>
          <ul className="recruitment-hero__facts hero-copy hero-copy-delay-3 mt-6 grid grid-cols-2 gap-3">
            {HOSPITAL_INFO.map(({ title, text, Icon }) => (
              <li key={title} className="min-w-0 rounded-xl border border-slate-100 bg-white px-3 py-3 text-center shadow-[0_4px_18px_rgba(0,45,98,0.05)]">
                <Icon className="mx-auto text-navy/75" size={17} strokeWidth={1.65} aria-hidden="true" />
                <p className="mt-2 text-[12px] font-bold leading-snug text-navy sm:text-[13px]">{title}</p>
                <p className="mt-1 text-[10px] leading-snug text-muted sm:text-[11px]">{text}</p>
              </li>
            ))}
          </ul>
          <div className="recruitment-hero__actions hero-copy hero-copy-delay-4 mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={() => scrollToId("opportunities")} className="min-h-12 px-5 py-3 text-xs shadow-[0_8px_20px_rgba(0,45,98,0.12)]">Explore Opportunities<ArrowRight size={16} aria-hidden="true" /></Button>
            <Button type="button" variant="secondary" onClick={() => scrollToId("apply")} className="min-h-12 px-5 py-3 text-xs">Apply Now</Button>
          </div>
        </div>
        <figure className="recruitment-hero__visual hero-visual-in">
          <img src={images.hero} alt={images.alts.hero} fetchPriority="high" width="1536" height="1024" />
        </figure>
      </div>
    </section>
  );
}
