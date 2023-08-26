// server.mjs
import express from 'express'
import { resolve } from 'path'
import { cwd } from './common.js'

const app = express()
const port = process.env.PORT || 3000

// Define the path to the public folder
const publicFolderPath = resolve(cwd, 'public')

// Set up middleware to serve static files from the public folder
app.use(express.static(publicFolderPath))

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`)
})
