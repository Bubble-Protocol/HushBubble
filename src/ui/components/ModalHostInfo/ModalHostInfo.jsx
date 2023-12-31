/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

export const ModalHostInfo = ({
  chain,
  host,
  onCustomise,
  centered
}) => {
  return (
    <div className={"step-frame"+(centered ? '-centered' : '')}>
      <div className="info-frame">
        <div className="row">
          <div className="label" style={{width: 40}}>Chain:</div>
          <div className="field">
            {chain.name}
            {chain.icon && <img className="logo-small" src={chain.icon}/>}
          </div>
        </div>
        <div className="row">
          <div className="label" style={{width: 40}}>Host:</div>
          <div className="field">
            {host.name}
            {host.icon && <img className="logo-small" src={host.icon}/>}
          </div>
        </div>
      </div>
      {onCustomise && <div className="text-button" onClick={onCustomise}>customise</div>}
    </div>
  );
};


ModalHostInfo.propTypes = {
  chain: PropTypes.object.isRequired,
  host: PropTypes.object.isRequired,
  onCustomise: PropTypes.func,
  centered: PropTypes.bool
};

