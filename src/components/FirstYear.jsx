import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import PredictionSidebar from '@/components/PredictionSidebar';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  Trophy,
} from 'lucide-react';
import {
  GRADE_TABLE,
  getGradeFromMarks,
  hasSSE,
  calculateInternal,
  getNonSSETotal,
  getAchievableGrades,
  calculateSSENeeded,
  calculateSGPA,
  normalizeMSE,
  calculateCATTotal,
} from '@/lib/grading';

const physicsCycleSubjects = [
  {
    alias: 'IEEE',
    name: 'Introduction to electrical and electronics engineering',
    credits: 3,
    mse: true,
  },
  {
    alias: 'CPPS',
    name: 'C programming for problem solving',
    credits: 4,
    mse: true,
  },
  { alias: 'PHY', name: 'Physics for CS cluster', credits: 4, mse: true },
  {
    alias: 'SE',
    name: 'Introduction to Sustainable Engineering',
    credits: 2,
    mse: true,
  },
  { alias: 'BIO', name: 'Biology for Enginners', credits: 2, mse: false },
  {
    alias: 'CIPE',
    name: 'Constitution of india and professional ethics',
    credits: 1,
    mse: false,
  },
];
const chemistryCycleSubjects = [
  {
    alias: 'CHEM',
    name: 'Chemistry for CSE Cluster',
    credits: 4,
    mse: true,
  },
  {
    alias: 'EGDT',
    name: 'Engineering Graphis and Design Thiking',
    credits: 4,
    mse: false,
    sseConfig: { maxActual: 60, modules: 3 },
  },
  { alias: 'OOP', name: 'Object Oriented Programming', credits: 3, mse: true },
  { alias: 'TE', name: 'Technical English', credits: 2, mse: false },
  { alias: 'ES', name: 'Environmental Science', credits: 2, mse: false },
  {
    alias: 'KN',
    name: 'Kannada',
    credits: 1,
    mse: false,
  },
];

const commonSubjects = [
  {
    alias: 'LADE',
    name: 'Linear Algebra and Differential Equations',
    credits: 4,
    mse: true,
  },
  {
    alias: 'SMC',
    name: 'Single and Multivariate Calculus',
    credits: 4,
    mse: true,
  },
];

function checkCredits(subObj) {
  const credits = subObj.credits;
  if (credits === 4 || credits == 3) {
    if (subObj.alias === 'EGDT') {
      return {
        placeholder: 'Out of 60 Marks',
        maxCIAMarks: 60,
        maxMSEMarks: 0,
      };
    }
    return {
      placeholder: 'Out of 30 Marks',
      maxCIAMarks: 30,
      maxMSEMarks: 40,
    };
  } else if (credits === 1) {
    return {
      placeholder: 'Out of 50 Marks',
      maxCIAMarks: 50,
      maxMSEMarks: 0,
    };
  } else if (credits === 2) {
    if (subObj.alias === 'SE') {
      return {
        placeholder: 'Out of 70 Marks',
        maxCIAMarks: 70,
        maxMSEMarks: 40,
      };
    }
    return {
      placeholder: 'Out of 100 Marks',
      maxCIAMarks: 100,
      maxMSEMarks: 0,
    };
  }
}

// Stable default for empty field data (avoids new object on every render)
const DEFAULT_FIELD = { value: '', isInvalid: false };

// ── Module Breakdown (extracted from IIFE) ──
const MODULE_INDICES = [1, 2, 3, 4, 5];

