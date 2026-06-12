"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Search,
  ChevronLeft,
  MoreHorizontal,
  Mail,
  Phone,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Target,
  Brain,
  ShieldCheck
} from 'lucide-react';

const CandidateProfile = () => {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#10131a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#10131a] flex flex-col h-full shrink-0">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight mb-8 inline-block">
            Talent<span className="text-[#3b82f6]">IQ</span>
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mb-8">
            <Link href="/jobs/new" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-semibold rounded-lg transition-all border border-[#3b82f6]/20">
              <Plus className="w-4 h-4" />
              New Job
            </Link>
          </motion.div>
          
          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" />
            <NavItem icon={<Briefcase size={20} />} label="Jobs" href="/jobs" />
            <NavItem icon={<Users size={20} />} label="Candidates" href="/results" active />
            <NavItem icon={<BarChart3 size={20} />} label="Analytics" href="/analytics" />
            <NavItem icon={<Settings size={20} />} label="Settings" href="/settings" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 space-y-1">
          <NavItem icon={<HelpCircle size={20} />} label="Help Center" href="/settings" />
          <NavItem icon={<LogOut size={20} />} label="Log Out" href="/" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#10131a]">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#10131a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <motion.button type="button" onClick={() => router.push('/results')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-xl font-bold">Candidate Detail</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-all w-64"
              />
            </div>
            <motion.button type="button" onClick={() => router.push('/settings')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="p-2 text-white/40 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        {/* Content Area */}
        <div className="relative h-[calc(100vh-64px)] overflow-hidden">
          {/* Background Content (Blurred) */}
          <div className="p-8 max-w-7xl mx-auto space-y-8 opacity-20 blur-sm pointer-events-none select-none">
            <div className="flex justify-between items-start">
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-4xl font-bold text-blue-400">
                  JD
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">Jane Doe</h2>
                  <p className="text-white/40 mb-4 font-medium">Senior Software Engineer • San Francisco, CA</p>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Top Match</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold rounded-full uppercase tracking-wider">94% Fit</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 space-y-6">
                <div className="h-64 bg-white/[0.02] border border-white/5 rounded-3xl" />
                <div className="h-96 bg-white/[0.02] border border-white/5 rounded-3xl" />
              </div>
              <div className="col-span-4 space-y-6">
                <div className="h-48 bg-white/[0.02] border border-white/5 rounded-3xl" />
                <div className="h-96 bg-white/[0.02] border border-white/5 rounded-3xl" />
              </div>
            </div>
          </div>

          {/* Empty State / Selection Modal */}
          <div className="absolute inset-0 z-40 bg-[#10131a]/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="max-w-md w-full p-10 rounded-[32px] bg-[#1c1d25] border border-white/10 shadow-2xl shadow-black/50 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative">
                <Users className="w-10 h-10 text-white/20" />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-lg p-1.5 border-4 border-[#1c1d25]">
                  <Search className="w-3 h-3 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">No Candidate Selected</h2>
              <p className="text-white/40 mb-10 leading-relaxed text-sm">
                Select a candidate from the pool to view their detailed intelligence report, match scores, and interview recommendations.
              </p>
              <motion.button type="button" onClick={() => router.push('/results')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98]">
                Browse Candidates
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-12 px-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
          <div className="font-bold tracking-tight">
            Talent<span className="text-[#3b82f6]">IQ</span>
          </div>
          <div className="text-white/40">
            © 2024 TalentIQ Intelligence Systems. All rights reserved.
          </div>
          <div className="flex gap-8 text-white/40">
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Terms of Service</button>
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Security</button>
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Status</button>
          </div>
        </footer>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, href }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) => {
  const className = `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
    active
      ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
      : 'text-white/50 hover:text-white hover:bg-white/5'
  }`;

  const content = (
    <>
      <span className={active ? 'text-[#3b82f6]' : 'text-white/40 group-hover:text-white/60 transition-colors'}>
        {icon}
      </span>
      {label}
    </>
  );

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }

  return <button type="button" className={className}>{content}</button>;
};

export default CandidateProfile;
