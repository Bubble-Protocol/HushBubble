/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const PopularMinus = ({ color = "#999999", size = 36, className, onClick }) => {
  return (
    <svg
      className={`popular-x ${className}`}
      onClick={onClick}
      fill="none"
      height={size}
      viewBox="0 0 36 36"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M7 14H21"
        stroke={color || "#999999"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
