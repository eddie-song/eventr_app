import React from 'react';
import { supabase } from '../../lib/supabaseClient';

function ProfileAvatar({ avatarPath }) {
  const [signedUrl, setSignedUrl] = React.useState(null);
  React.useEffect(() => {
    let isMounted = true;
    async function fetchUrl() {
      if (!avatarPath || avatarPath.trim() === '') {
        setSignedUrl(null);
        return;
      }
      if (avatarPath.startsWith('http')) {
        setSignedUrl(avatarPath);
        return;
      }
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 3600);
      if (isMounted) {
        if (error) {
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
        }
      }
    }
    fetchUrl();
    return () => { isMounted = false; };
  }, [avatarPath]);
  if (!signedUrl) return <span role="img" aria-label="avatar">👤</span>;
  return (
    <img
      src={signedUrl}
      alt="avatar"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block',
        border: 'none',
        background: 'none',
        minWidth: 0,
        minHeight: 0
      }}
    />
  );
}

export default ProfileAvatar; 