# Backend

Node.js/Express server with MongoDB.

## Start

```bash
npm install
npm run dev
```

Runs on `http://localhost:8080`

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/users/profile` - Get user profile (needs token)
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (seeker only)
- `POST /api/jobs/:id/apply` - Apply for job (provider only)

## Environment Variables

Create `.env` in server directory:

```
MONGODB_URI=your_connection_string
PORT=8080
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
```

## Database

MongoDB with two collections:
- `users` - User accounts
- `jobs` - Job postings
