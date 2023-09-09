import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Dropdown } from "../../components/Dropdown/Dropdown";
import { Button } from "../../components/Button/Button";
import { TextBox } from "../../components/TextBox";

const validHostname = /^[^.].*\..*[^.]$/;
const validProtocol = /^wss?:/;

export const CreateAppModalCustomised = ({ session, chains, hosts=[], onDeploy, onBack, onCancel, onCompletion }) => { 
  const defaultChain = chains.find(c => c.id === session.chain.id) || chains[0];
  const [deployError, setDeployError] = useState(null);
  const [chain, setChain] = useState(defaultChain);
  const [host, setHost] = useState(hosts[0]);
  const [url, setUrl] = useState("");
  let hostValid = false;
  let errorText = null;
  try { 
    const u = new URL(url); 
    const protocolValid = validProtocol.test(u.protocol);
    hostValid = protocolValid && validHostname.test(u.hostname) && url.indexOf(' ') < 0;
    if (!protocolValid) errorText = "only ws and wss protocols are supported";
  } catch(_){}
  return (
    <Modal 
    centered={false}
    onCancel={onCancel}
    title="Create Your Application Bubble" 
    subtitle="Your application instance is deployed as a 'bubble' - an on-chain smart contract that controls a secure off-chain storage vault. Your application bubble enables the use of your app across multiple devices and ensures you can recover your app using your wallet if you lose access to your devices." 
    contents=
      <React.Fragment>
        <div className="step-frame">
          <p className="step-title">Step 1: Choose your blockchain</p>
          <Dropdown selectedOption={chain} options={chains} onChange={setChain} />
        </div>
        <div className="step-frame">
          <p className="step-title">Step 2: Choose your off-chain hosting service</p>
          <p className="small-text">Where your application bubble will be held.</p>
          <Dropdown selectedOption={host} options={hosts} onChange={setHost} disabled={url !== ""} />
          <p className="small-text">Or enter your own host url</p>
          <TextBox text={url} onChange={setUrl} />
          {errorText && <p className="small-text error-text">{errorText}</p>}
        </div>
        <div className="step-frame">
          <p className="step-title">Step 3: Deploy Your Application Bubble</p>
          <p className="small-text centered">Your wallet will prompt you twice: once to generate your recovery key, and again to deploy the bubble smart contract.</p>
          {deployError && <p className="small-text error-text">{deployError.details || deployError.message}</p>}
          <Button title="Deploy" onClick={() => onDeploy({chain: chain, host: url === "" ? host : url }).then(onCompletion).catch(setDeployError)} disabled={!(url === "" || hostValid)} />
        </div>
        <div className="text-button centered" onClick={onBack}>back</div>
      </React.Fragment>
    />
  );
};

CreateAppModalCustomised.propTypes = {
  chains: PropTypes.array.isRequired,
  hosts: PropTypes.array.isRequired,
  onDeploy: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};

