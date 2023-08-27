import { EventManager } from "../../model/utils/EventManager";

//
// Window Events
//

export const windowEvents = new EventManager(['visible', 'online', 'offline', 'beforeunload']);


// Simple events

window.addEventListener('online', () => windowEvents.notifyListeners('online'));
window.addEventListener('offline', () => windowEvents.notifyListeners('offline'));
window.addEventListener('beforeunload', () => windowEvents.notifyListeners('beforeunload'));


// Window visibility

let visible = document.visibilityState === 'visible';

document.addEventListener('visibilitychange', () => setVisible(document.visibilityState === 'visible'));
window.addEventListener('focus', () => setVisible(true));
window.addEventListener('blur', () => setVisible(false));

function setVisible(v) {
  const pV = visible;
  visible = v;
  if (visible && pV !== v) windowEvents.notifyListeners('visible');
}
