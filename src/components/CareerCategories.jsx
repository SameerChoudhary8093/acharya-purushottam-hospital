import { ArrowRight, BriefcaseBusiness, ChevronDown, FlaskConical, HeartPulse, Stethoscope } from "lucide-react";
import { RECRUITMENT_CATEGORIES } from "../../shared/recruitment.js";
import Button from "./Button";

const ICONS = { medical: Stethoscope, nursing: HeartPulse, allied: FlaskConical, administration: BriefcaseBusiness };

export default function CareerCategories({ onApply }) {
  return (
    <section id="opportunities" className="recruitment-opportunities border-y border-slate-100 bg-wash py-12 sm:py-16" aria-labelledby="opportunities-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-accent sm:text-base">WE ARE HIRING</p>
          <h2 id="opportunities-heading" className="mt-3 text-2xl font-bold tracking-tight text-navy sm:text-3xl">Join our Founding Team</h2>
        </div>
        <div className="mt-8 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
          {RECRUITMENT_CATEGORIES.map((category, index) => {
            const Icon = ICONS[category.id] || BriefcaseBusiness;
            return (
              <article key={category.id} className="recruitment-category-card flex min-w-0 flex-col rounded-xl border border-t-[3px] border-slate-200 border-t-accent bg-white p-4 shadow-sm transition-shadow hover:shadow-md xl:p-5" aria-labelledby={`category-${category.id}`}>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent"><Icon size={23} strokeWidth={1.75} aria-hidden="true" /></span>
                  <span className="text-xs font-medium text-slate-400" aria-hidden="true">0{index + 1}</span>
                </div>
                <h3 id={`category-${category.id}`} className="mt-3 text-[16px] font-bold leading-snug text-navy">{category.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{category.designations.length} designations</p>
                <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-body">
                  {category.designations.slice(0, 3).map((designation) => (
                    <li key={designation} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" /><span>{designation}</span></li>
                  ))}
                </ul>
                <details className="group mb-5 mt-3 text-[13px] leading-relaxed">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded font-semibold text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy [&::-webkit-details-marker]:hidden" aria-label={`View all ${category.designations.length} designations for ${category.title}`}>
                    View all {category.designations.length} designations
                    <ChevronDown className="transition-transform group-open:rotate-180" size={15} aria-hidden="true" />
                  </summary>
                  <ul className="mt-3 space-y-2 text-body">
                    {category.designations.slice(3).map((designation) => (
                      <li key={designation} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" /><span>{designation}</span></li>
                    ))}
                  </ul>
                </details>
                <Button type="button" variant="secondary" className="mt-auto w-full normal-case tracking-normal" onClick={() => onApply(category)} aria-label={`Apply Now — ${category.title}`}>Apply Now<ArrowRight size={15} aria-hidden="true" /></Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
