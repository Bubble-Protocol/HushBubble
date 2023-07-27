import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { TextBox } from "../../components/TextBox";
import { ecdsa } from "@bubble-protocol/crypto";
import { ModalHostInfo } from "../../components/ModalHostInfo";
import { ModalHostCustomise } from "../../components/ModalHostCustomise";

export const CreateChatModal = ({ chains, hosts, session, bubble, onCreate, onCancel, onCompletion }) => {
  const defaultChain = chains.find(c => c.id === session.chain.id) || chains[0];
  const [user, setUser] = useState("");
  const [hostValues, setHostValues] = useState({chain: defaultChain, host: hosts[0], url: "", urlValid: false});
  const [customise, setCustomised] = useState(false);
  const [createError, setCreateError] = useState();

  console.debug('bubble', bubble)
  function getHost() {
    if (hostValues.url === "") return hostValues.host;
    const host = { name: hostValues.url, chains: {} }
    host.chains[hostValues.chain.id] = {url: hostValues.url}
    return host;
  }

  function isId(val) {
    try {
      const publicKey = Buffer.from(val, 'base64').toString('hex');
      return ecdsa.assert.isCompressedPublicKey(publicKey);
    }
    catch(_) { return false }
  }

  function createChat() {
    onCreate({
      chain: hostValues.chain, 
      host: getHost(), 
      bubbleType: bubble, 
      users: [session.getUserId(), user]
    })
    .then(onCompletion)
    .catch(error => {
      console.warn('failed to create chat', error);
      setCreateError(error)
    });
  }

  return (
    <Modal 
    onCancel={onCancel}
    title={bubble.title}
    subtitle={bubble.details || bubble.description} 
    contents=
      <React.Fragment>
        {!customise && <ModalHostInfo chain={hostValues.chain} host={getHost()} onCustomise={() => setCustomised(true)} />}
        {customise && <ModalHostCustomise chainTitle="Blockchain" hostTitle="Host" values={hostValues} chains={chains} hosts={hosts} onChange={v => {setCreateError(); setHostValues(v)}} onCollapse={() => setCustomised(false)} /> }   
        <div className="step-frame">
          <p className="step-title">Users</p>
          <p className="small-text">Members of your chat, other than you...</p>
          <TextBox text={user} onChange={v => {setCreateError(); setUser(v)}} valid={isId(user)} />
        </div>
        <div className="step-frame">
          <p className="small-text">Requires a blockchain transaction to deploy the chat smart contract.</p>
          {createError && <p className="small-text error-text">{createError.message}</p>}
          <Button title="Create" onClick={createChat} disabled={(hostValues.url !== "" && !hostValues.urlValid) || !isId(user)} />
        </div>
      </React.Fragment>
    />
  );
};

CreateChatModal.propTypes = {
  chains: PropTypes.array.isRequired,
  hosts: PropTypes.array.isRequired,
  session: PropTypes.object.isRequired,
  bubble: PropTypes.object.isRequired,
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};

