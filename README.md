# SyncTrader: Interactive Broker Sync Demo

[cloudflarebutton]

SyncTrader is a visually stunning, minimalist web application designed to demonstrate the core functionalities of a library like 'ib-insync' for interacting with the Interactive Brokers trading platform. The application provides a simulated, real-time trading dashboard experience, allowing users to visualize portfolio management, market data subscriptions, and order placements. All data is mocked on the frontend to create a safe yet realistic demonstration environment. The UI is built with a focus on clarity, responsiveness, and aesthetic excellence, featuring a clean, dark-themed interface ideal for financial applications.

## Key Features

- **Simulated Trading Dashboard**: A realistic, dark-themed interface for demonstrating trading concepts without financial risk.
- **Portfolio Management**: View mock positions with dynamically updating, randomized Profit & Loss (P&L) data.
- **Live Market Data**: Subscribe to stock tickers and watch simulated real-time price updates.
- **Order Management**: A complete workflow to place, view, and manage mock orders.
- **Fully Client-Side**: All logic and data simulation happens in the browser, requiring no backend setup.
- **Responsive Design**: A flawless user experience across desktop, tablet, and mobile devices.
- **Visually Polished**: Built with a focus on aesthetic excellence, smooth animations, and a professional user interface.

## Technology Stack

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/synctrader_ib_sync_demo.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd synctrader_ib_sync_demo
    ```

3.  **Install dependencies:**
    ```bash
    bun install
    ```

4.  **Run the development server:**
    ```bash
    bun dev
    ```

The application will be available at `http://localhost:3000`.

## Development

The application is a single-page dashboard located in `src/pages/HomePage.tsx`. All state management and mock data simulation logic is centralized in the Zustand store at `src/lib/trader-store.ts`.

- **UI Components**: All UI is built using pre-configured `shadcn/ui` components, which can be found in `src/components/ui`.
- **Styling**: Custom styles and theme variables are defined in `tailwind.config.js` and `src/index.css`.

## Deployment

This project is configured for seamless deployment to Cloudflare Workers.

### One-Click Deploy

You can deploy this application to your own Cloudflare account with a single click.

[cloudflarebutton]

### Manual Deployment via Wrangler

1.  **Login to Wrangler:**
    ```bash
    bunx wrangler login
    ```

2.  **Build and deploy the application:**
    ```bash
    bun run deploy
    ```

This command will build the Vite frontend, bundle the worker script, and deploy it to your Cloudflare account.