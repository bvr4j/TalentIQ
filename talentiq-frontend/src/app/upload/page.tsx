"use client";

import React, { useRef } from 'react';
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
  Bell,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';

const ResumeUpload = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    // Store filenames locally for the results page to display
    const fileNames = selectedFiles.map((f) => f.name);
    localStorage.setItem('talentiq:lastUploads', JSON.stringify(fileNames));

    // Get job ID if available
    const jobId = localStorage.getItem('talentiq:currentJobId') || undefined;

    try {
      const { apiUploadResume } = await import('@/lib/api');
      // Upload each file — fire and don't block navigation
      selectedFiles.forEach((file) => {
        apiUploadResume(file, jobId).catch(() => {/* silent — results page will show status */});
      });
    } catch {
      // If API not available, still redirect so UI works
    }

    router.push('/results');
  };

  return (
    <div className="flex h-screen bg-[#0e0e10] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0e0e10] flex flex-col h-full shrink-0">
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
            <NavItem icon={<Briefcase size={20} />} label="Jobs" href="/jobs" />
            <NavItem icon={<Users size={20} />} label="Candidates" href="/upload" active />
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
      <main className="flex-1 overflow-y-auto bg-[#0e0e10]">
        {/* Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0e0e10]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>Candidates</span>
            <span className="text-white/20">/</span>
            <span className="text-white/80 font-medium">Upload Resumes</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search across TalentIQ..." 
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-all w-64"
              />
            </div>
            <motion.button type="button" onClick={() => router.push('/settings')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="relative text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0e0e10]" />
            </motion.button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/10 flex items-center justify-center text-[10px] font-bold">JD</div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Add Candidates</h1>
            <p className="text-white/40">Securely ingest candidate profiles into your talent pool.</p>
          </div>

          {/* Upload Dropzone */}
          <div className="border border-dashed border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white/[0.01] hover:bg-white/[0.02] transition-colors group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-blue-500/50 transition-colors">
              <Upload className="w-8 h-8 text-white/20 group-hover:text-blue-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold mb-2">Drag & Drop Resumes Here</h2>
            <p className="text-white/40 max-w-sm mb-8 text-sm">
              Supported formats: PDF, DOCX. Max file size: 10MB.
            </p>
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase">OR</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>
            <motion.button type="button" onClick={openFilePicker} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold rounded-xl transition-all border border-blue-500/20">
              <FileText className="w-4 h-4" />
              Browse Files
            </motion.button>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple onChange={handleFilesSelected} className="hidden" />
          </div>

          {/* Upload Queue Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/40" />
                <h3 className="font-bold text-sm">Upload Queue</h3>
              </div>
              <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-1 rounded">0 Files</span>
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">File Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">Size</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="py-20">
                      <div className="flex flex-col items-center justify-center text-center opacity-40">
                         <FileText className="w-10 h-10 mb-4 text-white/20" />
                         <p className="text-sm font-medium">No files selected.</p>
                         <p className="text-xs max-w-[240px] mt-1 leading-relaxed">
                           Your upload queue is empty. Drag and drop resumes above to begin parsing candidates.
                         </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, href }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) => {
  const className = `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
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
    return <Link href={href} className={className}>{content}</Link>;
  }

  return <button type="button" className={className}>{content}</button>;
};

export default ResumeUpload;
