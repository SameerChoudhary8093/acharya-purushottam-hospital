import { ArrowRight, UserRound } from "lucide-react";
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
        image={images.campusFront}
        imageAlt={images.alts.campusFront}
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <p className="max-w-3xl text-[15px] leading-relaxed text-body">{doctorsPage.intro}</p>
          </FadeIn>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctorsPage.departments.map((item, index) => (
              <FadeIn key={item.id} delay={index * 35}>
                <article className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(0,45,98,0.06)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_14px_32px_rgba(0,45,98,0.1)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-navy">
                    <UserRound size={18} aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-navy">{item.title}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
                    {item.role}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-body">{item.text}</p>
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
