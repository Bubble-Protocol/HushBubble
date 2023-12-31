/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const PopularX = ({ color = "#999999", size = 36, className, box=false, onClick }) => {
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
        d="M25.7143 10.2858L10.2857 25.7143M10.2857 10.2858L25.7143 25.7143"
        stroke={color || "#999999"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {box && <rect className="rect" height="35" rx="5.5" stroke="#BBBBBB" width="35" x="0.5" y="0.5" />}
    </svg>
  );
};
