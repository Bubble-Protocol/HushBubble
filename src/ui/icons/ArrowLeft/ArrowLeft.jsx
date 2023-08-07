/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

export const ArrowLeft = ({ color = "#999999", className, onClick }) => {
  return (
    <svg
      className={`popular-plus ${className}`}
      fill="none"
      height="36"
      viewBox="0 0 36 36"
      width="36"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path className="path" d="M27 18H9M9 18L18 27M9 18L18 9" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

ArrowLeft.propTypes = {
  color: PropTypes.string,
};
