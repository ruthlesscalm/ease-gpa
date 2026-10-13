import FirstYear from '@/components/FirstYear';
import SecondYear from '@/components/secondyear/SecondYear';
import PredictionSidebar from '@/components/PredictionSidebar';
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
  AlertTriangle,
  ArrowRight,
  Sliders,
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
  const [calcData, setCalcData] = useState({
    sgpa: null,
    results: [],
    totalCredits: 20,
    hasAnyMarks: false,
    subtitle: '',
  });
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

  // Close support modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showSupport) {
        setShowSupport(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSupport]);

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
    setCalcData({
      sgpa: null,
      results: [],
      totalCredits: 20,
      hasAnyMarks: false,
      subtitle: '',
    });
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
    setCalcData({
      sgpa: null,
      results: [],
      totalCredits: 20,
      hasAnyMarks: false,
      subtitle: '',
    });
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
      explanation = `Reaching a ${target.toFixed(2)} CGPA requires an SGPA of ${roundedReq.toFixed(2)} (exceeds the 10.00 scale). With a perfect 10.00 SGPA, your maximum possible CGPA this semester is ${roundedMax.toFixed(2)}.`;
    } else if (required <= 0) {
      explanation = `Your target CGPA of ${target.toFixed(2)} is secured as long as you clear all semester courses.`;
    } else if (semNum === 2) {
      explanation = `With a 1st Sem CGPA of ${current.toFixed(2)}, you need an SGPA of ${roundedReq.toFixed(2)} in Semester 2 to achieve a cumulative ${target.toFixed(2)} CGPA.`;
    } else {
      explanation = `With a current CGPA of ${current.toFixed(2)}, you need an SGPA of ${roundedReq.toFixed(2)} in Semester ${semNum} to achieve your cumulative ${target.toFixed(2)} CGPA goal.`;
    }

    return {
      requiredSGPA: roundedReq,
      maxPossibleCGPA: roundedMax,
      achievable: required <= 10,
      explanation,
    };
  }, [semNum, targetCgpa, currentCgpa]);

  const hasSelectedStream =
    (isFirstYear && (selectedCycle === 'physics' || selectedCycle === 'chemistry')) ||
    (isHigherSem && Boolean(selectedBranch));

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
        {/* ── Semantic Header ── */}
        <header className="flex w-full items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/60 text-primary">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  EaseGPA
                </span>
                <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  DSU
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Engineering SGPA Calculator &amp; Exam Goal Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset button */}
            {(selectedSemester || selectedCycle || selectedBranch || currentCgpa || targetCgpa) && (
              <button
                id="reset-all"
                type="button"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              id="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* ── Main Workspace Grid (Responsive 2-column on desktop, single unified structure) ── */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column (8 cols): Setup & Subject Marks Strategy Form */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* ── Section 1: Academic & Target Setup ── */}
            <Card className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
              <div className="border-b border-border pb-3">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Step 1 • Configuration
                </span>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Academic Term &amp; Target CGPA
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Select your current term, stream, and target cumulative score to calculate the required semester SGPA.
                </p>
              </div>

              {/* 4 Form Controls */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Semester */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="semester-select"
                    className="text-xs font-semibold text-foreground"
                  >
                    1. Semester
                  </label>
                  <Select
                    value={selectedSemester}
                    onValueChange={handleSemesterChange}
                  >
                    <SelectTrigger
                      className="h-9 w-full rounded-lg bg-background text-xs transition-colors"
                      id="semester-select"
                    >
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="sr-only">Semesters</SelectLabel>
                        {semesters.map((v) => (
                          <SelectItem value={v.slice(0, 1)} key={v.slice(0, 1)}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-[11px] text-muted-foreground">
                    Current study term
                  </span>
                </div>

                {/* 2. Cycle or Branch */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor={
                      isFirstYear
                        ? 'cycle-select'
                        : isHigherSem
                          ? 'branch-select'
                          : 'cycle-branch-disabled'
                    }
                    className="text-xs font-semibold text-foreground"
                  >
                    {isFirstYear ? '2. Cycle' : isHigherSem ? '2. Branch' : '2. Stream'}
                  </label>

                  {!selectedSemester ? (
                    <Select disabled>
                      <SelectTrigger
                        className="h-9 w-full cursor-not-allowed rounded-lg bg-muted/40 text-xs opacity-60"
                        id="cycle-branch-disabled"
                      >
                        <SelectValue placeholder="Select semester first" />
                      </SelectTrigger>
                    </Select>
                  ) : isFirstYear ? (
                    <Select
                      value={selectedCycle}
                      onValueChange={(value) => setSelectedCycle(value)}
                    >
                      <SelectTrigger
                        className="h-9 w-full rounded-lg bg-background text-xs transition-colors"
                        id="cycle-select"
                      >
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="sr-only">Cycles</SelectLabel>
                          <SelectItem value="physics">Physics Cycle</SelectItem>
                          <SelectItem value="chemistry">Chemistry Cycle</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={selectedBranch}
                      onValueChange={(value) => setSelectedBranch(value)}
                    >
                      <SelectTrigger
                        className="h-9 w-full rounded-lg bg-background text-xs transition-colors"
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
                      ? 'Physics or Chemistry'
                      : isHigherSem
                        ? 'Engineering discipline'
                        : 'Requires semester selection'}
                  </span>
                </div>

                {/* 3. Prior CGPA */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="current-cgpa"
                    className="text-xs font-semibold text-foreground"
                  >
                    {semNum === 2 ? '3. 1st Sem CGPA' : '3. Current CGPA'}
                  </label>

                  {semNum === 1 ? (
                    <div className="flex h-9 w-full items-center rounded-lg border border-dashed border-border bg-muted/30 px-3 text-xs text-muted-foreground">
                      Starting semester (N/A)
                    </div>
                  ) : (
                    <input
                      id="current-cgpa"
                      type="text"
                      inputMode="decimal"
                      placeholder={semNum === 2 ? 'e.g. 8.20' : 'e.g. 8.15'}
                      disabled={!selectedSemester}
                      value={currentCgpa}
                      onChange={handleCgpaInput(setCurrentCgpa)}
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {semNum === 2
                      ? 'Score from 1st semester'
                      : isHigherSem
                        ? `Cumulative score before sem ${semNum}`
                        : semNum === 1
                          ? 'First semester baseline'
                          : 'Select semester first'}
                  </span>
                </div>

                {/* 4. Target CGPA */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="target-cgpa"
                    className="text-xs font-semibold text-foreground"
                  >
                    4. Target CGPA
                  </label>

                  <input
                    id="target-cgpa"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 8.50"
                    disabled={!selectedSemester}
                    value={targetCgpa}
                    onChange={handleCgpaInput(setTargetCgpa)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {selectedSemester
                      ? `Target CGPA after sem ${selectedSemester}`
                      : 'Select semester first'}
                  </span>
                </div>
              </div>

              {/* ── Target CGPA Slider ── */}
              {selectedSemester && (
                <div className="rounded-lg border border-border bg-muted/30 p-3.5 sm:p-4">
                  <div className="mb-2.5 flex items-center justify-between border-b border-border/60 pb-2 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Sliders className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      Adjust Target CGPA
                    </span>
                    <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-bold text-foreground">
                      {targetCgpa && !isNaN(parseFloat(targetCgpa))
                        ? `${parseFloat(targetCgpa).toFixed(2)} CGPA`
                        : 'Slide or type'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="range"
                      min="5.0"
                      max="10.0"
                      step="0.01"
                      aria-label="Target CGPA Slider"
                      list="target-slider-ticks"
                      value={
                        targetCgpa && !isNaN(parseFloat(targetCgpa))
                          ? Math.max(5.0, Math.min(10.0, parseFloat(targetCgpa)))
                          : 7.5
                      }
                      onChange={handleSliderSnapChange}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary transition-opacity"
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
                            className={`cursor-pointer transition-colors hover:text-foreground ${
                              isSelected ? 'font-bold text-primary underline' : ''
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

              {/* ── Required SGPA Roadmap Banner ── */}
              {reqSGPAInfo && (() => {
                const isUnachievable =
                  !reqSGPAInfo.achievable || reqSGPAInfo.requiredSGPA > 10;
                return (
                  <div
                    role="status"
                    className={`flex flex-col justify-between gap-3 rounded-lg border p-4 transition-colors md:flex-row md:items-center ${
                      isUnachievable
                        ? 'border-destructive/40 bg-destructive/10 text-foreground'
                        : 'border-primary/30 bg-primary/5 text-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isUnachievable
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {isUnachievable ? (
                          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tracking-wider uppercase">
                            Required Semester SGPA
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              isUnachievable
                                ? 'bg-destructive text-white'
                                : 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {isUnachievable ? 'Exceeds 10.0' : 'Achievable'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {reqSGPAInfo.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2">
                      <div className="text-left">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Target SGPA
                        </div>
                        <div
                          className={`text-xl font-bold tracking-tight ${
                            isUnachievable ? 'text-destructive' : 'text-primary'
                          }`}
                        >
                          {reqSGPAInfo.requiredSGPA > 0
                            ? reqSGPAInfo.requiredSGPA.toFixed(2)
                            : 'Clear All'}
                        </div>
                      </div>
                      {reqSGPAInfo.maxPossibleCGPA != null && isUnachievable && (
                        <div className="border-l border-border pl-3 text-left">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Max CGPA
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            {reqSGPAInfo.maxPossibleCGPA.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Guided Setup Message if stream not chosen */}
              {!hasSelectedStream && (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-foreground">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">
                      {!selectedSemester
                        ? 'Select your semester above to begin.'
                        : isFirstYear && !selectedCycle
                          ? 'Select your cycle (Physics or Chemistry) to load the subject curriculum.'
                          : isHigherSem && !selectedBranch
                            ? 'Select your engineering branch to load the subject curriculum.'
                            : 'Complete configuration above to view course strategy.'}
                    </span>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Course internal weights (MSE/CIA/CAT) and exam targets will load automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* ── FirstYear Subject Form ── */}
              {isFirstYear &&
                (selectedCycle === 'physics' || selectedCycle === 'chemistry') && (
                  <FirstYear
                    selectedCycle={selectedCycle}
                    selectedSemester={selectedSemester}
                    targetSGPA={reqSGPAInfo?.requiredSGPA}
                    onSummaryChange={setCalcData}
                  />
                )}

              {/* ── SecondYear / Higher Sem Subject Form ── */}
              {isHigherSem && selectedBranch && (
                <SecondYear
                  selectedBranch={selectedBranch}
                  selectedSemester={selectedSemester}
                  targetSGPA={reqSGPAInfo?.requiredSGPA}
                  onSummaryChange={setCalcData}
                />
              )}
            </Card>
          </div>

          {/* Right Column (4 cols): Sticky Live SGPA Prediction Panel */}
          <div className="lg:sticky lg:top-6 lg:col-span-4">
            <PredictionSidebar
              sgpa={calcData.sgpa}
              results={calcData.results}
              totalCredits={calcData.totalCredits}
              targetSGPA={reqSGPAInfo?.requiredSGPA}
              subtitle={calcData.subtitle}
            />
          </div>
        </div>

        {/* ── Semantic Footer ── */}
        <footer className="mt-auto flex flex-wrap items-center justify-center gap-6 border-t border-border pt-6 pb-4 text-xs text-muted-foreground">
          <a
            id="github-link"
            href="https://github.com/ruthlesscalm"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile of ruthlesscalm"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Pavan Gowda S R</span>
          </a>

          <a
            id="syllabus-link"
            href="https://www.dsu.edu.in/images/Engineering/DataScience-dept/Syllabus/2023-2027_Batch.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Official DSU Engineering Syllabus Reference"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>DSU Syllabus Scheme</span>
          </a>

          <button
            type="button"
            onClick={() => setShowSupport(true)}
            aria-label="Support the project creator"
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Coffee className="h-4 w-4" aria-hidden="true" />
            <span>Support Project</span>
          </button>
        </footer>
      </main>

      {/* ── Accessible Support Dialog ── */}
      {showSupport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setShowSupport(false)}
        >
          <div
            className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSupport(false)}
              className="absolute top-4 right-4 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted text-primary">
              <Coffee className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="text-center">
              <h2 id="support-dialog-title" className="text-base font-bold text-foreground">
                Support EaseGPA
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                EaseGPA is an independent student utility built for DSU engineers. If it helped you save time during exams, contributions are appreciated!
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="rounded-lg border border-border bg-white p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    'upi://pay?pa=ruthlesscalm.dev@okicici&pn=PAVAN GOWDA S R&cu=INR&tn=EaseGPA Support',
                  )}`}
                  alt="UPI QR Code for EaseGPA"
                  width="180"
                  height="180"
                  className="h-[180px] w-[180px]"
                />
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Scan with any UPI App
              </p>
            </div>

            <div className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-2.5">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-medium text-muted-foreground">UPI ID</span>
                <span className="truncate text-xs font-semibold text-foreground">
                  ruthlesscalm.dev@okicici
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Copy UPI ID"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
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
