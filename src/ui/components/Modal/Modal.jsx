import PropTypes from "prop-types";
import React from "react";
import { PopularX } from "../../icons/PopularX";
import "./style.css";

export const Modal = ({ title, subtitle, contents, centered=true, contentCentered=false, onCancel }) => {
  return (
    <div className={"modal" + (centered ? " center-modal" : '')}>
      <div className="title-frame">
        <div className="title-row">
          <div className="title">{title}</div>
          <div onClick={onCancel}><PopularX className="close-icon"/></div>
        </div>
        { subtitle && 
          <div className="subtitle-frame">
            <p className="subtitle-text">{subtitle}</p>
          </div>
        }
      </div>
      <div className={"modal-content" + (contentCentered ? " centered" : '')}>
        {contents}
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  contents: PropTypes.any.isRequired,
  centered: PropTypes.bool,
  contentCentered: PropTypes.bool,
  onCancel: PropTypes.func.isRequired
};

