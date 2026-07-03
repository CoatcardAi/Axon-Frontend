import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ProfileTab from '../components/dashboard/ProfileTab';
import { styles } from '../styles';

export default function ProfilePage() {
  const { username, roles, profile } = useOutletContext();

  return (
    <ProfileTab
      username={username}
      roles={roles}
      profile={profile}
      styles={styles}
    />
  );
}
