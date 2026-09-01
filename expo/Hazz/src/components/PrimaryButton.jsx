import React from 'react';

const PrimaryButton = ({ 
  children, 
  onClick, 
  type = "button", 
  disabled = false, 
  isLoading = false,
  className = "", 
  icon = null 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-[8px] font-semibold text-[13.5px] px-[18px] py-[11px] rounded-[10px] text-white bg-gradient-to-b from-[#17a377] to-[#0b7a5b] shadow-[0_10px_22px_-12px_rgba(11,122,91,0.9)] hover:brightness-105 border-0 cursor-pointer disabled:opacity-50 transition-all ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center w-[16px] h-[16px]">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : icon ? (
        <span className="flex items-center justify-center w-[16px] h-[16px]">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
};

export default PrimaryButton;
