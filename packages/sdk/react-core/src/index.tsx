import { ReactNode, useState, useEffect } from 'react';

import type { SDKProviderProps, SDKConfig, SDKNotification, SDKDataReturn } from './types';
import { TinadSDKCoreProvider, useTinadSDK } from './context';

const TinadSDKProvider:React.FC<SDKProviderProps> = ({ children, domains, environments, skipPolling }) => {
  return (
    <TinadSDKCoreProvider domains={domains} environments={environments} skipPolling={skipPolling} >
      {children}
    </TinadSDKCoreProvider>
  );

};

export { SDKProviderProps, SDKNotification, SDKDataReturn } from './types';
export { TinadSDKProvider, useTinadSDK };

export const useSDKData = (): SDKDataReturn => {
  //console.log('This Is Not A Drill (TINAD): Core fetch running now.');

  const { 
    fetchPending,
    fetchError, 
    notificationsQueue,
    dismissNotificationCore, 
    resetAllViewsCore,
  } = useTinadSDK();

  const returnObj: SDKDataReturn = {
    data: notificationsQueue,
    fetchPending: fetchPending,
    fetchError: fetchError,
    dismiss: dismissNotificationCore,
    reset: resetAllViewsCore,
  };

  //console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
  return returnObj;
};
