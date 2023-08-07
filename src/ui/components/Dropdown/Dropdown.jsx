import PropTypes from "prop-types";
import React, { useState } from "react";
import "./style.css";
import { ChevronsChevronsDown } from "../../icons/ChevronsChevronsDown/ChevronsChevronsDown";

export const Dropdown = ({ selectedOption={}, placeholder, options=[], onChange, disabled=false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasIcon = options.some(option => option.icon !== undefined);

  function toggling() {
   if (!disabled) setIsOpen(!isOpen);
  }

  function onOptionClicked(value) {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <div className={"dropdown" + (disabled ? " disabled" : '')} onClick={toggling}>
        <div className="icon-text">
          {selectedOption.icon && <img src={selectedOption.icon} /> }
          <div className={"dropdown-text" + (disabled ? " disabled" : '')}>
            {selectedOption.name || placeholder}
          </div>
        </div>
        <ChevronsChevronsDown />
      </div>
      {isOpen && (
        <div className="dropdown-list-container">
          <ul className="dropdown-list">
            {options.map((option, i) => (
              <li onClick={() => onOptionClicked(option)} key={i}>
                <div className="icon-text">
                  {hasIcon && option.icon && <img src={option.icon} /> }
                  {hasIcon && !option.icon && <div className="blank-img" /> }
                  {option.name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  selectedOption: PropTypes.object,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};
