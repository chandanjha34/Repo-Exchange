import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";

// Validate required environment variables
if (!import.meta.env.VITE_PRIVY_APP_ID) {
  const errorMessage = 
    'VITE_PRIVY_APP_ID environment variable is required. ' +
    'Please set it in your .env file. ' +
    'Get your App ID from the Privy Dashboard: https://dashboard.privy.io/';
  
  // Display error in the DOM for better visibility
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h1 style="color: #ef4444; margin-bottom: 16px;">Configuration Error</h1>
        <p style="color: #6b7280; max-width: 500px;">${errorMessage}</p>
      </div>
    `;
  }
  throw new Error(errorMessage);
}

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID}
    config={{
      appearance: {
        theme: 'dark',
        accentColor: '#10b981',
        logo: '/favicon.ico',
        // Hide external wallet options by providing empty wallet list
        walletList: [],
      },
      embeddedWallets: {
        ethereum: {
          createOnLogin: 'all-users',
        },
      },
    }}
  >
    <App />
  </PrivyProvider>
);
