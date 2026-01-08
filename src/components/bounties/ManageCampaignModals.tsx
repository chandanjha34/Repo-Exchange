import React, { useEffect, useState } from "react";
import { X, Eye, Edit3 } from "lucide-react";
import SubmissionDetailsModal from "./SubmitProjectModal";

const OWNER_WALLET =
  "0x40a2387ea575b5e503d089e96bd69e49849cc121ed118970d8dd0b4f8954a947";

export default function ManageCampaignModal({ bounty, onClose }) {
  const [activeTab, setActiveTab] = useState("submissions");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (!bounty) return;

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/bounty/submissions?bountyId=${bounty.id}&walletAddress=${OWNER_WALLET}`
        );

        const json = await res.json();
        if (json?.data) setSubmissions(json.data);
      } catch (err) {
        console.error("Failed to load submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [bounty]);

  if (!bounty) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between bg-[#181820]">
            <div>
              <h2 className="text-xl font-bold">Manage Campaign</h2>
              <p className="text-sm text-gray-400">{bounty.title}</p>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-white/5 flex gap-6">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`pb-3 border-b-2 ${
                activeTab === "submissions"
                  ? "text-indigo-400 border-indigo-500"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Submissions ({submissions.length})
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`pb-3 border-b-2 ${
                activeTab === "edit"
                  ? "text-indigo-400 border-indigo-500"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Edit Campaign
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0f]">
            {activeTab === "submissions" && (
              <>
                {loading ? (
                  <p className="text-gray-400">Loading submissions...</p>
                ) : submissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-20">
                    No submissions yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="bg-[#13131a] border border-white/5 p-4 rounded-xl flex justify-between hover:border-white/10"
                      >
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">
                            {sub.TeamName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{sub.TeamName}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(sub.createdAt).toDateString()}
                            </p>
                            <a
                              href={sub.RepositoryLink}
                              target="_blank"
                              className="text-xs text-indigo-400 hover:underline"
                            >
                              View Repo
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {sub.status}
                          </span>
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-2 hover:bg-white/10 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "edit" && (
              <div className="text-center py-20 text-gray-500">
                <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Edit campaign form goes here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedSubmission && (
        <SubmissionDetailsModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  );
}
