import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface SelectionContextValue {
  selectedId: string | null;
  selectItem: (id: string) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(
  undefined
);

/** Share selection between the list cards and their sibling detail panel. */
export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function selectItem(id: string) {
    setSelectedId(id);
  }

  function clearSelection() {
    setSelectedId(null);
  }

  return (
    <SelectionContext.Provider
      value={{ selectedId, selectItem, clearSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
}
