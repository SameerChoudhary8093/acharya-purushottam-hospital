import { LoaderCircle } from "lucide-react";
import FadeIn from "./FadeIn";
import Button from "./Button";
import { formatExperience } from "../utils/experience";
import { scrollToId } from "../utils/scroll";

export default function JobListings({ jobs, loading, error, onApply, onRetry }) {
  return (
    <section id="positions" className="scroll-mt-28 bg-wash py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            Open Positions
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-body">
            Current openings at Acharya Purushottam Hospital & Medical College.
          </p>
        </FadeIn>

        <div className="mt-10">
          {loading && (
            <div
              className="flex items-center justify-center gap-3 rounded-xl bg-white py-16 text-navy"
              role="status"
            >
              <LoaderCircle className="animate-spin" size={22} aria-hidden="true" />
              <span>Loading open positions…</span>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl bg-white px-6 py-12 text-center" role="alert">
              <p className="text-lg font-bold text-navy">Something went wrong</p>
              <p className="mt-2 text-sm text-body">
                We couldn&apos;t load open positions right now. Please try again.
              </p>
              <Button type="button" className="mt-6" onClick={onRetry}>
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="rounded-xl bg-white px-6 py-14 text-center">
              <p className="text-lg font-bold text-navy">No current openings</p>
              <p className="mt-2 text-sm text-body">
                Please check back soon for new opportunities.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-6"
                onClick={() => scrollToId("apply")}
              >
                Submit a general application
              </Button>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-xl bg-white shadow-[0_6px_24px_rgba(0,45,98,0.06)] md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Active job openings</caption>
                  <thead className="bg-navy text-white">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Position
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Department
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Experience
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        Location
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">
                        <span className="sr-only">Action</span>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-semibold text-navy">{job.title}</td>
                        <td className="px-5 py-4 text-body">{job.department}</td>
                        <td className="px-5 py-4 text-body">
                          {formatExperience(job.experience_min, job.experience_max)}
                        </td>
                        <td className="px-5 py-4 text-body">{job.location || "Jaipur"}</td>
                        <td className="px-5 py-4">
                          <Button
                            type="button"
                            className="px-4 py-2 text-xs"
                            onClick={() => onApply(job)}
                          >
                            Apply
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="grid gap-4 md:hidden">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-xl bg-white p-5 shadow-[0_6px_20px_rgba(0,45,98,0.06)]"
                  >
                    <h3 className="font-bold text-navy">{job.title}</h3>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-muted">Department</dt>
                        <dd className="font-medium text-navy">{job.department}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Experience</dt>
                        <dd className="font-medium text-navy">
                          {formatExperience(job.experience_min, job.experience_max)}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted">Location</dt>
                        <dd className="font-medium text-navy">{job.location || "Jaipur"}</dd>
                      </div>
                    </dl>
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={() => onApply(job)}
                    >
                      Apply
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
