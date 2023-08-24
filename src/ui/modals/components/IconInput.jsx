import PropTypes from "prop-types";
import React from "react";
import { IconChooser } from "../../components/IconChooser/IconChooser";

export const IconInput = ({ title, subtitle, value, setValue }) => {

  return (
    <div className="step-frame">
      <p className="step-title">{title}</p>
      {subtitle && <p className="small-text">{subtitle}</p>}
      <IconChooser icon={value.value} changeText="click to change" onChange={v => {setValue({value: v, valid: true})}} />
    </div>
  );
};

IconInput.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  value: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired
};
