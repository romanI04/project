
# HabitForge AI - Personal AI Habit Coach

A modern, AI-powered habit-building application that helps users develop and maintain healthy habits through intelligent coaching and progress tracking.

## Features

- 🤖 **AI-Powered Coaching**: Personalized habit recommendations and adaptive plans
- 📊 **Progress Tracking**: Visual streak tracking and habit analytics
- 💬 **Conversational Interface**: Natural chat-based interaction with your AI coach
- 🌙 **Dark Mode Design**: Sleek, modern UI inspired by premium AI platforms
- 📱 **Mobile Responsive**: Works perfectly on all devices
- ⚡ **Real-time Updates**: Instant progress synchronization
- 🔐 **Secure Authentication**: User accounts and data protection

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React Hooks + Context
- **Routing**: React Router v6
- **Backend Ready**: Supabase integration structure
- **AI Ready**: OpenAI API integration structure

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd habitforge-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional for demo):
```bash
cp .env.example .env.local
```

Add your API keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:8080`

## Demo Mode

The application works out-of-the-box in demo mode with:
- Mock authentication (any email/password works)
- Simulated AI responses
- Local storage for persistence
- Sample progress data

## Production Setup

### Supabase Integration

1. Create a Supabase project
2. Set up authentication (Email/Password)
3. Create the database schema:

```sql
-- Users progress tracking
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  log TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progress
CREATE POLICY "Users can access own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);
```

### OpenAI Integration

1. Get an OpenAI API key
2. Replace the mock AI responses in `ChatInterface.tsx` with real API calls
3. Add error handling and rate limiting

### Deployment

#### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Manual Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatInterface.tsx    # Main chat component
│   ├── ChatHistory.tsx      # Sidebar chat history
│   ├── ProgressPanel.tsx    # Progress tracking panel
│   └── DashboardHeader.tsx  # Dashboard navigation
├── pages/              # Route components
│   ├── Index.tsx           # Landing page
│   ├── Auth.tsx            # Authentication
│   ├── Dashboard.tsx       # Main application
│   └── NotFound.tsx        # 404 page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── components/ui/      # shadcn/ui components
```

## Customization

### Branding
- Update colors in `src/index.css`
- Replace logo/icons in components
- Modify app name in `index.html`

### AI Responses
- Replace mock responses in `ChatInterface.tsx`
- Add OpenAI API integration
- Implement custom prompt engineering

### Database Schema
- Extend Supabase tables for more features
- Add user preferences
- Implement habit categories

## Performance Optimizations

- Lazy loading for route components
- Image optimization for assets
- Bundle size optimization with Vite
- Efficient re-rendering with React.memo

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast color scheme
- Focus management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- GitHub Issues
- Documentation: [Your docs URL]
- Community: [Your community URL]

---

Built with ❤️ using React, TypeScript, and modern web technologies.
```

Now let me create an environment variables example file:

<lov-write file_path=".env.example">
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Optional: Custom API endpoints
VITE_API_BASE_URL=https://your-api-domain.com

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id
