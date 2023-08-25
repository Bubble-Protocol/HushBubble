import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { TextInput } from "../components/TextInput";
import { IconInput } from "../components/IconInput";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";

export const EditChatModal = ({ chat, onCancel, onCompletion }) => {

  const {metadata, chatType} = chat;
  const [state, setState] = useState('user-input');
  const [title, setTitle] = useState({value: metadata.title, valid: !!metadata.title});
  const [icon, setIcon] = useState({value: metadata.icon || defaultIcon, valid: true});
  const [error, setError] = useState();

  console.debug(title)
  function save() {
    setState('saving');
    const newMetadata = {};
    if (chatType.title) newMetadata.title = title.value;
    if (chatType.icon) newMetadata.icon = icon.value === defaultIcon ? undefined : icon.value;
    chat.setMetadata(newMetadata)
    .then(onCompletion)
    .catch(error => {
      setState('user-input');
      console.warn('failed to set chat metadata', error);
      setError(error)
    });
  }

  return (
    <Modal 
    onCancel={onCancel}
    title="Edit Chat"
    loading={state === 'saving'}
    contents=
      <React.Fragment>
        {chatType.icon && <IconInput title="Icon" value={icon} setValue={setIcon} />}
        {chatType.title && <TextInput title="Title" subtitle="The name of the chat" value={title} setValue={setTitle} />}
        <div className="step-frame">
          {error && <p className="small-text error-text">{error.message}</p>}
          <Button title="Save" onClick={save} disabled={!(title.valid && icon.valid)} />
        </div>
      </React.Fragment>
    />
  );
};

EditChatModal.propTypes = {
  chat: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func.isRequired,
};
