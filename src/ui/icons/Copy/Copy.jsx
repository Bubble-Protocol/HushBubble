/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

export const CopyIcon = ({ color = "#999999", className, onClick }) => {
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
      <path className="path" d="M5.50021 13.8571H4.7145C4.29773 13.8571 3.89803 13.6916 3.60333 13.3969C3.30863 13.1022 3.14307 12.7025 3.14307 12.2857V5.21428C3.14307 4.79751 3.30863 4.39781 3.60333 4.10311C3.89803 3.80841 4.29773 3.64285 4.7145 3.64285H11.7859C12.2027 3.64285 12.6024 3.80841 12.8971 4.10311C13.1918 4.39781 13.3574 4.79751 13.3574 5.21428V6M10.2145 9.14285H17.2859C18.1538 9.14285 18.8574 9.84641 18.8574 10.7143V17.7857C18.8574 18.6536 18.1538 19.3571 17.2859 19.3571H10.2145C9.34662 19.3571 8.64307 18.6536 8.64307 17.7857V10.7143C8.64307 9.84641 9.34662 9.14285 10.2145 9.14285Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

CopyIcon.propTypes = {
  color: PropTypes.string,
};
