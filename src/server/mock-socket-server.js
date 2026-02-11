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

// Match state management
const matchState = {
  '1': {
    id: '1',
    homeTeam: {
      id: 'man-utd',
      name: 'Manchester United',
      shortName: 'MUN',
      logo: 'man-utd'
    },
    awayTeam: {
      id: 'liverpool',
      name: 'Liverpool',
      shortName: 'LIV',
      logo: 'liverpool'
    },
    homeScore: 1,
    awayScore: 1,
    minute: 23,
    status: 'FIRST_HALF',
    startTime: new Date().toISOString(),
    events: [
      {
        id: 'evt-1',
        type: 'GOAL',
        minute: 12,
        team: 'home',
        player: 'Marcus Rashford',
        assistPlayer: 'Bruno Fernandes',
        description: 'Goal by Marcus Rashford (assisted by Bruno Fernandes)',
        timestamp: new Date(Date.now() - 11 * 60000).toISOString()
      },
      {
        id: 'evt-2',
        type: 'GOAL',
        minute: 18,
        team: 'away',
        player: 'Mohamed Salah',
        assistPlayer: 'Trent Alexander-Arnold',
        description: 'Goal by Mohamed Salah (assisted by Trent Alexander-Arnold)',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString()
      }
    ],
    statistics: {
      possession: { home: 48, away: 52 },
      shots: { home: 6, away: 8 },
      shotsOnTarget: { home: 3, away: 4 },
      corners: { home: 2, away: 3 },
      fouls: { home: 4, away: 5 },
      yellowCards: { home: 0, away: 1 },
      redCards: { home: 0, away: 0 }
    }
  },
  '2': {
    id: '2',
    homeTeam: {
      id: 'arsenal',
      name: 'Arsenal',
      shortName: 'ARS',
      logo: 'arsenal'
    },
    awayTeam: {
      id: 'chelsea',
      name: 'Chelsea',
      shortName: 'CHE',
      logo: 'chelsea'
    },
    homeScore: 2,
    awayScore: 0,
    minute: 67,
    status: 'SECOND_HALF',
    startTime: new Date(Date.now() - 90 * 60000).toISOString(),
    events: [
      {
        id: 'evt-3',
        type: 'GOAL',
        minute: 25,
        team: 'home',
        player: 'Bukayo Saka',
        description: 'Goal by Bukayo Saka',
        timestamp: new Date(Date.now() - 42 * 60000).toISOString()
      },
      {
        id: 'evt-4',
        type: 'GOAL',
        minute: 52,
        team: 'home',
        player: 'Gabriel Jesus',
        assistPlayer: 'Martin Odegaard',
        description: 'Goal by Gabriel Jesus (assisted by Martin Odegaard)',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString()
      }
    ],
    statistics: {
      possession: { home: 62, away: 38 },
      shots: { home: 14, away: 5 },
      shotsOnTarget: { home: 7, away: 2 },
      corners: { home: 6, away: 2 },
      fouls: { home: 6, away: 9 },
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 0 }
    }
  }
};

// Chat rooms management
const chatRooms = {
  '1': { users: new Set(), messages: [] },
  '2': { users: new Set(), messages: [] }
};

// Typing indicators
const typingUsers = {
  '1': new Set(),
  '2': new Set()
};

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
  socket.on('subscribe_match', (matchId) => {
    console.log(`📺 Client ${socket.id} subscribed to match ${matchId}`);
    socket.join(`match_${matchId}`);
    
    // Send current match state
    const match = matchState[matchId];
    if (match) {
      socket.emit('subscribed', { currentState: match });
    }
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
    
    const chatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      matchId,
      username,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (chatRooms[matchId]) {
      chatRooms[matchId].messages.push(chatMessage);
    }
    
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
  console.log(`\n📊 Simulating ${Object.keys(matchState).length} live matches:`);
  
  Object.values(matchState).forEach(match => {
    console.log(`   • ${match.homeTeam.shortName} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.shortName} (${match.status})`);
  });
  
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
