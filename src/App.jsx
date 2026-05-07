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
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, GraduationCap, Clock } from 'lucide-react';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.55_0.22_270_/_0.12)] blur-[100px] dark:bg-[oklch(0.55_0.22_270_/_0.08)]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[oklch(0.60_0.20_300_/_0.10)] blur-[100px] dark:bg-[oklch(0.60_0.20_300_/_0.06)]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.65_0.15_330_/_0.06)] blur-[80px] dark:bg-[oklch(0.65_0.15_330_/_0.04)]" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="animate-fade-in-up flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="gradient-text text-2xl font-extrabold tracking-tight sm:text-3xl">
                EaseGPA
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Calculate your SGPA effortlessly
              </p>
            </div>
          </div>
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card/60 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px] text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </button>
        </header>

        {/* ── Selector Card ── */}
        <Card
          className="glass animate-fade-in-up w-full flex-col items-center gap-6 rounded-2xl p-6"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Section label */}
          <div className="flex w-full items-center gap-2 pb-1">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Choose Semester
            </span>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-4">
            <Select
              value={selectedSemester}
              onValueChange={(value) => {
                setSelectedSemester(value);
                setSelectedCycle('');
              }}
            >
              <SelectTrigger className="w-full max-w-56 transition-all duration-200 hover:border-primary/40" id="semester-select">
                <SelectValue placeholder="Select your semester" />
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
              <Select
                value={selectedCycle}
                onValueChange={(value) => setSelectedCycle(value)}
              >
                <SelectTrigger className="w-full max-w-56 animate-fade-in transition-all duration-200 hover:border-primary/40" id="cycle-select">
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
            )}
          </div>

          {/* ── FirstYear Form ── */}
          {(selectedCycle === 'physics' || selectedCycle === 'chemistry') && (
            <FirstYear
              selectedCycle={selectedCycle}
              selectedSemester={selectedSemester}
            />
          )}
        </Card>

        {/* ── Coming Soon ── */}
        {selectedSemester !== '' &&
          selectedSemester !== '1' &&
          selectedSemester !== '2' && (
            <div
              className="glass animate-fade-in-up flex w-full flex-col items-center gap-4 rounded-2xl py-16 text-center"
              style={{ animationDelay: '0.15s' }}
            >
              <div className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Coming Soon
                </h2>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Support for Semester {selectedSemester} is on the way. Stay
                  tuned!
                </p>
              </div>
            </div>
          )}

      
      </main>
    </div>
  );
};

export default App;
