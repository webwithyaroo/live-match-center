"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Match, ScoreUpdatePayload, StatusChangePayload } from "@/types/match";
import { getSocket } from "@/lib/socket";

type Props = {
  initialMatches: Match[];
};


// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { getSocket } from "@/lib/socket";
// import { MatchDetail, MatchEvent } from "@/types/match";
// import { 
//   Trophy, Clock, Send, MessageSquare, Activity, 
//   ArrowRightLeft, AlertCircle, ChevronDown, User
// } from "lucide-react";

// type ChatMessage = {
//   userId: string;
//   username: string;
//   message: string;
//   timestamp: string;
//   matchId?: string | number;
//   pending?: boolean;
//   tempId?: string;
// };

// type Props = { initialMatch: MatchDetail };

// // Event Icon Component
// const EventIcon = ({ type }: { type: string }) => {
//   switch (type) {
//     case "GOAL": return <Trophy className="w-4 h-4 text-orange-500 animate-bounce" />;
//     case "SUBSTITUTION": return <ArrowRightLeft className="w-4 h-4 text-purple-400" />;
//     case "RED_CARD": return <div className="w-3 h-4 bg-red-600 rounded-sm shadow-[0_0_8px_rgba(220,38,38,0.5)]" />;
//     case "YELLOW_CARD": return <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
//     default: return <Activity className="w-4 h-4 text-zinc-500" />;
//   }
// };

// export default function MatchDetailClient({ initialMatch }: Props) {
//   const [match, setMatch] = useState<MatchDetail>(initialMatch);
//   const [connected, setConnected] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [username, setUsername] = useState(() => 
//     typeof window !== "undefined" ? localStorage.getItem("mm_username") || "" : ""
//   );
//   const [userId] = useState(() => Math.random().toString(36).slice(2, 9));
//   const [typingUser, setTypingUser] = useState<string | null>(null);

//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const shouldAutoScrollRef = useRef(true);
//   const typingTimeout = useRef<number | null>(null);

//   useEffect(() => {
//     if (username) localStorage.setItem("mm_username", username);
//   }, [username]);

//   // SOCKET LOGIC
//   useEffect(() => {
//     if (!match) return;
//     const socket = getSocket();
//     const subscribe = () => socket.emit("subscribe_match", { matchId: match.id });

//     socket.on("connect", () => {
//       setConnected(true);
//       subscribe();
//     });

//     socket.on("disconnect", () => setConnected(false));
//     socket.on("subscribed", ({ currentState }: { currentState: MatchDetail }) => setMatch(currentState));
    
//     socket.on("score_update", (payload: { homeScore: number; awayScore: number }) => {
//       setMatch(prev => ({ ...prev, homeScore: payload.homeScore, awayScore: payload.awayScore }));
//     });

//     socket.on("match_event", (event: MatchEvent) => {
//       setMatch(prev => ({ ...prev, events: [...(prev.events || []), event] }));
//     });

//     socket.on("chat_message", (msg: ChatMessage) => {
//       setMessages(prev => {
//         const pendingIdx = prev.findIndex(m => m.pending && m.userId === msg.userId && m.message === msg.message);
//         if (pendingIdx !== -1) {
//           const next = [...prev];
//           next[pendingIdx] = { ...msg, pending: false };
//           return next.slice(-200);
//         }
//         return [...prev, msg].slice(-200);
//       });
//       if (shouldAutoScrollRef.current && chatContainerRef.current) {
//         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//       }
//     });

//     socket.on("typing_start", (payload: { userId: string; username?: string }) => {
//       if (payload.userId !== userId) setTypingUser(payload.username ?? "Someone");
//     });

//     socket.on("typing_stop", () => setTypingUser(null));

//     return () => {
//       socket.emit("unsubscribe_match", { matchId: match?.id });
//       socket.off("score_update");
//       socket.off("match_event");
//       socket.off("chat_message");
//       socket.off("typing_start");
//       socket.off("typing_stop");
//     };
//   }, [match?.id, userId]);

//   // CHAT HELPERS
//   const sendMessage = () => {
//     if (!message.trim() || !username.trim() || !connected) return;
//     const socket = getSocket();
//     const tempId = "t_" + Date.now();
//     const payload = { matchId: match?.id, userId, username, message: message.slice(0, 500) };

//     setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString(), pending: true, tempId }].slice(-200));
//     socket.emit("send_message", { ...payload, tempId });
//     setMessage("");
//     socket.emit("typing_stop", { matchId: match?.id, userId });
//   };

//   const handleTyping = (val: string) => {
//     setMessage(val);
//     const socket = getSocket();
//     // guard match.id in case match shape differs during hydration
//     socket.emit("typing_start", { matchId: match?.id, userId, username });
//     if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
//     typingTimeout.current = window.setTimeout(() => {
//       socket.emit("typing_stop", { matchId: match?.id, userId });
//     }, 1500);
//   };

