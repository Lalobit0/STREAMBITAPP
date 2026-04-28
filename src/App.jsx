import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabase.js'

// ─── CONSTANTES ───────────────────────────────────────────
const VINCULADAS = ['SIX','Lalobit','ed.perma out','EDGAR.PERMA','ARES','Laloshop','edd.perma gmail']

// Servicios base con categoría asignada
const SERVICIOS_BASE = [
  // Streaming
  { nombre:'Netflix',           categoria:'Streaming' },
  { nombre:'Netflix extra',     categoria:'Streaming' },
  { nombre:'Netflix genérico',  categoria:'Streaming' },
  { nombre:'HBO HD',            categoria:'Streaming' },
  { nombre:'HBO 4K',            categoria:'Streaming' },
  { nombre:'HBO PLATINO',       categoria:'Streaming' },
  { nombre:'Disney 4K',         categoria:'Streaming' },
  { nombre:'Disney HD',         categoria:'Streaming' },
  { nombre:'MAX',               categoria:'Streaming' },
  { nombre:'PRIME',             categoria:'Streaming' },
  { nombre:'Paramount',         categoria:'Streaming' },
  { nombre:'VIX',               categoria:'Streaming' },
  { nombre:'Crunchyroll',       categoria:'Streaming' },
  { nombre:'APPLE ONE',         categoria:'Streaming' },
  { nombre:'Apple TV',          categoria:'Streaming' },
  // Música
  { nombre:'Spotify',           categoria:'Música' },
  { nombre:'Spotify 3',         categoria:'Música' },
  // Video
  { nombre:'Youtubep1',         categoria:'Video' },
  { nombre:'Youtubep3',         categoria:'Video' },
  // Productividad
  { nombre:'Office',            categoria:'Productividad' },
  { nombre:'Office3',           categoria:'Productividad' },
  { nombre:'Office12',          categoria:'Productividad' },
  { nombre:'Canva1',            categoria:'Productividad' },
  { nombre:'Canva12',           categoria:'Productividad' },
  // IA
  { nombre:'ChatGPT+',          categoria:'IA' },
  { nombre:'ChatGPT gen',       categoria:'IA' },
  { nombre:'Gemini',            categoria:'IA' },
  { nombre:'Grok',              categoria:'IA' },
  // IPTV
  { nombre:'ARES1',             categoria:'IPTV' },
  { nombre:'ARES2',             categoria:'IPTV' },
  { nombre:'ARES12',            categoria:'IPTV' },
  { nombre:'IPTVLAT1',          categoria:'IPTV' },
  { nombre:'IPTVLAT3',          categoria:'IPTV' },
]

// Array plano para compatibilidad
const SERVICIOS = SERVICIOS_BASE.map(s => s.nombre)

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

