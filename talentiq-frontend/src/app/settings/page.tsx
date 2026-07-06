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
  Shield,
  Bell,
  Palette,
  UserCircle2,
  Sparkles,
  Database,
  Loader2,
  Mail,
  Gauge,
  Workflow,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

type SettingsState = {
  profile: {
    name: string;
    role: string;
    email: string;
    company: string;
  };
  appearance: {
    theme: 'Dark' | 'Midnight' | 'Aurora';
    accent: 'Blue' | 'Cyan' | 'Teal';
    density: 'Comfortable' | 'Balanced' | 'Compact';
  };
  preferences: {
    autoScore: boolean;
    instantAlerts: boolean;
    weeklyDigest: boolean;
    smartShortlists: boolean;
  };
  notifications: {
    email: boolean;
    inApp: boolean;
    newCandidates: boolean;
    jobAlerts: boolean;
  };
};

const STORAGE_KEY = 'talentiq:settings';

const defaultSettings: SettingsState = {
  profile: {
    name: 'Morgan Lee',
    role: 'Talent Acquisition Lead',
    email: 'morgan@talentiq.ai',
    company: 'TalentIQ',
  },
  appearance: {
    theme: 'Midnight',
    accent: 'Blue',
    density: 'Balanced',
  },
  preferences: {
    autoScore: true,
    instantAlerts: true,
    weeklyDigest: false,
    smartShortlists: true,
  },
  notifications: {
    email: true,
    inApp: true,
    newCandidates: true,
    jobAlerts: false,
  },
};

