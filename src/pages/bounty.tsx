import React, { useEffect, useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import BountyCard from "../components/bounties/BountyCard";
import BountyModal from "../components/bounties/BountyModal";
import SubmitProjectModal from "../components/bounties/SubmitProjectModal";
import LaunchCampaignModal from "../components/bounties/LaunchCampaignModal";
import ManageCampaignModal from "../components/bounties/ManageCampaignModals";
import { Header } from "@/components/layout";
import useMovementWallet from "@/hooks/useMovementWallet";


export default function BountiesPage() {
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);
  const [managedBounty, setManagedBounty] = useState(null);
  const [viewMode, setViewMode] = useState("explore"); // "explore" or "my-campaigns"
  const { account } = useMovementWallet();

  // Get address as string
  const address = account?.address?.toString() ?? null;
  // Mock Data
const initialBounties = [
  
  ];
  const walletAddress = "0x1234...abcd"; // Replace with actual wallet logic
  
  const [bounties, setBounties] = useState(initialBounties);

  const handleCreateCampaign = (newCampaign) => {
    const newId = bounties.length + 1;
    const campaignObj = {
        id: newId,
        company: "My Company", // Default for demo
        logo: "M",
        color: "from-indigo-500 to-purple-500",
        ...newCampaign,
        applicants: 0,
        tags: ["New"],
        ownerId: "user-123" // Current user ID
    };
    setBounties([campaignObj, ...bounties]);
    setViewMode("my-campaigns"); // Switch to my campaigns view
  };

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/bounty");
      
        if (!res.ok) {
          throw new Error("Failed to fetch bounties");
        }
      
        const json = await res.json();
      
        if (!json?.data) return;
      
        // Map backend → UI format
const mapped = json.data.map((b) => ({
  id: b._id,
  company: b.company,
  logo: b.logo,
  title: b.title,
  reward: b.reward,
  duration: `${b.duration} Weeks`,
  applicants: 0,
  difficulty: b.difficulty,
  category: b.category,
  tags: b.tags,
  overview: b.overview,
  objective: b.objectives,
  expectations: [b.expectations],
  deliverables: [b.deliverables],
  evaluation: b.evaluation,
  prize: b.reward,
  ownership: "N/A",
  ownerWallet: b.walletAddress?.toLowerCase(),
  color: "from-indigo-500 to-purple-500",
}));

      
        setBounties(mapped);
      
      } catch (err) {
        console.error(err);
      
        // fallback to demo data if needed
        setBounties(initialBounties);
      }
    };
  
    loadCampaigns();
  }, []);


  const filteredBounties =
  viewMode === "explore"
    ? bounties
    : bounties.filter(
        (b) =>
          b.ownerWallet === address?.toLowerCase()
      );


  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-indigo-500/30">
        <Header />
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                {viewMode === "explore" ? "Explore Bounties" : "My Campaigns"}
              </h1>
              <p className="text-gray-400 mt-4 max-w-2xl text-lg leading-relaxed">
                {viewMode === "explore" 
                    ? "Contribute to world-class engineering challenges. Ship real products, get paid in crypto."
                    : "Manage your active campaigns, review submissions, and find your next star engineer."}
              </p>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => setShowLaunch(true)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Launch Campaign
                </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-10 border-b border-white/10 flex gap-8">
              <button 
                onClick={() => setViewMode("explore")}
                className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${viewMode === "explore" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
              >
                Explore All
              </button>
              <button 
                onClick={() => setViewMode("my-campaigns")}
                className={`pb-4 px-2 font-medium text-sm transition-all border-b-2 ${viewMode === "my-campaigns" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"}`}
              >
                My Campaigns
              </button>
          </div>

          {/* Search Bar (Only for Explore mode usually, but useful for both) */}
          <div className="mt-8 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search bounties..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all hover:bg-white/10"
              />
            </div>
            <button className="px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2 font-medium">
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>
        </header>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredBounties.length > 0 ? (
              filteredBounties.map((bounty) => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  isOwner={viewMode === "my-campaigns"} // Pass owner flag
                  onOpen={() => setSelectedBounty(bounty)}
                  onManage={() => setManagedBounty(bounty)} // Open management modal
                />
              ))
          ) : (
             <div className="col-span-2 text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-400 text-lg">No Campaigns found.</p>
                {viewMode === "my-campaigns" && (
                    <button onClick={() => setShowLaunch(true)} className="mt-4 text-indigo-400 font-medium hover:underline">
                        Launch your first campaign &rarr;
                    </button>
                )}
             </div>
          )}
        </div>

        {/* Modals */}
        {selectedBounty && (
          <BountyModal
            bounty={selectedBounty}
            onClose={() => setSelectedBounty(null)}
            onSubmit={() => setShowSubmit(true)}
          />
        )}

        {showSubmit && (
          <SubmitProjectModal bountyId={selectedBounty.id} wallet={address} onClose={() => setShowSubmit(false)} />
        )}

        {showLaunch && (
          <LaunchCampaignModal 
            onClose={() => setShowLaunch(false)} 
            onCreate={handleCreateCampaign}
          />
        )}

        {managedBounty && (
            <ManageCampaignModal 
                bounty={managedBounty}
                onClose={() => setManagedBounty(null)}
            />
        )}
      </div>
    </div>
  );
}
