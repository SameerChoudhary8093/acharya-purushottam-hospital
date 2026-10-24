import siteContent from "../config/siteContent";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-dark px-4 py-7 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo variant="dark" compact showName={false} />
        <div className="text-xs leading-relaxed text-white/70"><p>{siteContent.footer.copyright}</p><p className="mt-1">Recruitment · Acharya Purushottam Hospital & Medical College</p></div>
      </div>
    </footer>
  );
}
