/**
 * entry file for install page
 */
import { createRoot } from 'react-dom/client'
import React from 'react'
import App from './index.jsx'
import '../css/basic.styl'
import '../css/home.styl'

const root = createRoot(document.getElementById('container'))
root.render(<App />)
