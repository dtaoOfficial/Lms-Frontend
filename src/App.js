import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";

// --- NEW IMPORTS ---
import { ThemeProvider } from "./context/ThemeContext";
import Footer from "./components/Footer";
// -------------------

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        {/* Wrap everything in the ThemeProvider */}
        <ThemeProvider>
          {/* Use a div to ensure footer is pushed down */}
          <div className="flex min-h-screen flex-col">
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>

          {/* 🔔 Global Toast System (Updated for themes) */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              // These styles now use your CSS variables from index.css
              style: {
                background: "rgb(var(--color-bg-secondary))",
                color: "rgb(var(--color-text-primary))",
                fontSize: "0.9rem",
                borderRadius: "10px",
                padding: "10px 14px",
                border: "1px solid rgb(var(--color-accent) / 0.5)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e", // Keep success green
                  secondary: "rgb(var(--color-bg-secondary))",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444", // Keep error red
                  secondary: "rgb(var(--color-bg-secondary))",
                },
              },
            }}
          />
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
}