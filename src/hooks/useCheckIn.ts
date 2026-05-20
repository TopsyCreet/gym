import { useCallback, useState } from 'react';
import { useGymStore } from '../store/gymStore';

export const useCheckIn = () => {
  const { verifyGymLocation, checkInToday, verifying, distance, lastCheckInMessage, checkInModalOpen, openCheckInModal, closeCheckInModal, toggleAtGymOverride, atGymOverride } = useGymStore();
  const [feedback, setFeedback] = useState<string | null>(null);

  const triggerCheckIn = useCallback(async () => {
    setFeedback(null);
    await checkInToday();
    setFeedback(lastCheckInMessage);
  }, [checkInToday, lastCheckInMessage]);

  return {
    verifyGymLocation,
    triggerCheckIn,
    verifying,
    distance,
    lastCheckInMessage,
    checkInModalOpen,
    openCheckInModal,
    closeCheckInModal,
    toggleAtGymOverride,
    atGymOverride,
    feedback
  };
};
