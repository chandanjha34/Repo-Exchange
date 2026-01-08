import { X } from "lucide-react";

export default function SubmissionDetailsModal({ submission, onClose }) {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#13131a] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{submission.TeamName}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <Section title="Team Members" value={submission.TeamMembers.join(", ")} />
        <Section title="Product Overview" value={submission.ProductOverview} />
        <Section title="Technical Architecture" value={submission.TechnicalArchitecture} />
        <Section title="Hiring Demand" value={submission.HiringDemand} />

        <Section title="Repository" link={submission.RepositoryLink} />
        <Section title="Live Demo" link={submission.LiveDemoURL} />

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Social label="GitHub" value={submission.github} />
          <Social label="LinkedIn" value={submission.linkedin} />
          <Social label="Twitter" value={submission.twitter} />
          <Social label="Website" value={submission.website} />
        </div>

        {submission.other && (
          <Section title="Other Notes" value={submission.other} />
        )}
      </div>
    </div>
  );
}

function Section({ title, value, link }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm text-gray-400 mb-1">{title}</h4>
      {link ? (
        <a
          href={link}
          target="_blank"
          className="text-indigo-400 hover:underline break-all"
        >
          {link}
        </a>
      ) : (
        <p className="text-gray-200 whitespace-pre-line">{value}</p>
      )}
    </div>
  );
}

function Social({ label, value }) {
  return (
    <a
      href={value}
      target="_blank"
      className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition"
    >
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-indigo-400 truncate">{value}</p>
    </a>
  );
}
