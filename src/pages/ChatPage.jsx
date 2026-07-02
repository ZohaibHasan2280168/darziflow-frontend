import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../components/context/AuthContext";
import { useTheme } from "../components/context/ThemeContext";
import api from "../services/reqInterceptor";
import { uploadChatMediaToCloudinary } from "../utils/uploadToCloudinary";
import { io } from "socket.io-client";
import {
  FiSearch,
  FiMoreVertical,
  FiPaperclip,
  FiMic,
  FiSend,
  FiSmile,
  FiPhone,
  FiVideo,
  FiMessageSquare,
  FiX,
  FiCheck,
  FiFile,
  FiArrowUp,
  FiTrash2,
  FiDownload,
  FiCheckCircle,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import "./ChatPage.css";

/* ─── constants ───────────────────────────────────────────── */
let _apiBaseUrl = process.env.REACT_APP_AZURE_BASE_URL || process.env.REACT_APP_API_BASE_URL;
if (!_apiBaseUrl || _apiBaseUrl === "undefined") {
  _apiBaseUrl = "https://darziflowbackend-buagfcfpfveadmgm.centralindia-01.azurewebsites.net/api";
}
const BASE_URL = _apiBaseUrl.replace("/api", "").replace(/\/$/, "");
const MSG_LIMIT = 30;

const VOICE_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

const VOICE_BLOB_TYPE = "audio/webm;codecs=opus";

const resolveRecorderMimeType = () => {
  if (typeof MediaRecorder === "undefined") return VOICE_BLOB_TYPE;
  if (MediaRecorder.isTypeSupported(VOICE_BLOB_TYPE)) return VOICE_BLOB_TYPE;
  for (const candidate of VOICE_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return VOICE_BLOB_TYPE;
};

/* ─── helpers ─────────────────────────────────────────────── */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diff = (now - d) / 86400000;
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
};

const formatMsgTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatLastSeen = (room) => {
  const iso = room?.updatedAt || room?.lastMessage?.createdAt;
  if (!iso) return "Last seen recently";

  const d = new Date(iso);
  const now = new Date();
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (d.toDateString() === now.toDateString()) {
    return `Last seen today at ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Last seen yesterday at ${timeStr}`;
  }

  const dateStr = d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
  return `Last seen ${dateStr} at ${timeStr}`;
};

const getRoomDisplayName = (room, uid) => {
  if (room.type === "group") return room.name || "Group Chat";
  return room.participants?.find((p) => p._id !== uid)?.name || "Unknown";
};

const getRoomOtherUser = (room, uid) =>
  room.participants?.find((p) => p._id !== uid) || null;

const getRoomAvatar = (room, uid) =>
  getRoomOtherUser(room, uid)?.avatar?.url || null;

const getMediaUrl = (raw) => {
  if (!raw) return "";

  let url = raw;
  if (typeof raw === "object" && raw !== null) {
    url = raw.secure_url || raw.url || raw.href || "";
  }

  url = String(url).trim();
  if (!url) return "";

  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

const inferMediaType = (mediaItem) => {
  const url = getMediaUrl(mediaItem?.url).toLowerCase();
  // Cloudinary audio files (uploaded from mobile as resource_type:video) contain /video/upload/
  // but are NOT actual video — they are audio/voice notes
  if (/\/video\/upload\//i.test(url)) return "audio";
  // Extension-based detection (web uploads)
  if (/\.(webm|mp3|wav|ogg|m4a|aac|amr|opus)(\?|$)/i.test(url)) return "audio";
  if (mediaItem?.type === "audio") return "audio";
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return "image";
  if (mediaItem?.type === "image") return "image";
  return "document";
};

const CustomAudioPlayer = ({ src, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const sliderRef = useRef(null);

  const updateSliderPct = (current, total) => {
    if (sliderRef.current && total > 0) {
      const pct = (current / total) * 100;
      sliderRef.current.style.setProperty("--pct", `${pct}%`);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    setProgress(current);
    updateSliderPct(current, audioRef.current.duration);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const value = Number(e.target.value);
    audioRef.current.currentTime = value;
    setProgress(value);
    updateSliderPct(value, duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    updateSliderPct(0, duration);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`custom-audio-player ${isOwn ? "own" : "other"}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button className="cap-play-btn" onClick={togglePlay} type="button">
        {isPlaying ? <FiPause size={20} style={{ marginLeft: 0 }} /> : <FiPlay size={20} style={{ marginLeft: '3px' }} />}
      </button>
      <div className="cap-track-wrap">
        <input
          ref={sliderRef}
          type="range"
          className="cap-slider"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          style={{ "--pct": duration > 0 ? `${(progress / duration) * 100}%` : "0%" }}
        />
        <span className="cap-time">{formatTime(progress)}</span>
      </div>
    </div>
  );
};

/* ─── sub-components ──────────────────────────────────────── */
const Avatar = ({ name, url, size = 40, online = false }) => (
  <div className="chat-avatar-wrap" style={{ width: size, height: size }}>
    {url ? (
      <img src={url} alt={name} className="chat-avatar-img" />
    ) : (
      <div className="chat-avatar-initials">{getInitials(name)}</div>
    )}
    {online && <span className="chat-avatar-online" />}
  </div>
);

const EmptyState = () => (
  <div className="chat-empty-state">
    <div className="chat-empty-icon">
      <FiMessageSquare size={64} />
    </div>
    <h2>DarziFlow Messenger</h2>
    <p>Select a conversation from the list or search for a user to start a new chat.</p>
    <div className="chat-empty-badge">End-to-end secure messaging</div>
  </div>
);

const MessageTicks = ({ isDelivered, isRead }) => {
  if (isRead) {
    return (
      <span className="chat-bubble-double-tick read">
        <FiCheck size={12} className="chat-tick-first" />
        <FiCheck size={12} />
      </span>
    );
  }
  if (isDelivered) {
    return (
      <span className="chat-bubble-double-tick">
        <FiCheck size={12} className="chat-tick-first" />
        <FiCheck size={12} />
      </span>
    );
  }
  return (
    <span className="chat-bubble-single-tick">
      <FiCheck size={12} />
    </span>
  );
};

/* ════════════════════════════════════════════════════════════
   Main ChatPage
   ════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const { user: authUser } = useAuth();
  const { theme } = useTheme();

  /* ── refs ──────────────────────────────────────────────── */
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const viewportRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const selectedRoomRef = useRef(null);
  const sendMessageRef = useRef(null);

  /* ── core state ────────────────────────────────────────── */
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sending, setSending] = useState(false);

  /* ── Phase 3: file attachment state ────────────────────── */
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Phase 3: voice recorder state ─────────────────────── */
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recorderMimeTypeRef = useRef(VOICE_BLOB_TYPE);
  const recTimerRef = useRef(null);
  const stopRecordingRef = useRef(() => { });

  /* ── pagination state ──────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);

  /* ── typing state (per-room scoped) ────────────────────── */
  const [typingState, setTypingState] = useState(null);

  /* ── online presence state ─────────────────────────────── */
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  /* ── image lightbox preview ────────────────────────────── */
  const [previewMedia, setPreviewMedia] = useState(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    const onConnect = () => console.log("✅ Chat socket connected");
    const onConnectError = (err) => console.error("❌ Socket error:", err.message);

    const onReceiveMessage = (msg) => {
      const currentRoomId = selectedRoomRef.current?._id;
      const msgRoomId = msg.chatRoomId?._id || msg.chatRoomId || msg.chatRoom?._id || msg.chatRoom;

      if (msgRoomId && msgRoomId === currentRoomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      setRooms((prev) =>
        prev.map((r) =>
          r._id === msgRoomId
            ? {
              ...r,
              lastMessage: {
                text: msg.text,
                sender: msg.sender,
                createdAt: msg.createdAt,
              },
            }
            : r
        )
      );
    };

    const onUserTyping = (payload) => {
      if (!payload) return;
      const { userName, chatRoomId } = payload;
      const activeRoomId = selectedRoomRef.current?._id;
      if (chatRoomId && chatRoomId !== activeRoomId) return;

      setTypingState({ roomId: chatRoomId || activeRoomId, userName });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingState(null), 2500);
    };

    const onUserOnline = ({ userId }) =>
      setOnlineUsers((prev) => new Set([...prev, userId]));
    const onUserOffline = ({ userId }) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    const onMessageError = (data) =>
      console.error("Socket msg error:", data.error);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("receive_message", onReceiveMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);
    socket.on("message_error", onMessageError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.off("message_error", onMessageError);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await api.get("/chat/rooms");
        setRooms(res.data.rooms || []);
      } catch (e) {
        console.error("Failed to fetch rooms:", e);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentPage]);

  const clearAttachment = useCallback(() => {
    setAttachedFile((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const sendMessage = useCallback(async (attachmentOverride = null) => {
    const pendingAttachment =
      attachmentOverride?.file instanceof Blob
        ? attachmentOverride
        : attachedFile;
    const hasText = inputText.trim();
    if (!hasText && !pendingAttachment) return;
    if (!selectedRoomRef.current || !socketRef.current) return;

    setSending(true);

    let mediaPayload = [];
    if (pendingAttachment) {
      try {
        const { url } = await uploadChatMediaToCloudinary(
          pendingAttachment.file,
          selectedRoomRef.current._id
        );
        let finalUrl = url;
        if (pendingAttachment.type === "audio" && finalUrl.endsWith(".webm")) {
          finalUrl = finalUrl.replace(/\.webm$/, ".mp3");
        }
        
        let finalType = pendingAttachment.type;
        // Map audio to document for backend compatibility since Desktop backend only allows ['image', 'video', 'document']
        if (finalType === "audio") {
          finalType = "document";
        }

        mediaPayload = [{
          url: finalUrl,
          type: finalType,
          name: pendingAttachment.name,
        }];
      } catch (err) {
        console.error("Failed to upload media:", err);
        setSending(false);
        return;
      }
    }

    socketRef.current.emit("send_message", {
      chatRoomId: selectedRoomRef.current._id,
      senderId: authUser?._id,
      text: hasText || "",
      media: mediaPayload,
    });

    setInputText("");
    if (!attachmentOverride) {
      clearAttachment();
    } else if (pendingAttachment.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setSending(false);
    inputRef.current?.focus();
  }, [inputText, attachedFile, authUser, clearAttachment]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const openRoom = useCallback(
    async (room) => {
      if (selectedRoomRef.current?._id === room._id) return;

      if (selectedRoomRef.current) {
        socketRef.current?.emit("leave_room", {
          roomId: selectedRoomRef.current._id,
        });
      }

      setSelectedRoom(room);
      setMessages([]);
      setTypingState(null);
      setCurrentPage(1);
      setHasMorePages(false);
      setIsSearching(false);
      setSearchQuery("");
      setSearchResults([]);
      clearAttachment();
      stopRecordingRef.current(true);

      socketRef.current?.emit("join_room", { roomId: room._id });

      try {
        setLoadingMessages(true);
        const res = await api.get(
          `/chat/rooms/${room._id}/messages?page=1&limit=${MSG_LIMIT}`
        );
        const fetched = res.data.messages || [];
        setMessages(fetched);
        setHasMorePages(fetched.length === MSG_LIMIT);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setLoadingMessages(false);
      }

      setTimeout(() => inputRef.current?.focus(), 120);
    },
    [clearAttachment]
  );

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMorePages || !selectedRoomRef.current) return;

    const nextPage = currentPage + 1;
    const viewport = viewportRef.current;
    const prevScrollHeight = viewport?.scrollHeight || 0;

    try {
      setLoadingOlder(true);
      const res = await api.get(
        `/chat/rooms/${selectedRoomRef.current._id}/messages?page=${nextPage}&limit=${MSG_LIMIT}`
      );
      const older = res.data.messages || [];

      setMessages((prev) => [...older, ...prev]);
      setCurrentPage(nextPage);
      setHasMorePages(older.length === MSG_LIMIT);

      requestAnimationFrame(() => {
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight - prevScrollHeight;
        }
      });
    } catch (e) {
      console.error("Failed to load older messages:", e);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMorePages, currentPage]);

  const handleViewportScroll = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    if (vp.scrollTop < 80) {
      loadOlderMessages();
    }
  }, [loadOlderMessages]);

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await api.get(
        `/chat/users/search?query=${encodeURIComponent(q)}`
      );
      setSearchResults(res.data.users || []);
    } catch (e) {
      console.error("User search failed:", e);
    }
  }, []);

  const startDirectChat = useCallback(
    async (targetUserId) => {
      try {
        const res = await api.post("/chat/rooms/direct", { targetUserId });
        const room = res.data.room;
        setRooms((prev) =>
          prev.some((r) => r._id === room._id) ? prev : [room, ...prev]
        );
        openRoom(room);
      } catch (e) {
        console.error("Failed to create/fetch direct chat:", e);
      }
    },
    [openRoom]
  );

  const emitTypingRef = useRef(null);
  const handleTyping = useCallback(
    (e) => {
      setInputText(e.target.value);
      if (!selectedRoomRef.current || !socketRef.current) return;
      clearTimeout(emitTypingRef.current);
      emitTypingRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", {
          chatRoomId: selectedRoomRef.current._id,
          userName: authUser?.name || "User",
        });
      }, 300);
    },
    [authUser]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    const type = isImage ? "image" : isAudio ? "audio" : "document";
    const previewUrl = (isImage || isAudio)
      ? URL.createObjectURL(file)
      : null;
    setAttachedFile({ file, previewUrl, type, name: file.name, size: file.size });
  }, []);

  const formatDuration = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const preferredMime = resolveRecorderMimeType();
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      recorderMimeTypeRef.current = recorder.mimeType || preferredMime || VOICE_BLOB_TYPE;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecDuration(0);

      recTimerRef.current = setInterval(() => {
        setRecDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      releaseMediaStream();
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [releaseMediaStream]);

  const stopRecording = useCallback((discard = false) => {
    clearInterval(recTimerRef.current);

    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      releaseMediaStream();
      setIsRecording(false);
      setRecDuration(0);
      audioChunksRef.current = [];
      return;
    }

    if (recorder.state === "inactive") {
      releaseMediaStream();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setRecDuration(0);
      if (!discard) {
        const mimeType = recorderMimeTypeRef.current || VOICE_BLOB_TYPE;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          const file = new File([audioBlob], `vn-${Date.now()}.webm`, { type: mimeType });
          const previewUrl = URL.createObjectURL(audioBlob);
          const voiceAttachment = {
            file,
            previewUrl,
            type: "audio",
            name: file.name,
            size: file.size,
          };
          setAttachedFile(voiceAttachment);
          Promise.resolve(sendMessageRef.current?.(voiceAttachment)).finally(() => {
            setAttachedFile(null);
            URL.revokeObjectURL(previewUrl);
          });
        }
      }
      audioChunksRef.current = [];
      return;
    }

    recorder.onstop = () => {
      releaseMediaStream();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setRecDuration(0);

      if (discard) {
        audioChunksRef.current = [];
        return;
      }

      const mimeType = recorderMimeTypeRef.current || VOICE_BLOB_TYPE;
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size > 0) {
        const file = new File(
          [audioBlob],
          `vn-${Date.now()}.webm`,
          { type: mimeType }
        );
        const previewUrl = URL.createObjectURL(audioBlob);
        const voiceAttachment = {
          file,
          previewUrl,
          type: "audio",
          name: file.name,
          size: file.size,
        };

        setAttachedFile(voiceAttachment);
        Promise.resolve(sendMessageRef.current?.(voiceAttachment)).finally(() => {
          setAttachedFile(null);
          URL.revokeObjectURL(previewUrl);
        });
      } else {
        console.error("Voice note rejected: empty blob", {
          chunks: audioChunksRef.current.length,
        });
      }

      audioChunksRef.current = [];
    };

    recorder.stop();
  }, [releaseMediaStream]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      clearInterval(recTimerRef.current);
      stopRecordingRef.current(true);
    };
  }, []);

  const filteredRooms = rooms.filter((r) =>
    !searchQuery ||
    getRoomDisplayName(r, authUser?._id)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const activeTypingUser =
    typingState?.roomId && typingState.roomId === selectedRoom?._id
      ? typingState.userName
      : null;

  const otherUser = selectedRoom ? getRoomOtherUser(selectedRoom, authUser?._id) : null;
  const isOtherOnline = otherUser ? onlineUsers.has(otherUser._id) : false;

  // Format role: DEPARTMENT_HEAD -> Department Head
  const formatRole = (role) => {
    if (!role) return "";
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const roleLabel = selectedRoom?.type === "group"
    ? `${selectedRoom.participants?.length || 0} members`
    : formatRole(otherUser?.role) || "";

  return (
    <div className={`chat-root ${theme}`}>

      <aside className="chat-sidebar">

        <div className="chat-sidebar-header">
          <div className="chat-sidebar-profile">
            <Avatar name={authUser?.name || "User"} url={authUser?.avatar?.url} size={42} />
            <span className="chat-sidebar-username">{authUser?.name || "User"}</span>
          </div>
          <div className="chat-sidebar-actions">
            <button
              className="chat-icon-btn"
              title="New Chat"
              onClick={() => setIsSearching((p) => !p)}
            >
              <FiMessageSquare size={18} />
            </button>
            <button className="chat-icon-btn" title="Menu">
              <FiMoreVertical size={18} />
            </button>
          </div>
        </div>

        <div className="chat-search-bar">
          <FiSearch size={15} className="chat-search-icon" />
          <input
            type="text"
            placeholder={isSearching ? "Search users to message…" : "Search or start new chat"}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="chat-search-input"
          />
          {searchQuery && (
            <button
              className="chat-search-clear"
              onClick={() => { setSearchQuery(""); setSearchResults([]); }}
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="chat-search-results">
            <p className="chat-section-label">USERS</p>
            {searchResults.map((u) => (
              <button
                key={u._id}
                className="chat-room-item"
                onClick={() => startDirectChat(u._id)}
              >
                <Avatar name={u.name} url={u.avatar?.url} size={46} />
                <div className="chat-room-info">
                  <span className="chat-room-name">{u.name}</span>
                  <span className="chat-room-preview">{u.role}</span>
                </div>
              </button>
            ))}
            <div className="chat-section-divider" />
          </div>
        )}

        <div className="chat-room-list">
          {loadingRooms ? (
            <div className="chat-loading">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="chat-skeleton-row">
                  <div className="chat-skeleton-avatar" />
                  <div className="chat-skeleton-lines">
                    <div className="chat-skeleton-line short" />
                    <div className="chat-skeleton-line long" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <p className="chat-no-rooms">
              No conversations yet.<br />Search for a user to start chatting.
            </p>
          ) : (
            filteredRooms.map((room) => {
              const name = getRoomDisplayName(room, authUser?._id);
              const avatar = getRoomAvatar(room, authUser?._id);
              const last = room.lastMessage;
              const isActive = selectedRoom?._id === room._id;
              const otherId = getRoomOtherUser(room, authUser?._id)?._id;
              const online = otherId ? onlineUsers.has(otherId) : false;

              return (
                <button
                  key={room._id}
                  className={`chat-room-item ${isActive ? "active" : ""}`}
                  onClick={() => openRoom(room)}
                >
                  <Avatar name={name} url={avatar} size={46} online={online} />
                  <div className="chat-room-info">
                    <div className="chat-room-row">
                      <span className="chat-room-name">{name}</span>
                      <span className="chat-room-time">{formatTime(last?.createdAt)}</span>
                    </div>
                    <div className="chat-room-row">
                      <span className="chat-room-preview">
                        {last ? (last.text || "📎 Attachment") : "No messages yet"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="chat-main">
        {!selectedRoom ? (
          <EmptyState />
        ) : (
          <>
            <div className="chat-topbar">
              <div className="chat-topbar-left">
                <Avatar
                  name={getRoomDisplayName(selectedRoom, authUser?._id)}
                  url={getRoomAvatar(selectedRoom, authUser?._id)}
                  size={40}
                  online={isOtherOnline}
                />
                <div className="chat-topbar-info">
                  <span className="chat-topbar-name">
                    {getRoomDisplayName(selectedRoom, authUser?._id)}
                  </span>
                  {activeTypingUser ? (
                    <span className="chat-topbar-status chat-typing-label">
                      <span className="chat-topbar-typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                      {activeTypingUser} is typing…
                    </span>
                  ) : (
                    <span className="chat-topbar-status">
                      {roleLabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="chat-topbar-actions">
                <button
                  className="chat-icon-btn"
                  title="Voice Call"
                  onClick={() => alert("Coming Soon: Voice calling features will be implemented in Cohort 2 / Next Phase.")}
                >
                  <FiPhone size={18} />
                </button>
                <button
                  className="chat-icon-btn"
                  title="Video Call"
                  onClick={() => alert("Coming Soon: Video calling features will be implemented in Cohort 2 / Next Phase.")}
                >
                  <FiVideo size={18} />
                </button>
                <button className="chat-icon-btn" title="More">
                  <FiMoreVertical size={18} />
                </button>
              </div>
            </div>

            <div
              className="chat-messages-viewport"
              ref={viewportRef}
              onScroll={handleViewportScroll}
            >
              {loadingOlder && (
                <div className="chat-load-older-spinner">
                  <span className="chat-spinner-dot" />
                  <span className="chat-spinner-dot" />
                  <span className="chat-spinner-dot" />
                </div>
              )}

              {hasMorePages && !loadingOlder && (
                <button
                  className="chat-load-older-btn"
                  onClick={loadOlderMessages}
                >
                  <FiArrowUp size={13} /> Load older messages
                </button>
              )}

              {loadingMessages ? (
                <div className="chat-messages-loading">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="chat-no-messages">
                  <div className="chat-no-messages-icon">💬</div>
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === authUser?._id || msg.sender === authUser?._id;
                  const showAvatar =
                    !isOwn &&
                    (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);

                  return (
                    <div
                      key={msg._id || idx}
                      className={`chat-msg-row ${isOwn ? "own" : "other"}`}
                    >
                      {!isOwn && (
                        <div className="chat-msg-avatar-space">
                          {showAvatar && (
                            <Avatar
                              name={msg.sender?.name}
                              url={msg.sender?.avatar?.url}
                              size={28}
                            />
                          )}
                        </div>
                      )}
                      <div className={`chat-bubble ${isOwn ? "own" : "other"}`}>
                        {!isOwn && showAvatar && (
                          <span className="chat-bubble-sender">{msg.sender?.name}</span>
                        )}
                        {msg.replyTo && (
                          <div className="chat-reply-preview">
                            <span>{msg.replyTo.text || "Attachment"}</span>
                          </div>
                        )}

                        {msg.media?.length > 0 && (
                          <div className="chat-media-grid">
                            {msg.media.map((m, mi) => {
                              const safeUrl = getMediaUrl(m.url);
                              const mediaType = inferMediaType(m);
                              if (!safeUrl) return null;
                              if (mediaType === "image") {
                                return (
                                  <img
                                    key={mi}
                                    src={safeUrl}
                                    alt="attachment"
                                    className="chat-media-img"
                                    onClick={() =>
                                      setPreviewMedia({ url: safeUrl, type: "image" })
                                    }
                                  />
                                );
                              }
                              if (mediaType === "audio") {
                                return (
                                  <CustomAudioPlayer
                                    key={mi}
                                    src={safeUrl}
                                    isOwn={isOwn}
                                  />
                                );
                              }
                              return (
                                <a
                                  key={mi}
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="chat-file-chip"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FiDownload size={14} />
                                  <span className="chat-file-name">
                                    {m.name || "Document"}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {msg.text && <p className="chat-bubble-text">{msg.text}</p>}
                        <span className="chat-bubble-time">
                          {formatMsgTime(msg.createdAt)}
                          {isOwn && (
                            <MessageTicks
                              isDelivered={
                                otherUser ? onlineUsers.has(otherUser._id) : false
                              }
                              isRead={Boolean(msg.read)}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {attachedFile && !isRecording && (
              <div className="chat-attach-preview">
                {attachedFile.type === "image" && attachedFile.previewUrl && (
                  <img
                    src={attachedFile.previewUrl}
                    alt="preview"
                    className="chat-attach-thumb"
                  />
                )}
                {attachedFile.type === "audio" && attachedFile.previewUrl && (
                  <div className="chat-attach-audio">
                    <FiMic size={16} />
                    <audio controls src={attachedFile.previewUrl} className="chat-attach-audio-el" />
                  </div>
                )}
                <div className="chat-attach-meta">
                  <span className="chat-attach-name">{attachedFile.name}</span>
                  <span className="chat-attach-size">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button className="chat-attach-clear" onClick={clearAttachment} title="Remove">
                  <FiX size={16} />
                </button>
              </div>
            )}

            {isRecording && (
              <div className="chat-recorder-bar">
                <span className="chat-rec-dot" />
                <span className="chat-rec-timer">{formatDuration(recDuration)}</span>
                <span className="chat-rec-label">Recording…</span>
                <div className="chat-rec-actions">
                  <button
                    className="chat-rec-discard"
                    title="Discard recording"
                    onClick={() => stopRecording(true)}
                  >
                    <FiTrash2 size={18} />
                  </button>
                  <button
                    className="chat-rec-send"
                    title="Send voice note"
                    onClick={() => stopRecording(false)}
                    disabled={sending}
                  >
                    <FiCheckCircle size={20} />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {!isRecording && (
              <div className="chat-input-bar">
                <button className="chat-icon-btn" title="Emoji"><FiSmile size={20} /></button>
                <button
                  className="chat-icon-btn"
                  title="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip size={20} />
                </button>
                <div className="chat-input-wrap">
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Type a message…"
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                </div>
                {(inputText.trim() || attachedFile) ? (
                  <button
                    className="chat-send-btn"
                    onClick={() => sendMessage()}
                    disabled={sending}
                    title="Send"
                  >
                    <FiSend size={18} />
                  </button>
                ) : (
                  <button
                    className="chat-icon-btn"
                    title="Record voice note"
                    onClick={startRecording}
                    disabled={sending}
                  >
                    <FiMic size={20} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {previewMedia && (
        <div
          className="chat-lightbox-overlay"
          onClick={() => setPreviewMedia(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            className="chat-lightbox-close"
            onClick={() => setPreviewMedia(null)}
            aria-label="Close preview"
          >
            <FiX size={24} />
          </button>
          <img
            src={previewMedia.url}
            alt="Attachment preview"
            className="chat-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
