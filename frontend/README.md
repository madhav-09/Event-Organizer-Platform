# Event Organizer Platform - Frontend

This is the React-based frontend for the **Event Organizer Platform**. It follows a modern, dark-themed glassmorphic design and interacts with the FastAPI backend.

## 🛠️ Tech Stack

- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router 7
- **Icons**: Lucide React & React Icons
- **Animations**: Framer Motion
- **Data Fetching**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1.  Navigate to the directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

- `src/components`: UI components like Navbar, HeroSearch, CategoryFilter, etc.
- `src/pages`: Main view components (Home, Dashboard, EventDetails).
- `src/layout`: Wrapper layouts (PublicLayout, OrganizerLayout).
- `src/services`: API client and endpoint configurations.
- `src/context`: Authentication and application-wide state.

## ⚙️ Configuration

The frontend connects to the backend API via the configuration in `src/services/api.ts`. Ensure your backend is running at the correct address (default: `http://localhost:8000`).

---

## 🏗️ Building for Production

To create a production build:
```bash
npm run build
```
The output will be in the `dist/` directory.
