import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { 
  GripVertical, 
  Upload, 
  Filter, 
  Plus, 
  Pencil, 
  Trash2, 
  Bell, 
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

const initialColleges = [
  { id: "1", name: "All India Institute of Medical Sciences (AIIMS), New Delhi", state: "Delhi", fees: 1628, bond: "None" },
  { id: "2", name: "Maulana Azad Medical College (MAMC), New Delhi", state: "Delhi", fees: 15000, bond: "1 Year / ₹10 Lakhs" },
  { id: "3", name: "Christian Medical College (CMC), Vellore", state: "Tamil Nadu", fees: 153000, bond: "2 Years / ₹5 Lakhs" },
  { id: "4", name: "B.J. Medical College, Ahmedabad", state: "Gujarat", fees: 25000, bond: "1 Year / ₹20 Lakhs" },
  { id: "5", name: "Grant Medical College, Mumbai", state: "Maharashtra", fees: 104000, bond: "1 Year / ₹10 Lakhs" },
  { id: "6", name: "Bangalore Medical College (BMCRI)", state: "Karnataka", fees: 59000, bond: "1 Year / ₹5 Lakhs" },
  { id: "7", name: "King George's Medical University (KGMU)", state: "Uttar Pradesh", fees: 54000, bond: "2 Years / ₹10 Lakhs" },
];

const stateColors = {
  "Delhi": "#5B21B6",
  "Tamil Nadu": "#7C3AED",
  "Gujarat": "#B45309",
  "Maharashtra": "#6D28D9",
  "Karnataka": "#4338CA",
  "Uttar Pradesh": "#7C3AED"
};

export default function PreferenceMaker() {
  const [colleges, setColleges] = useState(initialColleges);

  return (
    <div className="min-h-screen w-full bg-[#18002E] font-['Inter'] text-[#FFFFFF] overflow-x-hidden flex flex-col">
      {/* Topbar */}
      <header className="h-[80px] bg-[#18002E] border-b border-[rgba(255,255,255,0.08)] px-8 flex items-center justify-between shrink-0 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D0B52] flex items-center justify-center border border-[rgba(255,255,255,0.08)] shadow-[0_0_15px_rgba(255,195,0,0.15)]">
            <span className="text-[#FFC300] font-bold text-xl leading-none tracking-tighter">PM</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#FFC300]">NEET Preference Maker</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-[#240046] border border-[rgba(255,255,255,0.08)] flex items-center justify-center hover:bg-[#2D0B52] transition-colors duration-250">
            <Bell size={18} className="text-[#C9B6E4]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-[32px] w-full max-w-[1600px] mx-auto flex flex-col gap-[24px]">
        
        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-[#FFFFFF] tracking-tight mb-2">Preference Maker</h2>
            <p className="text-[#C9B6E4] text-sm md:text-base">Add and arrange your preferred medical colleges</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-[52px] px-5 rounded-[14px] border border-[#7B2FF7] text-[#FFFFFF] bg-transparent hover:bg-[rgba(123,47,247,0.1)] flex items-center gap-2 font-medium transition-all duration-250 hover:shadow-[0_0_15px_rgba(123,47,247,0.2)]">
              <Upload size={18} />
              <span className="hidden sm:inline">Import Colleges</span>
            </button>
            <button className="h-[52px] px-5 rounded-[14px] border border-[#7B2FF7] text-[#FFFFFF] bg-transparent hover:bg-[rgba(123,47,247,0.1)] flex items-center gap-2 font-medium transition-all duration-250 hover:shadow-[0_0_15px_rgba(123,47,247,0.2)]">
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button className="h-[52px] px-6 rounded-[14px] bg-[#FFC300] text-[#18002E] hover:bg-[#F0B800] hover:-translate-y-0.5 flex items-center gap-2 font-semibold shadow-[0_4px_14px_rgba(255,195,0,0.3)] transition-all duration-250">
              <Plus size={20} />
              <span>Add College</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#240046] border border-[rgba(255,255,255,0.08)] rounded-[20px] overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Table Header */}
          <div className="bg-[#2D0B52] border-b border-[rgba(255,255,255,0.08)] grid grid-cols-[80px_minmax(250px,1fr)_180px_150px_minmax(180px,1fr)_120px] items-center text-sm font-semibold text-[#C9B6E4] px-4 py-4 h-[60px]">
            <div className="text-center">Order</div>
            <div className="pl-4">College Name</div>
            <div>State</div>
            <div className="text-right pr-6">Fees (₹)</div>
            <div>Bond Details</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            <Reorder.Group axis="y" values={colleges} onReorder={setColleges} className="flex flex-col w-full list-none">
              {colleges.map((college, index) => (
                <Reorder.Item 
                  key={college.id} 
                  value={college}
                  className="grid grid-cols-[80px_minmax(250px,1fr)_180px_150px_minmax(180px,1fr)_120px] items-center px-4 h-[72px] border-b border-[rgba(255,255,255,0.04)] bg-[#240046] hover:bg-[rgba(255,255,255,0.03)] cursor-grab active:cursor-grabbing transition-colors duration-250 group relative z-10"
                  whileDrag={{
                    scale: 1.01,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                    backgroundColor: "#2D0B52",
                    zIndex: 50,
                  }}
                >
                  {/* Order & Drag Handle */}
                  <div className="flex items-center justify-center gap-2 text-[#C9B6E4]">
                    <GripVertical size={16} className="text-[#4A1D96] group-hover:text-[#7B2FF7] transition-colors" />
                    <span className="font-bold w-6 text-center text-white bg-[rgba(255,255,255,0.05)] rounded-md py-1">{index + 1}</span>
                  </div>

                  {/* College Name */}
                  <div className="pl-4 truncate font-medium text-[15px] pr-4" title={college.name}>
                    {college.name}
                  </div>

                  {/* State Badge */}
                  <div>
                    <span 
                      className="inline-flex items-center justify-center px-[14px] py-[6px] rounded-full text-[13px] font-medium text-white shadow-sm"
                      style={{ backgroundColor: stateColors[college.state] || "#4A1D96" }}
                    >
                      {college.state}
                    </span>
                  </div>

                  {/* Fees */}
                  <div className="text-right pr-6 font-mono text-[15px] text-[#C9B6E4]">
                    {college.fees.toLocaleString('en-IN')}
                  </div>

                  {/* Bond Details */}
                  <div className="text-[14px] text-[#C9B6E4] truncate pr-4" title={college.bond}>
                    {college.bond}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-9 h-9 rounded-xl border border-[#7B2FF7] bg-transparent flex items-center justify-center hover:bg-[#7B2FF7] hover:text-white group/btn transition-colors duration-250">
                      <Pencil size={15} className="text-[#FFC300] group-hover/btn:text-white" />
                    </button>
                    <button className="w-9 h-9 rounded-xl border border-[#7B2FF7] bg-transparent flex items-center justify-center hover:bg-red-500 hover:border-red-500 group/btn transition-colors duration-250">
                      <Trash2 size={15} className="text-[#FFC300] group-hover/btn:text-white" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            {/* Empty State */}
            {colleges.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                  <MoreVertical size={24} className="text-[#7B2FF7]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No colleges added yet</h3>
                <p className="text-[#C9B6E4] text-sm max-w-sm">Click the 'Add College' or 'Import Colleges' button to start building your preference list.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="h-[68px] border-t border-[rgba(255,255,255,0.08)] bg-[#240046] flex items-center justify-between px-6 shrink-0 mt-auto">
            <p className="text-sm text-[#C9B6E4]">Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{colleges.length}</span> of <span className="font-medium text-white">{colleges.length}</span> entries</p>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="w-9 h-9 rounded-lg bg-[#FFC300] text-[#18002E] font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(255,195,0,0.2)]">
                1
              </button>
              <button className="w-9 h-9 rounded-lg border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                2
              </button>
              <button className="w-9 h-9 rounded-lg border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
