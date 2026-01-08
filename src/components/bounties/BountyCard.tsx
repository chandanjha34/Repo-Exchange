import React from "react";
import { Trophy, Clock, Users, ArrowRight, LayoutDashboard } from "lucide-react";

export default function BountyCard({ bounty, onOpen, isOwner, onManage }) {
  return (
    <div
      onClick={!isOwner ? onOpen : undefined}
      className={`group relative bg-[#13131a] border border-white/5 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-white/10 ${!isOwner ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <img width={40} height={40} src={bounty.logo} alt={bounty.company} className="rounded-lg" />
          <div>
            <h4 className="font-semibold text-white leading-tight">{bounty.company}</h4>
            <p className="text-xs text-gray-500 font-medium">{bounty.category}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          bounty.difficulty === 'Senior' || bounty.difficulty === 'Expert' 
          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {bounty.difficulty}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-indigo-300 transition-colors">
          {bounty.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-5">
          {bounty.overview}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {bounty.tags?.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-5 border-t border-white/5">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-300 font-semibold">{bounty.reward}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{bounty.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{bounty.applicants}</span>
          </div>
        </div>

        {!isOwner ? (
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onManage(bounty); }}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition flex items-center gap-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Manage
          </button>
        )}
      </div>
    </div>
  );
}
