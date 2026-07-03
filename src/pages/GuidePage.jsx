import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import GuideTab from '../components/dashboard/GuideTab';
import { styles } from '../styles';

export default function GuidePage() {
  const { BASE_URL, token } = useOutletContext();
  const [copiedId, setCopiedId] = useState('');

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <GuideTab
      BASE_URL={BASE_URL}
      token={token}
      handleCopyToClipboard={handleCopyToClipboard}
      copiedId={copiedId}
      styles={styles}
    />
  );
}
