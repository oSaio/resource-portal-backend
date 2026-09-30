# IT Equipment & Resource Management Portal

A full-stack web application built with Node.js, Express, and SQLite for tracking hardware inventory and handling equipment reservation requests.

## Features
- **Resource Catalog**: Dynamic fetching and display of available hardware and rooms.
- **Reservation System**: Form submission that records booking requests in a relational database.
- **Admin Dashboard**: Live management table to view and delete active booking records.
- **RESTful API**: Standardized endpoints supporting GET, POST, and DELETE HTTP methods.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: SQLite (`better-sqlite3`)
- **Frontend**: HTML5, JavaScript (Fetch API), CSS

## API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/resources` | Fetch all available assets |
| `POST` | `/api/bookings` | Create a new equipment booking |
| `GET` | `/api/bookings` | Fetch all submitted bookings |
| `DELETE` | `/api/bookings/:id` | Remove a booking by ID |

## How to Run Locally
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install