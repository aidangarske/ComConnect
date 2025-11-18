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

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. The `.env.example` file already has the correct MongoDB connection string you can use that

Your `.env` should contain something like this:
```
MONGODB_URI=mongodb+srv://comconnectuser:comconnectuser@comconnect.q7ikbko.mongodb.net/comconnect
PORT=8080
NODE_ENV=development
JWT_SECRET=comconnect-super-secret-key-change-this-in-production-please-make-it-longer-for-security
JWT_EXPIRE=24h
```

## Database

MongoDB with two collections:
- `users` - User accounts
- `jobs` - Job postings
