"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Bell,
  Search,
  MoreHorizontal,
} from 'lucide-react';

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.08,
      ease: 'easeOut',
    },
  }),
};

const Dashboard = () => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#10131a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-64 border-r border-white/5 bg-[#191b23] flex flex-col h-full shrink-0"
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
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" active />
            <NavItem icon={<Briefcase size={20} />} label="Jobs" href="/jobs" />
            <NavItem icon={<Users size={20} />} label="Candidates" href="/results" />
            <NavItem icon={<BarChart3 size={20} />} label="Analytics" href="/analytics" />
            <NavItem icon={<Settings size={20} />} label="Settings" href="/settings" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 space-y-1">
          <NavItem icon={<HelpCircle size={20} />} label="Help Center" href="/settings" />
          <NavItem icon={<LogOut size={20} />} label="Log Out" onClick={handleLogout} />
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
        className="flex-1 overflow-y-auto bg-[#10131a]"
      >
        {/* Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#10131a]/80 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-2xl font-bold">Overview</h1>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-all w-64"
              />
            </div>
            <motion.button type="button" onClick={() => router.push('/settings')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="relative text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#10131a]" />
            </motion.button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/10" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <p className="text-white/40 -mt-4">Here&apos;s what&apos;s happening across your requisitions today.</p>

          {/* Stats Row */}
          <motion.div variants={cardContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard index={0} label="Total Applicants" icon={<Users className="w-4 h-4 text-white/40" />} value="--" subtext="No data" />
            <StatCard index={1} label="Strong Matches" icon={<Search className="w-4 h-4 text-white/40" />} value="--" subtext="No data" />
            <StatCard index={2} label="Avg. Time to Hire" icon={<BarChart3 className="w-4 h-4 text-white/40" />} value="--" subtext="No data" />
            <StatCard index={3} label="Active Jobs" icon={<Briefcase className="w-4 h-4 text-white/40" />} value="0" subtext="No data" />
          </motion.div>

          {/* Empty State Hero */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="border border-dashed border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center text-center bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No jobs created yet</h2>
            <p className="text-white/40 max-w-md mb-8 leading-relaxed">
              Your dashboard is looking a little quiet. Create your first job requisition to start attracting and analyzing top talent candidates.
            </p>
            <motion.button type="button" onClick={() => router.push('/jobs/new')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-xl transition-all active:scale-95">
              <Plus className="w-5 h-5" />
              Create Job
            </motion.button>
          </motion.div>

          {/* Activity/Candidates Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeedContainer title="Recent Activity" onAction={() => router.push('/settings')}>
               <EmptyFeed icon={<LayoutDashboard className="w-8 h-8 text-white/10" />} text="No activity yet. Your hiring updates will appear here." />
            </FeedContainer>
            <FeedContainer title="Top Candidates" onAction={() => router.push('/settings')}>
               <EmptyFeed icon={<Users className="w-8 h-8 text-white/10" />} text="No candidates analyzed." />
            </FeedContainer>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, href, onClick }: { icon: React.ReactNode, label: string, active?: boolean, href?: string, onClick?: () => void }) => {
  const className = `flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group text-left ${
    active
      ? 'bg-blue-500/10 text-blue-400'
      : 'text-white/50 hover:text-white hover:bg-white/5'
  }`;

  const content = (
    <>
      <span className={active ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60 transition-colors'}>
        {icon}
      </span>
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

const StatCard = ({ label, icon, value, subtext, index }: { label: string, icon: React.ReactNode, value: string, subtext: string, index: number }) => (
  <motion.div
    custom={index}
    variants={cardItemVariants}
    whileHover={{ y: -8, scale: 1.02 }}
    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">{label}</span>
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-xs text-white/20">{subtext}</div>
  </motion.div>
);

const FeedContainer = ({ title, children, onAction }: { title: string, children: React.ReactNode, onAction: () => void }) => (
  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col min-h-[300px]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold">{title}</h3>
      <motion.button type="button" onClick={onAction} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="text-white/30 hover:text-white transition-colors">
        <MoreHorizontal className="w-5 h-5" />
      </motion.button>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center">
      {children}
    </div>
  </div>
);

const EmptyFeed = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="text-center">
    <div className="mb-4 flex justify-center">{icon}</div>
    <p className="text-sm text-white/20 max-w-[200px] mx-auto leading-relaxed">{text}</p>
  </div>
);

export default Dashboard;
