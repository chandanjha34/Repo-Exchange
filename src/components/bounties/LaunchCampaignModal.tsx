// LaunchCampaignModal.tsx
import React, { useEffect, useState } from "react";
import { X, CheckCircle2, ExternalLink, Calendar, Award } from "lucide-react";
import Input from "./Input";
import TextArea from "./TextArea";
import { useBountyContract } from "@/hooks/useBountyContract";
import useMovementWallet from "@/hooks/useMovementWallet";

export default function LaunchCampaignModal({ onClose, onCreate }) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBounty, setCreatedBounty] = useState<any>(null);

  const { account, signAndSubmitTransaction, connected } = useMovementWallet();
  const { createCampaign } = useBountyContract();

  const walletAddress = account?.address?.toString() ?? "";

  // Calculate default deadline (2 weeks from now)
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  // Get user ID from localStorage
  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('layR_userId') : null;

  const [form, setForm] = useState({
    company: "",
    logo: "",
    title: "",
    reward: "",
    deadline: getDefaultDeadline(),
    category: "",
    difficulty: "Beginner",
    tags: [],
    overview: "",
    objectives: "",
    expectations: "",
    deliverables: "",
    evaluation: [],
    faq: [],
    privyId: storedUserId || `bounty-${Date.now()}`, // Use actual user ID
    walletAddress: walletAddress,
    email: "",
  });

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (walletAddress) {
      setForm((prev) => ({
        ...prev,
        walletAddress,
      }));
    }
  }, [walletAddress]);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateArrayItem = (field, i, value) => {
    const arr = [...form[field]];
    arr[i] = value;
    update(field, arr);
  };

  const addArrayItem = (field) =>
    update(field, [...form[field], ""]);

  const removeArrayItem = (field, i) => {
    const arr = [...form[field]];
    arr.splice(i, 1);
    update(field, arr);
  };

  const handleSubmit = async () => {
    try {
      if (!walletAddress) {
        alert("Please connect your wallet");
        return;
      }

      // Validate required fields
      if (!form.company || !form.title || !form.reward || !form.category ||
        !form.overview || !form.objectives || !form.expectations || !form.deliverables) {
        alert("Please fill in all required fields");
        return;
      }

      setLoading(true);

      let txHash = null;

      // ---------- ON-CHAIN TOKEN LOCKING (REQUIRED) ----------
      // Tokens MUST be locked on-chain before saving to database
      if (!connected || !signAndSubmitTransaction) {
        alert("Please connect your wallet to lock MOVE tokens for this bounty");
        setLoading(false);
        return;
      }

      try {
        const deadlineDate = new Date(form.deadline);
        const durationSeconds = Math.floor((deadlineDate.getTime() - Date.now()) / 1000);

        console.log("[LaunchCampaign] Starting on-chain transaction...");
        console.log("[LaunchCampaign] Connected:", connected);
        console.log("[LaunchCampaign] signAndSubmitTransaction exists:", !!signAndSubmitTransaction);
        console.log("[LaunchCampaign] signAndSubmitTransaction type:", typeof signAndSubmitTransaction);
        console.log("[LaunchCampaign] Form data:", {
          title: form.title,
          overview: form.overview,
          reward: form.reward,
          durationSeconds,
        });

        // Call the contract - wallet popup should appear here
        txHash = await createCampaign(
          signAndSubmitTransaction,
          form.title,
          form.overview,
          parseFloat(form.reward) || 0,
          durationSeconds > 0 ? durationSeconds : 86400
        );
        console.log("[LaunchCampaign] On-chain campaign created, tokens locked:", txHash);
      } catch (chainErr: any) {
        console.error("On-chain creation failed:", chainErr);
        const errorMsg = chainErr?.message || "Transaction failed or was rejected";
        alert(`Failed to lock tokens: ${errorMsg}\n\nPlease ensure you have enough MOVE tokens and try again.`);
        setLoading(false);
        return; // STOP - don't save to DB if on-chain fails
      }

      // ---------- BACKEND ----------
      const payload = {
        ...form,
        duration: 0, // Legacy field
        deadline: form.deadline,
        reward: String(form.reward),
        walletAddress: walletAddress.toLowerCase(),
        blockchainTxHash: txHash || undefined,
        onChainCreator: walletAddress,
      };

      const res = await fetch("http://localhost:3001/api/bounty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      // Show success modal
      setCreatedBounty(data.data);
      setShowSuccess(true);

      onCreate?.(data);
    } catch (err: any) {
      console.error(err);
      alert(err?.error || err?.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-gradient-to-br from-[#0A0F0D] to-[#050A08] border border-emerald-500/30 rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            🎉 Campaign Launched!
          </h2>
          <p className="text-gray-400 mb-6">
            Your bounty <span className="text-emerald-400 font-medium">"{createdBounty?.title}"</span> is now live and accepting submissions.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Reward</span>
              <span className="text-emerald-400 font-semibold">{createdBounty?.reward} MOVE</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              View Bounties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-br from-[#0A0F0D] to-[#050A08] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Launch New Campaign
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Input label="Company *" value={form.company} onChange={(v) => update("company", v)} placeholder="Your company name" />
          <Input label="Logo URL" value={form.logo} onChange={(v) => update("logo", v)} placeholder="https://..." />
          <Input label="Campaign Title *" value={form.title} onChange={(v) => update("title", v)} placeholder="Build a DeFi Dashboard" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Reward (MOVE) *" value={form.reward} onChange={(v) => update("reward", v)} placeholder="100" />

            {/* Deadline Date Picker */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deadline *
              </label>
              <input
                type="datetime-local"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Category *" value={form.category} onChange={(v) => update("category", v)} placeholder="DeFi, NFT, Gaming..." />
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Difficulty *</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={form.difficulty}
                onChange={(e) => update("difficulty", e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <TextArea label="Overview *" value={form.overview} onChange={(v) => update("overview", v)} placeholder="Describe what this bounty is about..." />
          <TextArea label="Objectives *" value={form.objectives} onChange={(v) => update("objectives", v)} placeholder="What should participants achieve?" />
          <TextArea label="Expectations *" value={form.expectations} onChange={(v) => update("expectations", v)} placeholder="What are the requirements?" />
          <TextArea label="Deliverables *" value={form.deliverables} onChange={(v) => update("deliverables", v)} placeholder="What should be submitted?" />

          {["tags", "evaluation", "faq"].map((section) => (
            <div key={section}>
              <label className="text-sm text-gray-400 capitalize">{section}</label>

              {form[section].map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={item}
                    onChange={(e) => updateArrayItem(section, i, e.target.value)}
                  />
                  <button onClick={() => removeArrayItem(section, i)} className="text-red-400 hover:text-red-300">-</button>
                </div>
              ))}

              <button
                onClick={() => addArrayItem(section)}
                className="text-emerald-400 text-sm hover:text-emerald-300"
              >
                + Add {section.slice(0, -1)}
              </button>
            </div>
          ))}

          <Input label="Contact Email" value={form.email} onChange={(v) => update("email", v)} placeholder="your@email.com" />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-xl">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            {loading ? "Launching..." : "🚀 Launch Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
