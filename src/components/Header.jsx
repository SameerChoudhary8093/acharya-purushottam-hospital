import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import { scrollToId } from "../utils/scroll";

const NAV = [
  { path: "/", hash: "about", label: "About" },
  { path: "/services", label: "Services" },
  { path: "/doctors", label: "Doctors" },
  { path: "/facilities", label: "Facilities" },
  { path: "/", hash: "opportunities", label: "Careers" },
  { path: "/", hash: "contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  function goHomeSection(id) {
    setOpen(false);
    if (location.pathname === "/") {
      scrollToId(id);
    } else {
      navigate(`/#${id}`);
    }
  }

  function linkClass(item, { isActive } = {}) {
    const onPage = item.hash
      ? location.pathname === "/" && location.hash === `#${item.hash}`
      : isActive;
    return `text-[14px] font-medium transition-colors ${
      onPage ? "text-navy" : "text-navy/80 hover:text-navy"
    }`;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full min-w-0 overflow-x-clip border-b bg-white/95 backdrop-blur-md ${
        scrolled ? "border-slate-200 shadow-sm" : "border-slate-100"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-navy focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="relative flex h-[64px] w-full min-w-0 items-center justify-between gap-2 px-4 sm:h-[68px] sm:px-5 lg:h-[72px] lg:px-8">
        <div className="min-w-0 flex-1 overflow-hidden">
          <Logo compact showName />
        </div>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 xl:flex"
          aria-label="Primary"
        >
          {NAV.map((item) =>
            item.hash ? (
              <button
                key={item.label}
                type="button"
                onClick={() => goHomeSection(item.hash)}
                className={linkClass(item)}
              >
                {item.label}
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => linkClass(item, { isActive })}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            onClick={() => goHomeSection("apply")}
            className="shrink-0 px-2.5 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-[12px]"
          >
            <span className="sm:hidden">Apply</span>
            <span className="max-sm:hidden">Apply Now</span>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-navy xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-slate-100 bg-white px-3 py-4 sm:px-5 xl:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) =>
              item.hash ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goHomeSection(item.hash)}
                  className="rounded-md px-3 py-3 text-left text-sm font-medium text-navy hover:bg-wash"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="rounded-md px-3 py-3 text-left text-sm font-medium text-navy hover:bg-wash"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Button type="button" onClick={() => goHomeSection("apply")} className="mt-2 w-full sm:hidden">
              Apply Now
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
