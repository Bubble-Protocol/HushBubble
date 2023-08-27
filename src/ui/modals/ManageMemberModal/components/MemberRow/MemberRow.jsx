import PropTypes from "prop-types";
import React from "react";
import defaultIcon from "../../../../../assets/img/unknown-contact-icon.png";
import { PopularX } from "../../../../icons/PopularX";
import { PopularCheck } from "../../../../icons/PopularCheck";
import { PopularMinus } from "../../../../icons/PopularMinus";
import "./style.css";

export const MemberRow = ({ member, modType, modified, toggleModified }) => {

  return (
    <div className="member-row" onClick={toggleModified} >
      <img className="member-icon" src={member.icon || defaultIcon} />
      <div className="member-title">{member.title || member.account || member.getKnownAs()}</div>
      {modified && modType === 'add' && <PopularCheck size={28} color="#10CA0D" className="icon-button" />}
      {modified && modType === 'remove' && <PopularX size={28} color="#DB0707" className="icon-button" />}
      {!modified && <PopularMinus size={28} className="icon-button" />}
      <div className={"mod-button " + modified ? modType : ''}></div>
    </div>
  );

};

MemberRow.propTypes = {
  member: PropTypes.object.isRequired,
  modType: PropTypes.string.isRequired,
  modified: PropTypes.bool.isRequired,
  toggleModified: PropTypes.func.isRequired
};
