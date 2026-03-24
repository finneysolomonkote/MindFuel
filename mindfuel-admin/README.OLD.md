# MindFuel Admin Panel

Admin dashboard for managing the MindFuel AI platform - Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **User Management**: View and manage all users
- **Content Management**:
  - Workbooks (CRUD operations)
  - Products (CRUD operations)
  - Quotes management
- **AI Configuration**: Manage AI settings and prompts
- **Analytics Dashboard**: Platform-wide analytics and insights
- **Order Management**: View and process orders
- **Secure Authentication**: Admin-only access with JWT tokens

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Components**: Headless UI
- **Icons**: Lucide React

## Project Structure

```
mindfuel-admin/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorAlert.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layouts/         # Layout components
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/           # Page components
│   │   ├── auth/        # Login page
│   │   ├── dashboard/   # Dashboard home
│   │   ├── users/       # User management
│   │   ├── workbooks/   # Workbook management
│   │   ├── products/    # Product management
│   │   ├── orders/      # Order management
│   │   ├── quotes/      # Quote management
│   │   ├── ai/          # AI configuration
│   │   └── analytics/   # Analytics dashboard
│   ├── services/        # API service layer
│   │   └── api.ts       # Axios configuration
│   ├── store/           # Redux store
│   │   ├── index.ts
│   │   └── slices/      # Redux slices
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Installation

### 1. Install Dependencies

```bash
cd mindfuel-admin
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MindFuel Admin
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment

### Static Hosting (Vercel, Netlify, etc.)

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider.

### Docker

```bash
docker build -t mindfuel-admin .
docker run -p 80:80 mindfuel-admin
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name admin.mindfuel.ai;

    root /var/www/mindfuel-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)
- `VITE_APP_NAME` - Application name

## Admin Features

### Dashboard
- Platform statistics
- Recent activities
- Quick actions

### User Management
- List all users
- View user details
- Search and filter users
- User activity tracking

### Content Management

**Workbooks:**
- Create new workbooks
- Edit workbook details
- Upload workbook content
- Set pricing and availability

**Products:**
- Manage product catalog
- Set pricing
- Inventory management
- Product categories

**Quotes:**
- Add daily quotes
- Schedule quote delivery
- Categorize quotes

### AI Configuration
- Configure AI prompts
- Set model parameters
- View AI usage statistics

### Analytics
- User growth metrics
- Content engagement
- Revenue analytics
- Popular content

### Order Management
- View all orders
- Order status tracking
- Payment verification
- Refund processing

## Authentication

Admin users must log in with valid credentials. The app stores JWT tokens in localStorage for authentication.

Protected routes automatically redirect to login if the user is not authenticated.

## Security

- JWT-based authentication
- Protected routes
- HTTP-only cookies (recommended for production)
- CORS configuration
- Input validation

## Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `DashboardLayout.tsx`

### Adding New API Endpoints

1. Add service method in `src/services/api.ts`
2. Create Redux slice if needed
3. Use in components with hooks

### Styling

This project uses Tailwind CSS. Customize the theme in `tailwind.config.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues and questions, contact the development team.
