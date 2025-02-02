import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { useEel } from "@/hooks/use-eel";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import registerServiceWorker from "./registerServiceWorker";

import "@/styles/globals.css";
import "./index.css";

const { setupHost } = useEel();

// Set eel host before any rendering
// The host and port should be the same as the one in the backend
// e.g. eel.start('main.py', host='localhost', port=8888) at file index.py
setupHost("localhost", 8888);

const container = document.getElementById("root");
const root = createRoot(container!!);

root.render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster richColors position="bottom-right" />
  </ThemeProvider>,
);

registerServiceWorker();
