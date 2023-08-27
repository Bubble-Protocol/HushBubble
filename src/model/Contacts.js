import { ErrorCodes } from "@bubble-protocol/core";
import { User } from "./User";

export class Contacts {

  contacts = new Map();
  expiredListeners = [];

  constructor(profileRegistry) {
    this.profileRegistry = profileRegistry;
  }

  getContact(id, updateListener) {
    const user = new User(id);
    const storedContact = this.contacts.get(user.account);
    if (storedContact) {
      if (updateListener && !storedContact.listeners.includes(updateListener)) storedContact.listeners.push(updateListener);
      return storedContact.user;
    }
    else {
      const contact = {user, listeners: updateListener ? [updateListener] : []};
      this.contacts.set(user.account, contact);
      this.profileRegistry.getProfile(user.account)
      .then(profile => {
        user.title = profile.title;
        user.icon = profile.icon;
        this._notifyListeners(contact)
      })
      .catch(error => {
        if (error.code !== ErrorCodes.BUBBLE_SERVER_ERROR_FILE_DOES_NOT_EXIST) console.warn('failed to get contact profile', error);
      })
      return user;
    }
  }

  removeUpdateListener(updateListener) {
    if (!this.expiredListeners.includes(updateListener)) this.expiredListeners.push(updateListener);
  }

  _notifyListeners(contact) {
    contact.listeners.forEach(l => {
      if (!this.expiredListeners.includes(l)) l(contact.user);
    })
  }

}