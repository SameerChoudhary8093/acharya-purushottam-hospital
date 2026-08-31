import { ArrowRight, UserPlus } from "lucide-react";
import Button from "./Button";
import { scrollToId } from "../utils/scroll";

export default function CtaBanner() {
  return (
    <section className="ecg-line bg-navy" aria-labelledby="cta-heading">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4 text-white md:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30">
            <UserPlus size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="cta-heading" className="text-lg font-bold tracking-wide sm:text-xl">
              Join Our Team
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Take the next step in your career with us.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="inverse"
          className="w-full rounded-full md:w-auto"
          onClick={() => scrollToId("apply")}
        >
          Apply Now
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
