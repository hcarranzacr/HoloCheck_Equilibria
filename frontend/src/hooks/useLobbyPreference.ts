/**
 * Custom hook for managing lobby skip preference
 */

import { useState, useEffect } from 'react';

export function useLobbyPreference(userId: string | undefined) {
  const [skipLobby, setSkipLobby] = useState(false);
  const storageKey = userId ? `holocheck_skip_lobby_${userId}` : '';

  useEffect(() => {
    if (!userId) return;
    
    const saved = localStorage.getItem(storageKey);
    setSkipLobby(saved === 'true');
  }, [userId, storageKey]);

  const updatePreference = (skip: boolean) => {
    if (!userId) return;
    
    setSkipLobby(skip);
    localStorage.setItem(storageKey, String(skip));
    console.log('💾 [useLobbyPreference] Preference saved:', skip);
  };

  const resetPreference = () => {
    if (!userId) return;
    
    setSkipLobby(false);
    localStorage.removeItem(storageKey);
    console.log('🔄 [useLobbyPreference] Preference reset');
  };

  return { skipLobby, updatePreference, resetPreference };
}