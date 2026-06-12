"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3 } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const LandingPage = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white font-sans selection:bg-blue-500/30">
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-blue-500/20 blur-[180px] rounded-full"
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[700px] h-[500px] bg-violet-500/10 blur-[150px] rounded-full"
          animate={{ opacity: [0.28, 0.55, 0.28], scale: [1, 1.06, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full"
          animate={{ opacity: [0.2, 0.42, 0.2], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0e0e10]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="text-2xl font-bold tracking-tight">
              Talent<span className="text-[#3b82f6]">IQ</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
              <button type="button" onClick={() => scrollToSection('modules')} className="hover:text-white transition-colors">Features</button>
              <button type="button" onClick={() => scrollToSection('modules')} className="hover:text-white transition-colors">How it Works</button>
              <button type="button" onClick={() => scrollToSection('footer')} className="hover:text-white transition-colors">Pricing</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setIsAuthOpen(true)} className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Log In
            </button>
            <motion.button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 inline-flex items-center justify-center"
            >
                Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-40 pb-32 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-white/40 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            v2.0 Intelligence Engine Live
          </div>
          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-400">
              Talent Intelligence
            </span>
          </motion.h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Analyze applications, identify top candidates, and make smarter hiring decisions with evidence-backed insights derived from massive datasets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/25 scale-100 active:scale-95 inline-flex items-center justify-center"
            >
                Get Started Free
            </motion.button>
            <motion.button type="button" onClick={() => scrollToSection('modules')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">
              View Demo
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Applications Processed', value: '2.4M+' },
            { label: 'Time Saved Per Hire', value: '85%' },
            { label: 'Match Accuracy', value: '94.2%' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
            >
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-white/30">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Modules Section */}
      <motion.section
        id="modules"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="py-32 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold mb-4">Deep Intelligence Modules</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Purpose-built analytical engines to evaluate candidate capability beyond keywords.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ boxShadow: '0 20px 40px rgba(255,255,255,0.08)' }}
              className="md:col-span-8 p-8 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden group"
            >
              <div className="flex flex-col h-full">
                <Users className="w-8 h-8 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Semantic Resume Analysis</h3>
                <p className="text-white/50 mb-8 max-w-md">
                  Our NLP engine understands context, evaluating impact and complexity rather than just matching buzzwords.
                </p>
                <div className="mt-auto pt-8 border-t border-white/5">
                  <div className="flex gap-2">
                    {['React', 'System Design', 'Team Lead'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ boxShadow: '0 20px 40px rgba(255,255,255,0.08)' }}
              className="md:col-span-4 p-8 rounded-3xl bg-white/[0.02] border border-white/5 group"
            >
              <BarChart3 className="w-8 h-8 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Predictive Candidate Ranking</h3>
              <p className="text-white/50">
                Scores calibrated against your specific JD requirements and historical success metrics.
              </p>
              <div className="mt-12 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-white/40">MATCH SCORE</span>
                  <span className="text-sm font-bold text-blue-400">94</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[94%]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer id="footer" className="py-12 border-t border-white/5 bg-[#0e0e10]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-bold">
            Talent<span className="text-[#3b82f6]">IQ</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/40">
            <button type="button" onClick={() => setIsAuthOpen(true)} className="hover:text-white transition-colors">Privacy Policy</button>
            <button type="button" onClick={() => setIsAuthOpen(true)} className="hover:text-white transition-colors">Terms of Service</button>
            <button type="button" onClick={() => setIsAuthOpen(true)} className="hover:text-white transition-colors">Security</button>
            <button type="button" onClick={() => setIsAuthOpen(true)} className="hover:text-white transition-colors">Status</button>
          </div>
          <div className="text-sm text-white/20">
            © 2026 TalentIQ Intelligence Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
