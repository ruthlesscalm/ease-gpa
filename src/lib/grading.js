/**
 * EaseGPA — Grading & SGPA calculation logic
 * Dayananda Sagar University grading system
 *
 * Marks breakdown for exam subjects (3/4 credits):
 *   MSE:  written for 40, scaled to 30
 *   CIA:  30 marks (or 60 for EGDT)
 *   SSE:  written for 80, scaled to 40  |  5 modules × 16 marks
 *   Total = MSE_scaled + CIA + SSE_scaled = 100
 *
 * Non-exam subjects (1/2 credits):
 *   Marks given directly. 1-credit subjects are out of 50, scaled to 100.
 */

export const GRADE_TABLE = [
  { min: 90, grade: 'O', points: 10 },
  { min: 80, grade: 'A+', points: 9 },
  { min: 70, grade: 'A', points: 8 },
  { min: 60, grade: 'B+', points: 7 },
  { min: 50, grade: 'B', points: 6 },
  { min: 40, grade: 'P', points: 5 },
];

export const FAIL_GRADE = { grade: 'F', points: 0 };

/** Get grade and grade points from total marks (out of 100) */
export function getGradeFromMarks(totalMarks) {
  for (const entry of GRADE_TABLE) {
    if (totalMarks >= entry.min) {
      return { grade: entry.grade, points: entry.points };
    }
  }
  return { ...FAIL_GRADE };
}

/** Whether a subject has SSE (Semester End Exam) — only 3+ credit subjects */
export function hasSSE(subject) {
  return subject.credits >= 3;
}

/**
 * Calculate internal marks from raw MSE and CIA inputs.
 * For MSE subjects: (mse/40)*30 + cia
 * For non-MSE subjects: just cia
 */
export function calculateInternal(mseRaw, ciaRaw, subject) {
  if (subject.mse) {
    return (mseRaw / 40) * 30 + ciaRaw;
  }
  return ciaRaw;
}

/**
 * For non-SSE subjects, get the total marks used for grading.
 * 1-credit subjects: scale from 50 to 100.
 * Others: internal marks are the total.
 */
export function getNonSSETotal(mseRaw, ciaRaw, subject) {
  const internal = calculateInternal(mseRaw, ciaRaw, subject);
  if (subject.credits === 1) {
    return (internal / 50) * 100;
  }
  return internal;
}

/** Get list of grades achievable given internal marks (max SSE = 40 scaled) */
export function getAchievableGrades(internalMarks) {
  const maxTotal = internalMarks + 40;
  return GRADE_TABLE.filter((g) => g.min <= maxTotal);
}

/**
 * Calculate SSE marks needed to reach a target total.
 * Returns scaled (out of 40), actual (out of 80), and per-module (out of 16).
 */
export function calculateSSENeeded(targetMinMarks, internalMarks) {
  const sseScaled = targetMinMarks - internalMarks;

  if (sseScaled <= 0) {
    return {
      sseScaled: 0,
      sseActual: 0,
      perModule: 0,
      isPossible: true,
      alreadyAchieved: true,
    };
  }

  if (sseScaled > 40) {
    return {
      sseScaled: Math.round(sseScaled * 100) / 100,
      sseActual: Math.round(sseScaled * 2 * 100) / 100,
      perModule: Math.round(((sseScaled * 2) / 5) * 100) / 100,
      isPossible: false,
      alreadyAchieved: false,
    };
  }

  const sseActual = sseScaled * 2;
  const perModule = sseActual / 5;

  return {
    sseScaled: Math.round(sseScaled * 100) / 100,
    sseActual: Math.round(sseActual * 100) / 100,
    perModule: Math.round(perModule * 100) / 100,
    isPossible: true,
    alreadyAchieved: false,
  };
}

/**
 * Calculate SGPA from an array of { credits, gradePoints } objects.
 * Only includes subjects that have gradePoints defined.
 */
export function calculateSGPA(subjectResults) {
  let totalCredits = 0;
  let weightedSum = 0;

  for (const r of subjectResults) {
    if (r.gradePoints != null) {
      totalCredits += r.credits;
      weightedSum += r.credits * r.gradePoints;
    }
  }

  if (totalCredits === 0) return null;
  return Math.round((weightedSum / totalCredits) * 100) / 100;
}
