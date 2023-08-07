import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { TextBox } from "../../../components/TextBox";
import { User } from "../../../../model/User";

export const SingleUserInput = ({ title, subtitle, value, setValue }) => {

  let userObj;
  let valid = false;
  try {
    let id = value.value;
    try {
      const url = new URL(id);
      id = url.searchParams.get('connect');
    }
    catch(_) {}
    userObj = new User(id);
    valid = true;
  }
  catch(_) {}

  useEffect(() => {
    const newValue = validateValue(value.value);
    if (newValue.valid) setValue(newValue);
  }, [])

  console.debug(value, valid)

  return (
    <div className="step-frame">
      <p className="step-title">{title}</p>
      {subtitle && <p className="small-text">{subtitle}</p>}
      <TextBox text={userObj ? userObj.address : value.value || ''} onChange={v => {setValue(validateValue(v))}} />
    </div>
  );
};

SingleUserInput.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  value: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired
};

function validateValue(v) {
  try {
    let id = v;
    try {
      const url = new URL(id);
      id = url.searchParams.get('connect');
    }
    catch(_) {}
    return {value: v, user: new User(id), valid: true}
  }
  catch(_) {
    return {value: v, valid: false}
  }

}