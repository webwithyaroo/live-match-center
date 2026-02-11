// Mock Socket.IO Server for Development/Testing
// This server simulates real-time match updates for the live match center

const { Server } = require('socket.io');
const http = require('http');

// Server configuration
const PORT = process.env.SOCKET_PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Create HTTP server and Socket.IO instance
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Team pool for generating realistic match-ups
const TEAM_POOL = [
  { id: 'man-utd', name: 'Manchester United', shortName: 'MUN', logo: 'man-utd' },
  { id: 'man-city', name: 'Manchester City', shortName: 'MCI', logo: 'man-city' },
  { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', logo: 'liverpool' },
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', logo: 'arsenal' },
  { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', logo: 'chelsea' },
  { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', logo: 'tottenham' },
  { id: 'newcastle', name: 'Newcastle United', shortName: 'NEW', logo: 'newcastle' },
  { id: 'aston-villa', name: 'Aston Villa', shortName: 'AVL', logo: 'aston-villa' },
  { id: 'west-ham', name: 'West Ham United', shortName: 'WHU', logo: 'west-ham' },
  { id: 'brighton', name: 'Brighton & Hove Albion', shortName: 'BHA', logo: 'brighton' },
];

const PLAYER_POOL = [
  'Marcus Rashford', 'Bruno Fernandes', 'Erling Haaland', 'Kevin De Bruyne',
  'Mohamed Salah', 'Darwin Nunez', 'Bukayo Saka', 'Martin Odegaard',
  'Raheem Sterling', 'Cole Palmer', 'Son Heung-min', 'James Maddison',
  'Alexander Isak', 'Anthony Gordon', 'Ollie Watkins', 'John McGinn',
  'Diogo Jota', 'Luis Diaz', 'Gabriel Jesus', 'Eddie Nketiah'
];

// Dynamic match state management - generates on demand
const matchState = {};
const chatRooms = {};
const typingUsers = {};

// Helper function to generate match state dynamically
function generateMatchState(matchId) {
  if (matchState[matchId]) {
    return matchState[matchId];
  }

  console.log(`🎲 Generating dynamic match state for ID: ${matchId}`);
  
  // Use ID as seed for deterministic randomness
  const seed = parseInt(matchId) || matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Select teams based on seed
  const homeTeamIndex = seed % TEAM_POOL.length;
  const awayTeamIndex = (seed * 3 + 5) % TEAM_POOL.length;
  
  const homeTeam = TEAM_POOL[homeTeamIndex];
  const awayTeam = TEAM_POOL[awayTeamIndex === homeTeamIndex ? (awayTeamIndex + 1) % TEAM_POOL.length : awayTeamIndex];
  
  // Generate scores (0-3 goals each)
  const homeScore = Math.floor((seed * 7) % 4);
  const awayScore = Math.floor((seed * 11) % 4);
  
  // Determine match status
  const statusOptions = ['FIRST_HALF', 'SECOND_HALF', 'HALF_TIME'];
  const status = statusOptions[seed % statusOptions.length];
  
  // Generate minute based on status
  let minute = 0;
  if (status === 'FIRST_HALF') minute = 15 + (seed % 30);
  else if (status === 'HALF_TIME') minute = 45;
  else if (status === 'SECOND_HALF') minute = 46 + (seed % 44);
  
  // Generate events based on goals scored
  const events = [];
  let eventId = 1;
  
  // Add goal events for home team
  for (let i = 0; i < homeScore; i++) {
    const goalMinute = Math.floor(10 + ((seed + i * 17) % (minute - 10)));
    const playerIndex = (seed + i * 3) % PLAYER_POOL.length;
    const assistIndex = (seed + i * 5 + 1) % PLAYER_POOL.length;
    
    events.push({
      id: `evt-${matchId}-${eventId++}`,
      type: 'GOAL',
      minute: goalMinute,
      team: 'home',
      player: PLAYER_POOL[playerIndex],
      assistPlayer: assistIndex !== playerIndex ? PLAYER_POOL[assistIndex] : undefined,
      description: `Goal by ${PLAYER_POOL[playerIndex]}`,
      timestamp: new Date(Date.now() - (minute - goalMinute) * 60000).toISOString()
    });
  }
  
  // Add goal events for away team
  for (let i = 0; i < awayScore; i++) {
    const goalMinute = Math.floor(10 + ((seed + i * 23) % (minute - 10)));
    const playerIndex = (seed + i * 7) % PLAYER_POOL.length;
    const assistIndex = (seed + i * 11 + 1) % PLAYER_POOL.length;
    
    events.push({
      id: `evt-${matchId}-${eventId++}`,
      type: 'GOAL',
      minute: goalMinute,
      team: 'away',
      player: PLAYER_POOL[playerIndex],
      assistPlayer: assistIndex !== playerIndex ? PLAYER_POOL[assistIndex] : undefined,
      description: `Goal by ${PLAYER_POOL[playerIndex]}`,
      timestamp: new Date(Date.now() - (minute - goalMinute) * 60000).toISOString()
    });
  }
  
  // Sort events by minute
  events.sort((a, b) => a.minute - b.minute);
  
  const match = {
    id: matchId,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    minute,
    status,
    startTime: new Date(Date.now() - minute * 60000).toISOString(),
    events,
    statistics: {
      possession: { 
        home: 40 + (seed % 20), 
        away: 60 - (seed % 20)
      },
      shots: { 
        home: 5 + (seed % 10), 
        away: 8 + ((seed * 3) % 10) 
      },
      shotsOnTarget: { 
        home: 2 + (seed % 5), 
        away: 3 + ((seed * 3) % 5) 
      },
      corners: { 
        home: 2 + (seed % 6), 
        away: 3 + ((seed * 3) % 6) 
      },
      fouls: { 
        home: 8 + (seed % 8), 
        away: 6 + ((seed * 3) % 8) 
      },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 }
    }
  };
  
  matchState[matchId] = match;
  
  // Initialize chat room and typing users for this match
  if (!chatRooms[matchId]) {
    chatRooms[matchId] = { users: new Set(), messages: [] };
  }
  if (!typingUsers[matchId]) {
    typingUsers[matchId] = new Set();
  }
  
  console.log(`✅ Generated match: ${homeTeam.shortName} ${homeScore} - ${awayScore} ${awayTeam.shortName} (${status}, ${minute}')`);
  
  return match;
}

// Helper function to generate random event
function generateRandomEvent(matchId) {
  const match = matchState[matchId];
  if (!match) return null;

  const eventTypes = ['GOAL', 'YELLOW_CARD', 'SHOT', 'FOUL'];
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const team = Math.random() > 0.5 ? 'home' : 'away';
  const teamName = team === 'home' ? match.homeTeam.shortName : match.awayTeam.shortName;
  
  const players = [
    'John Smith', 'Mike Johnson', 'David Williams', 'James Brown',
    'Robert Jones', 'Michael Davis', 'William Miller', 'Richard Wilson'
  ];
  const player = players[Math.floor(Math.random() * players.length)];

  const event = {
    id: `evt-${Date.now()}-${Math.random()}`,
    type,
    minute: match.minute,
    team,
    player,
    description: `${type.replace('_', ' ')} - ${player} (${teamName})`,
    timestamp: new Date().toISOString()
  };

  if (type === 'GOAL') {
    if (team === 'home') {
      match.homeScore++;
    } else {
      match.awayScore++;
    }
    event.assistPlayer = Math.random() > 0.5 ? players[Math.floor(Math.random() * players.length)] : undefined;
    event.description = event.assistPlayer 
      ? `Goal by ${player} (assisted by ${event.assistPlayer})`
      : `Goal by ${player}`;
  }

  match.events.push(event);
  return event;
}

// Helper function to update statistics gradually
function updateStatistics(matchId) {
  const match = matchState[matchId];
  if (!match) return null;

  const stats = match.statistics;
  
  // Update possession (gradual changes, must sum to 100)
  const possessionChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  stats.possession.home = Math.max(30, Math.min(70, stats.possession.home + possessionChange));
  stats.possession.away = 100 - stats.possession.home;

  // Update shots occasionally
  if (Math.random() > 0.7) {
    const team = Math.random() > 0.5 ? 'home' : 'away';
    stats.shots[team]++;
    if (Math.random() > 0.4) {
      stats.shotsOnTarget[team]++;
    }
  }

  // Update corners occasionally
  if (Math.random() > 0.9) {
    const team = Math.random() > 0.5 ? 'home' : 'away';
    stats.corners[team]++;
  }

  // Update fouls occasionally
  if (Math.random() > 0.8) {
    const team = Math.random() > 0.5 ? 'home' : 'away';
    stats.fouls[team]++;
  }

  return stats;
}

// Helper function to advance match time
function advanceMatchTime(matchId) {
  const match = matchState[matchId];
  if (!match) return;

  if (match.status === 'FIRST_HALF' && match.minute < 45) {
    match.minute++;
    if (match.minute >= 45) {
      match.status = 'HALF_TIME';
      io.emit('status_change', {
        matchId,
        status: 'HALF_TIME',
        minute: 45
      });
    }
  } else if (match.status === 'HALF_TIME') {
    // Stay in half-time for 2 minutes
    setTimeout(() => {
      match.status = 'SECOND_HALF';
      match.minute = 46;
      io.emit('status_change', {
        matchId,
        status: 'SECOND_HALF',
        minute: 46
      });
    }, 2000);
  } else if (match.status === 'SECOND_HALF' && match.minute < 90) {
    match.minute++;
    if (match.minute >= 90) {
      match.status = 'FULL_TIME';
      io.emit('status_change', {
        matchId,
        status: 'FULL_TIME',
        minute: 90
      });
    }
  }
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Handle match subscription
  socket.on('subscribe_match', (data) => {
    const matchId = typeof data === 'object' ? data.matchId : data;
    console.log(`📺 Client ${socket.id} subscribed to match ${matchId}`);
    socket.join(`match_${matchId}`);
    
    // Generate or get match state
    const match = generateMatchState(matchId);
    
    // Send current match state
    socket.emit('subscribed', { currentState: match });
  });

  // Handle unsubscribe
  socket.on('unsubscribe_match', (matchId) => {
    console.log(`👋 Client ${socket.id} unsubscribed from match ${matchId}`);
    socket.leave(`match_${matchId}`);
  });

  // Chat handlers
  socket.on('join_chat', ({ matchId, username }) => {
    console.log(`💬 ${username} joined chat for match ${matchId}`);
    socket.join(`chat_${matchId}`);
    
    if (!chatRooms[matchId]) {
      chatRooms[matchId] = { users: new Set(), messages: [] };
    }
    chatRooms[matchId].users.add(username);
    
    // Send chat history to the joining user (last 50 messages)
    if (chatRooms[matchId].messages.length > 0) {
      socket.emit('chat_history', {
        matchId,
        messages: chatRooms[matchId].messages.slice(-50)
      });
    }
    
    // Notify other users
    socket.to(`chat_${matchId}`).emit('user_joined', {
      matchId,
      username,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('leave_chat', ({ matchId, username }) => {
    console.log(`👋 ${username} left chat for match ${matchId}`);
    socket.leave(`chat_${matchId}`);
    
    if (chatRooms[matchId]) {
      chatRooms[matchId].users.delete(username);
    }
    
    // Notify other users
    socket.to(`chat_${matchId}`).emit('user_left', {
      matchId,
      username,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send_message', ({ matchId, username, message }, callback) => {
    console.log(`💬 Message from ${username} in match ${matchId}: ${message}`);
    
    if (!chatRooms[matchId]) {
      chatRooms[matchId] = { users: new Set(), messages: [] };
    }
    
    const chatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      matchId,
      username,
      message,
      timestamp: new Date().toISOString()
    };
    
    chatRooms[matchId].messages.push(chatMessage);
    
    // Broadcast to all users in the chat room (including sender)
    io.to(`chat_${matchId}`).emit('chat_message', chatMessage);
    
    // Send acknowledgment
    if (callback) {
      callback({ success: true, messageId: chatMessage.id });
    }
  });

  socket.on('typing_start', ({ matchId, username }) => {
    console.log(`⌨️  ${username} started typing in match ${matchId}`);
    if (!typingUsers[matchId]) {
      typingUsers[matchId] = new Set();
    }
    typingUsers[matchId].add(username);
    socket.to(`chat_${matchId}`).emit('typing_start', { matchId, username });
  });

  socket.on('typing_stop', ({ matchId, username }) => {
    console.log(`⌨️  ${username} stopped typing in match ${matchId}`);
    if (typingUsers[matchId]) {
      typingUsers[matchId].delete(username);
    }
    socket.to(`chat_${matchId}`).emit('typing_stop', { matchId, username });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Simulation loops for real-time updates
function startSimulation() {
  // Update match time every 5 seconds
  setInterval(() => {
    Object.keys(matchState).forEach(matchId => {
      const match = matchState[matchId];
      if (match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF') {
        advanceMatchTime(matchId);
        
        // Emit score update (even if score didn't change, for minute updates)
        io.emit('score_update', {
          matchId,
          homeScore: match.homeScore,
          awayScore: match.awayScore
        });
      }
    });
  }, 5000);

  // Update statistics every 8 seconds
  setInterval(() => {
    Object.keys(matchState).forEach(matchId => {
      const match = matchState[matchId];
      if (match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF') {
        const stats = updateStatistics(matchId);
        if (stats) {
          io.to(`match_${matchId}`).emit('stats_update', {
            matchId,
            statistics: stats
          });
        }
      }
    });
  }, 8000);

  // Generate random events occasionally
  setInterval(() => {
    Object.keys(matchState).forEach(matchId => {
      const match = matchState[matchId];
      if (match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF') {
        // 15% chance of an event every 15 seconds
        if (Math.random() > 0.85) {
          const event = generateRandomEvent(matchId);
          if (event) {
            io.to(`match_${matchId}`).emit('match_event', {
              ...event,
              matchId
            });
            
            // If it's a goal, emit score update
            if (event.type === 'GOAL') {
              io.emit('score_update', {
                matchId,
                homeScore: match.homeScore,
                awayScore: match.awayScore
              });
            }
          }
        }
      }
    });
  }, 15000);
}

// Start the server
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Mock Socket.IO Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🔗 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`\n🎲 Dynamic match generation enabled - supports ANY match ID!`);
  console.log(`   Match states are generated on-demand when clients subscribe`);
  
  console.log('\n✨ Real-time updates active:');
  console.log('   • Score updates every 5s');
  console.log('   • Stats updates every 8s');
  console.log('   • Random events every 15s');
  console.log('\n💡 To use this server, set NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001\n');
  
  // Start simulation
  startSimulation();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down mock server...');
  io.close(() => {
    httpServer.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});
