import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { stateManager } from "../../../state-context";
import { MemberRow } from "./components/MemberRow/MemberRow";

export const ManageMemberModal = ({ chat, onSave, onCancel, onCompletion }) => {

  const chats = stateManager.useStateData('chats')();
  const myId = stateManager.useStateData('myId')();
  const [state, setState] = useState('user-input');
  const [removedMembers, setRemovedMembers] = useState([]);
  const [addedMembers, setAddedMembers] = useState([]);
  const [error, setError] = useState();

  function save() {
    setState('saving');
    onSave({
      chat: chat,
      removedMembers: removedMembers,
      addedMembers: addedMembers
    })
    .then(onCompletion)
    .catch(error => {
      setState('user-input');
      console.warn('failed to create chat', error);
      setError(error)
    });
  }

  function toggleRemoveMember(member) { console.debug(removedMembers)
    if (removedMembers.includes(member)) setRemovedMembers(removedMembers.filter(m => m !== member));
    else {
      removedMembers.push(member);
      setRemovedMembers([...removedMembers]);
    }
  }

  function toggleAddMember(member) {
    if (addedMembers.includes(member)) setAddedMembers(addedMembers.filter(m => m !== member));
    else {
      addedMembers.push(member);
      setAddedMembers([...addedMembers]);
    }
  }

  function isAlreadyMember(m) {
    return !!chat.metadata.members.find(cm => cm.id === m.id); 
  }

  function getOtherMember(chat) {
    return chat.metadata.members.find(m => m.id !== myId.id);
  }

  const contacts = 
    chats.filter(c => c.chatType.id.category === 'one-to-one' && !isAlreadyMember(getOtherMember(c)))
    .map(c => getOtherMember(c));

  return (
    <Modal 
    onCancel={onCancel}
    contentCentered={false}
    loading={state === 'saving'}
    title="Manage Members"
    subtitle="Manage the members of this chat" 
    contents=
      <React.Fragment>
        <div className="step-frame">
          <p className="step-title">Current Members</p>
          {chat.metadata.members.map(m => 
            <MemberRow key={m.id} member={m} modType="remove" modified={removedMembers.includes(m)} toggleModified={() => toggleRemoveMember(m)} />
          )}
        </div>
        <div className="step-frame">
          <p className="step-title">Your Contacts</p>
          {contacts.map(m => 
            <MemberRow key={m.id} member={m} modType="add" modified={addedMembers.includes(m)} toggleModified={() => toggleAddMember(m)} />
          )}
        </div>
        {error && <p className="small-text error-text">{error.message}</p>}
        <Button title="Save" onClick={save} disabled={removedMembers.length + addedMembers.length === 0} />
      </React.Fragment>
    />
  );
};

ManageMemberModal.propTypes = {
  bubbleIn: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCompletion: PropTypes.func,
};

