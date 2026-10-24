import { useCallback, useEffect, useState } from "react";
import Hero from "../components/Hero";
import CareerCategories from "../components/CareerCategories";
import Eligibility from "../components/Eligibility";
import ApplicationForm from "../components/ApplicationForm";
import LocationContact from "../components/LocationContact";
import { getJobs } from "../services/api";
import { scrollToId } from "../utils/scroll";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  function handleApply(category) {
    setSelectedCategory({ ...category });
    scrollToId("apply");
  }

  return (
    <main id="main" className="recruitment-page">
      <Hero />
      <CareerCategories onApply={handleApply} />
      <Eligibility />
      <ApplicationForm
        jobs={jobs}
        loading={loading}
        catalogError={error ? "Department information is temporarily unavailable. You can still complete the application; please retry if submission is unavailable." : ""}
        onRetry={loadJobs}
        selectedCategory={selectedCategory}
        onConsumedSelection={() => setSelectedCategory(null)}
      />
      <LocationContact />
    </main>
  );
}
