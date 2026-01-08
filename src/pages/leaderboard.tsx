import React, { useEffect, useState } from "react";
import {
  Trophy,
  Download,
  Layers,
  Crown,
  Search,
} from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function LeaderboardPage() {
  const [search, setSearch] = useState("");
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);

  const DUMMY_LEADERBOARD = [
  {
    _id: "0xabc1",
    ownerName: "Astra Labs",
    ownerAvatar: "https://placehold.co/80x80",
    totalDownloads: 18420,
    totalProjects: 12,
  },
  {
    _id: "0xabc2",
    ownerName: "Neon Architect",
    ownerAvatar: "https://placehold.co/80x80",
    totalDownloads: 14350,
    totalProjects: 9,
  },
  {
    _id: "0xabc3",
    ownerName: "Orbit Studio",
    ownerAvatar: "https://placehold.co/80x80",
    totalDownloads: 11890,
    totalProjects: 7,
  },
  {
    _id: "0xabc4",
    ownerName: "Sentinel Dev",
    ownerAvatar: "https://placehold.co/80x80",
    totalDownloads: 9640,
    totalProjects: 6,
  },
  {
    _id: "0xabc5",
    ownerName: "Polarwave",
    ownerAvatar: "https://placehold.co/80x80",
    totalDownloads: 7320,
    totalProjects: 4,
  },
];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // try {
      //   const res = await fetch("http://localhost:3001/api/projects/leaderboard");
      //   const json = await res.json();

      //   if (json.success) {
      //     setBuilders(json.data);
      //   }
      // } catch (err) {
      //   console.error("Failed to load leaderboard", err);
      // } finally {
      //   setLoading(false);
      // }
      setBuilders(DUMMY_LEADERBOARD);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const filtered = builders.filter(b =>
    b.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05050A] text-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* HEADER */}
        <header className="mb-14">
          <div className="flex items-center gap-3 text-indigo-400 font-medium mb-3">
            <Trophy className="w-5 h-5" />
            <span>Builder Leaderboard</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Top Builders by Downloads
          </h1>

          <p className="text-gray-400 mt-4 max-w-2xl text-lg">
            Ranked by total downloads across all published projects.
          </p>

          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search builder..."
              className="w-full bg-[#0B0B14] border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none"
            />
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <p className="text-gray-400">Loading leaderboard...</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((b, index) => (
              <div
                key={b._id}
                className="bg-[#0B0B14] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/40 transition"
              >
                <div className="flex items-center gap-6">
                  {/* RANK */}
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-xl">
                    {index + 1}
                  </div>

                  {/* AVATAR */}
                  <img
                    src={b.ownerAvatar || "https://placehold.co/80x80"}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />

                  {/* NAME */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{b.ownerName}</h3>
                      {index === 0 && <Crown className="text-yellow-400" />}
                    </div>

                    <p className="text-gray-400 text-sm">
                      {b.totalProjects} Published Projects
                    </p>
                  </div>

                  {/* METRICS */}
                  <div className="grid grid-cols-2 gap-10 text-center">
                    <Metric
                      icon={<Download className="w-5 h-5" />}
                      label="Total Downloads"
                      value={b.totalDownloads.toLocaleString()}
                    />

                    <Metric
                      icon={<Layers className="w-5 h-5" />}
                      label="Projects"
                      value={b.totalProjects}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-gray-500 text-sm">
          Rankings update automatically based on total downloads.
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div>
      <div className="flex justify-center mb-1 text-gray-400">
        {icon}
      </div>
      <div className="font-bold">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