//   return (
//     <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-orange-500/30">
//       {/* HEADER */}
//       <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
//         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
//             <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400">
//               {String(match?.status) === 'LIVE' ? 'Live Broadcast' : 'Match Final'}
//             </span>
//           </div>
//           <h1 className="font-black italic text-2xl tracking-tighter">
//             <span className="text-orange-600">PRO</span>MATCH
//           </h1>
//           <div className="hidden md:block text-right">
//             <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">Season 2026</span>
//             <span className="text-sm font-bold">UEFA Champions League</span>
//           </div>
//         </div>
//       </header>

//       <section className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
//         {/* MAIN FEED (8 COLS) */}
//         <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
//           {/* SCOREBOARD */}
//           <div className="relative overflow-hidden bg-zinc-900 rounded-[2.5rem] border border-white/5 p-8 lg:p-12 shadow-2xl">
//             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 to-amber-400" />
//             <div className="flex justify-between items-center relative z-10 gap-4">
//               <div className="flex-1 text-center group">
//                 <div className="w-20 h-20 lg:w-28 lg:h-28 bg-white/5 rounded-3xl mx-auto mb-4 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
//                   <span className="text-5xl">🦁</span>
//                 </div>
//                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter">{match?.homeTeam?.shortName ?? match?.homeTeam?.name ?? ''}</h2>
//               </div>

//               <div className="flex-[0.6] text-center">
//                 <div className="inline-flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1 rounded-full text-orange-500 text-[10px] font-black mb-6 border border-white/5 uppercase tracking-widest">
//                   <Clock className="w-3 h-3" /> {match?.minute}
//                 </div>
//                 <div className="text-6xl lg:text-8xl font-black flex items-center justify-center gap-4 tabular-nums tracking-tighter">
//                   <span className={String(match?.status) === 'LIVE' ? 'animate-in zoom-in duration-300' : ''}>{match?.homeScore}</span>
//                   <span className="text-zinc-800 font-light">:</span>
//                   <span>{match?.awayScore}</span>
//                 </div>
//               </div>

//               <div className="flex-1 text-center group">
//                 <div className="w-20 h-20 lg:w-28 lg:h-28 bg-white/5 rounded-3xl mx-auto mb-4 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-500">
//                   <span className="text-5xl">🦅</span>
//                 </div>
//                 <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter">{match?.awayTeam?.shortName ?? match?.awayTeam?.name ?? ''}</h2>
//               </div>
//             </div>
//           </div>

//           {/* STATS BAR */}
//           <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
//             {Object.entries(match?.statistics || {}).map(([key, val]) => (
//               <div key={key} className="shrink-0 min-w-35 bg-zinc-900/50 border border-white/5 p-4 rounded-3xl backdrop-blur-sm">
//                 <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 mb-2">{key.replace('_', ' ')}</p>
//                 <div className="flex justify-between items-end">
//                   <span className="text-lg font-bold">{val.home}</span>
//                   <div className="flex-1 mx-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
//                     <div className="h-full bg-orange-600" style={{ width: `${(val.home / (val.home + val.away)) * 100}%` }} />
//                   </div>
//                   <span className="text-lg font-bold text-zinc-500">{val.away}</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* TIMELINE */}
//           <div className="space-y-6 pt-4">
//             <div className="flex items-center gap-4">
//               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Match Timeline</h3>
//               <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
//             </div>
            
//             <div className="relative border-l-2 border-zinc-800 ml-4 pl-10 space-y-10">
//               {(match?.events || []).slice().reverse().map((event, idx) => (
//                 <div key={idx} className="relative animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
//                   <div className="absolute -left-[51px] top-1.5 w-5 h-5 bg-[#09090b] border-2 border-zinc-700 rounded-full z-10 flex items-center justify-center">
//                     <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
//                   </div>
//                   <div className="flex items-center gap-6">
//                     <span className="font-mono text-orange-500 font-black text-sm w-8">{event.minute}</span>
//                     <div className="flex-1 bg-zinc-900/40 border border-white/5 p-5 rounded-[1.5rem] hover:bg-zinc-800/40 transition-all group">
//                       <div className="flex items-center gap-2 mb-2">
//                         <EventIcon type={event.type} />
//                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
//                           {event.type.replace('_', ' ')}
//                         </span>
//                       </div>
//                       <p className="text-lg font-bold tracking-tight">{event.player}</p>
//                       {event.description && <p className="text-zinc-500 text-xs mt-1 italic">{event.description}</p>}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* SIDEBAR: FAN CHAT (4 COLS) */}
//         <aside className="lg:col-span-4 flex flex-col h-[calc(100vh-10rem)] bg-zinc-900/40 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl">
//           <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-orange-600/10 rounded-xl">
//                 <MessageSquare className="w-4 h-4 text-orange-500" />
//               </div>
//               <span className="text-xs font-black uppercase tracking-widest">Fan Discussion</span>
//             </div>
//             <span className="text-[9px] bg-white/5 px-2 py-1 rounded-md font-bold text-zinc-400 uppercase tracking-tighter">
//               {messages.length} Messages
//             </span>
//           </div>

