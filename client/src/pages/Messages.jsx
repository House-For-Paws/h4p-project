/**
 * =============================================================================
 * FILE: client/src/pages/Messages.jsx
 * ROLE: Deep-link bridge — opens floating chat, then leaves /messages
 * =============================================================================
 */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMessageChat } from "../contexts/MessageChatContext";

function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openChat } = useMessageChat();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    const threadId = searchParams.get("thread");
    const petId = searchParams.get("petId");
    openChat({
      threadId: threadId ? Number(threadId) : null,
      petId: petId ? Number(petId) : null,
    });
    navigate("/", { replace: true });
  }, []);

  return null;
}

export default Messages;
