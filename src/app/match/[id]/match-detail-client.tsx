"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { MatchDetail, MatchEvent, MatchStatus } from "@/types/match";

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

export default function MatchDetailClient({ initialMatch }: Props) {
  const [match, setMatch] = useState<MatchDetail>(initialMatch);
  const [connected, setConnected] = useState(false);

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

    socket.on("disconnect", () => setConnected(false));

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
        if ((msg as any).tempId) {
          const idx = prev.findIndex(m => m.tempId === (msg as any).tempId);
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
    try {
      socket.emit("send_message", { ...payload, tempId }, (ack: any) => {
        if (ack && ack.message) {
          // server returned canonical message
          setMessages(prev => {
            const idx = prev.findIndex(m => m.tempId === tempId);
            if (idx !== -1) {
              const next = [...prev];
              next[idx] = { ...ack.message, pending: false };
              return next.slice(-200);
            }
            // otherwise append if not exists
            const exists = prev.some(m => m.timestamp === ack.message.timestamp && m.userId === ack.message.userId && m.message === ack.message.message);
            if (exists) return prev;
            return [...prev, ack.message].slice(-200);
          });
        }
      });
    } catch (e) {
      // if emit failed, keep optimistic message but mark it as not sent (still pending)
    }

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

  // create a flat sorted events array for the timeline feed (preserve order)
  const sortedEvents = (match.events || []).slice().sort((a, b) => {
    const ma = typeof a.minute === 'number' ? a.minute : 0;
    const mb = typeof b.minute === 'number' ? b.minute : 0;
    if (ma !== mb) return ma - mb;
    return (a.id ?? '').toString().localeCompare((b.id ?? '').toString());
  });

  const getDotStyle = (type?: string) => {
    if (!type) return 'bg-zinc-700';
    if (type.includes('GOAL')) return 'bg-orange-600';
    if (type.includes('YELLOW')) return 'bg-yellow-400';
    if (type.includes('RED')) return 'bg-red-500';
    if (type.includes('VAR')) return 'bg-blue-500';
    if (type.includes('SUBSTITUTION')) return 'bg-green-500';
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
    <main className="min-h-screen bg-black text-gray-100">
      <header className="py-6 bg-orange-600 text-white text-center mb-8 shadow-xl">
        <h1 className="text-5xl max-sm:text-2xl font-black tracking-tighter italic">MATCH CENTER</h1>
      </header>

      <section className="max-w-5xl mx-auto p-4">
        {/* MATCH HEADER CARD */}
        <div className="bg-zinc-900 border-l-4 border-orange-600 p-8 rounded-xl mb-12 flex flex-col md:flex-row justify-between items-center shadow-2xl gap-6">
          <div className="text-center flex-1">
            <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-2 flex items-center justify-center border border-white/20">
              <span className="text-3xl">{match.homeTeam?.shortName?.[0] ?? '🏟️'}</span>
            </div>
            <h2 className="text-white font-bold text-xl">{match.homeTeam?.name ?? match.homeTeam?.shortName}</h2>
          </div>

          <div className="text-center px-8">
            <div className="text-orange-500 font-mono text-sm mb-2 font-bold tracking-widest uppercase">{(match.status || '').replace('_', ' ')}</div>
            <div className="text-6xl font-black text-white flex items-center gap-4">
              <span>{match.homeScore}</span>
              <span className="text-zinc-700">:</span>
              <span>{match.awayScore}</span>
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-2 flex items-center justify-center border border-white/20">
              <span className="text-3xl">{match.awayTeam?.shortName?.[0] ?? '🏟️'}</span>
            </div>
            <h2 className="text-white font-bold text-xl">{match.awayTeam?.name ?? match.awayTeam?.shortName}</h2>
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 md:gap-6">
          {/* TIMELINE FEED - left/middle */}
          <div className="md:col-span-2">
            <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-0">
              {sortedEvents.length === 0 && (
                <div className="p-6 bg-zinc-900/40 rounded-lg text-gray-400">No events yet</div>
              )}

              {sortedEvents.map((ev, idx) => {
                const dotClass = getDotStyle(ev.type);
                const isLateDrama = ev.minute >= 90 && ev.type && ev.type.includes('GOAL');
                return (
                  <div key={ev.id ?? idx} className="mb-10 ml-8 relative">
                    <div className={`absolute -left-[41px] top-0 h-5 w-5 rounded-full ring-4 ring-black ${dotClass} ${isLateDrama ? 'animate-pulse' : ''}`}></div>

                    <div className="flex items-center gap-4 text-zinc-400 text-sm mb-1">
                      <span className={`font-bold ${isLateDrama ? 'text-orange-500' : ''}`}>{ev.minute ?? "0"}</span>
                      <span className="uppercase tracking-widest font-semibold">{(ev.type || '').replace('_', ' ')}</span>
                    </div>

                    <div className={`bg-zinc-900/50 p-4 rounded-lg border ${ev.type && ev.type.includes('VAR') ? 'border-blue-900/30' : 'border-zinc-800'}`}>
                      <p className="text-white font-bold text-lg">{ev.player ?? ev.description ?? '—'}</p>
                      {ev.assistPlayer && <p className="text-zinc-500 text-sm italic">Assist: {ev.assistPlayer}</p>}
                      {(ev as any).detail && <p className="text-zinc-500 text-sm mt-1">{(ev as any).detail}</p>}

                      {/* Substitution layout if available */}
                      {ev.type && ev.type.includes('SUBSTITUTION') && (
                        <div className="bg-zinc-800/40 p-3 rounded mt-3 flex gap-4">
                          <div className="flex-1 border-r border-zinc-800">
                            <p className="text-green-400 text-xs font-bold uppercase">In</p>
                            <p className="text-white font-bold">{ev.player ?? '—'}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-red-400 text-xs font-bold uppercase">Out</p>
                            <p className="text-zinc-400 font-bold">{(ev.assistPlayer) ?? '—'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Statistics + Chat */}
          <div className="md:col-span-1 mt-6 md:mt-0">
            <div className="border rounded p-4 bg-zinc-900 shadow-sm mb-6">
              <h3 className="font-semibold mb-2 text-gray-200">Statistics</h3>
              <pre className="text-sm text-gray-300">{JSON.stringify(match.statistics, null, 2)}</pre>
            </div>

            {/* Chat (reuse existing chat block markup) */}
            <div className="border rounded p-4 bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-100">Match Chat</h3>
                <div className="text-xs text-gray-400">Be respectful — stay on-topic</div>
              </div>

              <div className="mb-3">
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-zinc-800 placeholder-gray-500 text-gray-100 border border-zinc-700 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400"
                  aria-label="Your name"
                />
              </div>

              <div
                ref={chatContainerRef}
                onScroll={onChatScroll}
                aria-live="polite"
                className="h-56 overflow-auto border border-zinc-800 rounded p-3 mb-3 bg-black/60"
              >
                {messages.map((m, i) => {
                  const isOwn = m.userId === userId;
                  return (
                    <div key={m.tempId ?? m.timestamp ?? i} className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg ${isOwn ? 'bg-orange-400 text-black' : 'bg-zinc-800 text-gray-100'} ${m.pending ? 'opacity-70 italic' : ''}`}>
                        <div className="text-xs font-semibold">{m.username} {m.pending ? <span className="ml-2 text-xs text-gray-200">(sending...)</span> : null}</div>
                        <div className="mt-1 leading-snug">{m.message}</div>
                        <div className="text-[11px] text-gray-400 mt-1 text-right">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}</div>
                      </div>
                    </div>
                  );
                })}

                {typingUser && <div className="text-sm text-gray-400">{typingUser} is typing...</div>}
              </div>

              <div className="flex gap-3 items-start">
                <textarea
                  value={message}
                  onChange={e => handleTypingChange(e.target.value)}
                  onKeyDown={handleMessageKeyDown}
                  placeholder={username ? "Type a message (Enter to send, Shift+Enter newline)" : "Set your name to join chat"}
                  className="flex-1 bg-zinc-800 placeholder-gray-500 text-gray-100 border border-zinc-700 rounded px-3 py-2 h-12 resize-none focus:ring-2 focus:ring-orange-400"
                  maxLength={500}
                  aria-label="Message"
                  disabled={!connected}
                />

                <button
                  onClick={sendMessage}
                  className={`px-4 py-2 rounded ${connected && username.trim() && message.trim() ? 'bg-orange-500 text-black' : 'bg-zinc-700 text-gray-400 cursor-not-allowed'}`}
                  disabled={!connected || !username.trim() || !message.trim()}
                >
                  Send
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">Dark theme with orange accent — compact, high-contrast, mobile-friendly.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
