import { PageHeader } from "@/components/ui";
import { Explorer } from "@/components/Explorer";

export default function ExplorePage() {
  return (
    <div className="pb-10">
      <PageHeader
        badge="Module I · Exploratory analysis"
        title="Explore the data"
        description="Filter the 1,000 top-rated films by genre, year, rating and text, then watch every chart update instantly. Hover any point to inspect it."
      />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <Explorer />
      </div>
    </div>
  );
}
