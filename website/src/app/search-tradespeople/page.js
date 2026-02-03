"use client";
import TradespersonSearch from "@/components/TradespersonSearch";
import { useRouter } from "next/navigation";

export default function SearchTradespeoplePage() {
  const router = useRouter();

  const handleCancelJob = () => {
    router.push("/");
  };

  const handleReturnToJob = () => {
    router.push("/create-job");
  };

  return (
    <TradespersonSearch
      onCancel={handleCancelJob}
      onReturnToJob={handleReturnToJob}
    />
  );
}