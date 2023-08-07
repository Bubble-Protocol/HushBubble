import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { ModalHostInfo } from "../../components/ModalHostInfo";
import { ModalHostCustomise } from "../../components/ModalHostCustomise";
import { SingleUserInput } from "./components/SingleUserInput";

export const CreateChatModal = ({ chains, hosts, session, bubble, valuesIn=[], onCreate, onCancel, onCompletion }) => {

  for (let i=0; i<bubble.constructorParams.length; i++) {
    switch (bubble.constructorParams[i]) {
      case 'member0':
        valuesIn[i] = {value: session.getUserId(), valid: true};
        break;
      case 'terminateToken':
        valuesIn[i] = {valid: true};
        break;
      default:
        valuesIn[i] = {value: valuesIn[i], valid: false};
    }
  }

  const defaultChain = chains.find(c => c.id === session.chain.id) || chains[0];
  const [state, setState] = useState('user-input');
  const [values, setValues] = useState(valuesIn);
  const [hostValues, setHostValues] = useState({chain: defaultChain, host: hosts[0], url: "", urlValid: false});
  const [customise, setCustomised] = useState(false);
  const [createError, setCreateError] = useState();

  function getHost() {
    if (hostValues.url === "") return hostValues.host;
    const host = { name: hostValues.url, chains: {} }
    host.chains[hostValues.chain.id] = {url: hostValues.url}
    return host;
  }

  function getTitle() {
    for (let i=0; i<bubble.constructorParams.length; i++) {
      if (bubble.constructorParams[i] === 'member1') return values[i].user.address;
    }
    return 'Untitled'
  }

  function createChat() {
    setState('creating');
    const metadata = {};
    bubble.constructorParams.forEach((p,i) => { metadata[p] = values[i].user || values[i].value })
    onCreate({
      chain: hostValues.chain, 
      host: getHost(), 
      bubbleType: bubble,
      title: getTitle(),
      metadata
    })
    .then(onCompletion)
    .catch(error => {
      setState('user-input');
      console.warn('failed to create chat', error);
      setCreateError(error)
    });
  }

  return (
    <Modal 
    onCancel={onCancel}
    title={bubble.title}
    subtitle={bubble.details || bubble.description}
    loading={state === 'creating'}
    contents=
      <React.Fragment>
        {!customise && <ModalHostInfo chain={hostValues.chain} host={getHost()} onCustomise={() => setCustomised(true)} />}
        {customise && <ModalHostCustomise chainTitle="Blockchain" hostTitle="Host" values={hostValues} chains={chains} hosts={hosts} onChange={v => {setCreateError(); setHostValues(v)}} onCollapse={() => setCustomised(false)} /> }   
        {
          bubble.constructorParams.map((param, i) => 
            {
              return getConstructorParamUI(param, values[i], (v) => setValues([...values.slice(0,i), v, ...values.slice(i+1)]));
            }
          ).filter(Boolean)
        }
        <div className="step-frame">
          {createError && <p className="small-text error-text">{createError.message}</p>}
          <Button title="Create" onClick={createChat} disabled={(hostValues.url !== "" && !hostValues.urlValid) || !values.reduce((valid,value) => (valid && value.valid), true)} />
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
  userIn: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};


function getConstructorParamUI(param, initialValue, setValue) {
  switch(param) {
    case 'member1':
      return <SingleUserInput key={param} title="User" subtitle="User to connect to..." value={initialValue} setValue={setValue} />
    default:
      return null;
  }
}