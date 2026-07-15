import { createContext, useCallback, useContext, useMemo, useState } from "react";

const FocusModeContext = createContext(null);

export function FocusModeProvider({ children }) {
  const [isFocusMode, setFocusMode] = useState(false);
  const enterFocusMode = useCallback(() => setFocusMode(true), []);
  const exitFocusMode = useCallback(() => setFocusMode(false), []);

  const value = useMemo(
    () => ({ isFocusMode, enterFocusMode, exitFocusMode }),
    [enterFocusMode, exitFocusMode, isFocusMode]
  );

  return <FocusModeContext.Provider value={value}>{children}</FocusModeContext.Provider>;
}

export function useFocusMode() {
  const value = useContext(FocusModeContext);
  if (!value) {
    throw new Error("useFocusMode must be used inside FocusModeProvider");
  }
  return value;
}
