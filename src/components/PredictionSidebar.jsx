import { useState, useMemo } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

const BADGE_DOT_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-cyan-500',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-600',
  'bg-teal-600',
];

const GRADE_BADGE_STYLES = {
  O: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'A+': 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  A: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'B+': 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  B: 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400',
  C: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  P: 'border-slate-500/40 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  F: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
};

function getClassification(sgpa, targetSGPA) {
  if (sgpa == null || isNaN(sgpa) || sgpa <= 0) {
    return {
      title: 'Enter Marks',
      icon: '🎯',
      desc: 'Fill in your marks on the left to see live prediction.',
    };
  }

  if (targetSGPA != null && targetSGPA > 0) {
    if (sgpa >= targetSGPA) {
      return {
        title: 'Target Met! 🎉',
        icon: '⭐',
        desc: `Predicted SGPA exceeds your ${targetSGPA.toFixed(2)} goal!`,
      };
    }
  }

  if (sgpa >= 9.0) {
    return {
      title: 'Outstanding Distinction',
      icon: '🏆',
      desc: 'Exceptional academic excellence across all subjects!',
    };
  }
  if (sgpa >= 7.75) {
    return {
      title: 'Distinction',
      icon: '🌟',
      desc: 'Top tier performance. Keep pushing!',
    };
  }
  if (sgpa >= 6.75) {
    return {
      title: 'First Class',
      icon: '⭐',
      desc: 'Strong. Boost lowest subject SEE by 10 for Distinction.',
    };
  }
  if (sgpa >= 5.75) {
    return {
      title: 'Second Class',
      icon: '📈',
      desc: 'Good progress. Aim higher on external exams.',
    };
  }
  if (sgpa >= 4.0) {
    return {
      title: 'Pass Class',
      icon: '✓',
      desc: 'Passing threshold secured. Target higher grades!',
    };
  }
  return {
    title: 'Needs Improvement',
    icon: '⚠️',
    desc: 'Higher internal/SEE scores required.',
  };
}

export default function PredictionSidebar({
  sgpa,
  results = [],
  totalCredits = 20,
  targetSGPA,
  subtitle = '',
}) {
  const [copied, setCopied] = useState(false);

  const validResults = useMemo(
    () => results.filter((r) => r.gradePoints != null && !r.hasInvalidMarks),
    [results],
  );

  const gradedCount = validResults.length;
  const totalSubjectCount = results.length;

  const countedCredits = useMemo(
    () => validResults.reduce((sum, r) => sum + r.credits, 0),
    [validResults],
  );

  const avgPercentage = useMemo(() => {
    if (validResults.length === 0) return 0;
    const sum = validResults.reduce((acc, r) => {
      const score = r.totalMarks != null ? r.totalMarks : (r.internal / 60) * 100;
      return acc + score;
    }, 0);
    return Math.round((sum / validResults.length) * 10) / 10;
  }, [validResults]);

  const classification = getClassification(sgpa, targetSGPA);

  const handleCopy = async () => {
    const text = `📊 EaseGPA Live SGPA Prediction
${subtitle ? `${subtitle}\n` : ''}Predicted SGPA: ${sgpa != null && sgpa > 0 ? sgpa.toFixed(2) : '0.00'} / 10.0
Standing: ${classification.title} ${classification.icon}
Percentage: ${avgPercentage}% (${countedCredits}/${totalCredits} Credits)

Subject Breakdown:
${results
  .map((r) => {
    const marksDisplay = r.totalMarks != null ? Math.round(r.totalMarks * 10) / 10 : Math.round(r.internal * 10) / 10;
    return `• ${r.alias} (${r.credits}cr): ${marksDisplay}/100 -> Grade ${r.grade || '—'} (${r.credits}cr × ${r.gradePoints ?? 0})`;
  })
  .join('\n')}
`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl shadow-indigo-500/5">
      {/* ── Top Hero Gradient Card ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#5338ec] via-[#6340ed] to-[#7f42ef] p-6 text-white shadow-inner">
        {/* Decorative blur circle */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          LIVE SGPA PREDICTION
        </div>

        {/* Score Gauge & Status Row */}
        <div className="mt-5 flex items-center gap-4">
          {/* Circular Score Gauge */}
          <div className="relative flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-[5px] border-white/30 bg-white/10 shadow-lg backdrop-blur-md">
            <span className="text-2xl font-black tracking-tight leading-none text-white">
              {sgpa != null && sgpa > 0 ? sgpa.toFixed(2) : '0.00'}
            </span>
            <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-white/80">
              / 10 SGPA
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
              Expected SGPA
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              {classification.title} {classification.icon}
            </span>
            <p className="mt-0.5 text-[11px] leading-snug text-white/85">
              {classification.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ── Lower Card Body ── */}
      <div className="flex flex-col gap-5 p-5">
        {/* 3 Stats Badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-border/40 bg-muted/40 p-2.5">
            <div className="text-base font-black text-foreground">
              {avgPercentage}%
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">
              Percentage
            </div>
          </div>

          <div className="rounded-2xl border border-border/40 bg-muted/40 p-2.5">
            <div className="text-base font-black text-foreground">
              {countedCredits}/{totalCredits}
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">
              Credits counted
            </div>
          </div>

          <div className="rounded-2xl border border-border/40 bg-muted/40 p-2.5">
            <div className="text-base font-black text-foreground">
              {gradedCount}/{totalSubjectCount}
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">
              Subjects done
            </div>
          </div>
        </div>

        {/* Subject Breakdown List */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Subject Breakdown
          </span>

          <div className="flex flex-col divide-y divide-border/40">
            {results.map((r, idx) => {
              const dotColor = BADGE_DOT_COLORS[idx % BADGE_DOT_COLORS.length];
              const marksDisplay =
                r.totalMarks != null
                  ? Math.round(r.totalMarks * 10) / 10
                  : Math.round(r.internal * 10) / 10;

              return (
                <div
                  key={r.alias}
                  className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  {/* Left: Dot + Alias + Marks */}
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    <span className="text-xs font-bold text-foreground">
                      {r.alias}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {marksDisplay}
                    </span>
                  </div>

                  {/* Right: Credits x Points + Grade Pill */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {r.credits}cr × {r.gradePoints ?? 0}
                    </span>
                    <span
                      className={`inline-flex w-7 items-center justify-center rounded-md border px-1 py-0.5 text-[10px] font-bold ${
                        r.grade
                          ? GRADE_BADGE_STYLES[r.grade] ||
                            'border-border bg-muted/50'
                          : 'border-dashed border-border/80 text-muted-foreground'
                      }`}
                    >
                      {r.grade || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-border/80 bg-background py-2.5 text-xs font-bold text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-muted/50 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95 active:scale-95"
          >
            <FileText className="h-3.5 w-3.5" />
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
