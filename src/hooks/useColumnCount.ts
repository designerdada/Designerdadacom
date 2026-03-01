import { useState, useEffect } from 'react';

/**
 * Returns the number of columns that fit in the viewport given a minimum column width.
 */
export function useColumnCount(minColumnWidth: number): number {
  const [columnCount, setColumnCount] = useState(() =>
    typeof window !== 'undefined'
      ? Math.max(1, Math.floor(window.innerWidth / minColumnWidth))
      : 3
  );

  useEffect(() => {
    function update() {
      setColumnCount(Math.max(1, Math.floor(window.innerWidth / minColumnWidth)));
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [minColumnWidth]);

  return columnCount;
}
