import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const ChatDateRow = ({ date = "date", className }) => {
  return (
    <div className={`chat-date-row ${className}`}>
      <div className="chat-line" alt="Chat line" src="/img/chat-line-3.svg" />
      <div className="chat-date-text">{formatDate(date)}</div>
      <div className="chat-line" alt="Chat line" src="/img/chat-line-2.svg" />
    </div>
  );
};

ChatDateRow.propTypes = {
  date: PropTypes.any,
};


function formatDate(messageDate) {
  const currentDate = new Date();
  currentDate.setHours(0,0,0,0);
  const startOfToday = currentDate.getTime();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const diffInDays = (startOfToday - messageDate.getTime()) / oneDayInMilliseconds;

  // If message is from today
  if (diffInDays <= 0) {
    return 'Today';
  }

  // If message is from yesterday
  if (diffInDays <= 1) {
    return 'Yesterday';
  }

  // If message is from last week
  if (diffInDays <= 7) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[messageDate.getDay()];
  }
  
  // If message is from a different year
  return messageDate.toLocaleDateString();
}