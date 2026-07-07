"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  X, 
  ChevronDown, 
  Plus, 
  Search,
  Save,
  Rocket,
  Loader2
} from 'lucide-react';

const NewJobPosting = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDraftData = () => {
    const formElement = document.getElementById('job-form') as HTMLFormElement | null;

    if (!formElement) {
      return null;
    }

    return Object.fromEntries(new FormData(formElement).entries());
  };

  const saveDraft = async () => {
    const draft = getDraftData();
    if (!draft) return;
    localStorage.setItem('talentiq:jobDraft', JSON.stringify(draft));
    router.push('/jobs');
  };

  const createJob = async () => {
    const draft = getDraftData();
    if (draft) {
      setIsSubmitting(true);
      try {
        const { apiCreateJob } = await import('@/lib/api');
        const created = await apiCreateJob({
          title: String(draft.jobTitle || 'Untitled Job'),
          department: String(draft.department || ''),
          description: String(draft.description || ''),
          required_skills: String(draft.requiredSkills || ''),
          preferred_skills: String(draft.preferredSkills || ''),
          experience_level: String(draft.experienceLevel || ''),
          status: 'active',
        });
        // Store the real job ID for the upload page
        if (created?.id) {
          localStorage.setItem('talentiq:currentJobId', created.id);
        }
      } catch (error) {
        console.error("Failed to create job:", error);
        // Fallback: save locally and continue
        localStorage.setItem('talentiq:jobDraft', JSON.stringify(draft));
      } finally {
        setIsSubmitting(false);
        router.push('/upload');
      }
    } else {
      router.push('/upload');
    }
  };

  const cancelJob = () => {
    router.push('/jobs');
  };

  return (
    <div className="min-h-screen bg-[#10131a] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50 bg-[#10131a]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button type="button" onClick={cancelJob} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
          <div>
            <Link href="/dashboard" className="text-sm font-bold tracking-tight inline-block">
              Talent<span className="text-[#3b82f6]">IQ</span>
            </Link>
            <div className="text-[10px] text-white/30 font-medium">Unsaved Draft</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={saveDraft} className="px-4 py-2 text-sm font-semibold hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            Save Draft
          </button>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.98 }} 
            type="button" 
            onClick={createJob} 
            disabled={isSubmitting}
            className={`px-4 py-2 ${isSubmitting ? 'bg-[#3b82f6]/50 cursor-not-allowed' : 'bg-[#3b82f6] hover:bg-[#2563eb] shadow-blue-500/20 shadow-lg'} text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Job
              </>
            )}
          </motion.button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <form id="job-form" className="space-y-12">
          {/* Section: Role Details */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Role Details</h2>
              <p className="text-sm text-white/40">Provide the foundational information for this position.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">Job Title *</label>
                <input 
                  name="jobTitle"
                  type="text" 
                  placeholder="e.g. Senior Frontend Engineer" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">Department *</label>
                  <div className="relative group">
                    <select name="department" className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer">
                      <option>Select department</option>
                      <option>Engineering</option>
                      <option>Product</option>
                      <option>Design</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none group-hover:text-white/60 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">Experience Level *</label>
                  <div className="relative group">
                    <select name="experienceLevel" className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer">
                      <option>Select level</option>
                      <option>Junior</option>
                      <option>Mid-Level</option>
                      <option>Senior</option>
                      <option>Staff / Principal</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none group-hover:text-white/60 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-white/5 w-full" />

          {/* Section: Job Description */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Job Description</h2>
              <p className="text-sm text-white/40">Detail the responsibilities, scope, and expectations.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Description *</label>
                <span className="text-[10px] font-medium text-white/20">Markdown supported</span>
              </div>
              <textarea 
                name="description"
                placeholder="Write a comprehensive job description..." 
                className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none font-mono"
              />
            </div>
          </section>

          <div className="h-px bg-white/5 w-full" />

          {/* Section: Qualifications */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Qualifications</h2>
              <p className="text-sm text-white/40">Define the technical and soft skills required for success.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 space-y-8">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3">Required Skills</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    name="requiredSkills"
                    type="text" 
                    placeholder="Type a skill and press Enter..." 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3">Preferred Skills (Optional)</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    name="preferredSkills"
                    type="text" 
                    placeholder="Type a skill and press Enter..." 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        </form>
      </main>

      {/* Form Actions Footer (Mobile/Tablet accessibility) */}
      <div className="fixed bottom-0 w-full border-t border-white/5 p-4 md:hidden bg-[#10131a]/80 backdrop-blur-md">
         <div className="flex gap-3">
           <button type="button" onClick={cancelJob} className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-bold" disabled={isSubmitting}>Cancel</button>
           <button 
             type="button" 
             onClick={createJob} 
             disabled={isSubmitting}
             className={`flex-1 py-3 ${isSubmitting ? 'bg-[#3b82f6]/50' : 'bg-[#3b82f6]'} rounded-xl text-sm font-bold flex items-center justify-center gap-2`}
           >
             {isSubmitting ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Creating...
               </>
             ) : (
               'Create Job'
             )}
           </button>
         </div>
      </div>
    </div>
  );
};

export default NewJobPosting;
