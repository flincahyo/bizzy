"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="group overflow-hidden rounded-full transition-all duration-300">
      <div className="relative flex items-center justify-center h-full w-full">
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all duration-500 scale-100 dark:scale-0 dark:-rotate-90 dark:opacity-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 scale-0 dark:scale-100 dark:-rotate-0 dark:opacity-100 rotate-90 opacity-0" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
