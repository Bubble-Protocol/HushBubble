import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import defaultIcon from "../../../assets/img/unknown-contact-icon.png";
import { resizeImage } from "../../../model/utils/image-utils";

export const IconChooser = ({ icon, onChange=()=>{}, disabled=false, changeText }) => {

  const inputFile = React.createRef();

  function changeIcon(e) {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const processImage = (image) => {
        const resizedImage = resizeImage(image, 240);
        onChange(resizedImage);
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = new Image();
        image.onload = () => { processImage(image) };
        image.src = e.target.result.toString();
      }
      reader.readAsDataURL(fileList.item(0));
    }
  }

  function openFileChooser() {
    inputFile.current.click();
  }

  return (
    <div className="icon-chooser">
      <img className="icon" src={icon || defaultIcon} onClick={() => !disabled && openFileChooser()} />
      {changeText && <span className="small-text" onClick={() => !disabled && openFileChooser()}>{changeText}</span>}
      <input id='file' ref={inputFile} type="file" accept='image/*' hidden={true} onChange={changeIcon}/>
    </div>
  );
};

IconChooser.propTypes = {
  icon: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  changeText: PropTypes.string,
};
