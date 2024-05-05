import '../css/inlineNotifications.css';
import { MarkdownLib } from '../lib/Markdown';
import { SDKConfiguration, TargetInsertType } from '../types';
import { SDKNotification } from '../../../react-core/src/types';

export class InlineNotification {
  private tinadNotificationElements: HTMLElement[];         // Store references to all containers
  private tinadNotificationContentElements: HTMLElement[];  // Store references to all divs in those containers
  private configuration:SDKConfiguration;
  private currentNotificationUuid: string;
  private inlineNotifOn:boolean;
  private foundTargetElements:boolean;
  private targetElementClassname: string;
  private TINAD_CONTAINER_DEFAULT_CLASSNAME = 'tinad-container';
  private TINAD_NOTIFICATION_DEFAULT_CLASSNAME = 'tinad-notification';
  private TINAD_OKBUTTON_CLASSNAME = 'tinad-ok-button';
  private TINAD_DISMISSX_CLASSNAME = 'tinad-dismiss-x';

  constructor(configuration:SDKConfiguration ) {
    this.configuration = configuration;
    // Set up TINAD notifications in the dom, either before/inside/after containers defined by the user, or inside a .tinad-container element.
    this.targetElementClassname = (this.configuration.inline.targetClassname !== null ? this.configuration.inline.targetClassname : this.TINAD_CONTAINER_DEFAULT_CLASSNAME);

    // if user passed a target class then we should make sure that target exists, and then create tinad containers before, inside, or after that target
    this.foundTargetElements = true;
    const targetContainers = Array.from(document.querySelectorAll('.' + this.targetElementClassname));
    if (targetContainers.length == 0) {
      this.foundTargetElements = false;
      console.error(`TINAD: No target elements found with classname ${this.targetElementClassname} for placing inline notifications.`);
    } else {
        if (this.configuration.inline.customControlClasses) {
          // Set up sdk user's own custom mark up for running tinad
          const customControlClasses = this.configuration.inline.customControlClasses;
          let elements;
          elements = Array.from(document.querySelectorAll('.' + this.targetElementClassname));
          for (const element of elements) {
            element.className += ' ' + this.TINAD_CONTAINER_DEFAULT_CLASSNAME;
          }
          elements = Array.from(document.querySelectorAll('.' + customControlClasses.content));
          for (const element of elements) {
            element.className += ' ' + this.TINAD_NOTIFICATION_DEFAULT_CLASSNAME;
          }
          elements = Array.from(document.querySelectorAll('.' + customControlClasses.confirm));
          for (const element of elements) {
            element.className += ' ' + this.TINAD_OKBUTTON_CLASSNAME;
            element.onclick = async () => { await this.hideContainers(); };
          }
          elements = Array.from(document.querySelectorAll('.' + customControlClasses.dismiss));
          for (const element of elements) {
            element.className += ' ' + this.TINAD_DISMISSX_CLASSNAME;
            element.onclick = async () => { await this.hideContainers(); };
          }
        } else {
          // create notification divs to put our content in, with "display:none"
          for (const container of targetContainers) {
            const notificationElement = document.createElement('div');
            notificationElement.className = this.TINAD_CONTAINER_DEFAULT_CLASSNAME;
            notificationElement.style.display = 'none';

            const contentDiv = document.createElement('div');
            contentDiv.className = this.TINAD_NOTIFICATION_DEFAULT_CLASSNAME;
            notificationElement.appendChild(contentDiv);
            
            const dismissButtonX = document.createElement('button');
            dismissButtonX.className = this.TINAD_DISMISSX_CLASSNAME;
            dismissButtonX.textContent = 'x';
            dismissButtonX.onclick = async () => { await this.hideContainers(); };
            notificationElement.appendChild(dismissButtonX);

            const okButton = document.createElement('button');
            okButton.className = this.TINAD_OKBUTTON_CLASSNAME;
            okButton.textContent = 'OK';
            okButton.onclick = async () => { await this.hideContainers(); };
            notificationElement.appendChild(okButton);

            switch (this.configuration.inline.targetPlacement) {
              case TargetInsertType.TargetInside:
                console.log('trying to insert inside');
                container.innerHTML = '';  // Clear previous content
                container.appendChild(notificationElement);
                break;
              case TargetInsertType.TargetBefore:
                console.log('trying to insert before');
                if (container !== document.body) {
                  container.parentElement.insertBefore(notificationElement, container);
                  console.log('inserted before');
                }
                break;
              case TargetInsertType.TargetAfter:
                console.log('trying to insert after');
                if (container !== document.body) {
                  container.insertAdjacentElement('afterend', notificationElement);
                }
                break;
            }
          }
        }
    }
    // Any div element inside the tinad-containers is for holding the content.
    this.tinadNotificationElements = Array.from(document.querySelectorAll('.' + this.TINAD_CONTAINER_DEFAULT_CLASSNAME));
    this.tinadNotificationContentElements = Array.from(document.querySelectorAll('.' + this.TINAD_NOTIFICATION_DEFAULT_CLASSNAME));
    this.inlineNotifOn = false;
  }


  private async hideContainers() {
    this.tinadNotificationElements.forEach(notificationElement => {
      notificationElement.style.display = 'none';
    });
    this.inlineNotifOn = false;
    await this.configuration.api.dismissFunction(this.currentNotificationUuid);
  }

  private async setAndShowNotifications(content):Promise<void> {
    console.log('setAndShowNotifications');
    // Insert content.
    const markedContent = await MarkdownLib.renderMarkdown(content);
    for (const notificationContentElement of this.tinadNotificationContentElements) {
      notificationContentElement.innerHTML = markedContent;
    }
    // Show all containers.
    this.tinadNotificationElements.forEach(notificationElement => {
      notificationElement.style.display = 'block';
    });
  }

  public show = async (notification:SDKNotification):Promise<void> => {
    const content = notification.content || 'Default text';
    const uuid = notification.uuid;

    if (this.inlineNotifOn) {
      return;
    }

    if (!this.foundTargetElements) {
      return; // can't target TINAD notifs anywhere on the page
    }

    // Fill all containers with the same content
    this.currentNotificationUuid = uuid;
    await this.setAndShowNotifications(content);

    this.inlineNotifOn = true;
  }

}
