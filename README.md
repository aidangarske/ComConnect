# ComConnect

**Team:** Harrison Barrett, Damon Bun, Aidan Garske, Jose Garcia, Harjosh Gosal

 [Live Website](https://comconnect-frontend.onrender.com/) — Try ComConnect online!


## Project Summary

**ComConnect** is a web-based platform for connecting local service seekers and providers through verified accounts, secure communication, and location-based matching. The application focuses on safety, transparency, and efficiency—addressing limitations in platforms like Craigslist or Facebook Marketplace.

---

## Core Features

* Secure user authentication and profile management
* Real-time messaging between users
* Ratings and reviews for trust verification
* Google Maps integration for location-based matching
* Admin dashboard for moderation and analytics

---

## Tech Stack

| Layer           | Technology          |
| --------------- | ------------------- |
| Frontend        | React.js            |
| Backend         | Node.js, Express    |
| Database        | MongoDB             |
| Authentication  | Firebase Auth / JWT |
| Mapping         | Google Maps API     |
| Testing         | Jest, Postman       |
| Version Control | Git, GitHub         |
| Design          | Figma               |

---

## Architecture

* **Frontend:** React.js SPA with component-based architecture and state management
* **Backend:** RESTful API using Node.js and Express
* **Database:** MongoDB (NoSQL, JSON-like schema for flexible data)
* **Authentication:** Token-based with Firebase Auth or JWT
* **Integration:** Google Maps API for proximity-based job discovery

## Structure 

| Folder           | Purpose                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| **client/**      | React frontend — everything users interact with.                                 |
| **server/**      | Node/Express backend — handles API requests and database logic.                  |
| **docs/**        | All design documents (SDD, UML, diagrams, etc.) — great for grading and clarity. |
| **tests/**       | Organized space for unit & integration tests (Jest/Postman).                     |
| **README.md**    | Explains how to install, run, and contribute to the project.                     |

---

## Development Environment

* IDE: Visual Studio Code
* Collaboration: GitHub, Discord, Kanban workflow
* Testing: Jest for unit testing, Postman for API validation

---

## Quick Start

### Local Development

Run the automated setup script:

```bash
bash start-all.sh
```

This will:
- Configure local environment variables automatically
- Start backend (http://localhost:8080)
- Start frontend (http://localhost:5173)
- Open browser to the application

For more details, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)

### Setup Instructions

See [SETUP.md](SETUP.md) for detailed installation and configuration instructions.

### Demo Accounts

See [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md) for test user credentials.

---

## Summary

ComConnect implements a secure, scalable MERN stack architecture to support verified local job listings and service connections. Its modular design allows future expansion into mobile platforms, payment processing, and AI-based recommendations.

