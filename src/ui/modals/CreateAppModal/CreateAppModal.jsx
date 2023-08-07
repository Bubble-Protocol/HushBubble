import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { ModalHostInfo } from "../../components/ModalHostInfo";

export const CreateAppModal = ({ session, chains, hosts=[], onDeploy, onCustomise, onBack, onCancel, onCompletion }) => { 
  const defaultChain = chains.find(c => c.id === session.chain.id) || chains[0];
  const [error, setError] = useState(null);
  return (
    <Modal 
    centered={false}
    onCancel={onCancel}
    title="Create Your Application Bubble" 
    subtitle="Your application instance is deployed as a 'bubble' - an on-chain smart contract that controls a secure off-chain storage vault. Your application bubble enables the use of your app across multiple devices and ensures you can recover your app using your wallet if you lose access to your devices." 
    contents=
      <React.Fragment>
        <ModalHostInfo chain={defaultChain} host={hosts[0]} onCustomise={onCustomise} />       
        {error && <div className="small-text error-text centered">{error.message}</div>}
        <div className="step-frame">
          <div className="centered"><Button title="Create Bubble" onClick={() => onDeploy({chain: defaultChain, host: hosts[0] }).then(onCompletion).catch(setError)} /></div>
          <p className="small-text centered">Your wallet will prompt you twice: once to generate your recovery key, and again to deploy the bubble smart contract.</p>
        </div>
        <div className="text-button centered" onClick={onBack}>back</div>
      </React.Fragment>
    />
  );
};

CreateAppModal.propTypes = {
  chains: PropTypes.array.isRequired,
  hosts: PropTypes.array.isRequired,
  onDeploy: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};

