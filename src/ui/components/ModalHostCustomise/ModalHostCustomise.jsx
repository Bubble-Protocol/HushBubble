/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Dropdown } from "../Dropdown/Dropdown";
import { TextBox } from "../TextBox";

const validPathname = /^(.*:)?[^.][^ ]*\.[^ ]*[^.](\/[^ ]*)?$/;
const validProtocol = /^wss?:/;


export const ModalHostCustomise = ({
  chainTitle,
  hostTitle,
  chains,
  hosts,
  values,
  onChange,
  onCollapse
}) => {

  function set(field, value) {
    const newValues = {...values};
    newValues[field] = value;
    newValues.urlProtocolValid = false;
    newValues.urlPathValid = false;
    newValues.urlValid = false;
    const url = newValues.url;
    if (url !== "") {
      try {
        const u = new URL(url); 
        newValues.urlProtocolValid = validProtocol.test(u.protocol);
        newValues.urlPathValid = validPathname.test(url);
        newValues.urlValid = newValues.urlProtocolValid && newValues.urlPathValid;
        console.debug(newValues, u, u.hostname, validPathname.test(u.hostname) && url.indexOf(' ') < 0)
      } catch(_){}
    }
    onChange(newValues);
  }

  return (
    <React.Fragment>
      <div className="step-frame">
        <p className="step-title">{chainTitle}</p>
        <Dropdown selectedOption={values.chain} options={chains} onChange={value => set('chain', value)} />
      </div>
      <div className="step-frame">
        <p className="step-title">{hostTitle}</p>
        <p className="small-text">Where your chat will be held.</p>
        <Dropdown selectedOption={values.host} options={hosts} onChange={value => set('host', value)} disabled={values.url !== ""} />
        <p className="small-text">Or enter your own host url</p>
        <TextBox text={values.url} onChange={value => set('url', value)} />
        {(values.urlPathValid && !values.urlProtocolValid) && <p className="small-text error-text">only ws and wss protocols are supported</p>}
      </div>
      {onCollapse && <div className="text-button centered" onClick={onCollapse}>collapse</div>}
    </React.Fragment>
  );
};


ModalHostCustomise.propTypes = {
  chainTitle: PropTypes.string.isRequired,
  hostTitle: PropTypes.string.isRequired,
  chains: PropTypes.array.isRequired,
  hosts: PropTypes.array.isRequired,
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onCollapse: PropTypes.func,
};

