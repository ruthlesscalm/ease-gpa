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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  Sun,
  Moon,
  GraduationCap,
  RotateCcw,
  Coffee,
  X,
  Copy,
  Check,
  FileText,
  Target,
  TrendingUp,
  Sparkles,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

import { SpeedInsights } from '@vercel/speed-insights/react';

const semesters = [
  '1st Sem',
  '2nd Sem',
  '3rd Sem',
  '4th Sem',
  '5th Sem',
  '6th Sem',
  '7th Sem',
  '8th Sem',
];

const SNAP_POINTS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];
const SNAP_THRESHOLD = 0.08;

const STORAGE_KEYS = {
  SEMESTER: 'ease-gpa-semester',
  CYCLE: 'ease-gpa-cycle',
  BRANCH: 'ease-gpa-branch',
  CURRENT_CGPA: 'ease-gpa-current-cgpa',
  TARGET_CGPA: 'ease-gpa-target-cgpa',
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
  const [currentCgpa, setCurrentCgpa] = useState(
    () => localStorage.getItem(STORAGE_KEYS.CURRENT_CGPA) || '',
  );
  const [targetCgpa, setTargetCgpa] = useState(
    () => localStorage.getItem(STORAGE_KEYS.TARGET_CGPA) || '',
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

  // Restrict CGPA input: only valid decimal numbers, strictly clamped between 0 and 10
  const handleCgpaInput = (setter) => (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setter('');
      return;
    }
    // Only allow digits and at most one decimal point
    if (!/^\d*\.?\d*$/.test(raw)) {
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 10) {
      setter('10');
      return;
    }
    setter(raw);
  };

  // Slider handler that snaps smoothly to whole numbers while retaining free movement
  const handleSliderSnapChange = (e) => {
    const raw = parseFloat(e.target.value);
    if (isNaN(raw)) return;
    const snap = SNAP_POINTS.find((pt) => Math.abs(raw - pt) <= SNAP_THRESHOLD);
    const val = snap !== undefined ? snap : raw;
    setTargetCgpa(val.toFixed(2));
  };

  // Persist selections to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEMESTER, selectedSemester);
  }, [selectedSemester]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CYCLE, selectedCycle);
  }, [selectedCycle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCH, selectedBranch);
  }, [selectedBranch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CGPA, currentCgpa);
  }, [currentCgpa]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGET_CGPA, targetCgpa);
  }, [targetCgpa]);

  // Reset everything (preserves theme preference)
  const handleReset = useCallback(() => {
    setSelectedSemester('');
    setSelectedCycle('');
    setSelectedBranch('');
    setCurrentCgpa('');
    setTargetCgpa('');
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ease-gpa-') && key !== 'ease-gpa-theme') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }, []);

  const semNum = selectedSemester ? Number(selectedSemester) : null;
  const isFirstYear = semNum !== null && semNum <= 2;
  const isHigherSem = semNum !== null && semNum > 2;

  // Guard against inconsistent localStorage combinations
  useEffect(() => {
    if (isFirstYear && selectedBranch) {
      setSelectedBranch('');
    } else if (isHigherSem && selectedCycle) {
      setSelectedCycle('');
    }
  }, [isFirstYear, isHigherSem, selectedBranch, selectedCycle]);

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    setSelectedCycle('');
    setSelectedBranch('');
    // For 1st sem, reset current CGPA as there are no past semesters
    if (value === '1') {
      setCurrentCgpa('');
    }
  };

  // Calculate required SGPA based on current CGPA and target CGPA
  const reqSGPAInfo = useMemo(() => {
    if (!semNum || !targetCgpa) return null;
    const target = parseFloat(targetCgpa);
    if (isNaN(target) || target <= 0 || target > 10) return null;

    if (semNum === 1) {
      return {
        requiredSGPA: target,
        maxPossibleCGPA: 10,
        achievable: target <= 10,
        explanation: `In Semester 1, your SGPA is your starting CGPA. Aim for ${target.toFixed(2)} SGPA this semester.`,
      };
    }

    const current = parseFloat(currentCgpa);
    if (isNaN(current) || current < 0 || current > 10) return null;

    // Formula: Target = ((semNum - 1) * Current + ReqSGPA) / semNum
    // ReqSGPA = semNum * Target - (semNum - 1) * Current
    const required = semNum * target - (semNum - 1) * current;
    const maxPossible = ((semNum - 1) * current + 10) / semNum;

    let explanation = '';
    const roundedReq = Math.round(required * 100) / 100;
    const roundedMax = Math.round(maxPossible * 100) / 100;

    if (required > 10) {
      explanation = `Reaching ${target.toFixed(2)} CGPA requires ${roundedReq.toFixed(2)} SGPA (exceeds 10.0). The maximum achievable CGPA with a 10.0 SGPA is ${roundedMax.toFixed(2)}.`;
    } else if (required <= 0) {
      explanation = `Your target CGPA of ${target.toFixed(2)} is already secured as long as you pass all subjects!`;
    } else if (semNum === 2) {
      explanation = `With a 1st Sem CGPA of ${current.toFixed(2)}, you need an SGPA of ${roundedReq.toFixed(2)} in Semester 2 to reach a cumulative ${target.toFixed(2)} CGPA.`;
    } else {
      explanation = `With a current CGPA of ${current.toFixed(2)}, you need an SGPA of ${roundedReq.toFixed(2)} in Semester ${semNum} to reach your target ${target.toFixed(2)} CGPA.`;
    }

    return {
      requiredSGPA: roundedReq,
      maxPossibleCGPA: roundedMax,
      achievable: required <= 10,
      explanation,
    };
  }, [semNum, targetCgpa, currentCgpa]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ contain: 'strict' }}>
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.55_0.22_270_/_0.12)] blur-[60px] dark:bg-[oklch(0.55_0.22_270_/_0.08)]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[oklch(0.60_0.20_300_/_0.10)] blur-[60px] dark:bg-[oklch(0.60_0.20_300_/_0.06)]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.65_0.15_330_/_0.06)] blur-[50px] dark:bg-[oklch(0.65_0.15_330_/_0.04)]" />
      </div>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
        {/* ── Header ── */}
        <header className="animate-fade-in-up flex w-full items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/10">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="gradient-text text-2xl font-black tracking-tight sm:text-3xl">
                  EaseGPA
                </h1>
                <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:inline-block">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Effortless SGPA calculation &amp; CGPA goal planning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset button */}
            {(selectedSemester || selectedCycle || selectedBranch || currentCgpa || targetCgpa) && (
              <button
                id="reset-all"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="group relative flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3.5 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5 active:scale-95"
              >
                <RotateCcw className="h-[15px] w-[15px] text-muted-foreground transition-all duration-300 group-hover:rotate-[-180deg] group-hover:text-destructive" />
                <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-destructive">
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
                className={`absolute h-[18px] w-[18px] text-amber-400 transition-all duration-300 ${theme === 'dark'
                  ? 'rotate-0 scale-100 opacity-100'
                  : 'rotate-90 scale-0 opacity-0'
                  }`}
              />
              <Moon
                className={`absolute h-[18px] w-[18px] text-indigo-500 transition-all duration-300 ${theme === 'dark'
                  ? '-rotate-90 scale-0 opacity-0'
                  : 'rotate-0 scale-100 opacity-100'
                  }`}
              />
            </button>
          </div>
        </header>

        {/* ── Configuration Panel ── */}
        <Card
          className="glass animate-fade-in-up flex w-full flex-col gap-6 rounded-2xl border border-border/70 p-6 sm:p-8 shadow-xl shadow-black/5"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Card Header (Left-aligned) */}
          <div className="flex flex-col gap-1 text-left border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
                <Target className="h-3 w-3" /> Academic Setup
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Semester &amp; Goal Configuration
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Configure your semester, discipline, and target scores to generate your roadmap.
            </p>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {/* 1. Semester */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="semester-select"
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                  1
                </span>
                Semester
              </label>
              <Select
                value={selectedSemester}
                onValueChange={handleSemesterChange}
              >
                <SelectTrigger
                  className="h-10 w-full rounded-xl bg-background/50 transition-all duration-200 hover:border-primary/40 focus:border-primary"
                  id="semester-select"
                >
                  <SelectValue placeholder="Select semester" />
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
              <span className="text-[11px] text-muted-foreground">
                Current term of study
              </span>
            </div>

            {/* 2. Cycle (if <= 2) or Branch (if > 2) */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor={
                  isFirstYear
                    ? 'cycle-select'
                    : isHigherSem
                      ? 'branch-select'
                      : 'cycle-branch-disabled'
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                  2
                </span>
                {isFirstYear ? 'Cycle' : isHigherSem ? 'Branch' : 'Cycle / Branch'}
              </label>

              {!selectedSemester ? (
                <Select disabled>
                  <SelectTrigger
                    className="h-10 w-full cursor-not-allowed rounded-xl opacity-60"
                    id="cycle-branch-disabled"
                  >
                    <SelectValue placeholder="Select cycle or branch" />
                  </SelectTrigger>
                </Select>
              ) : isFirstYear ? (
                <Select
                  value={selectedCycle}
                  onValueChange={(value) => setSelectedCycle(value)}
                >
                  <SelectTrigger
                    className="h-10 w-full animate-fade-in rounded-xl bg-background/50 transition-all duration-200 hover:border-primary/40 focus:border-primary"
                    id="cycle-select"
                  >
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="sr-only">Cycles</SelectLabel>
                      <SelectItem value="physics">Physics cycle</SelectItem>
                      <SelectItem value="chemistry">Chemistry cycle</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={selectedBranch}
                  onValueChange={(value) => setSelectedBranch(value)}
                >
                  <SelectTrigger
                    className="h-10 w-full animate-fade-in rounded-xl bg-background/50 transition-all duration-200 hover:border-primary/40 focus:border-primary"
                    id="branch-select"
                  >
                    <SelectValue placeholder="Select branch" />
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
              <span className="text-[11px] text-muted-foreground">
                {isFirstYear
                  ? 'Physics or Chemistry cycle'
                  : isHigherSem
                    ? 'Engineering discipline'
                    : 'Requires semester selection'}
              </span>
            </div>

            {/* 3. Current / 1st Sem CGPA */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="current-cgpa"
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                  3
                </span>
                {semNum === 2
                  ? '1st Sem CGPA'
                  : isHigherSem
                    ? 'Current CGPA'
                    : 'Current CGPA'}
              </label>

              {semNum === 1 ? (
                <div className="flex h-10 w-full items-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 text-xs text-muted-foreground">
                  Starting semester (N/A)
                </div>
              ) : (
                <input
                  id="current-cgpa"
                  type="text"
                  inputMode="decimal"
                  placeholder={semNum === 2 ? 'e.g. 8.20 (1st sem)' : 'e.g. 8.15'}
                  disabled={!selectedSemester}
                  value={currentCgpa}
                  onChange={handleCgpaInput(setCurrentCgpa)}
                  className="h-10 w-full rounded-xl border border-border/80 bg-background/50 px-3 text-sm font-medium transition-all duration-200 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              )}
              <span className="text-[11px] text-muted-foreground">
                {semNum === 2
                  ? 'Your GPA from 1st semester'
                  : isHigherSem
                    ? `Cumulative score before sem ${semNum}`
                    : semNum === 1
                      ? 'No prior college GPA'
                      : 'Select semester first'}
              </span>
            </div>

            {/* 4. Target CGPA */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="target-cgpa"
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                  4
                </span>
                Target CGPA
              </label>

              <input
                id="target-cgpa"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 8.50"
                disabled={!selectedSemester}
                value={targetCgpa}
                onChange={handleCgpaInput(setTargetCgpa)}
                className="h-10 w-full rounded-xl border border-border/80 bg-background/50 px-3 text-sm font-medium transition-all duration-200 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span className="text-[11px] text-muted-foreground">
                {selectedSemester
                  ? `Goal CGPA after sem ${selectedSemester}`
                  : 'Select semester first'}
              </span>
            </div>
          </div>

          {/* ── Free Target CGPA Slider ── */}
          {selectedSemester && (
            <div className="animate-fade-in rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border/40 pb-2.5 mb-3">
                <span className="flex items-center gap-1.5 text-primary">
                  <Target className="h-3.5 w-3.5" />
                  Target CGPA Slider
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary text-xs">
                  {targetCgpa && !isNaN(parseFloat(targetCgpa))
                    ? `${parseFloat(targetCgpa).toFixed(2)} CGPA`
                    : 'Slide or type above'}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <input
                  type="range"
                  min="5.0"
                  max="10.0"
                  step="0.01"
                  list="target-slider-ticks"
                  value={
                    targetCgpa && !isNaN(parseFloat(targetCgpa))
                      ? Math.max(5.0, Math.min(10.0, parseFloat(targetCgpa)))
                      : 7.5
                  }
                  onChange={handleSliderSnapChange}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary transition-all hover:opacity-90"
                />
                <datalist id="target-slider-ticks">
                  {SNAP_POINTS.map((pt) => (
                    <option key={pt} value={pt.toFixed(1)} label={pt.toFixed(1)} />
                  ))}
                </datalist>
                <div className="flex justify-between px-0.5 text-[10px] text-muted-foreground">
                  {SNAP_POINTS.map((pt) => {
                    const tick = pt.toFixed(1);
                    const isSelected =
                      targetCgpa &&
                      !isNaN(parseFloat(targetCgpa)) &&
                      Math.abs(parseFloat(targetCgpa) - pt) < 0.01;
                    return (
                      <button
                        key={tick}
                        type="button"
                        onClick={() => setTargetCgpa(pt.toFixed(2))}
                        className={`hover:text-primary transition-all cursor-pointer ${isSelected ? 'font-bold text-primary scale-110' : ''
                          }`}
                      >
                        {tick}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Target SGPA Insight Banner ── */}
          {reqSGPAInfo && (() => {
            const isUnachievable = !reqSGPAInfo.achievable || reqSGPAInfo.requiredSGPA > 10;
            return (
              <div
                className={`animate-fade-in flex flex-col justify-between gap-4 rounded-xl border p-4 sm:p-5 md:flex-row md:items-center transition-all duration-300 ${isUnachievable
                  ? 'border-red-500/70 bg-red-500/15 dark:bg-red-950/50 dark:border-red-500/60 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30'
                  : 'border-primary/25 bg-primary/5'
                  }`}
              >
                <div className="flex items-start gap-3.5 text-left">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${isUnachievable
                      ? 'bg-red-500/20 text-red-600 dark:text-red-400 ring-1 ring-red-500/40'
                      : 'bg-primary/15 text-primary'
                      }`}
                  >
                    {isUnachievable ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <TrendingUp className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold tracking-wider uppercase ${isUnachievable
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-primary'
                          }`}
                      >
                        Target Insight
                      </span>
                      {isUnachievable ? (
                        <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm shadow-red-600/30 uppercase tracking-wide">
                          NOT POSSIBLE (EXCEEDS 10.0)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Achievable
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-xs sm:text-sm ${isUnachievable
                        ? 'text-red-900 dark:text-red-200 font-semibold'
                        : 'text-foreground/80'
                        }`}
                    >
                      {reqSGPAInfo.explanation}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex shrink-0 items-center gap-4 rounded-xl border px-4 py-2.5 shadow-sm ${isUnachievable
                    ? 'border-red-500/40 bg-red-500/20 dark:bg-red-950/70 shadow-red-500/10'
                    : 'border-border/60 bg-card/80'
                    }`}
                >
                  <div className="text-left">
                    <div
                      className={`text-[10px] font-bold tracking-wider uppercase ${isUnachievable
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-muted-foreground'
                        }`}
                    >
                      Required SGPA
                    </div>
                    <div
                      className={`text-2xl font-black tracking-tight ${isUnachievable
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-primary'
                        }`}
                    >
                      {reqSGPAInfo.requiredSGPA > 0 ? reqSGPAInfo.requiredSGPA.toFixed(2) : 'Passed'}
                    </div>
                  </div>
                  {reqSGPAInfo.maxPossibleCGPA != null && isUnachievable && (
                    <div className="border-l border-red-500/40 pl-3.5 text-left">
                      <div className="text-[10px] font-bold tracking-wider text-red-700/80 dark:text-red-300/80 uppercase">
                        Max Possible
                      </div>
                      <div className="text-base font-black text-red-950 dark:text-red-100">
                        {reqSGPAInfo.maxPossibleCGPA.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Guided Next Steps (when form is not ready yet) ── */}
          {!(
            (isFirstYear && (selectedCycle === 'physics' || selectedCycle === 'chemistry')) ||
            (isHigherSem && selectedBranch)
          ) && (
              <div className="animate-fade-in flex items-center gap-3.5 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 sm:p-5 text-left text-sm text-muted-foreground">
                <Compass className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {!selectedSemester
                      ? 'Step 1: Choose your Semester above to start'
                      : isFirstYear && !selectedCycle
                        ? 'Step 2: Select your Cycle (Physics or Chemistry) to load subjects'
                        : isHigherSem && !selectedBranch
                          ? 'Step 2: Select your Engineering Branch to load subjects'
                          : 'Complete configuration to unlock calculation'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Once your stream is selected, you can enter MSE/CIA marks and choose target grades.
                  </p>
                </div>
              </div>
            )}

          {/* ── FirstYear Form ── */}
          {isFirstYear &&
            (selectedCycle === 'physics' || selectedCycle === 'chemistry') && (
              <FirstYear
                selectedCycle={selectedCycle}
                selectedSemester={selectedSemester}
                targetSGPA={reqSGPAInfo?.requiredSGPA}
              />
            )}

          {/* ── SecondYear / Higher Sem Form ── */}
          {isHigherSem && selectedBranch && (
            <SecondYear
              selectedBranch={selectedBranch}
              selectedSemester={selectedSemester}
              targetSGPA={reqSGPAInfo?.requiredSGPA}
            />
          )}
        </Card>



        {/* ── Footer ── */}
        <footer className="mt-auto flex w-full items-center justify-center gap-6 pb-2 pt-4 sm:pb-4 sm:pt-8">
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

          {/* Syllabus Reference */}
          <a
            id="syllabus-link"
            href="https://www.dsu.edu.in/images/Engineering/DataScience-dept/Syllabus/2023-2027_Batch.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="DSU Syllabus PDF"
            className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
          >
            <FileText className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm font-semibold tracking-wide">Reference</span>
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

          </div>
        </div>
      )}

      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
