import firebase from 'firebase/app';

import 'firebase/messaging';
import { config } from '../common/config';

class Push {
  private messaging: firebase.messaging.Messaging;

  constructor(config: object) {
    firebase.initializeApp(config);
    this.messaging = firebase.messaging();
  }

  async getToken(): Promise<string> {
    return this.messaging.getToken({ vapidKey: config.firebase.vapidKey });
  }
}

export const pushService = new Push(config.firebase.config);
