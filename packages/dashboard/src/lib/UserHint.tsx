import { useDisclosure } from '@mantine/hooks';
import { Text, Popover } from '@mantine/core';
import React from 'react';

interface UserHintProps {
  children: React.ReactNode;
  hintText: string;
}

const UserHint: React.FC<UserHintProps> = ({ children, hintText }) => {
  const [opened, { close, open }] = useDisclosure();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <span>{children ? children : ''}</span>
      <Popover width={200} position="top" withArrow shadow="md" opened={opened}>
        <Popover.Target>
          <svg onMouseEnter={open} onMouseLeave={close} width="18" height="18" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'help', fill: '#aaa' }}>
            <circle cx="9" cy="9" r="8" stroke="black" strokeOpacity="0.5"></circle>
            <path d="M8.23295 10.5455H9.25568V10.4943C9.27273 9.4375 9.54545 8.97727 10.2955 8.50852C11.0455 8.05256 11.4886 7.39631 11.4886 6.45455C11.4886 5.125 10.517 4.15341 9.01705 4.15341C7.63636 4.15341 6.54119 5.00568 6.47727 6.45455H7.55114C7.61506 5.44886 8.31818 5.03977 9.01705 5.03977C9.81818 5.03977 10.4659 5.56818 10.4659 6.40341C10.4659 7.08097 10.0781 7.56676 9.57955 7.86932C8.74432 8.37642 8.24574 8.87074 8.23295 10.4943V10.5455ZM8.77841 13.0682C9.20028 13.0682 9.54545 12.723 9.54545 12.3011C9.54545 11.8793 9.20028 11.5341 8.77841 11.5341C8.35653 11.5341 8.01136 11.8793 8.01136 12.3011C8.01136 12.723 8.35653 13.0682 8.77841 13.0682Z" fill="black" fillOpacity="0.6"></path>
          </svg>          
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
          <Text size="sm">{hintText}</Text>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default UserHint;
