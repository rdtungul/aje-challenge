import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.scss';
import App from './AppRoot';

const rootNode = createRoot(document.getElementById('app'));
rootNode.render(<App />);
