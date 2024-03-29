import { useEffect } from 'react';

import type { OrganizationDataProps, CallbackOutcomes, SettingsContextType } from  '../../lib/shared_dts/SettingsContext';
import { NotificationsProvider, useNotifications } from './NotificationsContext';
import toast, { Toaster } from 'react-hot-toast';

import PreviewBanner from '../Preview/PreviewBanner';
import PreviewModal from '../Preview/PreviewModal';
import NotificationsHeader from './NotificationsHeader';
import NotificationsList from './NotificationsList';
import NotificationsModal from './NotificationsModal';
import ResetViewsModal from './ResetViewsModal';
import DeleteModal from './DeleteModal';
import StatisticsDrawer from './StatisticsDrawer';
import { useSettings } from '../Account/SettingsContext';
import { useAPIKeys } from '../Account/APIKeysContext';
import { useUser } from "@clerk/clerk-react";

const Notifications = () => {

  const { setupClerkOrganizationAndMirrorRecords, isSetupComplete, setIsSetupComplete } = useSettings();
  const { createAPIKey } = useAPIKeys();
  const { user } = useUser();

  const componentLoadCallbackFn = (outcomes: CallbackOutcomes) => {
    console.log(`We've completed setting things up, outcomes: ${JSON.stringify(Object.keys(outcomes),null,2)}.`);
  };

  useEffect(() => {
    console.log('Notifications component mount');
    if (!isSetupComplete) {
      setupClerkOrganizationAndMirrorRecords(componentLoadCallbackFn);
      setIsSetupComplete(true);
    }
    console.log('Notifications component completed');
  }, []);

  return (
      <>
          <NotificationsProvider>
            <NotificationsHeader />
            <NotificationsList />
            <NotificationsModal />
            <PreviewBanner />
            <PreviewModal />
            <DeleteModal />
            <ResetViewsModal />
            <StatisticsDrawer />
            <Toaster />
          </NotificationsProvider>
      </>
  );
}

export default Notifications;
