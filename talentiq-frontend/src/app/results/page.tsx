"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  Filter,
  FileText,
  Upload,
} from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: index * 0.05,
      ease: 'easeOut' as const,
    },
  }),
};

type Candidate = { id: string; name: string | null; overall_score: number | null; recommendation: string | null; status: string };

const CandidateResults = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    const fetchCandidates = async () => {
      try {
        const { apiListCandidates } = await import('@/lib/api');
        const data = await apiListCandidates();
        if (isMounted) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCandidates(data);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsLoading(false);
        }
      }
    };

    fetchCandidates();
    pollTimer = setInterval(fetchCandidates, 5000);

    const frame = window.requestAnimationFrame(() => setIsReady(true));

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const hasUploadedResumes = candidates.length > 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-screen bg-[#10131a] text-white font-sans overflow-hidden"
    >
      <aside className="w-64 border-r border-white/5 bg-[#10131a] flex flex-col h-full shrink-0">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight mb-8 inline-block">
            Talent<span className="text-[#60A5FA]">IQ</span>
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mb-8">
            <Link href="/jobs/new" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20 text-[#60A5FA] text-sm font-semibold rounded-lg transition-all border border-[#60A5FA]/20">
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

      <main className="flex-1 flex flex-col overflow-y-auto bg-[#10131a]">
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex justify-between items-end gap-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Candidate Pool</h1>
              <p className="text-white/40">Review uploaded resumes against active roles.</p>
            </div>
            <motion.button
              type="button"
              onClick={() => router.push('/upload')}
              whileHover={{ scale: 1.03, boxShadow: '0 18px 35px rgba(96, 165, 250, 0.18)' }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-[#60A5FA] hover:bg-[#3B82F6] text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Resumes
            </motion.button>
          </motion.div>

          <div className="flex gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#60A5FA] transition-colors" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#60A5FA]/50 transition-all"
              />
            </div>
            <FilterButton label="Role Match" active={selectedFilter === 'Role Match'} onClick={() => setSelectedFilter('Role Match')} />
            <FilterButton label="Experience Level" active={selectedFilter === 'Experience Level'} onClick={() => setSelectedFilter('Experience Level')} />
            <FilterButton label="More Filters" icon={<Filter size={14} />} active={selectedFilter === 'More Filters'} onClick={() => setSelectedFilter('More Filters')} />
          </div>

          <AnimatePresence mode="wait">
            {!isReady || isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden"
              >
                <div className="grid grid-cols-6 px-6 py-4 bg-white/[0.03] border-b border-white/5">
                  <div className="col-span-6 h-4 w-40 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                      <div className="h-5 w-28 rounded bg-white/10 animate-pulse mb-3" />
                      <div className="h-4 w-40 rounded bg-white/10 animate-pulse mb-6" />
                      <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : hasUploadedResumes ? (
              <motion.div
                key="cards"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden"
              >
                <div className="grid grid-cols-6 px-6 py-4 bg-white/[0.03] border-b border-white/5">
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Name</div>
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Match Score</div>
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Confidence</div>
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Experience</div>
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Skills</div>
                  <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase text-right">Status</div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      custom={index}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.01, boxShadow: '0 22px 45px rgba(96, 165, 250, 0.12)' }}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-[#60A5FA]/20"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="text-lg font-bold truncate">{candidate.name || 'Unknown Candidate'}</div>
                          <div className="text-sm text-white/40">
                            {candidate.status === 'analyzed' ? 'Analysis complete' : 'Awaiting analysis'}
                          </div>
                        </div>
                        {candidate.status === 'analyzed' ? (
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            candidate.overall_score && candidate.overall_score >= 80 ? 'border-green-500/20 bg-green-500/10 text-green-400' :
                            candidate.overall_score && candidate.overall_score >= 60 ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400' :
                            'border-red-500/20 bg-red-500/10 text-red-400'
                          }`}>
                            {candidate.overall_score}% Match
                          </span>
                        ) : (
                          <span className="rounded-full border border-[#60A5FA]/20 bg-[#60A5FA]/10 px-3 py-1 text-xs font-bold text-[#60A5FA]">
                            {candidate.status === 'pending' ? 'Queued' : candidate.status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-white/35 mb-4">
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                          <div className="uppercase tracking-widest text-[10px] text-white/25 mb-1">Recommendation</div>
                          {candidate.recommendation || 'Pending'}
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                          <div className="uppercase tracking-widest text-[10px] text-white/25 mb-1">Index</div>
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/55">Processed by AI</span>
                        {candidate.status === 'analyzed' && (
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/55">Ready for review</span>
                        )}
                      </div>
                      <Link href={`/candidate/${candidate.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#60A5FA] hover:text-white transition-colors">
                        View Full Report
                        <Search className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex justify-between items-center opacity-30">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((index) => <div key={index} className="w-8 h-8 bg-white/10 rounded" />)}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] min-h-[420px] flex items-center justify-center px-6"
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="max-w-md w-full p-10 rounded-[32px] bg-[#10131a] border border-white/10 shadow-2xl shadow-black/50 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative">
                    <FileText className="w-10 h-10 text-white/20" />
                      <div className="absolute -bottom-1 -right-1 bg-[#60A5FA] rounded-lg p-1.5 border-4 border-[#10131a]">
                      <Search className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">No candidates analyzed yet</h2>
                  <p className="text-white/40 mb-10 leading-relaxed text-sm">Upload candidate resumes to begin analysis.</p>
                  <motion.button
                    type="button"
                    onClick={() => router.push('/upload')}
                    whileHover={{ scale: 1.03, boxShadow: '0 18px 35px rgba(96, 165, 250, 0.18)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98] w-full"
                  >
                    Upload Resumes
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-auto py-12 px-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
          <div className="font-bold tracking-tight">
            Talent<span className="text-[#60A5FA]">IQ</span>
          </div>
          <div className="text-white/40">© 2024 TalentIQ Intelligence Systems. All rights reserved.</div>
          <div className="flex gap-8 text-white/40">
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Terms of Service</button>
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Security</button>
            <button type="button" onClick={() => router.push('/settings')} className="hover:text-white transition-colors">Status</button>
          </div>
        </footer>
      </main>
    </motion.div>
  );
};

const NavItem = ({ icon, label, active = false, href }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) => {
  const className = `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
    active
      ? 'bg-[#60A5FA]/10 text-[#60A5FA]'
      : 'text-white/50 hover:text-white hover:bg-white/5'
  }`;

  const content = (
    <>
      <span className={active ? 'text-[#60A5FA]' : 'text-white/40 group-hover:text-white/60 transition-colors'}>{icon}</span>
      {label}
    </>
  );

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }

  return <button type="button" className={className}>{content}</button>;
};

const FilterButton = ({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -2, boxShadow: '0 16px 32px rgba(96, 165, 250, 0.08)' }}
    whileTap={{ scale: 0.98 }}
    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
      active
        ? 'bg-[#60A5FA]/10 border-[#60A5FA]/20 text-[#60A5FA]'
        : 'bg-white/[0.03] border-white/10 hover:bg-white/5 hover:border-white/20 text-white/70'
    }`}
  >
    {label}
    {icon ? icon : <Plus className="w-3.5 h-3.5 opacity-40" />}
  </motion.button>
);

export default CandidateResults;