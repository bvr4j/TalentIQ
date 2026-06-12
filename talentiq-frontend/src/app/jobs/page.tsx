"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, LayoutDashboard, Users, BarChart3, Settings, Plus, HelpCircle, LogOut, Upload, FileText, Search, Filter } from 'lucide-react';

const JobsPage = () => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex h-screen bg-[#10131a] text-white font-sans overflow-hidden">
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-64 border-r border-white/5 bg-[#10131a] flex flex-col h-full shrink-0"
      >
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight mb-8 inline-block">
            Talent<span className="text-[#3b82f6]">IQ</span>
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mb-8">
            <Link href="/jobs/new" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/10">
              <Plus className="w-4 h-4" />
              New Job
            </Link>
          </motion.div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" />
            <NavItem icon={<Briefcase size={20} />} label="Jobs" href="/jobs" active />
            <NavItem icon={<Users size={20} />} label="Candidates" href="/results" />
            <NavItem icon={<BarChart3 size={20} />} label="Analytics" href="/analytics" />
            <NavItem icon={<Settings size={20} />} label="Settings" href="/settings" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 space-y-1">
          <NavItem icon={<HelpCircle size={20} />} label="Help Center" href="/settings" />
          <NavItem icon={<LogOut size={20} />} label="Log Out" href="/" />
        </div>
      </motion.aside>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
        className="flex-1 overflow-y-auto bg-[#10131a]"
      >
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#10131a]/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-white/40 text-sm">Manage active roles, intake, and candidate flow.</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button type="button" onClick={() => setShowFilters((current) => !current)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>
            <motion.button type="button" onClick={() => router.push('/jobs/new')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" />
              Create New Job
            </motion.button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {showFilters && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-white/55">
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-blue-300">Remote</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Engineering</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">Senior</span>
              <button type="button" onClick={() => router.push('/settings')} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 hover:bg-white/5 transition-colors">
                Configure filters
              </button>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Create New Job', href: '/jobs/new', description: 'Start a new role from scratch and define requirements.' },
              { title: 'Upload Resumes', href: '/upload', description: 'Bring candidates into the pipeline for analysis.' },
              { title: 'View Candidates', href: '/results', description: 'Review scored candidates and shortlist matches.' },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-white/30" />
                </div>
                <h2 className="text-lg font-bold mb-2">{item.title}</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-5">{item.description}</p>
                <Link href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#60A5FA] hover:text-white transition-colors">
                  Open
                  <Search className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Active Job Pipeline</h3>
                <p className="text-white/40 text-sm">Recent roles and their next actions.</p>
              </div>
              <Link href="/dashboard" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Back to Dashboard
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Frontend Engineer', 'Product Designer'].map((job) => (
                <motion.div key={job} whileHover={{ y: -6, scale: 1.01 }} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{job}</h4>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">Draft</span>
                  </div>
                  <p className="text-sm text-white/40 mb-4">Move this requisition into upload to start scoring resumes.</p>
                  <Link href="/upload" className="text-sm font-semibold text-[#60A5FA] hover:text-white transition-colors">
                    Upload Resumes
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, href }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) => {
  const className = `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
    active ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-white/50 hover:text-white hover:bg-white/5'
  }`;

  const content = (
    <>
      <span className={active ? 'text-[#3b82f6]' : 'text-white/40 group-hover:text-white/60 transition-colors'}>{icon}</span>
      {label}
    </>
  );

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }

  return <button type="button" className={className}>{content}</button>;
};

export default JobsPage;
