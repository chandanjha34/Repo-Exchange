import React from "react";
import { X } from "lucide-react";

export default function SubmissionDetailsModal({ submission, onClose }) {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#13131a] border border-white/10 
                      rounded-2xl w-full max-w-4xl max-h-[90vh] 
                      flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#181820]">
          <div>
            <h2 className="text-xl font-bold text-white">
              {submission.TeamName}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Submission Details
            </p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">

          {/* Meta Info */}
          <Section title="General Information">
            <KeyValue label="Status" value={submission.status} />
            <KeyValue
              label="Submitted On"
              value={new Date(submission.createdAt).toDateString()}
            />
            <KeyValue label="Wallet Address" value={submission.walletAddress} />
          </Section>

          {/* Links */}
          <Section title="Links">
            <LinkItem label="Repository" url={submission.RepositoryLink} />
            <LinkItem label="Live Demo" url={submission.LiveDemoURL} />
            <LinkItem label="GitHub" url={submission.github} />
            <LinkItem label="LinkedIn" url={submission.linkedin} />
            <LinkItem label="Twitter" url={submission.twitter} />
            <LinkItem label="Website" url={submission.website} />
            <LinkItem label="Other" url={submission.other} />
          </Section>

          {/* Team */}
          <Section title="Team">
            <p className="text-gray-300">
              {submission.TeamMembers?.join(", ")}
            </p>
          </Section>

          {/* Content Blocks */}
          <Section title="Product Overview">
            <Paragraph text={submission.ProductOverview} />
          </Section>

          <Section title="Technical Architecture">
            <Paragraph text={submission.TechnicalArchitecture} />
          </Section>

          <Section title="Hiring Demand">
            <Paragraph text={submission.HiringDemand} />
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-indigo-400 font-semibold mb-2">{title}</h3>
      <div className="bg-[#0a0a0f] border border-white/5 rounded-xl p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="flex flex-col md:flex-row md:gap-4">
      <span className="text-gray-500 min-w-[140px]">{label}</span>
      <span className="text-gray-300 break-all">{value}</span>
    </div>
  );
}

function LinkItem({ label, url }) {
  if (!url) return null;
  return (
    <div className="flex flex-col md:flex-row md:gap-4">
      <span className="text-gray-500 min-w-[140px]">{label}</span>
      <a
        href={url.startsWith("http") ? url : `https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:underline break-all"
      >
        {url}
      </a>
    </div>
  );
}

function Paragraph({ text }) {
  return (
    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  );
}
