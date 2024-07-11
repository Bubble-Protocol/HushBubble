import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";

export const ChatInfoModal = ({ chat, chains, hosts, invite, onClose }) => {

  const {metadata, chatType, contentId} = chat;

  const [copied, setCopied] = useState(false);

  let hostDomain;
  try {
    hostDomain = new URL(contentId.provider).hostname;
  }
  catch(_){}

  const chain = chains.find(c => c.id === contentId.chain) || {icon: defaultIcon, name: 'Chain ID '+contentId.chain};
  const host = hosts.find(h => h.hostname === hostDomain) || {icon: defaultIcon, name: contentId.provider};

  function copyInvite() {
    navigator.clipboard.writeText(invite);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal 
    onCancel={onClose}
    contentCentered={true}
    title={metadata.title}
    subtitle={chatType.title+' - '+chatType.details}
    loading={false}
    contents=
      <React.Fragment>
        <div className="step-frame">
          <div className="info-frame">
            <div className="row">
            <div className="label" style={{width: 72}}>Encryption:</div>
              <div className="field">
                {chatType.isEncrypted ? 'End-to-End Encrypted' : 'Unencrypted'}
              </div>
            </div>
            <div className="row">
              <div className="label" style={{width: 72}}>Invite:</div>
              {!copied && <div className="text-button" onClick={copyInvite.bind(this)}>Copy</div>}
              {copied && <div className="field">Copied!</div>}
            </div>
            <br/>
            <div className="row">
              <div className="label" style={{width: 72}}>Bubble:</div>
            </div>
            <div className="row">
              <div style={{width: 0}}></div>
              <div className="sublabel" style={{width: 64}}>Chain:</div>
              <div className="field">
                {chain.name}
                {chain.icon && <img className="logo-small" src={chain.icon}/>}
              </div>
            </div>
            <div className="row">
              <div style={{width: 0}}></div>
              <div className="sublabel" style={{width: 64}}>Host:</div>
              <div className="field">
                {host.name}
                {host.icon && <img className="logo-small" src={host.icon}/>}
              </div>
            </div>
            <div className="row">
              <div style={{width: 0}}></div>
              <div className="sublabel" style={{width: 64}}>Contract:</div>
              <div className="field code">
                <a href={chain.explorer.url+'/address/'+contentId.contract} target="_blank">{contentId.contract}</a>
              </div>
            </div>
            <br/>
            {metadata.members && metadata.members.length > 0 &&
              <div className="row">
                <div className="label">Members ({metadata.members.length}):</div>
              </div>
            }
            {metadata.members &&
              metadata.members.map(m => 
                <div key={m.account} className="row">
                  <div style={{width: 0}}></div>
                  {m.title && <div className="field small">{m.title}</div>}
                  {!m.title && <div className="field code">{m.contract}</div>}
                </div>
              )
            }
          </div>
        </div>
        <div className="step-frame">
          <div className="text-button" onClick={onClose}>Close</div>
        </div>
      </React.Fragment>
    />
  );
};

ChatInfoModal.propTypes = {
  chat: PropTypes.object.isRequired,
  chains: PropTypes.array.isRequired,
  hosts: PropTypes.array.isRequired,
  invite: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

