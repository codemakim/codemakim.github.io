"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wrapper = document.querySelector<HTMLElement>(".app-wrapper");
    if (!wrapper) return;

    const onScroll = () => {
      setVisible(wrapper.scrollTop > 240);
    };

    wrapper.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => wrapper.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const wrapper = document.querySelector<HTMLElement>(".app-wrapper");
    if (!wrapper) return;
    wrapper.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="맨 위로 이동"
      onClick={scrollToTop}
      className="floating-btn"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 transform rotate-180"
      >
        <path d="M12 4c.414 0 .75.336.75.75v12.69l4.22-4.22a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 1 1 1.06-1.06l4.22 4.22V4.75c0-.414.336-.75.75-.75Z"/>
      </svg>
    </button>
  );
}


