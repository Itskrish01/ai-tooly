import { useState } from "react";
import { Sidebar } from "primereact/sidebar";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <div className="px-6 py-3 border-b-[1px] border-gray-200 shadow-sm">
        <div className="flex items-center gap-5 justify-between">
          <div className="flex items-center gap-5">
            <img
              src="/images/shaking-hands.png"
              className="h-10 w-10"
              alt="logo"
            />
            <h4 className="robot-slab font-bold text-xl">Ai Tooly</h4>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
