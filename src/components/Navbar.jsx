const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 h-14">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-2 shadow-ring">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
                stroke="#07080a"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            ai tooly
          </span>
          <span className="ml-2 hidden sm:inline-flex items-center gap-1 rounded border border-line bg-bg-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-fg-mute font-mono">
            beta
          </span>
        </a>

        <nav className="flex items-center gap-1.5">
          <a
            href="#"
            className="hidden md:inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-dim hover:text-fg hover:bg-bg-1 transition"
          >
            Docs
          </a>
          <a
            href="#"
            className="hidden md:inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-fg-dim hover:text-fg hover:bg-bg-1 transition"
          >
            Changelog
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="grid h-8 w-8 place-items-center rounded-md border border-line bg-bg-1 text-fg-dim hover:text-fg hover:bg-bg-2 transition"
            aria-label="Github"
          >
            <i className="pi pi-github" style={{ fontSize: 13 }} />
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
