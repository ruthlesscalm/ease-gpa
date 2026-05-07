import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';

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
    mse: true,
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
        maxCIAMarks: 40,
      };
    }
    return {
      placeholder: 'Out of 100 Marks',
      maxCIAMarks: 100,
      maxMSEMarks: 0,
    };
  }
}

function marksInput(cycleSubjects, selectedSemester) {
  return (
    <>
      <li key={commonSubjects[selectedSemester - 1].alias}>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{commonSubjects[selectedSemester - 1].alias}</ItemTitle>
            <ItemDescription>
              {commonSubjects[selectedSemester - 1].name}
            </ItemDescription>
          </ItemContent>
          <FieldGroup className="grid max-w-sm grid-cols-2">
            <Field>
              <FieldLabel htmlFor="mse-marks">MSE Marks</FieldLabel>
              <Input id="mse-marks" placeholder="Out of 40 Marks" />
            </Field>
            <Field>
              <FieldLabel htmlFor="cia-marks">Other Component Marks</FieldLabel>
              <Input
                id="cia-marks"
                placeholder={checkCredits(
                  commonSubjects[selectedSemester - 1].credits,
                  commonSubjects[selectedSemester - 1],
                )}
              />
            </Field>
          </FieldGroup>
        </Item>
      </li>
      {cycleSubjects.map((v) => {
        return (
          <li key={v.alias}>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>{v.alias}</ItemTitle>
                <ItemDescription>{v.name}</ItemDescription>
              </ItemContent>
              <FieldGroup className="grid max-w-sm grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="mse-marks">MSE Marks</FieldLabel>
                  <Input
                    type="number"
                    id="mse-marks"
                    placeholder="Out of 40 Marks"
                    disabled={!v.mse}
                    max={checkCredits(v).maxMSEMarks}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cia-marks">
                    Other Component Marks
                  </FieldLabel>
                  <Input
                    id="cia-marks"
                    placeholder={checkCredits(v).placeholder}
                    max={checkCredits(v).maxCIAMarks}
                  />
                </Field>
              </FieldGroup>
            </Item>
          </li>
        );
      })}
    </>
  );
}

const FirstYear = ({ selectedCycle, selectedSemester }) => {
  return (
    <ul className="flex w-full max-w-md flex-col gap-6">
      {selectedCycle === 'physics' &&
        marksInput(physicsCycleSubjects, selectedSemester)}
      {selectedCycle === 'chemistry' &&
        marksInput(chemistryCycleSubjects, selectedSemester)}
    </ul>
  );
};

export default FirstYear;
