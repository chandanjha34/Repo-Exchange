import React, { useEffect, useState } from "react";
import { X, Eye, Edit3, Trophy, CheckCircle } from "lucide-react";
import SubmissionDetailsModal from "./SubmissionDetailsModal";
import { useBountyContract } from "@/hooks/useBountyContract";
import useMovementWallet from "@/hooks/useMovementWallet";

export default function ManageCampaignModal({ bounty, onClose }) {
  const [activeTab, setActiveTab] = useState("submissions");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [selectedWinners, setSelectedWinners] = useState([]);
  const [rewardAmounts, setRewardAmounts] = useState({});
  const [distributing, setDistributing] = useState(false);

  const { account } = useMovementWallet();
  const { distributeRewards, loading: contractLoading, error: contractError } =
    useBountyContract();

  const walletAddress = account?.address?.toString() ?? null;
  const bountyReward = parseFloat(bounty?.reward || "0");

  /* ---------------- Fetch submissions ---------------- */
  useEffect(() => {
    if (!bounty || !walletAddress) return;

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/bounty/submissions/${bounty.id}/${walletAddress}`
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
  }, [bounty, walletAddress]);

  /* ---------------- Winner selection ---------------- */
  const toggleWinner = (wallet) => {
    setSelectedWinners((prev) =>
      prev.includes(wallet)
        ? prev.filter((w) => w !== wallet)
        : [...prev, wallet]
    );
  };

  const updateRewardAmount = (wallet, amount) => {
    setRewardAmounts((prev) => ({ ...prev, [wallet]: amount }));
  };

  const totalRewardSelected = selectedWinners.reduce(
    (sum, w) => sum + (rewardAmounts[w] || 0),
    0
  );

  /* ---------------- Distribute rewards ---------------- */
  const handleDistributeRewards = async () => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    if (!selectedWinners.length) {
      alert("Select at least one winner");
      return;
    }

    if (totalRewardSelected > bountyReward) {
      alert("Total rewards exceed bounty pool");
      return;
    }

    try {
      setDistributing(true);

      const amounts = selectedWinners.map((w) => rewardAmounts[w]);

      const wallet = { signAndSubmitTransaction: account.signAndSubmitTransaction };

      const txHash = await distributeRewards(
        wallet,
        selectedWinners,
        amounts
      );

      alert(`✅ Rewards distributed\nTx: ${txHash}`);
    } catch (err) {
      console.error(err);
      alert("Reward distribution failed");
    } finally {
      setDistributing(false);
    }
  };

  if (!bounty) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        <div className="relative bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="p-6 border-b border-white/10 flex justify-between bg-[#181820]">
            <div>
              <h2 className="text-xl font-bold">Manage Campaign</h2>
              <p className="text-sm text-gray-400">{bounty.title}</p>
              <p className="text-xs text-indigo-400">
                Total Reward: {bounty.reward} MOVE
              </p>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* TABS */}
          <div className="px-6 pt-4 border-b border-white/5 flex gap-6">
            {["submissions", "edit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 capitalize ${
                  activeTab === tab
                    ? "text-indigo-400 border-indigo-500"
                    : "text-gray-400 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0f]">
            {activeTab === "submissions" && (
              <>
                {loading ? (
                  <p className="text-gray-400">Loading submissions…</p>
                ) : submissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-20">
                    No submissions yet
                  </p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {submissions.map((sub) => {
                        const isSelected = selectedWinners.includes(
                          sub.userWallet
                        );

                        return (
                          <div
                            key={sub._id}
                            className={`bg-[#13131a] border rounded-xl p-4 ${
                              isSelected
                                ? "border-indigo-500"
                                : "border-white/5"
                            }`}
                          >
                            <div className="flex justify-between gap-4">
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">
                                  {sub.TeamName?.charAt(0)}
                                </div>

                                <div>
                                  <h4 className="font-semibold">
                                    {sub.TeamName}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(sub.createdAt).toDateString()}
                                  </p>
                                  <a
                                    href={sub.RepositoryLink}
                                    target="_blank"
                                    className="text-xs text-indigo-400"
                                  >
                                    View Repo
                                  </a>

                                  {isSelected && (
                                    <input
                                      type="number"
                                      className="mt-2 bg-[#0a0a0f] border border-white/10 rounded px-3 py-1 text-sm w-40"
                                      placeholder="MOVE amount"
                                      onChange={(e) =>
                                        updateRewardAmount(
                                          sub.userWallet,
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    toggleWinner(sub.userWallet)
                                  }
                                  className={`p-2 rounded-lg ${
                                    isSelected
                                      ? "bg-indigo-500 text-white"
                                      : "hover:bg-white/10 text-gray-400"
                                  }`}
                                >
                                  {isSelected ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <Trophy className="w-5 h-5" />
                                  )}
                                </button>

                                <button
                                  onClick={() =>
                                    setSelectedSubmission(sub)
                                  }
                                  className="p-2 hover:bg-white/10 rounded-lg"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DISTRIBUTION FOOTER */}
                    {selectedWinners.length > 0 && (
                      <div className="sticky bottom-0 mt-6 bg-[#181820] p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between mb-4">
                          <p>{selectedWinners.length} winner(s)</p>
                          <p
                            className={`font-bold ${
                              totalRewardSelected > bountyReward
                                ? "text-red-500"
                                : "text-green-400"
                            }`}
                          >
                            {totalRewardSelected} / {bounty.reward} MOVE
                          </p>
                        </div>

                        <button
                          disabled={
                            distributing ||
                            contractLoading ||
                            totalRewardSelected > bountyReward
                          }
                          onClick={handleDistributeRewards}
                          className="w-full bg-indigo-600 py-3 rounded-xl text-white"
                        >
                          {distributing
                            ? "Distributing..."
                            : "Distribute Rewards On-Chain"}
                        </button>

                        {contractError && (
                          <p className="text-red-400 text-sm mt-2">
                            {contractError}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "edit" && (
              <div className="text-center py-20 text-gray-500">
                <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Edit campaign form goes here
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSubmission && (
        <SubmissionDetailsModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </>
  );
}
