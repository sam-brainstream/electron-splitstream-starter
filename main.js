// main.js
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createSplitstream } from 'splitstream-node'

// --- Load environment variables ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') }) // loads .env in project root

let win

// --- Create the main window ---
const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.loadFile('index.html')
}

// --- When Electron is ready ---
app.whenReady().then(() => {
  createWindow()
  win.webContents.on('did-finish-load', startSplitstream)
})

// --- Splitstream test function ---
function startSplitstream() {
  console.log('🚀 Starting Splitstream test for 60 seconds...')

  const split = createSplitstream({
    deepgram_api_key: process.env.DEEPGRAM_API_KEY,
    model: 'nova-3',
    echo_cancellation: true,
    interim_results: true,
    splitstream_api_key: process.env.SPLITSTREAM_API_KEY,
  })

  split.setAutoRestart(false);

  if (!process.env.DEEPGRAM_API_KEY || !process.env.SPLITSTREAM_API_KEY) {
    console.warn('⚠️ Missing environment variables!')
    console.warn('DEEPGRAM_API_KEY:', process.env.DEEPGRAM_API_KEY)
    console.warn('SPLITSTREAM_API_KEY:', process.env.SPLITSTREAM_API_KEY)
  }

  split.on('transcript', (transcript) => {
    const text = `${transcript.source}: ${transcript.channel.alternatives[0].transcript}`
    console.log(text)
    win.webContents.send('transcript', text)
  })

  split.on('stderr', (line) => console.log('⚠️ stderr:', line))
  split.on('exit', (code) => console.log('💀 exit:', code))

  setTimeout(() => {
    console.log('⏹️ stopping after 60 seconds...')
    split.stop()
  }, 60000)
}

// --- macOS lifecycle cleanup ---
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
