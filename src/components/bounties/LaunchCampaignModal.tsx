import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import Input from "./Input";
import TextArea from "./TextArea";

export default function LaunchCampaignModal({ onClose, onCreate }) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    logo: "",
    title: "",
    reward: "",              // string
    duration: 0,             // number
    category: "",
    difficulty: "Beginner",
    tags: [],                // string[]
    overview: "",
    objectives: "",          // string
    expectations: "",        // string
    deliverables: "",        // string
    evaluation: [],          // string[]
    faq: [],                 // string[]
    privyId: "",
    walletAddress: "",
    email: "",
  });

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

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
      setLoading(true);

      const payload = {
        ...form,
        duration: Number(form.duration),
        walletAddress: form.walletAddress.toLowerCase(),
      };

      console.log("Submitting payload:", payload);

      const res = await fetch("http://localhost:3001/api/bounty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw data;

      onCreate?.(data);
      onClose();

    } catch (err) {
      console.error(err);
      alert(err?.error || "Error creating bounty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>

      <div className="relative bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#181820]">
          <h2 className="text-xl font-bold text-white">Launch New Campaign</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <Input label="Company" value={form.company} onChange={v => update("company", v)} placeholder={undefined}/>
          <Input label="Logo URL" value={form.logo} onChange={v => update("logo", v)} placeholder={undefined}/>
          <Input label="Title" value={form.title} onChange={v => update("title", v)} placeholder={undefined}/>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Reward (string)" value={form.reward} onChange={v => update("reward", v)} placeholder={undefined}/>
            <Input label="Duration (weeks)" value={form.duration} onChange={v => update("duration", v)} placeholder={undefined}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={v => update("category", v)} placeholder={undefined}/>
            <select
              className="bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white"
              value={form.difficulty}
              onChange={e=>update("difficulty",e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Senior</option>
              <option>Expert</option>
            </select>
          </div>

          <TextArea label="Overview" value={form.overview} onChange={v => update("overview", v)} placeholder={undefined}/>

          <TextArea label="Objectives" value={form.objectives} onChange={v => update("objectives", v)} placeholder={undefined}/>
          <TextArea label="Expectations" value={form.expectations} onChange={v => update("expectations", v)} placeholder={undefined}/>
          <TextArea label="Deliverables" value={form.deliverables} onChange={v => update("deliverables", v)} placeholder={undefined}/>

          {/* ARRAY FIELDS */}
          {["tags","evaluation","faq"].map(section => (
            <div key={section}>
              <label className="text-sm text-gray-400 capitalize">{section}</label>

              {form[section].map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                    value={item}
                    onChange={e=>updateArrayItem(section,i,e.target.value)}
                  />
                  <button onClick={()=>removeArrayItem(section,i)}>-</button>
                </div>
              ))}

              <button onClick={()=>addArrayItem(section)} className="text-indigo-400 text-sm">
                + Add {section.slice(0,-1)}
              </button>
            </div>
          ))}

          <Input label="Privy ID" value={form.privyId} onChange={v => update("privyId", v)} placeholder={undefined}/>
          <Input label="Wallet Address" value={form.walletAddress} onChange={v => update("walletAddress", v)} placeholder={undefined}/>
          <Input label="Email" value={form.email} onChange={v => update("email", v)} placeholder={undefined}/>

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
