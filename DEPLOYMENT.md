# Deployment

## Frontend: Vercel

Project URL:

- `https://machinery-resource-management-syste.vercel.app`

Required environment variables:

- `NEXT_PUBLIC_API_BASE_URL=https://machinery-api.onrender.com`

Build settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Install command: `npm install`

## Backend: Render

Service URL:

- `https://machinery-api.onrender.com`

Required environment variables:

- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://machinery-resource-management-syste.vercel.app`
- `MONGODB_URI=<your MongoDB Atlas connection string>`

Build settings:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/api/health`

Do not commit real database credentials. If a MongoDB URI has been shared in
chat, rotate the database user's password in MongoDB Atlas and update Render.
