# React + TypeScript + Vite + Tailwind CSS + shadcn/ui Login Component

A modern React application built with TypeScript, Vite, Tailwind CSS, and shadcn/ui components featuring a beautiful login form.

## 🚀 Features

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent design
- **Responsive design** that works on all devices
- **Form validation** and state management
- **Beautiful UI** with modern design patterns

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- Radix UI primitives

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── card.tsx
│   └── Login.tsx     # Main login component
├── lib/
│   └── utils.ts      # Utility functions
├── App.tsx           # Main app component
├── index.css         # Global styles with Tailwind
└── main.tsx          # Entry point
```

## 🎨 Components

### Login Component
The main login component includes:
- Email and password input fields with icons
- Show/hide password functionality
- Remember me checkbox
- Forgot password link
- Sign up link
- Loading states
- Form validation
- Responsive design

### UI Components
Built using shadcn/ui patterns:
- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Input**: Styled input fields with focus states
- **Label**: Accessible form labels
- **Card**: Container components for layout

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Tailwind CSS
The project is configured with Tailwind CSS including:
- Custom color variables for shadcn/ui
- Responsive design utilities
- Custom border radius values

### shadcn/ui
Components follow shadcn/ui patterns with:
- Consistent styling system
- CSS variables for theming
- TypeScript support
- Accessibility features

## 🚀 Customization

### Colors
Modify the CSS variables in `src/index.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... other variables */
}
```

### Components
All UI components can be customized by modifying their respective files in `src/components/ui/`.

## 📱 Responsive Design

The login form is fully responsive and includes:
- Mobile-first design approach
- Flexible layouts that adapt to screen sizes
- Touch-friendly input fields
- Optimized spacing for different devices

## 🔒 Security Features

- Form validation
- Secure password input
- CSRF protection ready
- Input sanitization ready

## 🧪 Testing

To add testing to your project:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## 📦 Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

If you have any questions or need help, please open an issue on GitHub.
