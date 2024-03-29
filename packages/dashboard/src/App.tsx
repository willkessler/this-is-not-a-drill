import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Anchor, Button, Code, Group, Image, Modal, Textarea, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import RouterComponent from './components/Router';
import { ConfigProvider } from './lib/ConfigContext';
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes';
import classes from './pages/NavbarSimple.module.css';
import { TimezoneProvider } from './lib/TimezoneContext';

// Import your publishable key for Clerk
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
 
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        signIn: { baseTheme: 'neobrutalism' as any }
      }}
    >
      <ConfigProvider>
        <Router>
          <MantineProvider defaultColorScheme="dark" >
            <TimezoneProvider>
              <RouterComponent />
            </TimezoneProvider>
          </MantineProvider>
         </Router>
       </ConfigProvider>
      </ClerkProvider>
    );
}
