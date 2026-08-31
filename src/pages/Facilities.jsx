import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import siteContent from "../config/siteContent";
import PageHero from "../components/PageHero";
import FadeIn from "../components/FadeIn";
import Button from "../components/Button";

export default function Facilities() {
  const { facilitiesPage, images } = siteContent;

  return (
    <main id="main">
      <PageHero
        label={facilitiesPage.label}
        title={facilitiesPage.heading}
        text={facilitiesPage.text}
        image={images.aerialWide}
        imageAlt={images.alts.aerialWide}
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8">
            {facilitiesPage.items.map((item, index) => (
              <FadeIn key={item.id} delay={index * 50}>
                <article className="grid overflow-hidden rounded-2xl bg-wash shadow-[0_8px_24px_rgba(0,45,98,0.06)] md:grid-cols-2">
                  <img
                    src={images[item.image]}
                    alt={images.alts[item.image] || item.title}
                    className={`h-56 w-full object-cover md:h-full ${
                      index % 2 === 1 ? "md:order-2" : ""
                    }`}
                    loading="lazy"
                  />
                  <div className="flex flex-col justify-center p-6 sm:p-10">
                    <h2 className="text-2xl font-extrabold text-navy">{item.title}</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-body">{item.text}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {facilitiesPage.extras.map((item, index) => (
              <FadeIn key={item.title} delay={index * 40}>
                <article className="h-full rounded-2xl border border-slate-100 bg-white p-6 transition-transform duration-300 hover:-translate-y-1.5">
                  <Building2 className="text-navy" size={22} aria-hidden="true" />
                  <h3 className="mt-4 font-bold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-body">{item.text}</p>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-wash px-6 py-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-navy">See the campus</h2>
                <p className="mt-1 text-sm text-body">
                  Nangal Siras, Rajawas, Sikar Road, Jaipur.
                </p>
              </div>
              <Button as={Link} to="/#location">
                View location
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