const SettingsPage = () => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [status, setStatus] = useState<'idle' | 'saved' | 'reset'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const storedSettings = localStorage.getItem(STORAGE_KEY);
    const storedUser = localStorage.getItem('talentiq:user');

    let initialSettings = defaultSettings;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        initialSettings = {
          ...initialSettings,
          profile: {
            ...initialSettings.profile,
            name: parsedUser.name || initialSettings.profile.name,
            email: parsedUser.email || initialSettings.profile.email,
          }
        };
      } catch (e) {}
    }

    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings) as Partial<SettingsState>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings({
          profile: { ...initialSettings.profile, ...parsedSettings.profile },
          appearance: { ...initialSettings.appearance, ...parsedSettings.appearance },
          preferences: { ...initialSettings.preferences, ...parsedSettings.preferences },
          notifications: { ...initialSettings.notifications, ...parsedSettings.notifications },
        });
      } catch {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(initialSettings);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(initialSettings);
    }

    setIsCheckingAuth(false);
  }, [router]);

  const saveSettings = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setStatus('saved');
    window.setTimeout(() => {
      setIsSaving(false);
    }, 300);
  };

  const resetSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaultSettings);
    setStatus('reset');
  };

  const logout = () => {
    sessionStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  const clearAppData = () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('talentiq:'))
      .forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem('isAuthenticated');
    setStatus('reset');
    router.push('/');
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#10131a] text-white font-sans overflow-hidden">
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
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" />
            <NavItem icon={<Briefcase size={20} />} label="Jobs" href="/jobs" />
            <NavItem icon={<Users size={20} />} label="Candidates" href="/results" />
            <NavItem icon={<BarChart3 size={20} />} label="Analytics" href="/analytics" />
            <NavItem icon={<Settings size={20} />} label="Settings" href="/settings" active />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 space-y-1">
          <NavItem icon={<HelpCircle size={20} />} label="Help Center" href="/settings" />
          <NavItem icon={<LogOut size={20} />} label="Log Out" onClick={logout} />
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
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-xs text-white/35 mt-1">Tune your workspace, preferences, and account defaults.</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
            >
              Back to Dashboard
            </motion.button>
            <motion.button
              type="button"
              onClick={saveSettings}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </motion.button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <SummaryCard icon={<UserCircle2 className="w-5 h-5" />} label="Profile" value={settings.profile.name} hint={settings.profile.role} />
            <SummaryCard icon={<Palette className="w-5 h-5" />} label="Appearance" value={settings.appearance.theme} hint={`${settings.appearance.accent} accent, ${settings.appearance.density} density`} />
            <SummaryCard icon={<Shield className="w-5 h-5" />} label="Security" value="Protected" hint="Session-based access enabled" />
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="Profile Settings" icon={<UserCircle2 className="w-5 h-5 text-blue-400" />}>
              <Field label="Full Name" value={settings.profile.name} onChange={(value) => setSettings((current) => ({ ...current, profile: { ...current.profile, name: value } }))} />
              <Field label="Role" value={settings.profile.role} onChange={(value) => setSettings((current) => ({ ...current, profile: { ...current.profile, role: value } }))} />
              <Field label="Email" value={settings.profile.email} onChange={(value) => setSettings((current) => ({ ...current, profile: { ...current.profile, email: value } }))} />
              <Field label="Company" value={settings.profile.company} onChange={(value) => setSettings((current) => ({ ...current, profile: { ...current.profile, company: value } }))} />
            </SectionCard>

            <SectionCard title="Appearance" icon={<Palette className="w-5 h-5 text-blue-400" />}>
              <SelectField label="Theme" value={settings.appearance.theme} options={['Dark', 'Midnight', 'Aurora']} onChange={(value) => setSettings((current) => ({ ...current, appearance: { ...current.appearance, theme: value as SettingsState['appearance']['theme'] } }))} />
              <SelectField label="Accent" value={settings.appearance.accent} options={['Blue', 'Cyan', 'Teal']} onChange={(value) => setSettings((current) => ({ ...current, appearance: { ...current.appearance, accent: value as SettingsState['appearance']['accent'] } }))} />
              <SelectField label="Density" value={settings.appearance.density} options={['Comfortable', 'Balanced', 'Compact']} onChange={(value) => setSettings((current) => ({ ...current, appearance: { ...current.appearance, density: value as SettingsState['appearance']['density'] } }))} />
            </SectionCard>

            <SectionCard title="TalentIQ Preferences" icon={<Sparkles className="w-5 h-5 text-blue-400" />}>
              <ToggleField label="AI auto-scoring" description="Score candidates automatically from your job criteria." checked={settings.preferences.autoScore} onToggle={(checked) => setSettings((current) => ({ ...current, preferences: { ...current.preferences, autoScore: checked } }))} icon={<Workflow className="w-4 h-4" />} />
              <ToggleField label="Instant hiring alerts" description="Show urgent candidate and job activity immediately." checked={settings.preferences.instantAlerts} onToggle={(checked) => setSettings((current) => ({ ...current, preferences: { ...current.preferences, instantAlerts: checked } }))} icon={<Bell className="w-4 h-4" />} />
              <ToggleField label="Weekly digest" description="Receive a weekly summary of hiring progress." checked={settings.preferences.weeklyDigest} onToggle={(checked) => setSettings((current) => ({ ...current, preferences: { ...current.preferences, weeklyDigest: checked } }))} icon={<Mail className="w-4 h-4" />} />
              <ToggleField label="Smart shortlists" description="Promote the strongest fits to the top of the pipeline." checked={settings.preferences.smartShortlists} onToggle={(checked) => setSettings((current) => ({ ...current, preferences: { ...current.preferences, smartShortlists: checked } }))} icon={<Gauge className="w-4 h-4" />} />
            </SectionCard>

            <SectionCard title="Notifications" icon={<Bell className="w-5 h-5 text-blue-400" />}>
              <ToggleField label="Email notifications" description="Send hiring updates to your inbox." checked={settings.notifications.email} onToggle={(checked) => setSettings((current) => ({ ...current, notifications: { ...current.notifications, email: checked } }))} icon={<Mail className="w-4 h-4" />} />
              <ToggleField label="In-app notifications" description="Show notifications inside TalentIQ." checked={settings.notifications.inApp} onToggle={(checked) => setSettings((current) => ({ ...current, notifications: { ...current.notifications, inApp: checked } }))} icon={<Bell className="w-4 h-4" />} />
              <ToggleField label="New candidate alerts" description="Notify when strong new matches arrive." checked={settings.notifications.newCandidates} onToggle={(checked) => setSettings((current) => ({ ...current, notifications: { ...current.notifications, newCandidates: checked } }))} icon={<Users className="w-4 h-4" />} />
              <ToggleField label="Job lifecycle alerts" description="Track status changes for active requisitions." checked={settings.notifications.jobAlerts} onToggle={(checked) => setSettings((current) => ({ ...current, notifications: { ...current.notifications, jobAlerts: checked } }))} icon={<Briefcase className="w-4 h-4" />} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Security" icon={<Shield className="w-5 h-5 text-blue-400" />}>
              <ActionRow
                title="Session protection"
                description="Authentication is simulated through sessionStorage for this MVP."
                actionLabel="Logout All Sessions"
                onAction={logout}
              />
              <ActionRow
                title="Password management"
                description="Reset your access workflow from this workstation."
                actionLabel="Reset Access"
                onAction={() => router.push('/settings')}
              />
              <ActionRow
                title="Data permissions"
                description="Control how candidate data is stored and cleared locally."
                actionLabel="Reset Preferences"
                onAction={resetSettings}
              />
            </SectionCard>

            <SectionCard title="About TalentIQ" icon={<Database className="w-5 h-5 text-blue-400" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MiniAction title="Product Tour" subtitle="See the hiring flow" onClick={() => router.push('/dashboard')} />
                <MiniAction title="Open Jobs" subtitle="Review active requisitions" onClick={() => router.push('/jobs')} />
                <MiniAction title="Candidate Pool" subtitle="Inspect analyzed talent" onClick={() => router.push('/results')} />
                <MiniAction title="Analytics" subtitle="Monitor hiring performance" onClick={() => router.push('/analytics')} />
              </div>
              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-white/55 leading-relaxed">
                TalentIQ keeps the MVP experience local-first. Your layout settings persist in localStorage, while auth remains sessionStorage-based to keep the current demo flow simple and predictable.
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Danger Zone" icon={<Trash2 className="w-5 h-5 text-red-400" />} tone="danger">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DangerAction
                title="Reset App Data"
                description="Clear stored TalentIQ settings, preferences, and local drafts."
                onClick={clearAppData}
              />
              <DangerAction
                title="Restore Defaults"
                description="Return this page to the built-in starter configuration."
                onClick={resetSettings}
              />
              <DangerAction
                title="Sign Out"
                description="End the current session and return to the landing page."
                onClick={logout}
              />
            </div>
          </SectionCard>

          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100"
            >
              {status === 'saved' ? 'Settings saved locally.' : 'Settings reset to defaults.'}
            </motion.div>
          )}
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

