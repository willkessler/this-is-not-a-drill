// TODO
// send notifs and toasts out one by one
// improve poller

import { ToastNotification, ToastNotificationOptions } from './ToastNotifications';
import { InlineNotification } from './InlineNotifications';
import { ModalNotification, ModalNotificationOptions } from './ModalNotifications';
import { BannerNotification } from './BannerNotifications';
import { Poller } from './Poller';
import Toastify from 'toastify-js';

export class SDK {
  poller: Poller;
  toastNotification: ToastNotification;
  inlineNotification: InlineNotification;
  modalNotification: ModalNotification;
  bannerNotification: BannerNotification;
  apiEndpoint: string;
  apiKey: string;
  apiEnvironments: string;
  apiDomains: string;
  displayMode: string;
  userId: string;
  pollingInterval: number;
  notificationQueue: any[] = [];
  currentlyDisplayedNotificationUuid: string;

  constructor(apiEndpoint: string, apiKey: string, apiEnvironments: string, apiDomains: string, displayMode: string, userId: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.apiEnvironments = apiEnvironments;
    this.apiDomains = apiDomains;
    this.userId = userId;
    this.currentlyDisplayedNotificationUuid = null;

    const toastOptions:ToastNotificationOptions = {
      dismissCallback: this.markAsDismissed,
      duration: 10000,
    };
    this.toastNotification = new ToastNotification(toastOptions);

    this.inlineNotification = new InlineNotification(this.markAsDismissed);

    const modalOptions: ModalNotificationOptions = {
      dismissCallback: this.markAsDismissed,
    };
    this.modalNotification = new ModalNotification(modalOptions);

    this.bannerNotification = new BannerNotification({ dismissCallback: this.markAsDismissed, duration: 5000 });
    this.displayMode = displayMode;

    const pollingErrorHandler = (error: any) => { 
      if (error !== null) { 
        console.error('Polling Error:', error);
      }
    };
    this.pollingInterval = 10000; // ms
    this.poller = Poller.getInstance(this.pollApi, 5000, pollingErrorHandler);  // Directly pass as arrow function

  }

  addToNotificationQueue(notification: any): void {
    // Check for existing notification by UUID
    const exists = this.notificationQueue.some(n => n.uuid === notification.uuid) || (notification.uuid === this.currentlyDisplayedNotificationUuid);

    if (!exists) {
      this.notificationQueue.push(notification);  // Add if not a duplicate
    }
  }

  pollApi = async ():Promise<number> => {
    console.log('pollApi running');
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${this.apiKey}`, 
        'Content-type': 'application/json' ,
        'X-Tinad-Source': 'vanillaJsSdk',
      }),
    }

    try {
      const fullUrl = `${this.apiEndpoint}/notifications?userId=${this.userId}&environments=${this.apiEnvironments}`;
      const response = await fetch(fullUrl, fetchOptions);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        for (const notification of data) {
          this.addToNotificationQueue(notification);
        }
      }

      // Display the next notification if there is one and nothing is currently displayed
      await this.displayNextNotification();

      return this.pollingInterval;  // Return updated interval if applicable
    } catch (error) {
      console.error('API Poll Error:', error);
      throw error;
    }
  }

  async displayNotification(notification: any, dismissCallback: () => void): Promise<void> {
    console.log('displayNotification');
    try {
//      notification.content = notification.content + 
//        'Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. ' +
//        'Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus,'+
//        ' iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet.'; 
      console.log('Content:', notification.content);
      switch (this.displayMode) {
        case 'toast':
          this.toastNotification.show(notification.content, notification.uuid);
          break;
        case 'inline':
          this.inlineNotification.show(notification.content, notification.uuid);
          break;
        case 'modal':
          this.modalNotification.show(notification.content,  notification.uuid);
          break;
        case 'banner':
          this.bannerNotification.show(notification.content, notification.uuid);
          break;
      }
      this.currentlyDisplayedNotificationUuid = notification.uuid;
    } catch (error) {
      console.error('Display notification error: ', error);
    }
  }

  displayNextNotification = async () => {
    console.log('displayNextNotification');
    if (this.notificationQueue.length === 0) return;  // Exit if no notifications in queue

    const notification = this.notificationQueue.shift();  // Get the next notification

    const dismissCallback = async () => { 
      await this.markAsDismissed(notification.uuid);
    };
    this.displayNotification(notification, dismissCallback);
  }  

  markAsDismissed = async (notificationUuid: string): Promise<void> => {
    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Tinad-Source': 'vanillaJsSdk',
        }),
        body: JSON.stringify({ 
          notificationUuid,
          userId: this.userId,
        }),
      };

      const response = await fetch(`${this.apiEndpoint}/notifications/dismiss`, fetchOptions);
      const data = await response.json();
      console.log('Notification dismissed:', data);
      this.currentlyDisplayedNotificationUuid = null;
      this.poller.restartPolling();
    } catch (error) {
      console.error('Display notification error: ', error);
    }
  }
}
