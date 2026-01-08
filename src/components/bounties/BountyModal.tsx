import React from "react";
import { X, FileText, Target, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

export default function BountyModal({ bounty, onClose, onSubmit }) {
  if (!bounty) return null;

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
         <div 
           className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
           onClick={onClose}
         />
   
         <div className="relative bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           
           {/* Header */}
           <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#181820]">
             <div className="flex gap-4">
               <img width={40} height={40} src={bounty.logo} alt={bounty.company} className="rounded-lg" />   
               <div>
                 <h2 className="text-2xl font-bold text-white">{bounty.title}</h2>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-indigo-400 font-medium">{bounty.company}</span>
                   <span className="text-gray-600">•</span>
                   <span className="text-gray-400 text-sm">{bounty.category}</span>
                 </div>
               </div>
             </div>
             <button 
               onClick={onClose}
               className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
             >
               <X className="w-6 h-6" />
             </button>
           </div>
   
           {/* Scrollable Body */}
           <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
             
             <section>
               <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-indigo-500" /> Overview
               </h3>
               <p className="text-gray-300 leading-relaxed text-base">
                 {bounty.overview}
               </p>
             </section>
   
             <section className="grid md:grid-cols-2 gap-8">
               <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                 <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                   <Target className="w-5 h-5 text-indigo-500" /> Objective
                 </h3>
                 <p className="text-gray-400 text-sm leading-relaxed">
                   {bounty.objective}
                 </p>
               </div>
               
               <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                 <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                   <DollarSign className="w-5 h-5 text-green-500" /> Rewards & IP
                 </h3>
                 <div className="space-y-2">
                   <p className="text-gray-300 text-sm"><span className="text-gray-500">Prize:</span> {bounty.prize}</p>
                   <p className="text-gray-300 text-sm"><span className="text-gray-500">Rights:</span> {bounty.ownership}</p>
                 </div>
               </div>
             </section>
   
             <div className="grid md:grid-cols-2 gap-10">
               <section>
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                   <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Deliverables
                 </h3>
                 <ul className="space-y-3">
                   {bounty.deliverables?.map((item, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                       {item}
                     </li>
                   ))}
                 </ul>
               </section>
   
               <section>
                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                   <AlertCircle className="w-5 h-5 text-indigo-500" /> Evaluation
                 </h3>
                 <ul className="space-y-3">
                   {bounty.evaluation?.map((item, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                       {item}
                     </li>
                   ))}
                 </ul>
               </section>
             </div>
           </div>
   
           {/* Footer */}
           <div className="p-6 border-t border-white/10 bg-[#181820] flex justify-between items-center">
               <div className="text-sm text-gray-500 hidden sm:block">
                   Deadline: <span className="text-white font-medium">{bounty.duration} build time</span>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                   <button 
                       onClick={onClose}
                       className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors font-medium w-full sm:w-auto"
                   >
                       Cancel
                   </button>
                   <button
                       onClick={onSubmit}
                       className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
                   >
                       Start Building
                   </button>
               </div>
           </div>
         </div>
       </div>
  );
}
