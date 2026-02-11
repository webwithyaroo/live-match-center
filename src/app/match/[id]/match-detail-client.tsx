"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { MatchDetail, MatchEvent, MatchStatus } from "@/types/match";
import MatchGraphs from "@/components/match-graphs";
import Header from "@/components/layout/header";
import Container from "@/components/layout/container";
import TeamBadge from "@/components/ui/team-badge";
import LiveIndicator from "@/components/ui/live-indicator";

type Props = {
  initialMatch: MatchDetail;
};

type ChatMessage = {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  matchId?: string | number;
  pending?: boolean;
  tempId?: string;
};

type ChatNotification = {
  type: 'join' | 'leave';
  username: string;
  timestamp: string;
};

type TabType = "overview" | "statistics" | "chat";

export default function MatchDetailClient({ initialMatch }: Props) {
  const [match, setMatch] = useState<MatchDetail>(initialMatch);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Chat state
  const [username, setUsername] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("mm_username") || "" : ""
  );
  const [userId] = useState<string>(() => Math.random().toString(36).slice(2, 9));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeout = useRef<number | null>(null);
  const hasJoinedChatRef = useRef(false);
  const usernameRef = useRef(username);

  // auto-scroll refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (username) localStorage.setItem("mm_username", username);
    usernameRef.current = username; // Keep ref in sync
  }, [username]);

  // Join/leave chat room when username changes or chat tab is active
  useEffect(() => {
    if (!username || !connected) return;
    
    const socket = getSocket();
    
    // Join chat room
    if (!hasJoinedChatRef.current && activeTab === "chat") {
      socket.emit("join_chat", { matchId: match.id, userId, username });
      hasJoinedChatRef.current = true;
    }
    
    return () => {
      // Leave chat when component unmounts or username is cleared (use ref for latest value)
      if (hasJoinedChatRef.current && usernameRef.current) {
        socket.emit("leave_chat", { matchId: match.id, userId, username: usernameRef.current });
        hasJoinedChatRef.current = false;
      }
    };
  }, [username, connected, activeTab, match.id, userId]);

  useEffect(() => {
    const socket = getSocket();

    const subscribe = () => {
      socket.emit("subscribe_match", { matchId: match.id });
      // Rejoin chat if user was previously in chat
      if (hasJoinedChatRef.current && usernameRef.current) {
        socket.emit("join_chat", { matchId: match.id, userId, username: usernameRef.current });
      }
    };

    socket.on("connect", () => {
      setConnected(true);
      subscribe();
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Initialize match from server payload
    socket.on("subscribed", ({ currentState }: { currentState: MatchDetail }) => {
      setMatch(currentState);
    });

    // Score updates
    socket.on("score_update", (payload: { homeScore: number; awayScore: number }) => {
      setMatch(prev => ({ ...prev, homeScore: payload.homeScore, awayScore: payload.awayScore }));
    });

    // New match event
    socket.on("match_event", (event: MatchEvent) => {
      setMatch(prev => ({ ...prev, events: [...(prev.events || []), event] }));
    });

    // Stats update
    socket.on("stats_update", (payload: { statistics: MatchDetail["statistics"] }) => {
      setMatch(prev => ({ ...prev, statistics: payload.statistics }));
    });

    // Status change
    socket.on("status_change", (payload: { status: MatchStatus; minute: number }) => {
      setMatch(prev => ({ ...prev, status: payload.status, minute: payload.minute }));
    });

    // Chat incoming
    socket.on("chat_message", (msg: ChatMessage) => {
      // dedupe by tempId or exact signature
      setMessages(prev => {
        // if server returned a tempId we can replace pending
        const msgTempId = (msg as { tempId?: string }).tempId;
        if (msgTempId) {
          const idx = prev.findIndex(m => m.tempId === msgTempId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...msg, pending: false };
            return next.slice(-200);
          }
        }

        // try to find a pending optimistic message to replace
        const pendingIdx = prev.findIndex(m => m.pending && m.userId === msg.userId && m.message === msg.message);
        if (pendingIdx !== -1) {
          const next = [...prev];
          next[pendingIdx] = { ...msg, pending: false };
          return next.slice(-200);
        }

        // avoid duplicates by same timestamp+userId+message
        const exists = prev.some(m => m.timestamp === msg.timestamp && m.userId === msg.userId && m.message === msg.message);
        if (exists) return prev;

        return [...prev, msg].slice(-200);
      });

      // scroll if appropriate
      if (shouldAutoScrollRef.current && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });

    socket.on("typing_start", (payload: { matchId?: string | number; userId: string; username?: string }) => {
      if (payload.matchId && payload.matchId !== match.id) return;
      if (payload.userId === userId) return;
      setTypingUser(payload.username ?? "Someone");
    });

    socket.on("typing_stop", (payload: { matchId?: string | number; userId: string }) => {
      if (payload.matchId && payload.matchId !== match.id) return;
      if (payload.userId === userId) return;
      setTypingUser(null);
    });

    // User joined/left chat
    socket.on("user_joined", (payload: { matchId?: string | number; username: string }) => {
      if (payload.matchId && payload.matchId !== match.id) return;
      // Don't show notification for current user (use ref for latest value)
      if (payload.username === usernameRef.current) return;
      const notification: ChatNotification = { type: 'join', username: payload.username, timestamp: new Date().toISOString() };
      setNotifications(prev => [...prev, notification].slice(-50));
    });

    socket.on("user_left", (payload: { matchId?: string | number; username: string }) => {
      if (payload.matchId && payload.matchId !== match.id) return;
      // Don't show notification for current user (use ref for latest value)
      if (payload.username === usernameRef.current) return;
      const notification: ChatNotification = { type: 'leave', username: payload.username, timestamp: new Date().toISOString() };
      setNotifications(prev => [...prev, notification].slice(-50));
    });

    // Chat history (received when joining/rejoining chat)
    socket.on("chat_history", (payload: { matchId?: string | number; messages: ChatMessage[] }) => {
      if (payload.matchId && payload.matchId !== match.id) return;
      setMessages(payload.messages || []);
      // Auto-scroll to bottom after loading history (wait for React to render messages)
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => {
      socket.emit("unsubscribe_match", { matchId: match.id });
      
      // Leave chat if joined (use ref to get latest username)
      if (hasJoinedChatRef.current && usernameRef.current) {
        socket.emit("leave_chat", { matchId: match.id, userId, username: usernameRef.current });
      }
      
      socket.off("connect");
      socket.off("disconnect");
      socket.off("subscribed");
      socket.off("score_update");
      socket.off("match_event");
      socket.off("stats_update");
      socket.off("status_change");
      socket.off("chat_message");
      socket.off("typing_start");
      socket.off("typing_stop");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("chat_history");
    };
  }, [match.id, userId]);

  // Chat helpers
  const sendMessage = useCallback(() => {
    if (!message.trim()) return;
    if (!username.trim()) return; // require username
    const socket = getSocket();
    const payload = { matchId: match.id, userId, username, message: message.slice(0, 500) };

    // optimistic append with tempId
    const tempId = "t_" + Date.now().toString(36);
    setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString(), pending: true, tempId }].slice(-200));

    // emit with optional ack - if server supports ack, it can confirm/return final message
    socket.emit("send_message", { ...payload, tempId }, (ack?: { message?: ChatMessage }) => {
      if (ack?.message) {
        // server returned canonical message
        setMessages(prev => {
          const idx = prev.findIndex(m => m.tempId === tempId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...ack.message!, pending: false };
            return next.slice(-200);
          }
          // otherwise append if not exists
          const ackMsg = ack.message!;
          const exists = prev.some(m => m.timestamp === ackMsg.timestamp && m.userId === ackMsg.userId && m.message === ackMsg.message);
          if (exists) return prev;
          return [...prev, ackMsg].slice(-200);
        });
      }
    });

    setMessage("");
    // stop typing immediately
    const socket2 = getSocket();
    socket2.emit("typing_stop", { matchId: match.id, userId });
  }, [message, username, match.id, userId]);

  const handleTypingChange = (v: string) => {
    setMessage(v);
    const socket = getSocket();
    
    // Handle empty input - stop typing
    if (!v.trim()) {
      if (typingTimeout.current) {
        window.clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
        socket.emit("typing_stop", { matchId: match.id, userId });
      }
      return;
    }
    
    // Only emit typing_start if not already typing
    if (typingTimeout.current === null) {
      socket.emit("typing_start", { matchId: match.id, userId, username });
    }
    
    // Clear existing timeout
    if (typingTimeout.current) {
      window.clearTimeout(typingTimeout.current);
    }
    
    // Set new timeout to stop typing
    typingTimeout.current = window.setTimeout(() => {
      socket.emit("typing_stop", { matchId: match.id, userId });
      typingTimeout.current = null;
    }, 1500);
  };

  // create a flat sorted events array for the timeline feed (descending order - newest first)
  const sortedEvents = (match.events || []).slice().sort((a, b) => {
    const ma = typeof a.minute === 'number' ? a.minute : 0;
    const mb = typeof b.minute === 'number' ? b.minute : 0;
    if (ma !== mb) return mb - ma; // Descending order (newest events first)
    return (b.id ?? '').toString().localeCompare((a.id ?? '').toString());
  });

  const getDotStyle = (type?: string) => {
    if (!type) return 'bg-[#2C2C2E]';
    if (type.includes('GOAL')) return 'bg-[#FF5500]';
    if (type.includes('YELLOW')) return 'bg-[#EAB308]';
    if (type.includes('RED')) return 'bg-[#DC2626]';
    if (type.includes('VAR')) return 'bg-[#3B82F6]';
    if (type.includes('SUBSTITUTION')) return 'bg-[#8B5CF6]';
    return 'bg-[#2C2C2E]';
  };

  // chat scroll handler
  const onChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    shouldAutoScrollRef.current = nearBottom;
    setShowScrollButton(!nearBottom);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Enter to send, Shift+Enter newline
  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!connected) return; // don't send while disconnected
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E10]">
      <Header showBack connected={connected} />
      
      {/* Premium Match Header with Gradient */}
      <div className="bg-gradient-to-b from-[#1A1A1C] to-[#0E0E10] text-white border-b border-[#2C2C2E]">
        <Container maxWidth="xl">
          <div className="py-8">
            {/* Teams and Score */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 mb-6">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1 max-w-[180px]">
                <TeamBadge team={match.homeTeam} size="xl" />
                <h2 className="text-lg sm:text-xl font-bold mt-3 text-center">
                  {match.homeTeam.shortName}
                </h2>
              </div>
              
              {/* Score */}
              <div className="flex flex-col items-center px-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="text-5xl sm:text-6xl font-bold leading-none">{match.homeScore}</span>
                  <span className="text-3xl sm:text-4xl text-[#666666] font-bold">:</span>
                  <span className="text-5xl sm:text-6xl font-bold leading-none">{match.awayScore}</span>
                </div>
              </div>
              
              {/* Away Team */}
              <div className="flex flex-col items-center flex-1 max-w-[180px]">
                <TeamBadge team={match.awayTeam} size="xl" />
                <h2 className="text-lg sm:text-xl font-bold mt-3 text-center">
                  {match.awayTeam.shortName}
                </h2>
              </div>
            </div>
            
            {/* Match Status */}
            <div className="flex items-center justify-center gap-3 text-sm sm:text-base">
              <LiveIndicator status={match.status} size="md" />
              {match.minute > 0 && (
                <>
                  <span className="text-[#666666]">•</span>
                  <span className="font-medium text-[#FF5500]">{match.minute}&apos;</span>
                </>
              )}
              <span className="text-[#666666]">•</span>
              <span className="text-[#9E9E9E]">Premier League</span>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Premium Tabs with Orange Bottom Border */}
      <div className="bg-[#1A1A1C] border-b border-[#2C2C2E] sticky top-[60px] z-40 backdrop-blur-md">
        <Container maxWidth="xl">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-b-[3px] border-[#FF5500] text-white"
                  : "border-b-[3px] border-transparent text-[#666666] hover:text-[#9E9E9E]"
              }`}
              aria-current={activeTab === "overview" ? "page" : undefined}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "statistics"
                  ? "border-b-[3px] border-[#FF5500] text-white"
                  : "border-b-[3px] border-transparent text-[#666666] hover:text-[#9E9E9E]"
              }`}
              aria-current={activeTab === "statistics" ? "page" : undefined}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "chat"
                  ? "border-b-[3px] border-[#FF5500] text-white"
                  : "border-b-[3px] border-transparent text-[#666666] hover:text-[#9E9E9E]"
              }`}
              aria-current={activeTab === "chat" ? "page" : undefined}
            >
              Chat
            </button>
          </div>
        </Container>
      </div>
      
      {/* Content */}
      <Container maxWidth="xl" className="py-8">
        {/* Overview Tab - Enhanced Timeline */}
        {activeTab === "overview" && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Match Timeline</h3>
              <div className="text-xs text-[#9E9E9E] bg-[#1A1A1C] border border-[#2C2C2E] px-4 py-2 rounded-full">
                Latest Events
              </div>
            </div>
            
            <div 
              className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scroll-smooth"
              role="feed"
              aria-label="Match Events Timeline"
              style={{ scrollbarWidth: 'thin' }}
            >
              {sortedEvents.length === 0 && (
                <div className="bg-[#1A1A1C] rounded-lg border border-[#2C2C2E] p-12 text-center">
                  <p className="text-[#9E9E9E]">No events yet</p>
                </div>
              )}

              {sortedEvents.map((ev, idx) => {
                const dotClass = getDotStyle(ev.type);
                const isGoal = ev.type && ev.type.includes('GOAL');
                
                return (
                  <article 
                    key={ev.id ?? idx} 
                    className={`glass-card rounded-lg p-5 transition-all ${
                      isGoal ? 'border-[#FF5500] orange-glow' : ''
                    }`}
                    role="article"
                    aria-label={`${ev.type?.replace('_', ' ')} at minute ${ev.minute}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${dotClass.replace('bg-', 'bg-')} border border-[#2C2C2E]`}>
                        <span className="text-white font-bold text-sm">{ev.minute}&apos;</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[#9E9E9E] uppercase tracking-wider">
                            {(ev.type || '').replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-lg font-bold text-white">{ev.player ?? ev.description ?? '—'}</p>
                        
                        {ev.assistPlayer && (
                          <p className="text-sm text-[#9E9E9E] mt-2">
                            Assist: {ev.assistPlayer}
                          </p>
                        )}
                        
                        {ev.type && ev.type.includes('SUBSTITUTION') && (
                          <div className="mt-3 flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-[#10B981] font-medium">IN:</span>
                              <span className="text-white">{ev.player ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[#DC2626] font-medium">OUT:</span>
                              <span className="text-[#9E9E9E]">{ev.assistPlayer ?? '—'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="max-w-3xl mx-auto">
            <MatchGraphs 
              statistics={match.statistics}
              homeTeamShort={match.homeTeam.shortName}
              awayTeamShort={match.awayTeam.shortName}
            />
          </div>
        )}
        
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-white">Match Chat</h3>
                <div className="text-xs text-[#9E9E9E]">Be respectful</div>
              </div>

              <div className="mb-4">
                <label htmlFor="username-input" className="sr-only">
                  Your name
                </label>
                <input
                  id="username-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#0E0E10] placeholder-[#666666] text-white border border-[#2C2C2E] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#FF5500] focus:border-[#FF5500] focus:outline-none transition-all"
                  aria-label="Your name"
                />
              </div>

              <div className="relative">
                <div
                  ref={chatContainerRef}
                  onScroll={onChatScroll}
                  aria-live="polite"
                  className="h-96 overflow-auto border border-[#2C2C2E] rounded-lg p-4 mb-4 bg-[#0E0E10] scroll-smooth"
                >
                  {messages.map((m, i) => {
                    const isOwn = m.userId === userId;
                    return (
                      <div key={m.tempId ?? m.timestamp ?? i} className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-lg ${isOwn ? 'bg-[#FF5500] text-white border-l-[3px] border-[#FF8800]' : 'bg-[#1A1A1C] border border-[#2C2C2E] text-white'} ${m.pending ? 'opacity-70' : ''}`}>
                          <div className="text-xs font-medium mb-1 ${isOwn ? 'text-white/80' : 'text-[#9E9E9E]'}">
                            {m.username} {m.pending && <span className="text-xs italic">(sending...)</span>}
                          </div>
                          <div className="text-sm leading-relaxed">{m.message}</div>
                          <div className={`text-[11px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-[#666666]'}`}>
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Join/Leave notifications */}
                  {notifications.slice(-10).map((notif, i) => (
                    <div key={`notif-${notif.timestamp}-${i}`} className="mb-2 flex justify-center animate-fadeIn">
                      <div className="text-xs text-[#9E9E9E] bg-[#1A1A1C] border border-[#2C2C2E] px-4 py-2 rounded-full">
                        {notif.username} {notif.type === 'join' ? 'joined' : 'left'} the chat
                      </div>
                    </div>
                  ))}

                  {typingUser && (
                    <div className="text-sm text-[#9E9E9E] italic animate-pulse">{typingUser} is typing...</div>
                  )}
                </div>

                {/* Scroll to bottom button */}
                {showScrollButton && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-6 right-6 bg-[#FF5500] hover:bg-[#FF8800] text-white rounded-full p-3 shadow-lg transition-all animate-fadeIn orange-glow"
                    aria-label="Scroll to bottom"
                    title="Scroll to bottom"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <label htmlFor="message-input" className="sr-only">
                  Type your message
                </label>
                <textarea
                  id="message-input"
                  value={message}
                  onChange={e => handleTypingChange(e.target.value)}
                  onKeyDown={handleMessageKeyDown}
                  placeholder={username ? "Type a message..." : "Set your name first"}
                  className="flex-1 bg-[#0E0E10] placeholder-[#666666] text-white border border-[#2C2C2E] rounded-lg px-4 py-3 h-12 resize-none focus:ring-2 focus:ring-[#FF5500] focus:border-[#FF5500] focus:outline-none transition-all"
                  maxLength={500}
                  aria-label="Message"
                  disabled={!connected}
                />

                <button
                  onClick={sendMessage}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    connected && username.trim() && message.trim() 
                      ? 'bg-[#FF5500] hover:bg-[#FF8800] text-white orange-glow' 
                      : 'bg-[#2C2C2E] text-[#666666] cursor-not-allowed'
                  }`}
                  disabled={!connected || !username.trim() || !message.trim()}
                  aria-label="Send message"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
