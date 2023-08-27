import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { stateManager } from "../../../state-context";
import { TextInput } from "../components/TextInput";
import { IconInput } from "../components/IconInput";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";

export const ManageProfileModal = ({ onCancel, onCompletion }) => {

  const session = stateManager.useStateData('session')();
  const myId = stateManager.useStateData('myId')();
  const [name, setName] = useState({value: myId.title || '', valid: true});
  const [icon, setIcon] = useState({value: myId.icon || defaultIcon, valid: true});
  const [error, setError] = useState();

  function save() {
    session.updateProfile({
      title: name.value === '' ? undefined : name.value,
      icon: icon.value === defaultIcon ? undefined : icon.value
    })
    .then(onCompletion)
    .catch(error => {
      console.warn('failed to update profile', error);
      setError(error)
    });
  }

  return (
    <Modal 
    onCancel={onCancel}
    contentCentered={false}
    title="Your Public Profile"
    subtitle="Your public profile is visible to anyone you share a chat with." 
    contents=
      <React.Fragment>
        <IconInput title="Icon" value={icon} setValue={setIcon} />
        <TextInput title="Name" value={name} setValue={setName} />
        {error && <p className="small-text error-text">{error.message}</p>}
        <Button title="Save" onClick={save} />
      </React.Fragment>
    />
  );
};

ManageProfileModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func,
};

