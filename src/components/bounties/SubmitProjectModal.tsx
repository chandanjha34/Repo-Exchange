import React, { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";

export default function SubmitProjectModal({ onClose, bountyId, wallet }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    TeamName: "",
    TeamMembers: "",
    BountyId: bountyId || "",
    walletAddress: wallet || "",
    RepositoryLink: "",
    LiveDemoURL: "",
    ProductOverview: "",
    TechnicalArchitecture: "",
    HiringDemand: "",
    github: "",
    linkedin: "",
    twitter: "",
    website: "",
    other: "",
    status: "submitted"
  });

  const update = (f, v) => setForm({ ...form, [f]: v });

  const submit = async () => {
    setMsg("");

    // Basic validation
    for (let key in form) {
      if (!form[key]) return setMsg(`${key} is required`);
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3001/api/bounty/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      setMsg("✅ Submission successful!");
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0b0b12] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#141423]">
          <h2 className="text-xl font-bold text-white">Submit Your Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Team Section */}
          <Section title="Team Information">
            <Input label="Team Name" value={form.TeamName} onChange={e => update("TeamName", e.target.value)} />
            <Input label="Team Members" placeholder="Comma separated" value={form.TeamMembers} onChange={e => update("TeamMembers", e.target.value)} />
          </Section>

          {/* Links */}
          <Section title="Project Links">
            <Input label="Repository URL" value={form.RepositoryLink} onChange={e => update("RepositoryLink", e.target.value)} />
            <Input label="Live Demo URL" value={form.LiveDemoURL} onChange={e => update("LiveDemoURL", e.target.value)} />
          </Section>

          {/* Description */}
          <Section title="Project Details">
            <Text label="Product Overview" value={form.ProductOverview} onChange={e => update("ProductOverview", e.target.value)} />
            <Text label="Technical Architecture" value={form.TechnicalArchitecture} onChange={e => update("TechnicalArchitecture", e.target.value)} />
            <Text label="Hiring / Contract Interest" value={form.HiringDemand} onChange={e => update("HiringDemand", e.target.value)} />
          </Section>

          {/* Socials */}
          <Section title="Team Profiles">
            <Input label="GitHub" value={form.github} onChange={e => update("github", e.target.value)} />
            <Input label="LinkedIn" value={form.linkedin} onChange={e => update("linkedin", e.target.value)} />
            <Input label="Twitter" value={form.twitter} onChange={e => update("twitter", e.target.value)} />
            <Input label="Website" value={form.website} onChange={e => update("website", e.target.value)} />
            <Input label="Other Links" value={form.other} onChange={e => update("other", e.target.value)} />
          </Section>

          {msg && <p className="text-sm text-center text-gray-300">{msg}</p>}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#141423]">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            Submit Project
          </button>
        </div>

      </div>
    </div>
  );
}

/* Reusable Components */

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-gray-300 text-sm">{label}</label>
      <input
        {...props}
        className="w-full mt-1 px-3 py-2 bg-[#0e0e16] border border-white/10 rounded-xl text-white outline-none focus:border-green-500"
      />
    </div>
  );
}

function Text({ label, ...props }) {
  return (
    <div className="col-span-2">
      <label className="text-gray-300 text-sm">{label}</label>
      <textarea
        rows={4}
        {...props}
        className="w-full mt-1 px-3 py-2 bg-[#0e0e16] border border-white/10 rounded-xl text-white outline-none focus:border-green-500"
      />
    </div>
  );
}
