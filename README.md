# Paper Cricket 🏏

> The classic notebook game, now online!

Paper Cricket is a digital recreation of the beloved notebook game that generations have played in schools, offices, and homes. Two players compete in this strategic cricket simulation where mind games and probability meet in an exciting turn-based format.

## 📸 Screenshots

### Homepage & Authentication
![Login Page](https://github.com/user-attachments/assets/dc5192f5-bcaa-4583-860a-cc9aeb7545fe)
*Clean, modern login interface*

![Registration](https://github.com/user-attachments/assets/dc40f75c-46ab-40b9-9a55-45a555ba5216)
*Simple registration process*

### Main Game Interface
![Game Menu](https://github.com/user-attachments/assets/325b9712-022a-4207-8826-12c669456f42)
*Main game interface with options to create or join games*

## 🎮 How to Play

Paper Cricket follows the traditional rules:

1. **Two players** take turns being the batsman and bowler
2. Each player secretly chooses a letter from **A to G** representing their move
3. **If both players choose the same letter** → **WICKET!** The batsman is out
4. **If they choose different letters** → **RUNS!** The batsman scores runs based on their choice:
   - A = 1 run
   - B = 2 runs  
   - C = 3 runs
   - D = 4 runs
   - E = 6 runs
   - F = 4 runs
   - G = 6 runs

5. The game continues until the batting team loses all wickets or completes all overs
6. Teams then switch roles, and the second team tries to beat the target score
7. **Highest score wins!**

## ✨ Features

- **Real-time Multiplayer**: Play with friends using WebSocket connections
- **User Authentication**: Secure JWT-based login and registration
- **Match Lobbies**: Create private matches with custom game codes
- **Configurable Games**: Set custom overs (1, 2, 5, 10) and wickets (2-10)
- **Live Game State**: Real-time score updates and turn management
- **Responsive Design**: Beautiful, mobile-friendly interface using TailwindCSS
- **Game History**: Track match results and statistics

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library
- **TailwindCSS 4** - Utility-first CSS framework
- **WebSocket Client** - Real-time game communication

### Backend  
- **Django 5.2.6** - Python web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure token-based auth
- **CORS Support** - Cross-origin request handling

### Infrastructure
- **WebSockets** - Real-time bidirectional communication
- **ASGI/Daphne** - Async server for WebSocket support
- **Docker Ready** - Containerization support

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.8+** and pip
- **PostgreSQL** (or SQLite for development)

### 1. Clone the Repository
```bash
git clone https://github.com/Shinasom/paper-cricket.git
cd paper-cricket
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials

# Set up PostgreSQL database
createdb paper_cricket_db
createuser papercricket --pwprompt

# For development only - you can use SQLite instead:
# Comment out the PostgreSQL config in core/settings.py and use:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the Django server
python manage.py runserver
```

The backend will be available at `http://127.0.0.1:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Environment Configuration

Create a `.env` file in the backend directory:
```env
# Database
DB_PASSWORD=your_postgres_password

# Django
SECRET_KEY=your-secret-key
DEBUG=True

# CORS
CORS_ORIGIN_WHITELIST=http://localhost:3000
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/game/auth/register/` - User registration
- `POST /api/game/auth/token/` - Login (get JWT tokens)
- `POST /api/game/auth/token/refresh/` - Refresh access token
- `GET /api/game/auth/user/` - Get current user info

### Game Endpoints  
- `POST /api/game/matches/create/` - Create a new match
- `POST /api/game/matches/join/` - Join a match with code

### WebSocket Endpoints
- `ws://127.0.0.1:8000/ws/game/{match_id}/` - Real-time game communication

## 🎯 Game Flow

1. **Registration/Login** - Players create accounts or sign in
2. **Match Creation** - Host creates a match with custom settings
3. **Match Joining** - Second player joins using the match code
4. **Real-time Gameplay** - Players take turns choosing letters
5. **Live Updates** - Scores, wickets, and game state update instantly
6. **Match Completion** - Final scores and winner determination

## 🏗️ Project Structure

```
paper-cricket/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React context (Auth)
│   │   └── lib/             # API utilities
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Django REST API
│   ├── core/                # Django project settings
│   ├── game/                # Main game app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── consumers.py     # WebSocket handlers
│   │   ├── logic.py         # Game logic
│   │   └── urls.py          # URL routing
│   └── manage.py
├── LICENSE                   # MIT License
└── README.md                # This file
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests  
cd frontend
npm test
```

### Code Formatting
```bash
# Backend (using black)
black backend/

# Frontend (using eslint)
cd frontend
npm run lint
```

### Database Management
```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py flush
```

## 🚢 Deployment

### Production Environment Variables
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DB_PASSWORD=your-production-db-password
ALLOWED_HOSTS=your-domain.com
```

### Frontend Build
```bash
cd frontend
npm run build
npm start
```

### Backend Production
```bash
cd backend
pip install gunicorn
gunicorn core.asgi:application
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and formatting
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 Game Rules Reference

### Letter Values
| Letter | Runs | Description |
|--------|------|-------------|
| A | 1 | Single |
| B | 2 | Double |  
| C | 3 | Triple |
| D | 4 | Boundary |
| E | 6 | Six |
| F | 4 | Boundary |
| G | 6 | Six |

### Wicket Conditions
- **Bowler and batsman choose the same letter** = Wicket
- **Different letters** = Runs scored based on batsman's choice

### Match Format
- **Overs**: 1, 2, 5, or 10 (configurable)
- **Wickets**: 2-10 (configurable)  
- **Target**: Second team must beat first team's score

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if PostgreSQL is running
- Verify database credentials in settings
- Run migrations: `python manage.py migrate`

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check CORS settings in Django
- Verify API endpoints are accessible

**WebSocket connection fails:**
- Confirm Channels is properly configured
- Check ASGI application settings
- Ensure Daphne is installed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic paper cricket game played in schools worldwide
- Built with modern web technologies for seamless online gameplay
- Special thanks to the Django and Next.js communities

---

**Ready to play?** Set up your local environment and challenge your friends to a game of Paper Cricket! 🏏