import { PageIntro, Panel, SectionHeading } from "@/components/ui";
import { getStore } from "@/lib/store";
import { getSupabaseStatus } from "@/lib/supabase";

const memoryFiles = [
  "memory/product.md",
  "memory/industry-context.md",
  "memory/architecture.md",
  "memory/data-model.md",
  "memory/sourcing-policy.md",
  "memory/roadmap.md",
  "memory/change-log.md",
];

export default async function SettingsPage() {
  const store = await getStore();
  const supabaseStatus = getSupabaseStatus();

  return (
    <>
      <PageIntro
        eyebrow="Settings"
        title="Workspace configuration"
        description="Environment status, persistence mode, sourcing guardrails, and long-term memory files all live here."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <SectionHeading eyebrow="Environment" title="Backend status" description="The app will use Supabase Postgres when configured and keep a local fallback for resilience." />
          <div className="space-y-3 text-sm text-text-soft">
            <p>Workspace: <span className="font-semibold text-primary-strong">{store.meta.workspaceLabel}</span></p>
            <p>Supabase client configured: <span className="font-semibold text-primary-strong">{supabaseStatus.configured ? "Yes" : "No"}</span></p>
            <p>Service role configured: <span className="font-semibold text-primary-strong">{supabaseStatus.serviceRoleConfigured ? "Yes" : "No"}</span></p>
            <p>Database URL configured: <span className="font-semibold text-primary-strong">{process.env.DATABASE_URL ? "Yes" : "No"}</span></p>
          </div>
        </Panel>

        <Panel>
          <SectionHeading eyebrow="Guardrails" title="Sourcing policy" description="The app is opinionated so future updates stay compliant." />
          <ul className="space-y-3 text-sm text-text-soft">
            <li>Manual social lead capture only for LinkedIn and Facebook.</li>
            <li>Approved automation limited to CVs, forms, CSVs, GitHub public fields, and public websites.</li>
            <li>Contact provenance stays attached to each email or phone record.</li>
            <li>Outreach is template-driven and manually controlled in v1.</li>
          </ul>
        </Panel>
      </div>

      <Panel className="mt-5">
        <SectionHeading eyebrow="Project memory" title="Structured memory files" description="These docs are stored alongside the app so future changes can build on the same context." />
        <div className="grid gap-3 md:grid-cols-2">
          {memoryFiles.map((file) => (
            <div key={file} className="rounded-[22px] border border-border bg-surface px-4 py-4 font-mono text-sm text-primary-strong">
              {file}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
