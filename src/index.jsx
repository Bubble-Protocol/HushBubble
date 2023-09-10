import React from "react";
import ReactDOMClient from "react-dom/client";
import { Desktop } from "./ui/screens/Desktop";
import { initialiseLocalStorage } from "./model/utils/LocalStorage";
import { MessengerApp } from "./model/App";
import { stateManager } from "./state-context";
import { setFaviconWithCount } from "./ui/utils/favicon";
import { windowEvents } from "./ui/utils/browser-utils";
import { rainbowKitConfig } from "./ui/utils/rainbow-kit";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";

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

windowEvents.on('online', () => messenger.setOnlineStatus(true));
windowEvents.on('offline', () => messenger.setOnlineStatus(false));
windowEvents.on('visible', () => messenger.checkConnections());
// windowEvents.on('beforeunload', () => messenger.close());


//
// UI
//

const app = document.getElementById("app");
const root = ReactDOMClient.createRoot(app);

setFaviconWithCount(0);

function render(params={}) { 
  root.render(
    <WagmiConfig config={rainbowKitConfig.wagmiConfig}>
      <RainbowKitProvider chains={rainbowKitConfig.chains} theme={lightTheme({borderRadius: 'small'})} >
        <Desktop connect={params.connect} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

render();