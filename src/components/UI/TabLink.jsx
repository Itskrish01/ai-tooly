const TabLink = ({ icon, name, handleClick, value, active }) => {
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => handleClick(value)}
      className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition select-none
        ${
          isActive
            ? "bg-bg-3 text-fg shadow-ring"
            : "text-fg-dim hover:text-fg hover:bg-bg-2"
        }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center transition ${
          isActive ? "text-accent" : "text-fg-mute"
        }`}
      >
        {icon}
      </span>
      <span>{name}</span>
    </button>
  );
};

export default TabLink;
