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
- `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/GnoudCRM?retryWrites=true&w=majority`
- `JWT_ACCESS_SECRET=<long random secret>`
- `JWT_REFRESH_SECRET=<long random secret>`
- `PASSWORD_RESET_SECRET=<long random secret>`

Build settings:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/api/health`

Do not commit real database credentials. If a MongoDB URI has been shared in
chat, rotate the database user's password in MongoDB Atlas and update Render.

Auth endpoints are available under:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
