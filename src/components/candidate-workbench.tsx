"use client";

import { useDeferredValue, useState } from "react";
import { Badge, Panel, SectionHeading } from "@/components/ui";

type CandidateRow = {
  id: string;
  name: string;
  headline: string;
  location: string;
  roleFamily: string;
  score: number;
  recommendedNextAction: string;
  contact?: string;
  skills: string[];
};

export function CandidateWorkbench({ rows }: { rows: CandidateRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const filteredRows = rows.filter((row) => {
    const matchesQuery =
      !deferredQuery ||
      [row.name, row.headline, row.location, row.skills.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || row.roleFamily === roleFilter;
    return matchesQuery && matchesRole;
  });

  const roleOptions = ["all", ...Array.from(new Set(rows.map((row) => row.roleFamily)))];

  return (
    <Panel>
      <SectionHeading
        eyebrow="Searchable pool"
        title="Candidate workbench"
        description="Filter the real pool by role family, keywords, and score. This list is driven by local persisted data, not demo-only placeholders."
      />

      <div className="mb-5 grid gap-3 md:grid-cols-[2fr_1fr]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, headline, location, or skill"
          className="rounded-2xl border border-border bg-surface px-4 py-3 outline-none ring-0 placeholder:text-text-soft/80 focus:border-primary"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-2xl border border-border bg-surface px-4 py-3 outline-none focus:border-primary"
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All role families" : option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredRows.map((row) => (
          <article key={row.id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-primary-strong">{row.name}</h3>
                  <Badge>{row.roleFamily}</Badge>
                  <Badge tone={row.score >= 80 ? "success" : row.score >= 65 ? "accent" : "default"}>{row.score}% match</Badge>
                </div>
                <p className="mt-1 text-sm text-text-soft">{row.headline}</p>
                <p className="mt-2 text-sm text-primary-strong">{row.location}</p>
              </div>
              <div className="max-w-sm text-sm text-text-soft">
                <p>{row.recommendedNextAction}</p>
                {row.contact ? <p className="mt-1 font-medium text-primary-strong">{row.contact}</p> : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {row.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </article>
        ))}
        {!filteredRows.length ? (
          <div className="rounded-[22px] border border-dashed border-border-strong bg-surface-muted/60 px-4 py-8 text-center text-sm text-text-soft">
            No candidates matched the current filters.
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
