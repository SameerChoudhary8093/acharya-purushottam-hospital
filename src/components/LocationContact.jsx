import { Mail, MapPin, Phone } from "lucide-react";
import siteContent from "../config/siteContent";

export default function LocationContact() {
  const { contact } = siteContent;
  return (
    <section id="contact" className="recruitment-contact border-t border-slate-100 bg-wash py-10 sm:py-12" aria-labelledby="contact-heading">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 md:gap-12">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Contact</p><h2 id="contact-heading" className="mt-3 text-2xl font-bold text-navy">Acharya Purushottam<br className="hidden sm:block" /> Hospital & Medical College</h2><p className="mt-3 text-sm leading-relaxed">To apply for an opportunity, please complete the recruitment application form.</p></div>
        <div className="space-y-4 text-sm leading-relaxed">
          {contact.address && <p className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-accent" size={19} aria-hidden="true" /><span>{contact.address}<a href={contact.mapsDirectionsUrl} className="mt-2 block w-fit font-semibold text-navy underline underline-offset-4" target="_blank" rel="noopener noreferrer">Get directions</a></span></p>}
          {contact.phone && <p className="flex items-start gap-3"><Phone className="shrink-0 text-accent" size={19} aria-hidden="true" /><a href={contact.phoneHref} className="text-navy hover:underline">{contact.phone}</a></p>}
          {contact.email && <p className="flex min-w-0 items-start gap-3"><Mail className="shrink-0 text-accent" size={19} aria-hidden="true" /><a href={contact.emailHref} className="break-all text-navy hover:underline">{contact.email}</a></p>}
          {contact.mapsEmbedUrl && <div className="recruitment-contact-map overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><iframe src={contact.mapsEmbedUrl} title="Map of Rajawas, Jaipur" className="block h-48 w-full border-0 md:h-52" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /><p className="border-t border-slate-100 px-3 py-2 text-[11px] text-muted">Rajawas, Jaipur · area map</p></div>}
        </div>
      </div>
    </section>
  );
}
