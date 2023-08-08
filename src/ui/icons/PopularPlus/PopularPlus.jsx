/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

export const PopularPlus = ({ color = "#999999", size = 36, className, onClick }) => {
  return (
    <svg
      className={`popular-plus ${className}`}
      fill="none"
      height={size}
      viewBox="0 0 36 36"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path className="path" d="M18 9V27M9 18H27" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

PopularPlus.propTypes = {
  color: PropTypes.string,
};
