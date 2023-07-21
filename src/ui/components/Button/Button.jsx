/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const Button = ({ title, onClick, disabled=false }) => {
  return (
    <div className={"button" + (disabled ? " disabled" : " enabled")}>
      <div className="button-text" onClick={e => {if (!disabled) onClick(e)}}>{title}</div>
    </div>
  );
};

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
