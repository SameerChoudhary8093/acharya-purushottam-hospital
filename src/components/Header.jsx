import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import { scrollToId } from "../utils/scroll";

const NAV = [
  { id: "hero", label: "Home" },
  { id: "opportunities", label: "We Are Hiring" },
  { id: "eligibility", label: "Eligibility" },
  { id: "apply", label: "Apply Now" },
  { id: "contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function closeMenu(event) {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    }
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [open]);

  function navigate(event, id) {
    event.preventDefault();
    setOpen(false);
    scrollToId(id);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-navy focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="relative flex h-[64px] w-full min-w-0 items-center justify-between gap-2 px-4 sm:h-[68px] sm:px-5 lg:h-[72px] lg:px-8">
        <div className="min-w-0"><Logo compact showName={false} /></div>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.filter(({ id }) => id !== "apply").map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={(event) => navigate(event, id)} className="text-[14px] font-medium text-navy/80 transition-colors hover:text-accent">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <Button as="a" href="#apply" onClick={(event) => navigate(event, "apply")} className="min-h-10 px-3 py-2 text-[11px] sm:px-4">Apply Now</Button>
          <button ref={menuRef} type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-md text-navy lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="absolute inset-x-0 top-full border-b border-slate-200 bg-white p-3 shadow-md lg:hidden" aria-label="Mobile">
          {NAV.map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={(event) => navigate(event, id)} className="block rounded-md px-4 py-3 text-sm font-medium text-navy hover:bg-wash">{label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
