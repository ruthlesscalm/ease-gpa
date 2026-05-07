import FirstYear from '@/components/FirstYear';
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
import { useState } from 'react';

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

const App = () => {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  return (
    <main>
      <Card>
        <Select
          value={selectedSemester}
          onValueChange={(value) => setSelectedSemester(value)}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select Your semester" />
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
          <div>
            <Select
              value={selectedCycle}
              onValueChange={(value) => setSelectedCycle(value)}
            >
              <SelectTrigger className="w-full max-w-48">
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
            <FirstYear
              selectedCycle={selectedCycle}
              selectedSemester={selectedSemester}
            />
          </div>
        )}
      </Card>
    </main>
  );
};

export default App;
