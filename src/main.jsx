import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles.css";
import { ThemeProvider } from "./lib/ThemeContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
);
