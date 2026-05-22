# Social Workflow Builder

A modern, visual, node-based workflow builder designed to automate social media interactions, content generation, and logic-based operations using artificial intelligence. 

## 🚀 Features

- **Visual Node Editor:** Drag-and-drop interface powered by React Flow with custom pill-shaped node designs.
- **Inline Insertion:** Seamlessly add new nodes mid-flow with intelligent edge insertion buttons (`+`).
- **AI Integrations:** Native support for Google Gemini and Anthropic Claude for dynamic content generation.
- **Knowledge Base:** Vector database integration for storing and querying documents, enabling RAG (Retrieval-Augmented Generation) within your workflows.
- **Robust Backend:** Runs completely on Firebase Cloud Functions (v2) with background task queues and scheduling.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Flow, Zustand (State Management)
- **Backend:** Node.js 22, Firebase Cloud Functions (v2), Firestore, Firebase Cloud Tasks
- **Integrations:** Google Gemini SDK, Twitter API, Telegram Bot API, Pinecone/Firebase Vector DB

## 💻 Getting Started

### Prerequisites
- Node.js v22+
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project configured (`my-portfolio-7cd72`)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Oladizz/social-workflow.git
   cd social-workflow
   ```

2. **Install frontend dependencies & run:**
   ```bash
   npm install
   npm run dev
   ```

3. **Install backend dependencies:**
   ```bash
   cd functions
   npm install
   ```

## ☁️ Deploying Firebase Functions

Due to common local network restrictions blocking Google Cloud APIs, deploying Firebase Functions directly from some local networks can fail or time out. 

The easiest and most reliable way to deploy is using **Google Cloud Shell**:

1. Go to [Google Cloud Shell](https://shell.cloud.google.com/).
2. Run the following commands:
   ```bash
   git clone https://github.com/Oladizz/social-workflow.git
   cd social-workflow
   firebase deploy --only functions
   ```

## 🎨 UI/UX Highlights
- **Pill Nodes:** Fully responsive, space-efficient horizontal nodes.
- **Command Palette:** Intelligent command menu for inserting logic, AI, and action nodes.
- **Execution Badges:** Real-time visual feedback on workflow nodes during execution (Pending, Running, Completed, Failed).

## 📄 License
This project is licensed under the MIT License.
