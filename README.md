# 🎯 Risk Sniper

**Professional Prop Trading Risk Management Calculator**

A commercial-grade, mobile-first web application for calculating optimal position sizes and managing risk in prop trading. Built with React, TypeScript, and Tailwind CSS.

---

## ✨ Features

### 📊 Core Functionality
- **Position Size Calculator**: Automatically calculate optimal lot sizes based on account balance, risk percentage, and stop loss
- **Multi-Asset Support**: Forex, Gold, Indices, and Crypto with accurate pip values
- **Drawdown Simulator**: Visualize account balance after 1 and 5 consecutive losses
- **Real-time Validation**: Instant feedback with warnings for high-risk trades (>2%)

### 💾 User Retention
- **Auto-Save**: Your last settings are automatically saved using localStorage
- **Trade History**: Save and restore up to 10 recent calculations
- **Persistent State**: Never lose your data - everything is stored locally

### 🎨 UI/UX
- **Cyberpunk Financial Theme**: Deep dark backgrounds (#0a0a0a) with neon accents
- **Mobile-First Design**: Optimized for touch with 44px+ touch targets
- **Bottom Navigation**: Easy thumb-zone navigation on mobile
- **Animated Feedback**: Count-up animations and visual warnings

### ⚡ Performance
- **Lightweight**: ~243KB gzipped JavaScript bundle
- **Fast**: Built with Vite for instant hot reload
- **Type-Safe**: 100% TypeScript for reliability
- **Tested**: Comprehensive unit tests with Vitest

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 Usage

1. **Calculator Tab**
   - Enter your account balance
   - Set risk percentage (defaults: 0.5%, 1%, 2%)
   - Input stop loss in pips
   - Select asset class
   - Get instant position size calculation

2. **History Tab**
   - View your last 10 calculations
   - Restore previous settings with one tap
   - Delete individual items or clear all

3. **Settings Tab**
   - Learn about the calculation formula
   - Understand how data is stored
   - Access resources

---

## 🧮 Calculation Formula

```
Money at Risk = Account Balance × Risk %
Lot Size = Money at Risk ÷ (Stop Loss Pips × Pip Value)
```

### Pip Values (per Standard Lot)
- **Forex**: $10
- **Gold (XAUUSD)**: $10
- **Indices**: $1 (average)
- **Crypto**: $10

---

## 🧪 Testing

The calculator includes comprehensive unit tests:

```bash
npm test
```

### Test Coverage
- ✅ Accurate lot size calculations
- ✅ Multi-asset support verification
- ✅ Edge case handling (invalid inputs)
- ✅ Drawdown simulation accuracy
- ✅ Formatting utilities

**Example Test Case**:
- 100k account, 1% risk, 10 pip SL on EURUSD = **10 Standard Lots** ✓

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 |
| **Language** | TypeScript 5 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand (with persist) |
| **Icons** | Lucide React |
| **Testing** | Vitest |
| **Deployment** | Netlify (serverless) |

---

## 📦 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── Calculator.tsx    # Main calculator UI
│   │   ├── History.tsx       # Trade history list
│   │   └── Settings.tsx      # Info and settings
│   ├── store/
│   │   └── useStore.ts       # Zustand store with persistence
│   ├── utils/
│   │   ├── calculator.ts     # Core calculation logic
│   │   └── calculator.test.ts # Unit tests
│   ├── lib/
│   │   └── utils.ts          # Utility functions (cn, etc.)
│   ├── App.tsx               # Main app with navigation
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Design System

### Colors
```css
Background Primary: #0a0a0a
Background Secondary: #111111
Background Tertiary: #1a1a1a

Neon Green (Profit): #00ff88
Neon Red (Loss): #ff0055
Neon Blue: #00d4ff
Neon Purple: #b700ff
Neon Yellow: #ffed00
```

### Typography
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- Input font-size: 16px (prevents iOS zoom)

---

## 📱 Mobile Optimization

- **Viewport**: Fixed viewport with no user scaling
- **Touch Targets**: Minimum 44px height for all interactive elements
- **Input Prevention**: 16px font-size to prevent iOS zoom on focus
- **Keyboard Handling**: Layout doesn't shift when keyboard appears
- **Bottom Navigation**: Thumb-zone optimized (64px height)

---

## ⚠️ Disclaimer

**This tool is for educational purposes only.**

- Not financial advice
- Always consult with a licensed financial advisor
- Past performance does not guarantee future results
- Trading involves risk of loss

---

## 📄 License

ISC

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🐛 Issues

Found a bug? Please open an issue on GitHub.

---

**Built with ❤️ for prop traders worldwide**
