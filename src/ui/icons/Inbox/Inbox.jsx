/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const Inbox = ({ className, size, color }) => {
  return (
    <svg
      className={`popular-more-vertical-1 ${className}`}
      fill="none"
      height={size || "35"}
      viewBox="0 0 35 28"
      width={size || "35"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M36 21H27L24 25.5H18L15 21H6" fill={color || "#0F1217"}/>
      <path d="M11.175 10.665L6 21V30C6 30.7956 6.31607 31.5587 6.87868 32.1213C7.44129 32.6839 8.20435 33 9 33H33C33.7956 33 34.5587 32.6839 35.1213 32.1213C35.6839 31.5587 36 30.7956 36 30V21L30.825 10.665C30.5766 10.1652 30.1938 9.74456 29.7194 9.45042C29.2451 9.15628 28.6981 9.0003 28.14 9H13.86C13.3019 9.0003 12.7549 9.15628 12.2806 9.45042C11.8062 9.74456 11.4234 10.1652 11.175 10.665Z" fill={color || "#0F1217"}/>
      <path d="M36 21H27L24 25.5H18L15 21H6M36 21V30C36 30.7956 35.6839 31.5587 35.1213 32.1213C34.5587 32.6839 33.7956 33 33 33H9C8.20435 33 7.44129 32.6839 6.87868 32.1213C6.31607 31.5587 6 30.7956 6 30V21M36 21L30.825 10.665C30.5766 10.1652 30.1938 9.74456 29.7194 9.45042C29.2451 9.15628 28.6981 9.0003 28.14 9H13.86C13.3019 9.0003 12.7549 9.15628 12.2806 9.45042C11.8062 9.74456 11.4234 10.1652 11.175 10.665L6 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
