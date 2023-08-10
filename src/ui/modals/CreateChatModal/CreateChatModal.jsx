import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { ModalHostInfo } from "../../components/ModalHostInfo";
import { ModalHostCustomise } from "../../components/ModalHostCustomise";
import { SingleUserInput } from "./components/SingleUserInput";
import { TextInput } from "./components/TextInput";
import { IconInput } from "./components/IconInput";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";
import { ecdsa } from '@bubble-protocol/crypto';
import { assert } from '@bubble-protocol/client';

export const CreateChatModal = ({ chains, hosts, session, bubble, valuesIn=[], onCreate, onCancel, onCompletion }) => {

  const params = bubble.constructorParams.concat(Object.values(bubble.metadata)).map(p => typeof p == 'object' ? p : p.split('.')[0]).sort().filter((p, i, params) => i===0 || p !== params[i-1]);

  for (let i=0; i<params.length; i++) {
    switch (params[i]) {
      case 'member0':
        valuesIn[i] = {value: session.getUserId(), valid: true};
        break;
      case 'members':
        valuesIn[i] = {value: [session.getUserId()], valid: true};
        break;
      case 'icon':
        valuesIn[i] = {value: valuesIn[i] || defaultIcon, valid: true};
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

  function createChat() {
    setState('creating');
    const createParams = {};
    params.forEach((p,i) => {
      const name = typeof p == 'object' ? p.id : p;
      createParams[name] = values[i].user || values[i].value 
    })
    onCreate({
      chain: hostValues.chain, 
      host: getHost(), 
      bubbleType: bubble,
      params: createParams
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
          params.map((param, i) => 
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


function getConstructorParamUI(param, initialValue, setValue, title, subtitle) {
  switch(param) {
    case 'title':
      return <TextInput key={param} title="Title" subtitle="The name of the chat" value={initialValue} setValue={setValue} />
    case 'icon':
      return <IconInput key={param} title="Icon" value={initialValue} setValue={setValue} />
    case 'member1':
      return <SingleUserInput key={param} title="User" subtitle="User to connect to..." value={initialValue} setValue={setValue} />
    case 'address':
      return <TextInput key={param} title={title || "Address"} subtitle={subtitle} value={initialValue} setValue={setValue} validatorFn={ecdsa.assert.isAddress} />
    case 'uint256':
      return <TextInput key={param} title={title || "Number"} subtitle={subtitle} value={initialValue} setValue={setValue} validatorFn={v => strIsUint(v,256)} />
    default:
      if (typeof param === 'object') {
        return getConstructorParamUI(param.type, initialValue, setValue, param.title, param.subtitle);
      }
      return null;
  }
}

function strIsUint(value, size) {
  try {
    if (value.slice(0, 2) === '0x') return assert.isHexString(value) && value.length === size/4 + 2;
    else return /^[0-9]+$/.test(value);
  }
  catch(_){ 
    return false;
  }
}