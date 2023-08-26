/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../../../../assets/img/unknown-contact-icon.png";

export const BubbleSelector = ({
  title = "Unknown",
  icon = defaultIcon,
  description = "",
  selected = false,
  disabled = false,
  onClick
}) => {
  return (
    <div className={"bubble-selector" + (selected ? ' selected' : '') + (disabled ? ' bubble-selector-disabled' : '')} onClick={disabled ? undefined : onClick}>
      {icon !== null && <img className={"icon" + (disabled ? ' disabled' : '')} src={icon} />}
      <div className={"selector-content" + (disabled ? ' disabled' : '')}>
        <div className="selector-title">{title}</div>
        <p className="selector-text">{description}</p>
      </div>
    </div>
  );
};

BubbleSelector.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  selected: PropTypes.bool,
  disabled: PropTypes.bool
};

