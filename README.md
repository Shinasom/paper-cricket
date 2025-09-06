# Paper Cricket

A nostalgic online recreation of the classic notebook game Paper Cricket, built with Django and Next.js featuring an authentic handwritten notebook aesthetic.

## Overview

Paper Cricket transforms the beloved school-time game into a real-time multiplayer web experience. Players choose letters (A-G) simultaneously - matching letters result in outs, different letters score runs based on predetermined values. The game captures the original notebook feel with handwritten fonts, ruled paper backgrounds, and ink-style colors.

## Features

### Core Gameplay
- **Real-time Multiplayer**: WebSocket-based gameplay with instant updates
- **Authentic Mechanics**: Traditional Paper Cricket rules with A=1, B=2, C=3, D=4, E=6, F=4, G=6
- **Match Customization**: Configurable overs (1-10) and wickets (1-5)
- **Two Innings Format**: Complete cricket match structure with chase targets

### User Experience
- **Notebook Aesthetic**: Handwritten fonts, ruled paper, spiral binding visual design
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Interactive Animations**: Ball outcomes, player actions, and atmospheric effects
- **Live Match Sharing**: Easy code sharing and joining system

### Technical Features
- **JWT Authentication**: Secure user sessions with automatic token refresh
- **Real-time Communication**: Django Channels WebSocket implementation
- **Match Lobbies**: Enhanced waiting rooms with code sharing
- **Ball-by-Ball Tracking**: Complete match statistics and history

## Technology Stack

### Backend
- **Django 5.2.6**: Web framework and API
- **Django Channels**: WebSocket support for real-time features
- **PostgreSQL**: Primary database
- **Django REST Framework**: API endpoints
- **JWT Authentication**: `djangorestframework-simplejwt`

### Frontend
- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **Custom Fonts**: Google Fonts (Kalam, Caveat) for handwritten feel
- **WebSocket Client**: Native browser WebSocket API

## Project Structure

```
paper-cricket/
├── backend/
│   ├── core/                 # Django project settings
│   │   ├── settings.py       # Configuration
│   │   ├── asgi.py          # ASGI application with WebSocket routing
│   │   └── urls.py          # URL routing
│   └── game/                 # Main application
│       ├── models.py         # Database models (Player, Match, Inning, Ball)
│       ├── views.py          # REST API views
│       ├── consumers.py      # WebSocket consumers
│       ├── logic.py          # Game logic and state management
│       ├── middleware.py     # JWT WebSocket authentication
│       ├── serializers.py    # API serializers
│       ├── signals.py        # Automatic player profile creation
│       └── routing.py        # WebSocket URL routing
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.js     # Root layout with AuthProvider
        │   ├── page.js       # Homepage with notebook design
        │   └── game/[matchId]/page.js  # Dynamic game routes
        ├── components/
        │   └── GameClient.js # Main game interface
        ├── context/
        │   └── AuthContext.js # Authentication state management
        └── lib/
            └── api.js        # API service layer
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+

### Backend Setup

1. **Clone and setup backend**:
   ```bash
   git clone <repository-url>
   cd paper-cricket/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Database configuration**:
   ```bash
   # Create PostgreSQL database
   createdb paper_cricket_db
   createuser papercricket
   ```

3. **Environment variables**:
   Create `.env` file in backend directory:
   ```env
   DB_PASSWORD=your_postgresql_password
   ```

4. **Run migrations and start server**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

### Frontend Setup

1. **Setup frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

2. **Access application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

## API Endpoints

### Authentication
- `POST /api/game/auth/register/` - User registration
- `POST /api/game/auth/token/` - JWT token obtain
- `POST /api/game/auth/token/refresh/` - Token refresh
- `GET /api/game/auth/user/` - Current user details

### Match Management
- `POST /api/game/matches/create/` - Create new match
- `POST /api/game/matches/join/` - Join existing match

### WebSocket
- `ws://localhost:8000/ws/game/{match_id}/?token={jwt_token}` - Real-time game connection

## Game Flow

1. **Authentication**: Users register/login to create player profiles
2. **Match Creation**: Host creates match with custom overs/wickets settings  
3. **Lobby**: Enhanced waiting room with code sharing and match details
4. **Gameplay**: Real-time letter selection with immediate feedback
5. **Innings Transition**: Automatic progression from first to second innings
6. **Match Completion**: Winner determination and final statistics

## Database Models

### Player
- User profiles with match statistics
- Automatic creation via Django signals

### Match  
- Game settings (overs, wickets, match type)
- Player relationships and winner tracking
- Calculated target runs property

### Inning
- Per-innings scoring and turn management
- Links batting/bowling players to matches

### Ball
- Individual ball records with choices and outcomes
- Complete match reconstruction capability

## Key Features Implementation

### Real-time Communication
WebSocket consumers handle game state synchronization with JWT authentication middleware for secure connections.

### Game Logic
Stateless logic module processes ball outcomes, manages innings transitions, and determines match completion.

### Notebook Aesthetic
Custom CSS with Google Fonts creates authentic handwritten appearance with ruled paper backgrounds and ink colors.

### Responsive Design
Mobile-first Tailwind CSS implementation with desktop enhancements and touch-optimized interactions.

## Development Status

### Implemented
- Core gameplay mechanics
- Real-time multiplayer functionality
- JWT authentication system
- Notebook visual design
- Match creation and joining
- WebSocket game communication

### Planned Features
- Player statistics dashboard
- Global leaderboards
- Match history and replay
- Tournament system
- Achievement badges
- Spectator mode

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the classic Paper Cricket notebook game
- Built with modern web technologies for nostalgic gameplay
- Designed for cricket enthusiasts and casual gamers alike
