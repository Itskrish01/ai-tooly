const TabLink = ({ icon, name, handleClick, value, active }) => {
  return (
    <div
      className={`${
        active === value
          ? "bg-indigo-400/30 border border-indigo-500"
          : "border-gray-300 border"
      }   flex items-center cursor-pointer select-none transition-all gap-2 cabin-font font-semibold   px-3 py-1 text-indigo-600 rounded`}
      onClick={() => handleClick(value)}
    >
      {icon}
      <p>{name}</p>
    </div>
  );
};

export default TabLink;
