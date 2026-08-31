import { useCallback, useEffect, useState } from "react";
import Hero from "../components/Hero";
import Highlights from "../components/Highlights";
import About from "../components/About";
import WhyJoinUs from "../components/WhyJoinUs";
import CareerCategories from "../components/CareerCategories";
import JobListings from "../components/JobListings";
import CtaBanner from "../components/CtaBanner";
import ApplicationForm from "../components/ApplicationForm";
import LocationContact from "../components/LocationContact";
import { getJobs } from "../services/api";
import { scrollToId } from "../utils/scroll";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch {
      setError(true);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function handleApply(job) {
    setSelectedJob(job);
    scrollToId("apply");
  }

  return (
    <main id="main">
      <Hero />
      <Highlights />
      <About />
      <WhyJoinUs />
      <CareerCategories />
      <JobListings
        jobs={jobs}
        loading={loading}
        error={error}
        onApply={handleApply}
        onRetry={loadJobs}
      />
      <CtaBanner />
      <ApplicationForm
        jobs={jobs}
        selectedJob={selectedJob}
        onConsumedSelection={() => setSelectedJob(null)}
      />
      <LocationContact />
    </main>
  );
}
