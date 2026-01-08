import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Input from "./Input";
import TextArea from "./TextArea";
import { useBountyContract } from "@/hooks/useBountyContract";
import useMovementWallet from "@/hooks/useMovementWallet";

export default function LaunchCampaignModal({ onClose, onCreate }) {
  const [loading, setLoading] = useState(false);

  const { account } = useMovementWallet();
  const { createCampaign } = useBountyContract();

  const walletAddress = account?.address?.toString() ?? "";

  const [form, setForm] = useState({
    company: "",
    logo: "",
    title: "",
    reward: "",
    duration: 0,
    category: "",
    difficulty: "Beginner",
    tags: [],
    overview: "",
    objectives: "",
    expectations: "",
    deliverables: "",
    evaluation: [],
    faq: [],
    privyId: "Chand345",
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
      if (!account) {
        alert("Please connect your wallet");
        return;
      }

      setLoading(true);

      // ---------- ON-CHAIN ----------
      const durationSeconds = Number(form.duration) * 7 * 24 * 60 * 60;

      const txHash = await createCampaign(
        { signAndSubmitTransaction: account.signAndSubmitTransaction },
        form.title,
        form.overview,
        parseFloat(form.reward),
        durationSeconds
      );

      // ---------- BACKEND ----------
      const payload = {
        ...form,
        duration: Number(form.duration),
        reward: String(form.reward),
        walletAddress: walletAddress.toLowerCase(),
        blockchainTxHash: txHash,
        onChainCreator: walletAddress,
      };

      const res = await fetch("http://localhost:3001/api/bounty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      onCreate?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between bg-[#181820]">
          <h2 className="text-xl font-bold text-white">
            Launch New Campaign
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Input label="Company" value={form.company} onChange={(v) => update("company", v)} placeholder={undefined} />
          <Input label="Logo URL" value={form.logo} onChange={(v) => update("logo", v)} placeholder={undefined} />
          <Input label="Title" value={form.title} onChange={(v) => update("title", v)} placeholder={undefined} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Reward (MOVE)" value={form.reward} onChange={(v) => update("reward", v)} placeholder={undefined} />
            <Input label="Duration (weeks)" value={form.duration} onChange={(v) => update("duration", v)} placeholder={undefined} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={(v) => update("category", v)} placeholder={undefined} />
            <select
              className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white"
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Senior</option>
              <option>Expert</option>
            </select>
          </div>

          <TextArea label="Overview" value={form.overview} onChange={(v) => update("overview", v)} placeholder={undefined} />
          <TextArea label="Objectives" value={form.objectives} onChange={(v) => update("objectives", v)} placeholder={undefined} />
          <TextArea label="Expectations" value={form.expectations} onChange={(v) => update("expectations", v)} placeholder={undefined} />
          <TextArea label="Deliverables" value={form.deliverables} onChange={(v) => update("deliverables", v)} placeholder={undefined} />

          {["tags", "evaluation", "faq"].map((section) => (
            <div key={section}>
              <label className="text-sm text-gray-400 capitalize">{section}</label>

              {form[section].map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                    value={item}
                    onChange={(e) => updateArrayItem(section, i, e.target.value)}
                  />
                  <button onClick={() => removeArrayItem(section, i)}>-</button>
                </div>
              ))}

              <button
                onClick={() => addArrayItem(section)}
                className="text-indigo-400 text-sm"
              >
                + Add {section.slice(0, -1)}
              </button>
            </div>
          ))}

          <Input label="Email" value={form.email} onChange={(v) => update("email", v)} placeholder={undefined} />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 bg-[#181820] flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Launching..." : "Launch Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
