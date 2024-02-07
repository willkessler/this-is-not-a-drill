import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Table, TextInput, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './InviteUser.module.css';
import InviteMember from './InviteMember';
import PendingInvitationsList from './PendingInvitations';
 
const AdminControls = ({ membership }: { membership: OrganizationMembershipResource }) => {
  const [disabled, setDisabled] = useState(false);
  const {
    user: { id: userId },
  } = useUser();
 
  if (membership.publicUserData.userId === userId) {
    return null;
  }
 
  const removeMember = async () => {
    setDisabled(true);
    await membership.destroy();
  };
 
  const changeRole = async (role: MembershipRole) => {
    setDisabled(true);
    await membership.update({ role });
    setDisabled(false);
  };
 
  return (
    <>
      <Anchor component="button" style={{marginRight:'10px', paddingRight: '10px', borderRight:'1px solid'}} onClick={removeMember}>
        Remove member
      </Anchor>
      {membership.role === "admin" ? (
        <Anchor component="button" onClick={() => changeRole("org:member")}>
          Make regular member
        </Anchor>
      ) : (
        <Anchor component="button" onClick={() => changeRole("org:admin")}>
          Make admin
        </Anchor>
      )}
    </>
  );
};

const MemberList = () => {
  const { memberships, membershipList, membership } = useOrganization({
    membershipList: {},
  });
 
  if (!membershipList) {
    return null;
  }
 
  const isCurrentUserAdmin = membership.role === "org:admin";
  //console.log('membership:', membership);
 
  const memberRows = membershipList.map((m) => (
    <Table.Tr key={m.publicUserData.identifier}>
      <Table.Td>{m.publicUserData.firstName} {m.publicUserData.lastName}</Table.Td>
      <Table.Td>{m.publicUserData.identifier}</Table.Td>
      <Table.Td>{(m.role === 'org:admin') ? 'Admin' : 'Member'}</Table.Td>
      <Table.Td>{isCurrentUserAdmin && <AdminControls membership={m} />}</Table.Td>
    </Table.Tr>
  ));

  return (
      <Table verticalSpacing="xs" highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Status</Table.Th>          
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {memberRows}
        </Table.Tbody>
      </Table>
  );
}

export default MemberList;

