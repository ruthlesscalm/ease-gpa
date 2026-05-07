import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { useState } from 'react';

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

function marksInput(cycleSubjects, selectedSemester) {
  const cmnSub = commonSubjects[selectedSemester - 1];
  const [marks, setMarks] = useState({});

  function handleInputChange(value, field, alias, max) {
    const numValue = parseFloat(value);
    const isInvalid = numValue > max || numValue < 0;
    setMarks((prev) => {
      return {
        ...prev,
        [alias]: {
          ...prev[alias],
          [field]: {
            value,
            isInvalid,
          },
        },
      };
    });
  }
  const cmnSubjectState = marks[cmnSub.alias] || {};
  const cmnMseData = cmnSubjectState.mse || { value: '', isInvalid: false };
  const cmnCiaData = cmnSubjectState.cia || { value: '', isInvalid: false };

  return (
    <>
      <div key={cmnSub.alias}>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{cmnSub.alias}</ItemTitle>
            <ItemDescription>{cmnSub.name}</ItemDescription>
          </ItemContent>
          <FieldGroup className="grid max-w-sm grid-cols-2">
            <Field data-invalid={cmnMseData.isInvalid}>
              <FieldLabel htmlFor="mse-marks">
                MSE Marks {cmnMseData.isInvalid && '( Invalid ! )'}
              </FieldLabel>
              <Input
                id="mse-marks"
                placeholder="Out of 40 Marks"
                max={checkCredits(cmnSub).maxMSEMarks}
                min={0}
                value={cmnMseData.value}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    'mse',
                    cmnSub.alias,
                    checkCredits(cmnSub).maxMSEMarks,
                  )
                }
              />
            </Field>
            <Field data-invalid={cmnCiaData.isInvalid}>
              <FieldLabel htmlFor="cia-marks">
                Other Component Marks {cmnCiaData.isInvalid && '( Invalid ! )'}
              </FieldLabel>
              <Input
                id="cia-marks"
                placeholder={checkCredits(cmnSub).placeholder}
                max={checkCredits(cmnSub).maxCIAMarks}
                min={0}
                value={cmnCiaData.value}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value,
                    'cia',
                    cmnSub.alias,
                    checkCredits(cmnSub).maxCIAMarks,
                  )
                }
              />
            </Field>
          </FieldGroup>
        </Item>
      </div>
      {cycleSubjects.map((v) => {
        const subjectState = marks[v.alias] || {};
        const mseData = subjectState.mse || { value: '', isInvalid: false };
        const ciaData = subjectState.cia || { value: '', isInvalid: false };
        return (
          <div key={v.alias}>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>{v.alias}</ItemTitle>
                <ItemDescription>{v.name}</ItemDescription>
              </ItemContent>
              <FieldGroup className="grid max-w-sm grid-cols-2">
                <Field data-invalid={mseData.isInvalid}>
                  <FieldLabel htmlFor="mse-marks">
                    MSE Marks {mseData.isInvalid && '( Invalid ! )'}
                  </FieldLabel>
                  <Input
                    type="number"
                    id="mse-marks"
                    placeholder="Out of 40 Marks"
                    disabled={!v.mse}
                    max={checkCredits(v).maxMSEMarks}
                    min={0}
                    value={mseData.value}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        'mse',
                        v.alias,
                        checkCredits(v).maxMSEMarks,
                      )
                    }
                  />
                </Field>
                <Field data-invalid={ciaData.isInvalid}>
                  <FieldLabel htmlFor="cia-marks">
                    Other Component Marks {ciaData.isInvalid && '( Invalid ! )'}
                  </FieldLabel>
                  <Input
                    id="cia-marks"
                    placeholder={checkCredits(v).placeholder}
                    max={checkCredits(v).maxCIAMarks}
                    min={0}
                    value={ciaData.value}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        'cia',
                        v.alias,
                        checkCredits(v).maxCIAMarks,
                      )
                    }
                  />
                </Field>
              </FieldGroup>
            </Item>
          </div>
        );
      })}
    </>
  );
}

const FirstYear = ({ selectedCycle, selectedSemester }) => {
  return (
    <form className="flex w-full max-w-md flex-col gap-6">
      {selectedCycle === 'physics' &&
        marksInput(physicsCycleSubjects, selectedSemester)}
      {selectedCycle === 'chemistry' &&
        marksInput(chemistryCycleSubjects, selectedSemester)}
    </form>
  );
};

export default FirstYear;
