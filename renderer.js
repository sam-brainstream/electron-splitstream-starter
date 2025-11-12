const container = document.getElementById('transcripts')

window.electronAPI.onTranscript((text) => {
  const line = document.createElement('div')
  line.textContent = text
  container.appendChild(line)
  container.scrollTop = container.scrollHeight
})
