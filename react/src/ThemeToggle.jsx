import React, { useState } from "react";
import {Button} from "./components/ui/button"
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.remove("dark");
    } else {
      htmlElement.classList.add("dark");
    }
    setIsDark(!isDark);
  };

  return (
    <Button
      onClick={toggleTheme}
      className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded-md"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
    
  );
};

export default ThemeToggle;
