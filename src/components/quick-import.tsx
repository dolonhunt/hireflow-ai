"use client";

import { useState } from "react";

interface QuickImportProps {
  onImport?: () => void;
}

export function QuickImport({ onImport }: QuickImportProps) {
  const [rawText, setRawText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    headline: "",
    location: "",
    skills: "",
    notes: "",
  });

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    
    const text = e.target.value.toLowerCase();
    
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = text.match(/(\+?88?1[3-9]\d{9})/);
    const nameMatch = text.match(/^([a-zA-Z\s]+)$/m);
    
    setFormData((prev) => ({
      ...prev,
      email: emailMatch ? emailMatch[1] : prev.email,
      phone: phoneMatch ? phoneMatch[1] : prev.phone,
      name: nameMatch ? nameMatch[1].trim() : prev.name,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Quick import data:", { ...formData, rawText });
    setRawText("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      headline: "",
      location: "",
      skills: "",
      notes: "",
    });
    setShowForm(false);
    onImport?.();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary-strong">Quick Import</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-primary hover:underline"
        >
          {showForm ? "Hide" : "Show"}
        </button>
      </div>
      
      {!showForm ? (
        <textarea
          value={rawText}
          onChange={handlePaste}
          placeholder="Paste any text containing candidate info (email, phone, name, skills, etc.)"
          className="w-full h-32 rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <input
            type="text"
            placeholder="Headline / Current Role"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          
          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
          >
            Quick Import
          </button>
        </form>
      )}
    </div>
  );
}