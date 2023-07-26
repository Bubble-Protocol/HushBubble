/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const PopularMoreVertical1 = ({ className, size, color }) => {
  return (
    <svg
      className={`popular-more-vertical-1 ${className}`}
      fill="none"
      height={size || "28"}
      viewBox="0 0 28 28"
      width={size || "28"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M13 14C13 14.5523 13.4477 15 14 15C14.5523 15 15 14.5523 15 14C15 13.4477 14.5523 13 14 13C13.4477 13 13 13.4477 13 14Z"
        stroke={color || "#0F1217"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="path"
        d="M13 21C13 21.5523 13.4477 22 14 22C14.5523 22 15 21.5523 15 21C15 20.4477 14.5523 20 14 20C13.4477 20 13 20.4477 13 21Z"
        stroke={color || "#0F1217"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="path"
        d="M13 7C13 7.55228 13.4477 8 14 8C14.5523 8 15 7.55228 15 7C15 6.44772 14.5523 6 14 6C13.4477 6 13 6.44772 13 7Z"
        stroke={color || "#0F1217"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
