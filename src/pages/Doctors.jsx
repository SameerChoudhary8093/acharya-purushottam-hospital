import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import siteContent from "../config/siteContent";
import PageHero from "../components/PageHero";
import FadeIn from "../components/FadeIn";
import Button from "../components/Button";

export default function Doctors() {
  const { doctorsPage, images } = siteContent;

  return (
    <main id="main">
      <PageHero
        label={doctorsPage.label}
        title={doctorsPage.heading}
        text={doctorsPage.text}
        image={images.pageHeroDoctors}
        imageAlt={images.alts.pageHeroDoctors}
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <p className="max-w-3xl text-[15px] leading-relaxed text-body">{doctorsPage.intro}</p>
          </FadeIn>

          <div className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {doctorsPage.departments.map((item, index) => (
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {item.role}
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-navy">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-body">{item.text}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy px-6 py-8 text-white sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold">Join the founding faculty</h2>
                <p className="mt-1 text-sm text-white/80">
                  Apply for consultant, specialist and medical education roles.
                </p>
              </div>
              <Button as={Link} to="/#apply" variant="inverse">
                Apply now
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
