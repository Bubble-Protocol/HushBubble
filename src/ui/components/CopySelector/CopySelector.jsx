/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { CopyIcon } from "../../icons/Copy";

export const CopySelector = ({
  title,
  subtitle,
  value,
  subtitleIsCode,
  selected = false,
  onClick
}) => {
  const [text, setText] = useState(subtitle);
  const [height, setHeight] = useState('auto');

  const subtitleRef = useRef(null);
  useEffect(() => {
    setHeight(`${subtitleRef.current.scrollHeight}px`);
  }, []);

  function copyToClipboard() {
    navigator.clipboard.writeText(value)
    .then(() => {
      setText('Copied!');
      setTimeout(() => setText(subtitle), 2000);
    })
    .catch(err => {
      console.warn('Error in copying text: ', err);
    });
  }

  return (
    <div className={"id-selector" + (selected ? ' selected' : '')} onClick={onClick || copyToClipboard}>
      <div className="selector-content">
        <div className="selector-title">{title}</div>
        <p className={"selector-" + (subtitleIsCode ? 'code' : 'text')} ref={subtitleRef} style={{ height }} >{text}</p>
      </div>
      <CopyIcon onClick={copyToClipboard} />
    </div>
  );
};


CopySelector.propTypes = {
  value: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  subtitleIsCode: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};

