import React from "react";
import ReactLoading from 'react-loading';

const AlertComponent = ({type, color}) => {
  return <ReactLoading type={type} color={color} height={300} width={300} />;
};

export default AlertComponent;
