import PropTypes from "prop-types";
import React from "react";
import { PopularX } from "../../icons/PopularX";
import "./style.css";

export const Modal = ({ title, subtitle, contents, loading, centered=true, contentCentered=false, onCancel }) => {
  return (
    <div className={"modal" + (centered ? " center-modal" : '') + (loading ? " loading" : '')}>
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
      {loading && <div className="loading"><div className='loader' style={{width: 64, height: 64, opacity: "200%"}}></div></div>}
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

