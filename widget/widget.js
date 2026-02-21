(function () {
  'use strict'
  const script = document.currentScript
  const token = script?.getAttribute('data-persona') || script?.getAttribute('data-token') || ''
  const apiBase = script?.getAttribute('data-api') || (window.TOOLSTOY_API_URL || 'https://e4h1e44ubh.execute-api.us-east-1.amazonaws.com').replace(/\/$/, '')

  if (!token) return

  let config = { name: 'Character', greeting: 'Hi. How can I help?', layout: 'side-by-side', position: 'bottom-right' }
  let sessionId = 'sess_' + Math.random().toString(36).slice(2)
  let open = false
  let shadowRoot = null

  function loadConfig() {
    fetch(apiBase + '/api/widget/load?token=' + encodeURIComponent(token))
      .then((r) => r.json())
      .then((data) => { config = data })
      .catch(() => {})
  }

  function sendChat(message, callback) {
    fetch(apiBase + '/api/widget/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        message,
        session_id: sessionId,
        page_context: { url: location.href, page_type: 'other' },
      }),
    })
      .then((r) => r.json())
      .then((data) => callback(data.reply || ''))
      .catch(() => callback('Sorry, I could not respond right now.'))
  }

  function render() {
    const host = document.createElement('div')
    host.id = 'toolstoy-widget'
    document.body.appendChild(host)
    shadowRoot = host.attachShadow({ mode: 'closed' })
    shadowRoot.innerHTML = `
<style>
*{box-sizing:border-box}
#toolstoy-root{font-family:Inter,system-ui,sans-serif;position:fixed;z-index:999999;--tt-bg:#fff;--tt-border:#E5E7EB;--tt-text:#1A1A1A;--tt-muted:#6B7280}
#toolstoy-launcher{width:60px;height:60px;border-radius:50%;background:#1A1A1A;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15)}
#toolstoy-launcher:hover{opacity:.9}
#toolstoy-launcher img{width:40px;height:40px;border-radius:50%;object-fit:cover}
#toolstoy-launcher svg{width:28px;height:28px}
#toolstoy-panel{position:absolute;bottom:75px;right:0;width:380px;max-width:95vw;height:480px;background:var(--tt-bg);border:1px solid var(--tt-border);border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.12);display:flex;flex-direction:column;overflow:hidden}
#toolstoy-panel[data-pos="bottom-left"]{left:0;right:auto}
#toolstoy-header{padding:12px 16px;border-bottom:1px solid var(--tt-border);display:flex;align-items:center;gap:10px;background:#F5F5F5}
#toolstoy-header span{font-weight:600;font-size:14px;color:var(--tt-text)}
#toolstoy-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
#toolstoy-messages .msg{max-width:85%;padding:10px 14px;border-radius:8px;font-size:14px;line-height:1.4}
#toolstoy-messages .msg.user{align-self:flex-end;background:#1A1A1A;color:#fff}
#toolstoy-messages .msg.assistant{align-self:flex-start;background:#F5F5F5;color:var(--tt-text)}
#toolstoy-input-wrap{display:flex;gap:8px;padding:12px;border-top:1px solid var(--tt-border)}
#toolstoy-input{flex:1;border:1px solid var(--tt-border);border-radius:8px;padding:10px 14px;font-size:14px;outline:none}
#toolstoy-input:focus{border-color:#1A1A1A}
#toolstoy-send{background:#1A1A1A;color:#fff;border:none;border-radius:8px;padding:10px 16px;font-weight:600;font-size:13px;cursor:pointer}
#toolstoy-send:hover{opacity:.9}
#toolstoy-send:disabled{opacity:.5;cursor:not-allowed}
</style>
<div id="toolstoy-root">
  <button id="toolstoy-launcher" aria-label="Open chat">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
  </button>
  <div id="toolstoy-panel" data-pos="${config.position}" style="display:none">
    <div id="toolstoy-header"><span>${config.name}</span></div>
    <div id="toolstoy-messages"></div>
    <div id="toolstoy-input-wrap">
      <input id="toolstoy-input" type="text" placeholder="Type a message..." />
      <button id="toolstoy-send">Send</button>
    </div>
  </div>
</div>
`
    const root = shadowRoot.querySelector('#toolstoy-root')
    const launcher = shadowRoot.querySelector('#toolstoy-launcher')
    const panel = shadowRoot.querySelector('#toolstoy-panel')
    const messages = shadowRoot.querySelector('#toolstoy-messages')
    const input = shadowRoot.querySelector('#toolstoy-input')
    const sendBtn = shadowRoot.querySelector('#toolstoy-send')

    const pos = (config.position || 'bottom-right').toLowerCase().replace(/\s/g, '-')
    root.style[pos.includes('right') ? 'right' : 'left'] = '20px'
    root.style[pos.includes('bottom') ? 'bottom' : 'top'] = '20px'

    function addMsg(text, type) {
      const div = document.createElement('div')
      div.className = 'msg ' + type
      div.textContent = text
      messages.appendChild(div)
      messages.scrollTop = messages.scrollHeight
    }

    addMsg(config.greeting, 'assistant')

    launcher.addEventListener('click', function () {
      open = !open
      panel.style.display = open ? 'flex' : 'none'
      if (open) input.focus()
    })

    function doSend() {
      const text = (input.value || '').trim()
      if (!text) return
      input.value = ''
      sendBtn.disabled = true
      addMsg(text, 'user')
      sendChat(text, function (reply) {
        addMsg(reply, 'assistant')
        sendBtn.disabled = false
      })
    }

    sendBtn.addEventListener('click', doSend)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSend()
    })
  }

  loadConfig()
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render)
  } else {
    render()
  }
})()
