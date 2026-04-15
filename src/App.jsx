import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabase.js'

// ─── CONSTANTES ───────────────────────────────────────────
const VINCULADAS = ['SIX','Lalobit','ed.perma out','EDGAR.PERMA','ARES','Laloshop','edd.perma gmail']
const SERVICIOS  = ['Netflix','Netflix extra','Netflix genérico','HBO HD','HBO 4K','HBO PLATINO','Disney 4K','Disney HD','PRIME','Paramount','VIX','Crunchyroll','Spotify','Spotify 3','ChatGPT gen','ChatGPT+','Office','Office3','Office12','Canva1','Canva12','APPLE ONE','Apple TV','Youtubep1','Youtubep3','ARES1','ARES2','ARES12','IPTVLAT1','IPTVLAT3']

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;600;800;900&display=swap');
  
  :root {
    --bg:       #030712;
    --bg1:      #0a0f1e;
    --bg2:      #0f1629;
    --bg3:      #141d35;
    --border:   #1e2d4a;
    --border2:  #243560;
    --text:     #e2e8f0;
    --text2:    #7b90b8;
    --text3:    #3d5175;
    --cyan:     #00d4ff;
    --green:    #00ff88;
    --orange:   #ff8c00;
    --red:      #ff3366;
    --purple:   #9d4edd;
    --yellow:   #ffd60a;
    --font:     'Outfit', sans-serif;
    --mono:     'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg1); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 700; font-family: var(--mono);
    white-space: nowrap;
  }

  .btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px; border: none;
    font-family: var(--font); font-weight: 600; font-size: 12px;
    cursor: pointer; transition: all .15s; white-space: nowrap;
  }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: var(--cyan); color: var(--bg); }
  .btn-ghost   { background: var(--bg2); color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
  .btn-danger  { background: transparent; color: var(--red); border: 1px solid #ff336630; }
  .btn-danger:hover { background: #ff336615; }
  .btn-success { background: transparent; color: var(--green); border: 1px solid #00ff8830; }
  .btn-success:hover { background: #00ff8815; }
  .btn-renew   { background: transparent; color: var(--cyan); border: 1px solid #00d4ff30; }
  .btn-renew:hover { background: #00d4ff15; }

  input, select {
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px;
    padding: 10px 14px; font-family: var(--font); font-size: 14px;
    outline: none; width: 100%; transition: border-color .15s;
  }
  input:focus, select:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px #00d4ff15; }
  input::placeholder { color: var(--text3); }

  label { font-size: 11px; color: var(--text3); font-weight: 700; letter-spacing: .05em; display: block; margin-bottom: 5px; }

  .card {
    background: var(--bg1);
    border: 1px solid var(--border);
    border-radius: 14px;
    transition: border-color .2s;
  }
  .card:hover { border-color: var(--border2); }
  .card-urgent { border-color: #ff336640; background: #0d0308; }
  .card-warn   { border-color: #ff8c0040; background: #0d0800; }

  .tag {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 6px;
    font-size: 10px; font-weight: 700;
    background: var(--bg3); color: var(--text2);
    border: 1px solid var(--border);
  }
  .tag-vinc { background: #1a0a3d; color: #b794f4; border-color: #6b46c130; }
  .tag-cobrado { background: #0a2d14; color: var(--green); border-color: #00ff8830; }

  .pill {
    padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border);
    font-size: 11px; font-weight: 600; cursor: pointer; background: var(--bg2);
    color: var(--text3); transition: all .15s; white-space: nowrap; flex-shrink: 0;
  }
  .pill:hover { border-color: var(--border2); color: var(--text2); }
  .pill-active { background: var(--cyan); color: var(--bg); border-color: var(--cyan); }
  .pill-vinc-active { background: #1a0a3d; color: #b794f4; border-color: #6b46c1; }

  .slide-up { animation: slideUp .2s ease; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .glow-green { box-shadow: 0 0 20px #00ff8820; }
  .glow-cyan  { box-shadow: 0 0 20px #00d4ff20; }

  .mono { font-family: var(--mono); }

  .scroll-x { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
  .scroll-x::-webkit-scrollbar { display: none; }
`

// ─── UTILS ────────────────────────────────────────────────
const hoy = new Date(); hoy.setHours(0,0,0,0)

function diasRestantes(fecha) {
  if (!fecha) return null
  const f = new Date(fecha + 'T00:00:00')
  f.setHours(0,0,0,0)
  return Math.ceil((f - hoy) / 86400000)
}

function sumarMeses(fecha, meses) {
  const d = new Date(fecha + 'T00:00:00')
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().split('T')[0]
}

function fechaHoy() {
  return hoy.toISOString().split('T')[0]
}

function formatFecha(iso) {
  if (!iso) return '—'
  const [y,m,d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function parseFechaInput(str) {
  // Acepta DD/MM/YYYY o YYYY-MM-DD
  if (!str) return ''
  if (str.includes('/')) {
    const [d,m,y] = str.split('/')
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }
  return str
}

function BadgeDias({ d }) {
  if (d === null) return <span className="badge" style={{background:'#0f1629',color:'#3d5175',border:'1px solid #1e2d4a'}}>—</span>
  if (d < 0)  return <span className="badge" style={{background:'#1a0008',color:'#ff3366',border:'1px solid #ff336630'}}>{Math.abs(d)}d vencido</span>
  if (d === 0)return <span className="badge" style={{background:'#1a0008',color:'#ff3366',border:'1px solid #ff336650'}}>¡HOY!</span>
  if (d <= 3) return <span className="badge" style={{background:'#1a0008',color:'#ff6b6b',border:'1px solid #ff336630'}}>{d} días</span>
  if (d <= 7) return <span className="badge" style={{background:'#1a0800',color:'#ff8c00',border:'1px solid #ff8c0030'}}>{d} días</span>
  if (d <= 15)return <span className="badge" style={{background:'#1a1500',color:'#ffd60a',border:'1px solid #ffd60a30'}}>{d} días</span>
  return <span className="badge" style={{background:'#001a0e',color:'#00ff88',border:'1px solid #00ff8830'}}>{d} días</span>
}

// ─── SELECTOR FECHA ───────────────────────────────────────
const DURACIONES = [
  { label: '1 mes', m: 1 },
  { label: '2 meses', m: 2 },
  { label: '3 meses', m: 3 },
  { label: '6 meses', m: 6 },
  { label: '1 año', m: 12 },
]

function SelectorFecha({ value, onChange, label = 'FECHA VENC. *' }) {
  const [durSel, setDurSel] = useState(null)

  function elegirDuracion(m) {
    setDurSel(m)
    const d = new Date(hoy)
    d.setMonth(d.getMonth() + m)
    onChange(d.toISOString().split('T')[0])
  }

  function elegirCalendario(v) {
    setDurSel(null)
    onChange(v)
  }

  return (
    <div>
      <label>{label}</label>
      {/* Botones de duración */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {DURACIONES.map(({ label: l, m }) => (
          <button key={m} type="button" onClick={() => elegirDuracion(m)}
            className={`pill ${durSel === m ? 'pill-active' : ''}`}>
            {l}
          </button>
        ))}
      </div>
      {/* Date picker nativo */}
      <input
        type="date"
        value={value || ''}
        onChange={e => elegirCalendario(e.target.value)}
        style={{ colorScheme: 'dark', fontFamily: 'var(--mono)' }}
      />
      {value && (
        <div style={{ fontSize: 11, color: 'var(--cyan)', marginTop: 5, fontFamily: 'var(--mono)' }}>
          📅 {formatFecha(value)}
        </div>
      )}
    </div>
  )
}

// ─── MODAL BASE ───────────────────────────────────────────
function Modal({ onClose, children, maxWidth = 480 }) {
  return (
    <div style={{position:'fixed',inset:0,background:'#000000dd',zIndex:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="slide-up" style={{background:'var(--bg1)',borderRadius:'20px 20px 0 0',padding:24,width:'100%',maxWidth,maxHeight:'92vh',overflowY:'auto',border:'1px solid var(--border)',borderBottom:'none'}}>
        {children}
      </div>
    </div>
  )
}

function ModalConfirm({ mensaje, detalle, onConfirmar, onCancelar, colorBtn = 'var(--red)', textoBtn = 'Confirmar' }) {
  return (
    <div style={{position:'fixed',inset:0,background:'#000000dd',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div className="card slide-up" style={{padding:28,maxWidth:340,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:14}}>⚠️</div>
        <div style={{fontWeight:800,fontSize:17,marginBottom:8}}>{mensaje}</div>
        {detalle && <div style={{fontSize:13,color:'var(--text2)',marginBottom:24,whiteSpace:'pre-line',lineHeight:1.6}}>{detalle}</div>}
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={onCancelar}>Cancelar</button>
          <button className="btn" style={{flex:1,justifyContent:'center',background:colorBtn,color:'var(--bg)'}} onClick={onConfirmar}>{textoBtn}</button>
        </div>
      </div>
    </div>
  )
}

// ─── BUSCADOR SERVICIO ────────────────────────────────────
function BuscadorServicio({ value, onChange }) {
  const [q, setQ] = useState(value || '')
  const [open, setOpen] = useState(false)
  const filtered = q ? SERVICIOS.filter(s => s.toLowerCase().includes(q.toLowerCase())) : SERVICIOS
  function sel(s) { setQ(s); onChange(s); setOpen(false) }
  return (
    <div style={{position:'relative'}}>
      <input value={q} onChange={e=>{setQ(e.target.value);onChange(e.target.value);setOpen(true)}}
        onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}
        placeholder="Busca o escribe un servicio..." />
      {open && filtered.length > 0 && (
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,maxHeight:180,overflowY:'auto',zIndex:50}}>
          {filtered.map(s => (
            <div key={s} onMouseDown={()=>sel(s)}
              style={{padding:'9px 14px',cursor:'pointer',fontSize:13,color:value===s?'var(--cyan)':'var(--text)',background:value===s?'var(--bg3)':'transparent',borderBottom:'1px solid #1e2d4a20',fontFamily:'var(--mono)'}}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MODAL NUEVO/AGREGAR SERVICIO ─────────────────────────
function ModalServicio({ onGuardar, onCerrar, clienteNombre, clienteId, clientes }) {
  const [form, setForm] = useState({ nombre: clienteNombre || '', clienteId: clienteId || '', vinculada: '', cuenta: '', precio: '', fecha: '', tel: '', notas: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setError('') }

  async function guardar() {
    if (!form.nombre.trim() && !clienteId) return setError('El nombre es obligatorio')
    if (!form.cuenta.trim()) return setError('El servicio es obligatorio')
    if (!form.fecha.trim()) return setError('La fecha es obligatoria')
    const fechaISO = form.fecha.includes('/') ? parseFechaInput(form.fecha) : form.fecha
    if (!fechaISO) return setError('Fecha inválida')
    setSaving(true); setError('')
    try {
      let cId = clienteId
      if (!cId) {
        // Buscar cliente existente o crear nuevo
        const { data: existing } = await supabase.from('clientes').select('id').eq('nombre', form.nombre.trim()).single()
        if (existing) {
          cId = existing.id
        } else {
          const { data: nuevo, error: e } = await supabase.from('clientes').insert({ nombre: form.nombre.trim(), telefono: form.tel || null }).select().single()
          if (e) throw e
          cId = nuevo.id
        }
      }
      const { error: e2 } = await supabase.from('servicios').insert({
        cliente_id: cId, cuenta: form.cuenta.trim(),
        vinculada: form.vinculada || null,
        precio: parseFloat(form.precio) || 0,
        fecha_vencimiento: fechaISO,
        notas: form.notas || null,
        estado: 'PENDIENTE'
      })
      if (e2) throw e2
      onGuardar()
      onCerrar()
    } catch(e) { setError('Error al guardar: ' + e.message); setSaving(false) }
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontWeight:800,fontSize:18}}>{clienteId ? '➕ Agregar servicio' : '➕ Nuevo cliente'}</div>
          {clienteNombre && <div style={{fontSize:12,color:'var(--text2)',marginTop:2,fontFamily:'var(--mono)'}}>{clienteNombre}</div>}
        </div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>

      {!clienteId && (
        <div style={{marginBottom:14}}>
          <label>NOMBRE O WHATSAPP *</label>
          <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Ej: Juan García o 664 123 4567" />
        </div>
      )}

      <div style={{marginBottom:14}}>
        <label>VINCULADA</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {VINCULADAS.map(v => (
            <button key={v} className={`pill ${form.vinculada===v?'pill-vinc-active':''}`}
              onClick={()=>set('vinculada',form.vinculada===v?'':v)}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <label>SERVICIO / CUENTA *</label>
        <BuscadorServicio value={form.cuenta} onChange={v=>set('cuenta',v)} />
      </div>

      <div style={{marginBottom:14}}>
        <label>PRECIO (MXN)</label>
        <input value={form.precio} onChange={e=>set('precio',e.target.value)} placeholder="95" type="number" style={{fontFamily:'var(--mono)'}} />
      </div>

      <div style={{marginBottom:14}}>
        <SelectorFecha value={form.fecha} onChange={v=>set('fecha',v)} />
      </div>

      {!clienteId && (
        <div style={{marginBottom:14}}>
          <label>TELÉFONO WHATSAPP</label>
          <input value={form.tel} onChange={e=>set('tel',e.target.value)} placeholder="6641234567" type="tel" style={{fontFamily:'var(--mono)'}} />
        </div>
      )}

      <div style={{marginBottom:20}}>
        <label>NOTAS</label>
        <input value={form.notas} onChange={e=>set('notas',e.target.value)} placeholder="Ej: Perfil 4, pin 3333" />
      </div>

      {error && <div style={{background:'#1a0008',border:'1px solid #ff336630',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'var(--red)'}}>⚠️ {error}</div>}

      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : '✓ Guardar'}
      </button>
    </Modal>
  )
}

// ─── MODAL RENOVAR ────────────────────────────────────────
function ModalRenovar({ servicio, cliente, onRenovar, onCerrar }) {
  const [fecha, setFecha] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function renovar() {
    if (!fecha) return setError('Selecciona una fecha')
    setSaving(true); setError('')
    try {
      const updates = { fecha_vencimiento: fecha, estado: 'PENDIENTE', cobrado: null }
      if (notas) updates.notas = servicio.notas ? servicio.notas + ' | ' + notas : notas
      const { error: e } = await supabase.from('servicios').update(updates).eq('id', servicio.id)
      if (e) throw e
      onRenovar(); onCerrar()
    } catch(e) { setError('Error: ' + e.message); setSaving(false) }
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontWeight:800,fontSize:17}}>🔄 Renovar servicio</div>
          <div style={{fontSize:12,color:'var(--text2)',fontFamily:'var(--mono)',marginTop:2}}>{cliente} · {servicio.cuenta}</div>
        </div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>
      <div style={{fontSize:11,color:'var(--text3)',marginBottom:14,fontFamily:'var(--mono)'}}>FECHA ACTUAL: {formatFecha(servicio.fecha_vencimiento)}</div>
      <div style={{marginBottom:14}}>
        <SelectorFecha value={fecha} onChange={setFecha} label="NUEVA FECHA DE VENCIMIENTO" />
      </div>
      <div style={{marginBottom:14}}>
        <label>NOTAS (opcional)</label>
        <input value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Ej: Pagó en efectivo, renovó 3 meses..." />
      </div>
      {error && <div style={{color:'var(--red)',fontSize:12,marginBottom:12}}>⚠️ {error}</div>}
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={renovar} disabled={saving}>
        {saving ? 'Guardando...' : `Renovar → ${fecha ? formatFecha(fecha) : 'elige fecha'}`}
      </button>
    </Modal>
  )
}

// ─── MODAL EDITAR SERVICIO ────────────────────────────────
function ModalEditar({ servicio, cliente, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    cuenta: servicio.cuenta || '',
    vinculada: servicio.vinculada || '',
    precio: servicio.precio || '',
    fecha: servicio.fecha_vencimiento || '',
    notas: servicio.notas || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setError('') }

  async function guardar() {
    if (!form.cuenta.trim()) return setError('El servicio es obligatorio')
    if (!form.fecha) return setError('Selecciona una fecha válida')
    setSaving(true); setError('')
    try {
      const { error: e } = await supabase.from('servicios').update({
        cuenta: form.cuenta.trim(),
        vinculada: form.vinculada || null,
        precio: parseFloat(form.precio) || 0,
        fecha_vencimiento: form.fecha,
        notas: form.notas || null,
      }).eq('id', servicio.id)
      if (e) throw e
      onGuardar(); onCerrar()
    } catch(e) { setError('Error: ' + e.message); setSaving(false) }
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontWeight:800,fontSize:18}}>✏️ Editar servicio</div>
          <div style={{fontSize:12,color:'var(--text2)',fontFamily:'var(--mono)',marginTop:2}}>{cliente}</div>
        </div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>

      <div style={{marginBottom:14}}>
        <label>VINCULADA</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {VINCULADAS.map(v => (
            <button key={v} className={`pill ${form.vinculada===v?'pill-vinc-active':''}`}
              onClick={()=>set('vinculada',form.vinculada===v?'':v)}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <label>SERVICIO / CUENTA</label>
        <BuscadorServicio value={form.cuenta} onChange={v=>set('cuenta',v)} />
      </div>

      <div style={{marginBottom:14}}>
        <label>PRECIO (MXN)</label>
        <input value={form.precio} onChange={e=>set('precio',e.target.value)} type="number" placeholder="95" style={{fontFamily:'var(--mono)'}} />
      </div>

      <div style={{marginBottom:14}}>
        <SelectorFecha value={form.fecha} onChange={v=>set('fecha',v)} label="FECHA VENCIMIENTO" />
      </div>

      <div style={{marginBottom:20}}>
        <label>NOTAS</label>
        <input value={form.notas} onChange={e=>set('notas',e.target.value)} placeholder="Ej: Perfil 2, pin 1234" />
      </div>

      {error && <div style={{background:'#1a0008',border:'1px solid #ff336630',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'var(--red)'}}>⚠️ {error}</div>}

      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : '✓ Guardar cambios'}
      </button>
    </Modal>
  )
}

// ─── LOGIN ────────────────────────────────────────────────
function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [pass, setPass] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login() {
    setLoading(true); setError('')
    const { data, error: e } = await supabase.from('usuarios')
      .select('*').eq('username', usuario.trim()).eq('password_hash', pass).single()
    if (e || !data) { setError('Usuario o contraseña incorrectos'); setLoading(false); return }
    onLogin({ usuario: data.username, rol: data.rol })
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:'var(--font)'}}>
      <style>{CSS}</style>
      <div style={{width:'100%',maxWidth:380}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#00d4ff20,#9d4edd20)',border:'1px solid var(--cyan)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:16,boxShadow:'0 0 40px #00d4ff20'}}>👾</div>
          <div style={{fontWeight:900,fontSize:28,letterSpacing:'-0.02em'}}>Streaming</div>
          <div style={{fontSize:13,color:'var(--text3)',marginTop:4,fontFamily:'var(--mono)'}}>Panel de control</div>
        </div>

        <div className="card" style={{padding:28}}>
          <div style={{marginBottom:18}}>
            <label>USUARIO</label>
            <input value={usuario} onChange={e=>{setUsuario(e.target.value);setError('')}}
              onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Admin / Angelica" />
          </div>
          <div style={{marginBottom:24,position:'relative'}}>
            <label>CONTRASEÑA</label>
            <input type={verPass?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value);setError('')}}
              onKeyDown={e=>e.key==='Enter'&&login()} placeholder="••••••••" style={{paddingRight:44}} />
            <button onClick={()=>setVerPass(!verPass)} style={{position:'absolute',right:12,bottom:10,background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16}}>
              {verPass?'🙈':'👁️'}
            </button>
          </div>
          {error && <div style={{background:'#1a0008',border:'1px solid #ff336630',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:12,color:'var(--red)',textAlign:'center'}}>⚠️ {error}</div>}
          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={login} disabled={loading||!usuario||!pass}>
            {loading ? 'Verificando...' : 'Entrar →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────
const FILTROS = [
  {val:'todos',label:'Todos'},
  {val:'vencidos',label:'💀 Vencidos'},
  {val:'hoy',label:'🔴 Hoy'},
  {val:'3dias',label:'🔴 3d'},
  {val:'semana',label:'🟠 7d'},
  {val:'mes',label:'🟡 30d'},
]

function App({ sesion, onLogout }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [filtroVinc, setFiltroVinc] = useState('')
  const [orden, setOrden] = useState('fecha')
  const [verRes, setVerRes] = useState(false)
  const [ultimaAct, setUltimaAct] = useState(null)
  const [modalForm, setModalForm] = useState(null)
  const [modalRenovar, setModalRenovar] = useState(null)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalConfirm, setModalConfirm] = useState(null)
  const [notif, setNotif] = useState({})
  const [vista, setVista] = useState('cobros') // 'cobros' | 'cuentas'
  const esAdmin = sesion.rol === 'admin'

  const cargarDatos = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data: serviciosData, error: e } = await supabase
        .from('servicios')
        .select('*, clientes(id, nombre, telefono)')
        .eq('cancelado', false)
        .order('fecha_vencimiento', { ascending: true })
      if (e) throw e

      // Agrupar por cliente
      const mapa = new Map()
      for (const s of serviciosData) {
        const c = s.clientes
        if (!c) continue
        if (!mapa.has(c.id)) mapa.set(c.id, { cliente: c, servicios: [] })
        mapa.get(c.id).servicios.push({ ...s, d: diasRestantes(s.fecha_vencimiento) })
      }

      const lista = Array.from(mapa.values()).map(({ cliente, servicios }) => {
        const validos = servicios.filter(s => s.d !== null)
        const dMin = validos.length > 0 ? Math.min(...validos.map(s => s.d)) : null
        const total = servicios.reduce((sum, s) => sum + (parseFloat(s.precio) || 0), 0)
        // Agrupar por fecha
        const porFecha = new Map()
        for (const s of servicios) {
          const k = s.fecha_vencimiento || '—'
          if (!porFecha.has(k)) porFecha.set(k, { fecha: s.fecha_vencimiento, d: s.d, servicios: [] })
          porFecha.get(k).servicios.push(s)
        }
        const grupos = Array.from(porFecha.values()).sort((a,b)=>{
          if(a.d===null)return 1;if(b.d===null)return-1;return a.d-b.d
        })
        return { cliente, servicios, grupos, dMin, total }
      })

      setData(lista)
      setUltimaAct(new Date())
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const filtrados = useMemo(() => {
    const q = buscar.toLowerCase()
    let lista = data.filter(({ cliente, servicios, dMin }) => {
      const matchQ = !q ||
        cliente.nombre.toLowerCase().includes(q) ||
        servicios.some(s => s.cuenta.toLowerCase().includes(q)) ||
        servicios.some(s => s.vinculada && s.vinculada.toLowerCase().includes(q))
      const matchV = !filtroVinc || servicios.some(s => s.vinculada === filtroVinc)
      const ok = matchQ && matchV
      if (filtro === 'vencidos') return ok && dMin !== null && dMin < 0
      if (filtro === 'hoy')      return ok && dMin === 0
      if (filtro === '3dias')    return ok && dMin !== null && dMin >= 0 && dMin <= 3
      if (filtro === 'semana')   return ok && dMin !== null && dMin >= 0 && dMin <= 7
      if (filtro === 'mes')      return ok && dMin !== null && dMin >= 0 && dMin <= 30
      return ok
    })
    if (orden === 'nombre') lista = [...lista].sort((a,b) => a.cliente.nombre.localeCompare(b.cliente.nombre))
    if (orden === 'precio') lista = [...lista].sort((a,b) => b.total - a.total)
    return lista
  }, [data, buscar, filtro, filtroVinc, orden])

  function avisar(cliente, grupo) {
    const key = `${cliente.id}__${grupo.fecha}`
    const lineas = grupo.servicios.map(s => {
      const v = s.vinculada ? ` (${s.vinculada})` : ''
      const n = s.notas ? `\n  📝 ${s.notas}` : ''
      return `• ${s.cuenta}${v}: $${parseFloat(s.precio).toLocaleString()} MXN${n}`
    }).join('\n')
    const total = grupo.servicios.reduce((sum,s) => sum + parseFloat(s.precio||0), 0)
    const d = grupo.d
    const diasTxt = d===0?'¡HOY!':d!==null?`en ${d} días`:'próximamente'
    const txt = `Hola! Te recuerdo el pago de *${cliente.nombre}* (${diasTxt}):\n${lineas}\n\n*Total: $${total.toLocaleString()} MXN*\nFecha: *${formatFecha(grupo.fecha)}*`
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank')
    setNotif(p => ({...p, [key]: true}))
    setTimeout(() => setNotif(p => {const n={...p};delete n[key];return n}), 3000)
  }

  async function marcarCobrado(s) {
    const { error: e } = await supabase.from('servicios').update({ cobrado: fechaHoy() }).eq('id', s.id)
    if (!e) cargarDatos()
  }

  async function cancelar(s) {
    const notas = s.notas ? 'CANCELADO | ' + s.notas : 'CANCELADO'
    const { error: e } = await supabase.from('servicios').update({ notas }).eq('id', s.id)
    if (!e) cargarDatos()
  }

  async function eliminarServicio(s) {
    const { error: e } = await supabase.from('servicios').delete().eq('id', s.id)
    if (!e) cargarDatos()
  }

  async function eliminarCliente(clienteId, serviciosIds) {
    await supabase.from('servicios').delete().in('id', serviciosIds)
    await supabase.from('clientes').delete().eq('id', clienteId)
    cargarDatos()
  }

  // Stats
  const totalMes = data.reduce((s,c) => s + c.total, 0)
  const urgentes7 = data.filter(c => c.dMin !== null && c.dMin >= 0 && c.dMin <= 7)
  const totalUrg = urgentes7.reduce((s,c) => s + c.total, 0)
  const urgentes3 = data.filter(c => c.dMin !== null && c.dMin >= 0 && c.dMin <= 3).length

  const resumenVinc = useMemo(() => {
    const m = new Map()
    data.forEach(({ servicios }) => servicios.forEach(s => {
      const k = s.vinculada || 'Sin vinculada'
      if (!m.has(k)) m.set(k, { total: 0, count: 0 })
      m.get(k).total += parseFloat(s.precio||0)
      m.get(k).count += 1
    }))
    return Array.from(m.entries()).sort((a,b) => b[1].total - a[1].total)
  }, [data])

  const resumenServicio = useMemo(() => {
    const m = new Map()
    data.forEach(({ servicios }) => servicios.forEach(s => {
      const base = s.cuenta.replace(/\s*(4K|HD|extra|gen|genérico|\+|3|1|12|platino)/gi,'').trim()
      const k = base || s.cuenta
      if (!m.has(k)) m.set(k, { total: 0, count: 0 })
      m.get(k).total += parseFloat(s.precio||0)
      m.get(k).count += 1
    }))
    return Array.from(m.entries()).sort((a,b) => b[1].total - a[1].total)
  }, [data])

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--font)',paddingBottom:40}}>
      <style>{CSS}</style>

      {modalForm && <ModalServicio clienteId={modalForm.clienteId} clienteNombre={modalForm.clienteNombre} onGuardar={cargarDatos} onCerrar={()=>setModalForm(null)} />}
      {modalRenovar && <ModalRenovar servicio={modalRenovar.servicio} cliente={modalRenovar.cliente} onRenovar={cargarDatos} onCerrar={()=>setModalRenovar(null)} />}
      {modalEditar && <ModalEditar servicio={modalEditar.servicio} cliente={modalEditar.cliente} onGuardar={cargarDatos} onCerrar={()=>setModalEditar(null)} />}
      {modalConfirm && <ModalConfirm {...modalConfirm} onCancelar={()=>setModalConfirm(null)} />}

      {/* HEADER */}
      <div style={{background:'var(--bg1)',borderBottom:'1px solid var(--border)',padding:'16px 16px 12px',position:'sticky',top:0,zIndex:10}}>
        <div style={{maxWidth:520,margin:'0 auto'}}>
          {/* Top bar */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:38,height:38,borderRadius:10,background:'var(--bg2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👾</div>
              <div>
                <div style={{fontWeight:800,fontSize:16,letterSpacing:'-0.01em'}}>Streaming</div>
                <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)'}}>{sesion.usuario} · <span style={{color:esAdmin?'var(--purple)':'var(--cyan)'}}>{esAdmin?'Admin':'Ayudante'}</span></div>
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              {esAdmin && <button className="btn btn-primary" style={{padding:'6px 14px'}} onClick={()=>setModalForm({})}>+ Nuevo</button>}
              <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={cargarDatos} disabled={loading}>{loading?'⏳':'⟳'}</button>
              <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onLogout}>⏏</button>
            </div>
          </div>

          {/* Tabs — solo admin */}
          {esAdmin && (
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {[{val:'cobros',label:'💳 Cobros'},{val:'cuentas',label:'🗂️ Cuentas'}].map(t=>(
                <button key={t.val} onClick={()=>setVista(t.val)} style={{
                  background:vista===t.val?'var(--accent)':'var(--bg2)',
                  color:vista===t.val?'#fff':'var(--text3)',
                  border:`1px solid ${vista===t.val?'var(--accent)':'var(--border)'}`,
                  borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700,
                  transition:'all 0.15s',
                }}>{t.label}</button>
              ))}
            </div>
          )}

          {/* Alerta */}
          {vista==='cobros' && urgentes3 > 0 && <div style={{fontSize:11,color:'var(--red)',fontWeight:700,marginBottom:8,fontFamily:'var(--mono)'}}>🔴 {urgentes3} cliente{urgentes3>1?'s':''} · ≤3 días</div>}

          {/* Resumen - solo en cobros */}
          {vista==='cobros' && esAdmin && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,marginBottom:10,overflow:'hidden'}}>
              <button onClick={()=>setVerRes(!verRes)} style={{width:'100%',background:'none',border:'none',padding:'10px 14px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',color:'var(--text2)'}}>
                <span style={{fontSize:12,fontWeight:600}}>💰 Resumen del mes</span>
                <span style={{fontSize:11,fontFamily:'var(--mono)'}}>{verRes?'▲':'▼'}</span>
              </button>
              {verRes && (
                <div style={{padding:'0 14px 14px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                    <div style={{background:'var(--bg3)',borderRadius:10,padding:'10px 14px',border:'1px solid var(--border)'}}>
                      <div style={{fontSize:10,color:'var(--text3)',marginBottom:4}}>TOTAL POR COBRAR</div>
                      <div style={{fontSize:22,fontWeight:800,color:'var(--green)',fontFamily:'var(--mono)'}}>${totalMes.toLocaleString()}</div>
                      <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{data.length} clientes</div>
                    </div>
                    <div style={{background:'#1a0800',borderRadius:10,padding:'10px 14px',border:'1px solid #ff8c0030'}}>
                      <div style={{fontSize:10,color:'var(--text3)',marginBottom:4}}>URGENTE (7 DÍAS)</div>
                      <div style={{fontSize:22,fontWeight:800,color:'var(--orange)',fontFamily:'var(--mono)'}}>${totalUrg.toLocaleString()}</div>
                      <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{urgentes7.length} clientes</div>
                    </div>
                  </div>
                  {/* Por vinculada */}
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:10,color:'var(--purple)',fontWeight:700,marginBottom:6,fontFamily:'var(--mono)'}}>POR VINCULADA</div>
                    {resumenVinc.map(([k,v]) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <span style={{fontSize:11,color:'var(--text2)',fontFamily:'var(--mono)'}}>{k}</span>
                          <span style={{fontSize:9,background:'var(--bg3)',color:'var(--text3)',padding:'1px 5px',borderRadius:4}}>{v.count}</span>
                        </div>
                        <span style={{fontSize:12,color:'var(--green)',fontWeight:700,fontFamily:'var(--mono)'}}>${v.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {/* Por servicio */}
                  <div>
                    <div style={{fontSize:10,color:'var(--cyan)',fontWeight:700,marginBottom:6,fontFamily:'var(--mono)'}}>POR TIPO DE SERVICIO</div>
                    {resumenServicio.map(([k,v]) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <span style={{fontSize:11,color:'var(--text2)',fontFamily:'var(--mono)'}}>{k}</span>
                          <span style={{fontSize:9,background:'var(--bg3)',color:'var(--text3)',padding:'1px 5px',borderRadius:4}}>{v.count}</span>
                        </div>
                        <span style={{fontSize:12,color:'var(--green)',fontWeight:700,fontFamily:'var(--mono)'}}>${v.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buscador + filtros — solo en cobros */}
          {vista === 'cobros' && <>
          <div style={{position:'relative',marginBottom:8}}>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',fontSize:14}}>⌕</span>
            <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar nombre, servicio o vinculada..."
              style={{paddingLeft:34}} />
          </div>
          <div className="scroll-x" style={{marginBottom:8}}>
            <button className={`pill ${filtroVinc===''?'pill-active':''}`} onClick={()=>setFiltroVinc('')}>Todas</button>
            {VINCULADAS.map(v => (
              <button key={v} className={`pill ${filtroVinc===v?'pill-vinc-active':''}`} onClick={()=>setFiltroVinc(filtroVinc===v?'':v)}>{v}</button>
            ))}
          </div>
          <div className="scroll-x">
            {FILTROS.map(f => (
              <button key={f.val} className={`pill ${filtro===f.val?'pill-active':''}`} onClick={()=>setFiltro(f.val)}>{f.label}</button>
            ))}
            <div style={{width:1,background:'var(--border)',flexShrink:0,margin:'0 2px'}}/>
            {[{val:'fecha',label:'📅'},{val:'nombre',label:'🔤'},{val:'precio',label:'💰'}].map(o => (
              <button key={o.val} className={`pill ${orden===o.val?'pill-active':''}`} onClick={()=>setOrden(o.val)}>{o.label}</button>
            ))}
          </div>
          </>}
        </div>
      </div>

      {/* Vista Cuentas */}
      {vista === 'cuentas' && esAdmin && <CuentasView />}

      {/* LISTA */}
      {vista === 'cobros' && (
      <div style={{maxWidth:520,margin:'0 auto',padding:'12px 16px 0'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'var(--text3)'}}>
            <div style={{fontSize:32,marginBottom:8}}>⏳</div>
            <div style={{fontFamily:'var(--mono)',fontSize:12}}>Cargando...</div>
          </div>
        ) : error ? (
          <div className="card" style={{padding:24,textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:8}}>⚠️</div>
            <div style={{color:'var(--orange)',fontSize:13,marginBottom:16}}>{error}</div>
            <button className="btn btn-primary" onClick={cargarDatos}>Reintentar</button>
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{textAlign:'center',color:'var(--text3)',padding:'60px 0',fontFamily:'var(--mono)',fontSize:12}}>Sin resultados</div>
        ) : filtrados.map(({ cliente, servicios, grupos, dMin, total }) => {
          const urgente = dMin !== null && dMin >= 0 && dMin <= 3
          const vencido = dMin !== null && dMin < 0
          const cardClass = urgente ? 'card card-urgent' : vencido ? 'card card-urgent' : 'card'

          return (
            <div key={cliente.id} className={cardClass} style={{marginBottom:10,padding:'12px 14px'}}>
              {/* Header cliente */}
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{fontWeight:800,fontSize:15,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cliente.nombre}</div>
                {esAdmin && <span style={{color:'var(--green)',fontWeight:800,fontSize:13,fontFamily:'var(--mono)',whiteSpace:'nowrap'}}>${total.toLocaleString()}</span>}
                {cliente.telefono && (
                  <a href={`https://wa.me/52${cliente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    className="btn" style={{background:'#001a0e',border:'1px solid #00ff8830',color:'var(--green)',padding:'4px 8px',fontSize:11,textDecoration:'none'}}>📱</a>
                )}
                {esAdmin && (
                  <button className="btn" style={{background:'var(--bg2)',border:'1px solid var(--cyan)',color:'var(--cyan)',padding:'4px 8px',fontSize:11}}
                    onClick={()=>setModalForm({clienteId:cliente.id,clienteNombre:cliente.nombre})}>+</button>
                )}
                {esAdmin && (
                  <button className="btn btn-danger" style={{padding:'4px 8px',fontSize:11}}
                    onClick={()=>setModalConfirm({
                      mensaje:'¿Eliminar cliente?',
                      detalle:`Se eliminarán todos los servicios de ${cliente.nombre}.`,
                      textoBtn:'Eliminar todo',
                      onConfirmar:()=>{eliminarCliente(cliente.id,servicios.map(s=>s.id));setModalConfirm(null)}
                    })}>🗑️</button>
                )}
              </div>

              {/* Grupos por fecha */}
              {grupos.map((grupo, gi) => {
                const key = `${cliente.id}__${grupo.fecha}`
                const yaNotif = notif[key]
                const urgG = grupo.d !== null && grupo.d <= 3
                return (
                  <div key={gi} style={{background:'var(--bg2)',borderRadius:10,padding:'8px 10px',marginBottom:gi<grupos.length-1?6:0,border:`1px solid ${urgG?'#ff336620':'var(--border)'}`}}>
                    {/* Fecha + badge + avisar */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)'}}>📅 {formatFecha(grupo.fecha)}</span>
                        <BadgeDias d={grupo.d} />
                      </div>
                      <button className="btn" onClick={()=>avisar(cliente,grupo)}
                        style={{background:yaNotif?'#001a0e':'#003d1a',border:`1px solid ${yaNotif?'#00ff8850':'#00ff8830'}`,color:'var(--green)',padding:'3px 10px',fontSize:10}}>
                        {yaNotif?'✅ Enviado':'📲 Avisar'}
                      </button>
                    </div>
                    {/* Servicios */}
                    {grupo.servicios.map((s, si) => (
                      <div key={si} style={{background:'var(--bg)',borderRadius:8,padding:'8px 10px',marginBottom:si<grupo.servicios.length-1?5:0,border:'1px solid var(--border)'}}>
                        {/* Fila 1: cuenta + vinculada + cobrado + precio */}
                        <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:s.notas&&esAdmin?4:esAdmin?5:0}}>
                          <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700,color:'var(--text)'}}>{s.cuenta}</span>
                          {s.vinculada && <span className="tag tag-vinc">{s.vinculada}</span>}
                          {s.cobrado && <span className="tag tag-cobrado">✅ {formatFecha(s.cobrado)}</span>}
                          {esAdmin && <span style={{color:'var(--green)',fontSize:12,fontWeight:700,fontFamily:'var(--mono)',marginLeft:'auto'}}>${parseFloat(s.precio||0).toLocaleString()}</span>}
                        </div>
                        {/* Notas (solo admin) */}
                        {s.notas && esAdmin && (
                          <div style={{fontSize:11,color:'var(--text3)',marginBottom:5,paddingLeft:2}}>📝 {s.notas}</div>
                        )}
                        {/* Botones admin */}
                        {esAdmin && (
                          <div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap'}}>
                            {!s.cobrado && (
                              <button className="btn btn-success" style={{padding:'2px 8px',fontSize:10}}
                                onClick={()=>setModalConfirm({
                                  mensaje:'¿Marcar como cobrado?',
                                  detalle:`${cliente.nombre} · ${s.cuenta}\nSe registra la fecha de hoy.`,
                                  colorBtn:'var(--green)',textoBtn:'✅ Cobrado',
                                  onConfirmar:()=>{marcarCobrado(s);setModalConfirm(null)}
                                })}>✅ Cobrado</button>
                            )}
                            <div style={{flex:1}}/>
                            <button className="btn" style={{padding:'2px 8px',fontSize:10,background:'transparent',color:'var(--cyan)',border:'1px solid #00d4ff30'}}
                              onClick={()=>setModalEditar({servicio:s,cliente:cliente.nombre})}>✏️</button>
                            <button className="btn btn-danger" style={{padding:'2px 8px',fontSize:10}}
                              onClick={()=>setModalConfirm({
                                mensaje:'¿Cancelar servicio?',
                                detalle:`${cliente.nombre} · ${s.cuenta}`,
                                colorBtn:'var(--orange)',textoBtn:'Cancelar',
                                onConfirmar:()=>{cancelar(s);setModalConfirm(null)}
                              })}>❌</button>
                            <button className="btn btn-renew" style={{padding:'2px 8px',fontSize:10}}
                              onClick={()=>setModalRenovar({servicio:s,cliente:cliente.nombre})}>🔄 Renovar</button>
                            <button className="btn btn-danger" style={{padding:'2px 8px',fontSize:10}}
                              onClick={()=>setModalConfirm({
                                mensaje:'¿Eliminar servicio?',
                                detalle:`${cliente.nombre} · ${s.cuenta}`,
                                textoBtn:'Eliminar',
                                onConfirmar:()=>{eliminarServicio(s);setModalConfirm(null)}
                              })}>🗑️</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
        {!loading && !error && (
          <div style={{textAlign:'center',fontSize:11,color:'var(--text3)',marginTop:16,fontFamily:'var(--mono)'}}>
            {filtrados.length} / {data.length} clientes
          </div>
        )}
      </div>
      )}
    </div>
  )
}

// ─── CUENTAS VIEW ──────────────────────────────────────────
function CuentasView() {
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null) // perfil id
  const [editVal, setEditVal] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtroSvc, setFiltroSvc] = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cuentas_maestras')
      .select('*, perfiles_espacios(*)')
      .order('servicio')
    if (!error) setCuentas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const serviciosUnicos = [...new Set(cuentas.map(c => c.servicio))].sort()

  const cuentasFiltradas = cuentas.filter(c => {
    const okSvc = !filtroSvc || c.servicio === filtroSvc
    const okQ = !buscar || c.servicio.toLowerCase().includes(buscar.toLowerCase()) ||
      c.vinculada?.toLowerCase().includes(buscar.toLowerCase()) ||
      c.perfiles_espacios?.some(p => (p.cliente_nombre||'').toLowerCase().includes(buscar.toLowerCase()))
    return okSvc && okQ
  })

  async function guardarCliente(perfilId, nuevoCliente) {
    const val = nuevoCliente.trim() || null
    await supabase.from('perfiles_espacios').update({
      cliente_nombre: val,
      notas: val ? null : 'DISPONIBLE'
    }).eq('id', perfilId)
    setEditando(null)
    cargar()
  }

  if (loading) return <div style={{textAlign:'center',padding:'60px 0',color:'var(--text3)'}}>⏳ Cargando cuentas...</div>

  return (
    <div style={{maxWidth:520,margin:'0 auto',padding:'14px 16px 0'}}>
      {/* Buscador */}
      <div style={{position:'relative',marginBottom:8}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',fontSize:13}}>🔍</span>
        <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar servicio, vinculada o cliente..."
          style={{...inputSt,paddingLeft:36}}/>
      </div>

      {/* Filtros por servicio */}
      <div style={{display:'flex',gap:5,overflowX:'auto',marginBottom:12,paddingBottom:2}}>
        <button onClick={()=>setFiltroSvc('')} style={{...chipSt(filtroSvc==='')}}> Todos</button>
        {serviciosUnicos.map(s=>(
          <button key={s} onClick={()=>setFiltroSvc(filtroSvc===s?'':s)} style={{...chipSt(filtroSvc===s)}}>{s}</button>
        ))}
      </div>

      {/* Cuentas */}
      {cuentasFiltradas.map(cuenta => {
        const perfiles = (cuenta.perfiles_espacios || []).sort((a,b) => String(a.perfil).localeCompare(String(b.perfil), undefined, {numeric:true}))
        const disponibles = perfiles.filter(p => !p.cliente_nombre || p.cliente_nombre.toUpperCase() === 'DISPONIBLE' || (p.notas||'').toUpperCase() === 'DISPONIBLE').length
        const total = perfiles.length

        return (
          <div key={cuenta.id} style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px',marginBottom:10}}>
            {/* Header cuenta */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,letterSpacing:'-0.01em'}}>{cuenta.servicio}</div>
                <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>
                  <span style={{background:'rgba(167,139,250,0.12)',color:'var(--purple)',padding:'1px 7px',borderRadius:5,fontSize:10,fontWeight:600}}>{cuenta.vinculada}</span>
                  {cuenta.correo && <span style={{marginLeft:6,color:'var(--text3)'}}>{cuenta.correo}</span>}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:12,fontWeight:700,color:disponibles>0?'var(--green)':'var(--text3)'}}>
                  {disponibles} libre{disponibles!==1?'s':''}
                </div>
                <div style={{fontSize:10,color:'var(--text3)'}}>{total - disponibles}/{total} ocupados</div>
              </div>
            </div>

            {/* Perfiles */}
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {perfiles.map(p => {
                const esDisponible = !p.cliente_nombre || p.cliente_nombre.toUpperCase()==='DISPONIBLE' || (p.notas||'').toUpperCase()==='DISPONIBLE'
                const isEditando = editando === p.id

                return (
                  <div key={p.id} style={{
                    background:'var(--bg2)',border:`1px solid ${esDisponible?'rgba(52,211,153,0.2)':'var(--border2)'}`,
                    borderRadius:8,padding:'8px 10px',
                    display:'flex',alignItems:'center',gap:8,
                  }}>
                    {/* Perfil # */}
                    <div style={{
                      minWidth:32,height:32,borderRadius:6,
                      background:esDisponible?'rgba(52,211,153,0.1)':'var(--bg1)',
                      border:`1px solid ${esDisponible?'rgba(52,211,153,0.3)':'var(--border)'}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,fontWeight:800,color:esDisponible?'var(--green)':'var(--text2)',
                      flexShrink:0,
                    }}>{p.perfil}</div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      {isEditando ? (
                        <div style={{display:'flex',gap:6}}>
                          <input value={editVal} onChange={e=>setEditVal(e.target.value)}
                            onKeyDown={e=>{ if(e.key==='Enter') guardarCliente(p.id,editVal); if(e.key==='Escape') setEditando(null) }}
                            placeholder="Nombre del cliente..." autoFocus
                            style={{...inputSt,padding:'4px 8px',fontSize:12,flex:1}}/>
                          <button onClick={()=>guardarCliente(p.id,editVal)} style={{background:'var(--green)',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>✓</button>
                          <button onClick={()=>setEditando(null)} style={{background:'var(--bg1)',color:'var(--text3)',border:'1px solid var(--border)',borderRadius:6,padding:'4px 8px',cursor:'pointer',fontSize:11}}>✕</button>
                        </div>
                      ) : (
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:13,fontWeight:esDisponible?400:600,color:esDisponible?'var(--green)':'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {esDisponible ? 'DISPONIBLE' : p.cliente_nombre}
                          </span>
                          {p.notas && !esDisponible && <span style={{fontSize:10,color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>· {p.notas}</span>}
                        </div>
                      )}
                    </div>

                    {/* PIN */}
                    {p.pin && (
                      <div style={{flexShrink:0,background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:6,padding:'3px 8px',fontSize:11,fontWeight:700,color:'var(--yellow)',fontFamily:'var(--mono)',letterSpacing:'0.05em'}}>
                        {p.pin}
                      </div>
                    )}

                    {/* Editar */}
                    {!isEditando && (
                      <button onClick={()=>{ setEditando(p.id); setEditVal(esDisponible?'':p.cliente_nombre||'') }}
                        style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:14,padding:'2px 4px',flexShrink:0}}>✏️</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── SHARED STYLES ─────────────────────────────────────────
const inputSt = {
  width:'100%',boxSizing:'border-box',background:'var(--bg2)',
  border:'1px solid var(--border2)',borderRadius:8,padding:'10px 12px',
  color:'var(--text)',fontSize:13,fontFamily:'inherit',outline:'none',
}
const chipSt = (active) => ({
  background:active?'rgba(91,142,240,0.15)':'var(--bg2)',
  color:active?'var(--accent)':'var(--text3)',
  border:`1px solid ${active?'rgba(91,142,240,0.4)':'var(--border)'}`,
  borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:600,
  whiteSpace:'nowrap',flexShrink:0,transition:'all 0.15s',
})

// ─── ROOT ─────────────────────────────────────────────────
export default function Root() {
  const [sesion, setSesion] = useState(null)
  if (!sesion) return <Login onLogin={setSesion} />
  return <App sesion={sesion} onLogout={() => setSesion(null)} />
}
