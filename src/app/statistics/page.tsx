import { PageHeader } from "@/components/ui";
import { StatsLab } from "@/components/StatsLab";

export default function StatisticsPage() {
  return (
    <div className="pb-10">
      <PageHeader
        badge="Modules I · VI · VII"
        title="Statistics lab"
        description="Descriptive statistics, fitted probability distributions and formal hypothesis tests — including a live t-test you can run on any two genres."
      />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <StatsLab />
      </div>
    </div>
  );
}
