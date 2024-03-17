import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";
import { ActionIcon, Anchor, Code, CopyButton, Group, Skeleton, 
         Image, Button, Paper, rem, Space, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAPIKeys } from './APIKeysContext';
import { useDateFormatters } from '../../lib/DateFormattersProvider';
import sdk from '@stackblitz/sdk';

import LogoComponent from '../Layout/LogoComponent';
import Navbar from '../Layout/Navbar';
import UserAuthentication from '../Layout/UserAuthentication';
import introClasses from './css/IntroPages.module.css';
import logoClasses from '../Layout/css/MainLayout.module.css';
import apiKeyClasses from './css/APIKeys.module.css';

const PlaygroundComponent = () => {
  const { isSignedIn,user } = useUser();
  const { createAPIKey, fetchAPIKeys, playgroundAPIKeys } = useAPIKeys();
  const { pastTense, formatDisplayDate, formatDisplayTime } = useDateFormatters();
  const { tempKeyPresent, setTempKeyPresent } = useState(false);

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
    
  const [opened, { toggle }] = useDisclosure();
  const [ temporaryAPIKeyValue,  setTemporaryAPIKeyValue ] = useState('');
  const [ temporaryAPIKeyExpiration,  setTemporaryAPIKeyExpiration ] = useState('');

  const createTemporaryKey = async () => {
    if (!isSignedIn) {
      return; // can't do it if you ain't signed in
    }
    await createAPIKey('development', user.id, true);
    await fetchAPIKeys(user.id);
  }

  const openStackblitz = async () => {
    await sdk.openGithubProject('willkessler/eznotifications', {
      openFile:'examples/react_sdk/src/App.tsx',
      newWindow: true,
    });
  }

  const gotoPlayground = async () => {
    // Check if a valid API key exists
    if (!temporaryAPIKeyValue || pastTense(playgroundAPIKeys[0]?.expiresAt.toISOString())) {
      // If no valid key, generate a new one
      await createTemporaryKey();
    }

    // Now, we assume `temporaryAPIKeyValue` holds a valid API key (either existing or newly generated)
    try {
      // Copy the API key to the clipboard
      await navigator.clipboard.writeText(temporaryAPIKeyValue);
      console.log('API Key copied to clipboard');
    } catch (err) {
      console.error('Failed to copy API key to clipboard', err);
    }

    // Open the playground
    //https://codesandbox.io/p/devbox/github/willkessler/this-is-not-a-drill-examples?file=%2FREADME.md
    const codeSandboxUrl = 
          'https://codesandbox.io/p/sandbox/github/willkessler/this-is-not-a-drill-examples/main?file=README.md';
    window.open(codeSandboxUrl, '_blank');
  };
  

  useEffect(() => {
    if (user && user.id) {
      fetchAPIKeys(user.id);
    }
  }, [fetchAPIKeys, user]);

  useEffect(() => {
    if (playgroundAPIKeys.length > 0) {
      if (playgroundAPIKeys[0]?.expiresAt) {
        if (!pastTense(playgroundAPIKeys[0].expiresAt.toISOString())) {
          const temporaryKeyVal = playgroundAPIKeys[0].apiKey;

          const temporaryKeyExpiration = formatDisplayDate('expire at', playgroundAPIKeys[0].expiresAt);
          console.log(`Temporary API key: ${temporaryKeyVal}`);
          setTemporaryAPIKeyValue(temporaryKeyVal); // show latest one
          setTemporaryAPIKeyExpiration(temporaryKeyExpiration);
        }
      }
    }
  }, [playgroundAPIKeys]);
  
  return (
    <Paper style={{paddingTop:'10px',marginTop:'10px'}} radius="md" p="sm">
      <Title order={2}>
        Playground Testing
      </Title>
      <Text size="md" mt="md">You can try out the service instantly in <Anchor href="https://codesandbox.io">CodeSandbox</Anchor> playground.</Text>
      <Text size="md" mt="sm">
        <Text>Click the green button below. This gives you a one-hour long temporary key. </Text>
        <Text>Paste the generated key into the sample application at CodeSandbox.</Text>
      </Text>
      <div style={{marginTop:'20px'}} className={apiKeyClasses.apiKeyRow}>
        <Text size="md"  className={apiKeyClasses.apiTemporaryKeyDisplay}>
          {temporaryAPIKeyValue}
        </Text>

        <CopyButton value={temporaryAPIKeyValue} timeout={2000} >
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied Temporary API Key!' : 'Copy'} withArrow position="right">
              <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                {copied ? (
                  <IconCheck style={{ width: rem(16) }} />
                ) : (
                  <IconCopy style={{ width: rem(16) }} />
                )}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>

        <Button onClick={gotoPlayground} style={{marginLeft:'10px'}}
                size="sm" variant="filled" color="green">
          {temporaryAPIKeyValue === '' ? <>Generate + Copy A Key</> : <>Copy the Key</>}, and Open the Playground!
        </Button>
      </div>
      <div>
        { temporaryAPIKeyValue && (
            <Text fs="italic" style={{paddingTop:'15px'}}>
              Note: temporary key <span style={{padding:'2px', border:'1px dotted #666', fontStyle:'normal', color:'green'}}>{temporaryAPIKeyValue}</span> will {temporaryAPIKeyExpiration ? temporaryAPIKeyExpiration : ''}</Text>
          ) }
      </div>
      <div>
      </div>
    </Paper>
  );
};


export default PlaygroundComponent;
