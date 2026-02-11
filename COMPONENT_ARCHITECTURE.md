# Component Architecture

## Component Hierarchy

```
App
├── Header (Layout)
│   ├── Back Button
│   ├── Logo & Title
│   └── Connection Status (with LiveIndicator)
│
└── Pages
    ├── Home Page
    │   └── Container (Layout)
    │       ├── Page Title & Description
    │       └── MatchCard[] (List)
    │           ├── League Header
    │           ├── LiveIndicator
    │           ├── TeamBadge (Home)
    │           ├── Score Display
    │           └── TeamBadge (Away)
    │
    └── Match Detail Page
        ├── Header (Layout)
        ├── Match Header Section
        │   ├── TeamBadge (Home, XL size)
        │   ├── Score Display
        │   ├── TeamBadge (Away, XL size)
        │   └── LiveIndicator + Status
        │
        ├── Tab Navigation
        │   ├── Overview Tab
        │   ├── Statistics Tab
        │   └── Chat Tab
        │
        └── Container (Layout)
            ├── Overview Content
            │   └── Event Cards[]
            │       ├── Event Icon
            │       ├── Minute Marker
            │       └── Event Details
            │
            ├── Statistics Content
            │   └── MatchStatistics
            │       └── StatBar[] (Multiple)
            │           ├── Label + Icon
            │           ├── Home Value
            │           ├── Progress Bar
            │           └── Away Value
            │
            └── Chat Content
                ├── Username Input
                ├── Message List
                └── Message Input + Send Button
```

## Component Responsibilities

### UI Components

#### TeamBadge
**Purpose**: Display team identification
- Team logo with fallback to DiceBear API
- Error handling with initials fallback
- Multiple size options
- Optional team name display
- Gradient background for visual appeal

**Props**:
- `team: Team` - Team data
- `size?: "sm" | "md" | "lg" | "xl"` - Badge size
- `showName?: boolean` - Display team name
- `className?: string` - Additional styles

**Usage**:
```tsx
<TeamBadge team={homeTeam} size="lg" showName />
```

#### LiveIndicator
**Purpose**: Show match status visually
- Color-coded status (Live, FT, HT, Upcoming)
- Animated pulse dot for live matches
- ARIA live regions for accessibility
- Multiple size options

**Props**:
- `status: string` - Match status
- `size?: "sm" | "md" | "lg"` - Indicator size
- `className?: string` - Additional styles

**Usage**:
```tsx
<LiveIndicator status="SECOND_HALF" size="md" />
```

#### MatchCard
**Purpose**: Display match summary
- Complete match information in card format
- Team logos, scores, status
- League header with badge
- Hover effects
- Responsive layout
- Clickable to match detail

**Props**:
- `match: Match` - Match data
- `variant?: "compact" | "full"` - Display variant
- `league?: string` - League name (optional)

**Usage**:
```tsx
<MatchCard match={matchData} league="Premier League" />
```

#### StatBar
**Purpose**: Visualize comparative statistics
- Bi-directional progress bar
- Team colors for each side
- Percentage or absolute values
- Smooth animations
- Icons for stat type

**Props**:
- `label: string` - Stat label
- `homeValue: number` - Home team value
- `awayValue: number` - Away team value
- `homeColor?: string` - Home team color
- `awayColor?: string` - Away team color
- `showAsPercentage?: boolean` - Display mode
- `icon?: string` - Icon emoji

**Usage**:
```tsx
<StatBar
  label="Possession"
  homeValue={65}
  awayValue={35}
  showAsPercentage
  icon="⚽"
/>
```

### Layout Components

#### Header
**Purpose**: App-wide navigation and branding
- Sticky positioning
- Back button (conditional)
- App logo and title
- Connection status indicator
- Responsive sizing

**Props**:
- `showBack?: boolean` - Show back button
- `title?: string` - Custom title
- `connected?: boolean` - Connection status

**Usage**:
```tsx
<Header showBack connected={isConnected} />
```

#### Container
**Purpose**: Consistent max-width layout
- Responsive padding
- Multiple max-width options
- Horizontal centering
- Consistent spacing

**Props**:
- `children: ReactNode` - Content
- `maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"` - Max width
- `className?: string` - Additional styles

**Usage**:
```tsx
<Container maxWidth="lg">
  <YourContent />
</Container>
```

## Design Patterns

### State Management
- Component-level state for UI interactions
- Props for data flow
- Callbacks for user actions
- React hooks (useState, useEffect, useRef, useCallback)

### Error Handling
- Graceful fallbacks for missing data
- Image error handling with alternatives
- Empty states for no data
- Connection status indicators

### Accessibility
- ARIA labels on all interactive elements
- Live regions for dynamic content
- Keyboard navigation support
- Semantic HTML structure
- Focus indicators

### Performance
- Limited global transitions
- Component memoization opportunities
- Lazy loading ready
- Optimized re-renders

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints
- Flexible layouts
- Scalable text
- Touch-friendly targets

## Styling Approach

### CSS Variables
All colors, shadows, and spacing use CSS variables defined in `globals.css`:
```css
var(--brand-primary)  /* Orange */
var(--bg-primary)     /* White */
var(--text-primary)   /* Dark gray */
var(--shadow-md)      /* Medium shadow */
```

### Tailwind Utilities
Components use Tailwind CSS utilities for:
- Layout (flex, grid)
- Spacing (p-4, gap-2)
- Colors (bg-gray-50)
- Typography (text-lg, font-bold)
- Responsive (sm:, md:, lg:)

### Custom Classes
Special classes for:
- `.match-card` - Hover effects
- `.live-dot` - Pulse animation
- `.score-update` - Flash animation
- Typography scales (.text-h1, .text-body)

## Data Flow

```
API/Props → Page Component → UI Components → User Actions
                ↓                   ↓              ↓
          Socket Updates      State Updates   Callbacks
                ↓                   ↓              ↓
            Re-render          Re-render      Event Handlers
```

### Props Flow
1. Server fetches data
2. Page component receives initial data
3. Client component manages state
4. UI components receive props
5. User interactions update state
6. Socket updates trigger re-renders

### Event Handling
1. User action (click, type, etc.)
2. Event handler in component
3. State update via setter
4. Optional callback to parent
5. Re-render with new state

## Testing Considerations

### Unit Testing
- Test component rendering
- Test prop variations
- Test user interactions
- Test error states
- Test accessibility

### Integration Testing
- Test page layouts
- Test navigation flow
- Test data updates
- Test responsive behavior

### Visual Testing
- Component snapshots
- Responsive screenshots
- Accessibility checks
- Cross-browser testing

## Future Enhancements

### Component Library
- Extract to separate package
- Storybook documentation
- Published npm package
- Version management

### New Components
- EventIcon (custom icons)
- PlayerCard
- LeagueBadge
- LoadingSkeleton
- ErrorBoundary
- Toast notifications

### Improvements
- Dark mode support
- Theme customization
- Animation controls
- Performance monitoring
- Analytics integration
