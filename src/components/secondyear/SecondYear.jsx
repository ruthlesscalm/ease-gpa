import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
  Clock,
} from 'lucide-react';
import {
  GRADE_TABLE,
  getGradeFromMarks,
  calculateInternal,
  getAchievableGrades,
  calculateSSENeeded,
  calculateSGPA,
} from '@/lib/grading';
import { getSubjects, getBranchLabel } from './data';

// Stable default for empty field data
const DEFAULT_FIELD = { value: '', isInvalid: false };

// ── Module Breakdown ──
const MODULE_INDICES = [1, 2, 3, 4, 5];

function ModuleBreakdown({ sseActual, perModule }) {
  const minModules = Math.ceil(sseActual / 16);
  return (
    <>
      <div className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
          Min. modules to study
        </span>
        <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
          {minModules} <span className="font-normal opacity-70">of 5</span>
        </span>
      </div>
      <div className="flex gap-1.5 pt-1">
        {MODULE_INDICES.map((m) => {
          const isNeeded = m <= minModules;
          const isMSECovered = m <= 2;
          return (
            <div
              key={m}
              className={`flex flex-1 flex-col items-center rounded-lg border px-1.5 py-2 text-center ${
                isNeeded
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
                {perModule}/16
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

// ── Grade badge ──
const GRADE_COLORS = {
  O: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'A+': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  A: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  'B+': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  B: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
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

// ── Subject Input Item ──
const SubjectItem = memo(function SubjectItem({
  subject,
  mseData,
  ciaData,
  handleInputChange,
}) {
  return (
    <Item
      variant="outline"
      className="rounded-xl border-border/60 transition-colors duration-200 hover:border-primary/20"
    >
      <ItemContent>
        <ItemTitle className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {subject.alias.slice(0, 2)}
          </span>
          <span>{subject.alias}</span>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {subject.credits} cr
          </span>
        </ItemTitle>
        <ItemDescription className="pl-9">{subject.name}</ItemDescription>
      </ItemContent>
      <FieldGroup className="grid basis-full grid-cols-1 gap-3 sm:grid-cols-2">
        <Field data-invalid={mseData.isInvalid}>
          <FieldLabel htmlFor={`mse-${subject.alias}`}>
            <span className="flex items-center gap-1.5">
              MSE Marks
              {mseData.isInvalid && (
                <span className="text-[10px] font-semibold text-destructive">
                  Invalid!
                </span>
              )}
            </span>
          </FieldLabel>
          <Input
            id={`mse-${subject.alias}`}
            type="text"
            inputMode="decimal"
            placeholder="Out of 40 Marks"
            disabled={!subject.mse}
            max={subject.maxMSE}
            min={0}
            value={mseData.value}
            className={
              mseData.isInvalid
                ? 'border-destructive/50 ring-2 ring-destructive/20'
                : ''
            }
            onChange={(e) =>
              handleInputChange(
                e.target.value,
                'mse',
                subject.alias,
                subject.maxMSE,
              )
            }
          />
        </Field>
        <Field data-invalid={ciaData.isInvalid}>
          <FieldLabel htmlFor={`cia-${subject.alias}`}>
            <span className="flex items-center gap-1.5">
              Other Component
              {ciaData.isInvalid && (
                <span className="text-[10px] font-semibold text-destructive">
                  Invalid!
                </span>
              )}
            </span>
          </FieldLabel>
          <Input
            id={`cia-${subject.alias}`}
            type="text"
            inputMode="decimal"
            placeholder={`Out of ${subject.maxCIA} Marks`}
            max={subject.maxCIA}
            min={0}
            value={ciaData.value}
            className={
              ciaData.isInvalid
                ? 'border-destructive/50 ring-2 ring-destructive/20'
                : ''
            }
            onChange={(e) =>
              handleInputChange(
                e.target.value,
                'cia',
                subject.alias,
                subject.maxCIA,
              )
            }
          />
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
                      /80
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
                      /16
                    </span>
                  </div>
                </div>
              </div>

              <ModuleBreakdown
                sseActual={sseInfo.sseActual}
                perModule={sseInfo.perModule}
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
const SecondYear = ({ selectedBranch, selectedSemester }) => {
  const subjects = getSubjects(selectedSemester, selectedBranch);

  const storagePrefix = `${selectedBranch}-${selectedSemester}`;
  const marksKey = `${MARKS_KEY}-${storagePrefix}`;
  const targetsKey = `${TARGETS_KEY}-${storagePrefix}`;

  const [marks, setMarks] = useState(() => loadJSON(marksKey));
  const [targetGrades, setTargetGrades] = useState(() => loadJSON(targetsKey));

  // Re-load from storage when branch/semester changes
  useEffect(() => {
    setMarks(loadJSON(marksKey));
    setTargetGrades(loadJSON(targetsKey));
  }, [marksKey, targetsKey]);

  // Persist marks
  useEffect(() => {
    localStorage.setItem(marksKey, JSON.stringify(marks));
  }, [marks, marksKey]);

  // Persist target grades
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
    const isInvalid = numValue > max || numValue < 0 || isNaN(numValue);
    setMarks((prev) => ({
      ...prev,
      [alias]: {
        ...prev[alias],
        [field]: { value, isInvalid },
      },
    }));
  }, []);

  // ── No data for this branch+semester yet ──
  if (!subjects) {
    return (
      <div
        className="animate-fade-in flex w-full flex-col items-center gap-4 py-12 text-center"
      >
        <div className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Clock className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Coming Soon
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Support for {getBranchLabel(selectedBranch)} — Semester{' '}
            {selectedSemester} is on the way. Stay tuned!
          </p>
        </div>
      </div>
    );
  }

  // ── Compute results ──
  const results = subjects.map((subject) => {
    const subjectMarks = marks[subject.alias] || {};
    const mseData = subjectMarks.mse || { value: '', isInvalid: false };
    const ciaData = subjectMarks.cia || { value: '', isInvalid: false };

    const mseValue = parseFloat(mseData.value) || 0;
    const ciaValue = parseFloat(ciaData.value) || 0;

    const hasMarksEntered = mseData.value !== '' || ciaData.value !== '';
    const hasInvalidMarks = mseData.isInvalid || ciaData.isInvalid;

    if (subject.sse) {
      const internal = calculateInternal(mseValue, ciaValue, subject);
      const achievable = getAchievableGrades(internal);
      const target = targetGrades[subject.alias];
      let sseInfo = null;

      if (target) {
        const gradeEntry = GRADE_TABLE.find((g) => g.grade === target);
        if (gradeEntry) {
          sseInfo = calculateSSENeeded(gradeEntry.min, internal);
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
      // Non-SSE subjects: scale to 100 for grading (handles maxCIA of 50, 100, etc.)
      const rawTotal = calculateInternal(mseValue, ciaValue, subject);
      const total = (rawTotal / subject.maxCIA) * 100;
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

  // ── SGPA ──
  const validResults = results.filter(
    (r) => r.gradePoints != null && !r.hasInvalidMarks,
  );
  const sgpa = validResults.length > 0 ? calculateSGPA(validResults) : null;

  const totalSubjects = subjects.length;
  const gradedCount = validResults.length;
  const hasAnyMarks = results.some((r) => r.hasMarksEntered);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* ── Marks Input Section ── */}
      <div className="flex items-center gap-2.5 pt-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Enter Your Marks
          </h2>
          <p className="text-xs text-muted-foreground">
            {getBranchLabel(selectedBranch)} — Semester {selectedSemester}
          </p>
        </div>
      </div>

      <form className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        {subjects.map((subject) => {
          const subjectState = marks[subject.alias] || {};
          const mseData = subjectState.mse || DEFAULT_FIELD;
          const ciaData = subjectState.cia || DEFAULT_FIELD;
          return (
            <SubjectItem
              key={subject.alias}
              subject={subject}
              mseData={mseData}
              ciaData={ciaData}
              handleInputChange={handleInputChange}
            />
          );
        })}
      </form>

      {/* ── Results Section ── */}
      {hasAnyMarks && (
        <div className="flex flex-col gap-5 lg:gap-6">
          {/* Section header */}
          <div className="flex items-center gap-2.5 border-t border-border/40 pt-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                SGPA Prediction
              </h2>
              <p className="text-xs text-muted-foreground">
                Select target grades for exam subjects to predict your SGPA
              </p>
            </div>
          </div>

          {/* Exam subjects */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase lg:col-span-2">
              Exam Subjects (SSE Required)
            </span>
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

          {/* Non-exam subjects */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase lg:col-span-2">
              Non-Exam Subjects
            </span>
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

          {/* ── SGPA Card ── */}
          {sgpa !== null && (
            <div className="glass rounded-2xl p-6 text-center lg:col-span-2">
              <div className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <TrendingUp className="h-3.5 w-3.5" />
                Predicted SGPA
              </div>
              <div className="gradient-text text-5xl font-extrabold tracking-tight">
                {sgpa.toFixed(2)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Based on {gradedCount} of {totalSubjects} subjects
              </div>

              {/* SGPA bar */}
              <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.65_0.20_300)] transition-all duration-500"
                  style={{ width: `${(sgpa / 10) * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between px-1 text-[10px] text-muted-foreground">
                <span>0</span>
                <span>10</span>
              </div>

              {gradedCount === totalSubjects && sgpa >= 9 && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Trophy className="h-3.5 w-3.5" />
                  Outstanding!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecondYear;
