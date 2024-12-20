import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './routes';
import { ThemeProvider } from '@emotion/react';
import theme from './styles/GlobalStyles';
import { store } from './api/store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