const SummaryCard = ({ icon, label, value, hint }: { icon: React.ReactNode, label: string, value: string, hint: string }) => (
  <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-white/[0.02] border border-white/5 p-5">
    <div className="flex items-center justify-between mb-4">
      <span className="text-white/35 text-sm font-medium">{label}</span>
      <div className="text-white/40">{icon}</div>
    </div>
    <div className="text-xl font-bold mb-1">{value}</div>
    <div className="text-xs text-white/25 leading-relaxed">{hint}</div>
  </motion.div>
);

const SectionCard = ({ title, icon, children, tone = 'default' }: { title: string, icon: React.ReactNode, children: React.ReactNode, tone?: 'default' | 'danger' }) => (
  <motion.section whileHover={{ y: -4 }} className={`rounded-3xl border p-6 ${tone === 'danger' ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-white/5 bg-white/[0.02]'}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">{icon}</div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-white/30">Workspace controls and profile preferences.</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.section>
);

const Field = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
  <label className="block space-y-2">
    <span className="text-sm text-white/45">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/50"
    />
  </label>
);

const SelectField = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (value: string) => void }) => (
  <label className="block space-y-2">
    <span className="text-sm text-white/45">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-500/50"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-[#10131a]">
          {option}
        </option>
      ))}
    </select>
  </label>
);

const ToggleField = ({ label, description, checked, onToggle, icon }: { label: string, description: string, checked: boolean, onToggle: (checked: boolean) => void, icon: React.ReactNode }) => (
  <button
    type="button"
    onClick={() => onToggle(!checked)}
    className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/10 hover:bg-white/[0.03]"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40">{icon}</div>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-white/30 leading-relaxed mt-1">{description}</div>
        </div>
      </div>
      <div className={`mt-1 h-6 w-11 rounded-full border transition-all ${checked ? 'border-blue-400 bg-blue-500/30' : 'border-white/10 bg-white/5'}`}>
        <div className={`h-5 w-5 rounded-full bg-white transition-transform mt-0.5 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
    </div>
  </button>
);

const ActionRow = ({ title, description, actionLabel, onAction }: { title: string, description: string, actionLabel: string, onAction: () => void }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between gap-4">
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-white/30 mt-1 leading-relaxed">{description}</div>
    </div>
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onAction}
      className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold hover:bg-white/5 transition-colors"
    >
      {actionLabel}
    </motion.button>
  </div>
);

const MiniAction = ({ title, subtitle, onClick }: { title: string, subtitle: string, onClick: () => void }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/10 hover:bg-white/[0.03]"
  >
    <div className="font-medium">{title}</div>
    <div className="mt-1 text-xs text-white/30 leading-relaxed">{subtitle}</div>
  </motion.button>
);

const DangerAction = ({ title, description, onClick }: { title: string, description: string, onClick: () => void }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 text-left transition-all hover:border-red-400/30 hover:bg-red-500/[0.06]"
  >
    <div className="flex items-center gap-3 mb-3 text-red-200">
      <Trash2 className="w-4 h-4" />
      <span className="font-semibold">{title}</span>
    </div>
    <p className="text-sm text-white/35 leading-relaxed">{description}</p>
  </motion.button>
);

export default SettingsPage;