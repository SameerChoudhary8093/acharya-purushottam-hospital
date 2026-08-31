import {
  ArrowRight,
  Baby,
  Bone,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Pill,
  Scan,
  Siren,
  Stethoscope,
  Syringe,
  Activity,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import siteContent from "../config/siteContent";
import PageHero from "../components/PageHero";
import FadeIn from "../components/FadeIn";
import Button from "../components/Button";

const ICONS = {
  emergency: Siren,
  medicine: Stethoscope,
  surgery: Activity,
  ortho: Bone,
  obgyn: Heart,
  paeds: Baby,
  icu: HeartPulse,
  radiology: Scan,
  lab: FlaskConical,
  anaesthesia: Syringe,
  pharmacy: Pill,
  education: GraduationCap,
};

export default function Services() {
  const { servicesPage, images } = siteContent;

  return (
    <main id="main">
      <PageHero
        label={servicesPage.label}
        title={servicesPage.heading}
        text={servicesPage.text}
        image={images.pageHeroServices}
        imageAlt={images.alts.pageHeroServices}
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {servicesPage.items.map((item, index) => {
              const Icon = ICONS[item.id] || Stethoscope;
              return (
                <FadeIn key={item.id} className="h-full" delay={Math.min(index, 6) * 70}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,45,98,0.08)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,45,98,0.12)]">
                    <div className="reveal-media relative h-48 overflow-hidden sm:h-52">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <h2 className="mt-3 text-lg font-bold text-navy">{item.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-body">{item.text}</p>
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn>
            <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-wash px-6 py-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-navy">Help us deliver these services</h2>
                <p className="mt-1 text-sm text-body">
                  Clinical, nursing and support roles are opening as the hospital grows.
                </p>
              </div>
              <Button as={Link} to="/#opportunities">
                View careers
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
