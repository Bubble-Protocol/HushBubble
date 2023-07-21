import React from "react";
import ReactDOMClient from "react-dom/client";
import { Desktop } from "./ui/screens/Desktop";
import { initialiseLocalStorage } from "./model/utils/LocalStorage";
import { MessengerApp } from "./model/App";
import { stateManager } from "./state-context";

//
// Application
//

const APP_UID = "4cc22e0c9f762f7378a226f0b7f06d2101fe6f727995bcd331ed298addf3301b";

const TRACE_ON = true;
const DEBUG_ON = true;

console.stackTrace = console.trace;
console.trace = TRACE_ON ? Function.prototype.bind.call(console.info, console, "[trace]") : function() {};
console.debug = DEBUG_ON ? Function.prototype.bind.call(console.info, console, "[debug]") : function() {};

await initialiseLocalStorage('BubbleChat');

const messenger = new MessengerApp(stateManager);
messenger.initialise();

window.addEventListener('online', () => messenger.setOnlineStatus(true));
window.addEventListener('offline', () => messenger.setOnlineStatus(false));
window.addEventListener('beforeunload', () => messenger.close());


//
// UI
//

const app = document.getElementById("app");
const root = ReactDOMClient.createRoot(app);

function render() { 
  root.render(
    <Desktop />
  );
}

render();