import { Sparkles } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { PageHeader, Panel } from "@/components/ui";

export default function AnalystPage() {
  return (
    <div className="pb-10">
      <PageHeader
        badge="AI integration"
        title="AI analyst"
        description="A large-language-model tutor that knows this entire project. Ask it to explain any result, test or model — powered by DeepSeek V4.1 Flash through OpenCode Go."
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-4 sm:px-6">
        <ChatPanel />
        <Panel className="border-imdb/20">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-imdb" /> How this works
          </h3>
          <div className="mt-3 grid gap-4 text-xs leading-relaxed text-muted md:grid-cols-3">
            <p>
              <span className="text-white">1. You ask a question.</span> The browser sends it to a
              secure Next.js API route — the API key never reaches the client.
            </p>
            <p>
              <span className="text-white">2. Context is injected.</span> The route adds the
              project&apos;s real results (correlations, p-values, R², model scores) as context.
            </p>
            <p>
              <span className="text-white">3. The model answers.</span> DeepSeek V4.1 Flash replies
              in exam-ready language, grounded in the actual numbers.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
