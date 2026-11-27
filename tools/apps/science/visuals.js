;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'))
  else root.BikoSpinVisuals = factory(root.BikoSpinModel)
})(typeof window === 'undefined' ? globalThis : window, function (M) {
  'use strict'
  const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
  function render(input) {
    const s = M.state(input), dark = s.theme === 'dark'
    const c = dark ? { bg:'#172334', ink:'#e0e8f3', muted:'#acbdd1', line:'#3b4d64', blue:'#8dbcf0', orange:'#e8ba89', inset:'#202f43' } : { bg:'#f7f9fc', ink:'#203249', muted:'#52657d', line:'#c9d4e1', blue:'#315f92', orange:'#a26929', inset:'#eaf0f7' }
    const text = (x,y,t,size=13,color=c.ink,extra='') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" ${extra}>${escape(t)}</text>`
    const line = (x1,y1,x2,y2,color=c.line,width=1,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`
    const arrow = (x,y,xx,yy,color=c.blue,width=4) => line(x,y,xx,yy,color,width,`marker-end="url(#${color===c.orange?'orange':'blue'})"`)
    let v = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 368" role="img" aria-labelledby="spin-title spin-desc" font-family="system-ui,'Microsoft YaHei',sans-serif"><title id="spin-title">${M.names[s.topic]}</title><desc id="spin-desc">理想模型教学示意。横向与纵向分量分别显示，非实测数据。</desc><defs>`
    for (const [id,color] of [['blue',c.blue],['orange',c.orange]]) v += `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`
    v += `</defs><rect width="660" height="368" rx="18" fill="${c.bg}"/>` + text(24,32,M.names[s.topic],18,c.ink,'font-weight="650"')
    const axes = () => line(70,218,276,218)+line(170,252,170,84)+text(177,90,'+Z / B₀',12,c.muted)+text(264,240,'X',12,c.muted)
    if (s.topic === 'moment') {
      for (let i=0;i<40;i++) {
        const up = i < (s.b0===0?20:22), x=42+(i%8)*28, y=95+Math.floor(i/8)*31
        v += arrow(x,up?y+17:y,x,up?y:y+17,up?c.blue:c.orange,2)
      }
      v += text(32,278,'箭头表示磁矩方向，不是小球自转',12,c.muted)
      v += text(345,92,'¹H · 自旋 1/2 · 热平衡',14)+text(345,128,`B₀ = ${s.b0.toFixed(1)} T`)+text(345,157,`f₀ = ${M.frequencyMHz(s.b0).toFixed(2)} MHz`)
      v += text(345,193,`布居极化 ≈ ${(M.polarization(s.b0)*1e6).toFixed(2)} ppm`,14,c.blue)+text(345,218,'温度固定 310 K；P = tanh(ΔE / 2kT)',12,c.muted)
      if (s.b0>0) v += arrow(458,294,458,245)+text(482,274,'净磁化 +Z')
      else v += text(345,269,'无场：理想热平衡净磁化为零')
      v += text(24,335,'为看清方向，图中布居差被夸大；箭头数量不代表真实粒子计数。',12,c.muted)
    } else if (s.topic === 'precession') {
      const project = p => [170+100*p.x+42*p.y,230+28*p.y-125*p.z]
      const theta=s.angle*Math.PI/180, points=[]
      for(let i=0;i<=80;i++){const phi=2*Math.PI*i/80;points.push(project({x:Math.sin(theta)*Math.cos(phi),y:Math.sin(theta)*Math.sin(phi),z:Math.cos(theta)}).join(','))}
      v += line(68,230,290,230)+line(170,230,212,258)+arrow(170,230,170,66)+text(181,72,'+Z / B₀',12,c.muted)+text(287,246,'+X',12,c.muted)+text(214,267,'+Y',12,c.muted)
      v += `<polyline points="${points.join(' ')}" fill="none" stroke="${c.line}" stroke-width="2" stroke-dasharray="5 5"/>`
      const p=project(M.precession(s));v += arrow(170,230,p[0],p[1],c.orange)+text(p[0]+8,p[1]-8,'M',15,c.orange)
      v += text(343,98,'只观察静磁场中的自由进动',14)+text(343,136,`真实 f₀ = ${M.frequencyMHz(s.b0).toFixed(2)} MHz`)+text(343,170,`锥角 θ = ${s.angle}°；γ > 0（¹H）`)
      v += text(343,207,'dM/dt = γ M × B₀',15,c.blue)+text(343,240,'从 +Z 看向原点：顺时针进动',12,c.muted)
      v += text(24,310,'此模式暂不叠加弛豫。锥角不变，磁矩大小不因进动而缩短。',12,c.muted)+text(24,335,'屏幕大幅慢放；B₀ 改变时保持转速比例，不代表真实时间尺度。',12,c.muted)
    } else {
      const t1=s.topic==='t1', value=t1?M.recovery(s.u,s.initial):M.transverse(s.u)
      v += axes()
      if(t1){
        const yy=218-110*value
        v += line(170,218,170,108,c.line,3,'stroke-dasharray="4 4"')+text(68,103,'M₀',12,c.muted)
        if(Math.abs(value)>.008)v+=arrow(170,218,170,yy)
        v+=text(30,64,'仅显示纵向分量 Mz',13,c.blue)
      } else {
        v += `<ellipse cx="170" cy="218" rx="104" ry="34" fill="none" stroke="${c.line}"/>`+line(170,218,274,218,c.line,4,'stroke-dasharray="5 5"')
        if(value>.008)v+=arrow(170,218,170+104*value,218)
        v+=text(40,288,'旋转坐标系：横向幅度 Mxy',13,c.blue)
      }
      const x0=354,x1=623,y0=253,y1=83, low=t1&&s.initial===-1?-1:0
      const point=(u,val)=>[x0+(x1-x0)*u/5,y0-(y0-y1)*(val-low)/(1-low)]
      v += line(x0,y1,x0,y0)+line(x0,y0,x1,y0)+text(x0-7,y1-12,'归一化幅度',12,c.muted)+text(x1-22,y0+44,t1?'t / T1':'t / T2',12,c.muted)
      for(let i=0;i<=5;i++){const x=point(i,low)[0];v+=line(x,y0,x,y0+4)+text(x-4,y0+19,String(i),11,c.muted)}
      for(let i=low;i<=1;i++){const y=point(0,i)[1];v+=line(x0,y,x1,y,c.line,1,'stroke-dasharray="3 4"')+text(x0-22,y+4,String(i),11,c.muted)}
      const curve=[];for(let i=0;i<=150;i++){const u=i/30;curve.push(point(u,t1?M.recovery(u,s.initial):M.transverse(u)).join(','))}
      v+=`<polyline points="${curve.join(' ')}" fill="none" stroke="${c.blue}" stroke-width="3"/>`
      const [px,py]=point(s.u,value);v+=line(px,y1,px,y0,c.orange,1.5)+`<circle cx="${px}" cy="${py}" r="5" fill="${c.orange}"/>`
      v+=text(344,318,`${t1?'Mz / M₀':'Mxy / Mxy(0)'} = ${value.toFixed(3)} · t = ${Math.round(s.u*s.tau)} ms`,13,c.blue)
      v+=text(24,345,t1?'T1 恢复不等于所有磁化分量同步恢复。':'按单指数宏观模型展示相干衰减；不把静态频差失相等同于 T2。',12,c.muted)
    }
    return v+'</svg>'
  }
  return { render }
})
