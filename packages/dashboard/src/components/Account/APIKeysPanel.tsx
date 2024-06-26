import React, { useEffect, useState } from 'react';
import { ActionIcon, Checkbox, CopyButton, Tooltip, rem, Anchor, Button, Text, Title } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";
import toast, { Toaster } from 'react-hot-toast';
import APIKeysTable from './APIKeysTable';
import { useAPIKeys } from './APIKeysContext';
import classes from './css/APIKeys.module.css';

const APIKeysPanel = () => {
  const [agreeToRegenerateProdKey, setAgreeToRegenerateProdKey] = useState(false);
  const { user } = useUser();
  const { APIKeys, 
          fetchAPIKeys, 
          createAPIKey, 
          APIKeysLoading,
          APIKeysLastUpdated, 
          productionAPIKeyValue
        } = useAPIKeys();

  const createDevelopmentApiKey = () => {
    if (user) {
      createAPIKey('development', user.id);
    }
  };

  const createProdApiKey = () => {
    if (agreeToRegenerateProdKey && user) {
      console.log('Generating new production API key.');
      createAPIKey('production', user.id);
      setAgreeToRegenerateProdKey(false);
    } else {
      toast.error('You must check the "Yes, go ahead" checkbox first, as this action will disable any existing production api key you may have.', {
        duration: 5000,
        position: 'top-center',

        // Styling
        style: {
          minWidth:'500px',
        },

        // Change colors of success/error/loading icon
        iconTheme: {
          primary: '#fff',
          secondary: '#f00',
        },

        // Aria
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }      
  };


  return (
      <div className={classes.apiKeyPanel} >
        <Toaster />
        <Title style={{borderBottom:'1px solid #555', marginTop:'15px', marginBottom:'5px'}} order={3}>API Keys</Title>
        <Text style={{marginTop:'10px'}} size="lg">Development</Text>
        <APIKeysTable />
        <Button onClick={createDevelopmentApiKey} size="xs" style={{marginTop:'10px'}}>Generate new development key</Button>

        <Text size="lg" style={{marginTop:'30px'}}>Production Key</Text>

        <div className={classes.apiKeyRow}>
          <Text size="sm" className={classes.apiProdKeyDisplay}>
            {productionAPIKeyValue === null ? '<not set yet>' : productionAPIKeyValue}
          </Text>

          <CopyButton value={productionAPIKeyValue ? productionAPIKeyValue : ''} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied Production API Key!' : 'Copy'} withArrow position="right">
                <ActionIcon color={copied ? '#f33' : 'gray'} variant="subtle" onClick={copy} style={{color:'#3f3'}}>
                  {copied ? (
                    <IconCheck style={{ width: rem(16) }} />
                  ) : (
                    <IconCopy style={{ width: rem(16) }} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </div>

        <Button onClick={createProdApiKey} size="xs" style={{marginTop:'10px', color:'#020', backgroundColor:'#3f3'}}>Generate New Production API Key</Button>
        <Checkbox style={{marginTop:'10px', maxWidth:'300px'}} 
                  checked={agreeToRegenerateProdKey} 
                  onChange={(event) => setAgreeToRegenerateProdKey(event.currentTarget.checked) }
                  label="Yes, go ahead and replace any existing production key with a new one." />
      </div>
  );
}

export default APIKeysPanel;