function ModuleBreakdown({ sseActual, perModule, numModules = 5, marksPerModule = 16, showMSEPrep = true }) {
  const minModules = Math.ceil(sseActual / marksPerModule);
  const indices = MODULE_INDICES.slice(0, numModules);
  return (
    <>
      <div className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
          Min. modules to study
        </span>
        <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
          {minModules} <span className="font-normal opacity-70">of {numModules}</span>
        </span>
      </div>
      <div className="flex gap-1.5 pt-1">
        {indices.map((m) => {
          const isNeeded = m <= minModules;
          const isMSECovered = showMSEPrep && m <= 2;
          return (
            <div
              key={m}
              className={`flex flex-1 flex-col items-center rounded-lg border px-1.5 py-2 text-center ${isNeeded
                  ? isMSECovered
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-foreground/15 bg-foreground/5'
                  : 'border-border/30 bg-muted/20 opacity-50'
                }`}
            >
              <span
                className={`text-xs font-bold ${isNeeded ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                M{m}
              </span>
              <span
                className={`text-[11px] font-medium ${isNeeded ? 'text-foreground/80' : 'text-muted-foreground'}`}
              >
                {perModule}/{marksPerModule}
              </span>
              {isMSECovered && (
                <span className="mt-0.5 text-[10px] font-medium text-primary">
                  MSE prep ✓
                </span>
              )}
              {!isNeeded && (
                <span className="mt-0.5 text-[11px] text-foreground">skip</span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Grade badge color mapping ──
const GRADE_COLORS = {
  O: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'A+': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  A: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  'B+': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  B: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  C: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  P: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  F: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

function GradeBadge({ grade, points, size = 'sm' }) {
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.F;
  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1 text-sm font-bold'
      : 'px-2 py-0.5 text-[11px] font-semibold';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${colors} ${sizeClasses}`}
    >
      {grade}
      {points != null && <span className="opacity-70">({points})</span>}
    </span>
  );
}

// ── Subject Input Item (memoized — only re-renders when its own marks change) ──
const SubjectItem = memo(function SubjectItem({
  subject,
  subjectState = {},
  handleInputChange,
}) {
  const creditInfo = checkCredits(subject);
  const isStandardCIA = creditInfo.maxCIAMarks === 30;

  const mseData = subjectState.mse || DEFAULT_FIELD;
  const ciaData = subjectState.cia || DEFAULT_FIELD;
  const cat1Data = subjectState.cat1 || DEFAULT_FIELD;
  const cat2Data = subjectState.cat2 || DEFAULT_FIELD;
  const cat3Data = subjectState.cat3 || DEFAULT_FIELD;

  const mseNum = parseFloat(mseData.value);
  const normalizedMSE =
    !isNaN(mseNum) && mseNum >= 0 && !mseData.isInvalid
      ? normalizeMSE(mseNum)
      : null;

  return (
    <Item
      variant="outline"
      className="rounded-xl border-border/60 p-3.5 transition-colors duration-200 hover:border-primary/20"
    >
      {/* ── Compact Header (Single Line) ── */}
      <div className="flex w-full items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-sm font-bold tracking-wide text-primary">
            {subject.alias}
          </span>
          <span
            className="truncate text-xs font-medium text-muted-foreground"
            title={subject.name}
          >
            {subject.name}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {subject.credits} cr
        </span>
      </div>

      <FieldGroup className="grid basis-full grid-cols-1 gap-3.5 pt-1 sm:grid-cols-2">
        {/* ── MSE Section ── */}
        <Field
          data-invalid={mseData.isInvalid}
          className="flex flex-col justify-between"
        >
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel
                htmlFor={`mse-${subject.alias}`}
                className="text-xs font-medium"
              >
                <span className="flex items-center gap-1.5">
                  MSE Marks
                  {mseData.isInvalid && (
                    <span className="text-[10px] font-semibold text-destructive">
                      Invalid!
                    </span>
                  )}
                </span>
              </FieldLabel>
              {subject.mse && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  Max 40 (Scaled to 30)
                </span>
              )}
            </div>
            <Input
              id={`mse-${subject.alias}`}
              type="text"
              inputMode="decimal"
              placeholder={subject.mse ? 'Out of 40 Marks' : 'No MSE'}
              disabled={!subject.mse}
              max={creditInfo.maxMSEMarks}
              min={0}
              value={mseData.value}
              className={
                mseData.isInvalid
                  ? 'h-8 text-xs border-destructive/50 ring-2 ring-destructive/20'
                  : 'h-8 text-xs'
              }
              onChange={(e) =>
                handleInputChange(
                  e.target.value,
                  'mse',
                  subject.alias,
                  creditInfo.maxMSEMarks,
                )
              }
            />
          </div>
          {subject.mse ? (
            <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
              <span>Normalized (to 30):</span>
              <span
                className={`font-semibold ${mseData.isInvalid ? 'text-destructive' : 'text-primary'
                  }`}
              >
                {normalizedMSE !== null ? normalizedMSE : '0'}{' '}
                <span className="font-normal opacity-70">/ 30</span>
              </span>
            </div>
          ) : (
            <div className="pt-1 text-[11px] text-muted-foreground/80">
              No MSE component
            </div>
          )}
        </Field>

        {/* ── CIA Section ── */}
        <Field
          data-invalid={ciaData.isInvalid}
          className="flex flex-col justify-between"
        >
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel
                htmlFor={`cia-${subject.alias}`}
                className="text-xs font-medium"
              >
                <span className="flex items-center gap-1.5">
                  CIA Marks
                  {ciaData.isInvalid && (
                    <span className="text-[10px] font-semibold text-destructive">
                      Invalid!
                    </span>
                  )}
                </span>
              </FieldLabel>
              <span className="text-[10px] font-medium text-muted-foreground">
                Max {creditInfo.maxCIAMarks}
              </span>
            </div>

            {isStandardCIA ? (
              <div className="space-y-2">
                {/* 3 CATs Row */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label
                      htmlFor={`cat1-${subject.alias}`}
                      className="mb-0.5 block text-center text-[10px] font-medium text-muted-foreground"
                    >
                      CAT 1
                    </label>
                    <Input
                      id={`cat1-${subject.alias}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="/ 10"
                      max={10}
                      min={0}
                      value={cat1Data.value}
                      className={`h-8 text-center text-xs ${cat1Data.isInvalid
                          ? 'border-destructive/50 ring-2 ring-destructive/20'
                          : ''
                        }`}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'cat1',
                          subject.alias,
                          10,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`cat2-${subject.alias}`}
                      className="mb-0.5 block text-center text-[10px] font-medium text-muted-foreground"
                    >
                      CAT 2
                    </label>
                    <Input
                      id={`cat2-${subject.alias}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="/ 10"
                      max={10}
                      min={0}
                      value={cat2Data.value}
                      className={`h-8 text-center text-xs ${cat2Data.isInvalid
                          ? 'border-destructive/50 ring-2 ring-destructive/20'
                          : ''
                        }`}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'cat2',
                          subject.alias,
                          10,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`cat3-${subject.alias}`}
                      className="mb-0.5 block text-center text-[10px] font-medium text-muted-foreground"
                    >
                      CAT 3
                    </label>
                    <Input
                      id={`cat3-${subject.alias}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="/ 10"
                      max={10}
                      min={0}
                      value={cat3Data.value}
                      className={`h-8 text-center text-xs ${cat3Data.isInvalid
                          ? 'border-destructive/50 ring-2 ring-destructive/20'
                          : ''
                        }`}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'cat3',
                          subject.alias,
                          10,
                        )
                      }
                    />
                  </div>
                </div>

                {/* Direct / Total Input */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                    Total CIA:
                  </span>
                  <Input
                    id={`cia-${subject.alias}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="or enter total / 30"
                    max={30}
                    min={0}
                    value={ciaData.value}
                    className={`h-7 text-xs ${ciaData.isInvalid
                        ? 'border-destructive/50 ring-2 ring-destructive/20'
                        : ''
                      }`}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        'cia',
                        subject.alias,
                        30,
                      )
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id={`cia-${subject.alias}`}
                  type="text"
                  inputMode="decimal"
                  placeholder={creditInfo.placeholder}
                  max={creditInfo.maxCIAMarks}
                  min={0}
                  value={ciaData.value}
                  className={`h-8 text-xs ${ciaData.isInvalid
                      ? 'border-destructive/50 ring-2 ring-destructive/20'
                      : ''
                    }`}
                  onChange={(e) =>
                    handleInputChange(
                      e.target.value,
                      'cia',
                      subject.alias,
                      creditInfo.maxCIAMarks,
                    )
                  }
                />
                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Score:</span>
                  <span
                    className={`font-semibold ${ciaData.isInvalid ? 'text-destructive' : 'text-primary'
                      }`}
                  >
                    {ciaData.value !== '' && !ciaData.isInvalid
                      ? ciaData.value
                      : '0'}{' '}
                    <span className="font-normal opacity-70">
                      / {creditInfo.maxCIAMarks}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Field>
      </FieldGroup>
    </Item>
  );
});

// ── Exam Subject Result Card ──
function ExamSubjectResult({
  subject,
  internal,
  achievableGrades,
  targetGrade,
  sseInfo,
  onTargetChange,
}) {
  const maxInternal = 60;

  return (
    <div className="rounded-xl border border-border/60 p-4 transition-colors duration-200">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
            {subject.alias.slice(0, 2)}
          </span>
          <span className="text-sm font-semibold">{subject.alias}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {subject.credits} cr
          </span>
        </div>
        {targetGrade && sseInfo && (
          <GradeBadge
            grade={targetGrade}
            points={GRADE_TABLE.find((g) => g.grade === targetGrade)?.points}
          />
        )}
      </div>

      {/* Internal marks */}
      <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-xs text-muted-foreground">Internal Marks</span>
        <span className="text-sm font-semibold">
          {Math.round(internal * 100) / 100}{' '}
          <span className="font-normal text-muted-foreground">
            / {maxInternal}
          </span>
        </span>
      </div>

      {/* Target grade selector */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Target Grade
        </label>
        <Select value={targetGrade || ''} onValueChange={onTargetChange}>
          <SelectTrigger className="w-full" id={`target-${subject.alias}`}>
            <SelectValue placeholder="Select target grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="sr-only">Target Grades</SelectLabel>
              {achievableGrades.map((g) => (
                <SelectItem key={g.grade} value={g.grade}>
                  {g.grade} — {g.points} grade points (≥ {g.min} marks)
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* SSE breakdown */}
      {targetGrade && sseInfo && (
        <div className="animate-fade-in space-y-2">
          {sseInfo.alreadyAchieved ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Already achieved — no SSE marks needed!
            </div>
          ) : !sseInfo.isPossible ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Not possible with current internal marks
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                  <div className="text-[10px] text-muted-foreground">
                    Scaled down
                  </div>
                  <div className="text-sm font-bold">
                    {sseInfo.sseScaled}
                    <span className="font-normal text-muted-foreground">
                      /40
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                  <div className="text-[10px] text-muted-foreground">
                    Target Marks
                  </div>
                  <div className="text-sm font-bold">
                    {sseInfo.sseActual}
                    <span className="font-normal text-muted-foreground">
                      /{sseInfo.maxActual || 80}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-primary/10 px-3 py-2 text-center">
                  <div className="text-[10px] text-muted-foreground">
                    Per Module
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {sseInfo.perModule}
                    <span className="font-normal text-muted-foreground">
                      /{sseInfo.marksPerModule || 16}
                    </span>
                  </div>
                </div>
              </div>

              {/* Minimum modules stat */}
              <ModuleBreakdown
                sseActual={sseInfo.sseActual}
                perModule={sseInfo.perModule}
                numModules={sseInfo.numModules}
                marksPerModule={sseInfo.marksPerModule}
                showMSEPrep={subject.mse}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Non-Exam Subject Result Card ──
function NonExamSubjectResult({ subject, totalMarks, grade, gradePoints }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
          {subject.alias.slice(0, 2)}
        </span>
        <span className="text-sm font-medium">{subject.alias}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {subject.credits} cr
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {Math.round(totalMarks * 100) / 100}/100
        </span>
        <GradeBadge grade={grade} points={gradePoints} />
      </div>
    </div>
  );
}

const MARKS_KEY = 'ease-gpa-marks';
const TARGETS_KEY = 'ease-gpa-target-grades';

function loadJSON(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ── Main Component ──
const FirstYear = ({ selectedCycle, selectedSemester, targetSGPA, onSummaryChange }) => {
  const storagePrefix = `${selectedCycle}-${selectedSemester}`;
  const marksKey = `${MARKS_KEY}-${storagePrefix}`;
  const targetsKey = `${TARGETS_KEY}-${storagePrefix}`;

  const [marks, setMarks] = useState(() => loadJSON(marksKey));
  const [targetGrades, setTargetGrades] = useState(() => loadJSON(targetsKey));

  // Re-load from storage when cycle/semester changes
  useEffect(() => {
    setMarks(loadJSON(marksKey));
    setTargetGrades(loadJSON(targetsKey));
  }, [marksKey, targetsKey]);

  // Persist marks to localStorage
  useEffect(() => {
    localStorage.setItem(marksKey, JSON.stringify(marks));
  }, [marks, marksKey]);

  // Persist target grades to localStorage
  useEffect(() => {
    localStorage.setItem(targetsKey, JSON.stringify(targetGrades));
  }, [targetGrades, targetsKey]);

  // Listen for storage clear (reset from App)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === marksKey && e.newValue === null) setMarks({});
      if (e.key === targetsKey && e.newValue === null) setTargetGrades({});
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [marksKey, targetsKey]);

  const handleInputChange = useCallback((value, field, alias, max) => {
    const numValue = parseFloat(value);
    const isInvalid =
      value !== '' && (numValue > max || numValue < 0 || isNaN(numValue));

    setMarks((prev) => {
      const currentSubject = prev[alias] || {};
      const updatedSubject = {
        ...currentSubject,
        [field]: { value, isInvalid },
      };

      // If one of the CAT fields changed, automatically update the CIA total
      if (field === 'cat1' || field === 'cat2' || field === 'cat3') {
        const c1 = field === 'cat1' ? value : currentSubject.cat1?.value || '';
        const c2 = field === 'cat2' ? value : currentSubject.cat2?.value || '';
        const c3 = field === 'cat3' ? value : currentSubject.cat3?.value || '';

        const sum =
          (parseFloat(c1) || 0) + (parseFloat(c2) || 0) + (parseFloat(c3) || 0);
        const hasAnyCat = c1 !== '' || c2 !== '' || c3 !== '';
        const catInvalid =
          (c1 !== '' &&
            (parseFloat(c1) > 10 || parseFloat(c1) < 0 || isNaN(parseFloat(c1)))) ||
          (c2 !== '' &&
            (parseFloat(c2) > 10 || parseFloat(c2) < 0 || isNaN(parseFloat(c2)))) ||
          (c3 !== '' &&
            (parseFloat(c3) > 10 || parseFloat(c3) < 0 || isNaN(parseFloat(c3)))) ||
          sum > 30;

        updatedSubject.cia = {
          value: hasAnyCat ? String(Math.round(sum * 100) / 100) : '',
          isInvalid: catInvalid,
        };
      }

      return {
        ...prev,
        [alias]: updatedSubject,
      };
    });
  }, []);

  // Memoize allSubjects so downstream useMemo deps are stable
  const allSubjects = useMemo(() => {
    const cycleSubjects =
      selectedCycle === 'physics'
        ? physicsCycleSubjects
        : chemistryCycleSubjects;
    const cmnSub = commonSubjects[selectedSemester - 1];
    return [cmnSub, ...cycleSubjects];
  }, [selectedCycle, selectedSemester]);

  // ── Compute results for all subjects ──
  const results = useMemo(() => {
    return allSubjects.map((subject) => {
      const subjectMarks = marks[subject.alias] || {};
      const mseData = subjectMarks.mse || DEFAULT_FIELD;
      const ciaData = subjectMarks.cia || DEFAULT_FIELD;

      const mseValue = parseFloat(mseData.value) || 0;
      const ciaValue = parseFloat(ciaData.value) || 0;

      const hasMseEntered = mseData.value !== '';
      const hasCiaEntered = ciaData.value !== '';
      const hasMarksEntered =
        (subject.mse ? hasMseEntered : false) || hasCiaEntered;
      const hasInvalidMarks =
        (subject.mse && mseData.isInvalid) || ciaData.isInvalid;

      if (hasSSE(subject)) {
        const internal = calculateInternal(mseValue, ciaValue, subject);
        const achievable = getAchievableGrades(internal);
        const target = targetGrades[subject.alias];
        let sseInfo = null;

        if (target) {
          const gradeEntry = GRADE_TABLE.find((g) => g.grade === target);
          if (gradeEntry) {
            sseInfo = calculateSSENeeded(
              gradeEntry.min,
              internal,
              subject.sseConfig,
            );
          }
        }

        return {
          ...subject,
          type: 'exam',
          internal,
          achievableGrades: achievable,
          targetGrade: target || null,
          sseInfo,
          gradePoints: target
            ? (GRADE_TABLE.find((g) => g.grade === target)?.points ?? null)
            : null,
          hasMarksEntered,
          hasInvalidMarks,
        };
      } else {
        const total = getNonSSETotal(mseValue, ciaValue, subject);
        const gradeInfo = getGradeFromMarks(total);

        return {
          ...subject,
          type: 'non-exam',
          totalMarks: total,
          grade: gradeInfo.grade,
          gradePoints:
            hasMarksEntered && !hasInvalidMarks ? gradeInfo.points : null,
          hasMarksEntered,
          hasInvalidMarks,
        };
      }
    });
  }, [marks, targetGrades, allSubjects]);

  // ── SGPA calculation ──
  const sgpa = useMemo(() => {
    const validResults = results.filter(
      (r) => r.gradePoints != null && !r.hasInvalidMarks,
    );
    if (validResults.length === 0) return null;
    return calculateSGPA(validResults);
  }, [results]);

  const totalCredits = useMemo(() => {
    return allSubjects.reduce((sum, s) => sum + s.credits, 0);
  }, [allSubjects]);

  const hasAnyMarks = results.some((r) => r.hasMarksEntered);

  // Notify parent of calculation summary
  useEffect(() => {
    if (onSummaryChange) {
      onSummaryChange({
        sgpa,
        results,
        totalCredits,
        hasAnyMarks,
        subtitle: `${selectedCycle === 'physics' ? 'Physics' : 'Chemistry'} Cycle — Semester ${selectedSemester}`,
      });
    }
  }, [sgpa, results, totalCredits, hasAnyMarks, selectedCycle, selectedSemester, onSummaryChange]);

  return (
    <>
      {(selectedCycle === 'physics' || selectedCycle === 'chemistry') && (
        <div className="flex w-full flex-col gap-6">
          {/* Marks Header */}
          <div className="flex items-center gap-2.5 pt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Enter Your Marks
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedCycle === 'physics' ? 'Physics' : 'Chemistry'} Cycle —
                Semester {selectedSemester}
              </p>
            </div>
          </div>

          {/* Subject Cards Form (2 columns) */}
          <form className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            {allSubjects.map((subject, index) => {
              const subjectState = marks[subject.alias] || {};
              return (
                <SubjectItem
                  key={subject.alias}
                  subject={subject}
                  subjectState={subjectState}
                  handleInputChange={handleInputChange}
                  index={index}
                />
              );
            })}
          </form>

          {/* Target Grades Section (when marks entered) */}
          {hasAnyMarks && (
            <div className="flex flex-col gap-4 border-t border-border/40 pt-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Target Grades & Exam Breakdown
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select target grades for exam subjects
                  </p>
                </div>
              </div>

              {/* Exam subjects */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Exam Subjects (SSE Required)
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {results
                    .filter((r) => r.type === 'exam')
                    .map((r) => (
                      <ExamSubjectResult
                        key={r.alias}
                        subject={r}
                        internal={r.internal}
                        achievableGrades={r.achievableGrades}
                        targetGrade={r.targetGrade}
                        sseInfo={r.sseInfo}
                        onTargetChange={(grade) =>
                          setTargetGrades((prev) => ({
                            ...prev,
                            [r.alias]: grade,
                          }))
                        }
                      />
                    ))}
                </div>
              </div>

              {/* Non-exam subjects */}
              {results.some(
                (r) =>
                  r.type === 'non-exam' &&
                  r.hasMarksEntered &&
                  !r.hasInvalidMarks,
              ) && (
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Non-Exam Subjects
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {results
                      .filter((r) => r.type === 'non-exam')
                      .map((r) =>
                        r.hasMarksEntered && !r.hasInvalidMarks ? (
                          <NonExamSubjectResult
                            key={r.alias}
                            subject={r}
                            totalMarks={r.totalMarks}
                            grade={r.grade}
                            gradePoints={r.gradePoints}
                          />
                        ) : null,
                      )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FirstYear;
