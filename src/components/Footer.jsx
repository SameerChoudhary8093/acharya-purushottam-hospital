import { Link, useLocation, useNavigate } from "react-router-dom";
import siteContent from "../config/siteContent";
import Logo from "./Logo";
import { scrollToId } from "../utils/scroll";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden="true">
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v7h4v-7h3.2l.8-4H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden="true">
      <path d="M6.5 9H3v12h3.5V9zM4.8 3C3.5 3 2.5 4 2.5 5.3S3.5 7.6 4.8 7.6 7 6.6 7 5.3 6 3 4.8 3zM21 21h-3.5v-6.2c0-1.8-.7-2.4-1.7-2.4s-1.9.8-1.9 2.5V21H10.5V9H14v1.6c.6-1 1.8-1.9 3.6-1.9 2.6 0 3.4 1.7 3.4 4.9V21z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden="true">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2zM17.2 6.8a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden="true">
      <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5V8.9l6 3.3-6 3.3z" />
    </svg>
  );
}

const QUICK_LINKS = [
  { path: "/", hash: "about", label: "About Us" },
  { path: "/services", label: "Services" },
  { path: "/doctors", label: "Doctors" },
  { path: "/facilities", label: "Facilities" },
];

const OPPORTUNITIES = [
  { id: "opportunities", label: "Medical" },
  { id: "opportunities", label: "Nursing" },
  { id: "opportunities", label: "Allied Healthcare" },
  { id: "opportunities", label: "Administration & Support" },
];

export default function Footer() {
  const { hospital, contact, social, footer } = siteContent;
  const location = useLocation();
  const navigate = useNavigate();

  function goHomeSection(id) {
    if (location.pathname === "/") {
      scrollToId(id);
    } else {
      navigate(`/#${id}`);
    }
  }

  return (
    <footer className="bg-navy-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo variant="dark" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
            {hospital.tagline}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Quick Links</h2>
          <ul className="mt-4 space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                {link.hash ? (
                  <button
                    type="button"
                    className="text-sm text-white/75 hover:text-white"
                    onClick={() => goHomeSection(link.hash)}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link to={link.path} className="text-sm text-white/75 hover:text-white">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Opportunities</h2>
          <ul className="mt-4 space-y-2">
            {OPPORTUNITIES.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  className="text-sm text-white/75 hover:text-white"
                  onClick={() => goHomeSection(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <a className="hover:text-white" href={contact.phoneHref}>
                {contact.phone}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={contact.emailHref}>
                {contact.email}
              </a>
            </li>
            <li>{contact.addressShort}</li>
          </ul>
          <p className="mt-6 text-sm font-bold uppercase tracking-wide">Connect With Us</p>
          <div className="mt-3 flex gap-2">
            {[
              { href: social.facebook, label: "Facebook", Icon: FacebookIcon },
              { href: social.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
              { href: social.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: social.youtube, label: "YouTube", Icon: YoutubeIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white hover:text-navy"
              >
                <Icon size={15} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/55 sm:px-6">
        {footer.copyright}
      </div>
    </footer>
  );
}
