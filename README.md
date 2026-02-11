# Live Match Center - Real-time Football Matches

A modern, real-time football match tracking application built with Next.js 16, React 19, and Socket.IO. Watch live matches with real-time score updates, match events, statistics, and engage with other fans through live match chat.

## ✨ Features

- **Real-time Score Updates**: Instantly see score changes as they happen
- **Live Match Events**: Track goals, cards, substitutions, and other key moments in real-time
- **Interactive Statistics Graphs**: View animated charts and graphs for possession, shots, corners, and more
- **Live Match Chat**: Discuss the match with other fans in real-time
- **Typing Indicators**: See when other users are typing in chat
- **User Join/Leave Notifications**: Know when fans join or leave the chat
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark theme with orange accents for optimal viewing
- **WebSocket Connection Status**: Always know your connection status
- **Mock Server for Testing**: Built-in mock Socket.IO server for local development

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Socket.IO Client 4.8](https://socket.io/)** - Real-time bidirectional communication
- **[Recharts](https://recharts.org/)** - Composable charting library for statistics visualization
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

## 📋 Prerequisites

- **Node.js 18+** (recommended: 20+)
- **npm** or **yarn** package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/webwithyaroo/live-match-center.git
   cd live-match-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the values if needed:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=https://profootball.srv883830.hstgr.cloud
   
   # WebSocket Configuration
   # For production server:
   NEXT_PUBLIC_SOCKET_URL=wss://profootball.srv883830.hstgr.cloud
   # For local mock server (run with: npm run dev:mock):
   # NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
   
   # Mock Socket Server Configuration (optional)
   SOCKET_PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

## 💻 Development

### Development with Production Server

Run the development server (connects to production Socket.IO server):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Development with Mock Socket.IO Server

For local development and testing without connecting to the production server, you can use the mock Socket.IO server:

1. **Update your environment variables**
   
   In `.env.local`, set:
   ```env
   NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
   ```

2. **Run the mock server alongside Next.js**
   
   ```bash
   npm run dev:mock
   ```
   
   This will start both:
   - Next.js development server on `http://localhost:3000`
   - Mock Socket.IO server on `ws://localhost:3001`

3. **Or run them separately**
   
   Terminal 1 - Mock Socket.IO Server:
   ```bash
   npm run mock-server
   ```
   
   Terminal 2 - Next.js Dev Server:
   ```bash
   npm run dev
   ```

**Mock Server Features:**
- Simulates 2 live matches with realistic data
- Score updates every 5 seconds
- Statistics updates every 8 seconds
- Random match events (goals, cards, etc.) every 15 seconds
- Full chat functionality (messages, typing indicators, join/leave)
- Match time progression (first half → half-time → second half → full-time)
- Realistic data changes (possession shifts gradually, shots increase incrementally)

## 🏗️ Build

Build the application for production:

```bash
npm run build
```

## 🚀 Production

Start the production server:

```bash
npm run start
```

## 🧹 Linting

Check code quality with ESLint:

```bash
npm run lint
```

## 📁 Project Structure

```
live-match-center/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout with metadata
│   │   ├── page.tsx       # Home page (match list)
│   │   └── match/[id]/    # Dynamic match detail pages
│   │       ├── page.tsx           # Match detail server component
│   │       ├── match-detail-client.tsx  # Match detail client component
│   │       └── not-found.tsx      # 404 page for matches
│   ├── components/        # Reusable React components
│   │   ├── home-client.tsx        # Home page client component
│   │   ├── match-statistics.tsx   # Statistics with stat bars
│   │   ├── match-graphs.tsx       # Statistics with animated graphs
│   │   └── ui/                    # UI components
│   ├── lib/              # Utility functions and services
│   │   ├── api.ts        # API client for fetching matches
│   │   └── socket.ts     # Socket.IO client singleton
│   ├── server/           # Server-side code
│   │   └── mock-socket-server.js  # Mock Socket.IO server for testing
│   └── types/            # TypeScript type definitions
│       └── match.ts      # Match-related types
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
├── eslint.config.mjs     # ESLint configuration
└── postcss.config.mjs    # Tailwind CSS configuration
```

## 🔌 Real-time Features

### How WebSockets Work

The application uses Socket.IO for real-time bidirectional communication between the client and server.

#### Socket Connection

The socket connection is established through a singleton pattern in `src/lib/socket.ts`:
- Single persistent connection shared across the application
- Automatic reconnection with exponential backoff
- WebSocket transport for low latency

#### Socket Events

**Client → Server:**
- `subscribe_match` - Subscribe to match updates
- `unsubscribe_match` - Unsubscribe from match updates
- `join_chat` - Join match chat room
- `leave_chat` - Leave match chat room
- `send_message` - Send a chat message
- `typing_start` - Indicate user is typing
- `typing_stop` - Indicate user stopped typing

**Server → Client:**
- `connect` - Connection established
- `disconnect` - Connection lost
- `subscribed` - Successfully subscribed to match (includes current state)
- `score_update` - Score changed
- `match_event` - New match event (goal, card, etc.)
- `stats_update` - Statistics updated
- `status_change` - Match status changed (half-time, full-time, etc.)
- `chat_message` - New chat message
- `typing_start` - Another user is typing
- `typing_stop` - Another user stopped typing
- `user_joined` - User joined the chat
- `user_left` - User left the chat

## 🌐 API Endpoints

The application communicates with a REST API backend:

### GET `/api/matches`
Fetch all matches.

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "match-1",
        "homeTeam": { "id": "1", "name": "Team A", "shortName": "TMA" },
        "awayTeam": { "id": "2", "name": "Team B", "shortName": "TMB" },
        "homeScore": 2,
        "awayScore": 1,
        "minute": 75,
        "status": "SECOND_HALF",
        "startTime": "2024-01-01T15:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### GET `/api/matches/live`
Fetch only live matches (currently in progress).

**Response:** Same format as `/api/matches`

### GET `/api/matches/:id`
Fetch detailed information for a specific match including events and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "match-1",
    "homeTeam": { "id": "1", "name": "Team A", "shortName": "TMA" },
    "awayTeam": { "id": "2", "name": "Team B", "shortName": "TMB" },
    "homeScore": 2,
    "awayScore": 1,
    "minute": 75,
    "status": "SECOND_HALF",
    "startTime": "2024-01-01T15:00:00Z",
    "events": [
      {
        "id": "evt-1",
        "type": "GOAL",
        "minute": 15,
        "team": "home",
        "player": "Player Name",
        "assistPlayer": "Assist Name",
        "description": "Great goal!",
        "timestamp": "2024-01-01T15:15:00Z"
      }
    ],
    "statistics": {
      "possession": { "home": 55, "away": 45 },
      "shots": { "home": 12, "away": 8 },
      "shotsOnTarget": { "home": 6, "away": 3 },
      "corners": { "home": 5, "away": 2 },
      "fouls": { "home": 8, "away": 10 },
      "yellowCards": { "home": 2, "away": 3 },
      "redCards": { "home": 0, "away": 0 }
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Use TypeScript for type safety
- Write meaningful commit messages
- Test your changes thoroughly
- Ensure `npm run build` and `npm run lint` pass without errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Real-time communication powered by [Socket.IO](https://socket.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Enjoy watching live matches!** ⚽️🔥
