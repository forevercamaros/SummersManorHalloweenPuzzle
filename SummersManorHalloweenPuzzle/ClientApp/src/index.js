import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { unregister } from './registerServiceWorker';
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #ff6b1a;
    --secondary-color: #8b0000;
    --background-color: #0a0a0a;
    --text-color: #dedede;
    --accent-color: #2cba3f;
    --shadow-color: rgba(255, 107, 26, 0.2);
  }

  body {
    background: var(--background-color);
    color: var(--text-color);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
    position: relative;
    
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 100%),
        repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255, 107, 26, 0.03) 1px, rgba(255, 107, 26, 0.03) 2px);
      pointer-events: none;
      z-index: 1;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-weight: bold;
    color: var(--primary-color);
    text-shadow: 2px 2px 4px var(--shadow-color);
  }

  button {
    background: var(--secondary-color);
    color: var(--text-color);
    border: 2px solid var(--primary-color);
    padding: 0.5em 1em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: bold;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow-color);
    }
  }

  input, textarea {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid var(--primary-color);
    color: var(--text-color);
    padding: 0.5em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    
    &:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 8px var(--shadow-color);
    }
  }

  .container {
    position: relative;
    z-index: 2;
  }

  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .flicker {
    animation: flicker 2s infinite;
  }

  .float {
    animation: float 6s ease-in-out infinite;
  }
`

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <BrowserRouter basename={baseUrl}>
    <GlobalStyle />
    <App />
  </BrowserRouter>
);

unregister();

