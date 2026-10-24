import { ClipboardCheck, FileText } from "lucide-react";
import { ELIGIBILITY_TEXT, MAX_RESUME_MB } from "../../shared/recruitment.js";

export default function Eligibility() {
  return (
    <section id="eligibility" className="recruitment-eligibility bg-white py-10 sm:py-14" aria-labelledby="eligibility-heading">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2 md:gap-12">
        <div className="flex items-start gap-4">
          <ClipboardCheck className="mt-1 shrink-0 text-accent" size={26} aria-hidden="true" />
          <div><h2 id="eligibility-heading" className="text-xl font-bold text-navy sm:text-2xl">Eligibility</h2><p className="mt-3 text-sm leading-relaxed">{ELIGIBILITY_TEXT}</p></div>
        </div>
        <div className="flex items-start gap-4">
          <FileText className="mt-1 shrink-0 text-accent" size={26} aria-hidden="true" />
          <div><h3 className="text-lg font-bold text-navy">How to apply</h3><p className="mt-3 text-sm leading-relaxed">Select your hiring category and designation, complete the application form, and attach your current resume. Accepted formats: PDF, DOC, or DOCX, up to {MAX_RESUME_MB} MB.</p></div>
        </div>
      </div>
    </section>
  );
}
