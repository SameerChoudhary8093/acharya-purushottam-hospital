import { Mail, MapPin, Phone } from "lucide-react";
import siteContent from "../config/siteContent";
import Button from "./Button";
import FadeIn from "./FadeIn";

export default function LocationContact() {
  const { contact, images } = siteContent;

  return (
    <section className="bg-wash py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:items-stretch">
        <FadeIn>
          <div id="location" className="scroll-mt-28 h-full rounded-xl bg-white p-6 sm:p-8">
            <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
              <MapPin size={14} aria-hidden="true" />
              Our Location
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-body">{contact.address}</p>
            <div className="mt-5 overflow-hidden rounded-lg">
              <iframe
                title="Map showing Acharya Purushottam Hospital & Medical College location"
                src={contact.mapsEmbedUrl}
                className="h-44 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <Button
              as="a"
              variant="secondary"
              className="mt-5"
              href={contact.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <img
            src={images.exteriorSide}
            alt={images.alts.exteriorSide}
            className="h-64 w-full rounded-xl object-cover lg:h-full"
            loading="lazy"
          />
        </FadeIn>

        <FadeIn delay={100}>
          <div id="contact" className="scroll-mt-28 h-full rounded-xl bg-white p-6 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">
              Contact Us
            </p>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <Phone className="mt-0.5 shrink-0 text-navy" size={18} aria-hidden="true" />
                <div>
                  <p className="font-medium text-muted">Phone</p>
                  <a className="font-semibold text-navy hover:underline" href={contact.phoneHref}>
                    {contact.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 shrink-0 text-navy" size={18} aria-hidden="true" />
                <div>
                  <p className="font-medium text-muted">Email</p>
                  <a className="font-semibold text-navy hover:underline" href={contact.emailHref}>
                    {contact.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 shrink-0 text-navy" size={18} aria-hidden="true" />
                <div>
                  <p className="font-medium text-muted">Address</p>
                  <p className="font-semibold text-navy">{contact.addressShort}</p>
                </div>
              </li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
