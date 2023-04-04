import React from "react";
import ReactLoading from 'react-loading';

const AlertComponent = ({type, color}) => {
  return <ReactLoading type={type} color={color} height={200} width={200} />;
};

export default AlertComponent;
