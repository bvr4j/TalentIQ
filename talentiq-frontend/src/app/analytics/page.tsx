"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
  PieChart,
  Target,
  MapPin,
  FileDown,
} from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

const cardListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: index * 0.05,
      ease: 'easeOut',
    },
  }),
};

const TalentAnalytics = () => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [uploadedResumes, setUploadedResumes] = useState<string[]>([]);

  useEffect(() => {
    const storedResumes = localStorage.getItem('talentiq:lastUploads');

    if (storedResumes) {
      try {
        const parsedResumes = JSON.parse(storedResumes) as unknown;

        if (Array.isArray(parsedResumes)) {
          setUploadedResumes(parsedResumes.filter((resume): resume is string => typeof resume === 'string'));
        }
      } catch {
        localStorage.removeItem('talentiq:lastUploads');
      }
    }

    const frame = window.requestAnimationFrame(() => setIsReady(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const analyticsCards = useMemo(() => [
    {
      label: 'Total Candidates Analyzed',
      value: String(uploadedResumes.length),
      hint: 'Stored locally from the upload flow',
      icon: <Users className="w-4 h-4 text-white/20" />,
    },
    {
      label: 'Avg. Match Score',
      value: '0',
      hint: 'No parsed profiles yet',
      icon: <Target className="w-4 h-4 text-white/20" />,
    },
    {
      label: 'Time to Insight',
      value: String(uploadedResumes.length),
      hint: 'Waiting for analysis output',
      icon: <PieChart className="w-4 h-4 text-white/20" />,
    },
  ], [uploadedResumes]);

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
            <NavItem icon={<Users size={20} />} label="Candidates" href="/results" />
            <NavItem icon={<BarChart3 size={20} />} label="Analytics" href="/analytics" active />
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
            className="flex justify-between items-start gap-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Intelligence Reports</h1>
              <p className="text-white/40">Analytics populate from uploaded resumes when analysis data exists.</p>
            </div>
            <motion.button
              type="button"
              onClick={() => window.print()}
              whileHover={{ scale: 1.03, boxShadow: '0 18px 35px rgba(96, 165, 250, 0.12)' }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
                        <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
                      </div>
                      <div className="h-8 w-24 rounded bg-white/10 animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-8 p-8 rounded-3xl bg-white/[0.02] border border-white/5 min-h-[400px]" />
                  <div className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5 min-h-[400px]" />
                </div>
              </motion.div>
            ) : (
              <motion.div variants={cardListVariants} initial="hidden" animate="visible" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analyticsCards.map((card, index) => (
                    <AnalyticsCard key={card.label} index={index} label={card.label} value={card.value} hint={card.hint} icon={card.icon} />
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-6">
                  <motion.section
                    variants={cardItemVariants}
                    custom={0}
                    whileHover={{ y: -6, boxShadow: '0 22px 45px rgba(96, 165, 250, 0.10)' }}
                    className="col-span-12 md:col-span-8 p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center min-h-[400px]"
                  >
                    <div className="mb-6">
                      <BarChart3 className="w-12 h-12 text-white/10" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">No score distribution yet</h3>
                    <p className="text-sm text-white/30 max-w-sm mb-8 leading-relaxed">
                      Upload and analyze resumes before this distribution becomes available.
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => router.push('/upload')}
                      whileHover={{ scale: 1.03, boxShadow: '0 16px 32px rgba(96, 165, 250, 0.10)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Import Candidate Pool
                    </motion.button>
                  </motion.section>

                  <motion.section
                    variants={cardItemVariants}
                    custom={1}
                    whileHover={{ y: -6, boxShadow: '0 22px 45px rgba(96, 165, 250, 0.10)' }}
                    className="col-span-12 md:col-span-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center min-h-[400px]"
                  >
                    <div className="mb-6">
                      <Search className="w-10 h-10 text-white/10" />
                    </div>
                    <h3 className="font-bold mb-2">Skill Vector Analysis</h3>
                    <p className="text-xs text-white/30 leading-relaxed max-w-[220px]">
                      Analysis will appear after resumes are uploaded and processed.
                    </p>
                  </motion.section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.section
                    variants={cardItemVariants}
                    custom={2}
                    whileHover={{ y: -6, boxShadow: '0 22px 45px rgba(96, 165, 250, 0.10)' }}
                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center min-h-[300px]"
                  >
                    <Target className="w-10 h-10 text-white/10 mb-6" />
                    <h3 className="font-bold mb-2">Pipeline Velocity</h3>
                    <p className="text-xs text-white/30">No pipeline metrics yet.</p>
                  </motion.section>
                  <motion.section
                    variants={cardItemVariants}
                    custom={3}
                    whileHover={{ y: -6, boxShadow: '0 22px 45px rgba(96, 165, 250, 0.10)' }}
                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center min-h-[300px]"
                  >
                    <MapPin className="w-10 h-10 text-white/10 mb-6" />
                    <h3 className="font-bold mb-2">Geographic Density</h3>
                    <p className="text-xs text-white/30 max-w-xs">
                      Spatial analysis will populate once candidate data exists.
                    </p>
                  </motion.section>
                </div>
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

const AnalyticsCard = ({
  index,
  label,
  value,
  hint,
  icon,
}: {
  index: number;
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) => (
  <motion.div
    custom={index}
    variants={cardItemVariants}
    whileHover={{ y: -6, boxShadow: '0 22px 45px rgba(96, 165, 250, 0.10)' }}
    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
  >
    <div className="flex justify-between items-center mb-6">
      <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">{label}</span>
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-xs text-white/20">{hint}</div>
  </motion.div>
);

export default TalentAnalytics;