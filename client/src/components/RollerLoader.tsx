import React from "react";

const RollerLoader: React.FC = () => {
  return (
    // Full-screen centered container
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-6">
        {/* Spining ring - pure CSS animation */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#F1F1F1] rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-[#D87D4A] rounded-full animate-spin" />
        </div>

        <p className="text-black/50 text-sm font-medium tracking-[2px] uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default RollerLoader;
