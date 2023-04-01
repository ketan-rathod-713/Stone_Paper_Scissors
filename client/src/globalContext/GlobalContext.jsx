import React from "react";

const GlobalContext = React.createContext({
    yourName: "AwesomePlayer"
})

const GlobalProvider = GlobalContext.Provider
const GlobalConsumer = GlobalContext.Consumer

export {GlobalConsumer, GlobalProvider, GlobalContext}