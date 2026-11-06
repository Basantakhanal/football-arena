
const PATHS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",

  ball: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 8l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3v5M15.5 10.5L20 9M14.2 14.5l2.8 3.5M9.8 14.5L7 18M8.5 10.5L4 9",

  trophy: "M8 4h8v5a4 4 0 01-8 0zM8 6H4v2a3 3 0 003 3M16 6h4v2a3 3 0 01-3 3M12 13v4M8 20h8M10 17h4",

  swap: "M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4",

  chart: "M4 19V5M4 19h16M8 15l4-4 3 3 5-6",

  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002 1.2l.4 2.6h4l.4-2.6a7 7 0 002-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",

  help: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01",

  logout: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",

  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",

  chevron: "M6 9l6 6 6-6",

  chevronRight: "M9 6l6 6-6 6",

  plus: "M12 5v14M5 12h14",

  check: "M5 12l5 5 9-10",

  x: "M6 6l12 12M18 6L6 18",

  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",

  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 6.5M18 14.5a6.5 6.5 0 013.5 5.5",

  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z",

  bookmark: "M7 4h10v16l-5-4-5 4z",

  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",

  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4",

  arrowUpRight: "M7 17L17 7M8 7h9v9",

  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",

  bell: "M6 16v-5a6 6 0 1112 0v5l2 2H4zM10 21h4",

  radio: "M12 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.5 5.5a9 9 0 000 13M18.5 5.5a9 9 0 010-13",

  chat: "M4 5h16v11H9l-5 4z",

  news: "M5 4h11v16H5zM16 8h3v10a2 2 0 01-2 2M8 8h5M8 12h5M8 16h3",

  first: "M7 6v12M18 6l-6 6 6 6",

  prev: "M15 6l-6 6 6 6",

  next: "M9 6l6 6-6 6",

  last: "M17 6v12M6 6l6 6-6 6",
};

export function Icon({
  name,
  size = 18,
  className = "",
  strokeWidth = 1.8,
  filled = false,
}) {
  const path = PATHS[name] || PATHS.user;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
}

export default Icon;
