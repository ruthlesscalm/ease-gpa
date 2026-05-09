import FirstYear from '@/components/FirstYear';
import SecondYear from '@/components/secondyear/SecondYear';
import { branches } from '@/components/secondyear/data';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, GraduationCap, RotateCcw, Coffee, X, Copy, Check } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

import { SpeedInsights } from '@vercel/speed-insights/react';

const semesters = [
  '1st Sem',
  '2nd Sem',
  '3rd Sem',
  '4th Sem',
  '5th Sem',
  '6th Sem',
];

const STORAGE_KEYS = {
  SEMESTER: 'ease-gpa-semester',
  CYCLE: 'ease-gpa-cycle',
  BRANCH: 'ease-gpa-branch',
  MARKS: 'ease-gpa-marks',
  TARGET_GRADES: 'ease-gpa-target-grades',
};

const App = () => {
  const [selectedSemester, setSelectedSemester] = useState(
    () => localStorage.getItem(STORAGE_KEYS.SEMESTER) || '',
  );
  const [selectedCycle, setSelectedCycle] = useState(
    () => localStorage.getItem(STORAGE_KEYS.CYCLE) || '',
  );
  const [selectedBranch, setSelectedBranch] = useState(
    () => localStorage.getItem(STORAGE_KEYS.BRANCH) || '',
  );
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText('ruthlesscalm.dev@okicici');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Persist semester & cycle selections
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEMESTER, selectedSemester);
  }, [selectedSemester]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CYCLE, selectedCycle);
  }, [selectedCycle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCH, selectedBranch);
  }, [selectedBranch]);

  // Reset everything (preserves theme preference)
  const handleReset = useCallback(() => {
    setSelectedSemester('');
    setSelectedCycle('');
    setSelectedBranch('');
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ease-gpa-') && key !== 'ease-gpa-theme') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient orbs — reduced blur for perf */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ contain: 'strict' }}>
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.55_0.22_270_/_0.12)] blur-[60px] dark:bg-[oklch(0.55_0.22_270_/_0.08)]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[oklch(0.60_0.20_300_/_0.10)] blur-[60px] dark:bg-[oklch(0.60_0.20_300_/_0.06)]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.65_0.15_330_/_0.06)] blur-[50px] dark:bg-[oklch(0.65_0.15_330_/_0.04)]" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-8 sm:px-6 lg:max-w-6xl lg:px-10">
        {/* ── Header ── */}
        <header className="animate-fade-in-up flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="gradient-text text-2xl font-extrabold tracking-tight sm:text-3xl">
                EaseGPA
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Calculate your SGPA effortlessly
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Reset button */}
            {(selectedSemester || selectedCycle || selectedBranch) && (
              <button
                id="reset-all"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="group relative flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5 active:scale-95"
              >
                <RotateCcw className="h-[15px] w-[15px] text-muted-foreground transition-all duration-300 group-hover:rotate-[-180deg] group-hover:text-destructive" />
                <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-destructive">
                  Reset
                </span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card/60 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
            >
              <Sun
                className={`absolute h-[18px] w-[18px] text-amber-400 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                }`}
              />
              <Moon
                className={`absolute h-[18px] w-[18px] text-indigo-500 transition-all duration-300 ${
                  theme === 'dark'
                    ? '-rotate-90 scale-0 opacity-0'
                    : 'rotate-0 scale-100 opacity-100'
                }`}
              />
            </button>
          </div>
        </header>

        {/* ── Selector Card ── */}
        <Card
          className="glass animate-fade-in-up w-full flex-col items-center gap-6 rounded-2xl p-6"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Section label */}
          <div className="flex w-full items-center gap-2 pb-1">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Choose Semester
            </span>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-4">
            <Select
              value={selectedSemester}
              onValueChange={(value) => {
                setSelectedSemester(value);
                setSelectedCycle('');
                setSelectedBranch('');
              }}
            >
              <SelectTrigger className="w-full max-w-56 transition-all duration-200 hover:border-primary/40" id="semester-select">
                <SelectValue placeholder="Select your semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="sr-only">Semesters</SelectLabel>
                  {semesters.map((v) => {
                    return (
                      <SelectItem value={v.slice(0, 1)} key={v.slice(0, 1)}>
                        {v}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>

            {(selectedSemester === '1' || selectedSemester === '2') && (
              <Select
                value={selectedCycle}
                onValueChange={(value) => setSelectedCycle(value)}
              >
                <SelectTrigger className="w-full max-w-56 animate-fade-in transition-all duration-200 hover:border-primary/40" id="cycle-select">
                  <SelectValue placeholder="Select the cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="sr-only">Cycles</SelectLabel>
                    <SelectItem value="physics">Physics cycle</SelectItem>
                    <SelectItem value="chemistry">Chemistry cycle</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {['3', '4', '5', '6'].includes(selectedSemester) && (
              <Select
                value={selectedBranch}
                onValueChange={(value) => setSelectedBranch(value)}
              >
                <SelectTrigger className="w-full max-w-56 animate-fade-in transition-all duration-200 hover:border-primary/40" id="branch-select">
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="sr-only">Branches</SelectLabel>
                    {branches.map((b) => (
                      <SelectItem value={b.value} key={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ── FirstYear Form ── */}
          {(selectedCycle === 'physics' || selectedCycle === 'chemistry') && (
            <FirstYear
              selectedCycle={selectedCycle}
              selectedSemester={selectedSemester}
            />
          )}

          {['3', '4', '5', '6'].includes(selectedSemester) && selectedBranch && (
            <SecondYear
              selectedBranch={selectedBranch}
              selectedSemester={selectedSemester}
            />
          )}
        </Card>



        {/* ── Footer ── */}
        <footer className="mt-auto flex w-full items-center justify-center gap-6 pb-4 pt-8">
          <a
            id="github-link"
            href="https://github.com/ruthlesscalm"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
          >
            <svg
              className="h-5 w-5 fill-current transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">ruthlesscalm</span>
          </a>

          {/* Support Button */}
          <button
            onClick={() => setShowSupport(true)}
            aria-label="Support the creator"
            className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-muted-foreground transition-all duration-200 cursor-pointer hover:text-foreground dark:hover:text-foreground"
          >
            <Coffee className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm font-semibold tracking-wide">Buy me a Chai</span>
          </button>
        </footer>
      </main>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSupport(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Coffee className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold tracking-tight">Support EaseGPA</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If this tool helped you save time during exams, consider buying me a chai! ☕
              </p>
            </div>
            
            <div className="mt-2 flex w-full flex-col items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="overflow-hidden rounded-xl bg-white p-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('upi://pay?pa=ruthlesscalm.dev@okicici&pn=PAVAN GOWDA S R&cu=INR&tn=EaseGPA Support')}`} 
                  alt="UPI QR Code" 
                  className="h-[180px] w-[180px]"
                />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Scan with any UPI App
              </p>
            </div>

            <div className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3">
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-muted-foreground">UPI ID</span>
                <span className="truncate text-sm font-medium">ruthlesscalm.dev@okicici</span>
              </div>
              <button
                onClick={handleCopyUPI}
                className="flex items-center justify-center rounded-md bg-muted p-2 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Copy UPI ID"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            
            <a 
              href="upi://pay?pa=ruthlesscalm.dev@okicici&pn=PAVAN%20GOWDA%20S%20R&cu=INR&tn=EaseGPA%20Support"
              className="mt-2 w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] sm:hidden"
            >
              Pay via UPI App
            </a>
          </div>
        </div>
      )}

      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
