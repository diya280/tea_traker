# Tea Consumption Tracker (MEAN)

A monthly tea-consumption tracker built with Angular, Express, Node.js and MongoDB.

## Requirements
- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas connection string
- Angular CLI 18+

## 1. Start the backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
The API runs at http://localhost:5000. Set `MONGODB_URI` in `.env`.

## 2. Start the Angular frontend
```bash
cd frontend
npm install
npm start
```
Open http://localhost:4200.

## Features
- Add, edit and delete tea records
- Record date, person, tea count and optional remarks
- Filter records by month/year and search by person
- Monthly total, people count and per-person totals
- Export the currently filtered records to CSV

## API
- `GET /api/tea?month=11&year=2026&search=diya`
- `POST /api/tea`
- `PUT /api/tea/:id`
- `DELETE /api/tea/:id`
- `GET /api/tea/summary?month=11&year=2026`
- `GET /api/health`

A record represents one person's tea count on one date. Multiple records for the same person and date are allowed (for example, separate entries during the day); the dashboard sums them.
