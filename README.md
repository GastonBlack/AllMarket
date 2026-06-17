<div align="center">
  <img src="./docs/allmarket-logo.svg" alt="AllMarket logo" width="220" />

  <h1>AllMarket Frontend</h1>

  <p>
    Storefront and admin dashboard for <strong>AllMarket</strong>, an e-commerce portfolio project built with Next.js.
  </p>

  <p>
    <strong>This is not a real place to buy products.</strong><br />
    AllMarket is a portfolio project.
  </p>
</div>

## Overview

AllMarket is a responsive e-commerce frontend connected to the AllMarket API. It includes a public storefront, authentication screens, profile management, cart checkout, order history and an admin dashboard.

The app is designed as a portfolio project: it demonstrates real-world flows such as secure cookie authentication, CSRF handling, product administration, Stripe Checkout redirection and responsive UI patterns.

## Features

- Responsive storefront with home, products, product details, FAQ and contact sections.
- Product search, category filters, price filters, sorting and pagination.
- Cart stored on the client with quantity controls and checkout entry point.
- Authentication pages for login and registration.
- Session recovery using refresh tokens from HTTP-only cookies.
- Automatic CSRF token handling for unsafe API requests.
- Profile page with personal data and password update forms.
- Order history with payment status feedback.
- Admin dashboard for products, categories, users and orders.
- Mobile admin layouts that switch large tables into cards.
- Global notification system for success and error feedback.
- Portfolio disclaimer shown in the footer.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- Lucide React
- ESLint
- Vercel-ready deployment

## Project Structure

```text
allmarket/
|-- public/
|-- src/
|   |-- app/
|   |   |-- (auth)/
|   |   |-- (site)/
|   |   `-- admin/
|   |-- components/
|   |   |-- auth/
|   |   |-- home/
|   |   |-- layout/
|   |   |-- products/
|   |   `-- ui/
|   |-- lib/
|   |-- services/
|   |-- types/
|   `-- utils/
|-- next.config.ts
|-- package.json
`-- tsconfig.json
```

## Requirements

- Node.js 20 or newer
- npm
- Running AllMarket API backend

## Environment Variables

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Then set the backend URL:

```env
API_ORIGIN=http://localhost:5095
```

For deployment, `API_ORIGIN` should point to the public backend URL, for example an HTTPS ngrok domain or another hosted API origin.

## How API Requests Work

The frontend calls relative routes like:

```text
/api/products
/api/auth/login
/api/users/me
```

`next.config.ts` rewrites those requests to `API_ORIGIN`:

```text
/api/:path* -> API_ORIGIN/api/:path*
```

This keeps the browser talking to the same frontend origin while Next.js proxies the request to the backend.

## Authentication And CSRF

The backend stores session tokens in HTTP-only cookies. The frontend does not read the JWT directly.

For unsafe requests (`POST`, `PUT`, `PATCH`, `DELETE`), the Axios client:

1. Requests a CSRF token from `GET /api/auth/csrf`.
2. Sends it in the `X-CSRF-Token` header.
3. Retries protected requests after refreshing the session when a `401` response is received.

API validation and middleware errors are normalized through `getApiError`, so forms can show backend messages.

## Available Scripts

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

Start the production build:

```powershell
npm run start
```

Run lint:

```powershell
npm run lint
```

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Home page with featured categories, product carousels, FAQ and contact |
| `/products` | Product catalog with filters, search, sorting and pagination |
| `/products/[productId]` | Product details and add-to-cart flow |
| `/cart` | Cart review and checkout button |
| `/login` | Sign in page |
| `/register` | Create account page |
| `/profile` | User profile and password update |
| `/orderHistory` | Customer order history and payment result messages |
| `/admin` | Admin dashboard for products, categories, users and orders |

## Deployment

This app is ready to deploy on Vercel.

Recommended Vercel environment variable:

```env
API_ORIGIN=https://your-backend-url.example.com
```

After pushing changes, Vercel builds the frontend and keeps requests proxied through the `/api/*` rewrite.

## Notes

- This frontend is part of a portfolio project, not a production business.
- Stripe should stay in test mode for this project.
- Backend secrets such as Stripe and Cloudinary keys must never be placed in this frontend repository.
