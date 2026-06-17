export const loaderState = {
  isDone: false,
  listeners: new Set<() => void>(),
  setDone() {
    this.isDone = true;
    this.listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
};

import { useState, useEffect } from "react";

export function useLoaderState() {
  const [isReady, setIsReady] = useState(loaderState.isDone);
  
  useEffect(() => {
    if (loaderState.isDone) {
      setIsReady(true);
      return;
    }
    const unsubscribe = loaderState.subscribe(() => {
      setIsReady(true);
    });
    return unsubscribe;
  }, []);

  return isReady;
}
