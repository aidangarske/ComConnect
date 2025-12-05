# Demo Accounts

## Ready-to-Use Accounts

### 🔍 Service Seeker
```
Email: seeker@comconnect.com
Password: seeker123
```
**Login → Dashboard:** /dashboard-seeker

### 💼 Service Provider
```
Email: provider@comconnect.com
Password: provider123
```
**Login → Dashboard:** /dashboard-provider

## How to Use

1. Start the app: `./start-all.sh` or manually start both servers
2. Open http://localhost:5173 or whatever port the frontend is running on
3. Click "Sign In"
4. Use any demo account credentials above
5. You'll be redirected to your role-specific dashboard

## Create New Accounts

You can also create new accounts via the "Create Account" button on the frontend. They'll be saved to MongoDB automatically!

## Database Location

All accounts are stored in:
- **Database:** MongoDB Atlas (cloud)
- **Cluster:** comconnect.q7ikbko.mongodb.net
- **Database Name:** comconnect
- **Collection:** users

View/manage in: https://cloud.mongodb.com → Databases → Data Explorer
