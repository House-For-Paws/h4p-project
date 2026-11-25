/**
 * =============================================================================
 * FILE: client/src/contexts/MessageChatContext.jsx
 * ROLE: Global floating chat panel open/close + deep-link targets
 * =============================================================================
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const MessageChatContext = createContext(null);

export function MessageChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusThreadId, setFocusThreadId] = useState(null);
  const [focusPetId, setFocusPetId] = useState(null);
  const [requestKey, setRequestKey] = useState(0);

  const openChat = useCallback(({ threadId = null, petId = null } = {}) => {
    if (!localStorage.getItem("token")) return false;
    setFocusThreadId(threadId != null ? Number(threadId) : null);
    setFocusPetId(petId != null ? Number(petId) : null);
    setRequestKey((k) => k + 1);
    setIsOpen(true);
    return true;
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (!localStorage.getItem("token")) return false;
    setIsOpen((prev) => {
      if (prev) return false;
      setFocusThreadId(null);
      setFocusPetId(null);
      setRequestKey((k) => k + 1);
      return true;
    });
    return true;
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      focusThreadId,
      focusPetId,
      requestKey,
      openChat,
      closeChat,
      toggleChat,
    }),
    [
      isOpen,
      focusThreadId,
      focusPetId,
      requestKey,
      openChat,
      closeChat,
      toggleChat,
    ],
  );

  return (
    <MessageChatContext.Provider value={value}>
      {children}
    </MessageChatContext.Provider>
  );
}

export function useMessageChat() {
  const ctx = useContext(MessageChatContext);
  if (!ctx) {
    throw new Error("useMessageChat must be used within MessageChatProvider");
  }
  return ctx;
}
