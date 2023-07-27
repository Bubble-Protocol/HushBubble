import PropTypes from "prop-types";
import React from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";

export const ConnectWalletModal = ({ onCreate, onConnect, onCancel }) => {
  return (
    <Modal 
    centered={false}
    onCancel={onCancel}
    title="Wallet Connected" 
    subtitle="Is this your first time connecting with this wallet?" 
    contents=
      <React.Fragment>
        <p>Choose from one of the following options...</p>
        <div className="step-frame">
          <p className="step-title">Option 1: Create a new application instance</p>
          <p className="small-text">For new users, or for users wanting to create a different application instance for a different wallet key.</p>
          <Button title="Create" onClick={onCreate} />
        </div>
        <div className="step-frame">
          <p className="step-title">Option 2: Connect to an existing application instance</p>
          <p className="small-text">If you've already created an application instance on another device, you can connect to it here.</p>
          <Button title="Connect" onClick={onConnect} />
        </div>
        <div className="step-frame">
          <p className="step-title">Option 3: Cancel and connect a different wallet</p>
          <div className="text-button" onClick={onCancel}>Cancel</div>
        </div>
      </React.Fragment>
    />
  );
};

ConnectWalletModal.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

