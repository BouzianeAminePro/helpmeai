import { render } from 'preact'
import App from './app.jsx'

import './index.css'
import './libs/posthug.js';

render(
    <App />
    ,
    document.getElementById('app')
)
