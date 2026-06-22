import { useState, useEffect } from "react";

export const heroState = {
  inView: true,
  listeners: new Set<(inView: boolean) => void>(),
  setInView(inView: boolean) {
    if (this.inView === inView) return;
    this.inView = inView;
    this.listeners.forEach((l) => l(inView));
  },
  subscribe(listener: (inView: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
};

export function useHeroInView() {
  const [inView, setInView] = useState(heroState.inView);
  
  useEffect(() => {
    const unsubscribe = heroState.subscribe((newInView) => {
      setInView(newInView);
    });
    return unsubscribe;
  }, []);

  return inView;
}
