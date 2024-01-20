import cx from 'clsx';
import { Table, ScrollArea } from '@mantine/core';
import { useState } from 'react';

import classes from './TableScrollArea.module.css';

export function NotificationsList(parameters) {
  const [scrolled, setScrolled] = useState(false);

  const notifications = parameters.notifications;
  const rows = notifications.map((row, index) => (
    <Table.Tr key={row.id || index}>
      <Table.Td>{row.content}</Table.Td>
      <Table.Td>{row.pageId}</Table.Td>
      <Table.Td>{row.startTime}</Table.Td>
      <Table.Td>{row.endtTime}</Table.Td>
      <Table.Td>{row.canceled ? 'X' : ''}</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={700} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700} verticalSpacing="md">
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>Contents</Table.Th>
            <Table.Th>Page ID</Table.Th>
            <Table.Th>Start Date</Table.Th>
            <Table.Th>End Date</Table.Th>
            <Table.Th>Canceled</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
