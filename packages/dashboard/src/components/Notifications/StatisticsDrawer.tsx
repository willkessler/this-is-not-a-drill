import { useState, useEffect } from 'react';
import { Button, Drawer, Text, Title, Tooltip } from '@mantine/core';
import classes from './Notifications.module.css';
import { useDisclosure } from '@mantine/hooks';
import { useNotifications } from './NotificationsContext';
import { useSettings } from '../Account/SettingsContext';
import { 
    IconRotate,
} from '@tabler/icons-react';

const StatisticsDrawer = () => {
  const { isStatisticsDrawerOpen,
          setIsStatisticsDrawerOpen,
          openStatisticsDrawer,
          closeStatisticsDrawer,
          showResetViewsModal,
          closeResetViewsModal,
          } = useNotifications();

  const [opened] = useDisclosure();

  return (
      <Drawer
      position="bottom" size="lg" 
      opened={isStatisticsDrawerOpen}
      offset={10}
      withCloseButton={false}
      onClose={() => { 
          setIsStatisticsDrawerOpen(false); 
          console.log('Statistics Drawer close') }
              }>
      <Title style={{borderBottom:'1px dotted #666', marginBottom:'20px', padding:'10px 0 10px 0px'}} order={3}>Notification Viewership: Statistics</Title>
      <Text style={{fontStyle:'italic', border:'1px dotted #666', 
                    padding:'20px 10px 50px 20px',
                    marginBottom: '20px', }}>Actual tracked data coming soon!</Text>
        <Tooltip openDelay={1000} label="Reset view counts on this notification" position="left" withArrow>
          <Button size="sm" onClick={ () => { closeStatisticsDrawer(); showResetViewsModal() }} >Reset views</Button>
        </Tooltip>
      &nbsp;&nbsp;
        <Button size="sm" onClick={ () => { closeStatisticsDrawer(); }} >Done</Button>
     </Drawer>
  );
}

export default StatisticsDrawer;
