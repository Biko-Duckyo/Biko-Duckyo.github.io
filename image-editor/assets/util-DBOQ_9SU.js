const o=()=>new Promise(e=>setTimeout(e,0));function s(){const e=new Set;return{on(n){return e.add(n),()=>e.delete(n)},emit(n){for(const t of e)t(n)}}}export{s as p,o as y};
