import { Card } from '@/components/ui/card';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxList,
} from '@/components/ui/combobox';

const semisters = [];

const App = () => {
  return (
    <main>
      <Card>
        <Combobox items={semisters}>
          <ComboboxInput placeholder="Select the semister" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Card>
    </main>
  );
};

export default App;