// ─── TOAST ────────────────────────────────────────────────
function Toast({ msg, tipo = 'ok' }) {
  const col = tipo === 'ok' ? 'var(--green)' : tipo === 'error' ? 'var(--red)' : 'var(--cyan)'
  const bg  = tipo === 'ok' ? '#001a0e' : tipo === 'error' ? '#1a0008' : '#001a2e'
  return (
    <div style={{
      position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',
      background:bg,border:`1px solid ${col}40`,borderRadius:10,
      padding:'10px 20px',color:col,fontSize:13,fontWeight:700,
      zIndex:999,boxShadow:`0 4px 20px ${col}20`,
      animation:'slideUp .2s ease',whiteSpace:'nowrap',
    }}>
      {tipo==='ok'?'✅':tipo==='error'?'❌':'ℹ️'} {msg}
    </div>
  )
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
// ─── CATEGORÍAS DE SERVICIOS ─────────────────────────────
const CATEGORIAS_SERVICIOS = {
  'Streaming':      { emoji:'🎬', color:'#ff3366' },
  'Música':         { emoji:'🎵', color:'#1db954' },
  'Productividad':  { emoji:'💼', color:'#0078d4' },
  'Video':          { emoji:'📺', color:'#ff0000' },
  'IA':             { emoji:'🤖', color:'#9d4edd' },
  'IPTV':           { emoji:'📡', color:'#00d4ff' },
  'Otro':           { emoji:'⚡', color:'#ffd60a' },
}

// BuscadorServicio: carga dinámicamente desde cuentas_maestras + lista base
function BuscadorServicio({ value, onChange }) {
  const [q, setQ] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [serviciosBD, setServiciosBD] = useState([])

  useEffect(() => {
    supabase.from('cuentas_maestras').select('servicio, categoria').then(({ data }) => {
      if (data) {
        const unicos = [...new Map(data.map(d => [d.servicio, d])).values()]
        setServiciosBD(unicos)
      }
    })
  }, [])

  // Combinar servicios de BD con los base, sin duplicados
  const todosServicios = useMemo(() => {
    const bdNombres = serviciosBD.map(s => s.servicio)
    const soloBase = SERVICIOS_BASE.filter(s => !bdNombres.includes(s.nombre))
    return [
      ...serviciosBD.map(s => ({ nombre: s.servicio, categoria: s.categoria || 'Otro' })),
      ...soloBase,
    ]
  }, [serviciosBD])

  const filtrados = q
    ? todosServicios.filter(s => s.nombre.toLowerCase().includes(q.toLowerCase()))
    : todosServicios

  // Agrupar por categoría
  const agrupados = useMemo(() => {
    const map = {}
    filtrados.forEach(s => {
      const cat = s.categoria || 'Otro'
      if (!map[cat]) map[cat] = []
      map[cat].push(s)
    })
    return map
  }, [filtrados])

  function sel(nombre) { setQ(nombre); onChange(nombre); setOpen(false) }

  return (
    <div style={{position:'relative'}}>
      <input value={q} onChange={e=>{setQ(e.target.value);onChange(e.target.value);setOpen(true)}}
        onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}
        placeholder="Busca o escribe un servicio..." />
      {open && filtrados.length > 0 && (
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,maxHeight:220,overflowY:'auto',zIndex:50}}>
          {Object.entries(agrupados).map(([cat, items]) => {
            const catInfo = CATEGORIAS_SERVICIOS[cat] || CATEGORIAS_SERVICIOS['Otro']
            return (
              <div key={cat}>
                <div style={{padding:'5px 12px 3px',fontSize:9,fontWeight:700,color:catInfo.color,fontFamily:'var(--mono)',background:'var(--bg3)',letterSpacing:'0.08em',position:'sticky',top:0}}>
                  {catInfo.emoji} {cat.toUpperCase()}
                </div>
                {items.map(s => (
                  <div key={s.nombre} onMouseDown={()=>sel(s.nombre)}
                    style={{padding:'8px 14px',cursor:'pointer',fontSize:13,color:value===s.nombre?'var(--cyan)':'var(--text)',background:value===s.nombre?'rgba(0,212,255,0.08)':'transparent',borderBottom:'1px solid #1e2d4a15',fontFamily:'var(--mono)'}}>
                    {s.nombre}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── SERVICIOS QUE USAN PERFILES vs INDIVIDUALES ──────────
const SERVICIOS_CON_PERFILES = ['Netflix','Netflix extra','Netflix genérico','Disney 4K','Disney HD','HBO HD','HBO 4K','HBO PLATINO','MAX','Spotify','Spotify 3','Youtubep1','Youtubep3','YouTube','Office','Office3','Office12']

// Servicios individuales: cada cuenta tiene su propio correo+contraseña, sin perfiles compartidos
const SERVICIOS_INDIVIDUALES = ['ChatGPT','chatgpt','CHATGPT']
function esServicioIndividual(cuenta) {
  if (!cuenta) return false
  return SERVICIOS_INDIVIDUALES.some(s => cuenta.toLowerCase().includes(s.toLowerCase()))
}

function tienePerfiles(cuenta) {
  if (!cuenta) return false
  return SERVICIOS_CON_PERFILES.some(s => cuenta.toLowerCase().includes(s.toLowerCase()))
}

// Servicios donde el perfil es OBLIGATORIO (bloqueante si no hay)
const SERVICIOS_PERFIL_REQUERIDO = ['Netflix','Disney','HBO','MAX']
function perfilRequerido(cuenta) {
  if (!cuenta) return false
  return SERVICIOS_PERFIL_REQUERIDO.some(s => cuenta.toLowerCase().includes(s.toLowerCase()))
}

function placeholderAcceso(cuenta) {
  const c = cuenta.toLowerCase()
  if (c.includes('spotify'))  return 'Correo o teléfono registrado en Spotify'
  if (c.includes('youtube') || c.includes('youtubep')) return 'Correo de Google del cliente'
  if (c.includes('office'))   return 'Correo de Microsoft del cliente'
  if (c.includes('apple') || c.includes('icloud')) return 'Apple ID del cliente'
  if (c.includes('chatgpt'))  return 'Correo de OpenAI del cliente'
  if (c.includes('canva'))    return 'Correo de Canva del cliente'
  if (c.includes('prime'))    return 'Correo de Amazon del cliente'
  if (c.includes('paramount')) return 'Correo de Paramount del cliente'
  if (c.includes('vix'))      return 'Correo o teléfono en VIX'
  return 'Correo, usuario o teléfono del cliente'
}

function labelAcceso(cuenta) {
  const c = cuenta.toLowerCase()
  if (c.includes('spotify') || c.includes('youtube') || c.includes('youtubep')) return 'CUENTA DEL CLIENTE'
  if (c.includes('office') || c.includes('chatgpt') || c.includes('canva')) return 'CORREO DEL CLIENTE'
  if (c.includes('apple')) return 'APPLE ID DEL CLIENTE'
  return 'ACCESO DEL CLIENTE'
}

// ─── MODAL GESTOR DE SERVICIOS ────────────────────────────
function ModalGestorServicios({ onCerrar }) {
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState({ nombre: '', categoria: 'Streaming', vinculada: '', correo: '', password: '', tipo: 'perfiles' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const set = (k, v) => setForm(p => ({...p,[k]:v}))

  async function cargar() {
    const { data } = await supabase.from('cuentas_maestras').select('id, servicio, categoria, vinculada, correo, tipo').order('categoria').order('servicio')
    setServicios(data || [])
  }
  useEffect(() => { cargar() }, [])

  async function guardar() {
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.categoria) return setError('Selecciona una categoría')
    setSaving(true); setError('')
    try {
      const { error: e } = await supabase.from('cuentas_maestras').insert({
        servicio: form.nombre.trim(),
        categoria: form.categoria,
        vinculada: form.vinculada || null,
        correo: form.correo || null,
        password: form.password || null,
        tipo: form.tipo,
      })
      if (e) throw e
      setForm({ nombre: '', categoria: 'Streaming', vinculada: '', correo: '', password: '', tipo: 'perfiles' })
      cargar()
    } catch(e) { setError(e.message) }
    setSaving(false)
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta cuenta?')) return
    await supabase.from('cuentas_maestras').delete().eq('id', id)
    cargar()
  }

  const filtrados = buscar ? servicios.filter(s =>
    s.servicio?.toLowerCase().includes(buscar.toLowerCase()) ||
    s.categoria?.toLowerCase().includes(buscar.toLowerCase()) ||
    s.vinculada?.toLowerCase().includes(buscar.toLowerCase())
  ) : servicios

  // Agrupar por categoría
  const agrupados = filtrados.reduce((acc, s) => {
    const cat = s.categoria || 'Otro'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <Modal onClose={onCerrar} maxWidth={480}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:17}}>⚙️ Gestionar servicios</div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>

      {/* Formulario nuevo servicio */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'14px',marginBottom:16}}>
        <div style={{fontSize:10,color:'var(--cyan)',fontFamily:'var(--mono)',fontWeight:700,marginBottom:10}}>➕ NUEVO SERVICIO</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div>
            <label style={{fontSize:9}}>NOMBRE *</label>
            <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="ej: Gemini, Grok..." style={{fontSize:12}} />
          </div>
          <div>
            <label style={{fontSize:9}}>CATEGORÍA *</label>
            <select value={form.categoria} onChange={e=>set('categoria',e.target.value)}
              style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:8,padding:'8px 10px',color:'var(--text)',fontSize:12,outline:'none'}}>
              {Object.keys(CATEGORIAS_SERVICIOS).map(c => (
                <option key={c} value={c}>{CATEGORIAS_SERVICIOS[c].emoji} {c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div>
            <label style={{fontSize:9}}>VINCULADA</label>
            <select value={form.vinculada} onChange={e=>set('vinculada',e.target.value)}
              style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:8,padding:'8px 10px',color:'var(--text)',fontSize:12,outline:'none'}}>
              <option value="">Sin vinculada</option>
              {VINCULADAS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:9}}>TIPO</label>
            <select value={form.tipo} onChange={e=>set('tipo',e.target.value)}
              style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:8,padding:'8px 10px',color:'var(--text)',fontSize:12,outline:'none'}}>
              <option value="perfiles">Perfiles compartidos</option>
              <option value="individual">Individual (1 cuenta = 1 cliente)</option>
            </select>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
          <div>
            <label style={{fontSize:9}}>CORREO</label>
            <input value={form.correo} onChange={e=>set('correo',e.target.value)} placeholder="correo@ejemplo.com" style={{fontSize:12,fontFamily:'var(--mono)'}} />
          </div>
          <div>
            <label style={{fontSize:9}}>CONTRASEÑA</label>
            <input value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" style={{fontSize:12,fontFamily:'var(--mono)'}} />
          </div>
        </div>

        {error && <div style={{color:'var(--red)',fontSize:11,marginBottom:8}}>⚠️ {error}</div>}

        <button onClick={guardar} disabled={saving} className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'9px',fontSize:13}}>
          {saving ? 'Guardando...' : '✓ Crear servicio'}
        </button>
      </div>

      {/* Lista de servicios existentes */}
      <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="🔍 Buscar servicio..." style={{marginBottom:10,fontSize:12}} />

      <div style={{maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:6}}>
        {Object.entries(agrupados).map(([cat, items]) => {
          const catInfo = CATEGORIAS_SERVICIOS[cat] || CATEGORIAS_SERVICIOS['Otro']
          return (
            <div key={cat}>
              <div style={{fontSize:9,fontWeight:700,color:catInfo.color,fontFamily:'var(--mono)',padding:'4px 2px',letterSpacing:'0.08em'}}>
                {catInfo.emoji} {cat.toUpperCase()} ({items.length})
              </div>
              {items.map(s => (
                <div key={s.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 10px',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:12,fontWeight:700,fontFamily:'var(--mono)',color:'var(--text)'}}>{s.servicio}</span>
                    {s.vinculada && <span style={{fontSize:10,color:'var(--purple)',marginLeft:6}}>{s.vinculada}</span>}
                    {s.correo && <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.correo}</div>}
                  </div>
                  <span style={{fontSize:9,color:catInfo.color,background:`${catInfo.color}15`,border:`1px solid ${catInfo.color}30`,borderRadius:4,padding:'1px 5px',flexShrink:0}}>{s.tipo||'perfiles'}</span>
                  <button onClick={()=>eliminar(s.id)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:12,opacity:0.5,flexShrink:0}}>🗑️</button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

// ─── MODAL BITÁCORA ───────────────────────────────────────
function ModalBitacora({ onCerrar }) {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from('bitacora')
        .select('*').order('created_at', { ascending: false }).limit(100)
      setRegistros(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const ACCION_INFO = {
    COBRAR:           { emoji:'✅', color:'var(--green)' },
    DESHACER_COBRO:   { emoji:'↩️', color:'var(--orange)' },
    RENOVAR:          { emoji:'🔄', color:'var(--cyan)' },
    CANCELAR:         { emoji:'❌', color:'var(--orange)' },
    ELIMINAR_SERVICIO:{ emoji:'🗑️', color:'var(--red)' },
    ELIMINAR_CLIENTE: { emoji:'👤🗑️', color:'var(--red)' },
    NUEVO_SERVICIO:   { emoji:'➕', color:'var(--purple)' },
  }

  function formatHora(ts) {
    const d = new Date(ts)
    return d.toLocaleDateString('es-MX', { day:'2-digit', month:'short' }) + ' ' +
      d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:17}}>📋 Bitácora de acciones</div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>
      {loading ? (
        <div style={{textAlign:'center',padding:20,color:'var(--text3)',fontFamily:'var(--mono)'}}>⏳ Cargando...</div>
      ) : registros.length === 0 ? (
        <div style={{textAlign:'center',padding:20,color:'var(--text3)'}}>Sin registros aún</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:420,overflowY:'auto'}}>
          {registros.map(r => {
            const info = ACCION_INFO[r.accion] || { emoji:'⚡', color:'var(--text3)' }
            return (
              <div key={r.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:9,padding:'9px 12px',display:'flex',gap:10,alignItems:'flex-start'}}>
                <div style={{fontSize:16,flexShrink:0,marginTop:1}}>{info.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:11,fontWeight:700,color:info.color,fontFamily:'var(--mono)'}}>{r.accion}</span>
                    {r.cliente_nombre && <span style={{fontSize:11,color:'var(--text)',fontWeight:600}}>{r.cliente_nombre}</span>}
                  </div>
                  {r.detalle?.cuenta && <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)'}}>{r.detalle.cuenta}{r.detalle.precio ? ` · $${r.detalle.precio}` : ''}{r.detalle.nueva_fecha ? ` → ${r.detalle.nueva_fecha}` : ''}</div>}
                  <div style={{display:'flex',gap:8,marginTop:3,alignItems:'center'}}>
                    <span style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--mono)'}}>{formatHora(r.created_at)}</span>
                    <span style={{fontSize:9,color:'var(--purple)',background:'rgba(157,78,221,0.12)',padding:'1px 5px',borderRadius:3,fontFamily:'var(--mono)'}}>{r.usuario}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

// ─── MODAL NUEVO/AGREGAR SERVICIO ─────────────────────────
function ModalServicio({ onGuardar, onCerrar, clienteNombre, clienteId }) {
  const [form, setForm] = useState({ nombre: clienteNombre || '', cuenta: '', precio: '', fecha: '', tel: '', notas: '', accesoCliente: '', correoIndividual: '', passIndividual: '' })
  const [perfilesDisp, setPerfilesDisp] = useState([])
  const [perfilSel, setPerfilSel] = useState(null)
  const [loadingPerfiles, setLoadingPerfiles] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [guardado, setGuardado] = useState(null)
  const set = (k, v) => { setForm(p => ({...p,[k]:v})); setError('') }

  const esConPerfiles = tienePerfiles(form.cuenta)
  const esPRequerido = perfilRequerido(form.cuenta)
  const esIndividual = esServicioIndividual(form.cuenta)

  // Cargar perfiles disponibles cuando cambia la cuenta — SIN filtrar por vinculada
  useEffect(() => {
    if (!form.cuenta || !esConPerfiles) { setPerfilesDisp([]); setPerfilSel(null); return }
    async function cargarPerfiles() {
      setLoadingPerfiles(true); setPerfilSel(null)
      // Buscar por las primeras palabras del servicio para mayor compatibilidad
      const palabras = form.cuenta.toLowerCase().split(' ')
      const keyword = palabras[0] === 'hbo' ? 'hbo' : palabras[0] === 'netflix' ? 'netflix' : palabras[0] === 'disney' ? 'disney' : palabras[0] === 'max' ? 'max' : palabras[0]

      const { data: cuentas } = await supabase
        .from('cuentas_maestras')
        .select('id, servicio, vinculada, correo, password')
        .ilike('servicio', `%${keyword}%`)

      if (!cuentas || cuentas.length === 0) { setPerfilesDisp([]); setLoadingPerfiles(false); return }

      const { data: perfiles } = await supabase
        .from('perfiles_espacios')
        .select('*')
        .in('cuenta_id', cuentas.map(c => c.id))
        .is('servicio_id', null)

      const disponibles = (perfiles || [])
        .filter(p => !p.cliente_nombre || p.cliente_nombre.toUpperCase() === 'DISPONIBLE' || (p.notas||'').toUpperCase() === 'DISPONIBLE')
        .map(p => ({ ...p, cuentas_maestras: cuentas.find(c => c.id === p.cuenta_id) }))

      setPerfilesDisp(disponibles)
      setLoadingPerfiles(false)
    }
    cargarPerfiles()
  }, [form.cuenta, esConPerfiles])

  async function guardar() {
    if (!form.nombre.trim() && !clienteId) return setError('El nombre es obligatorio')
    if (!form.cuenta.trim()) return setError('El servicio es obligatorio')
    if (!form.fecha) return setError('La fecha es obligatoria')
    if (esPRequerido && !perfilSel) return setError('Selecciona un perfil disponible')
    if (esIndividual && !form.correoIndividual.trim()) return setError('El correo de la cuenta es obligatorio')
    setSaving(true); setError('')
    try {
      let cId = clienteId
      if (!cId) {
        const { data: existing } = await supabase.from('clientes').select('id').eq('nombre', form.nombre.trim()).single()
        if (existing) { cId = existing.id }
        else {
          const { data: nuevo, error: e } = await supabase.from('clientes').insert({ nombre: form.nombre.trim(), telefono: form.tel || null }).select().single()
          if (e) throw e
          cId = nuevo.id
        }
      }

      // La vinculada se toma del perfil seleccionado si existe
      const vinculadaFinal = perfilSel?.cuentas_maestras?.vinculada || form.cuenta || null

      const { data: svcData, error: e2 } = await supabase.from('servicios').insert({
        cliente_id: cId,
        cuenta: form.cuenta.trim(),
        vinculada: vinculadaFinal,
        precio: parseFloat(form.precio) || 0,
        fecha_vencimiento: form.fecha,
        notas: form.notas || null,
        estado: 'PENDIENTE',
        perfil_id: perfilSel?.id || null,
        acceso_cliente: form.accesoCliente || null,
      }).select().single()
      if (e2) throw e2

      if (perfilSel) {
        await supabase.from('perfiles_espacios').update({
          cliente_id: cId,
          cliente_nombre: form.nombre.trim() || clienteNombre,
          servicio_id: svcData.id,
          fecha_vencimiento: form.fecha,
          correo_cliente: form.accesoCliente || null,
          notas: null,
        }).eq('id', perfilSel.id)
      }

      onGuardar()
      await registrarBitacora('admin', 'NUEVO_SERVICIO', 'servicios', svcData.id, { cuenta: form.cuenta, precio: parseFloat(form.precio)||0, fecha: form.fecha }, form.nombre.trim() || clienteNombre)
      const tel = form.tel || form.nombre.replace(/\D/g,'')

      // Para servicios individuales, guardar también los datos de la cuenta
      let cuentaIndividualData = null
      if (esIndividual) {
        // Crear cuenta maestra individual para este cliente
        const { data: cmData } = await supabase.from('cuentas_maestras').insert({
          servicio: form.cuenta.trim(),
          vinculada: null,
          correo: form.correoIndividual.trim(),
          password: form.passIndividual.trim() || null,
          tipo: 'individual',
          notas: form.nombre.trim() || clienteNombre,
        }).select().single()

        if (cmData) {
          cuentaIndividualData = cmData
          // Crear perfil_espacio vinculado a esta cuenta y al servicio
          const { data: pData } = await supabase.from('perfiles_espacios').insert({
            cuenta_id: cmData.id,
            perfil: '1',
            cliente_id: cId,
            cliente_nombre: form.nombre.trim() || clienteNombre,
            servicio_id: svcData.id,
            fecha_vencimiento: form.fecha,
            correo_cliente: form.accesoCliente || null,
            notas: null,
          }).select().single()
          if (pData) {
            // Enlazar el perfil al servicio
            await supabase.from('servicios').update({ perfil_id: pData.id, vinculada: null }).eq('id', svcData.id)
          }
        }
      }

      setGuardado({
        perfil: perfilSel,
        cuentaIndividual: cuentaIndividualData,
        nombre: form.nombre.trim() || clienteNombre,
        tel,
        cuenta: form.cuenta,
        fecha: form.fecha,
        accesoCliente: form.accesoCliente,
        correoIndividual: form.correoIndividual,
      })
    } catch(e) { setError('Error al guardar: ' + e.message); setSaving(false) }
  }

  // Pantalla de confirmación con WhatsApp
  if (guardado) {
    const cm = guardado.perfil?.cuentas_maestras
    const tel = guardado.tel?.replace(/\D/g,'')
    const msg = [
      `Hola! Tu servicio *${guardado.cuenta}* ha sido activado ✅`,
      ``,
      `📅 Vence: *${formatFecha(guardado.fecha)}*`,
      guardado.perfil ? `📺 Perfil: *${guardado.perfil.perfil}*` : '',
      guardado.perfil?.pin ? `🔐 PIN: *${guardado.perfil.pin}*` : '',
      guardado.accesoCliente ? `👤 Tu acceso: *${guardado.accesoCliente}*` : '',
      ``,
      `Cualquier duda escríbenos 😊`,
      `📲 Soporte StreamBit: *664 410 1852*`,
    ].filter(Boolean).join('\n')

    return (
      <Modal onClose={onCerrar}>
        <div style={{textAlign:'center',paddingBottom:8}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontWeight:800,fontSize:18,marginBottom:6}}>Servicio activado</div>
          <div style={{fontSize:13,color:'var(--text2)',marginBottom:20}}>{guardado.nombre} · {guardado.cuenta}</div>
          {guardado.perfil && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 14px',marginBottom:16,textAlign:'left'}}>
              <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:8}}>DATOS DEL PERFIL</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6}}>
                <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color:'var(--cyan)'}}>Perfil {guardado.perfil.perfil}</span>
                {guardado.perfil.pin && <span style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:5,padding:'2px 8px',fontSize:12,fontWeight:700,color:'var(--yellow)',fontFamily:'var(--mono)'}}>PIN: {guardado.perfil.pin}</span>}
                {cm?.vinculada && <span style={{fontSize:11,color:'var(--purple)',background:'rgba(157,78,221,0.15)',padding:'2px 8px',borderRadius:5}}>{cm.vinculada}</span>}
              </div>
              {cm?.correo && <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)'}}>📧 {cm.correo}</div>}
              {cm?.password && <div style={{fontSize:11,color:'var(--text3)',marginTop:2,fontFamily:'var(--mono)'}}>🔑 {cm.password}</div>}
            </div>
          )}
          {tel && tel.length >= 10 ? (
            <a href={`https://wa.me/52${tel}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer"
              style={{display:'block',background:'#25D366',color:'#fff',borderRadius:10,padding:'12px',fontWeight:700,fontSize:14,textDecoration:'none',marginBottom:10}}>
              📲 Enviar datos por WhatsApp
            </a>
          ) : (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:12,color:'var(--text3)'}}>
              Sin teléfono — copia los datos manualmente
            </div>
          )}
          <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}} onClick={onCerrar}>Cerrar</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontWeight:800,fontSize:18}}>{clienteId ? '➕ Agregar servicio' : '➕ Nuevo cliente'}</div>
          {clienteNombre && <div style={{fontSize:12,color:'var(--text2)',marginTop:2,fontFamily:'var(--mono)'}}>{clienteNombre}</div>}
        </div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>

      {!clienteId && (
        <div style={{marginBottom:12}}>
          <label>NOMBRE O WHATSAPP *</label>
          <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Ej: 664 123 4567" />
        </div>
      )}

      <div style={{marginBottom:12}}>
        <label>SERVICIO *</label>
        <BuscadorServicio value={form.cuenta} onChange={v=>set('cuenta',v)} />
      </div>

      {/* SELECTOR DE PERFIL — muestra TODOS los disponibles sin filtrar por vinculada */}
      {form.cuenta && esConPerfiles && (
        <div style={{marginBottom:12}}>
          <label>{esPRequerido ? 'PERFIL DISPONIBLE *' : 'PERFIL / ESPACIO (opcional)'}</label>
          {loadingPerfiles ? (
            <div style={{fontSize:12,color:'var(--text3)',padding:'8px 0',fontFamily:'var(--mono)'}}>⏳ Buscando perfiles...</div>
          ) : perfilesDisp.length === 0 ? (
            <div style={{background:'#1a0800',border:'1px solid #ff8c0030',borderRadius:8,padding:'8px 12px',fontSize:12,color:'var(--orange)'}}>
              ⚠️ No hay perfiles disponibles para {form.cuenta} — todos ocupados
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {perfilesDisp.map(p => {
                const cm = p.cuentas_maestras
                const sel = perfilSel?.id === p.id
                return (
                  <button key={p.id} onClick={()=>setPerfilSel(sel?null:p)} style={{
                    background:sel?'rgba(0,212,255,0.12)':'var(--bg2)',
                    border:`1px solid ${sel?'var(--cyan)':'var(--border)'}`,
                    borderRadius:8,padding:'7px 10px',cursor:'pointer',textAlign:'left',transition:'all .15s',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:26,height:26,borderRadius:5,background:sel?'rgba(0,212,255,0.2)':'var(--bg3)',border:`1px solid ${sel?'var(--cyan)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:sel?'var(--cyan)':'var(--text2)',flexShrink:0}}>{p.perfil}</div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <span style={{fontSize:12,fontWeight:700,color:sel?'var(--cyan)':'var(--text)',fontFamily:'var(--mono)'}}>{cm?.servicio}</span>
                          <span style={{fontSize:10,color:'var(--purple)',background:'rgba(157,78,221,0.15)',padding:'1px 6px',borderRadius:4}}>{cm?.vinculada}</span>
                        </div>
                        {cm?.correo && <div style={{fontSize:10,color:'var(--text3)',marginTop:1}}>{cm.correo}</div>}
                      </div>
                      {p.pin && <div style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px',fontSize:10,fontWeight:700,color:'var(--yellow)',fontFamily:'var(--mono)'}}>{p.pin}</div>}
                      {sel && <span style={{color:'var(--cyan)'}}>✓</span>}
                    </div>
                    {cm?.password && sel && <div style={{marginTop:4,fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)'}}>🔑 {cm.password}</div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Campos especiales para servicios individuales (ChatGPT) */}
      {form.cuenta && esIndividual && (
        <div style={{marginBottom:12,background:'rgba(157,78,221,0.08)',border:'1px solid rgba(157,78,221,0.25)',borderRadius:10,padding:'12px'}}>
          <div style={{fontSize:10,color:'var(--purple)',fontFamily:'var(--mono)',fontWeight:700,marginBottom:8}}>🤖 CUENTA INDIVIDUAL</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div>
              <label style={{fontSize:9}}>CORREO DE LA CUENTA *</label>
              <input value={form.correoIndividual} onChange={e=>set('correoIndividual',e.target.value)}
                placeholder="correo@openai.com" style={{fontFamily:'var(--mono)',fontSize:12}} />
            </div>
            <div>
              <label style={{fontSize:9}}>CONTRASEÑA</label>
              <input value={form.passIndividual} onChange={e=>set('passIndividual',e.target.value)}
                placeholder="••••••••" style={{fontFamily:'var(--mono)',fontSize:12}} />
            </div>
          </div>
        </div>
      )}

      {/* Acceso del cliente */}
      {form.cuenta && (
        <div style={{marginBottom:12}}>
          <label>{labelAcceso(form.cuenta)}</label>
          <input value={form.accesoCliente||''} onChange={e=>set('accesoCliente',e.target.value)} placeholder={placeholderAcceso(form.cuenta)} style={{fontFamily:'var(--mono)'}} />
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div>
          <label>PRECIO (MXN)</label>
          <input value={form.precio} onChange={e=>set('precio',e.target.value)} placeholder="95" type="number" style={{fontFamily:'var(--mono)'}} />
        </div>
        <div>
          <SelectorFecha value={form.fecha} onChange={v=>set('fecha',v)} label="FECHA VENC. *" />
        </div>
      </div>

      {!clienteId && (
        <div style={{marginBottom:12}}>
          <label>TELÉFONO WHATSAPP</label>
          <input value={form.tel} onChange={e=>set('tel',e.target.value)} placeholder="6641234567" type="tel" style={{fontFamily:'var(--mono)'}} />
        </div>
      )}

      <div style={{marginBottom:16}}>
        <label>NOTAS</label>
        <input value={form.notas} onChange={e=>set('notas',e.target.value)} placeholder="Ej: Notas adicionales" />
      </div>

      {error && <div style={{background:'#1a0008',border:'1px solid #ff336630',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'var(--red)'}}>⚠️ {error}</div>}

      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : '✓ Guardar'}
      </button>
    </Modal>
  )
}

// ─── MODAL COBRAR + RENOVAR ───────────────────────────────
function ModalCobrarRenovar({ servicio, cliente, onGuardar, onCerrar }) {
  const [fecha, setFecha] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function confirmar() {
    if (!fecha) return setError('Selecciona la nueva fecha de vencimiento')
    setSaving(true); setError('')
    try {
      const { error: e } = await supabase.from('servicios').update({
        cobrado: fechaHoy(),
        cobrado_en: fechaHoy(),
        estado: 'ACTIVO',
        fecha_vencimiento: fecha,
        notas: notas ? (servicio.notas ? servicio.notas + ' | ' + notas : notas) : servicio.notas,
      }).eq('id', servicio.id)
      if (e) throw e
      // Sincronizar fecha en el perfil enlazado
      if (servicio.perfil_id) {
        await supabase.from('perfiles_espacios').update({ fecha_vencimiento: fecha }).eq('id', servicio.perfil_id)
      }
      onGuardar(); onCerrar()
    } catch(e) { setError('Error: ' + e.message); setSaving(false) }
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontWeight:800,fontSize:18}}>✅ Cobrar y Renovar</div>
          <div style={{fontSize:12,color:'var(--text2)',fontFamily:'var(--mono)',marginTop:2}}>{cliente} · {servicio.cuenta}</div>
        </div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>
      {/* Info actual */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:3}}>VENCIMIENTO ACTUAL</div>
          <div style={{fontSize:14,fontWeight:700,fontFamily:'var(--mono)',color:'var(--text)'}}>{formatFecha(servicio.fecha_vencimiento)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:3}}>SE REGISTRARÁ</div>
          <div style={{fontSize:12,fontWeight:700,color:'var(--green)',fontFamily:'var(--mono)'}}>Cobrado hoy ✅</div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <SelectorFecha value={fecha} onChange={setFecha} label="NUEVA FECHA DE VENCIMIENTO *" />
      </div>
      <div style={{marginBottom:20}}>
        <label>NOTAS (opcional)</label>
        <input value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Ej: Pagó en efectivo, renovó 3 meses..." />
      </div>
      {error && <div style={{background:'#1a0008',border:'1px solid #ff336630',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'var(--red)'}}>⚠️ {error}</div>}
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={confirmar} disabled={saving}>
        {saving ? 'Guardando...' : fecha ? `✅ Cobrar y renovar → ${formatFecha(fecha)}` : '✅ Cobrar y renovar'}
      </button>
    </Modal>
  )
}

// ─── MODAL RENOVAR ────────────────────────────────────────
function ModalRenovar({ servicio, cliente, onRenovar, onCerrar }) {
  const [fecha, setFecha] = useState('')
  const [precio, setPrecio] = useState(String(servicio.precio || ''))
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const yaCobrado = !!servicio.cobrado

  async function renovar() {
    if (!fecha) return setError('Selecciona una fecha')
    setSaving(true); setError('')
    try {
      const updates = {
        fecha_vencimiento: fecha,
        estado: 'PENDIENTE',
        cobrado: null,
        precio: parseFloat(precio) || servicio.precio,
      }
      if (notas) updates.notas = servicio.notas ? servicio.notas + ' | ' + notas : notas
      const { error: e } = await supabase.from('servicios').update(updates).eq('id', servicio.id)
      if (e) throw e
      if (servicio.perfil_id) {
        await supabase.from('perfiles_espacios').update({ fecha_vencimiento: fecha }).eq('id', servicio.perfil_id)
      }
      await registrarBitacora('admin', 'RENOVAR', 'servicios', servicio.id, { cuenta: servicio.cuenta, nueva_fecha: fecha, precio: parseFloat(precio)||servicio.precio }, cliente)
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
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <div style={{flex:1,background:yaCobrado?'#001a0e':'#1a0800',border:`1px solid ${yaCobrado?'#00ff8840':'#ff8c0040'}`,borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:2}}>COBRO</div>
          <div style={{fontSize:12,fontWeight:700,color:yaCobrado?'var(--green)':'var(--orange)'}}>
            {yaCobrado ? `✅ ${formatFecha(servicio.cobrado)}` : '⏳ Pendiente'}
          </div>
        </div>
        <div style={{flex:1,background:'#001a14',border:'1px solid #00d4ff20',borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:2}}>VENCE</div>
          <div style={{fontSize:12,fontWeight:700,color:'var(--cyan)',fontFamily:'var(--mono)'}}>
            {formatFecha(servicio.fecha_vencimiento)}
          </div>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <SelectorFecha value={fecha} onChange={setFecha} label="NUEVA FECHA DE VENCIMIENTO" />
      </div>
      <div style={{marginBottom:14}}>
        <label>PRECIO (MXN) — actualiza si cambió</label>
        <input value={precio} onChange={e=>setPrecio(e.target.value)} type="number" placeholder="95" style={{fontFamily:'var(--mono)'}} />
      </div>
      <div style={{marginBottom:14}}>
        <label>NOTAS (opcional)</label>
        <input value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Ej: Renovó 3 meses..." />
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
    accesoCliente: servicio.acceso_cliente || '',
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
        acceso_cliente: form.accesoCliente || null,
      }).eq('id', servicio.id)
      if (e) throw e
      // Sincronizar fecha en perfil si está enlazado
      if (servicio.perfil_id) {
        await supabase.from('perfiles_espacios').update({
          fecha_vencimiento: form.fecha,
          correo_cliente: form.accesoCliente || null,
        }).eq('id', servicio.perfil_id)
      }
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

      {form.cuenta && (
        <div style={{marginBottom:14}}>
          <label>{labelAcceso(form.cuenta)}</label>
          <input value={form.accesoCliente} onChange={e=>set('accesoCliente',e.target.value)}
            placeholder={placeholderAcceso(form.cuenta)} style={{fontFamily:'var(--mono)'}} />
        </div>
      )}

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

// ─── MODAL EDITAR CLIENTE ────────────────────────────────
function ModalEditarCliente({ cliente, serviciosCliente, onGuardar, onCerrar }) {
  const [nombre, setNombre] = useState(cliente.nombre || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // Para vincular perfiles manualmente
  const [perfilesDisp, setPerfilesDisp] = useState([])
  const [loadingPerfiles, setLoadingPerfiles] = useState(false)
  const [svcSelId, setSvcSelId] = useState(null) // servicio seleccionado para vincular
  const [perfilSel, setPerfilSel] = useState(null)
  const [vinculando, setVinculando] = useState(false)

  // Servicios sin perfil asignado
  const svcSinPerfil = (serviciosCliente || []).filter(s => !s.perfil_id)

  async function cargarPerfilesPara(svc) {
    setSvcSelId(svc.id); setPerfilSel(null)
    setLoadingPerfiles(true)
    const keyword = svc.cuenta.split(' ')[0].toLowerCase()

    // Buscar cuentas maestras que coincidan
    const { data: cuentas } = await supabase
      .from('cuentas_maestras')
      .select('id, servicio, vinculada, correo, password')
      .ilike('servicio', `%${keyword}%`)

    if (!cuentas || cuentas.length === 0) { setPerfilesDisp([]); setLoadingPerfiles(false); return }

    const cuentaIds = cuentas.map(c => c.id)

    const { data: perfiles } = await supabase
      .from('perfiles_espacios')
      .select('*')
      .in('cuenta_id', cuentaIds)
      .is('servicio_id', null)

    const disponibles = (perfiles || [])
      .filter(p => !p.cliente_nombre || p.cliente_nombre.toUpperCase() === 'DISPONIBLE' || (p.notas||'').toUpperCase() === 'DISPONIBLE')
      .map(p => ({ ...p, cuentas_maestras: cuentas.find(c => c.id === p.cuenta_id) }))

    setPerfilesDisp(disponibles)
    setLoadingPerfiles(false)
  }

  async function vincularPerfil() {
    if (!svcSelId || !perfilSel) return
    setVinculando(true)
    try {
      // Actualizar servicio con perfil_id
      await supabase.from('servicios').update({ perfil_id: perfilSel.id }).eq('id', svcSelId)
      // Actualizar perfil con datos del cliente
      const svc = svcSinPerfil.find(s => s.id === svcSelId)
      await supabase.from('perfiles_espacios').update({
        cliente_id: cliente.id,
        cliente_nombre: nombre.trim() || cliente.nombre,
        servicio_id: svcSelId,
        fecha_vencimiento: svc?.fecha_vencimiento || null,
        notas: null,
      }).eq('id', perfilSel.id)
      setSvcSelId(null); setPerfilSel(null); setPerfilesDisp([])
      onGuardar()
    } catch(e) { setError('Error al vincular: ' + e.message) }
    setVinculando(false)
  }

  async function guardar() {
    if (!nombre.trim()) return setError('El nombre es obligatorio')
    setSaving(true); setError('')
    try {
      const { error: e } = await supabase.from('clientes').update({
        nombre: nombre.trim(),
        // Auto-extraer teléfono del nombre si es número
        telefono: nombre.trim().replace(/\D/g,'').length >= 10 ? nombre.trim().replace(/\D/g,'') : cliente.telefono,
      }).eq('id', cliente.id)
      if (e) throw e
      onGuardar(); onCerrar()
    } catch(e) { setError('Error: ' + e.message); setSaving(false) }
  }

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div style={{fontWeight:800,fontSize:18}}>👤 Editar cliente</div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>

      {/* Nombre */}
      <div style={{marginBottom:16}}>
        <label>NOMBRE *</label>
        <input value={nombre} onChange={e=>{setNombre(e.target.value);setError('')}} placeholder="Nombre o número de teléfono" />
        <div style={{fontSize:10,color:'var(--text3)',marginTop:4}}>💡 Si el nombre es el número, el botón WhatsApp funcionará automáticamente</div>
      </div>

      {/* Vincular perfiles */}
      {svcSinPerfil.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:'var(--cyan)',fontWeight:700,fontFamily:'var(--mono)',marginBottom:8}}>🔗 VINCULAR A PERFIL/CUENTA</div>
          <div style={{fontSize:11,color:'var(--text3)',marginBottom:8}}>Servicios sin perfil asignado:</div>
          <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:10}}>
            {svcSinPerfil.map(s => (
              <button key={s.id} onClick={()=>cargarPerfilesPara(s)} style={{
                background:svcSelId===s.id?'rgba(0,212,255,0.12)':'var(--bg2)',
                border:`1px solid ${svcSelId===s.id?'var(--cyan)':'var(--border)'}`,
                borderRadius:8,padding:'8px 12px',cursor:'pointer',textAlign:'left',
                display:'flex',alignItems:'center',gap:8,
              }}>
                <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700,color:svcSelId===s.id?'var(--cyan)':'var(--text)'}}>{s.cuenta}</span>
                {s.vinculada && <span style={{fontSize:10,color:'var(--purple)',background:'rgba(157,78,221,0.15)',padding:'1px 6px',borderRadius:4}}>{s.vinculada}</span>}
                <span style={{fontSize:10,color:'var(--text3)',marginLeft:'auto'}}>{formatFecha(s.fecha_vencimiento)}</span>
              </button>
            ))}
          </div>

          {/* Perfiles disponibles para el servicio seleccionado */}
          {svcSelId && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:8}}>PERFILES DISPONIBLES</div>
              {loadingPerfiles ? (
                <div style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>⏳ Buscando...</div>
              ) : perfilesDisp.length === 0 ? (
                <div style={{fontSize:12,color:'var(--orange)'}}>⚠️ No hay perfiles disponibles para este servicio</div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:8}}>
                  {perfilesDisp.map(p => {
                    const cm = p.cuentas_maestras
                    const sel = perfilSel?.id === p.id
                    return (
                      <button key={p.id} onClick={()=>setPerfilSel(sel?null:p)} style={{
                        background:sel?'rgba(0,212,255,0.12)':'var(--bg3)',
                        border:`1px solid ${sel?'var(--cyan)':'var(--border)'}`,
                        borderRadius:7,padding:'7px 10px',cursor:'pointer',textAlign:'left',
                        display:'flex',alignItems:'center',gap:8,
                      }}>
                        <div style={{width:26,height:26,borderRadius:5,background:sel?'rgba(0,212,255,0.2)':'var(--bg2)',border:`1px solid ${sel?'var(--cyan)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:sel?'var(--cyan)':'var(--text2)',flexShrink:0}}>{p.perfil}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:700,color:sel?'var(--cyan)':'var(--text)',fontFamily:'var(--mono)'}}>{cm?.servicio} · {cm?.vinculada}</div>
                          {cm?.correo && <div style={{fontSize:10,color:'var(--text3)'}}>{cm.correo}</div>}
                        </div>
                        {p.pin && <div style={{fontSize:10,fontWeight:700,color:'var(--yellow)',fontFamily:'var(--mono)',background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px'}}>{p.pin}</div>}
                        {sel && <span style={{color:'var(--cyan)'}}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {perfilSel && (
                <button onClick={vincularPerfil} disabled={vinculando} style={{
                  background:'var(--cyan)',color:'var(--bg)',border:'none',borderRadius:7,
                  padding:'7px',cursor:'pointer',fontSize:12,fontWeight:700,width:'100%',
                }}>
                  {vinculando ? 'Vinculando...' : `🔗 Vincular perfil ${perfilSel.perfil}`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {svcSinPerfil.length === 0 && (
        <div style={{background:'#001a0e',border:'1px solid #00ff8820',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:11,color:'var(--green)'}}>
          ✅ Todos los servicios tienen perfil asignado
        </div>
      )}

      {error && <div style={{background:'#1a0008',border:'1px solid #ff336630',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'var(--red)'}}>⚠️ {error}</div>}

      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : '✓ Guardar nombre'}
      </button>
    </Modal>
  )
}

// ─── MODAL HISTORIAL CLIENTE ──────────────────────────────
function ModalHistorial({ cliente, onCerrar }) {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('servicios')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
      setServicios(data || [])
      setLoading(false)
    }
    cargar()
  }, [cliente.id])

  const totalGastado = servicios.reduce((s,sv) => s + parseFloat(sv.precio||0), 0)
  const cobrados = servicios.filter(s => s.cobrado)
  const activos = servicios.filter(s => !s.cancelado)

  return (
    <Modal onClose={onCerrar}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontWeight:800,fontSize:18}}>📋 Historial</div>
          <div style={{fontSize:12,color:'var(--text2)',fontFamily:'var(--mono)',marginTop:2}}>{cliente.nombre}</div>
        </div>
        <button className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={onCerrar}>✕</button>
      </div>

      {/* Stats rápidas */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:16}}>
        {[
          {label:'SERVICIOS',val:activos.length,color:'var(--cyan)'},
          {label:'COBRADOS',val:cobrados.length,color:'var(--green)'},
          {label:'TOTAL',val:`$${totalGastado.toLocaleString()}`,color:'var(--yellow)'},
        ].map(stat => (
          <div key={stat.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
            <div style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--mono)',marginBottom:3}}>{stat.label}</div>
            <div style={{fontSize:15,fontWeight:800,color:stat.color,fontFamily:'var(--mono)'}}>{stat.val}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'30px 0',color:'var(--text3)',fontFamily:'var(--mono)',fontSize:12}}>⏳ Cargando...</div>
      ) : servicios.length === 0 ? (
        <div style={{textAlign:'center',padding:'30px 0',color:'var(--text3)',fontFamily:'var(--mono)',fontSize:12}}>Sin historial</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {servicios.map(s => {
            const cancelado = (s.notas||'').startsWith('CANCELADO') || s.cancelado
            const d = diasRestantes(s.fecha_vencimiento)
            return (
              <div key={s.id} style={{
                background:'var(--bg2)',border:`1px solid ${cancelado?'#ff336620':s.cobrado?'#00ff8820':'var(--border)'}`,
                borderRadius:8,padding:'10px 12px',opacity:cancelado?0.5:1,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700,flex:1}}>{s.cuenta}</span>
                  {s.vinculada && <span style={{fontSize:10,color:'var(--purple)',background:'rgba(157,78,221,0.15)',padding:'1px 6px',borderRadius:4}}>{s.vinculada}</span>}
                  <span style={{fontSize:12,fontWeight:700,color:'var(--green)',fontFamily:'var(--mono)'}}>${parseFloat(s.precio||0).toLocaleString()}</span>
                </div>
                <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)'}}>📅 {formatFecha(s.fecha_vencimiento)}</span>
                  {s.cobrado && <span style={{fontSize:10,color:'var(--green)',fontFamily:'var(--mono)'}}>✅ {formatFecha(s.cobrado)}</span>}
                  {cancelado && <span style={{fontSize:10,color:'var(--red)'}}>❌ Cancelado</span>}
                  {!cancelado && !s.cobrado && <BadgeDias d={d}/>}
                  {s.notas && !cancelado && <span style={{fontSize:10,color:'var(--text3)'}}>📝 {s.notas}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
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
// ─── BITÁCORA ─────────────────────────────────────────────
async function registrarBitacora(usuario, accion, entidad, entidad_id, detalle, cliente_nombre) {
  try {
    await supabase.from('bitacora').insert({
      usuario, accion,
      entidad: entidad || null,
      entidad_id: entidad_id || null,
      detalle: detalle || null,
      cliente_nombre: cliente_nombre || null,
    })
  } catch(e) { console.warn('Bitácora error:', e) }
}

const FILTROS = [
  {val:'todos',    label:'Todos'},
  {val:'vencidos', label:'💀 Vencidos'},
  {val:'hoy',      label:'🔴 Hoy'},
  {val:'3dias',    label:'🔴 ≤3d'},
  {val:'cobrados', label:'✅ Cobrados'},
  {val:'pendientes',label:'⏳ Pendientes'},
]

function App({ sesion, onLogout }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState('3dias')
  const [filtroVinc, setFiltroVinc] = useState('')
  const [orden, setOrden] = useState('fecha')
  const [verRes, setVerRes] = useState(false)
  const [ultimaAct, setUltimaAct] = useState(null)
  const [modalForm, setModalForm] = useState(null)
  const [modalGestorServicios, setModalGestorServicios] = useState(false)
  const [modalBitacora, setModalBitacora] = useState(false)
  const [modalRenovar, setModalRenovar] = useState(null)
  const [modalCobrarRenovar, setModalCobrarRenovar] = useState(null)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalEditarCliente, setModalEditarCliente] = useState(null)
  const [modalHistorial, setModalHistorial] = useState(null)
  const [modalConfirm, setModalConfirm] = useState(null)
  const [notif, setNotif] = useState({})
  const [toast, setToast] = useState(null)
  const [vista, setVista] = useState('cobros')
  const esAdmin = sesion.rol === 'admin'

  function mostrarToast(msg, tipo = 'ok') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 2500)
  }

  const cargarDatos = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data: serviciosData, error: e } = await supabase
        .from('servicios')
        .select('*, clientes(id, nombre, telefono), perfiles_espacios!servicios_perfil_id_fkey(id, perfil, pin, cuenta_id, cuentas_maestras(servicio, vinculada))')
        .eq('cancelado', false)
        .order('fecha_vencimiento', { ascending: true })
      if (e) throw e

      // Agrupar por cliente
      const mapa = new Map()
      for (const s of serviciosData) {
        const c = s.clientes
        if (!c) continue
        if (!mapa.has(c.id)) mapa.set(c.id, { cliente: c, servicios: [] })
        mapa.get(c.id).servicios.push({
          ...s,
          d: diasRestantes(s.fecha_vencimiento),
          _perfil: s.perfiles_espacios || null,
        })
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
        servicios.some(s => s.vinculada && s.vinculada.toLowerCase().includes(q)) ||
        servicios.some(s => s.acceso_cliente && s.acceso_cliente.toLowerCase().includes(q))
      const matchV = !filtroVinc || servicios.some(s => s.vinculada === filtroVinc)
      const ok = matchQ && matchV
      if (filtro === 'vencidos')   return ok && dMin !== null && dMin < 0
      if (filtro === 'hoy')        return ok && dMin === 0
      if (filtro === '3dias')      return ok && dMin !== null && dMin <= 3
      if (filtro === 'semana')     return ok && dMin !== null && dMin <= 7
      if (filtro === 'mes')        return ok && dMin !== null && dMin <= 30
      if (filtro === 'cobrados')   return ok && servicios.every(s => s.cobrado)
      if (filtro === 'pendientes') return ok && servicios.some(s => !s.cobrado)
      return ok
    })
    if (orden === 'nombre') lista = [...lista].sort((a,b) => a.cliente.nombre.localeCompare(b.cliente.nombre))
    if (orden === 'precio') lista = [...lista].sort((a,b) => b.total - a.total)
    return lista
  }, [data, buscar, filtro, filtroVinc, orden])

  // Contadores por filtro
  const contadores = useMemo(() => {
    const base = data.filter(({ cliente, servicios }) => {
      const q = buscar.toLowerCase()
      const matchQ = !q || cliente.nombre.toLowerCase().includes(q) ||
        servicios.some(s => s.cuenta.toLowerCase().includes(q)) ||
        servicios.some(s => s.acceso_cliente && s.acceso_cliente.toLowerCase().includes(q))
      return matchQ && (!filtroVinc || servicios.some(s => s.vinculada === filtroVinc))
    })
    return {
      todos: base.length,
      vencidos: base.filter(c => c.dMin !== null && c.dMin < 0).length,
      hoy: base.filter(c => c.dMin === 0).length,
      '3dias': base.filter(c => c.dMin !== null && c.dMin <= 3).length,
      cobrados: base.filter(c => c.servicios.every(s => s.cobrado)).length,
      pendientes: base.filter(c => c.servicios.some(s => !s.cobrado)).length,
    }
  }, [data, buscar, filtroVinc])

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
    if (!e) {
      cargarDatos()
      mostrarToast('Cobro registrado')
      registrarBitacora(sesion.usuario, 'COBRAR', 'servicios', s.id, { cuenta: s.cuenta, precio: s.precio }, s.clientes?.nombre || '')
    }
  }

  async function deshacerCobro(s) {
    const { error: e } = await supabase.from('servicios').update({ cobrado: null, cobrado_en: null, estado: 'PENDIENTE' }).eq('id', s.id)
    if (!e) {
      cargarDatos()
      mostrarToast('Cobro revertido', 'info')
      registrarBitacora(sesion.usuario, 'DESHACER_COBRO', 'servicios', s.id, { cuenta: s.cuenta }, s.clientes?.nombre || '')
    }
  }

  async function liberarPerfil(s) {
    // Si el servicio tiene perfil asignado, liberarlo
    if (s.perfil_id) {
      await supabase.from('perfiles_espacios').update({
        cliente_id: null,
        cliente_nombre: null,
        servicio_id: null,
        fecha_vencimiento: null,
        correo_cliente: null,
        telefono_cliente: null,
        notas: 'DISPONIBLE',
      }).eq('id', s.perfil_id)
    }
  }

  async function cancelar(s) {
    await liberarPerfil(s)
    const notas = s.notas ? 'CANCELADO | ' + s.notas : 'CANCELADO'
    const { error: e } = await supabase.from('servicios').update({ notas, cancelado: true, perfil_id: null }).eq('id', s.id)
    if (!e) {
      cargarDatos()
      registrarBitacora(sesion.usuario, 'CANCELAR', 'servicios', s.id, { cuenta: s.cuenta }, s.clientes?.nombre || '')
    }
  }

  async function eliminarServicio(s) {
    await liberarPerfil(s)
    const { error: e } = await supabase.from('servicios').delete().eq('id', s.id)
    if (!e) {
      cargarDatos()
      registrarBitacora(sesion.usuario, 'ELIMINAR_SERVICIO', 'servicios', s.id, { cuenta: s.cuenta }, s.clientes?.nombre || '')
    }
  }

  async function eliminarCliente(clienteId, serviciosLista) {
    for (const s of serviciosLista) await liberarPerfil(s)
    await supabase.from('servicios').delete().in('id', serviciosLista.map(s=>s.id))
    await supabase.from('clientes').delete().eq('id', clienteId)
    registrarBitacora(sesion.usuario, 'ELIMINAR_CLIENTE', 'clientes', clienteId, { servicios: serviciosLista.length })
    cargarDatos()
  }

  // Stats
  const totalMes = data.reduce((s,c) => s + c.total, 0)
  const totalCobrado = data.reduce((s,c) => s + c.servicios.reduce((a,sv) => a + (sv.cobrado ? parseFloat(sv.precio||0) : 0), 0), 0)
  const totalPendiente = totalMes - totalCobrado
  const countCobrados = data.reduce((s,c) => s + c.servicios.filter(sv=>sv.cobrado).length, 0)
  const countPendientes = data.reduce((s,c) => s + c.servicios.filter(sv=>!sv.cobrado).length, 0)
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

      {modalForm && <ModalServicio clienteId={modalForm.clienteId} clienteNombre={modalForm.clienteNombre} onGuardar={()=>{cargarDatos();mostrarToast('Servicio guardado')}} onCerrar={()=>setModalForm(null)} />}
      {modalGestorServicios && <ModalGestorServicios onCerrar={()=>setModalGestorServicios(false)} />}
      {modalBitacora && <ModalBitacora onCerrar={()=>setModalBitacora(false)} />}
      {modalRenovar && <ModalRenovar servicio={modalRenovar.servicio} cliente={modalRenovar.cliente} onRenovar={()=>{cargarDatos();mostrarToast('Servicio renovado')}} onCerrar={()=>setModalRenovar(null)} />}
      {modalCobrarRenovar && <ModalCobrarRenovar servicio={modalCobrarRenovar.servicio} cliente={modalCobrarRenovar.cliente} onGuardar={()=>{cargarDatos();mostrarToast('Cobrado y renovado ✅')}} onCerrar={()=>setModalCobrarRenovar(null)} />}
      {modalEditar && <ModalEditar servicio={modalEditar.servicio} cliente={modalEditar.cliente} onGuardar={()=>{cargarDatos();mostrarToast('Cambios guardados')}} onCerrar={()=>setModalEditar(null)} />}
      {modalEditarCliente && <ModalEditarCliente cliente={modalEditarCliente.cliente} serviciosCliente={modalEditarCliente.servicios} onGuardar={()=>{cargarDatos();mostrarToast('Cliente actualizado')}} onCerrar={()=>setModalEditarCliente(null)} />}
      {modalHistorial && <ModalHistorial cliente={modalHistorial} onCerrar={()=>setModalHistorial(null)} />}
      {modalConfirm && <ModalConfirm {...modalConfirm} onCancelar={()=>setModalConfirm(null)} />}
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} />}

      {/* HEADER */}
      <div style={{background:'var(--bg1)',borderBottom:'1px solid var(--border)',padding:'10px 14px 8px',position:'sticky',top:0,zIndex:10}}>
        <div style={{maxWidth:520,margin:'0 auto'}}>

          {/* Top bar compacta */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:'var(--bg2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>👾</div>
              <div style={{fontWeight:800,fontSize:14,letterSpacing:'-0.01em'}}>Streaming
                <span style={{fontSize:10,color:esAdmin?'var(--purple)':'var(--cyan)',fontWeight:600,marginLeft:6,fontFamily:'var(--mono)'}}>{sesion.usuario}</span>
              </div>
              {/* Tabs inline */}
              {esAdmin && (
                <div style={{display:'flex',gap:3,marginLeft:4}}>
                  {[{val:'cobros',label:'💳'},{val:'cuentas',label:'🗂️'}].map(t=>(
                    <button key={t.val} onClick={()=>setVista(t.val)} style={{
                      padding:'3px 8px',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:700,
                      background:vista===t.val?'rgba(0,212,255,0.15)':'transparent',
                      color:vista===t.val?'var(--cyan)':'var(--text3)',
                      border:`1px solid ${vista===t.val?'var(--cyan)30':'transparent'}`,
                      transition:'all 0.15s',
                    }}>{t.label}</button>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:4}}>
              {esAdmin && <button className="btn btn-primary" style={{padding:'5px 10px',fontSize:11}} onClick={()=>setModalForm({})}>+ Nuevo</button>}
              {esAdmin && <button className="btn btn-ghost" style={{padding:'5px 8px',fontSize:11}} onClick={()=>setModalGestorServicios(true)} title="Gestionar servicios">⚙️</button>}
              {esAdmin && <button className="btn btn-ghost" style={{padding:'5px 8px',fontSize:11}} onClick={()=>setModalBitacora(true)} title="Bitácora">📋</button>}
              <button className="btn btn-ghost" style={{padding:'5px 8px',fontSize:11}} onClick={cargarDatos} disabled={loading}>{loading?'⏳':'⟳'}</button>
              <button className="btn btn-ghost" style={{padding:'5px 8px',fontSize:11}} onClick={onLogout}>⏏</button>
            </div>
          </div>

          {/* Alerta urgentes */}
          {vista==='cobros' && urgentes3 > 0 && (
            <div style={{fontSize:10,color:'var(--red)',fontWeight:700,marginBottom:6,fontFamily:'var(--mono)'}}>
              🔴 {urgentes3} cliente{urgentes3>1?'s':''} · ≤3 días
            </div>
          )}

          {/* Resumen colapsable */}
          {vista==='cobros' && esAdmin && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,marginBottom:6,overflow:'hidden'}}>
              <button onClick={()=>setVerRes(!verRes)} style={{width:'100%',background:'none',border:'none',padding:'7px 12px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',color:'var(--text2)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:11,fontWeight:700}}>💰 Resumen</span>
                  {!verRes && (
                    <div style={{display:'flex',gap:8}}>
                      <span style={{fontSize:11,color:'var(--green)',fontFamily:'var(--mono)',fontWeight:700}}>✅ ${totalCobrado.toLocaleString()}</span>
                      <span style={{fontSize:11,color:'var(--orange)',fontFamily:'var(--mono)',fontWeight:700}}>⏳ ${totalPendiente.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <span style={{fontSize:10,fontFamily:'var(--mono)'}}>{verRes?'▲':'▼'}</span>
              </button>
              {verRes && (
                <div style={{padding:'0 12px 12px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                    <div style={{background:'#001a0e',borderRadius:8,padding:'8px 12px',border:'1px solid #00ff8830'}}>
                      <div style={{fontSize:9,color:'var(--text3)',marginBottom:3,fontFamily:'var(--mono)'}}>✅ COBRADO</div>
                      <div style={{fontSize:18,fontWeight:800,color:'var(--green)',fontFamily:'var(--mono)'}}>${totalCobrado.toLocaleString()}</div>
                      <div style={{fontSize:9,color:'var(--text3)',marginTop:1}}>{countCobrados} servicios</div>
                    </div>
                    <div style={{background:'#1a0800',borderRadius:8,padding:'8px 12px',border:'1px solid #ff8c0030'}}>
                      <div style={{fontSize:9,color:'var(--text3)',marginBottom:3,fontFamily:'var(--mono)'}}>⏳ PENDIENTE</div>
                      <div style={{fontSize:18,fontWeight:800,color:'var(--orange)',fontFamily:'var(--mono)'}}>${totalPendiente.toLocaleString()}</div>
                      <div style={{fontSize:9,color:'var(--text3)',marginTop:1}}>{countPendientes} servicios</div>
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--mono)'}}>PROGRESO · ${totalMes.toLocaleString()} total</span>
                      <span style={{fontSize:9,color:'var(--green)',fontFamily:'var(--mono)',fontWeight:700}}>{totalMes>0?Math.round(totalCobrado/totalMes*100):0}%</span>
                    </div>
                    <div style={{height:5,background:'var(--bg3)',borderRadius:99,overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:99,background:'linear-gradient(90deg,var(--green),var(--cyan))',width:`${totalMes>0?Math.round(totalCobrado/totalMes*100):0}%`,transition:'width .4s ease'}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:9,color:'var(--purple)',fontWeight:700,marginBottom:5,fontFamily:'var(--mono)'}}>POR VINCULADA</div>
                    {resumenVinc.map(([k,v]) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                        <div style={{display:'flex',gap:5,alignItems:'center'}}>
                          <span style={{fontSize:10,color:'var(--text2)',fontFamily:'var(--mono)'}}>{k}</span>
                          <span style={{fontSize:9,background:'var(--bg3)',color:'var(--text3)',padding:'1px 4px',borderRadius:4}}>{v.count}</span>
                        </div>
                        <span style={{fontSize:11,color:'var(--green)',fontWeight:700,fontFamily:'var(--mono)'}}>${v.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:9,color:'var(--cyan)',fontWeight:700,marginBottom:5,fontFamily:'var(--mono)'}}>POR SERVICIO</div>
                    {resumenServicio.map(([k,v]) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                        <div style={{display:'flex',gap:5,alignItems:'center'}}>
                          <span style={{fontSize:10,color:'var(--text2)',fontFamily:'var(--mono)'}}>{k}</span>
                          <span style={{fontSize:9,background:'var(--bg3)',color:'var(--text3)',padding:'1px 4px',borderRadius:4}}>{v.count}</span>
                        </div>
                        <span style={{fontSize:11,color:'var(--green)',fontWeight:700,fontFamily:'var(--mono)'}}>${v.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buscador + filtros — solo en cobros */}
          {vista === 'cobros' && <>
          {/* Buscador compacto */}
          <div style={{position:'relative',marginBottom:6}}>
            <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',fontSize:13}}>⌕</span>
            <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar..."
              style={{paddingLeft:28,padding:'7px 10px 7px 28px',fontSize:12}} />
          </div>

          {/* Vinculadas — scroll horizontal sin caja */}
          <div style={{display:'flex',gap:4,overflowX:'auto',marginBottom:5,paddingBottom:2}}>
            <button onClick={()=>setFiltroVinc('')} style={{
              padding:'3px 10px',borderRadius:20,border:'none',cursor:'pointer',
              fontSize:10,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,
              background: filtroVinc==='' ? 'var(--cyan)' : 'var(--bg2)',
              color: filtroVinc==='' ? 'var(--bg)' : 'var(--text3)',
              transition:'all .15s',
            }}>Todas</button>
            {VINCULADAS.map(v => {
              const active = filtroVinc === v
              return (
                <button key={v} onClick={()=>setFiltroVinc(active?'':v)} style={{
                  padding:'3px 10px',borderRadius:20,cursor:'pointer',flexShrink:0,
                  fontSize:10,fontWeight:700,whiteSpace:'nowrap',
                  border:`1px solid ${active?'#9d4edd60':'var(--border)'}`,
                  background: active ? 'rgba(157,78,221,0.2)' : 'var(--bg2)',
                  color: active ? '#d8b4fe' : 'var(--text3)',
                  transition:'all .15s',
                }}>{v}</button>
              )
            })}
          </div>

          {/* Filtros estado + orden — una línea */}
          <div style={{display:'flex',gap:4,overflowX:'auto',paddingBottom:2,alignItems:'center'}}>
            {FILTROS.map(f => {
              const active = filtro === f.val
              const colMap = {todos:'#00d4ff',vencidos:'#ff3366',hoy:'#ff3366','3dias':'#ff6b6b',cobrados:'#00ff88',pendientes:'#ff8c00'}
              const col = colMap[f.val] || '#00d4ff'
              const cnt = contadores[f.val]
              return (
                <button key={f.val} onClick={()=>setFiltro(f.val)} style={{
                  padding:'3px 9px',borderRadius:20,cursor:'pointer',flexShrink:0,
                  fontSize:10,fontWeight:700,whiteSpace:'nowrap',
                  border:`1px solid ${active?col+'60':'var(--border)'}`,
                  background: active ? col+'20' : 'var(--bg2)',
                  color: active ? col : 'var(--text3)',
                  transition:'all .15s',
                }}>
                  {f.label}{cnt > 0 ? ` (${cnt})` : ''}
                </button>
              )
            })}
            <div style={{width:1,background:'var(--border)',height:16,flexShrink:0,margin:'0 2px'}}/>
            {[{val:'fecha',label:'📅',tip:'Fecha'},{val:'nombre',label:'🔤',tip:'Nombre'},{val:'precio',label:'💰',tip:'Precio'}].map(o => (
              <button key={o.val} onClick={()=>setOrden(o.val)} title={o.tip} style={{
                padding:'3px 6px',borderRadius:6,flexShrink:0,
                border:`1px solid ${orden===o.val?'var(--cyan)':'transparent'}`,
                background:orden===o.val?'rgba(0,212,255,0.12)':'transparent',
                color:orden===o.val?'var(--cyan)':'var(--text3)',
                cursor:'pointer',fontSize:11,transition:'all .15s',
              }}>{o.label}</button>
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
                <div style={{fontWeight:800,fontSize:15,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer',color:'var(--text)'}}
                  onClick={()=>setModalHistorial(cliente)}>{cliente.nombre}</div>
                {esAdmin && <span style={{color:'var(--green)',fontWeight:800,fontSize:13,fontFamily:'var(--mono)',whiteSpace:'nowrap'}}>${total.toLocaleString()}</span>}
                {cliente.telefono && (
                  <a href={`https://wa.me/52${cliente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    className="btn" style={{background:'#001a0e',border:'1px solid #00ff8830',color:'var(--green)',padding:'4px 8px',fontSize:11,textDecoration:'none'}}>📱</a>
                )}
                {esAdmin && (
                  <button className="btn" style={{background:'transparent',border:'1px solid #00d4ff30',color:'var(--cyan)',padding:'4px 8px',fontSize:11}}
                    onClick={()=>setModalEditarCliente({cliente, servicios})}>✏️</button>
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
                      onConfirmar:()=>{eliminarCliente(cliente.id,servicios);setModalConfirm(null)}
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
                      <div key={si} style={{background:'var(--bg)',borderRadius:8,padding:'6px 8px',marginBottom:si<grupo.servicios.length-1?4:0,border:'1px solid var(--border)'}}>
                        {/* Fila 1: cuenta + vinculada + cobrado + precio */}
                        <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3}}>
                          <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:700,color:'var(--text)'}}>{s.cuenta}</span>
                          {s.vinculada && <span className="tag tag-vinc" style={{fontSize:9,padding:'1px 5px'}}>{s.vinculada}</span>}
                          {s.cobrado && <span className="tag tag-cobrado" style={{fontSize:9,padding:'1px 5px'}}>✅ {formatFecha(s.cobrado)}</span>}
                          {esAdmin && <span style={{color:'var(--green)',fontSize:11,fontWeight:700,fontFamily:'var(--mono)',marginLeft:'auto'}}>${parseFloat(s.precio||0).toLocaleString()}</span>}
                        </div>
                        {/* Perfil asignado — muestra cuenta, perfil, pin */}
                        {s.perfil_id && s._perfil && (
                          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3}}>
                            <span style={{fontSize:10,color:'var(--text3)'}}>📺</span>
                            <span style={{fontSize:10,color:'var(--cyan)',fontFamily:'var(--mono)',fontWeight:600}}>
                              Perfil {s._perfil.perfil}
                              {s._perfil.pin && ` · PIN: ${s._perfil.pin}`}
                            </span>
                          </div>
                        )}
                        {/* Notas (solo admin) */}
                        {s.notas && esAdmin && (
                          <div style={{fontSize:10,color:'var(--text3)',marginBottom:4,paddingLeft:2}}>📝 {s.notas}</div>
                        )}
                        {/* Acceso del cliente */}
                        {s.acceso_cliente && esAdmin && (
                          <div style={{fontSize:10,color:'var(--cyan)',marginBottom:4,paddingLeft:2,fontFamily:'var(--mono)'}}>👤 {s.acceso_cliente}</div>
                        )}
                        {/* Botones admin — iconos compactos */}
                        {esAdmin && (
                          <div style={{display:'flex',gap:4,alignItems:'center'}}>
                            {!s.cobrado && (
                              <button style={{padding:'2px 8px',borderRadius:6,border:'1px solid #00ff8830',background:'transparent',color:'var(--green)',cursor:'pointer',fontSize:10,fontWeight:700}}
                                onClick={()=>setModalCobrarRenovar({servicio:s,cliente:cliente.nombre})}>✅ Cobrar</button>
                            )}
                            {s.cobrado && (
                              <button style={{padding:'2px 8px',borderRadius:6,border:'1px solid #ff336620',background:'transparent',color:'var(--text3)',cursor:'pointer',fontSize:10}}
                                onClick={()=>setModalConfirm({
                                  mensaje:'¿Deshacer cobro?',
                                  detalle:`${cliente.nombre} · ${s.cuenta}\nSe revertirá el cobro del ${formatFecha(s.cobrado)}.`,
                                  colorBtn:'var(--orange)',textoBtn:'↩️ Deshacer',
                                  onConfirmar:()=>{deshacerCobro(s);setModalConfirm(null)}
                                })} title="Deshacer cobro">↩️</button>
                            )}
                            <div style={{flex:1}}/>
                            <button style={{padding:'2px 6px',borderRadius:5,border:'1px solid #00d4ff20',background:'transparent',color:'var(--cyan)',cursor:'pointer',fontSize:11}}
                              onClick={()=>setModalEditar({servicio:s,cliente:cliente.nombre})} title="Editar">✏️</button>
                            <button style={{padding:'2px 6px',borderRadius:5,border:'1px solid #ff336620',background:'transparent',color:'var(--red)',cursor:'pointer',fontSize:11}}
                              onClick={()=>setModalConfirm({mensaje:'¿Cancelar servicio?',detalle:`${cliente.nombre} · ${s.cuenta}`,colorBtn:'var(--orange)',textoBtn:'Cancelar',onConfirmar:()=>{cancelar(s);setModalConfirm(null)}})} title="Cancelar">❌</button>
                            <button style={{
                                padding:'2px 6px',borderRadius:5,cursor:'pointer',fontSize:10,fontWeight:700,
                                border:`1px solid ${s.cobrado?'#00ff8830':'#00d4ff20'}`,
                                background:'transparent',
                                color:s.cobrado?'var(--green)':'var(--cyan)',
                              }}
                              onClick={()=>setModalRenovar({servicio:s,cliente:cliente.nombre})} title="Renovar">
                              {s.cobrado?'✅':'🔄'} Renovar
                            </button>
                            <button style={{padding:'2px 6px',borderRadius:5,border:'1px solid #ff336620',background:'transparent',color:'var(--red)',cursor:'pointer',fontSize:11,opacity:0.7}}
                              onClick={()=>setModalConfirm({mensaje:'¿Eliminar servicio?',detalle:`${cliente.nombre} · ${s.cuenta}`,textoBtn:'Eliminar',onConfirmar:()=>{eliminarServicio(s);setModalConfirm(null)}})} title="Eliminar">🗑️</button>
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
  const [editando, setEditando] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [editPin, setEditPin] = useState('')
  const [editCorreo, setEditCorreo] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtroSvc, setFiltroSvc] = useState('')
  const [agregandoPerfil, setAgregandoPerfil] = useState(null)
  const [nuevoPerfil, setNuevoPerfil] = useState({perfil:'',pin:'',cliente:''})
  const [agregandoCuenta, setAgregandoCuenta] = useState(false)
  const [nuevaCuenta, setNuevaCuenta] = useState({servicio:'',vinculada:'',correo:'',password:'',tipo:'perfiles'})
  const [editandoCuenta, setEditandoCuenta] = useState(null) // cuenta completa
  const [editCuentaForm, setEditCuentaForm] = useState({})
  const [confirm, setConfirm] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data: cuentasData } = await supabase
      .from('cuentas_maestras')
      .select('*, perfiles_espacios(*)')
      .order('servicio')

    if (!cuentasData) { setLoading(false); return }

    // Para perfiles sin fecha_vencimiento, buscar el servicio del cliente por nombre
    const clientesNombres = [...new Set(
      cuentasData.flatMap(c => (c.perfiles_espacios||[]))
        .filter(p => p.cliente_nombre && p.cliente_nombre.toUpperCase() !== 'DISPONIBLE' && !p.fecha_vencimiento)
        .map(p => p.cliente_nombre.trim())
    )]

    let serviciosMap = {}
    if (clientesNombres.length > 0) {
      const { data: svsData } = await supabase
        .from('servicios')
        .select('id, cuenta, fecha_vencimiento, cliente_id, clientes(nombre)')
        .eq('cancelado', false)
        .in('clientes.nombre', clientesNombres)

      // Mapear por nombre de cliente
      for (const s of (svsData || [])) {
        const nom = s.clientes?.nombre
        if (!nom) continue
        if (!serviciosMap[nom]) serviciosMap[nom] = []
        serviciosMap[nom].push(s)
      }
    }

    // Enriquecer perfiles con fecha del servicio si no tienen
    const enriquecidas = cuentasData.map(c => ({
      ...c,
      perfiles_espacios: (c.perfiles_espacios || []).map(p => {
        if (p.fecha_vencimiento || !p.cliente_nombre || p.cliente_nombre.toUpperCase() === 'DISPONIBLE') return p
        const svs = serviciosMap[p.cliente_nombre.trim()] || []
        // Buscar servicio que coincida con el tipo de cuenta
        const match = svs.find(s => s.cuenta.toLowerCase().includes(c.servicio.toLowerCase().split(' ')[0]))
          || svs.sort((a,b) => new Date(b.fecha_vencimiento) - new Date(a.fecha_vencimiento))[0]
        return { ...p, fecha_vencimiento_calc: match?.fecha_vencimiento || null, servicio_id_calc: match?.id || null }
      })
    }))

    setCuentas(enriquecidas)
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const serviciosUnicos = [...new Set(cuentas.map(c => c.servicio))].sort()

  const cuentasFiltradas = cuentas.filter(c => {
    if (c.tipo === 'individual') return false // Se renderizan aparte
    const okSvc = !filtroSvc || c.servicio === filtroSvc
    const okQ = !buscar || c.servicio.toLowerCase().includes(buscar.toLowerCase()) ||
      c.vinculada?.toLowerCase().includes(buscar.toLowerCase()) ||
      c.perfiles_espacios?.some(p => (p.cliente_nombre||'').toLowerCase().includes(buscar.toLowerCase()))
    return okSvc && okQ
  })

  const cuentasIndividuales = cuentas.filter(c => {
    if (c.tipo !== 'individual') return false
    const okQ = !buscar || c.servicio.toLowerCase().includes(buscar.toLowerCase()) ||
      c.correo?.toLowerCase().includes(buscar.toLowerCase()) ||
      c.notas?.toLowerCase().includes(buscar.toLowerCase())
    return okQ
  })

  async function guardarCliente(perfilId, nuevoCliente, perfilActual) {
    const val = nuevoCliente.trim() || null
    // Si había un cliente anterior con servicio enlazado, liberar ese servicio
    if (perfilActual?.servicio_id && val !== perfilActual.cliente_nombre) {
      await supabase.from('servicios').update({ perfil_id: null }).eq('id', perfilActual.servicio_id)
    }
    await supabase.from('perfiles_espacios').update({
      cliente_nombre: val,
      cliente_id: null,
      servicio_id: val ? perfilActual?.servicio_id : null,
      notas: val ? null : 'DISPONIBLE',
      pin: editPin.trim() || perfilActual?.pin || null,
      correo_cliente: editCorreo.trim() || perfilActual?.correo_cliente || null,
    }).eq('id', perfilId)
    // Sincronizar correo en el servicio enlazado si existe
    if (perfilActual?.servicio_id && editCorreo.trim()) {
      await supabase.from('servicios').update({ acceso_cliente: editCorreo.trim() }).eq('id', perfilActual.servicio_id)
    }
    setEditando(null); cargar()
  }

  async function agregarPerfil(cuentaId) {
    if (!nuevoPerfil.perfil.trim()) return
    await supabase.from('perfiles_espacios').insert({
      cuenta_id: cuentaId,
      perfil: nuevoPerfil.perfil.trim(),
      pin: nuevoPerfil.pin.trim() || null,
      cliente_nombre: nuevoPerfil.cliente.trim() || null,
      notas: nuevoPerfil.cliente.trim() ? null : 'DISPONIBLE',
    })
    setAgregandoPerfil(null); setNuevoPerfil({perfil:'',pin:'',cliente:''}); cargar()
  }

  async function eliminarPerfil(p) {
    // Si está ocupado, confirmar antes
    if (p.cliente_nombre && p.cliente_nombre.toUpperCase() !== 'DISPONIBLE') {
      setConfirm({
        msg: `¿Eliminar perfil ${p.perfil}?`,
        detalle: `Está asignado a ${p.cliente_nombre}. El servicio del cliente también se liberará.`,
        onOk: async () => {
          // Liberar servicio del cliente si existe
          if (p.servicio_id) {
            await supabase.from('servicios').update({ perfil_id: null }).eq('id', p.servicio_id)
          }
          await supabase.from('perfiles_espacios').delete().eq('id', p.id)
          setConfirm(null); cargar()
        }
      })
    } else {
      await supabase.from('perfiles_espacios').delete().eq('id', p.id)
      cargar()
    }
  }

  async function agregarCuenta() {
    if (!nuevaCuenta.servicio.trim()) return
    await supabase.from('cuentas_maestras').insert({
      servicio: nuevaCuenta.servicio.trim(),
      vinculada: nuevaCuenta.vinculada.trim() || null,
      correo: nuevaCuenta.correo.trim() || null,
      password: nuevaCuenta.password.trim() || null,
      tipo: nuevaCuenta.tipo,
    })
    setAgregandoCuenta(false)
    setNuevaCuenta({servicio:'',vinculada:'',correo:'',password:'',tipo:'perfiles'})
    cargar()
  }

  async function guardarEditarCuenta() {
    if (!editCuentaForm.servicio?.trim()) return
    await supabase.from('cuentas_maestras').update({
      servicio: editCuentaForm.servicio.trim(),
      vinculada: editCuentaForm.vinculada?.trim() || null,
      correo: editCuentaForm.correo?.trim() || null,
      password: editCuentaForm.password?.trim() || null,
    }).eq('id', editandoCuenta.id)
    setEditandoCuenta(null); cargar()
  }

  async function eliminarCuenta(cuenta) {
    const ocupados = (cuenta.perfiles_espacios||[]).filter(p => p.cliente_nombre && p.cliente_nombre.toUpperCase() !== 'DISPONIBLE')
    setConfirm({
      msg: `¿Eliminar cuenta ${cuenta.servicio}?`,
      detalle: ocupados.length > 0
        ? `⚠️ Tiene ${ocupados.length} perfil(es) ocupado(s). Se liberarán los servicios de esos clientes.`
        : `Se eliminarán todos los perfiles de esta cuenta.`,
      onOk: async () => {
        // Liberar servicios de clientes asociados
        for (const p of ocupados) {
          if (p.servicio_id) await supabase.from('servicios').update({ perfil_id: null }).eq('id', p.servicio_id)
        }
        await supabase.from('perfiles_espacios').delete().eq('cuenta_id', cuenta.id)
        await supabase.from('cuentas_maestras').delete().eq('id', cuenta.id)
        setConfirm(null); cargar()
      }
    })
  }

  if (loading) return <div style={{textAlign:'center',padding:'60px 0',color:'var(--text3)'}}>⏳ Cargando cuentas...</div>

  return (
    <div style={{maxWidth:520,margin:'0 auto',padding:'14px 16px 0'}}>

      {/* Modal editar cuenta maestra */}
      {editandoCuenta && (
        <div style={{position:'fixed',inset:0,background:'#000000dd',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div className="card slide-up" style={{padding:24,maxWidth:400,width:'100%'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:16}}>✏️ Editar cuenta</div>
              <button onClick={()=>setEditandoCuenta(null)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              <div><label style={{fontSize:9}}>SERVICIO</label>
                <input value={editCuentaForm.servicio||''} onChange={e=>setEditCuentaForm(p=>({...p,servicio:e.target.value}))} style={{...inputSt,padding:'6px 10px',fontSize:12}}/></div>
              <div><label style={{fontSize:9}}>VINCULADA</label>
                <input value={editCuentaForm.vinculada||''} onChange={e=>setEditCuentaForm(p=>({...p,vinculada:e.target.value}))} style={{...inputSt,padding:'6px 10px',fontSize:12}}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              <div><label style={{fontSize:9}}>CORREO</label>
                <input value={editCuentaForm.correo||''} onChange={e=>setEditCuentaForm(p=>({...p,correo:e.target.value}))} style={{...inputSt,padding:'6px 10px',fontSize:12}}/></div>
              <div><label style={{fontSize:9}}>CONTRASEÑA</label>
                <input value={editCuentaForm.password||''} onChange={e=>setEditCuentaForm(p=>({...p,password:e.target.value}))} style={{...inputSt,padding:'6px 10px',fontSize:12,fontFamily:'var(--mono)'}}/></div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setEditandoCuenta(null)} className="btn btn-ghost" style={{flex:1,justifyContent:'center'}}>Cancelar</button>
              <button onClick={guardarEditarCuenta} className="btn btn-primary" style={{flex:1,justifyContent:'center'}}>✓ Guardar</button>
            </div>
          </div>
        </div>
      )}
      {confirm && (
        <div style={{position:'fixed',inset:0,background:'#000000dd',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div className="card slide-up" style={{padding:24,maxWidth:340,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>{confirm.msg}</div>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:20,lineHeight:1.6}}>{confirm.detalle}</div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={()=>setConfirm(null)}>Cancelar</button>
              <button className="btn" style={{flex:1,justifyContent:'center',background:'var(--red)',color:'#fff'}} onClick={confirm.onOk}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Buscador + botón nueva cuenta */}
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <div style={{position:'relative',flex:1}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',fontSize:13}}>🔍</span>
          <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar servicio, vinculada o cliente..."
            style={{...inputSt,paddingLeft:36}}/>
        </div>
        <button onClick={()=>setAgregandoCuenta(!agregandoCuenta)} style={{
          background:agregandoCuenta?'rgba(0,212,255,0.15)':'var(--bg2)',
          border:`1px solid ${agregandoCuenta?'var(--cyan)':'var(--border)'}`,
          color:agregandoCuenta?'var(--cyan)':'var(--text3)',
          borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:11,fontWeight:700,flexShrink:0,
        }}>{agregandoCuenta?'✕ Cancelar':'+ Cuenta'}</button>
      </div>

      {/* Form nueva cuenta maestra */}
      {agregandoCuenta && (
        <div style={{background:'var(--bg1)',border:'1px solid var(--cyan)30',borderRadius:12,padding:'12px 14px',marginBottom:12}}>
          <div style={{fontSize:10,color:'var(--cyan)',fontFamily:'var(--mono)',fontWeight:700,marginBottom:10}}>NUEVA CUENTA MAESTRA</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <div><label style={{fontSize:9}}>SERVICIO *</label>
              <input value={nuevaCuenta.servicio} onChange={e=>setNuevaCuenta(p=>({...p,servicio:e.target.value}))} placeholder="Netflix, Spotify..." style={{...inputSt,padding:'6px 10px',fontSize:12}}/></div>
            <div><label style={{fontSize:9}}>VINCULADA</label>
              <input value={nuevaCuenta.vinculada} onChange={e=>setNuevaCuenta(p=>({...p,vinculada:e.target.value}))} placeholder="SIX, LALOBIT..." style={{...inputSt,padding:'6px 10px',fontSize:12}}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <div><label style={{fontSize:9}}>CORREO</label>
              <input value={nuevaCuenta.correo} onChange={e=>setNuevaCuenta(p=>({...p,correo:e.target.value}))} placeholder="cuenta@mail.com" style={{...inputSt,padding:'6px 10px',fontSize:12}}/></div>
            <div><label style={{fontSize:9}}>CONTRASEÑA</label>
              <input value={nuevaCuenta.password} onChange={e=>setNuevaCuenta(p=>({...p,password:e.target.value}))} placeholder="••••••••" style={{...inputSt,padding:'6px 10px',fontSize:12,fontFamily:'var(--mono)'}}/></div>
          </div>
          <div style={{marginBottom:10}}>
            <label style={{fontSize:9}}>TIPO</label>
            <div style={{display:'flex',gap:6}}>
              {['perfiles','individual'].map(t=>(
                <button key={t} onClick={()=>setNuevaCuenta(p=>({...p,tipo:t}))} style={{
                  padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:700,
                  background:nuevaCuenta.tipo===t?'rgba(0,212,255,0.15)':'var(--bg2)',
                  border:`1px solid ${nuevaCuenta.tipo===t?'var(--cyan)':'var(--border)'}`,
                  color:nuevaCuenta.tipo===t?'var(--cyan)':'var(--text3)',
                }}>{t==='perfiles'?'Con perfiles':'Individual'}</button>
              ))}
            </div>
          </div>
          <button onClick={agregarCuenta} style={{background:'var(--cyan)',color:'var(--bg)',border:'none',borderRadius:8,padding:'8px',cursor:'pointer',fontSize:12,fontWeight:700,width:'100%'}}>
            ✓ Agregar cuenta
          </button>
        </div>
      )}

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
        const estaAgregando = agregandoPerfil === cuenta.id

        return (
          <div key={cuenta.id} style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px',marginBottom:10}}>
            {/* Header cuenta */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,letterSpacing:'-0.01em'}}>{cuenta.servicio}</div>
                <div style={{fontSize:11,color:'var(--text3)',marginTop:2,display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{background:'rgba(167,139,250,0.12)',color:'var(--purple)',padding:'1px 7px',borderRadius:5,fontSize:10,fontWeight:600}}>{cuenta.vinculada}</span>
                  {cuenta.correo && <span style={{fontFamily:'var(--mono)',fontSize:10}}>{cuenta.correo}</span>}
                  {cuenta.password && <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--text3)'}}>🔑 {cuenta.password}</span>}
                </div>
              </div>
              <div style={{textAlign:'right',marginRight:4}}>
                <div style={{fontSize:12,fontWeight:700,color:disponibles>0?'var(--green)':'var(--red)'}}>
                  {disponibles} libre{disponibles!==1?'s':''}
                </div>
                <div style={{fontSize:10,color:'var(--text3)'}}>{total-disponibles}/{total} ocupados</div>
              </div>
              <button onClick={()=>setAgregandoPerfil(estaAgregando?null:cuenta.id)}
                style={{background:estaAgregando?'rgba(0,212,255,0.15)':'var(--bg2)',border:`1px solid ${estaAgregando?'var(--cyan)':'var(--border)'}`,color:estaAgregando?'var(--cyan)':'var(--text3)',borderRadius:7,padding:'3px 8px',cursor:'pointer',fontSize:10,fontWeight:700,flexShrink:0}}>
                {estaAgregando?'✕':'+'}
              </button>
              <button onClick={()=>{ setEditandoCuenta(cuenta); setEditCuentaForm({servicio:cuenta.servicio,vinculada:cuenta.vinculada||'',correo:cuenta.correo||'',password:cuenta.password||''}) }}
                style={{background:'none',border:'none',color:'var(--cyan)',cursor:'pointer',fontSize:13,padding:'2px 4px',opacity:0.7,flexShrink:0}}>✏️</button>
              <button onClick={()=>eliminarCuenta(cuenta)}
                style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:13,padding:'2px 4px',opacity:0.5,flexShrink:0}}>🗑️</button>
            </div>

            {/* Form agregar perfil */}
            {estaAgregando && (
              <div style={{background:'var(--bg2)',border:'1px solid #00d4ff20',borderRadius:10,padding:'10px 12px',marginBottom:10}}>
                <div style={{fontSize:9,color:'var(--cyan)',fontFamily:'var(--mono)',fontWeight:700,marginBottom:8}}>NUEVO PERFIL</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
                  <div><label style={{fontSize:9}}>PERFIL *</label>
                    <input value={nuevoPerfil.perfil} onChange={e=>setNuevoPerfil(p=>({...p,perfil:e.target.value}))} placeholder="1, A, Extra" style={{...inputSt,padding:'5px 8px',fontSize:11}}/></div>
                  <div><label style={{fontSize:9}}>PIN</label>
                    <input value={nuevoPerfil.pin} onChange={e=>setNuevoPerfil(p=>({...p,pin:e.target.value}))} placeholder="Opcional" style={{...inputSt,padding:'5px 8px',fontSize:11,fontFamily:'var(--mono)'}}/></div>
                </div>
                <button onClick={()=>agregarPerfil(cuenta.id)}
                  style={{background:'var(--cyan)',color:'var(--bg)',border:'none',borderRadius:7,padding:'5px',cursor:'pointer',fontSize:11,fontWeight:700,width:'100%'}}>
                  ✓ Agregar perfil disponible
                </button>
              </div>
            )}

            {/* Perfiles */}
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {perfiles.map(p => {
                const esDisponible = !p.cliente_nombre || p.cliente_nombre.toUpperCase()==='DISPONIBLE' || (p.notas||'').toUpperCase()==='DISPONIBLE'
                const isEditando = editando === p.id
                const fechaFinal = p.fecha_vencimiento || p.fecha_vencimiento_calc || null
                const diasRestantes_ = fechaFinal ? diasRestantes(fechaFinal) : null
                const urg = diasRestantes_ !== null && diasRestantes_ <= 3
                const sinEnlace = !esDisponible && !p.servicio_id && p.fecha_vencimiento_calc

                return (
                  <div key={p.id} style={{
                    background:'var(--bg2)',
                    border:`1px solid ${esDisponible?'rgba(52,211,153,0.2)':urg?'rgba(255,51,102,0.3)':'var(--border2)'}`,
                    borderRadius:8,padding:'7px 10px',display:'flex',alignItems:'center',gap:8,
                  }}>
                    {/* Número perfil */}
                    <div style={{
                      minWidth:30,height:30,borderRadius:6,flexShrink:0,
                      background:esDisponible?'rgba(52,211,153,0.1)':urg?'rgba(255,51,102,0.1)':'var(--bg1)',
                      border:`1px solid ${esDisponible?'rgba(52,211,153,0.3)':urg?'rgba(255,51,102,0.4)':'var(--border)'}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:800,
                      color:esDisponible?'var(--green)':urg?'var(--red)':'var(--text2)',
                    }}>{p.perfil}</div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      {isEditando ? (
                        <div style={{display:'flex',flexDirection:'column',gap:5}}>
                          <div style={{display:'flex',gap:5}}>
                            <input value={editVal} onChange={e=>setEditVal(e.target.value)}
                              onKeyDown={e=>{ if(e.key==='Escape') setEditando(null) }}
                              placeholder="Nombre del cliente..." autoFocus
                              style={{...inputSt,padding:'3px 7px',fontSize:11,flex:1}}/>
                          </div>
                          <div style={{display:'flex',gap:5}}>
                            <input value={editPin} onChange={e=>setEditPin(e.target.value)}
                              placeholder="PIN (ej: 1234)"
                              style={{...inputSt,padding:'3px 7px',fontSize:11,flex:1,fontFamily:'var(--mono)',color:'var(--yellow)'}}/>
                            <input value={editCorreo} onChange={e=>setEditCorreo(e.target.value)}
                              placeholder="Correo / acceso cliente"
                              style={{...inputSt,padding:'3px 7px',fontSize:11,flex:2,fontFamily:'var(--mono)'}}/>
                          </div>
                          <div style={{display:'flex',gap:5}}>
                            <button onClick={()=>guardarCliente(p.id,editVal,p)} style={{background:'var(--green)',color:'#fff',border:'none',borderRadius:5,padding:'4px 12px',cursor:'pointer',fontSize:11,fontWeight:700,flex:1}}>✓ Guardar</button>
                            <button onClick={()=>setEditando(null)} style={{background:'var(--bg1)',color:'var(--text3)',border:'1px solid var(--border)',borderRadius:5,padding:'4px 8px',cursor:'pointer',fontSize:11}}>✕</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                            <span style={{fontSize:12,fontWeight:esDisponible?400:600,color:esDisponible?'var(--green)':'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                              {esDisponible ? 'DISPONIBLE' : p.cliente_nombre}
                            </span>
                            {/* Días restantes */}
                            {!esDisponible && diasRestantes_ !== null && (
                              <BadgeDias d={diasRestantes_} />
                            )}
                            {!esDisponible && diasRestantes_ === null && (
                              <span style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--mono)'}}>sin fecha</span>
                            )}
                          </div>
                          {/* Correo/teléfono del cliente */}
                          {!esDisponible && (p.correo_cliente || p.telefono_cliente) && (
                            <div style={{fontSize:10,color:'var(--text3)',marginTop:1,fontFamily:'var(--mono)'}}>
                              {p.correo_cliente} {p.telefono_cliente && `· ${p.telefono_cliente}`}
                            </div>
                          )}
                          {/* Botón sincronizar si hay fecha calculada pero no enlace real */}
                          {sinEnlace && (
                            <button onClick={async()=>{
                              await supabase.from('perfiles_espacios').update({
                                servicio_id: p.servicio_id_calc,
                                fecha_vencimiento: p.fecha_vencimiento_calc,
                              }).eq('id', p.id)
                              await supabase.from('servicios').update({ perfil_id: p.id }).eq('id', p.servicio_id_calc)
                              cargar()
                            }} style={{
                              background:'rgba(0,212,255,0.1)',border:'1px solid #00d4ff30',
                              color:'var(--cyan)',borderRadius:4,padding:'1px 6px',
                              cursor:'pointer',fontSize:9,fontWeight:700,marginTop:3,display:'inline-block',
                            }}>🔗 Sincronizar</button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* PIN */}
                    {p.pin && (
                      <div style={{flexShrink:0,background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:5,padding:'2px 7px',fontSize:10,fontWeight:700,color:'var(--yellow)',fontFamily:'var(--mono)'}}>
                        {p.pin}
                      </div>
                    )}

                    {/* Acciones */}
                    {!isEditando && (
                      <div style={{display:'flex',gap:3,flexShrink:0}}>
                        <button onClick={()=>{ setEditando(p.id); setEditVal(esDisponible?'':p.cliente_nombre||''); setEditPin(p.pin||''); setEditCorreo(p.correo_cliente||'') }}
                          style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:13,padding:'1px 3px'}}>✏️</button>
                        <button onClick={()=>eliminarPerfil(p)}
                          style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:12,padding:'1px 3px',opacity:0.5}}>🗑️</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* ─── SECCIÓN CUENTAS INDIVIDUALES (ChatGPT, etc.) ─── */}
      {cuentasIndividuales.length > 0 && (
        <div style={{marginTop:8}}>
          <div style={{fontSize:10,color:'var(--purple)',fontFamily:'var(--mono)',fontWeight:700,marginBottom:8,padding:'0 2px'}}>🤖 CUENTAS INDIVIDUALES</div>
          {cuentasIndividuales.map(c => {
            const perfil = c.perfiles_espacios?.[0]
            const cliente = perfil?.cliente_nombre
            const fecha = perfil?.fecha_vencimiento
            const d = fecha ? diasRestantes(fecha) : null
            const esLibre = !cliente || cliente.toUpperCase() === 'DISPONIBLE'
            return (
              <div key={c.id} style={{
                background:'var(--bg2)',border:`1px solid ${esLibre?'var(--border)':'rgba(157,78,221,0.3)'}`,
                borderRadius:12,padding:'12px 14px',marginBottom:8,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:esLibre?0:8}}>
                  <div style={{
                    background:esLibre?'rgba(0,255,136,0.1)':'rgba(157,78,221,0.15)',
                    border:`1px solid ${esLibre?'#00ff8840':'rgba(157,78,221,0.4)'}`,
                    borderRadius:6,padding:'3px 8px',fontSize:10,fontWeight:700,
                    color:esLibre?'var(--green)':'var(--purple)',fontFamily:'var(--mono)',flexShrink:0,
                  }}>{c.servicio}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.correo}</div>
                  </div>
                  {!esLibre && d !== null && <BadgeDias d={d} />}
                  <button onClick={()=>{ if(confirm('¿Eliminar esta cuenta?')) { supabase.from('cuentas_maestras').delete().eq('id',c.id).then(()=>cargar()) }}}
                    style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:12,opacity:0.5,padding:'2px 4px',flexShrink:0}}>🗑️</button>
                </div>
                {!esLibre && (
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--text)',flex:1}}>{cliente}</div>
                    {c.password && (
                      <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)',background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px'}}>
                        🔑 {c.password}
                      </div>
                    )}
                    {fecha && <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--mono)'}}>📅 {formatFecha(fecha)}</div>}
                  </div>
                )}
                {esLibre && <div style={{fontSize:11,color:'var(--green)',marginTop:4}}>✅ Disponible</div>}
              </div>
            )
          })}
        </div>
      )}
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
  const [sesion, setSesion] = useState(() => {
    try {
      const s = localStorage.getItem('streambit_sesion')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  function handleLogin(s) {
    localStorage.setItem('streambit_sesion', JSON.stringify(s))
    setSesion(s)
  }

  function handleLogout() {
    localStorage.removeItem('streambit_sesion')
    setSesion(null)
  }

  if (!sesion) return <Login onLogin={handleLogin} />
  return <App sesion={sesion} onLogout={handleLogout} />
}
