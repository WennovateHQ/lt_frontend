# LocalTalents.ca - Frontend Application

A modern Next.js application for connecting Canadian businesses with local technical talent.

## 🚀 Features

### Landing Pages
- **Business Landing Page** - Showcase platform benefits for businesses
- **Talent Landing Page** - Highlight opportunities for local specialists
- **Modern Design** - Clean, professional UI with Canadian branding
- **Responsive Layout** - Mobile-first design that works on all devices

### Authentication System
- **Dual Registration** - Separate flows for businesses and talent
- **Secure Login** - JWT-based authentication with refresh tokens
- **Role-based Access** - Different dashboards based on user type
- **Form Validation** - Comprehensive client-side validation with Zod

### Business Dashboard
- **Project Management** - Create, edit, and manage project postings
- **Application Review** - View and manage talent applications
- **Contract Management** - Track active contracts and payments
- **Analytics** - Dashboard with key metrics and insights

### Talent Dashboard
- **Opportunity Discovery** - Browse and search local projects
- **Smart Matching** - AI-powered project recommendations
- **Application Tracking** - Monitor application status and responses
- **Profile Management** - Showcase skills and experience

### UI Components
- **Design System** - Consistent, reusable components
- **Tailwind CSS** - Utility-first styling with custom theme
- **Accessibility** - WCAG compliant components
- **Dark Mode Ready** - Prepared for future dark mode implementation

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Components
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod validation
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **Build Tool**: Next.js built-in bundler

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── business/
│   │   │   ├── projects/
│   │   │   ├── contracts/
│   │   │   └── page.tsx
│   │   ├── talent/
│   │   │   ├── opportunities/
│   │   │   ├── applications/
│   │   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/              # Public marketing pages
│   │   ├── for-talent/
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── forms/                    # Form components
│   │   └── project-form.tsx
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── landing/                  # Landing page sections
│       ├── business-hero-section.tsx
│       ├── talent-hero-section.tsx
│       └── ...
├── lib/                          # Utilities and configuration
│   ├── api/                      # API client
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # TypeScript types
│   ├── utils.ts                  # Utility functions
│   └── providers.tsx             # App providers
└── public/                       # Static assets
    └── logo.png
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- LocalTalent Backend API running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LocalTalent-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎨 Design System

### Colors
- **Primary Blue**: `#2563eb` - Trust, professional, technology
- **Success Green**: `#16a34a` - Success states, talent branding
- **Accent Red**: `#dc2626` - Canadian identity, alerts
- **Neutral Grays**: Various shades for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-800)
- **Body Text**: Regular (400) and medium (500)
- **Responsive Scaling**: Mobile-first approach

### Components
All components follow consistent patterns:
- Proper TypeScript interfaces
- Forwarded refs where applicable
- Variant-based styling with CVA
- Accessible by default

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Style
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting
- **TypeScript** - Strict type checking
- **Tailwind** - Utility-first CSS

### Component Development
1. Create component in appropriate directory
2. Export from index file if needed
3. Add TypeScript interfaces
4. Include proper documentation
5. Test responsive behavior

## 🌐 API Integration

### Authentication
- JWT tokens stored in localStorage
- Automatic token refresh
- Protected route handling
- User context management

### Data Fetching
- React Query for server state
- Optimistic updates where appropriate
- Error handling and retry logic
- Loading states

### Error Handling
- Global error boundaries
- Form validation errors
- API error responses
- User-friendly messages

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0-640px
- **Tablet**: 641-1024px
- **Desktop**: 1025px+

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized performance

## 🚀 Deployment

### Build Process
```bash
npm run build
npm run start
```

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- Additional variables as needed

### Performance Optimization
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Bundle analysis available
- SEO optimization built-in

## 🔒 Security

### Authentication
- JWT token management
- Secure HTTP-only cookies (future)
- CSRF protection
- XSS prevention

### Data Validation
- Client-side validation with Zod
- Server-side validation required
- Sanitized user inputs
- Type-safe API calls

## 🧪 Testing

### Testing Strategy
- Unit tests for utilities
- Component testing with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright (future)

### Quality Assurance
- TypeScript for type safety
- ESLint for code quality
- Prettier for consistency
- Accessibility testing

## 📈 Performance

### Optimization Techniques
- Next.js Image optimization
- Dynamic imports for code splitting
- React Query for efficient data fetching
- Tailwind CSS purging for smaller bundles

### Monitoring
- Core Web Vitals tracking
- Error monitoring setup ready
- Performance budgets
- Bundle size monitoring

## 🤝 Contributing

1. Follow the established code style
2. Write TypeScript interfaces
3. Include proper error handling
4. Test responsive behavior
5. Update documentation as needed

## 📄 License

This project is proprietary to LocalTalents.ca

---

**LocalTalents.ca** - Connecting Canadian businesses with local technical talent 🇨🇦
