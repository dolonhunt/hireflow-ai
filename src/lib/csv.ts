import Papa from "papaparse";

export interface ParsedCandidateRow {
  name: string;
  headline: string;
  location: string;
  email?: string;
  phone?: string;
  skills: string[];
  sourceUrl?: string;
}

function splitSkills(value: string) {
  return value
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCandidateCsv(input: string) {
  const parsed = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row) => ({
      name: row.name ?? row.Name ?? "",
      headline: row.headline ?? row.Headline ?? row.title ?? "",
      location: row.location ?? row.Location ?? "Dhaka",
      email: row.email ?? row.Email ?? "",
      phone: row.phone ?? row.Phone ?? "",
      skills: splitSkills(row.skills ?? row.Skills ?? ""),
      sourceUrl: row.sourceUrl ?? row.SourceUrl ?? row.linkedin ?? row.portfolio ?? "",
    }))
    .filter((row) => row.name.trim().length > 0);
}

export function buildCandidatesCsv(rows: ParsedCandidateRow[]) {
  return Papa.unparse(
    rows.map((row) => ({
      Name: row.name,
      Headline: row.headline,
      Location: row.location,
      Email: row.email ?? "",
      Phone: row.phone ?? "",
      Skills: row.skills.join("; "),
      SourceUrl: row.sourceUrl ?? "",
    })),
  );
}
