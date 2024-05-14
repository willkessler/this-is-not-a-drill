import React, { createContext, ReactNode, useState, useRef, useContext } from 'react';

const defaultSdkConfiguration = {
  api: {
    displayMode : 'toast',
    endpoint: process.env.NEXT_PUBLIC_TINAD_API_TARGET,
    key: process.env.NEXT_PUBLIC_TINAD_API_KEY,
    environments: [ 'Development' ],
    domains: [],
  },
  toast: {
    position: 'top-end',
    duration: 5000,
  },
  modal: {
    confirmButtonLabel: 'OK',
  },
  inline: {
    targetClassname: 'banner-space',
    targetPlacement: 'target-inside' as TargetInsertType,
    customControlClasses: {
      content: 'my-content',
      confirm: 'my-confirm',
      dismiss: 'my-dismiss',
    },
  },
  banner: {
    duration: 5000,
  },
};

interface ConfigurationContextType {
  config: SDKConfiguration;
  customCss: string;
}

const ConfigurationContext = createContext<ConfigurationContextType>({
  getSdkConfiguration: () => SDKConfiguration,
  setSdkConfiguration: (newConfig: SDKConfiguration) => {},
  getFilteredSdkConfiguration: () => SDKConfiguration,
  getCustomCss: () => string,
  setCustomCss: (newCss: string) => {},
});

const ConfigurationContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sdkConfiguration = useRef<SDKConfiguration>(defaultSdkConfiguration);
  const filteredSdkConfiguration = useRef<SDKConfiguration | null>(null);
  const [ configurationChanged, setConfigurationChanged ] = useState<boolean>(false);
  const [ customCss, setCustomCss ] = useState<string | null>(null);

  const getSdkConfiguration = (): SDKConfiguration => {
    return sdkConfiguration.current;
  }
  
  const createFilteredConfiguration = ():SDKConfiguration => {
    // Destructuring extracts displayMode, inline, etc from the top level of config
    const config = sdkConfiguration.current;
    const { api, inline, modal, banner, toast, ...rest } = config;
    const displayMode = api.displayMode;

    // Prepare a new object to store the filtered config
    let newConfig: SDKConfiguration = {
      ...rest,
      api: { ...config.api },  // Copying api settings
      [displayMode]: { ...config[displayMode] }  // Copying only the relevant display mode settings
    };

    // Check the displayMode and remove unnecessary properties
    switch (displayMode) {
      case 'toast':
        // Include only 'toast' related settings
        break;  // Already copied toast settings above
      case 'modal':
        newConfig.modal = modal;
        break;
      case 'inline':
        newConfig.inline = { ...inline };
        if (inline.targetClassname === 'tinad-container') {
          newConfig.inline = {};
        }
        break;
      case 'banner':
        newConfig.banner = banner;
        break;
    }

    return newConfig;
  }

  const getFilteredSdkConfiguration = (): SDKConfiguration => {
    return filteredSdkConfiguration.current;
  }

  const setSdkConfiguration = (newConfiguration: SDKConfiguration) => {
    sdkConfiguration.current = newConfiguration;
    const filteredConfig = createFilteredConfiguration();
    filteredSdkConfiguration.current = filteredConfig;
    setConfigurationChanged(true);
  }

  return (
    <ConfigurationContext.Provider value={{
      getSdkConfiguration,
      setSdkConfiguration,
      getFilteredSdkConfiguration,
      configurationChanged,
      setConfigurationChanged,
      customCss,
      setCustomCss
      }}>
      {children}
    </ConfigurationContext.Provider>
  );

};

export default ConfigurationContextProvider;

export const useSdkConfiguration = () => useContext(ConfigurationContext);