//           <div 
//             ref={chatContainerRef}
//             onScroll={() => {
//               const el = chatContainerRef.current;
//               if (el) shouldAutoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
//             }}
//             className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
//           >
//             {messages.length === 0 && (
//               <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
//                 <MessageSquare className="w-12 h-12 mb-4" />
//                 <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">No messages yet.<br/>Be the first to shout!</p>
//               </div>
//             )}
//             {messages.map((msg, i) => (
//               <div key={i} className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
//                 <div className="flex items-center gap-2 mb-1.5 px-1">
//                   <span className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">{msg.username}</span>
//                   {msg.pending && <div className="w-1 h-1 bg-orange-500 rounded-full animate-ping" />}
//                 </div>
//                 <div className={`max-w-[90%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
//                   msg.userId === userId 
//                     ? 'bg-orange-600 text-white rounded-tr-none' 
//                     : 'bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-white/5'
//                 }`}>
//                   {msg.message}
//                 </div>
//               </div>
//             ))}
//             {typingUser && (
//               <div className="text-[10px] text-zinc-500 italic animate-pulse px-2">
//                 {typingUser} is typing...
//               </div>
//             )}
//           </div>

//           <div className="p-6 bg-black/40 border-t border-white/5">
//             {!username ? (
//               <div className="space-y-3">
//                 <p className="text-[10px] font-black uppercase text-center text-zinc-500 tracking-widest">Join the crowd</p>
//                 <div className="flex gap-2">
//                   <input 
//                     className="flex-1 bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-orange-500 transition-all placeholder:text-zinc-600"
//                     placeholder="Set nickname..."
//                     onKeyDown={(e) => e.key === 'Enter' && setUsername((e.currentTarget as HTMLInputElement).value)}
//                   />
//                   <button className="bg-orange-600 p-3 rounded-xl hover:bg-orange-500" onClick={(e) => {
//                     const input = e.currentTarget.previousElementSibling as HTMLInputElement;
//                     if(input.value) setUsername(input.value);
//                   }}>
//                     <User className="w-4 h-4 text-white" />
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="relative group">
//                 <input
//                   value={message}
//                   onChange={(e) => handleTyping(e.target.value)}
//                   onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
//                   placeholder="Share your reaction..."
//                   className="w-full bg-zinc-800/30 border border-white/5 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-orange-500 focus:bg-zinc-800/50 transition-all placeholder:text-zinc-600"
//                 />
//                 <button 
//                   disabled={!message.trim()}
//                   className="absolute right-2 top-2 p-2.5 bg-orange-600 rounded-xl hover:bg-orange-500 transition-all disabled:opacity-30 disabled:scale-95 shadow-lg shadow-orange-600/20"
//                   onClick={sendMessage}
//                 >
//                   <Send className="w-4 h-4 text-white" />
//                 </button>
//               </div>
//             )}
//           </div>
//         </aside>
//       </section>
//     </main>
//   );
// }



export default function HomeClient({ initialMatches }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    function handleConnect() {
      setConnected(true);
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleScoreUpdate(payload: ScoreUpdatePayload) {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === payload.matchId
            ? {
                ...match,
                homeScore: payload.homeScore,
                awayScore: payload.awayScore,
              }
            : match,
        ),
      );
    }

    function handleStatusChange(payload: StatusChangePayload) {
      setMatches((prev) =>
        prev.map((match) =>
          match.id === payload.matchId
            ? {
                ...match,
                status: payload.status,
                minute: payload.minute,
              }
            : match,
        ),
      );
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("score_update", handleScoreUpdate);
    socket.on("status_change", handleStatusChange);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("score_update", handleScoreUpdate);
      socket.off("status_change", handleStatusChange);
    };
  }, []);

  return (
    <main className="max-w-full bg-black/100 min-h-screen">
      <header className="py-4 bg-orange-600 text-white text-center mb-6">
        <h1 className="text-5xl max-sm:text-2xl font-bold">
         MATCH SCHEDU
        </h1>
      </header>
      <section className="max-w-5xl mx-auto p-4">
        <div className="flex flex-col justify-between items-center mb-4">
        
          <span
            className={`text-xs font-medium ${
              connected ? "text-green-600" : "text-red-600"
            }`}
          >
            {connected ? "🟢 Connected" : "🔴 Reconnecting..."}
          </span>
          <h1 className=" text-5xl max-sm:text-2xl font-bold">
            Live Match Center
          </h1>
        </div>

        <ul className="space-y-3">
          {matches.map((match) => {
            const isLive =
              match.status === "FIRST_HALF" || match.status === "SECOND_HALF";

            return (
              <li
                key={match.id}
                className={`bg-white/10 rounded-sm p-4 flex justify-between items-center transition ${
                  isLive ? "border-green-500 bg-green-50" : ""
                }`}
              >
                <div>
                  <p className="font-semibold">
                    {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                  </p>

                  <p
                    className={`text-sm ${
                      isLive ? "text-orange-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {match.status.replace("_", " ")} · {match.minute}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">
                    {match.homeScore} : {match.awayScore}
                  </span>

                  <Link
                    href={`/match/${match.id}`}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
