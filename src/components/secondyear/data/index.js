import { subjects as aimlSem3 } from './sem3/aiml';
import { subjects as aimlSem4 } from './sem4/aiml';
import { subjects as cseSem3 } from './sem3/cse';
import { subjects as cseSem4 } from './sem4/cse';
import { subjects as cybersecSem3 } from './sem3/cybersec';
import { subjects as cybersecSem4 } from './sem4/cybersec';

export const branches = [
  { value: 'aiml', label: 'AI & ML' },
  { value: 'cse', label: 'CSE' },
  { value: 'cybersec', label: 'Cyber Security' },
];

const subjectData = {
  '3': {
    aiml: aimlSem3,
    cse: cseSem3,
    cybersec: cybersecSem3,
  },
  '4': {
    aiml: aimlSem4,
    cse: cseSem4,
    cybersec: cybersecSem4,
  },
  '5': {},
  '6': {},
};

export function getSubjects(semester, branch) {
  return subjectData[semester]?.[branch] || null;
}

export function getBranchLabel(branchValue) {
  return branches.find((b) => b.value === branchValue)?.label || branchValue;
}
