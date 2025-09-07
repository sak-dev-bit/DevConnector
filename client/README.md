# DevConnector Frontend

This is the frontend application for DevConnector, a developer social network platform. Built with React and Vite for a fast, modern development experience.

## Features

- User authentication and registration
- User profiles with skills and experience
- Post feed with CRUD operations
- Interactive features: likes, comments, follow/unfollow
- Real-time updates using Socket.IO
- Responsive design

## Technologies Used

- **React**: Component-based UI library
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Socket.IO Client**: Real-time communication
- **CSS**: Styling with custom CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- The backend server running (see main README)

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` (default Vite port)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

- `src/components/` - React components
- `src/context/` - React context for state management
- `src/services/` - API service functions
- `src/assets/` - Static assets
- `public/` - Public assets

## Contributing

Please refer to the main project README for contribution guidelines.
