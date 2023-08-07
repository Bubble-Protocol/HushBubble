import React from "react";
import ReactDOMClient from "react-dom/client";
import { Desktop } from "./ui/screens/Desktop";
import { initialiseLocalStorage } from "./model/utils/LocalStorage";
import { MessengerApp } from "./model/App";
import { stateManager } from "./state-context";
import { setFaviconWithCount } from "./ui/utils/favicon";

//
// Application
//

const TRACE_ON = true;
const DEBUG_ON = true;

console.stackTrace = console.trace;
console.trace = TRACE_ON ? Function.prototype.bind.call(console.info, console, "[trace]") : function() {};
console.debug = DEBUG_ON ? Function.prototype.bind.call(console.info, console, "[debug]") : function() {};

await initialiseLocalStorage('BubbleChat');

stateManager.register('url-params');

const messenger = new MessengerApp(stateManager);
messenger.initialise()
  .then(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
      connect: urlParams.get('connect'), 
      join: urlParams.get('chat')
    }
    stateManager.dispatch('url-params', params);
  })
  .catch(console.error);

window.addEventListener('online', () => messenger.setOnlineStatus(true));
window.addEventListener('offline', () => messenger.setOnlineStatus(false));
window.addEventListener('beforeunload', () => messenger.close());


//
// UI
//

const app = document.getElementById("app");
const root = ReactDOMClient.createRoot(app);

setFaviconWithCount(0);

function render(params={}) { 
  root.render(
    <Desktop connect={params.connect} />
  );
}

render();