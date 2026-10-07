import { useState, useEffect } from "react";

import { onPageScroll, scrollTop } from "@/lib/app-scroll";

/**
 * Whether the page has scrolled past `threshold` pixels — the document, or
 * the tab-bar shell's scroller (see lib/app-scroll).
 */
export function useScroll(threshold: number = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(scrollTop() > threshold);
    handleScroll();
    return onPageScroll(handleScroll);
  }, [threshold]);

  return isScrolled;
}
