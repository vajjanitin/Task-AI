import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    // keep local state in sync if something else toggles the class
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains('dark')
    if (next) {
      document.documentElement.classList.add('dark')
      try { localStorage.setItem('theme', 'dark') } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark')
      try { localStorage.setItem('theme', 'light') } catch (e) {}
    }
    setIsDark(next)
  }

  return (
    <div className="navbar-home fixed z-10 w-full flex justify-between items-center py-2 px-4 bg-white border-b">
      <img
        src={assets.logo}
        alt="logo"
        className="navbar-logo cursor-pointer w-8"
        onClick={() => navigate("/")}
      />

      <div className="navbar-actions flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Light' : 'Dark'}
          className="theme-toggle-btn p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDark ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4" />}
        </button>

        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="navbar-cta flex items-center gap-2 rounded-full bg-primary text-white text-sm px-6 py-2 cursor-pointer"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
