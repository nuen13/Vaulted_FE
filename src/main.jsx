import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // 1. Import the Provider
import { store } from './app/store';    // 2. Import your configured store
import App from './App.jsx';
import SignInGate from './auth/sign-in-gate.jsx';
import './index.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SignInGate>
      <Provider store={store}>
        <App />
      </Provider>
    </SignInGate>
  </React.StrictMode>
);

