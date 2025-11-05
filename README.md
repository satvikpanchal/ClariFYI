# ClariFYI

A beautiful, minimal web application that simplifies complex text into easy-to-understand explanations!

## Features

### Core Functionality
- **Instant Explanation**: Paste any complex text and get a 2–3 sentence explanation
- **File Upload Support**: Upload PDFs, images, and documents for analysis
- **No Login Required**: Stateless, no data storage
- **One-Click Simplification**: Beautiful, minimal interface focused on clarity

### Customization Options
- **Simplicity Level Slider**: Choose between 9 levels
  - 🧒 Like I'm 5 – Super simple explanations
  - 👶 Like I'm 7 – Simple explanations
  - 🎈 Like I'm 10 – Clear explanations
  - 🎮 Like I'm 15 – Straightforward explanations
  - 📚 High School – Detailed explanations
  - 🎓 College – Comprehensive explanations
  - 💼 Grad – Professional explanations
  - 🔬 Post Grad – Academic explanations
  - 🧠 Expert – Expert-level explanations

- **Tone Selector**: Multiple styles
  - 😊 Friendly – Warm and approachable
  - 🤓 Teacher – Educational and structured
  - 😂 Funny – Light-hearted with humor
  - 🧘 Calm – Poetic and serene
  - 💼 Professional – Business-focused
  - 🎉 Enthusiastic – Energetic and positive
  - ✨ Custom – Define your own tone

### Design Features
- **OpenAI-Style Gradient Background**: Static radial gradients with subtle hue shifts
- **Liquid Glass Effect**: Frosted glass cards with backdrop blur and translucent overlays
- **Premium Aesthetics**: Dark theme with generous whitespace and modern typography
- **Smooth Animations**: Card fade-in, shimmer loading states, and micro-interactions
- **Fully Responsive**: Mobile-first design that works beautifully on all devices

## Tech Stack

- **Frontend**: Pure HTML, CSS, and JavaScript (vanilla JS)
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini 2.5 Flash
- **Typography**: Inter font family

## Project Structure

```
explain_like_im5/
├── index.html      # Main HTML structure
├── styles.css      # All styling with CSS variables
├── script.js       # Frontend interactive functionality
├── api/
│   └── explain.js # Vercel serverless function
├── package.json    # Node.js dependencies
├── vercel.json     # Vercel configuration
└── README.md       # This file
```

## Setup

1. **Install Node.js** (v18 or higher)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Local Development

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Run locally:**
   ```bash
   vercel dev
   ```

3. **Open** `http://localhost:3000` in your browser

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variable in Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key value

### Option 2: Using Vercel Dashboard

1. **Push your code to GitHub** (or GitLab, Bitbucket)

2. **Import project in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure environment variables:**
   - In project settings, add `GEMINI_API_KEY`
   - Set it to your Gemini API key

4. **Deploy** - Vercel will automatically deploy

## Usage

1. **Paste Your Text or Upload File**: 
   - Enter or paste complex text into the textarea
   - Or drag & drop/upload PDFs, images, or documents
   - Or paste a URL - the app will automatically fetch and extract content

2. **Adjust Settings**: 
   - Use the simplicity slider (9 levels: 5 years old to expert)
   - Select a tone style or create a custom tone

3. **Click "Explain It"**: Get your AI-powered simplified explanation

4. **Copy Result**: Use the copy button to save the explanation

### Features
- **URL Support**: Automatically detects and fetches content from URLs
- **File Upload**: Support for PDFs, images, and documents
- **Safety Guardrails**: Built-in content filtering and validation
- **Error Handling**: Clear error messages for API issues
- **Real-time Processing**: Fast responses using Gemini 2.5 Flash

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

## Browser Support

Works in all modern browsers that support:
- CSS `backdrop-filter` (Safari, Chrome, Edge, Firefox)
- CSS Custom Properties (variables)
- ES6+ JavaScript

## License

This project is open source and available for use.

## Credits

Design inspired by Apple's liquid glass aesthetic and OpenAI's gradient blob backgrounds.
