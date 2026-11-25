/**
 * =============================================================================
 * FILE: client/src/Components/features/ChatWindow.jsx
 * ROLE: Floating pet-linked chat panel (inbox + conversation)
 * =============================================================================
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  ChevronLeft,
  Flag,
  MessageCircle,
  PawPrint,
  Trash2,
  X,
} from "lucide-react";
import { useMessageChat } from "../../contexts/MessageChatContext";
import {
  deleteMessageThread,
  getMessageThread,
  getMessageThreads,
  sendMessage,
  startMessageThread,
} from "../../services/messageService";
import { createMessageUserReport } from "../../services/reportService";
import { blockUser } from "../../services/blockService";
import styles from "../../styles/messages.module.css";

const MESSAGE_USER_REASONS = [
  "Harassment / bullying",
  "Spam / scam",
  "Inappropriate messages",
  "Threats / abuse",
  "Other",
];

function displayPerson({ firstName, lastName, username }) {
  const full = `${firstName || ""} ${lastName || ""}`.trim();
  return full || username || "User";
}

function petThumb(item) {
  if (item?.petImage) return item.petImage;
  if (!item?.petImages) return "";
  try {
    const parsed = Array.isArray(item.petImages)
      ? item.petImages
      : JSON.parse(item.petImages);
    return Array.isArray(parsed) ? parsed[0] || "" : "";
  } catch {
    return "";
  }
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id != null ? Number(payload.id) : null;
  } catch {
    return null;
  }
}

function ChatWindow() {
  const navigate = useNavigate();
  const {
    isOpen,
    closeChat,
    focusThreadId,
    focusPetId,
    requestKey,
  } = useMessageChat();
  const currentUserId = getCurrentUserId();

  const [view, setView] = useState("list"); // list | chat
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingPet, setPendingPet] = useState(null);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [chatError, setChatError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(MESSAGE_USER_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [reporting, setReporting] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState(MESSAGE_USER_REASONS[0]);
  const [blockDetails, setBlockDetails] = useState("");
  const [attachReport, setAttachReport] = useState(true);
  const [blockError, setBlockError] = useState("");
  const [blockSuccess, setBlockSuccess] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);
  const bottomRef = useRef(null);
  const activeThreadIdRef = useRef(null);
  const handledRequest = useRef(0);

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  const loadThreads = async ({ quiet = false } = {}) => {
    if (!quiet) setLoadingList(true);
    setError("");
    try {
      const res = await getMessageThreads();
      setThreads(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        closeChat();
        navigate("/login");
        return;
      }
      if (!quiet) {
        setError(err.response?.data?.message || "Could not load messages.");
      }
    } finally {
      if (!quiet) setLoadingList(false);
    }
  };

  const openThread = async (id) => {
    const numericId = Number(id);
    if (!numericId) return;
    setPendingPet(null);
    setActiveThreadId(numericId);
    setView("chat");
    setLoadingChat(true);
    setChatError("");
    try {
      const res = await getMessageThread(numericId);
      setThread(res.data?.thread || null);
      setMessages(res.data?.messages || []);
      const listRes = await getMessageThreads();
      setThreads(listRes.data || []);
    } catch (err) {
      setChatError(
        err.response?.data?.message || "Could not open this conversation.",
      );
    } finally {
      setLoadingChat(false);
    }
  };

  const startFromPet = async (petId) => {
    setLoadingChat(true);
    setChatError("");
    setPendingPet(null);
    setView("chat");
    try {
      const res = await startMessageThread({ petId: Number(petId) });
      if (res.data?.pending && res.data?.pet) {
        setPendingPet(res.data.pet);
        setThread({
          petId: res.data.pet.id,
          petName: res.data.pet.name,
          petImage: res.data.pet.petImage,
          petImages: res.data.pet.petImages,
          ownerId: res.data.pet.ownerId,
        });
        setMessages([]);
        setActiveThreadId(null);
        return;
      }
      setThread(res.data?.thread || null);
      setMessages(res.data?.messages || []);
      const tid = Number(res.data?.thread?.id);
      setActiveThreadId(tid || null);
      await loadThreads({ quiet: true });
    } catch (err) {
      if (err.response?.status === 401) {
        closeChat();
        navigate("/login");
        return;
      }
      setChatError(
        err.response?.data?.message || "Could not start conversation.",
      );
      setView("list");
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!localStorage.getItem("token")) {
      closeChat();
      navigate("/login");
      return;
    }
    loadThreads();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || handledRequest.current === requestKey) return;
    handledRequest.current = requestKey;
    if (focusThreadId) {
      openThread(focusThreadId);
      return;
    }
    if (focusPetId) {
      startFromPet(focusPetId);
      return;
    }
    setView("list");
    setActiveThreadId(null);
    setThread(null);
    setMessages([]);
    setPendingPet(null);
  }, [isOpen, requestKey, focusThreadId, focusPetId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const tick = async () => {
      if (document.visibilityState === "hidden") return;
      await loadThreads({ quiet: true });
      const id = activeThreadIdRef.current;
      if (!id || pendingPet) return;
      try {
        const res = await getMessageThread(id);
        if (Number(activeThreadIdRef.current) !== Number(id)) return;
        setThread(res.data?.thread || null);
        setMessages((prev) => {
          const next = res.data?.messages || [];
          // Keep UI snappy: only replace when count/ids change.
          if (
            prev.length === next.length &&
            prev[prev.length - 1]?.id === next[next.length - 1]?.id
          ) {
            return prev;
          }
          return next;
        });
      } catch {
        /* ignore */
      }
    };
    tick();
    const interval = setInterval(tick, 2500);
    return () => clearInterval(interval);
  }, [isOpen, pendingPet]);

  useEffect(() => {
    if (view === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeThreadId, pendingPet, view]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setChatError("");
    try {
      if (pendingPet) {
        const res = await startMessageThread({
          petId: Number(pendingPet.id),
          body,
        });
        setPendingPet(null);
        setThread(res.data?.thread || null);
        setMessages(res.data?.messages || []);
        const tid = Number(res.data?.thread?.id);
        setActiveThreadId(tid || null);
        setDraft("");
        await loadThreads({ quiet: true });
        return;
      }
      if (!activeThreadId) return;
      const res = await sendMessage(activeThreadId, body);
      setMessages((prev) => [...prev, res.data?.message].filter(Boolean));
      setDraft("");
      await loadThreads({ quiet: true });
    } catch (err) {
      setChatError(err.response?.data?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const otherUserId = useMemo(() => {
    if (!thread || currentUserId == null) return null;
    if (Number(thread.ownerId) === Number(currentUserId)) {
      return thread.participantId != null ? Number(thread.participantId) : null;
    }
    if (Number(thread.participantId) === Number(currentUserId)) {
      return thread.ownerId != null ? Number(thread.ownerId) : null;
    }
    return null;
  }, [thread, currentUserId]);

  const otherLabel = useMemo(() => {
    if (pendingPet) return "Listing owner";
    if (!thread || currentUserId == null) return "Conversation";
    const iAmOwner = Number(thread.ownerId) === Number(currentUserId);
    if (iAmOwner) {
      return displayPerson({
        firstName: thread.participantFirstName,
        lastName: thread.participantLastName,
        username: thread.participantUsername,
      });
    }
    return displayPerson({
      firstName: thread.ownerFirstName,
      lastName: thread.ownerLastName,
      username: thread.ownerUsername,
    });
  }, [thread, currentUserId, pendingPet]);

  const openReportUser = () => {
    if (!otherUserId || !activeThreadId) return;
    setReportReason(MESSAGE_USER_REASONS[0]);
    setReportDetails("");
    setReportError("");
    setReportSuccess("");
    setReportOpen(true);
  };

  const closeReportUser = () => {
    if (reporting) return;
    setReportOpen(false);
    setReportError("");
  };

  const handleSubmitUserReport = async () => {
    if (!otherUserId || !activeThreadId) return;
    setReporting(true);
    setReportError("");
    setReportSuccess("");
    try {
      const res = await createMessageUserReport({
        userId: otherUserId,
        threadId: activeThreadId,
        reason: reportReason,
        description: reportDetails.trim(),
      });
      setReportSuccess(
        res.data?.message ||
          "User report submitted. An admin will review their messaging.",
      );
      setTimeout(() => {
        setReportOpen(false);
        setReportSuccess("");
        setReportDetails("");
      }, 1400);
    } catch (err) {
      setReportError(
        err.response?.data?.message || "Could not submit report.",
      );
    } finally {
      setReporting(false);
    }
  };

  const openBlockUser = () => {
    if (!otherUserId) return;
    setBlockReason(MESSAGE_USER_REASONS[0]);
    setBlockDetails("");
    setAttachReport(true);
    setBlockError("");
    setBlockSuccess("");
    setBlockOpen(true);
  };

  const closeBlockUser = () => {
    if (blocking) return;
    setBlockOpen(false);
    setBlockError("");
  };

  const handleSubmitBlock = async () => {
    if (!otherUserId) return;
    setBlocking(true);
    setBlockError("");
    setBlockSuccess("");
    try {
      const res = await blockUser({
        userId: otherUserId,
        reason: blockReason,
        description: blockDetails.trim(),
        attachReport,
        threadId: activeThreadId || undefined,
      });
      setBlockSuccess(
        res.data?.message || "User blocked.",
      );
      setTimeout(async () => {
        setBlockOpen(false);
        setView("list");
        setActiveThreadId(null);
        setThread(null);
        setMessages([]);
        await loadThreads({ quiet: true });
      }, 1200);
    } catch (err) {
      setBlockError(err.response?.data?.message || "Could not block user.");
    } finally {
      setBlocking(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeThreadId || deletingChat) return;
    const ok = window.confirm(
      "Delete this conversation for everyone? Messages cannot be recovered. Conversations under admin review cannot be deleted.",
    );
    if (!ok) return;
    setDeletingChat(true);
    setChatError("");
    try {
      await deleteMessageThread(activeThreadId);
      setView("list");
      setActiveThreadId(null);
      setThread(null);
      setMessages([]);
      setPendingPet(null);
      await loadThreads({ quiet: true });
    } catch (err) {
      setChatError(
        err.response?.data?.message || "Could not delete conversation.",
      );
    } finally {
      setDeletingChat(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.widgetRoot} role="dialog" aria-label="Messages">
      <div className={styles.widgetPanel}>
        <header className={styles.widgetHeader}>
          {view === "chat" ? (
            <button
              type="button"
              className={styles.widgetIconBtn}
              onClick={() => {
                setView("list");
                setPendingPet(null);
                setActiveThreadId(null);
                setChatError("");
                setReportOpen(false);
                setBlockOpen(false);
                loadThreads({ quiet: true });
              }}
              aria-label="Back to inbox"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className={styles.widgetHeaderIcon}>
              <MessageCircle size={16} />
            </span>
          )}
          <div className={styles.widgetHeaderCopy}>
            <strong>{view === "chat" ? otherLabel : "Messages"}</strong>
            <span>
              {view === "chat"
                ? thread?.petName || pendingPet?.name || "Pet listing"
                : "About a pet listing"}
            </span>
          </div>
          {view === "chat" && otherUserId && activeThreadId ? (
            <>
              <button
                type="button"
                className={styles.widgetIconBtn}
                title="Report user"
                aria-label="Report user for bad messaging"
                onClick={openReportUser}
              >
                <Flag size={15} />
              </button>
              <button
                type="button"
                className={styles.widgetIconBtn}
                title="Block user"
                aria-label="Block user"
                onClick={openBlockUser}
              >
                <Ban size={15} />
              </button>
              <button
                type="button"
                className={styles.widgetIconBtn}
                title="Delete conversation"
                aria-label="Delete conversation"
                disabled={deletingChat}
                onClick={handleDeleteChat}
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : null}
          <button
            type="button"
            className={styles.widgetIconBtn}
            onClick={closeChat}
            aria-label="Close messages"
          >
            <X size={18} />
          </button>
        </header>

        {view === "list" ? (
          <div className={styles.widgetBody}>
            {error ? <p className={styles.errorText}>{error}</p> : null}
            {loadingList ? (
              <p className={styles.emptyList}>Loading...</p>
            ) : !threads.length ? (
              <div className={styles.emptyChat}>
                <MessageCircle size={22} />
                <p>
                  No chats yet. Open a listing and tap{" "}
                  <strong>Message owner</strong>.
                </p>
              </div>
            ) : (
              <ul className={styles.threads}>
                {threads.map((item) => {
                  const iAmOwner =
                    Number(item.ownerId) === Number(currentUserId);
                  const other = iAmOwner
                    ? displayPerson({
                        firstName: item.participantFirstName,
                        lastName: item.participantLastName,
                        username: item.participantUsername,
                      })
                    : displayPerson({
                        firstName: item.ownerFirstName,
                        lastName: item.ownerLastName,
                        username: item.ownerUsername,
                      });
                  const thumb = petThumb(item);
                  const unread = Number(item.unreadCount || 0) > 0;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={styles.threadBtn}
                        onClick={() => openThread(item.id)}
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className={styles.threadThumb}
                          />
                        ) : (
                          <div className={styles.threadFallback}>
                            <PawPrint size={16} />
                          </div>
                        )}
                        <div className={styles.threadCopy}>
                          <div className={styles.threadTop}>
                            <strong>{item.petName || "Pet listing"}</strong>
                            <span>{formatTime(item.lastMessageAt)}</span>
                          </div>
                          <p className={styles.threadMeta}>with {other}</p>
                          <p className={styles.threadPreview}>
                            {item.lastMessageBody || "No messages yet"}
                          </p>
                        </div>
                        {unread ? (
                          <span className={styles.unreadDot} />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className={styles.widgetChat}>
            {loadingChat ? (
              <p className={styles.emptyChat}>Loading conversation...</p>
            ) : (
              <>
                <div className={styles.messageScroll}>
                  {!messages.length ? (
                    <p className={styles.emptyChat}>
                      {pendingPet
                        ? "Say hello — the chat starts when you send."
                        : "Ask about the pet or share adoption details."}
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const mine =
                        Number(msg.senderId) === Number(currentUserId);
                      return (
                        <div
                          key={msg.id}
                          className={`${styles.bubbleRow} ${mine ? styles.bubbleRowMine : ""}`}
                        >
                          <div
                            className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}
                          >
                            {msg.body}
                            <span className={styles.bubbleTime}>
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {chatError ? (
                  <p className={styles.errorText}>{chatError}</p>
                ) : null}

                <form className={styles.composer} onSubmit={handleSend}>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Write a message..."
                    rows={2}
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    className={styles.sendBtn}
                    disabled={sending || !draft.trim()}
                  >
                    {sending ? "..." : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {reportOpen
        ? createPortal(
            <div
              className={styles.reportOverlay}
              onClick={closeReportUser}
              role="presentation"
            >
              <div
                className={styles.reportModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="message-user-report-title"
                onClick={(e) => e.stopPropagation()}
              >
                <p className={styles.reportEyebrow}>Safety</p>
                <h2
                  id="message-user-report-title"
                  className={styles.reportTitle}
                >
                  Report {otherLabel}
                </h2>
                <p className={styles.reportBody}>
                  Report bad messaging about{" "}
                  <strong>{thread?.petName || "this listing"}</strong>. An
                  admin will review it.
                </p>

                <label className={styles.reportField}>
                  <span>Reason</span>
                  <select
                    value={reportReason}
                    onChange={(e) => {
                      setReportReason(e.target.value);
                      setReportError("");
                    }}
                    disabled={reporting}
                  >
                    {MESSAGE_USER_REASONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.reportField}>
                  <span>Details (optional)</span>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    placeholder="What happened in the chat?"
                    value={reportDetails}
                    onChange={(e) => {
                      setReportDetails(e.target.value);
                      setReportError("");
                    }}
                    disabled={reporting}
                  />
                </label>

                {reportError ? (
                  <p className={styles.reportError}>{reportError}</p>
                ) : null}
                {reportSuccess ? (
                  <p className={styles.reportSuccess}>{reportSuccess}</p>
                ) : null}

                <div className={styles.reportActions}>
                  <button
                    type="button"
                    className={styles.reportCancelBtn}
                    disabled={reporting}
                    onClick={closeReportUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.reportSubmitBtn}
                    disabled={reporting}
                    onClick={handleSubmitUserReport}
                  >
                    {reporting ? "Sending..." : "Submit report"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {blockOpen
        ? createPortal(
            <div
              className={styles.reportOverlay}
              onClick={closeBlockUser}
              role="presentation"
            >
              <div
                className={styles.reportModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="message-user-block-title"
                onClick={(e) => e.stopPropagation()}
              >
                <p className={styles.reportEyebrow}>Safety</p>
                <h2
                  id="message-user-block-title"
                  className={styles.reportTitle}
                >
                  Block {otherLabel}
                </h2>
                <p className={styles.reportBody}>
                  They will not be able to message you about listings. You can
                  unblock them later in Settings.
                </p>

                <label className={styles.reportField}>
                  <span>Reason</span>
                  <select
                    value={blockReason}
                    onChange={(e) => {
                      setBlockReason(e.target.value);
                      setBlockError("");
                    }}
                    disabled={blocking}
                  >
                    {MESSAGE_USER_REASONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.reportField}>
                  <span>Details (optional)</span>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    placeholder="Why are you blocking this person?"
                    value={blockDetails}
                    onChange={(e) => {
                      setBlockDetails(e.target.value);
                      setBlockError("");
                    }}
                    disabled={blocking}
                  />
                </label>

                <label className={styles.blockAttachRow}>
                  <input
                    type="checkbox"
                    checked={attachReport}
                    onChange={(e) => setAttachReport(e.target.checked)}
                    disabled={blocking}
                  />
                  <span>
                    Also send a report to admins (attaches this chat)
                  </span>
                </label>

                {blockError ? (
                  <p className={styles.reportError}>{blockError}</p>
                ) : null}
                {blockSuccess ? (
                  <p className={styles.reportSuccess}>{blockSuccess}</p>
                ) : null}

                <div className={styles.reportActions}>
                  <button
                    type="button"
                    className={styles.reportCancelBtn}
                    disabled={blocking}
                    onClick={closeBlockUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.reportSubmitBtn}
                    disabled={blocking}
                    onClick={handleSubmitBlock}
                  >
                    {blocking ? "Blocking..." : "Block user"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>,
    document.body,
  );
}

export default ChatWindow;
