"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { MatchDetail, MatchEvent, MatchStatus } from "@/types/match";
import MatchStatistics from "@/components/match-statistics";
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
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeout = useRef<number | null>(null);

  // auto-scroll refs
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    if (username) localStorage.setItem("mm_username", username);
  }, [username]);

  useEffect(() => {
    const socket = getSocket();

    const subscribe = () => {
      socket.emit("subscribe_match", { matchId: match.id });
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

    return () => {
      socket.emit("unsubscribe_match", { matchId: match.id });
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
    socket.emit("typing_start", { matchId: match.id, userId, username });
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      socket.emit("typing_stop", { matchId: match.id, userId });
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
    if (!type) return 'bg-zinc-700';
    if (type.includes('GOAL')) return 'bg-orange-600';
    if (type.includes('YELLOW')) return 'bg-yellow-400';
    if (type.includes('RED')) return 'bg-red-500';
    if (type.includes('VAR')) return 'bg-blue-500';
    if (type.includes('SUBSTITUTION')) return 'bg-purple-500';
    return 'bg-zinc-700';
  };

  // chat scroll handler
  const onChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    shouldAutoScrollRef.current = nearBottom;
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
    <div className="min-h-screen bg-gray-50">
      <Header showBack connected={connected} />
      
      {/* Compact Match Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <Container maxWidth="xl">
          <div className="py-6 sm:py-8">
            {/* Teams and Score */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1 max-w-[150px]">
                <TeamBadge team={match.homeTeam} size="xl" />
                <h2 className="text-base sm:text-lg font-bold mt-2 text-center">
                  {match.homeTeam.shortName}
                </h2>
              </div>
              
              {/* Score */}
              <div className="flex flex-col items-center px-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-4xl sm:text-5xl font-black">{match.homeScore}</span>
                  <span className="text-2xl sm:text-3xl text-white/60">:</span>
                  <span className="text-4xl sm:text-5xl font-black">{match.awayScore}</span>
                </div>
              </div>
              
              {/* Away Team */}
              <div className="flex flex-col items-center flex-1 max-w-[150px]">
                <TeamBadge team={match.awayTeam} size="xl" />
                <h2 className="text-base sm:text-lg font-bold mt-2 text-center">
                  {match.awayTeam.shortName}
                </h2>
              </div>
            </div>
            
            {/* Match Status */}
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
              <LiveIndicator status={match.status} size="md" />
              {match.minute > 0 && (
                <>
                  <span>•</span>
                  <span className="font-semibold">{match.minute}&apos;</span>
                </>
              )}
              <span>•</span>
              <span>Premier League</span>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-40">
        <Container maxWidth="xl">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === "overview"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
              aria-current={activeTab === "overview" ? "page" : undefined}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === "statistics"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
              aria-current={activeTab === "statistics" ? "page" : undefined}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === "chat"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
              aria-current={activeTab === "chat" ? "page" : undefined}
            >
              Chat
            </button>
          </div>
        </Container>
      </div>
      
      {/* Content */}
      <Container maxWidth="xl" className="py-6">
        {/* Overview Tab - Timeline */}
        {activeTab === "overview" && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Match Timeline</h3>
            
            <div 
              className="space-y-4"
              role="feed"
              aria-label="Match Events Timeline"
            >
              {sortedEvents.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No events yet</p>
                </div>
              )}

              {sortedEvents.map((ev, idx) => {
                const dotClass = getDotStyle(ev.type);
                const isGoal = ev.type && ev.type.includes('GOAL');
                
                return (
                  <article 
                    key={ev.id ?? idx} 
                    className={`bg-white rounded-lg border p-4 ${
                      isGoal ? 'border-orange-400 shadow-md' : 'border-gray-200'
                    }`}
                    role="article"
                    aria-label={`${ev.type?.replace('_', ' ')} at minute ${ev.minute}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${dotClass.replace('bg-', 'bg-')}`}>
                        <span className="text-white font-bold text-sm">{ev.minute}&apos;</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {(ev.type || '').replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-lg font-bold text-gray-900">{ev.player ?? ev.description ?? '—'}</p>
                        
                        {ev.assistPlayer && (
                          <p className="text-sm text-gray-600 mt-1">
                            Assist: {ev.assistPlayer}
                          </p>
                        )}
                        
                        {ev.type && ev.type.includes('SUBSTITUTION') && (
                          <div className="mt-2 flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 font-semibold">IN:</span>
                              <span className="text-gray-900">{ev.player ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-red-600 font-semibold">OUT:</span>
                              <span className="text-gray-600">{ev.assistPlayer ?? '—'}</span>
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
          <div className="max-w-2xl mx-auto bg-zinc-900 rounded-lg p-6">
            <MatchStatistics statistics={match.statistics} />
          </div>
        )}
        
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">Match Chat</h3>
                <div className="text-xs text-gray-500">Be respectful</div>
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
                  className="w-full bg-gray-50 placeholder-gray-400 text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  aria-label="Your name"
                />
              </div>

              <div
                ref={chatContainerRef}
                onScroll={onChatScroll}
                aria-live="polite"
                className="h-96 overflow-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
              >
                {messages.map((m, i) => {
                  const isOwn = m.userId === userId;
                  return (
                    <div key={m.tempId ?? m.timestamp ?? i} className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-lg ${isOwn ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-900'} ${m.pending ? 'opacity-70' : ''}`}>
                        <div className="text-xs font-semibold mb-1">
                          {m.username} {m.pending && <span className="text-xs italic">(sending...)</span>}
                        </div>
                        <div className="text-sm leading-relaxed">{m.message}</div>
                        <div className={`text-[11px] mt-1 text-right ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                          {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typingUser && (
                  <div className="text-sm text-gray-500 italic">{typingUser} is typing...</div>
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
                  placeholder={username ? "Type a message (Enter to send)" : "Set your name first"}
                  className="flex-1 bg-gray-50 placeholder-gray-400 text-gray-900 border border-gray-300 rounded-lg px-4 py-2 h-12 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  maxLength={500}
                  aria-label="Message"
                  disabled={!connected}
                />

                <button
                  onClick={sendMessage}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    connected && username.trim() && message.trim() 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
