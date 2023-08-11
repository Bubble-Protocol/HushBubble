import PropTypes from "prop-types";
import React from "react";
import { TextBox } from "../../../components/TextBox";

export const TextInput = ({ title, subtitle, value, setValue, validatorFn = (v)=>!!v }) => {

  return (
    <div className="step-frame">
      <p className="step-title">{title}</p>
      {subtitle && <p className="small-text">{subtitle}</p>}
      <TextBox text={value.value || ''} onChange={v => {setValue({value: v, valid: validatorFn(v)})}} valid={validatorFn(value.value)} />
    </div>
  );
};

TextInput.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  value: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired
};
