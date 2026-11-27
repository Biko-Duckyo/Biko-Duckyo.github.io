(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const c of document.querySelectorAll('link[rel="modulepreload"]'))s(c);new MutationObserver(c=>{for(const f of c)if(f.type==="childList")for(const h of f.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&s(h)}).observe(document,{childList:!0,subtree:!0});function a(c){const f={};return c.integrity&&(f.integrity=c.integrity),c.referrerPolicy&&(f.referrerPolicy=c.referrerPolicy),c.crossOrigin==="use-credentials"?f.credentials="include":c.crossOrigin==="anonymous"?f.credentials="omit":f.credentials="same-origin",f}function s(c){if(c.ep)return;c.ep=!0;const f=a(c);fetch(c.href,f)}})();var sd={exports:{}},pl={};var q_;function yM(){if(q_)return pl;q_=1;var o=Symbol.for("react.transitional.element"),n=Symbol.for("react.fragment");function a(s,c,f){var h=null;if(f!==void 0&&(h=""+f),c.key!==void 0&&(h=""+c.key),"key"in c){f={};for(var d in c)d!=="key"&&(f[d]=c[d])}else f=c;return c=f.ref,{$$typeof:o,type:s,key:h,ref:c!==void 0?c:null,props:f}}return pl.Fragment=n,pl.jsx=a,pl.jsxs=a,pl}var Y_;function SM(){return Y_||(Y_=1,sd.exports=yM()),sd.exports}var D=SM(),od={exports:{}},_e={};var W_;function MM(){if(W_)return _e;W_=1;var o=Symbol.for("react.transitional.element"),n=Symbol.for("react.portal"),a=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),c=Symbol.for("react.profiler"),f=Symbol.for("react.consumer"),h=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),m=Symbol.for("react.suspense"),_=Symbol.for("react.memo"),g=Symbol.for("react.lazy"),p=Symbol.for("react.activity"),x=Symbol.for("react.view_transition"),M=Symbol.iterator;function T(A){return A===null||typeof A!="object"?null:(A=M&&A[M]||A["@@iterator"],typeof A=="function"?A:null)}var R={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},S=Object.assign,y={};function P(A,k,H){this.props=A,this.context=k,this.refs=y,this.updater=H||R}P.prototype.isReactComponent={},P.prototype.setState=function(A,k){if(typeof A!="object"&&typeof A!="function"&&A!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,A,k,"setState")},P.prototype.forceUpdate=function(A){this.updater.enqueueForceUpdate(this,A,"forceUpdate")};function O(){}O.prototype=P.prototype;function N(A,k,H){this.props=A,this.context=k,this.refs=y,this.updater=H||R}var et=N.prototype=new O;et.constructor=N,S(et,P.prototype),et.isPureReactComponent=!0;var V=Array.isArray;function I(){}var q={H:null,A:null,T:null,S:null},U=Object.prototype.hasOwnProperty;function C(A,k,H){var W=H.ref;return{$$typeof:o,type:A,key:k,ref:W!==void 0?W:null,props:H}}function B(A,k){return C(A.type,k,A.props)}function at(A){return typeof A=="object"&&A!==null&&A.$$typeof===o}function ot(A){var k={"=":"=0",":":"=2"};return"$"+A.replace(/[=:]/g,function(H){return k[H]})}var ht=/\/+/g;function gt(A,k){return typeof A=="object"&&A!==null&&A.key!=null?ot(""+A.key):k.toString(36)}function X(A){switch(A.status){case"fulfilled":return A.value;case"rejected":throw A.reason;default:switch(typeof A.status=="string"?A.then(I,I):(A.status="pending",A.then(function(k){A.status==="pending"&&(A.status="fulfilled",A.value=k)},function(k){A.status==="pending"&&(A.status="rejected",A.reason=k)})),A.status){case"fulfilled":return A.value;case"rejected":throw A.reason}}throw A}function rt(A,k,H,W,mt){var _t=typeof A;(_t==="undefined"||_t==="boolean")&&(A=null);var At=!1;if(A===null)At=!0;else switch(_t){case"bigint":case"string":case"number":At=!0;break;case"object":switch(A.$$typeof){case o:case n:At=!0;break;case g:return At=A._init,rt(At(A._payload),k,H,W,mt)}}if(At)return mt=mt(A),At=W===""?"."+gt(A,0):W,V(mt)?(H="",At!=null&&(H=At.replace(ht,"$&/")+"/"),rt(mt,k,H,"",function(re){return re})):mt!=null&&(at(mt)&&(mt=B(mt,H+(mt.key==null||A&&A.key===mt.key?"":(""+mt.key).replace(ht,"$&/")+"/")+At)),k.push(mt)),1;At=0;var Ct=W===""?".":W+":";if(V(A))for(var Ut=0;Ut<A.length;Ut++)W=A[Ut],_t=Ct+gt(W,Ut),At+=rt(W,k,H,_t,mt);else if(Ut=T(A),typeof Ut=="function")for(A=Ut.call(A),Ut=0;!(W=A.next()).done;)W=W.value,_t=Ct+gt(W,Ut++),At+=rt(W,k,H,_t,mt);else if(_t==="object"){if(typeof A.then=="function")return rt(X(A),k,H,W,mt);throw k=String(A),Error("Objects are not valid as a React child (found: "+(k==="[object Object]"?"object with keys {"+Object.keys(A).join(", ")+"}":k)+"). If you meant to render a collection of children, use an array instead.")}return At}function Z(A,k,H){if(A==null)return A;var W=[],mt=0;return rt(A,W,"","",function(_t){return k.call(H,_t,mt++)}),W}function St(A){if(A._status===-1){var k=A._result,H=k();H.then(function(W){(A._status===0||A._status===-1)&&(A._status=1,A._result=W,H.status===void 0&&(H.status="fulfilled",H.value=W))},function(W){(A._status===0||A._status===-1)&&(A._status=2,A._result=W,H.status===void 0&&(H.status="rejected",H.reason=W))}),A._status===-1&&(A._status=0,A._result=H)}if(A._status===1)return A._result.default;throw A._result}var bt=typeof reportError=="function"?reportError:function(A){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var k=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof A=="object"&&A!==null&&typeof A.message=="string"?String(A.message):String(A),error:A});if(!window.dispatchEvent(k))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",A);return}console.error(A)};function Vt(A){var k=q.T,H={};H.types=k!==null?k.types:null,q.T=H;try{var W=A(),mt=q.S;mt!==null&&mt(H,W),typeof W=="object"&&W!==null&&typeof W.then=="function"&&W.then(I,bt)}catch(_t){bt(_t)}finally{k!==null&&H.types!==null&&(k.types=H.types),q.T=k}}function ce(A){var k=q.T;if(k!==null){var H=k.types;H===null?k.types=[A]:H.indexOf(A)===-1&&H.push(A)}else Vt(ce.bind(null,A))}var pt={map:Z,forEach:function(A,k,H){Z(A,function(){k.apply(this,arguments)},H)},count:function(A){var k=0;return Z(A,function(){k++}),k},toArray:function(A){return Z(A,function(k){return k})||[]},only:function(A){if(!at(A))throw Error("React.Children.only expected to receive a single React element child.");return A}};return _e.Activity=p,_e.Children=pt,_e.Component=P,_e.Fragment=a,_e.Profiler=c,_e.PureComponent=N,_e.StrictMode=s,_e.Suspense=m,_e.ViewTransition=x,_e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=q,_e.__COMPILER_RUNTIME={__proto__:null,c:function(A){return q.H.useMemoCache(A)}},_e.addTransitionType=ce,_e.cache=function(A){return function(){return A.apply(null,arguments)}},_e.cacheSignal=function(){return null},_e.cloneElement=function(A,k,H){if(A==null)throw Error("The argument must be a React element, but you passed "+A+".");var W=S({},A.props),mt=A.key;if(k!=null)for(_t in k.key!==void 0&&(mt=""+k.key),k)!U.call(k,_t)||_t==="key"||_t==="__self"||_t==="__source"||_t==="ref"&&k.ref===void 0||(W[_t]=k[_t]);var _t=arguments.length-2;if(_t===1)W.children=H;else if(1<_t){for(var At=Array(_t),Ct=0;Ct<_t;Ct++)At[Ct]=arguments[Ct+2];W.children=At}return C(A.type,mt,W)},_e.createContext=function(A){return A={$$typeof:h,_currentValue:A,_currentValue2:A,_threadCount:0,Provider:null,Consumer:null},A.Provider=A,A.Consumer={$$typeof:f,_context:A},A},_e.createElement=function(A,k,H){var W,mt={},_t=null;if(k!=null)for(W in k.key!==void 0&&(_t=""+k.key),k)U.call(k,W)&&W!=="key"&&W!=="__self"&&W!=="__source"&&(mt[W]=k[W]);var At=arguments.length-2;if(At===1)mt.children=H;else if(1<At){for(var Ct=Array(At),Ut=0;Ut<At;Ut++)Ct[Ut]=arguments[Ut+2];mt.children=Ct}if(A&&A.defaultProps)for(W in At=A.defaultProps,At)mt[W]===void 0&&(mt[W]=At[W]);return C(A,_t,mt)},_e.createRef=function(){return{current:null}},_e.forwardRef=function(A){return{$$typeof:d,render:A}},_e.isValidElement=at,_e.lazy=function(A){return{$$typeof:g,_payload:{_status:-1,_result:A},_init:St}},_e.memo=function(A,k){return{$$typeof:_,type:A,compare:k===void 0?null:k}},_e.startTransition=Vt,_e.unstable_useCacheRefresh=function(){return q.H.useCacheRefresh()},_e.use=function(A){return q.H.use(A)},_e.useActionState=function(A,k,H){return q.H.useActionState(A,k,H)},_e.useCallback=function(A,k){return q.H.useCallback(A,k)},_e.useContext=function(A){return q.H.useContext(A)},_e.useDebugValue=function(){},_e.useDeferredValue=function(A,k){return q.H.useDeferredValue(A,k)},_e.useEffect=function(A,k){return q.H.useEffect(A,k)},_e.useEffectEvent=function(A){return q.H.useEffectEvent(A)},_e.useId=function(){return q.H.useId()},_e.useImperativeHandle=function(A,k,H){return q.H.useImperativeHandle(A,k,H)},_e.useInsertionEffect=function(A,k){return q.H.useInsertionEffect(A,k)},_e.useLayoutEffect=function(A,k){return q.H.useLayoutEffect(A,k)},_e.useMemo=function(A,k){return q.H.useMemo(A,k)},_e.useOptimistic=function(A,k){return q.H.useOptimistic(A,k)},_e.useReducer=function(A,k,H){return q.H.useReducer(A,k,H)},_e.useRef=function(A){return q.H.useRef(A)},_e.useState=function(A){return q.H.useState(A)},_e.useSyncExternalStore=function(A,k,H){return q.H.useSyncExternalStore(A,k,H)},_e.useTransition=function(){return q.H.useTransition()},_e.version="19.3.0",_e}var Z_;function Np(){return Z_||(Z_=1,od.exports=MM()),od.exports}var He=Np(),ld={exports:{}},ml={},cd={exports:{}},ud={};var K_;function EM(){return K_||(K_=1,(function(o){function n(X,rt){var Z=X.length;X.push(rt);t:for(;0<Z;){var St=Z-1>>>1,bt=X[St];if(0<c(bt,rt))X[St]=rt,X[Z]=bt,Z=St;else break t}}function a(X){return X.length===0?null:X[0]}function s(X){if(X.length===0)return null;var rt=X[0],Z=X.pop();if(Z!==rt){X[0]=Z;t:for(var St=0,bt=X.length,Vt=bt>>>1;St<Vt;){var ce=2*(St+1)-1,pt=X[ce],A=ce+1,k=X[A];if(0>c(pt,Z))A<bt&&0>c(k,pt)?(X[St]=k,X[A]=Z,St=A):(X[St]=pt,X[ce]=Z,St=ce);else if(A<bt&&0>c(k,Z))X[St]=k,X[A]=Z,St=A;else break t}}return rt}function c(X,rt){var Z=X.sortIndex-rt.sortIndex;return Z!==0?Z:X.id-rt.id}if(o.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var f=performance;o.unstable_now=function(){return f.now()}}else{var h=Date,d=h.now();o.unstable_now=function(){return h.now()-d}}var m=[],_=[],g=1,p=null,x=3,M=!1,T=!1,R=!1,S=!1,y=typeof setTimeout=="function"?setTimeout:null,P=typeof clearTimeout=="function"?clearTimeout:null,O=typeof setImmediate<"u"?setImmediate:null;function N(X){for(var rt=a(_);rt!==null;){if(rt.callback===null)s(_);else if(rt.startTime<=X)s(_),rt.sortIndex=rt.expirationTime,n(m,rt);else break;rt=a(_)}}function et(X){if(R=!1,N(X),!T)if(a(m)!==null)T=!0,V||(V=!0,at());else{var rt=a(_);rt!==null&&gt(et,rt.startTime-X)}}var V=!1,I=-1,q=5,U=-1;function C(){return S?!0:!(o.unstable_now()-U<q)}function B(){if(S=!1,V){var X=o.unstable_now();U=X;var rt=!0;try{t:{T=!1,R&&(R=!1,P(I),I=-1),M=!0;var Z=x;try{e:{for(N(X),p=a(m);p!==null&&!(p.expirationTime>X&&C());){var St=p.callback;if(typeof St=="function"){p.callback=null,x=p.priorityLevel;var bt=St(p.expirationTime<=X);if(X=o.unstable_now(),typeof bt=="function"){p.callback=bt,N(X),rt=!0;break e}p===a(m)&&s(m),N(X)}else s(m);p=a(m)}if(p!==null)rt=!0;else{var Vt=a(_);Vt!==null&&gt(et,Vt.startTime-X),rt=!1}}break t}finally{p=null,x=Z,M=!1}rt=void 0}}finally{rt?at():V=!1}}}var at;if(typeof O=="function")at=function(){O(B)};else if(typeof MessageChannel<"u"){var ot=new MessageChannel,ht=ot.port2;ot.port1.onmessage=B,at=function(){ht.postMessage(null)}}else at=function(){y(B,0)};function gt(X,rt){I=y(function(){X(o.unstable_now())},rt)}o.unstable_IdlePriority=5,o.unstable_ImmediatePriority=1,o.unstable_LowPriority=4,o.unstable_NormalPriority=3,o.unstable_Profiling=null,o.unstable_UserBlockingPriority=2,o.unstable_cancelCallback=function(X){X.callback=null},o.unstable_forceFrameRate=function(X){0>X||125<X?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):q=0<X?Math.floor(1e3/X):5},o.unstable_getCurrentPriorityLevel=function(){return x},o.unstable_next=function(X){switch(x){case 1:case 2:case 3:var rt=3;break;default:rt=x}var Z=x;x=rt;try{return X()}finally{x=Z}},o.unstable_requestPaint=function(){S=!0},o.unstable_runWithPriority=function(X,rt){switch(X){case 1:case 2:case 3:case 4:case 5:break;default:X=3}var Z=x;x=X;try{return rt()}finally{x=Z}},o.unstable_scheduleCallback=function(X,rt,Z){var St=o.unstable_now();switch(typeof Z=="object"&&Z!==null?(Z=Z.delay,Z=typeof Z=="number"&&0<Z?St+Z:St):Z=St,X){case 1:var bt=-1;break;case 2:bt=250;break;case 5:bt=1073741823;break;case 4:bt=1e4;break;default:bt=5e3}return bt=Z+bt,X={id:g++,callback:rt,priorityLevel:X,startTime:Z,expirationTime:bt,sortIndex:-1},Z>St?(X.sortIndex=Z,n(_,X),a(m)===null&&X===a(_)&&(R?(P(I),I=-1):R=!0,gt(et,Z-St))):(X.sortIndex=bt,n(m,X),T||M||(T=!0,V||(V=!0,at()))),X},o.unstable_shouldYield=C,o.unstable_wrapCallback=function(X){var rt=x;return function(){var Z=x;x=rt;try{return X.apply(this,arguments)}finally{x=Z}}}})(ud)),ud}var Q_;function TM(){return Q_||(Q_=1,cd.exports=EM()),cd.exports}var fd={exports:{}},Xn={};var J_;function bM(){if(J_)return Xn;J_=1;var o=Np();function n(g){var p="https://react.dev/errors/"+g;if(1<arguments.length){p+="?args[]="+encodeURIComponent(arguments[1]);for(var x=2;x<arguments.length;x++)p+="&args[]="+encodeURIComponent(arguments[x])}return"Minified React error #"+g+"; visit "+p+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function a(){}var s={d:{f:a,r:function(){throw Error(n(522))},D:a,C:a,L:a,m:a,X:a,S:a,M:a},p:0,findDOMNode:null},c=Symbol.for("react.portal"),f=Symbol.for("react.recoverable"),h=Symbol.for("react.optimistic_key");function d(g,p,x){var M=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:c,key:M==null?null:M===h?h:""+M,children:g,containerInfo:p,implementation:x}}var m=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function _(g,p){if(g==="font")return"";if(typeof p=="string")return p==="use-credentials"?p:""}return Xn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=s,Xn.browser=function(g){return{$$typeof:f,_reason:g}},Xn.createPortal=function(g,p){var x=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!p||p.nodeType!==1&&p.nodeType!==9&&p.nodeType!==11)throw Error(n(299));return d(g,p,null,x)},Xn.flushSync=function(g){var p=m.T,x=s.p;try{if(m.T=null,s.p=2,g)return g()}finally{m.T=p,s.p=x,s.d.f()}},Xn.preconnect=function(g,p){typeof g=="string"&&(p?(p=p.crossOrigin,p=typeof p=="string"?p==="use-credentials"?p:"":void 0):p=null,s.d.C(g,p))},Xn.prefetchDNS=function(g){typeof g=="string"&&s.d.D(g)},Xn.preinit=function(g,p){if(typeof g=="string"&&p&&typeof p.as=="string"){var x=p.as,M=_(x,p.crossOrigin),T=typeof p.integrity=="string"?p.integrity:void 0,R=typeof p.fetchPriority=="string"?p.fetchPriority:void 0;x==="style"?s.d.S(g,typeof p.precedence=="string"?p.precedence:void 0,{crossOrigin:M,integrity:T,fetchPriority:R}):x==="script"&&s.d.X(g,{crossOrigin:M,integrity:T,fetchPriority:R,nonce:typeof p.nonce=="string"?p.nonce:void 0})}},Xn.preinitModule=function(g,p){if(typeof g=="string")if(typeof p=="object"&&p!==null){if(p.as==null||p.as==="script"){var x=_(p.as,p.crossOrigin);s.d.M(g,{crossOrigin:x,integrity:typeof p.integrity=="string"?p.integrity:void 0,nonce:typeof p.nonce=="string"?p.nonce:void 0,fetchPriority:typeof p.fetchPriority=="string"?p.fetchPriority:void 0})}}else p==null&&s.d.M(g)},Xn.preload=function(g,p){if(typeof g=="string"&&typeof p=="object"&&p!==null&&typeof p.as=="string"){var x=p.as,M=_(x,p.crossOrigin);s.d.L(g,x,{crossOrigin:M,integrity:typeof p.integrity=="string"?p.integrity:void 0,nonce:typeof p.nonce=="string"?p.nonce:void 0,type:typeof p.type=="string"?p.type:void 0,fetchPriority:typeof p.fetchPriority=="string"?p.fetchPriority:void 0,referrerPolicy:typeof p.referrerPolicy=="string"?p.referrerPolicy:void 0,imageSrcSet:typeof p.imageSrcSet=="string"?p.imageSrcSet:void 0,imageSizes:typeof p.imageSizes=="string"?p.imageSizes:void 0,media:typeof p.media=="string"?p.media:void 0})}},Xn.preloadModule=function(g,p){if(typeof g=="string")if(p){var x=_(p.as,p.crossOrigin);s.d.m(g,{as:typeof p.as=="string"&&p.as!=="script"?p.as:void 0,crossOrigin:x,integrity:typeof p.integrity=="string"?p.integrity:void 0,nonce:typeof p.nonce=="string"?p.nonce:void 0,fetchPriority:typeof p.fetchPriority=="string"?p.fetchPriority:void 0})}else s.d.m(g)},Xn.requestFormReset=function(g){s.d.r(g)},Xn.unstable_batchedUpdates=function(g,p){return g(p)},Xn.useFormState=function(g,p,x){return m.H.useFormState(g,p,x)},Xn.useFormStatus=function(){return m.H.useHostTransitionStatus()},Xn.version="19.3.0",Xn}var $_;function AM(){if($_)return fd.exports;$_=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(n){console.error(n)}}return o(),fd.exports=bM(),fd.exports}var t0;function RM(){if(t0)return ml;t0=1;var o=TM(),n=Np(),a=AM();function s(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var i=2;i<arguments.length;i++)e+="&args[]="+encodeURIComponent(arguments[i])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function c(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function f(t){for(var e=t,i=e;i&&!i.alternate;)e=i,(e.flags&4098)!==0&&(t=e.return),i=e.return;for(;e.return;)e=e.return;return e.tag===3?t:null}function h(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function d(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function m(t){if(f(t)!==t)throw Error(s(188))}function _(t){var e=t.alternate;if(!e){if(e=f(t),e===null)throw Error(s(188));return e!==t?null:t}for(var i=t,r=e;;){var l=i.return;if(l===null)break;var u=l.alternate;if(u===null){if(r=l.return,r!==null){i=r;continue}break}if(l.child===u.child){for(u=l.child;u;){if(u===i)return m(l),t;if(u===r)return m(l),e;u=u.sibling}throw Error(s(188))}if(i.return!==r.return)i=l,r=u;else{for(var v=!1,E=l.child;E;){if(E===i){v=!0,i=l,r=u;break}if(E===r){v=!0,r=l,i=u;break}E=E.sibling}if(!v){for(E=u.child;E;){if(E===i){v=!0,i=u,r=l;break}if(E===r){v=!0,r=u,i=l;break}E=E.sibling}if(!v)throw Error(s(189))}}if(i.alternate!==r)throw Error(s(190))}if(i.tag!==3)throw Error(s(188));return i.stateNode.current===i?t:e}function g(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=g(t),e!==null)return e;t=t.sibling}return null}function p(t,e,i,r,l,u){for(;t!==null;){if((t.tag===5||t.tag===27||t.tag===6)&&i(t,r,l,u)||(t.tag!==22||t.memoizedState===null)&&(e||t.tag!==5&&t.tag!==27)&&p(t.child,e,i,r,l,u))return!0;t=t.sibling}return!1}function x(t){for(t=t.return;t!==null;){if(t.tag===3||t.tag===5||t.tag===27)return t;t=t.return}return null}function M(t){var e=!1;for(t=t.return;t!==null&&(t.tag===4&&(e=!0),!(t.tag===3||t.tag===5||t.tag===27));)t=t.return;return e}function T(t){var e=[null,null],i=x(t);return i===null||R(e,t,i.child,{foundSelf:!1}),e}function R(t,e,i,r){for(;i!==null;){if(i===e)r.foundSelf=!0;else if(i.tag===5||i.tag===27||i.tag===6){if(r.foundSelf)return t[1]=i,!0;t[0]=i}else if((i.tag!==22||i.memoizedState===null)&&R(t,e,i.child,r))return!0;i=i.sibling}return!1}function S(t){switch(t.tag){case 5:case 27:case 6:return t.stateNode;case 3:return t.stateNode.containerInfo;default:throw Error(s(559))}}var y=null,P=null;function O(t,e,i){return t===i?!0:t===e?(y=t,!0):!1}function N(t,e,i){return t===i?(P=t,!1):t===e?(P!==null&&(y=t),!0):!1}function et(t){if(t===null)return null;do t=t===null?null:t.return;while(t&&t.tag!==5&&t.tag!==27&&t.tag!==3);return t||null}function V(t,e,i){for(var r=0,l=t;l;l=i(l))r++;l=0;for(var u=e;u;u=i(u))l++;for(;0<r-l;)t=i(t),r--;for(;0<l-r;)e=i(e),l--;for(;r--;){if(t===e||e!==null&&t===e.alternate)return t;t=i(t),e=i(e)}return null}var I=Object.assign,q=Symbol.for("react.element"),U=Symbol.for("react.transitional.element"),C=Symbol.for("react.portal"),B=Symbol.for("react.fragment"),at=Symbol.for("react.strict_mode"),ot=Symbol.for("react.profiler"),ht=Symbol.for("react.consumer"),gt=Symbol.for("react.context"),X=Symbol.for("react.forward_ref"),rt=Symbol.for("react.suspense"),Z=Symbol.for("react.suspense_list"),St=Symbol.for("react.memo"),bt=Symbol.for("react.lazy"),Vt=Symbol.for("react.activity"),ce=Symbol.for("react.legacy_hidden"),pt=Symbol.for("react.memo_cache_sentinel"),A=Symbol.for("react.view_transition"),k=Symbol.for("react.recoverable"),H=Symbol.iterator;function W(t){return t===null||typeof t!="object"?null:(t=H&&t[H]||t["@@iterator"],typeof t=="function"?t:null)}var mt=Symbol.for("react.client.reference");function _t(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===mt?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case B:return"Fragment";case ot:return"Profiler";case at:return"StrictMode";case rt:return"Suspense";case Z:return"SuspenseList";case Vt:return"Activity";case A:return"ViewTransition"}if(typeof t=="object")switch(t.$$typeof){case C:return"Portal";case gt:return t.displayName||"Context";case ht:return(t._context.displayName||"Context")+".Consumer";case X:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case St:return e=t.displayName||null,e!==null?e:_t(t.type)||"Memo";case bt:e=t._payload,t=t._init;try{return _t(t(e))}catch{}}return null}var At=Array.isArray,Ct=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ut=a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,re={pending:!1,data:null,method:null,action:null},j=[],Fe=-1;function le(t){return{current:t}}function ae(t){0>Fe||(t.current=j[Fe],j[Fe]=null,Fe--)}function Ft(t,e){Fe++,j[Fe]=t.current,t.current=e}var Se=le(null),ne=le(null),L=le(null),b=le(null);function it(t,e){switch(Ft(L,e),Ft(ne,t),Ft(Se,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?e_(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=e_(e),t=n_(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}ae(Se),Ft(Se,t)}function xt(){ae(Se),ae(ne),ae(L)}function Rt(t){var e=t.memoizedState;e!==null&&(Ys._currentValue=e.memoizedState,Ft(b,t)),e=Se.current;var i=n_(e,t.type);e!==i&&(Ft(ne,t),Ft(Se,i))}function Et(t){ne.current===t&&(ae(Se),ae(ne)),b.current===t&&(ae(b),Ys._currentValue=re)}var qt,vt;function Ht(t){if(qt===void 0)try{throw Error()}catch(i){var e=i.stack.trim().match(/\n( *(at )?)/);qt=e&&e[1]||"",vt=-1<i.stack.indexOf(`
    at`)?" (<anonymous>)":-1<i.stack.indexOf("@")?"@unknown:0:0":""}return`
`+qt+t+vt}var Te=!1;function Nt(t,e){if(!t||Te)return"";Te=!0;var i=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(e){var Mt=function(){throw Error()};if(Object.defineProperty(Mt.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(Mt,[])}catch(Bt){var Y=Bt}Reflect.construct(t,[],Mt)}else{try{Mt.call()}catch(Bt){Y=Bt}Mt=!1;try{var nt=Object.getOwnPropertyDescriptor(t.prototype,"props");Object.defineProperty(t.prototype,"props",{configurable:!0,set:function(){throw Error()}}),Mt=!0,new t}finally{Mt&&(nt!==void 0?Object.defineProperty(t.prototype,"props",nt):delete t.prototype.props)}}}else{try{throw Error()}catch(Bt){Y=Bt}(Mt=t())&&typeof Mt.catch=="function"&&Mt.catch(function(){})}}catch(Bt){if(Bt&&Y&&typeof Bt.stack=="string")return[Bt.stack,Y.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var l=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,"name");l&&l.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var u=r.DetermineComponentFrameRoot(),v=u[0],E=u[1];if(v&&E){var z=v.split(`
`),J=E.split(`
`);for(l=r=0;r<z.length&&!z[r].includes("DetermineComponentFrameRoot");)r++;for(;l<J.length&&!J[l].includes("DetermineComponentFrameRoot");)l++;if(r===z.length||l===J.length)for(r=z.length-1,l=J.length-1;1<=r&&0<=l&&z[r]!==J[l];)l--;for(;1<=r&&0<=l;r--,l--)if(z[r]!==J[l]){if(r!==1||l!==1)do if(r--,l--,0>l||z[r]!==J[l]){var st=`
`+z[r].replace(" at new "," at ");return t.displayName&&st.includes("<anonymous>")&&(st=st.replace("<anonymous>",t.displayName)),st}while(1<=r&&0<=l);break}}}finally{Te=!1,Error.prepareStackTrace=i}return(i=t?t.displayName||t.name:"")?Ht(i):""}function Yt(t,e){switch(t.tag){case 26:case 27:case 5:return Ht(t.type);case 16:return Ht("Lazy");case 13:return t.child!==e&&e!==null?Ht("Suspense Fallback"):Ht("Suspense");case 19:return Ht("SuspenseList");case 0:case 15:return Nt(t.type,!1);case 11:return Nt(t.type.render,!1);case 1:return Nt(t.type,!0);case 31:return Ht("Activity");case 30:return Ht("ViewTransition");default:return""}}function te(t){try{var e="",i=null;do e+=Yt(t,i),i=t,t=t.return;while(t);return e}catch(r){return`
Error generating stack: `+r.message+`
`+r.stack}}var ue=Object.prototype.hasOwnProperty,jt=o.unstable_scheduleCallback,ye=o.unstable_cancelCallback,xe=o.unstable_shouldYield,we=o.unstable_requestPaint,F=o.unstable_now,wt=o.unstable_getCurrentPriorityLevel,ut=o.unstable_ImmediatePriority,Tt=o.unstable_UserBlockingPriority,zt=o.unstable_NormalPriority,Gt=o.unstable_LowPriority,fe=o.unstable_IdlePriority,$e=o.log,cn=o.unstable_setDisableYieldValue,De=null,Xe=null;function rn(t){if(typeof $e=="function"&&cn(t),Xe&&typeof Xe.setStrictMode=="function")try{Xe.setStrictMode(De,t)}catch{}}var fn=Math.clz32?Math.clz32:pa,Xa=Math.log,zi=Math.LN2;function pa(t){return t>>>=0,t===0?32:31-(Xa(t)/zi|0)|0}var Mi=256,Ji=262144,Pi=4194304;function hi(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&-t;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function ei(t,e,i){var r=t.pendingLanes;if(r===0)return 0;var l=0,u=t.suspendedLanes,v=t.pingedLanes;t=t.warmLanes;var E=r&134217727;return E!==0?(r=E&~u,r!==0?l=hi(r):(v&=E,v!==0?l=hi(v):i||(i=E&~t,i!==0&&(l=hi(i))))):(E=r&~u,E!==0?l=hi(E):v!==0?l=hi(v):i||(i=r&~t,i!==0&&(l=hi(i)))),l===0?0:e!==0&&e!==l&&(e&u)===0&&(u=l&-l,i=e&-e,u>=i||u===32&&(i&4194048)!==0)?e:l}function $i(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function ka(t,e){(e&8)!==0&&(e|=e&32);var i=t.entangledLanes;if(i!==0)for(t=t.entanglements,i&=e;0<i;){var r=31-fn(i),l=1<<r;e|=t[r],i&=~l}return e}function bo(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function cs(){var t=Pi;return Pi<<=1,(Pi&62914560)===0&&(Pi=4194304),t}function Rr(t){for(var e=[],i=0;31>i;i++)e.push(t);return e}function w(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Q(t,e,i,r,l,u){var v=t.pendingLanes;t.pendingLanes=i,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=i,t.entangledLanes&=i,t.errorRecoveryDisabledLanes&=i,t.shellSuspendCounter=0;var E=t.entanglements,z=t.expirationTimes,J=t.hiddenUpdates;for(i=v&~i;0<i;){var st=31-fn(i),Mt=1<<st;E[st]=0,z[st]=-1;var Y=J[st];if(Y!==null)for(J[st]=null,st=0;st<Y.length;st++){var nt=Y[st];nt!==null&&(nt.lane&=-536870913)}i&=~Mt}r!==0&&lt(t,r,0),u!==0&&l===0&&t.tag!==0&&(t.suspendedLanes|=u&~(v&~e))}function lt(t,e,i){t.pendingLanes|=e,t.suspendedLanes&=~e;var r=31-fn(e);t.entangledLanes|=e,t.entanglements[r]=t.entanglements[r]|1073741824|i&261930}function ct(t,e){var i=t.entangledLanes|=e;for(t=t.entanglements;i;){var r=31-fn(i),l=1<<r;l&e|t[r]&e&&(t[r]|=e),i&=~l}}function $(t,e){var i=e&-e;return i=(i&42)!==0?1:Lt(i),(i&(t.suspendedLanes|e))!==0?0:i}function Lt(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Pt(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function Zt(){var t=Ut.p;return t!==0?t:(t=window.event,t===void 0?32:F_(t.type))}function Qt(t,e){var i=Ut.p;try{return Ut.p=t,e()}finally{Ut.p=i}}var ie=Math.random().toString(36).slice(2),ee="__reactFiber$"+ie,Xt="__reactProps$"+ie,be="__reactContainer$"+ie,je="__reactEvents$"+ie,Ye="__reactListeners$"+ie,un="__reactHandles$"+ie,Ue="__reactResources$"+ie,Jt="__reactMarker$"+ie,hn="__reactLoad$"+ie;function Ne(t){delete t[ee],delete t[Xt],delete t[Ye],delete t[un]}function sn(t){var e;if(e=t[ee])return e;for(var i=t.parentNode;i;){if(e=i[be]||i[ee]){if(i=e.alternate,e.child!==null||i!==null&&i.child!==null)for(t=x_(t);t!==null;){if(i=t[ee])return i;t=x_(t)}return e}t=i,i=t.parentNode}return null}function kn(t){if(t=t[ee]||t[be]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function xn(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(s(33))}function ni(t){var e=t[Ue];return e||(e=t[Ue]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function me(t){t[Jt]=!0}function Wn(t){t[hn]=void 0}var ta=new Set,dt={};function Dt(t,e){Ot(t,e),Ot(t+"Capture",e)}function Ot(t,e){for(dt[t]=e,t=0;t<e.length;t++)ta.add(e[t])}var Kt=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),he={},ve={};function Ze(t){return ue.call(ve,t)?!0:ue.call(he,t)?!1:Kt.test(t)?ve[t]=!0:(he[t]=!0,!1)}var ge=!1;function wn(){var t=ge;return ge=!1,t}function de(t,e,i){if(Ze(e))if(i===null)t.removeAttribute(e);else{switch(typeof i){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var r=e.toLowerCase().slice(0,5);if(r!=="data-"&&r!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,i)}}function En(t,e,i){if(i===null)t.removeAttribute(e);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,i)}}function mn(t,e,i,r){if(r===null)t.removeAttribute(i);else{switch(typeof r){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(i);return}t.setAttributeNS(e,i,r)}}function oe(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Ln(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function ma(t,e,i){var r=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var l=r.get,u=r.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return l.call(this)},set:function(v){i=""+v,u.call(this,v)}}),Object.defineProperty(t,e,{enumerable:r.enumerable}),{getValue:function(){return i},setValue:function(v){i=""+v},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function us(t){if(!t._valueTracker){var e=Ln(t)?"checked":"value";t._valueTracker=ma(t,e,""+t[e])}}function Xp(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var i=e.getValue(),r="";return t&&(r=Ln(t)?t.checked?"true":"false":t.value),t=r,t!==i?(e.setValue(t),!0):!1}var Gx=/[\n"\\]/g;function Ei(t){return t.replace(Gx,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function Pu(t,e,i,r,l,u,v,E){t.name="",v!=null&&typeof v!="function"&&typeof v!="symbol"&&typeof v!="boolean"?t.type=v:t.removeAttribute("type"),e!=null?v==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+oe(e)):t.value!==""+oe(e)&&(t.value=""+oe(e)):v!=="submit"&&v!=="reset"||t.removeAttribute("value"),e!=null?v==="number"&&t.value==e?Iu(t,oe(t.value)):Iu(t,oe(e)):i!=null?Iu(t,oe(i)):r!=null&&t.removeAttribute("value"),l==null&&u!=null&&(t.defaultChecked=!!u),l!=null&&(t.checked=l&&typeof l!="function"&&typeof l!="symbol"),E!=null&&typeof E!="function"&&typeof E!="symbol"&&typeof E!="boolean"?t.name=""+oe(E):t.removeAttribute("name")}function kp(t,e,i,r,l,u,v,E){if(u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(t.type=u),e!=null||i!=null){if(!(u!=="submit"&&u!=="reset"||e!=null)){us(t);return}i=i!=null?""+oe(i):"",e=e!=null?""+oe(e):i,E||e===t.value||(t.value=e),t.defaultValue=e}r=r??l,r=typeof r!="function"&&typeof r!="symbol"&&!!r,t.checked=E?t.checked:!!r,t.defaultChecked=!!r,v!=null&&typeof v!="function"&&typeof v!="symbol"&&typeof v!="boolean"&&(t.name=v),us(t)}function Iu(t,e){t.defaultValue!==""+e&&(t.defaultValue=""+e)}function fs(t,e,i,r){if(t=t.options,e){e={};for(var l=0;l<i.length;l++)e["$"+i[l]]=!0;for(i=0;i<t.length;i++)l=e.hasOwnProperty("$"+t[i].value),t[i].selected!==l&&(t[i].selected=l),l&&r&&(t[i].defaultSelected=!0)}else{for(i=""+oe(i),e=null,l=0;l<t.length;l++){if(t[l].value===i){t[l].selected=!0,r&&(t[l].defaultSelected=!0);return}e!==null||t[l].disabled||(e=t[l])}e!==null&&(e.selected=!0)}}function jp(t,e,i){if(e!=null&&(e=""+oe(e),e!==t.value&&(t.value=e),i==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=i!=null?""+oe(i):""}function qp(t,e,i,r){if(e==null){if(r!=null){if(i!=null)throw Error(s(92));if(At(r)){if(1<r.length)throw Error(s(93));r=r[0]}i=r}i==null&&(i=""),e=i}i=oe(e),t.defaultValue=i,r=t.textContent,r===i&&r!==""&&r!==null&&(t.value=r),us(t)}function hs(t,e){if(e){var i=t.firstChild;if(i&&i===t.lastChild&&i.nodeType===3){i.nodeValue=e;return}}t.textContent=e}var Vx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Yp(t,e,i){var r=e.indexOf("--")===0;i==null||typeof i=="boolean"||i===""?r?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":r?t.setProperty(e,i):typeof i!="number"||i===0||Vx.has(e)?e==="float"?t.cssFloat=i:t[e]=(""+i).trim():t[e]=i+"px"}function Wp(t,e,i){if(e!=null&&typeof e!="object")throw Error(s(62));if(t=t.style,i!=null){for(var r in i)!i.hasOwnProperty(r)||e!=null&&e.hasOwnProperty(r)||(r.indexOf("--")===0?t.setProperty(r,""):r==="float"?t.cssFloat="":t[r]="",ge=!0);for(var l in e)r=e[l],e.hasOwnProperty(l)&&i[l]!==r&&(Yp(t,l,r),ge=!0)}else for(var u in e)e.hasOwnProperty(u)&&Yp(t,u,e[u])}function Bu(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Xx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),kx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Nl(t){return kx.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function ea(){}var Fu=null;function Hu(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var ds=null,ps=null;function Zp(t){var e=kn(t);if(e&&(t=e.stateNode)){var i=t[Xt]||null;t:switch(t=e.stateNode,e.type){case"input":if(Pu(t,i.value,i.defaultValue,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name),e=i.name,i.type==="radio"&&e!=null){for(i=t;i.parentNode;)i=i.parentNode;for(i=i.querySelectorAll('input[name="'+Ei(""+e)+'"][type="radio"]'),e=0;e<i.length;e++){var r=i[e];if(r!==t&&r.form===t.form){var l=r[Xt]||null;if(!l)throw Error(s(90));Pu(r,l.value,l.defaultValue,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name)}}for(e=0;e<i.length;e++)r=i[e],r.form===t.form&&Xp(r)}break t;case"textarea":jp(t,i.value,i.defaultValue);break t;case"select":e=i.value,e!=null&&fs(t,!!i.multiple,e,!1)}}}var Gu=!1;function Kp(t,e,i){if(Gu)return t(e,i);Gu=!0;try{var r=t(e);return r}finally{if(Gu=!1,(ds!==null||ps!==null)&&(Nc(),ds&&(e=ds,t=ps,ps=ds=null,Zp(e),t)))for(e=0;e<t.length;e++)Zp(t[e])}}function Ao(t,e){var i=t.stateNode;if(i===null)return null;var r=i[Xt]||null;if(r===null)return null;i=r[e];t:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break t;default:t=!1}if(t)return null;if(i&&typeof i!="function")throw Error(s(231,e,typeof i));return i}var ga=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Vu=!1;if(ga)try{var Ro={};Object.defineProperty(Ro,"passive",{get:function(){Vu=!0}}),window.addEventListener("test",Ro,Ro),window.removeEventListener("test",Ro,Ro)}catch{Vu=!1}var ja=null,Xu=null,Ll=null;function Qp(){if(Ll)return Ll;var t,e=Xu,i=e.length,r,l="value"in ja?ja.value:ja.textContent,u=l.length;for(t=0;t<i&&e[t]===l[t];t++);var v=i-t;for(r=1;r<=v&&e[i-r]===l[u-r];r++);return Ll=l.slice(t,1<r?1-r:void 0)}function Ol(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function zl(){return!0}function Jp(){return!1}function Zn(t){function e(i,r,l,u,v){this._reactName=i,this._targetInst=l,this.type=r,this.nativeEvent=u,this.target=v,this.currentTarget=null;for(var E in t)t.hasOwnProperty(E)&&(i=t[E],this[E]=i?i(u):u[E]);return this.isDefaultPrevented=(u.defaultPrevented!=null?u.defaultPrevented:u.returnValue===!1)?zl:Jp,this.isPropagationStopped=Jp,this}return I(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var i=this.nativeEvent;i&&(i.preventDefault?i.preventDefault():typeof i.returnValue!="unknown"&&(i.returnValue=!1),this.isDefaultPrevented=zl)},stopPropagation:function(){var i=this.nativeEvent;i&&(i.stopPropagation?i.stopPropagation():typeof i.cancelBubble!="unknown"&&(i.cancelBubble=!0),this.isPropagationStopped=zl)},persist:function(){},isPersistent:zl}),e}var qa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Pl=Zn(qa),Co=I({},qa,{view:0,detail:0}),jx=Zn(Co),ku,ju,wo,Il=I({},Co,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Yu,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==wo&&(wo&&t.type==="mousemove"?(ku=t.screenX-wo.screenX,ju=t.screenY-wo.screenY):ju=ku=0,wo=t),ku)},movementY:function(t){return"movementY"in t?t.movementY:ju}}),$p=Zn(Il),qx=I({},Il,{dataTransfer:0}),Yx=Zn(qx),Wx=I({},Co,{relatedTarget:0}),qu=Zn(Wx),Zx=I({},qa,{animationName:0,elapsedTime:0,pseudoElement:0}),Kx=Zn(Zx),Qx=I({},qa,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Jx=Zn(Qx),$x=I({},qa,{data:0}),tm=Zn($x),ty={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ey={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},ny={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function iy(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=ny[t])?!!e[t]:!1}function Yu(){return iy}var ay=I({},Co,{key:function(t){if(t.key){var e=ty[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Ol(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?ey[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Yu,charCode:function(t){return t.type==="keypress"?Ol(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Ol(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),ry=Zn(ay),sy=I({},Il,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),em=Zn(sy),oy=I({},qa,{submitter:0}),ly=Zn(oy),cy=I({},Co,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Yu}),uy=Zn(cy),fy=I({},qa,{propertyName:0,elapsedTime:0,pseudoElement:0}),hy=Zn(fy),dy=I({},Il,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),py=Zn(dy),my=I({},qa,{newState:0,oldState:0,source:0}),gy=Zn(my),vy=[9,13,27,32],Wu=ga&&"CompositionEvent"in window,Do=null;ga&&"documentMode"in document&&(Do=document.documentMode);var _y=ga&&"TextEvent"in window&&!Do,nm=ga&&(!Wu||Do&&8<Do&&11>=Do),im=" ",am=!1;function rm(t,e){switch(t){case"keyup":return vy.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function sm(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var ms=!1;function xy(t,e){switch(t){case"compositionend":return sm(e);case"keypress":return e.which!==32?null:(am=!0,im);case"textInput":return t=e.data,t===im&&am?null:t;default:return null}}function yy(t,e){if(ms)return t==="compositionend"||!Wu&&rm(t,e)?(t=Qp(),Ll=Xu=ja=null,ms=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return nm&&e.locale!=="ko"?null:e.data;default:return null}}var Sy={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function om(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!Sy[t.type]:e==="textarea"}function lm(t,e,i,r){ds?ps?ps.push(r):ps=[r]:ds=r,e=Bc(e,"onChange"),0<e.length&&(i=new Pl("onChange","change",null,i,r),t.push({event:i,listeners:e}))}var Uo=null,No=null;function My(t){Zv(t,0)}function Bl(t){var e=xn(t);if(Xp(e))return t}function cm(t,e){if(t==="change")return e}var um=!1;if(ga){var Zu;if(ga){var Ku="oninput"in document;if(!Ku){var fm=document.createElement("div");fm.setAttribute("oninput","return;"),Ku=typeof fm.oninput=="function"}Zu=Ku}else Zu=!1;um=Zu&&(!document.documentMode||9<document.documentMode)}function hm(){Uo&&(Uo.detachEvent("onpropertychange",dm),No=Uo=null)}function dm(t){if(t.propertyName==="value"&&Bl(No)){var e=[];lm(e,No,t,Hu(t)),Kp(My,e)}}function Ey(t,e,i){t==="focusin"?(hm(),Uo=e,No=i,Uo.attachEvent("onpropertychange",dm)):t==="focusout"&&hm()}function Ty(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Bl(No)}function by(t,e){if(t==="click")return Bl(e)}function Ay(t,e){if(t==="input"||t==="change")return Bl(e)}function Ry(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var di=typeof Object.is=="function"?Object.is:Ry;function Lo(t,e){if(di(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var i=Object.keys(t),r=Object.keys(e);if(i.length!==r.length)return!1;for(r=0;r<i.length;r++){var l=i[r];if(!ue.call(e,l)||!di(t[l],e[l]))return!1}return!0}function Qu(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function pm(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function mm(t,e){var i=pm(t);t=0;for(var r;i;){if(i.nodeType===3){if(r=t+i.textContent.length,t<=e&&r>=e)return{node:i,offset:e-t};t=r}t:{for(;i;){if(i.nextSibling){i=i.nextSibling;break t}i=i.parentNode}i=void 0}i=pm(i)}}function gm(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?gm(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function vm(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Qu(t.document);e instanceof t.HTMLIFrameElement;){try{var i=typeof e.contentWindow.location.href=="string"}catch{i=!1}if(i)t=e.contentWindow;else break;e=Qu(t.document)}return e}function Ju(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var Cy=ga&&"documentMode"in document&&11>=document.documentMode,gs=null,$u=null,Oo=null,tf=!1;function _m(t,e,i){var r=i.window===i?i.document:i.nodeType===9?i:i.ownerDocument;tf||gs==null||gs!==Qu(r)||(r=gs,"selectionStart"in r&&Ju(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Oo&&Lo(Oo,r)||(Oo=r,r=Bc($u,"onSelect"),0<r.length&&(e=new Pl("onSelect","select",null,e,i),t.push({event:e,listeners:r}),e.target=gs)))}function Cr(t,e){var i={};return i[t.toLowerCase()]=e.toLowerCase(),i["Webkit"+t]="webkit"+e,i["Moz"+t]="moz"+e,i}var vs={animationend:Cr("Animation","AnimationEnd"),animationiteration:Cr("Animation","AnimationIteration"),animationstart:Cr("Animation","AnimationStart"),transitionrun:Cr("Transition","TransitionRun"),transitionstart:Cr("Transition","TransitionStart"),transitioncancel:Cr("Transition","TransitionCancel"),transitionend:Cr("Transition","TransitionEnd")},ef={},xm={};ga&&(xm=document.createElement("div").style,"AnimationEvent"in window||(delete vs.animationend.animation,delete vs.animationiteration.animation,delete vs.animationstart.animation),"TransitionEvent"in window||delete vs.transitionend.transition);function wr(t){if(ef[t])return ef[t];if(!vs[t])return t;var e=vs[t],i;for(i in e)if(e.hasOwnProperty(i)&&i in xm)return ef[t]=e[i];return t}var ym=wr("animationend"),Sm=wr("animationiteration"),Mm=wr("animationstart"),wy=wr("transitionrun"),Dy=wr("transitionstart"),Uy=wr("transitioncancel"),Em=wr("transitionend"),Tm=new Map,nf="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");nf.push("scrollEnd");function Ii(t,e){Tm.set(t,e),Dt(e,[t])}var Ny=0;function va(t,e){if(t.name!=null&&t.name!=="auto")return t.name;if(e.autoName!==null)return e.autoName;t=Gi.identifierPrefix;var i=Ny++;return t="_"+t+"t_"+i.toString(32)+"_",e.autoName=t}function bm(t){if(t==null||typeof t=="string")return t;var e=null,i=Is;if(i!==null)for(var r=0;r<i.length;r++){var l=t[i[r]];if(l!=null){if(l==="none")return"none";e=e==null?l:e+(" "+l)}}return e??t.default}function _a(t,e){return t=bm(t),e=bm(e),e==null?t==="auto"?null:t:e==="auto"?null:e}var Fl=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},Ti=[],_s=0,af=0;function Hl(){for(var t=_s,e=af=_s=0;e<t;){var i=Ti[e];Ti[e++]=null;var r=Ti[e];Ti[e++]=null;var l=Ti[e];Ti[e++]=null;var u=Ti[e];if(Ti[e++]=null,r!==null&&l!==null){var v=r.pending;v===null?l.next=l:(l.next=v.next,v.next=l),r.pending=l}u!==0&&Am(i,l,u)}}function Gl(t,e,i,r){Ti[_s++]=t,Ti[_s++]=e,Ti[_s++]=i,Ti[_s++]=r,af|=r,t.lanes|=r,t=t.alternate,t!==null&&(t.lanes|=r)}function rf(t,e,i,r){return Gl(t,e,i,r),Vl(t)}function Dr(t,e){return Gl(t,null,null,e),Vl(t)}function Am(t,e,i){t.lanes|=i;var r=t.alternate;r!==null&&(r.lanes|=i);for(var l=!1,u=t.return;u!==null;)u.childLanes|=i,r=u.alternate,r!==null&&(r.childLanes|=i),u.tag===22&&(t=u.stateNode,t===null||t._visibility&1||(l=!0)),t=u,u=u.return;return t.tag===3?(u=t.stateNode,l&&e!==null&&(l=31-fn(i),t=u.hiddenUpdates,r=t[l],r===null?t[l]=[e]:r.push(e),e.lane=i|536870912),u):null}function Vl(t){if(50<nl)throw nl=0,Uc=null,Error(s(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var xs={};function Ly(t,e,i,r){this.tag=t,this.key=i,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ii(t,e,i,r){return new Ly(t,e,i,r)}function sf(t){return t=t.prototype,!(!t||!t.isReactComponent)}function xa(t,e){var i=t.alternate;return i===null?(i=ii(t.tag,e,t.key,t.mode),i.elementType=t.elementType,i.type=t.type,i.stateNode=t.stateNode,i.alternate=t,t.alternate=i):(i.pendingProps=e,i.type=t.type,i.flags=0,i.subtreeFlags=0,i.deletions=null),i.flags=t.flags&1206910976,i.childLanes=t.childLanes,i.lanes=t.lanes,i.child=t.child,i.memoizedProps=t.memoizedProps,i.memoizedState=t.memoizedState,i.updateQueue=t.updateQueue,e=t.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},i.sibling=t.sibling,i.index=t.index,i.ref=t.ref,i.refCleanup=t.refCleanup,i}function Rm(t,e){t.flags&=1206910978;var i=t.alternate;return i===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=i.childLanes,t.lanes=i.lanes,t.child=i.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=i.memoizedProps,t.memoizedState=i.memoizedState,t.updateQueue=i.updateQueue,t.type=i.type,e=i.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Xl(t,e,i,r,l,u){var v=0;if(r=t,typeof r=="function")sf(r)&&(v=1);else if(typeof r=="string")v=oM(t,i,Se.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(r){case Vt:return t=ii(31,i,e,l),t.elementType=Vt,t.lanes=u,t;case B:return Ur(i.children,l,u,e);case at:v=8,l|=24;break;case ot:return t=ii(12,i,e,l|2),t.elementType=ot,t.lanes=u,t;case rt:return t=ii(13,i,e,l),t.elementType=rt,t.lanes=u,t;case Z:return t=ii(19,i,e,l),t.elementType=Z,t.lanes=u,t;case ce:case A:return t=l|32,t=ii(30,i,e,t),t.elementType=A,t.lanes=u,t.stateNode={autoName:null,paired:null,clones:null,ref:null},t;default:if(typeof r=="object"&&r!==null)switch(r.$$typeof){case gt:v=10;break t;case ht:v=9;break t;case X:v=11;break t;case St:v=14;break t;case bt:v=16,r=null;break t}v=29,i=Error(s(130,t===null?"null":typeof t,"")),r=null}return e=ii(v,i,e,l),e.elementType=t,e.type=r,e.lanes=u,e}function Ur(t,e,i,r){return t=ii(7,t,r,e),t.lanes=i,t}function of(t,e,i){return t=ii(6,t,null,e),t.lanes=i,t}function Cm(t){var e=ii(18,null,null,0);return e.stateNode=t,e}function lf(t,e,i){return e=ii(4,t.children!==null?t.children:[],t.key,e),e.lanes=i,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var wm=new WeakMap;function bi(t,e){if(typeof t=="object"&&t!==null){var i=wm.get(t);return i!==void 0?i:(e={value:t,source:e,stack:te(e)},wm.set(t,e),e)}return{value:t,source:e,stack:te(e)}}var ys=[],Ss=0,kl=null,zo=0,Ai=[],Ri=0,Ya=null,na=1,ia="";function ya(t,e){ys[Ss++]=zo,ys[Ss++]=kl,kl=t,zo=e}function Dm(t,e,i){Ai[Ri++]=na,Ai[Ri++]=ia,Ai[Ri++]=Ya,Ya=t;var r=na;t=ia;var l=32-fn(r)-1;r&=~(1<<l),i+=1;var u=32-fn(e)+l;if(30<u){var v=l-l%5;u=(r&(1<<v)-1).toString(32),r>>=v,l-=v,na=1<<32-fn(e)+l|i<<l|r,ia=u+t}else na=1<<u|i<<l|r,ia=t}function jl(t){t.return!==null&&(ya(t,1),Dm(t,1,0))}function cf(t){for(;t===kl;)kl=ys[--Ss],ys[Ss]=null,zo=ys[--Ss],ys[Ss]=null;for(;t===Ya;)Ya=Ai[--Ri],Ai[Ri]=null,ia=Ai[--Ri],Ai[Ri]=null,na=Ai[--Ri],Ai[Ri]=null}function Um(t,e){Ai[Ri++]=na,Ai[Ri++]=ia,Ai[Ri++]=Ya,na=e.id,ia=e.overflow,Ya=t}var On=null,on=null,Ce=!1,Wa=null,Ci=!1,uf=Error(s(519));function Za(t){var e=Error(s(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Po(bi(e,t)),uf}function Nm(t){var e=t.stateNode,i=t.type,r=t.memoizedProps;switch(e[ee]=t,e[Xt]=r,i){case"dialog":Oe("cancel",e),Oe("close",e);break;case"iframe":case"object":case"embed":Oe("load",e);break;case"video":case"audio":for(i=0;i<al.length;i++)Oe(al[i],e);break;case"source":Oe("error",e);break;case"img":case"image":case"link":Oe("error",e),Oe("load",e);break;case"details":Oe("toggle",e);break;case"input":Oe("invalid",e),kp(e,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case"select":Oe("invalid",e);break;case"textarea":Oe("invalid",e),qp(e,r.value,r.defaultValue,r.children)}i=r.children,typeof i!="string"&&typeof i!="number"&&typeof i!="bigint"||e.textContent===""+i||r.suppressHydrationWarning===!0||$v(e.textContent,i)?(r.popover!=null&&(Oe("beforetoggle",e),Oe("toggle",e)),r.onScroll!=null&&Oe("scroll",e),r.onScrollEnd!=null&&Oe("scrollend",e),r.onClick!=null&&(e.onclick=ea),e=!0):e=!1,e||Za(t,!0)}function ql(t){for(On=t.return;On;)switch(On.tag){case 5:case 31:case 13:Ci=!1;return;case 27:case 3:Ci=!0;return;default:On=On.return}}function Ms(t){if(t!==On)return!1;if(!Ce)return ql(t),Ce=!0,!1;var e=t.tag,i;if((i=e!==3&&e!==27)&&((i=e===5)&&(i=t.type,i=!(i!=="form"&&i!=="button")||Hh(t.type,t.memoizedProps)),i=!i),i&&on&&Za(t),ql(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(s(317));on=__(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(s(317));on=__(t)}else e===27?(e=on,fr(t.type)?(t=Zh,Zh=null,on=t):on=e):on=On?Di(t.stateNode.nextSibling):null;return!0}function Nr(){on=On=null,Ce=!1}function ff(){var t=Wa;return t!==null&&(si===null?si=t:si.push.apply(si,t),Wa=null),t}function Po(t){Wa===null?Wa=[t]:Wa.push(t)}var hf=le(null),Lr=null,Sa=null;function Ka(t,e,i){Ft(hf,e._currentValue),e._currentValue=i}function Ma(t){t._currentValue=hf.current,ae(hf)}function Yl(t,e,i){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===i)break;t=t.return}}function df(t,e,i,r){var l=t.child;for(l!==null&&(l.return=t);l!==null;){var u=l.dependencies;if(u!==null){var v=l.child;u=u.firstContext;t:for(;u!==null;){var E=u;u=l;for(var z=0;z<e.length;z++)if(E.context===e[z]){u.lanes|=i,E=u.alternate,E!==null&&(E.lanes|=i),Yl(u.return,i,t),r||(v=null);break t}u=E.next}}else if(l.tag===18){if(v=l.return,v===null)throw Error(s(341));v.lanes|=i,u=v.alternate,u!==null&&(u.lanes|=i),Yl(v,i,t),v=null}else l.tag===13&&l.memoizedState!==null&&l.memoizedState.dehydrated===null?(l.lanes|=i,v=l.alternate,v!==null&&(v.lanes|=i),Yl(l.return,i,t),v=l.child,v=v!==null?v.sibling:null):v=l.child;if(v!==null)v.return=l;else for(v=l;v!==null;){if(v===t){v=null;break}if(l=v.sibling,l!==null){l.return=v.return,v=l;break}v=v.return}l=v}}function Or(t,e,i,r){t=null;for(var l=e,u=!1;l!==null;){if(!u){if((l.flags&524288)!==0)u=!0;else if((l.flags&262144)!==0)break}if(l.tag===10){var v=l.alternate;if(v===null)throw Error(s(387));if(v=v.memoizedProps,v!==null){var E=l.type;di(l.pendingProps.value,v.value)||(t!==null?t.push(E):t=[E])}}else if(l===b.current){if(v=l.alternate,v===null)throw Error(s(387));v.memoizedState.memoizedState!==l.memoizedState.memoizedState&&(t!==null?t.push(Ys):t=[Ys])}l=l.return}return t!==null&&df(e,t,i,r),e.flags|=262144,t!==null}function Wl(t){for(t=t.firstContext;t!==null;){if(!di(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function zr(t){Lr=t,Sa=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Bn(t){return Lm(Lr,t)}function Zl(t,e){return Lr===null&&zr(t),Lm(t,e)}function Lm(t,e){var i=e._currentValue;if(e={context:e,memoizedValue:i,next:null},Sa===null){if(t===null)throw Error(s(308));Sa=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Sa=Sa.next=e;return i}var Oy=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(i,r){t.push(r)}};this.abort=function(){e.aborted=!0,t.forEach(function(i){return i()})}},zy=o.unstable_scheduleCallback,Py=o.unstable_NormalPriority,Tn={$$typeof:gt,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function pf(){return{controller:new Oy,data:new Map,refCount:0}}function Io(t){t.refCount--,t.refCount===0&&zy(Py,function(){t.controller.abort()})}function Om(t,e){if((t.pendingLanes&4194048)!==0){var i=t.transitionTypes;for(i===null&&(i=t.transitionTypes=[]),t=0;t<e.length;t++){var r=e[t];i.indexOf(r)===-1&&i.push(r)}}}var Bo=null;function Iy(t){var e=t.transitionTypes;return t.transitionTypes=null,e}var Fo=null,mf=0,Pr=0,Es=null;function By(t,e){if(Fo===null){var i=Fo=[];mf=0,Pr=Uh(),Es={status:"pending",value:void 0,then:function(r){i.push(r)}}}return mf++,e.then(zm,zm),e}function zm(){if(--mf===0&&(Bo=null,Fo!==null)){Es!==null&&(Es.status="fulfilled");var t=Fo;Fo=null,Pr=0,Es=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function Fy(t,e){var i=[],r={status:"pending",value:null,reason:null,then:function(l){i.push(l)}};return t.then(function(){r.status="fulfilled",r.value=e;for(var l=0;l<i.length;l++)(0,i[l])(e)},function(l){for(r.status="rejected",r.reason=l,l=0;l<i.length;l++)(0,i[l])(void 0)}),r}var Pm=Ct.S;Ct.S=function(t,e){if(Cv=F(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&By(t,e),Bo!==null)for(var i=Gs;i!==null;)Om(i,Bo),i=i.next;if(i=t.types,i!==null){for(var r=Gs;r!==null;)Om(r,i),r=r.next;if(Pr!==0){r=Bo,r===null&&(r=Bo=[]);for(var l=0;l<i.length;l++){var u=i[l];r.indexOf(u)===-1&&r.push(u)}}}Pm!==null&&Pm(t,e)};var Ir=le(null);function gf(){var t=Ir.current;return t!==null?t:nn.pooledCache}function Kl(t,e){e===null?Ft(Ir,Ir.current):Ft(Ir,e.pool)}function Im(){var t=gf();return t===null?null:{parent:Tn._currentValue,pool:t}}var Ts=Error(s(460)),vf=Error(s(474)),Ql=Error(s(542)),Jl={then:function(){}};function Bm(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Fm(t,e,i){switch(i=t[i],i===void 0?t.push(e):i!==e&&(e.then(ea,ea),e=i),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,Gm(t),t===void 0&&!("reason"in e)?Error(s(600)):t;default:if(typeof e.status=="string")e.then(ea,ea);else{if(t=nn,t!==null&&100<t.shellSuspendCounter)throw Error(s(482));t=e,t.status="pending",t.then(function(r){if(e.status==="pending"){var l=e;l.status="fulfilled",l.value=r}},function(r){if(e.status==="pending"){var l=e;l.status="rejected",l.reason=r}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,Gm(t),t}throw Fr=e,Ts}}function Br(t){try{var e=t._init;return e(t._payload)}catch(i){throw i!==null&&typeof i=="object"&&typeof i.then=="function"?(Fr=i,Ts):i}}var Fr=null;function Hm(){if(Fr===null)throw Error(s(459));var t=Fr;return Fr=null,t}function Gm(t){if(t===Ts||t===Ql)throw Error(s(483))}var bs=null,Ho=0;function $l(t){var e=Ho;return Ho+=1,bs===null&&(bs=[]),Fm(bs,t,e)}function Qa(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function tc(t,e){throw e.$$typeof===q?Error(s(525)):(t=Object.prototype.toString.call(e),Error(s(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Vm(t){function e(K,G){if(t){var tt=K.deletions;tt===null?(K.deletions=[G],K.flags|=16):tt.push(G)}}function i(K,G){if(!t)return null;for(;G!==null;)e(K,G),G=G.sibling;return null}function r(K){for(var G=new Map;K!==null;)K.key===null?G.set(K.index,K):G.set(K.key,K),K=K.sibling;return G}function l(K,G){return K=xa(K,G),K.index=0,K.sibling=null,K}function u(K,G,tt){return K.index=tt,t?(tt=K.alternate,tt!==null?(tt=tt.index,tt<G?(K.flags|=2,G):tt):(K.flags|=134217730,G)):(K.flags|=1048576,G)}function v(K){return t&&K.alternate===null&&(K.flags|=134217730),K}function E(K,G,tt,yt){return G===null||G.tag!==6?(G=of(tt,K.mode,yt),G.return=K,G):(G=l(G,tt),G.return=K,G)}function z(K,G,tt,yt){var Wt=tt.type;return Wt===B?(K=st(K,G,tt.props.children,yt,tt.key),Qa(K,tt),K):G!==null&&(G.elementType===Wt||typeof Wt=="object"&&Wt!==null&&Wt.$$typeof===bt&&Br(Wt)===G.type)?(G=l(G,tt.props),Qa(G,tt),G.return=K,G):(G=Xl(tt.type,tt.key,tt.props,null,K.mode,yt),Qa(G,tt),G.return=K,G)}function J(K,G,tt,yt){return G===null||G.tag!==4||G.stateNode.containerInfo!==tt.containerInfo||G.stateNode.implementation!==tt.implementation?(G=lf(tt,K.mode,yt),G.return=K,G):(G=l(G,tt.children||[]),G.return=K,G)}function st(K,G,tt,yt,Wt){return G===null||G.tag!==7?(G=Ur(tt,K.mode,yt,Wt),G.return=K,G):(G=l(G,tt),G.return=K,G)}function Mt(K,G,tt){if(typeof G=="string"&&G!==""||typeof G=="number"||typeof G=="bigint")return G=of(""+G,K.mode,tt),G.return=K,G;if(typeof G=="object"&&G!==null){switch(G.$$typeof){case U:return tt=Xl(G.type,G.key,G.props,null,K.mode,tt),Qa(tt,G),tt.return=K,tt;case C:return G=lf(G,K.mode,tt),G.return=K,G;case bt:return G=Br(G),Mt(K,G,tt)}if(At(G)||W(G))return G=Ur(G,K.mode,tt,null),G.return=K,G;if(typeof G.then=="function")return Mt(K,$l(G),tt);if(G.$$typeof===gt)return Mt(K,Zl(K,G),tt);tc(K,G)}return null}function Y(K,G,tt,yt){var Wt=G!==null?G.key:null;if(typeof tt=="string"&&tt!==""||typeof tt=="number"||typeof tt=="bigint")return Wt!==null?null:E(K,G,""+tt,yt);if(typeof tt=="object"&&tt!==null){switch(tt.$$typeof){case U:return tt.key===Wt?z(K,G,tt,yt):null;case C:return tt.key===Wt?J(K,G,tt,yt):null;case bt:return tt=Br(tt),Y(K,G,tt,yt)}if(At(tt)||W(tt))return Wt!==null?null:st(K,G,tt,yt,null);if(typeof tt.then=="function")return Y(K,G,$l(tt),yt);if(tt.$$typeof===gt)return Y(K,G,Zl(K,tt),yt);tc(K,tt)}return null}function nt(K,G,tt,yt,Wt){if(typeof yt=="string"&&yt!==""||typeof yt=="number"||typeof yt=="bigint")return K=K.get(tt)||null,E(G,K,""+yt,Wt);if(typeof yt=="object"&&yt!==null){switch(yt.$$typeof){case U:return K=K.get(yt.key===null?tt:yt.key)||null,z(G,K,yt,Wt);case C:return K=K.get(yt.key===null?tt:yt.key)||null,J(G,K,yt,Wt);case bt:return yt=Br(yt),nt(K,G,tt,yt,Wt)}if(At(yt)||W(yt))return K=K.get(tt)||null,st(G,K,yt,Wt,null);if(typeof yt.then=="function")return nt(K,G,tt,$l(yt),Wt);if(yt.$$typeof===gt)return nt(K,G,tt,Zl(G,yt),Wt);tc(G,yt)}return null}function Bt(K,G,tt,yt){for(var Wt=null,Be=null,se=G,pe=G=0,Rn=null;se!==null&&pe<tt.length;pe++){se.index>pe?(Rn=se,se=null):Rn=se.sibling;var Ge=Y(K,se,tt[pe],yt);if(Ge===null){se===null&&(se=Rn);break}t&&se&&Ge.alternate===null&&e(K,se),G=u(Ge,G,pe),Be===null?Wt=Ge:Be.sibling=Ge,Be=Ge,se=Rn}if(pe===tt.length)return i(K,se),Ce&&ya(K,pe),Wt;if(se===null){for(;pe<tt.length;pe++)se=Mt(K,tt[pe],yt),se!==null&&(G=u(se,G,pe),Be===null?Wt=se:Be.sibling=se,Be=se);return Ce&&ya(K,pe),Wt}for(se=r(se);pe<tt.length;pe++)Rn=nt(se,K,pe,tt[pe],yt),Rn!==null&&(t&&(Ge=Rn.alternate,Ge!==null&&se.delete(Ge.key===null?pe:Ge.key)),G=u(Rn,G,pe),Be===null?Wt=Rn:Be.sibling=Rn,Be=Rn);return t&&se.forEach(function(gr){return e(K,gr)}),Ce&&ya(K,pe),Wt}function $t(K,G,tt,yt){if(tt==null)throw Error(s(151));for(var Wt=null,Be=null,se=G,pe=G=0,Rn=null,Ge=tt.next();se!==null&&!Ge.done;pe++,Ge=tt.next()){se.index>pe?(Rn=se,se=null):Rn=se.sibling;var gr=Y(K,se,Ge.value,yt);if(gr===null){se===null&&(se=Rn);break}t&&se&&gr.alternate===null&&e(K,se),G=u(gr,G,pe),Be===null?Wt=gr:Be.sibling=gr,Be=gr,se=Rn}if(Ge.done)return i(K,se),Ce&&ya(K,pe),Wt;if(se===null){for(;!Ge.done;pe++,Ge=tt.next())Ge=Mt(K,Ge.value,yt),Ge!==null&&(G=u(Ge,G,pe),Be===null?Wt=Ge:Be.sibling=Ge,Be=Ge);return Ce&&ya(K,pe),Wt}for(se=r(se);!Ge.done;pe++,Ge=tt.next())Ge=nt(se,K,pe,Ge.value,yt),Ge!==null&&(t&&(Rn=Ge.alternate,Rn!==null&&se.delete(Rn.key===null?pe:Rn.key)),G=u(Ge,G,pe),Be===null?Wt=Ge:Be.sibling=Ge,Be=Ge);return t&&se.forEach(function(xM){return e(K,xM)}),Ce&&ya(K,pe),Wt}function Ee(K,G,tt,yt){if(typeof tt=="object"&&tt!==null&&tt.type===B&&tt.key===null&&tt.props.ref===void 0&&(tt=tt.props.children),typeof tt=="object"&&tt!==null){switch(tt.$$typeof){case U:t:{for(var Wt=tt.key;G!==null;){if(G.key===Wt){if(Wt=tt.type,Wt===B){if(G.tag===7){i(K,G.sibling),yt=l(G,tt.props.children),Qa(yt,tt),yt.return=K,K=yt;break t}}else if(G.elementType===Wt||typeof Wt=="object"&&Wt!==null&&Wt.$$typeof===bt&&Br(Wt)===G.type){i(K,G.sibling),yt=l(G,tt.props),Qa(yt,tt),yt.return=K,K=yt;break t}i(K,G);break}else e(K,G);G=G.sibling}tt.type===B?(yt=Ur(tt.props.children,K.mode,yt,tt.key),Qa(yt,tt),yt.return=K,K=yt):(yt=Xl(tt.type,tt.key,tt.props,null,K.mode,yt),Qa(yt,tt),yt.return=K,K=yt)}return v(K);case C:t:{for(Wt=tt.key;G!==null;){if(G.key===Wt)if(G.tag===4&&G.stateNode.containerInfo===tt.containerInfo&&G.stateNode.implementation===tt.implementation){i(K,G.sibling),yt=l(G,tt.children||[]),yt.return=K,K=yt;break t}else{i(K,G);break}else e(K,G);G=G.sibling}yt=lf(tt,K.mode,yt),yt.return=K,K=yt}return v(K);case bt:return tt=Br(tt),Ee(K,G,tt,yt)}if(At(tt))return Bt(K,G,tt,yt);if(W(tt)){if(Wt=W(tt),typeof Wt!="function")throw Error(s(150));return tt=Wt.call(tt),$t(K,G,tt,yt)}if(typeof tt.then=="function")return Ee(K,G,$l(tt),yt);if(tt.$$typeof===gt)return Ee(K,G,Zl(K,tt),yt);tc(K,tt)}return typeof tt=="string"&&tt!==""||typeof tt=="number"||typeof tt=="bigint"?(tt=""+tt,G!==null&&G.tag===6?(i(K,G.sibling),yt=l(G,tt),yt.return=K,K=yt):(i(K,G),yt=of(tt,K.mode,yt),yt.return=K,K=yt),v(K)):i(K,G)}return function(K,G,tt,yt){try{Ho=0;var Wt=Ee(K,G,tt,yt);return bs=null,Wt}catch(se){if(se===Ts||se===Ql)throw se;var Be=ii(29,se,null,K.mode);return Be.lanes=yt,Be.return=K,Be}}}var Hr=Vm(!0),Xm=Vm(!1),Ja=!1;function _f(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function xf(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function $a(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function tr(t,e,i){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,(qe&2)!==0){var l=r.pending;return l===null?e.next=e:(e.next=l.next,l.next=e),r.pending=e,e=Vl(t),Am(t,null,i),e}return Gl(t,r,e,i),Vl(t)}function Go(t,e,i){if(e=e.updateQueue,e!==null&&(e=e.shared,(i&4194048)!==0)){var r=e.lanes;r&=t.pendingLanes,i|=r,e.lanes=i,ct(t,i)}}function yf(t,e){var i=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,i===r)){var l=null,u=null;if(i=i.firstBaseUpdate,i!==null){do{var v={lane:i.lane,tag:i.tag,payload:i.payload,callback:null,next:null};u===null?l=u=v:u=u.next=v,i=i.next}while(i!==null);u===null?l=u=e:u=u.next=e}else l=u=e;i={baseState:r.baseState,firstBaseUpdate:l,lastBaseUpdate:u,shared:r.shared,callbacks:r.callbacks},t.updateQueue=i;return}t=i.lastBaseUpdate,t===null?i.firstBaseUpdate=e:t.next=e,i.lastBaseUpdate=e}var Sf=!1;function Vo(){if(Sf){var t=Es;if(t!==null)throw t}}function Xo(t,e,i,r){Sf=!1;var l=t.updateQueue;Ja=!1;var u=l.firstBaseUpdate,v=l.lastBaseUpdate,E=l.shared.pending;if(E!==null){l.shared.pending=null;var z=E,J=z.next;z.next=null,v===null?u=J:v.next=J,v=z;var st=t.alternate;st!==null&&(st=st.updateQueue,E=st.lastBaseUpdate,E!==v&&(E===null?st.firstBaseUpdate=J:E.next=J,st.lastBaseUpdate=z))}if(u!==null){var Mt=l.baseState;v=0,st=J=z=null,E=u;do{var Y=E.lane&-536870913,nt=Y!==E.lane;if(nt?(Ie&Y)===Y:(r&Y)===Y){Y!==0&&Y===Pr&&(Sf=!0),st!==null&&(st=st.next={lane:0,tag:E.tag,payload:E.payload,callback:null,next:null});t:{var Bt=t,$t=E;Y=e;var Ee=i;switch($t.tag){case 1:if(Bt=$t.payload,typeof Bt=="function"){Mt=Bt.call(Ee,Mt,Y);break t}Mt=Bt;break t;case 3:Bt.flags=Bt.flags&-65537|128;case 0:if(Bt=$t.payload,Y=typeof Bt=="function"?Bt.call(Ee,Mt,Y):Bt,Y==null)break t;Mt=I({},Mt,Y);break t;case 2:Ja=!0}}Y=E.callback,Y!==null&&(t.flags|=64,nt&&(t.flags|=8192),nt=l.callbacks,nt===null?l.callbacks=[Y]:nt.push(Y))}else nt={lane:Y,tag:E.tag,payload:E.payload,callback:E.callback,next:null},st===null?(J=st=nt,z=Mt):st=st.next=nt,v|=Y;if(E=E.next,E===null){if(E=l.shared.pending,E===null)break;nt=E,E=nt.next,nt.next=null,l.lastBaseUpdate=nt,l.shared.pending=null}}while(!0);st===null&&(z=Mt),l.baseState=z,l.firstBaseUpdate=J,l.lastBaseUpdate=st,u===null&&(l.shared.lanes=0),or|=v,t.lanes=v,t.memoizedState=Mt}}function km(t,e){if(typeof t!="function")throw Error(s(191,t));t.call(e)}function jm(t,e){var i=t.callbacks;if(i!==null)for(t.callbacks=null,t=0;t<i.length;t++)km(i[t],e)}var er=le(null),ec=le(0);function qm(t,e){t=Ra,Ft(ec,t),Ft(er,e),Ra=t|e.baseLanes}function Mf(){Ft(ec,Ra),Ft(er,er.current)}function Ef(){Ra=ec.current,ae(er),ae(ec)}var Fn=le(null),jn=null;function nr(t){var e=t.alternate;Ft(Hn,Hn.current&1),Ft(Fn,t),jn===null&&(e===null||er.current!==null||e.memoizedState!==null)&&(jn=t)}function Tf(t){Ft(Hn,Hn.current),Ft(Fn,t),jn===null&&(jn=t)}function Ym(t){t.tag===22?(Ft(Hn,Hn.current),Ft(Fn,t),jn===null&&(jn=t)):ir()}function ir(){Ft(Hn,Hn.current),Ft(Fn,Fn.current)}function pi(t){ae(Fn),jn===t&&(jn=null),ae(Hn)}var Hn=le(0);function ko(t,e){Ft(Fn,Fn.current),Ft(Hn,e)}function bf(t){ae(Hn),ae(Fn),jn===t&&(jn=null)}function nc(t){for(var e=t;e!==null;){if(e.tag===13){var i=e.memoizedState;if(i!==null&&(i=i.dehydrated,i===null||Yh(i)||Wh(i)))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!=="independent"){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Ea=0,Me=null,tn=null,bn=null,ic=!1,As=!1,Gr=!1,ac=0,jo=0,Rs=null,Hy=0;function gn(){throw Error(s(321))}function Af(t,e){if(e===null)return!1;for(var i=0;i<e.length&&i<t.length;i++)if(!di(t[i],e[i]))return!1;return!0}function Rf(t,e,i,r,l,u){return Ea=u,Me=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Ct.H=t===null||t.memoizedState===null?Dg:Ug,Gr=!1,u=i(r,l),Gr=!1,As&&(u=Zm(e,i,r,l)),Wm(t),u}function Wm(t){Ct.H=fc;var e=tn!==null&&tn.next!==null;if(Ea=0,bn=tn=Me=null,ic=!1,jo=0,Rs=null,e)throw Error(s(300));t===null||An||(t=t.dependencies,t!==null&&Wl(t)&&(An=!0))}function Zm(t,e,i,r){Me=t;var l=0;do{if(As&&(Rs=null),jo=0,As=!1,25<=l)throw Error(s(301));if(l+=1,bn=tn=null,t.updateQueue!=null){var u=t.updateQueue;u.lastEffect=null,u.events=null,u.stores=null,u.memoCache!=null&&(u.memoCache.index=0)}Ct.H=Wy,u=e(i,r)}while(As);return u}function Gy(){var t=Ct.H,e=t.useState()[0];return e=typeof e.then=="function"?qo(e):e,t=t.useState()[0],(tn!==null?tn.memoizedState:null)!==t&&(Me.flags|=1024),e}function Cf(){var t=ac!==0;return ac=0,t}function wf(t,e,i){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i}function Df(t){if(ic){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}ic=!1}Ea=0,bn=tn=Me=null,As=!1,jo=ac=0,Rs=null}function Kn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return bn===null?Me.memoizedState=bn=t:bn=bn.next=t,bn}function yn(){if(tn===null){var t=Me.alternate;t=t!==null?t.memoizedState:null}else t=tn.next;var e=bn===null?Me.memoizedState:bn.next;if(e!==null)bn=e,tn=t;else{if(t===null)throw Me.alternate===null?Error(s(467)):Error(s(310));tn=t,t={memoizedState:tn.memoizedState,baseState:tn.baseState,baseQueue:tn.baseQueue,queue:tn.queue,next:null},bn===null?Me.memoizedState=bn=t:bn=bn.next=t}return bn}function rc(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function qo(t){var e=jo;return jo+=1,Rs===null&&(Rs=[]),t=Fm(Rs,t,e),e=Me,(bn===null?e.memoizedState:bn.next)===null&&(e=e.alternate,Ct.H=e===null||e.memoizedState===null?Dg:Ug),t}function sc(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return qo(t);if(t.$$typeof===k)return;if(t.$$typeof===gt)return Bn(t)}throw Error(s(438,String(t)))}function Uf(t){var e=null,i=Me.updateQueue;if(i!==null&&(e=i.memoCache),e==null){var r=Me.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(e={data:r.data.map(function(l){return l.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),i===null&&(i=rc(),Me.updateQueue=i),i.memoCache=e,i=e.data[e.index],i===void 0)for(i=e.data[e.index]=Array(t),r=0;r<t;r++)i[r]=pt;return e.index++,i}function Ta(t,e){return typeof e=="function"?e(t):e}function oc(t){var e=yn();return Nf(e,tn,t)}function Nf(t,e,i){var r=t.queue;if(r===null)throw Error(s(311));r.lastRenderedReducer=i;var l=t.baseQueue,u=r.pending;if(u!==null){if(l!==null){var v=l.next;l.next=u.next,u.next=v}e.baseQueue=l=u,r.pending=null}if(u=t.baseState,l===null)t.memoizedState=u;else{e=l.next;var E=v=null,z=null,J=e,st=!1;do{var Mt=J.lane&-536870913;if(Mt!==J.lane?(Ie&Mt)===Mt:(Ea&Mt)===Mt){var Y=J.revertLane;if(Y===0)z!==null&&(z=z.next={lane:0,revertLane:0,gesture:null,action:J.action,hasEagerState:J.hasEagerState,eagerState:J.eagerState,next:null}),Mt===Pr&&(st=!0);else if((Ea&Y)===Y){J=J.next,Y===Pr&&(st=!0);continue}else Mt={lane:0,revertLane:J.revertLane,gesture:null,action:J.action,hasEagerState:J.hasEagerState,eagerState:J.eagerState,next:null},z===null?(E=z=Mt,v=u):z=z.next=Mt,Me.lanes|=Y,or|=Y;Mt=J.action,Gr&&i(u,Mt),u=J.hasEagerState?J.eagerState:i(u,Mt)}else Y={lane:Mt,revertLane:J.revertLane,gesture:J.gesture,action:J.action,hasEagerState:J.hasEagerState,eagerState:J.eagerState,next:null},z===null?(E=z=Y,v=u):z=z.next=Y,Me.lanes|=Mt,or|=Mt;J=J.next}while(J!==null&&J!==e);if(z===null?v=u:z.next=E,!di(u,t.memoizedState)&&(An=!0,st&&(i=Es,i!==null)))throw i;t.memoizedState=u,t.baseState=v,t.baseQueue=z,r.lastRenderedState=u}return l===null&&(r.lanes=0),[t.memoizedState,r.dispatch]}function Lf(t){var e=yn(),i=e.queue;if(i===null)throw Error(s(311));i.lastRenderedReducer=t;var r=i.dispatch,l=i.pending,u=e.memoizedState;if(l!==null){i.pending=null;var v=l=l.next;do u=t(u,v.action),v=v.next;while(v!==l);di(u,e.memoizedState)||(An=!0),e.memoizedState=u,e.baseQueue===null&&(e.baseState=u),i.lastRenderedState=u}return[u,r]}function Km(t,e,i){var r=Me,l=yn(),u=Ce;if(u){if(i===void 0)throw Error(s(407));i=i()}else i=e();var v=!di((tn||l).memoizedState,i);if(v&&(l.memoizedState=i,An=!0),l=l.queue,Pf($m.bind(null,r,l,t),[t]),t=l.getSnapshot!==e||v||bn!==null&&(bn.memoizedState.tag&1)!==0,Cs(t?9:8,{destroy:void 0},Jm.bind(null,r,l,i,e),null),t){if(r.flags|=2048,nn===null)throw Error(s(349));u||(Ea&127)!==0||Qm(r,e,i)}return i}function Qm(t,e,i){t.flags|=16384,t={getSnapshot:e,value:i},e=Me.updateQueue,e===null?(e=rc(),Me.updateQueue=e,e.stores=[t]):(i=e.stores,i===null?e.stores=[t]:i.push(t))}function Jm(t,e,i,r){e.value=i,e.getSnapshot=r,tg(e)&&eg(t)}function $m(t,e,i){return i(function(){tg(e)&&eg(t)})}function tg(t){var e=t.getSnapshot;t=t.value;try{var i=e();return!di(t,i)}catch{return!0}}function eg(t){var e=Dr(t,2);e!==null&&oi(e,t,2)}function Of(t){var e=Kn();if(typeof t=="function"){var i=t;if(t=i(),Gr){rn(!0);try{i()}finally{rn(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ta,lastRenderedState:t},e}function ng(t,e,i,r){return t.baseState=i,Nf(t,tn,typeof r=="function"?r:Ta)}function Vy(t,e,i,r,l){if(uc(t))throw Error(s(485));if(t=e.action,t!==null){var u={payload:l,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(v){u.listeners.push(v)}};Ct.T!==null?i(!0):u.isTransition=!1,r(u),i=e.pending,i===null?(u.next=e.pending=u,ig(e,u)):(u.next=i.next,e.pending=i.next=u)}}function ig(t,e){var i=e.action,r=e.payload,l=t.state;if(e.isTransition){var u=Ct.T,v={};v.types=u!==null?u.types:null,Ct.T=v;try{var E=i(l,r),z=Ct.S;z!==null&&z(v,E),ag(t,e,E)}catch(J){zf(t,e,J)}finally{u!==null&&v.types!==null&&(u.types=v.types),Ct.T=u}}else try{u=i(l,r),ag(t,e,u)}catch(J){zf(t,e,J)}}function ag(t,e,i){i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(function(r){rg(t,e,r)},function(r){return zf(t,e,r)}):rg(t,e,i)}function rg(t,e,i){e.status="fulfilled",e.value=i,sg(e),t.state=i,e=t.pending,e!==null&&(i=e.next,i===e?t.pending=null:(i=i.next,e.next=i,ig(t,i)))}function zf(t,e,i){var r=t.pending;if(t.pending=null,r!==null){r=r.next;do e.status="rejected",e.reason=i,sg(e),e=e.next;while(e!==r)}t.action=null}function sg(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function og(t,e){return e}function lg(t,e){if(Ce){var i=nn.formState;if(i!==null){t:{var r=Me;if(Ce){if(on){e:{for(var l=on,u=Ci;l.nodeType!==8;){if(!u){l=null;break e}if(l=Di(l.nextSibling),l===null){l=null;break e}}u=l.data,l=u==="F!"||u==="F"?l:null}if(l){on=Di(l.nextSibling),r=l.data==="F!";break t}}Za(r)}r=!1}r&&(e=i[0])}}return i=Kn(),i.memoizedState=i.baseState=e,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:og,lastRenderedState:e},i.queue=r,i=Rg.bind(null,Me,r),r.dispatch=i,r=Of(!1),u=Gf.bind(null,Me,!1,r.queue),r=Kn(),l={state:e,dispatch:null,action:t,pending:null},r.queue=l,i=Vy.bind(null,Me,l,u,i),l.dispatch=i,r.memoizedState=t,[e,i,!1]}function cg(t){var e=yn();return ug(e,tn,t)}function ug(t,e,i){if(e=Nf(t,e,og)[0],t=oc(Ta)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var r=qo(e)}catch(v){throw v===Ts?Ql:v}else r=e;e=yn();var l=e.queue,u=l.dispatch;return i!==e.memoizedState&&(Me.flags|=2048,Cs(9,{destroy:void 0},Xy.bind(null,l,i),null)),[r,u,t]}function Xy(t,e){t.action=e}function fg(t){var e=yn(),i=tn;if(i!==null)return ug(e,i,t);yn(),e=e.memoizedState,i=yn();var r=i.queue.dispatch;return i.memoizedState=t,[e,r,!1]}function Cs(t,e,i,r){return t={tag:t,create:i,deps:r,inst:e,next:null},e=Me.updateQueue,e===null&&(e=rc(),Me.updateQueue=e),i=e.lastEffect,i===null?e.lastEffect=t.next=t:(r=i.next,i.next=t,t.next=r,e.lastEffect=t),t}function hg(){return yn().memoizedState}function lc(t,e,i,r){var l=Kn();Me.flags|=t,l.memoizedState=Cs(1|e,{destroy:void 0},i,r===void 0?null:r)}function cc(t,e,i,r){var l=yn();r=r===void 0?null:r;var u=l.memoizedState.inst;tn!==null&&r!==null&&Af(r,tn.memoizedState.deps)?l.memoizedState=Cs(e,u,i,r):(Me.flags|=t,l.memoizedState=Cs(1|e,u,i,r))}function dg(t,e){lc(8390656,8,t,e)}function Pf(t,e){cc(2048,8,t,e)}function ky(t){Me.flags|=4;var e=Me.updateQueue;if(e===null)e=rc(),Me.updateQueue=e,e.events=[t];else{var i=e.events;i===null?e.events=[t]:i.push(t)}}function pg(t){var e=yn().memoizedState;return ky({ref:e,nextImpl:t}),function(){if((qe&2)!==0)throw Error(s(440));return e.impl.apply(void 0,arguments)}}function mg(t,e){return cc(4,2,t,e)}function gg(t,e){return cc(4,4,t,e)}function vg(t,e){if(typeof e=="function"){t=t();var i=e(t);return function(){typeof i=="function"?i():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function _g(t,e,i){i=i!=null?i.concat([t]):null,cc(4,4,vg.bind(null,e,t),i)}function If(){}function xg(t,e){var i=yn();e=e===void 0?null:e;var r=i.memoizedState;return e!==null&&Af(e,r[1])?r[0]:(i.memoizedState=[t,e],t)}function yg(t,e){var i=yn();e=e===void 0?null:e;var r=i.memoizedState;if(e!==null&&Af(e,r[1]))return r[0];if(r=t(),Gr){rn(!0);try{t()}finally{rn(!1)}}return i.memoizedState=[r,e],r}function Bf(t,e,i){return i===void 0||(Ea&1073741824)!==0&&(Ie&261930)===0?t.memoizedState=e:(t.memoizedState=i,t=Dv(),Me.lanes|=t,or|=t,i)}function Sg(t,e,i,r){return di(i,e)?i:er.current!==null?(t=Bf(t,i,r),di(t,e)||(An=!0),t):(Ea&106)===0||(Ea&1073741824)!==0&&(Ie&261930)===0?(An=!0,t.memoizedState=i):(t=Dv(),Me.lanes|=t,or|=t,e)}function Mg(t,e,i,r,l){var u=Ut.p;Ut.p=u!==0&&8>u?u:8;var v=Ct.T,E={};E.types=v!==null?v.types:null,Ct.T=E,Gf(t,!1,e,i);try{var z=l(),J=Ct.S;if(J!==null&&J(E,z),z!==null&&typeof z=="object"&&typeof z.then=="function"){var st=Fy(z,r);Yo(t,e,st,_i(t))}else Yo(t,e,r,_i(t))}catch(Mt){Yo(t,e,{then:function(){},status:"rejected",reason:Mt},_i())}finally{Ut.p=u,v!==null&&E.types!==null&&(v.types=E.types),Ct.T=v}}function jy(){}function Ff(t,e,i,r){if(t.tag!==5)throw Error(s(476));var l=Eg(t).queue;Mg(t,l,e,re,i===null?jy:function(){return Tg(t),i(r)})}function Eg(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:re,baseState:re,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ta,lastRenderedState:re},next:null};var i={};return e.next={memoizedState:i,baseState:i,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ta,lastRenderedState:i},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Tg(t){var e=Eg(t);e.next===null&&(e=t.alternate.memoizedState),Yo(t,e.next.queue,{},_i())}function Hf(){return Bn(Ys)}function bg(){return yn().memoizedState}function Ag(){return yn().memoizedState}function qy(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var i=_i();t=$a(i);var r=tr(e,t,i);r!==null&&(oi(r,e,i),Go(r,e,i)),e={cache:pf()},t.payload=e;return}e=e.return}}function Yy(t,e,i){var r=_i();i={lane:r,revertLane:0,gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},uc(t)?Cg(e,i):(i=rf(t,e,i,r),i!==null&&(oi(i,t,r),wg(i,e,r)))}function Rg(t,e,i){var r=_i();Yo(t,e,i,r)}function Yo(t,e,i,r){var l={lane:r,revertLane:0,gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null};if(uc(t))Cg(e,l);else{var u=t.alternate;if(t.lanes===0&&(u===null||u.lanes===0)&&(u=e.lastRenderedReducer,u!==null))try{var v=e.lastRenderedState,E=u(v,i);if(l.hasEagerState=!0,l.eagerState=E,di(E,v))return Gl(t,e,l,0),nn===null&&Hl(),!1}catch{}if(i=rf(t,e,l,r),i!==null)return oi(i,t,r),wg(i,e,r),!0}return!1}function Gf(t,e,i,r){if(r={lane:2,revertLane:Uh(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},uc(t)){if(e)throw Error(s(479))}else e=rf(t,i,r,2),e!==null&&oi(e,t,2)}function uc(t){var e=t.alternate;return t===Me||e!==null&&e===Me}function Cg(t,e){As=ic=!0;var i=t.pending;i===null?e.next=e:(e.next=i.next,i.next=e),t.pending=e}function wg(t,e,i){if((i&4194048)!==0){var r=e.lanes;r&=t.pendingLanes,i|=r,e.lanes=i,ct(t,i)}}var fc={readContext:Bn,use:sc,useCallback:gn,useContext:gn,useEffect:gn,useImperativeHandle:gn,useLayoutEffect:gn,useInsertionEffect:gn,useMemo:gn,useReducer:gn,useRef:gn,useState:gn,useDebugValue:gn,useDeferredValue:gn,useTransition:gn,useSyncExternalStore:gn,useId:gn,useHostTransitionStatus:gn,useFormState:gn,useActionState:gn,useOptimistic:gn,useMemoCache:gn,useCacheRefresh:gn,useEffectEvent:gn},Dg={readContext:Bn,use:sc,useCallback:function(t,e){return Kn().memoizedState=[t,e===void 0?null:e],t},useContext:Bn,useEffect:dg,useImperativeHandle:function(t,e,i){i=i!=null?i.concat([t]):null,lc(4194308,4,vg.bind(null,e,t),i)},useLayoutEffect:function(t,e){return lc(4194308,4,t,e)},useInsertionEffect:function(t,e){lc(4,2,t,e)},useMemo:function(t,e){var i=Kn();e=e===void 0?null:e;var r=t();if(Gr){rn(!0);try{t()}finally{rn(!1)}}return i.memoizedState=[r,e],r},useReducer:function(t,e,i){var r=Kn();if(i!==void 0){var l=i(e);if(Gr){rn(!0);try{i(e)}finally{rn(!1)}}}else l=e;return r.memoizedState=r.baseState=l,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:l},r.queue=t,t=t.dispatch=Yy.bind(null,Me,t),[r.memoizedState,t]},useRef:function(t){var e=Kn();return t={current:t},e.memoizedState=t},useState:function(t){t=Of(t);var e=t.queue,i=Rg.bind(null,Me,e);return e.dispatch=i,[t.memoizedState,i]},useDebugValue:If,useDeferredValue:function(t,e){var i=Kn();return Bf(i,t,e)},useTransition:function(){var t=Of(!1);return t=Mg.bind(null,Me,t.queue,!0,!1),Kn().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,i){var r=Me,l=Kn();if(Ce){if(i===void 0)throw Error(s(407));i=i()}else{if(i=e(),nn===null)throw Error(s(349));(Ie&127)!==0||Qm(r,e,i)}l.memoizedState=i;var u={value:i,getSnapshot:e};return l.queue=u,dg($m.bind(null,r,u,t),[t]),r.flags|=2048,Cs(9,{destroy:void 0},Jm.bind(null,r,u,i,e),null),i},useId:function(){var t=Kn(),e=nn.identifierPrefix;if(Ce){var i=ia,r=na;i=(r&~(1<<32-fn(r)-1)).toString(32)+i,e="_"+e+"R_"+i,i=ac++,0<i&&(e+="H"+i.toString(32)),e+="_"}else i=Hy++,e="_"+e+"r_"+i.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Hf,useFormState:lg,useActionState:lg,useOptimistic:function(t){var e=Kn();e.memoizedState=e.baseState=t;var i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=i,e=Gf.bind(null,Me,!0,i),i.dispatch=e,[t,e]},useMemoCache:Uf,useCacheRefresh:function(){return Kn().memoizedState=qy.bind(null,Me)},useEffectEvent:function(t){var e=Kn(),i={impl:t};return e.memoizedState=i,function(){if((qe&2)!==0)throw Error(s(440));return i.impl.apply(void 0,arguments)}}},Ug={readContext:Bn,use:sc,useCallback:xg,useContext:Bn,useEffect:Pf,useImperativeHandle:_g,useInsertionEffect:mg,useLayoutEffect:gg,useMemo:yg,useReducer:oc,useRef:hg,useState:function(){return oc(Ta)},useDebugValue:If,useDeferredValue:function(t,e){var i=yn();return Sg(i,tn.memoizedState,t,e)},useTransition:function(){var t=oc(Ta)[0],e=yn().memoizedState;return[typeof t=="boolean"?t:qo(t),e]},useSyncExternalStore:Km,useId:bg,useHostTransitionStatus:Hf,useFormState:cg,useActionState:cg,useOptimistic:function(t,e){var i=yn();return ng(i,tn,t,e)},useMemoCache:Uf,useCacheRefresh:Ag,useEffectEvent:pg},Wy={readContext:Bn,use:sc,useCallback:xg,useContext:Bn,useEffect:Pf,useImperativeHandle:_g,useInsertionEffect:mg,useLayoutEffect:gg,useMemo:yg,useReducer:Lf,useRef:hg,useState:function(){return Lf(Ta)},useDebugValue:If,useDeferredValue:function(t,e){var i=yn();return tn===null?Bf(i,t,e):Sg(i,tn.memoizedState,t,e)},useTransition:function(){var t=Lf(Ta)[0],e=yn().memoizedState;return[typeof t=="boolean"?t:qo(t),e]},useSyncExternalStore:Km,useId:bg,useHostTransitionStatus:Hf,useFormState:fg,useActionState:fg,useOptimistic:function(t,e){var i=yn();return tn!==null?ng(i,tn,t,e):(i.baseState=t,[t,i.queue.dispatch])},useMemoCache:Uf,useCacheRefresh:Ag,useEffectEvent:pg};function Vf(t,e,i,r){e=t.memoizedState,i=i(r,e),i=i==null?e:I({},e,i),t.memoizedState=i,t.lanes===0&&(t.updateQueue.baseState=i)}var Xf={enqueueSetState:function(t,e,i){t=t._reactInternals;var r=_i(),l=$a(r);l.payload=e,i!=null&&(l.callback=i),e=tr(t,l,r),e!==null&&(oi(e,t,r),Go(e,t,r))},enqueueReplaceState:function(t,e,i){t=t._reactInternals;var r=_i(),l=$a(r);l.tag=1,l.payload=e,i!=null&&(l.callback=i),e=tr(t,l,r),e!==null&&(oi(e,t,r),Go(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var i=_i(),r=$a(i);r.tag=2,e!=null&&(r.callback=e),e=tr(t,r,i),e!==null&&(oi(e,t,i),Go(e,t,i))}};function Ng(t,e,i,r,l,u,v){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,u,v):e.prototype&&e.prototype.isPureReactComponent?!Lo(i,r)||!Lo(l,u):!0}function Lg(t,e,i,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(i,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(i,r),e.state!==t&&Xf.enqueueReplaceState(e,e.state,null)}function Vr(t,e){var i=e;if("ref"in e){i={};for(var r in e)r!=="ref"&&(i[r]=e[r])}if(t=t.defaultProps){i===e&&(i=I({},i));for(var l in t)i[l]===void 0&&(i[l]=t[l])}return i}function Og(t){Fl(t)}function zg(t){console.error(t)}function Pg(t){Fl(t)}function hc(t,e){try{var i=t.onUncaughtError;i(e.value,{componentStack:e.stack})}catch(r){setTimeout(function(){throw r})}}function Ig(t,e,i){try{var r=t.onCaughtError;r(i.value,{componentStack:i.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(l){setTimeout(function(){throw l})}}function kf(t,e,i){return i=$a(i),i.tag=3,i.payload={element:null},i.callback=function(){hc(t,e)},i}function Bg(t){return t=$a(t),t.tag=3,t}function Fg(t,e,i,r){var l=i.type.getDerivedStateFromError;if(typeof l=="function"){var u=r.value;t.payload=function(){return l(u)},t.callback=function(){Ig(e,i,r)}}var v=i.stateNode;v!==null&&typeof v.componentDidCatch=="function"&&(t.callback=function(){Ig(e,i,r),typeof l!="function"&&(lr===null?lr=new Set([this]):lr.add(this));var E=r.stack;this.componentDidCatch(r.value,{componentStack:E!==null?E:""})})}function Zy(t,e,i,r,l){if(i.flags|=32768,r!==null&&typeof r=="object"&&typeof r.then=="function"){if(e=i.alternate,e!==null&&Or(e,i,l,!0),i=Fn.current,i!==null){switch(i.tag){case 31:case 13:case 19:return jn===null?Lc():i.alternate===null&&vn===0&&(vn=3),i.flags&=-257,i.flags|=65536,i.lanes=l,r===Jl?i.flags|=16384:(e=i.updateQueue,e===null?i.updateQueue=new Set([r]):e.add(r),Ch(t,r,l)),!1;case 22:return i.flags|=65536,r===Jl?i.flags|=16384:(e=i.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([r])},i.updateQueue=e):(i=e.retryQueue,i===null?e.retryQueue=new Set([r]):i.add(r)),Ch(t,r,l)),!1}throw Error(s(435,i.tag))}return Ch(t,r,l),Lc(),!1}if(Ce)return e=Fn.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=l,r!==uf&&(t=Error(s(422),{cause:r}),Po(bi(t,i)))):(r!==uf&&(e=Error(s(423),{cause:r}),Po(bi(e,i))),t=t.current.alternate,t.flags|=65536,l&=-l,t.lanes|=l,r=bi(r,i),l=kf(t.stateNode,r,l),yf(t,l),vn!==4&&(vn=2)),!1;var u=Error(s(520),{cause:r});if(u=bi(u,i),el===null?el=[u]:el.push(u),vn!==4&&(vn=2),e===null)return!0;r=bi(r,i),i=e;do{switch(i.tag){case 3:return i.flags|=65536,t=l&-l,i.lanes|=t,t=kf(i.stateNode,r,t),yf(i,t),!1;case 1:if(e=i.type,u=i.stateNode,(i.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||u!==null&&typeof u.componentDidCatch=="function"&&(lr===null||!lr.has(u))))return i.flags|=65536,l&=-l,i.lanes|=l,l=Bg(l),Fg(l,t,i,r),yf(i,l),!1;break;case 22:if(i.memoizedState!==null)return i.flags|=65536,!1}i=i.return}while(i!==null);return!1}var jf=Error(s(461)),An=!1;function Dn(t,e,i,r){e.child=t===null?Xm(e,null,i,r):Hr(e,t.child,i,r)}function Hg(t,e,i,r,l){i=i.render;var u=e.ref;if("ref"in r){var v={};for(var E in r)E!=="ref"&&(v[E]=r[E])}else v=r;return zr(e),r=Rf(t,e,i,v,u,l),E=Cf(),t!==null&&!An?(wf(t,e,l),ba(t,e,l)):(Ce&&E&&jl(e),e.flags|=1,Dn(t,e,r,l),e.child)}function Gg(t,e,i,r,l){if(t===null){var u=i.type;return typeof u=="function"&&!sf(u)&&u.defaultProps===void 0&&i.compare===null?(e.tag=15,e.type=u,Vg(t,e,u,r,l)):(t=Xl(i.type,null,r,e,e.mode,l),t.ref=e.ref,t.return=e,e.child=t)}if(u=t.child,!$f(t,l)){var v=u.memoizedProps;if(i=i.compare,i=i!==null?i:Lo,i(v,r)&&t.ref===e.ref)return ba(t,e,l)}return e.flags|=1,t=xa(u,r),t.ref=e.ref,t.return=e,e.child=t}function Vg(t,e,i,r,l){if(t!==null){var u=t.memoizedProps;if(Lo(u,r)&&t.ref===e.ref)if(An=!1,e.pendingProps=r=u,$f(t,l))(t.flags&131072)!==0&&(An=!0);else return e.lanes=t.lanes,ba(t,e,l)}return qf(t,e,i,r,l)}function Xg(t,e,i,r){var l=r.children,u=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode==="hidden"){if((e.flags&128)!==0){if(u=u!==null?u.baseLanes|i:i,t!==null){for(r=e.child=t.child,l=0;r!==null;)l=l|r.lanes|r.childLanes,r=r.sibling;r=l&~u}else r=0,e.child=null;return kg(t,e,u,i,r)}if((i&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&Kl(e,u!==null?u.cachePool:null),u!==null?qm(e,u):Mf(),Ym(e);else return r=e.lanes=536870912,kg(t,e,u!==null?u.baseLanes|i:i,i,r)}else u!==null?(Kl(e,u.cachePool),qm(e,u),ir(),e.memoizedState=null):(t!==null&&Kl(e,null),Mf(),ir());return Dn(t,e,l,i),e.child}function Wo(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function kg(t,e,i,r,l){var u=gf();return u=u===null?null:{parent:Tn._currentValue,pool:u},e.memoizedState={baseLanes:i,cachePool:u},t!==null&&Kl(e,null),Mf(),Ym(e),t!==null&&Or(t,e,r,!0),e.childLanes=l,null}function dc(t,e){return e=pc({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function jg(t,e,i){return Hr(e,t.child,null,i),t=dc(e,e.pendingProps),t.flags|=2,pi(e),e.memoizedState=null,t}function Ky(t,e,i){var r=e.pendingProps,l=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(Ce){if(r.mode==="hidden")return t=dc(e,r),e.lanes=536870912,t.memoizedState={baseLanes:0,cachePool:null},Wo(null,t);if(Tf(e),(t=on)?(t=v_(t,Ci),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ya!==null?{id:na,overflow:ia}:null,retryLane:536870912,hydrationErrors:null},i=Cm(t),i.return=e,e.child=i,On=e,on=null)):t=null,t===null)throw Za(e);return e.lanes=536870912,null}return dc(e,r)}var u=t.memoizedState;if(u!==null){var v=u.dehydrated;if(Tf(e),l)if(e.flags&256)e.flags&=-257,e=jg(t,e,i);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(s(558));else if(An||Or(t,e,i,!1),l=(i&t.childLanes)!==0,An||l){if(er.current===null){if(r=nn,r!==null&&(v=$(r,i),v!==0&&v!==u.retryLane))throw u.retryLane=v,Dr(t,v),oi(r,t,v),jf;Lc()}e=jg(t,e,i)}else t=u.treeContext,on=Di(v.nextSibling),On=e,Ce=!0,Wa=null,Ci=!1,t!==null&&Um(e,t),e=dc(e,r),e.flags|=134221824;return e}return t=xa(t.child,{mode:r.mode,children:r.children}),t.ref=e.ref,e.child=t,t.return=e,t}function ws(t,e){var i=e.ref;if(i===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof i!="function"&&typeof i!="object")throw Error(s(284));(t===null||t.ref!==i)&&(e.flags|=4194816)}}function qf(t,e,i,r,l){return zr(e),i=Rf(t,e,i,r,void 0,l),r=Cf(),t!==null&&!An?(wf(t,e,l),ba(t,e,l)):(Ce&&r&&jl(e),e.flags|=1,Dn(t,e,i,l),e.child)}function qg(t,e,i,r,l,u){return zr(e),e.updateQueue=null,i=Zm(e,r,i,l),Wm(t),r=Cf(),t!==null&&!An?(wf(t,e,u),ba(t,e,u)):(Ce&&r&&jl(e),e.flags|=1,Dn(t,e,i,u),e.child)}function Yg(t,e,i,r,l){if(zr(e),e.stateNode===null){var u=xs,v=i.contextType;typeof v=="object"&&v!==null&&(u=Bn(v)),u=new i(r,u),e.memoizedState=u.state!==null&&u.state!==void 0?u.state:null,u.updater=Xf,e.stateNode=u,u._reactInternals=e,u=e.stateNode,u.props=r,u.state=e.memoizedState,u.refs={},_f(e),v=i.contextType,u.context=typeof v=="object"&&v!==null?Bn(v):xs,u.state=e.memoizedState,v=i.getDerivedStateFromProps,typeof v=="function"&&(Vf(e,i,v,r),u.state=e.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof u.getSnapshotBeforeUpdate=="function"||typeof u.UNSAFE_componentWillMount!="function"&&typeof u.componentWillMount!="function"||(v=u.state,typeof u.componentWillMount=="function"&&u.componentWillMount(),typeof u.UNSAFE_componentWillMount=="function"&&u.UNSAFE_componentWillMount(),v!==u.state&&Xf.enqueueReplaceState(u,u.state,null),Xo(e,r,u,l),Vo(),u.state=e.memoizedState),typeof u.componentDidMount=="function"&&(e.flags|=4194308),r=!0}else if(t===null){u=e.stateNode;var E=e.memoizedProps,z=Vr(i,E);u.props=z;var J=u.context,st=i.contextType;v=xs,typeof st=="object"&&st!==null&&(v=Bn(st));var Mt=i.getDerivedStateFromProps;st=typeof Mt=="function"||typeof u.getSnapshotBeforeUpdate=="function",E=e.pendingProps!==E,st||typeof u.UNSAFE_componentWillReceiveProps!="function"&&typeof u.componentWillReceiveProps!="function"||(E||J!==v)&&Lg(e,u,r,v),Ja=!1;var Y=e.memoizedState;u.state=Y,Xo(e,r,u,l),Vo(),J=e.memoizedState,E||Y!==J||Ja?(typeof Mt=="function"&&(Vf(e,i,Mt,r),J=e.memoizedState),(z=Ja||Ng(e,i,z,r,Y,J,v))?(st||typeof u.UNSAFE_componentWillMount!="function"&&typeof u.componentWillMount!="function"||(typeof u.componentWillMount=="function"&&u.componentWillMount(),typeof u.UNSAFE_componentWillMount=="function"&&u.UNSAFE_componentWillMount()),typeof u.componentDidMount=="function"&&(e.flags|=4194308)):(typeof u.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=J),u.props=r,u.state=J,u.context=v,r=z):(typeof u.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{u=e.stateNode,xf(t,e),v=e.memoizedProps,st=Vr(i,v),u.props=st,Mt=e.pendingProps,Y=u.context,J=i.contextType,z=xs,typeof J=="object"&&J!==null&&(z=Bn(J)),E=i.getDerivedStateFromProps,(J=typeof E=="function"||typeof u.getSnapshotBeforeUpdate=="function")||typeof u.UNSAFE_componentWillReceiveProps!="function"&&typeof u.componentWillReceiveProps!="function"||(v!==Mt||Y!==z)&&Lg(e,u,r,z),Ja=!1,Y=e.memoizedState,u.state=Y,Xo(e,r,u,l),Vo();var nt=e.memoizedState;v!==Mt||Y!==nt||Ja||t!==null&&t.dependencies!==null&&Wl(t.dependencies)?(typeof E=="function"&&(Vf(e,i,E,r),nt=e.memoizedState),(st=Ja||Ng(e,i,st,r,Y,nt,z)||t!==null&&t.dependencies!==null&&Wl(t.dependencies))?(J||typeof u.UNSAFE_componentWillUpdate!="function"&&typeof u.componentWillUpdate!="function"||(typeof u.componentWillUpdate=="function"&&u.componentWillUpdate(r,nt,z),typeof u.UNSAFE_componentWillUpdate=="function"&&u.UNSAFE_componentWillUpdate(r,nt,z)),typeof u.componentDidUpdate=="function"&&(e.flags|=4),typeof u.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof u.componentDidUpdate!="function"||v===t.memoizedProps&&Y===t.memoizedState||(e.flags|=4),typeof u.getSnapshotBeforeUpdate!="function"||v===t.memoizedProps&&Y===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=nt),u.props=r,u.state=nt,u.context=z,r=st):(typeof u.componentDidUpdate!="function"||v===t.memoizedProps&&Y===t.memoizedState||(e.flags|=4),typeof u.getSnapshotBeforeUpdate!="function"||v===t.memoizedProps&&Y===t.memoizedState||(e.flags|=1024),r=!1)}return u=r,ws(t,e),r=(e.flags&128)!==0,u||r?(u=e.stateNode,i=r&&typeof i.getDerivedStateFromError!="function"?null:u.render(),e.flags|=1,t!==null&&r?(e.child=Hr(e,t.child,null,l),e.child=Hr(e,null,i,l)):Dn(t,e,i,l),e.memoizedState=u.state,t=e.child):t=ba(t,e,l),t}function Wg(t,e,i,r){return Nr(),e.flags|=256,Dn(t,e,i,r),e.child}var Yf={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Wf(t){return{baseLanes:t,cachePool:Im()}}function Zf(t,e,i){return t=t!==null?t.childLanes&~i:0,e&&(t|=vi),t}function Zg(t,e,i){var r=e.pendingProps,l=!1,u=(e.flags&128)!==0,v;if((v=u)||(v=t!==null&&t.memoizedState===null?!1:(Hn.current&2)!==0),v&&(l=!0,e.flags&=-129),v=(e.flags&32)!==0,e.flags&=-33,t===null){if(Ce){if(l?nr(e):ir(),(t=on)?(t=v_(t,Ci),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ya!==null?{id:na,overflow:ia}:null,retryLane:536870912,hydrationErrors:null},i=Cm(t),i.return=e,e.child=i,On=e,on=null)):t=null,t===null)throw Za(e);return Wh(t)?e.lanes=32:e.lanes=536870912,null}return u=r.children,r=r.fallback,l?(ir(),l=e.mode,u=pc({mode:"hidden",children:u},l),r=Ur(r,l,i,null),u.return=e,r.return=e,u.sibling=r,e.child=u,r=e.child,r.memoizedState=Wf(i),r.childLanes=Zf(t,v,i),e.memoizedState=Yf,Wo(null,r)):(nr(e),Kf(e,u))}var E=t.memoizedState;if(E!==null){var z=E.dehydrated;if(z!==null)return Qy(t,e,u,v,r,z,E,i)}return l?(ir(),l=r.fallback,u=e.mode,E=t.child,z=E.sibling,r=xa(E,{mode:"hidden",children:r.children}),r.subtreeFlags=E.subtreeFlags&1206910976,z!==null?l=xa(z,l):(l=Ur(l,u,i,null),l.flags|=2),l.return=e,r.return=e,r.sibling=l,e.child=r,Wo(null,r),r=e.child,l=t.child.memoizedState,l===null?l=Wf(i):(u=l.cachePool,u!==null?(E=Tn._currentValue,u=u.parent!==E?{parent:E,pool:E}:u):u=Im(),l={baseLanes:l.baseLanes|i,cachePool:u}),r.memoizedState=l,r.childLanes=Zf(t,v,i),e.memoizedState=Yf,Wo(t.child,r)):(nr(e),i=t.child,t=i.sibling,i=xa(i,{mode:"visible",children:r.children}),i.return=e,i.sibling=null,t!==null&&(v=e.deletions,v===null?(e.deletions=[t],e.flags|=16):v.push(t)),e.child=i,e.memoizedState=null,i)}function Kf(t,e){return e=pc({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function pc(t,e){return t=ii(22,t,null,e),t.lanes=0,t}function mc(t,e,i){return Hr(e,t.child,null,i),t=Kf(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Qy(t,e,i,r,l,u,v,E){if(i)return e.flags&256?(nr(e),e.flags&=-257,mc(t,e,E)):e.memoizedState!==null?(ir(),e.child=t.child,e.flags|=128,null):(ir(),u=l.fallback,v=e.mode,l=pc({mode:"visible",children:l.children},v),u=Ur(u,v,E,null),u.flags|=2,l.return=e,u.return=e,l.sibling=u,e.child=l,Hr(e,t.child,null,E),l=e.child,l.memoizedState=Wf(E),l.childLanes=Zf(t,r,E),e.memoizedState=Yf,Wo(null,l));if(nr(e),Wh(u)){if(r=u.nextSibling&&u.nextSibling.dataset,r)var z=r.dgst;return r=z,r!==""&&(l=Error(s(419)),l.stack="",l.digest=r,Po({value:l,source:null,stack:null})),mc(t,e,E)}if(An||Or(t,e,E,!1),r=(E&t.childLanes)!==0,An||r){if(er.current!==null)return mc(t,e,E);if(r=nn,r!==null&&(l=$(r,E),l!==0&&l!==v.retryLane))throw v.retryLane=l,Dr(t,l),oi(r,t,l),jf;return Yh(u)||Lc(),mc(t,e,E)}return Yh(u)?(e.flags|=192,e.child=t.child,null):(t=v.treeContext,on=Di(u.nextSibling),On=e,Ce=!0,Wa=null,Ci=!1,t!==null&&Um(e,t),e=Kf(e,l.children),e.flags|=134221824,e)}function Kg(t,e,i){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),Yl(t.return,e,i)}function Qg(t){for(var e=null;t!==null;){var i=t.alternate;i!==null&&nc(i)===null&&(e=t),t=t.sibling}return e}function gc(t,e,i,r,l,u){var v=t.memoizedState;v===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:i,tailMode:l,treeForkCount:u}:(v.isBackwards=e,v.rendering=null,v.renderingStartTime=0,v.last=r,v.tail=i,v.tailMode=l,v.treeForkCount=u)}function Qf(t){var e=t.child;for(t.child=null;e!==null;){var i=e.sibling;e.sibling=t.child,t.child=e,e=i}}function Jf(t,e,i){var r=e.pendingProps,l=r.revealOrder,u=r.tail;r=r.children;var v=Hn.current;if(e.flags&128)return ko(e,v),null;var E=(v&2)!==0;if(E?(v=v&1|2,e.flags|=128):v&=1,ko(e,v),l==="backwards"&&t!==null?(Qf(t),Dn(t,e,r,i),Qf(t)):Dn(t,e,r,i),r=Ce?zo:0,!E&&t!==null&&(t.flags&128)!==0)t:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Kg(t,i,e);else if(t.tag===19)Kg(t,i,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(l){case"backwards":i=Qg(e.child),i===null?(l=e.child,e.child=null):(l=i.sibling,i.sibling=null,Qf(e)),gc(e,!0,l,null,u,r);break;case"unstable_legacy-backwards":for(i=null,l=e.child,e.child=null;l!==null;){if(t=l.alternate,t!==null&&nc(t)===null){e.child=l;break}t=l.sibling,l.sibling=i,i=l,l=t}gc(e,!0,i,null,u,r);break;case"together":gc(e,!1,null,null,void 0,r);break;case"independent":e.memoizedState=null;break;default:i=Qg(e.child),i===null?(l=e.child,e.child=null):(l=i.sibling,i.sibling=null),gc(e,!1,l,i,u,r)}return e.child}function Jg(t,e,i){var r=e.pendingProps;return Ka(e,e.type,r.value),Dn(t,e,r.children,i),e.child}function ba(t,e,i){if(t!==null&&(e.dependencies=t.dependencies),or|=e.lanes,(i&e.childLanes)===0)if(t!==null){if(Or(t,e,i,!1),(i&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(s(153));if(e.child!==null){for(t=e.child,i=xa(t,t.pendingProps),e.child=i,i.return=e;t.sibling!==null;)t=t.sibling,i=i.sibling=xa(t,t.pendingProps),i.return=e;i.sibling=null}return e.child}function $f(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&Wl(t)))}function Jy(t,e,i){switch(e.tag){case 3:it(e,e.stateNode.containerInfo),Ka(e,Tn,t.memoizedState.cache),Nr();break;case 27:case 5:Rt(e);break;case 4:it(e,e.stateNode.containerInfo);break;case 10:Ka(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Tf(e),null;break;case 13:var r=e.memoizedState;if(r!==null){if(r.dehydrated!==null)return nr(e),e.flags|=128,null;r=Or(t,e,i,!1);var l=e.child.childLanes;return r||(i&l)!==0?Zg(t,e,i):(nr(e),t=ba(t,e,i),t!==null?t.sibling:null)}nr(e);break;case 19:if(e.flags&128)return Jf(t,e,i);if(l=(t.flags&128)!==0,r=(i&e.childLanes)!==0,r||(Or(t,e,i,!1),r=(i&e.childLanes)!==0),l){if(r)return Jf(t,e,i);e.flags|=128}if(l=e.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),ko(e,Hn.current),r)break;return null;case 22:return e.lanes=0,Xg(t,e,i,e.pendingProps);case 24:Ka(e,Tn,t.memoizedState.cache)}return ba(t,e,i)}function $g(t,e,i){if(t!==null)if(t.memoizedProps!==e.pendingProps)An=!0;else{if(!$f(t,i)&&(e.flags&128)===0)return An=!1,Jy(t,e,i);An=(t.flags&131072)!==0}else An=!1,Ce&&(e.flags&1048576)!==0&&Dm(e,zo,e.index);switch(e.lanes=0,e.tag){case 16:t:{var r=e.pendingProps;if(t=Br(e.elementType),e.type=t,typeof t=="function")sf(t)?(r=Vr(t,r),e.tag=1,e=Yg(null,e,t,r,i)):(e.tag=0,e=qf(null,e,t,r,i));else{if(t!=null){var l=t.$$typeof;if(l===X){e.tag=11,e=Hg(null,e,t,r,i);break t}else if(l===St){e.tag=14,e=Gg(null,e,t,r,i);break t}else if(l===gt){e.tag=10,e.type=t,e=Jg(null,e,i);break t}}throw e=_t(t)||t,Error(s(306,e,""))}}return e;case 0:return qf(t,e,e.type,e.pendingProps,i);case 1:return r=e.type,l=Vr(r,e.pendingProps),Yg(t,e,r,l,i);case 3:t:{if(it(e,e.stateNode.containerInfo),t===null)throw Error(s(387));r=e.pendingProps;var u=e.memoizedState;l=u.element,xf(t,e),Xo(e,r,null,i);var v=e.memoizedState;if(r=v.cache,Ka(e,Tn,r),r!==u.cache&&df(e,[Tn],i,!0),Vo(),r=v.element,u.isDehydrated)if(u={element:r,isDehydrated:!1,cache:v.cache},e.updateQueue.baseState=u,e.memoizedState=u,e.flags&256){e=Wg(t,e,r,i);break t}else if(r!==l){l=bi(Error(s(424)),e),Po(l),e=Wg(t,e,r,i);break t}else for(t=e.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,on=Di(t.firstChild),On=e,Ce=!0,Wa=null,Ci=!0,i=Xm(e,null,r,i),e.child=i;i;)i.flags=i.flags&-3|134221824,i=i.sibling;else{if(Nr(),r===l){e=ba(t,e,i);break t}Dn(t,e,r,i)}e=e.child}return e;case 26:return ws(t,e),t===null?(i=T_(e.type,null,e.pendingProps,null))?e.memoizedState=i:Ce||(e.stateNode=i_(e.type,e.pendingProps,L.current,e)):e.memoizedState=T_(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return Rt(e),t===null&&Ce&&(r=e.stateNode=y_(e.type,e.pendingProps,L.current),On=e,Ci=!0,l=on,fr(e.type)?(Zh=l,on=Di(r.firstChild)):on=l),Dn(t,e,e.pendingProps.children,i),ws(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&Ce&&((l=r=on)&&(r=qS(r,e.type,e.pendingProps,Ci),r!==null?(e.stateNode=r,On=e,on=Di(r.firstChild),Ci=!1,l=!0):l=!1),l||Za(e)),Rt(e),l=e.type,u=e.pendingProps,v=t!==null?t.memoizedProps:null,r=u.children,Hh(l,u)?r=null:v!==null&&Hh(l,v)&&(e.flags|=32),e.memoizedState!==null&&(l=Rf(t,e,Gy,null,null,i),Ys._currentValue=l),ws(t,e),Dn(t,e,r,i),e.child;case 6:return t===null&&Ce&&((t=i=on)&&(i=YS(i,e.pendingProps,Ci),i!==null?(e.stateNode=i,On=e,on=null,t=!0):t=!1),t||Za(e)),null;case 13:return Zg(t,e,i);case 4:return it(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=Hr(e,null,r,i):Dn(t,e,r,i),e.child;case 11:return Hg(t,e,e.type,e.pendingProps,i);case 7:return r=e.pendingProps,ws(t,e),Dn(t,e,r,i),e.child;case 8:return Dn(t,e,e.pendingProps.children,i),e.child;case 12:return Dn(t,e,e.pendingProps.children,i),e.child;case 10:return Jg(t,e,i);case 9:return l=e.type._context,r=e.pendingProps.children,zr(e),l=Bn(l),r=r(l),e.flags|=1,Dn(t,e,r,i),e.child;case 14:return Gg(t,e,e.type,e.pendingProps,i);case 15:return Vg(t,e,e.type,e.pendingProps,i);case 19:return Jf(t,e,i);case 31:return Ky(t,e,i);case 22:return Xg(t,e,i,e.pendingProps);case 24:return zr(e),r=Bn(Tn),t===null?(l=gf(),l===null&&(l=nn,u=pf(),l.pooledCache=u,u.refCount++,u!==null&&(l.pooledCacheLanes|=i),l=u),e.memoizedState={parent:r,cache:l},_f(e),Ka(e,Tn,l)):((t.lanes&i)!==0&&(xf(t,e),Xo(e,null,null,i),Vo()),l=t.memoizedState,u=e.memoizedState,l.parent!==r?(l={parent:r,cache:r},e.memoizedState=l,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=l),Ka(e,Tn,r)):(r=u.cache,Ka(e,Tn,r),r!==l.cache&&df(e,[Tn],i,!0))),Dn(t,e,e.pendingProps.children,i),e.child;case 30:return e.stateNode===null&&(e.stateNode={autoName:null,paired:null,clones:null,ref:null}),r=e.pendingProps,r.name!=null&&r.name!=="auto"?e.flags|=t===null?18882560:18874368:Ce&&jl(e),t!==null&&t.memoizedProps.name!==r.name?e.flags|=4194816:ws(t,e),Dn(t,e,r.children,i),e.child;case 29:throw e.pendingProps}throw Error(s(156,e.tag))}function Aa(t){t.flags|=4}function th(t,e,i,r,l){var u;if((u=(t.mode&32)!==0)&&(u=i===null?C_(e,r):C_(e,r)&&(r.src!==i.src||r.srcSet!==i.srcSet)),u){if(t.flags|=16777216,(l&335544128)===l)if(t.stateNode.complete)t.flags|=8192;else if(Ov())t.flags|=8192;else throw Fr=Jl,vf}else t.flags&=-16777217}function tv(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!w_(e))if(Ov())t.flags|=8192;else throw Fr=Jl,vf}function vc(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?cs():536870912,t.lanes|=e,Os|=e)}function Zo(t,e){if(!Ce)switch(t.tailMode){case"visible":break;case"collapsed":for(var i=t.tail,r=null;i!==null;)i.alternate!==null&&(r=i),i=i.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null;break;default:for(e=t.tail,i=null;e!==null;)e.alternate!==null&&(i=e),e=e.sibling;i===null?t.tail=null:i.sibling=null}}function ln(t){var e=t.alternate!==null&&t.alternate.child===t.child,i=0,r=0;if(e)for(var l=t.child;l!==null;)i|=l.lanes|l.childLanes,r|=l.subtreeFlags&1206910976,r|=l.flags&1206910976,l.return=t,l=l.sibling;else for(l=t.child;l!==null;)i|=l.lanes|l.childLanes,r|=l.subtreeFlags,r|=l.flags,l.return=t,l=l.sibling;return t.subtreeFlags|=r,t.childLanes=i,e}function $y(t,e,i){var r=e.pendingProps;switch(cf(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ln(e),null;case 1:return ln(e),null;case 3:return i=e.stateNode,r=null,t!==null&&(r=t.memoizedState.cache),e.memoizedState.cache!==r&&(e.flags|=2048),Ma(Tn),xt(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(Ms(e)?Aa(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,ff())),ln(e),null;case 26:var l=e.type,u=e.memoizedState;return t===null?(Aa(e),u!==null?(ln(e),tv(e,u)):(ln(e),th(e,l,null,r,i))):u?u!==t.memoizedState?(Aa(e),ln(e),tv(e,u)):(ln(e),e.flags&=-16777217):(t=t.memoizedProps,t!==r&&Aa(e),ln(e),th(e,l,t,r,i)),null;case 27:if(Et(e),i=L.current,l=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&Aa(e);else{if(!r){if(e.stateNode===null)throw Error(s(166));return ln(e),e.subtreeFlags&=-33554433,null}t=Se.current,Ms(e)?Nm(e):(t=y_(l,r,i),e.stateNode=t,Aa(e))}return ln(e),e.subtreeFlags&=-33554433,null;case 5:if(Et(e),l=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==r&&Aa(e);else{if(!r){if(e.stateNode===null)throw Error(s(166));return ln(e),e.subtreeFlags&=-33554433,null}if(u=Se.current,Ms(e))Nm(e);else{var v=sl(L.current);switch(u){case 1:u=v.createElementNS("http://www.w3.org/2000/svg",l);break;case 2:u=v.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;default:switch(l){case"svg":u=v.createElementNS("http://www.w3.org/2000/svg",l);break;case"math":u=v.createElementNS("http://www.w3.org/1998/Math/MathML",l);break;case"script":u=v.createElement("div"),u.innerHTML="<script><\/script>",u=u.removeChild(u.firstChild);break;case"select":u=typeof r.is=="string"?v.createElement("select",{is:r.is}):v.createElement("select"),r.multiple?u.multiple=!0:r.size&&(u.size=r.size);break;default:u=typeof r.is=="string"?v.createElement(l,{is:r.is}):v.createElement(l)}}u[ee]=e,u[Xt]=r;t:for(v=e.child;v!==null;){if(v.tag===5||v.tag===6)u.appendChild(v.stateNode);else if(v.tag!==4&&v.tag!==27&&v.child!==null){v.child.return=v,v=v.child;continue}if(v===e)break t;for(;v.sibling===null;){if(v.return===null||v.return===e)break t;v=v.return}v.sibling.return=v.return,v=v.sibling}e.stateNode=u;t:switch(Vn(u,l,r),l){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break t;case"img":r=!0;break t;default:r=!1}r&&Aa(e)}}return ln(e),e.subtreeFlags&=-33554433,th(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,i),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==r&&Aa(e);else{if(typeof r!="string"&&e.stateNode===null)throw Error(s(166));if(t=L.current,Ms(e)){if(t=e.stateNode,i=e.memoizedProps,r=null,l=On,l!==null)switch(l.tag){case 27:case 5:r=l.memoizedProps}t[ee]=e,t=!!(t.nodeValue===i||r!==null&&r.suppressHydrationWarning===!0||$v(t.nodeValue,i)),t||Za(e,!0)}else t=sl(t).createTextNode(r),t[ee]=e,e.stateNode=t}return ln(e),null;case 31:if(i=e.memoizedState,t===null||t.memoizedState!==null){if(r=Ms(e),i!==null){if(t===null){if(!r)throw Error(s(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(s(557));t[ee]=e}else Nr(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;ln(e),t=!1}else i=ff(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=i),t=!0;if(!t)return e.flags&256?(pi(e),e):(pi(e),null);if((e.flags&128)!==0)throw Error(s(558))}return ln(e),null;case 13:if(r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(l=Ms(e),r!==null&&r.dehydrated!==null){if(t===null){if(!l)throw Error(s(318));if(l=e.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(s(317));l[ee]=e}else Nr(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;ln(e),l=!1}else l=ff(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=l),l=!0;if(!l)return e.flags&256?(pi(e),e):(pi(e),null)}return pi(e),(e.flags&128)!==0?(e.lanes=i,e):(i=r!==null,t=t!==null&&t.memoizedState!==null,i&&(r=e.child,l=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(l=r.alternate.memoizedState.cachePool.pool),u=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(u=r.memoizedState.cachePool.pool),u!==l&&(r.flags|=2048)),i!==t&&i&&(e.child.flags|=8192),vc(e,e.updateQueue),ln(e),null);case 4:return xt(),t===null&&zh(e.stateNode.containerInfo),e.flags|=67108864,ln(e),null;case 10:return Ma(e.type),ln(e),null;case 19:if(bf(e),r=e.memoizedState,r===null)return ln(e),null;if(l=(e.flags&128)!==0,u=r.rendering,u===null)if(l)Zo(r,!1);else{if(vn!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(u=nc(t),u!==null){for(e.flags|=128,Zo(r,!1),t=u.updateQueue,e.updateQueue=t,vc(e,t),e.subtreeFlags=0,t=i,i=e.child;i!==null;)Rm(i,t),i=i.sibling;return ko(e,Hn.current&1|2),Ce&&ya(e,r.treeForkCount),e.child}t=t.sibling}r.tail!==null&&F()>wc&&(e.flags|=128,l=!0,Zo(r,!1),e.lanes=4194304)}else{if(!l)if(t=nc(u),t!==null){if(e.flags|=128,l=!0,t=t.updateQueue,e.updateQueue=t,vc(e,t),Zo(r,!0),r.tail===null&&r.tailMode!=="collapsed"&&r.tailMode!=="visible"&&!u.alternate&&!Ce)return ln(e),null}else 2*F()-r.renderingStartTime>wc&&i!==536870912&&(e.flags|=128,l=!0,Zo(r,!1),e.lanes=4194304);r.isBackwards?(u.sibling=e.child,e.child=u):(t=r.last,t!==null?t.sibling=u:e.child=u,r.last=u)}if(r.tail!==null){t=r.tail;t:{for(i=t;i!==null;){if(i.alternate!==null){i=!1;break t}i=i.sibling}i=!0}return r.rendering=t,r.tail=t.sibling,r.renderingStartTime=F(),t.sibling=null,u=Hn.current,u=l?u&1|2:u&1,r.tailMode==="visible"||r.tailMode==="collapsed"||!i||Ce?ko(e,u):(i=u,Ft(Fn,e),Ft(Hn,i),jn===null&&(jn=e)),Ce&&ya(e,r.treeForkCount),t}return ln(e),null;case 22:case 23:return pi(e),Ef(),r=e.memoizedState!==null,t!==null?t.memoizedState!==null!==r&&(e.flags|=8192):r&&(e.flags|=8192),r?(i&536870912)!==0&&(e.flags&128)===0&&(ln(e),e.subtreeFlags&6&&(e.flags|=8192)):ln(e),i=e.updateQueue,i!==null&&vc(e,i.retryQueue),i=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),r=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(r=e.memoizedState.cachePool.pool),r!==i&&(e.flags|=2048),t!==null&&ae(Ir),null;case 24:return i=null,t!==null&&(i=t.memoizedState.cache),e.memoizedState.cache!==i&&(e.flags|=2048),Ma(Tn),ln(e),null;case 25:return null;case 30:return e.flags|=33554432,ln(e),null}throw Error(s(156,e.tag))}function tS(t,e){switch(cf(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Ma(Tn),xt(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return Et(e),null;case 31:if(e.memoizedState!==null){if(pi(e),e.alternate===null)throw Error(s(340));Nr()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(pi(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(s(340));Nr()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return bf(e),t=e.flags,t&65536?(e.flags=t&-65537|128,t=e.memoizedState,t!==null&&(t.rendering=null,t.tail=null),e.flags|=4,e):null;case 4:return xt(),null;case 10:return Ma(e.type),null;case 22:case 23:return pi(e),Ef(),t!==null&&ae(Ir),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Ma(Tn),null;case 25:return null;default:return null}}function ev(t,e){switch(cf(e),e.tag){case 3:Ma(Tn),xt();break;case 26:case 27:case 5:Et(e);break;case 4:xt();break;case 31:e.memoizedState!==null&&pi(e);break;case 13:pi(e);break;case 19:bf(e);break;case 10:Ma(e.type);break;case 22:case 23:pi(e),Ef(),t!==null&&ae(Ir);break;case 24:Ma(Tn)}}function Ko(t,e){try{var i=e.updateQueue,r=i!==null?i.lastEffect:null;if(r!==null){var l=r.next;i=l;do{if((i.tag&t)===t){r=void 0;var u=i.create,v=i.inst;r=u(),v.destroy=r}i=i.next}while(i!==l)}}catch(E){Qe(e,e.return,E)}}function ar(t,e,i){try{var r=e.updateQueue,l=r!==null?r.lastEffect:null;if(l!==null){var u=l.next;r=u;do{if((r.tag&t)===t){var v=r.inst,E=v.destroy;if(E!==void 0){v.destroy=void 0,l=e;var z=i,J=E;try{J()}catch(st){Qe(l,z,st)}}}r=r.next}while(r!==u)}}catch(st){Qe(e,e.return,st)}}function nv(t){var e=t.updateQueue;if(e!==null){var i=t.stateNode;try{jm(e,i)}catch(r){Qe(t,t.return,r)}}}function iv(t,e,i){i.props=Vr(t.type,t.memoizedProps),i.state=t.memoizedState;try{i.componentWillUnmount()}catch(r){Qe(t,e,r)}}function aa(t,e){try{var i=t.ref;if(i!==null){switch(t.tag){case 26:case 27:case 5:var r=t.stateNode;break;case 30:var l=t.stateNode,u=va(t.memoizedProps,l);(l.ref===null||l.ref.name!==u)&&(l.ref=u_(u)),r=l.ref;break;case 7:if(t.stateNode===null){var v=new xi(t);p(t.child,!1,kS,v,void 0,void 0),t.stateNode=v}r=t.stateNode;break;default:r=t.stateNode}typeof i=="function"?t.refCleanup=i(r):i.current=r}}catch(E){Qe(t,e,E)}}function Gn(t,e){var i=t.ref,r=t.refCleanup;if(i!==null)if(typeof r=="function")try{r()}catch(l){Qe(t,e,l)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof i=="function")try{i(null)}catch(l){Qe(t,e,l)}else i.current=null}function _c(t,e){if((t.tag===5||t.tag===27||t.tag===6)&&t.alternate===null&&e!==null)for(var i=0;i<e.length;i++)g_(t.stateNode,e[i])}function av(t){for(var e=t.return;e!==null&&(nh(e)&&g_(t.stateNode,e.stateNode),!eh(e));)e=e.return}function Qo(t){for(var e=t.return;e!==null&&(nh(e)&&jS(t.stateNode,e.stateNode),!eh(e));)e=e.return}function eh(t){return t.tag===5||t.tag===3||t.tag===27}function nh(t){return t&&t.tag===7&&t.stateNode!==null}function ih(t){var e=t.type,i=t.memoizedProps,r=t.stateNode;try{t:switch(e){case"button":case"input":case"select":case"textarea":i.autoFocus&&r.focus();break t;case"img":i.src?r.src=i.src:i.srcSet&&(r.srcset=i.srcSet)}}catch(l){Qe(t,t.return,l)}}function ah(t,e,i){try{var r=t.stateNode;AS(r,t.type,i,e),r[Xt]=e}catch(l){Qe(t,t.return,l)}}function rv(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&fr(t.type)||t.tag===4}function rh(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||rv(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&fr(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function sh(t,e,i,r){var l=t.tag;if(l===5||l===6)l=t.stateNode,e?(i.nodeType===9?i.body:i.nodeName==="HTML"?i.ownerDocument.body:i).insertBefore(l,e):(e=i.nodeType===9?i.body:i.nodeName==="HTML"?i.ownerDocument.body:i,e.appendChild(l),i=i._reactRootContainer,i!=null||e.onclick!==null||(e.onclick=ea)),_c(t,r),ge=!0;else if(l!==4&&(l===27&&(_c(t,r),r=null,fr(t.type)&&(i=t.stateNode,e=null)),t=t.child,t!==null))for(sh(t,e,i,r),t=t.sibling;t!==null;)sh(t,e,i,r),t=t.sibling}function xc(t,e,i,r){var l=t.tag;if(l===5||l===6)l=t.stateNode,e?i.insertBefore(l,e):i.appendChild(l),_c(t,r),ge=!0;else if(l!==4&&(l===27&&(_c(t,r),r=null,fr(t.type)&&(i=t.stateNode)),t=t.child,t!==null))for(xc(t,e,i,r),t=t.sibling;t!==null;)xc(t,e,i,r),t=t.sibling}function sv(t){var e=t.stateNode,i=t.memoizedProps;try{for(var r=t.type,l=e.attributes;l.length;)e.removeAttributeNode(l[0]);Vn(e,r,i),e[ee]=t,e[Xt]=i}catch(u){Qe(t,t.return,u)}}var yc=!1,mi=null;function ov(t){(t.tag===30||(t.subtreeFlags&33554432)!==0)&&(yc=!0)}var ra=null;function lv(){var t=ra;return ra=null,t}var ai=0;function Ds(t,e,i,r,l){return ai=0,cv(t.child,e,i,r,l)}function cv(t,e,i,r,l){for(var u=!1;t!==null;){if(t.tag===5){var v=t.stateNode;if(r!==null){var E=Xh(v);r.push(E),E.view&&(u=!0)}else u||Xh(v).view&&(u=!0);yc=!0,l_(v,ai===0?e:e+"_"+ai,i),ai++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&l||cv(t.child,e,i,r,l)&&(u=!0));t=t.sibling}return u}function sa(t,e){for(;t!==null;)t.tag===5?c_(t.stateNode,t.memoizedProps):(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&e||sa(t.child,e)),t=t.sibling}function Sc(t){if((t.subtreeFlags&18874368)!==0)for(t=t.child;t!==null;){if((t.tag!==22||t.memoizedState===null)&&(Sc(t),t.tag===30&&(t.flags&18874368)!==0&&t.stateNode.paired)){var e=t.memoizedProps;if(e.name==null||e.name==="auto")throw Error(s(544));var i=e.name;e=_a(e.default,e.share),e!=="none"&&(Ds(t,i,e,null,!1)||sa(t.child,!1))}t=t.sibling}}function oh(t,e){if(t.tag===30){var i=t.stateNode,r=t.memoizedProps,l=va(r,i),u=_a(r.default,i.paired?r.share:r.enter);u!=="none"?Ds(t,l,u,null,!1)?(Sc(t),i.paired||e||Bs(t,r.onEnter)):sa(t.child,!1):Sc(t)}else if((t.subtreeFlags&33554432)!==0)for(t=t.child;t!==null;)oh(t,e),t=t.sibling;else Sc(t)}function lh(t){if(mi!==null&&mi.size!==0){var e=mi;if((t.subtreeFlags&18874368)!==0)for(t=t.child;t!==null;){if(t.tag!==22||t.memoizedState===null){if(t.tag===30&&(t.flags&18874368)!==0){var i=t.memoizedProps,r=i.name;if(r!=null&&r!=="auto"){var l=e.get(r);if(l!==void 0){var u=_a(i.default,i.share);if(u!=="none"&&(Ds(t,r,u,null,!1)?(u=t.stateNode,l.paired=u,u.paired=l,Bs(t,i.onShare)):sa(t.child,!1)),e.delete(r),e.size===0)break}}}lh(t)}t=t.sibling}}}function ch(t){if(t.tag===30){var e=t.memoizedProps,i=va(e,t.stateNode),r=mi!==null?mi.get(i):void 0,l=_a(e.default,r!==void 0?e.share:e.exit);l!=="none"&&(Ds(t,i,l,null,!1)?r!==void 0?(l=t.stateNode,r.paired=l,l.paired=r,mi.delete(i),Bs(t,e.onShare)):Bs(t,e.onExit):sa(t.child,!1)),mi!==null&&lh(t)}else if((t.subtreeFlags&33554432)!==0)for(t=t.child;t!==null;)ch(t),t=t.sibling;else mi!==null&&lh(t)}function uv(t){for(t=t.child;t!==null;){if(t.tag===30){var e=t.memoizedProps,i=va(e,t.stateNode);e=_a(e.default,e.update),t.flags&=-5,e!=="none"&&Ds(t,i,e,t.memoizedState=[],!1)}else(t.subtreeFlags&33554432)!==0&&uv(t);t=t.sibling}}function uh(t){if((t.subtreeFlags&18874368)!==0)for(t=t.child;t!==null;){if(t.tag!==22||t.memoizedState===null){if(t.tag===30&&(t.flags&18874368)!==0){var e=t.stateNode;e.paired!==null&&(e.paired=null,sa(t.child,!1))}uh(t)}t=t.sibling}}function Mc(t){if(t.tag===30)t.stateNode.paired=null,sa(t.child,!1),uh(t);else if((t.subtreeFlags&33554432)!==0)for(t=t.child;t!==null;)Mc(t),t=t.sibling;else uh(t)}function fv(t){for(t=t.child;t!==null;)t.tag===30?sa(t.child,!1):(t.subtreeFlags&33554432)!==0&&fv(t),t=t.sibling}function fh(t,e,i,r,l,u,v){for(var E=!1;e!==null;){if(e.tag===5){var z=e.stateNode;if(u!==null&&ai<u.length){var J=u[ai],st=Xh(z);(J.view||st.view)&&(E=!0);var Mt;if(Mt=(t.flags&4)===0)if(st.clip)Mt=!0;else{Mt=J.rect;var Y=st.rect;Mt=Mt.y!==Y.y||Mt.x!==Y.x||Mt.height!==Y.height||Mt.width!==Y.width}Mt&&(t.flags|=4),st.abs?st=!J.abs:(J=J.rect,st=st.rect,st=J.height!==st.height||J.width!==st.width),st&&(t.flags|=32)}else t.flags|=32;(t.flags&4)!==0&&l_(z,ai===0?i:i+"_"+ai,l),E&&(t.flags&4)!==0||(ra===null&&(ra=[]),ra.push(z,ai===0?r:r+"_"+ai,e.memoizedProps)),ai++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&v?t.flags|=e.flags&32:fh(t,e.child,i,r,l,u,v)&&(E=!0));e=e.sibling}return E}function hv(t,e){for(t=t.child;t!==null;){if(t.tag===30){var i=t.memoizedProps,r=t.stateNode,l=va(i,r),u=_a(i.default,i.update),v;v=t.memoizedState,t.memoizedState=null,r=t;var E=t.child;ai=0,l=fh(r,E,l,l,u,v,!1),(t.flags&4)!==0&&l&&Bs(t,i.onUpdate)}else(t.subtreeFlags&33554432)!==0&&hv(t);t=t.sibling}}var zn=!1,We=!1,oa=!1,hh=!1,dv=typeof WeakSet=="function"?WeakSet:Set,Pn=null,la=!1,Jo=!1,Ec=!1,dh=!1;function eS(t,e,i){if(t=t.containerInfo,Bh=Ws,t=vm(t),Ju(t)){if("selectionStart"in t)var r={start:t.selectionStart,end:t.selectionEnd};else t:{r=(r=t.ownerDocument)&&r.defaultView||window;var l=r.getSelection&&r.getSelection();if(l&&l.rangeCount!==0){r=l.anchorNode;var u=l.anchorOffset,v=l.focusNode;l=l.focusOffset;try{r.nodeType,v.nodeType}catch{r=null;break t}var E=0,z=-1,J=-1,st=0,Mt=0,Y=t,nt=null;e:for(;;){for(var Bt;Y!==r||u!==0&&Y.nodeType!==3||(z=E+u),Y!==v||l!==0&&Y.nodeType!==3||(J=E+l),Y.nodeType===3&&(E+=Y.nodeValue.length),(Bt=Y.firstChild)!==null;)nt=Y,Y=Bt;for(;;){if(Y===t)break e;if(nt===r&&++st===u&&(z=E),nt===v&&++Mt===l&&(J=E),(Bt=Y.nextSibling)!==null)break;Y=nt,nt=Y.parentNode}Y=Bt}r=z===-1||J===-1?null:{start:z,end:J}}else r=null}r=r||{start:0,end:0}}else r=null;for(Fh={focusedElem:t,selectionRange:r},Ws=!1,i=(i&335544064)===i,Pn=e,e=i?9270:1024;Pn!==null;){if(t=Pn,i&&(r=t.deletions,r!==null))for(u=0;u<r.length;u++)i&&ch(r[u]);if(t.alternate===null&&(t.flags&2)!==0)i&&ov(t),Tc(i);else{if(t.tag===22){if(r=t.alternate,t.memoizedState!==null){r!==null&&r.memoizedState===null&&i&&ch(r),Tc(i);continue}else if(r!==null&&r.memoizedState!==null){i&&ov(t),Tc(i);continue}}r=t.child,(t.subtreeFlags&e)!==0&&r!==null?(r.return=t,Pn=r):(i&&uv(t),Tc(i))}}mi=null}function Tc(t){for(;Pn!==null;){var e=Pn,i=t,r=e.alternate,l=e.flags;switch(e.tag){case 0:case 11:case 15:break;case 1:if((l&1024)!==0&&r!==null){i=void 0,l=r.memoizedProps,r=r.memoizedState;var u=e.stateNode;try{var v=Vr(e.type,l);i=u.getSnapshotBeforeUpdate(v,r),u.__reactInternalSnapshotBeforeUpdate=i}catch(E){Qe(e,e.return,E)}}break;case 3:if((l&1024)!==0){if(r=e.stateNode.containerInfo,i=r.nodeType,i===9)qh(r);else if(i===1)switch(r.nodeName){case"HEAD":case"HTML":case"BODY":qh(r);break;default:r.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:i&&r!==null&&(i=va(r.memoizedProps,r.stateNode),l=e.memoizedProps,l=_a(l.default,l.update),l!=="none"&&Ds(r,i,l,r.memoizedState=[],!0));break;default:if((l&1024)!==0)throw Error(s(163))}if(r=e.sibling,r!==null){r.return=e.return,Pn=r;break}Pn=e.return}}function pv(t,e,i){var r=i.flags;switch(i.tag){case 0:case 11:case 15:ca(t,i),r&4&&Ko(5,i);break;case 1:if(ca(t,i),r&4)if(t=i.stateNode,e===null)try{t.componentDidMount()}catch(v){Qe(i,i.return,v)}else{var l=Vr(i.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(l,e,t.__reactInternalSnapshotBeforeUpdate)}catch(v){Qe(i,i.return,v)}}r&64&&nv(i),r&512&&aa(i,i.return);break;case 3:if(ca(t,i),r&64&&(t=i.updateQueue,t!==null)){if(e=null,i.child!==null)switch(i.child.tag){case 27:case 5:e=i.child.stateNode;break;case 1:e=i.child.stateNode}try{jm(t,e)}catch(v){Qe(i,i.return,v)}}break;case 27:e===null&&r&4&&sv(i);case 26:case 5:ca(t,i),e===null&&r&4&&ih(i),r&512&&aa(i,i.return);break;case 12:ca(t,i);break;case 31:ca(t,i),r&4&&_v(t,i);break;case 13:ca(t,i),r&4&&xv(t,i),r&64&&(t=i.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(i=dS.bind(null,i),WS(t,i))));break;case 22:if(r=i.memoizedState!==null||zn,!r){var u=e!==null&&e.memoizedState!==null||We;e=zn,l=We,zn=r,(We=u)&&!l?(r=2,(i.subtreeFlags&8772)!==0&&(r|=1),Hi(t,i,r)):ca(t,i),zn=e,We=l}break;case 30:ca(t,i),r&512&&aa(i,i.return);break;case 7:r&512&&aa(i,i.return);default:ca(t,i)}}function ph(t,e){for(t=t.child;t!==null;)mv(t,e),t=t.sibling}function mv(t,e){switch(t.tag){case 5:case 26:try{var i=t.stateNode;if(e){var r=i.style;typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none"}else{var l=t.stateNode,u=t.memoizedProps.style,v=u!=null&&u.hasOwnProperty("display")?u.display:null;l.style.display=v==null||typeof v=="boolean"?"":(""+v).trim()}}catch(z){Qe(t,t.return,z)}mh(t,e);break;case 6:try{t.stateNode.nodeValue=e?"":t.memoizedProps,ge=!0}catch(z){Qe(t,t.return,z)}break;case 18:try{var E=t.stateNode;e?o_(E,!0):o_(t.stateNode,!1)}catch(z){Qe(t,t.return,z)}break;case 22:case 23:t.memoizedState===null&&ph(t,e);break;default:ph(t,e)}}function mh(t,e){if(t.subtreeFlags&67108864)for(t=t.child;t!==null;){t:{var i=t,r=e;switch(i.tag){case 4:mv(i,r);break t;case 22:i.memoizedState===null&&mh(i,r);break t;default:mh(i,r)}}t=t.sibling}}function gv(t){var e=t.alternate;e!==null&&(t.alternate=null,gv(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&Ne(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var dn=null,ri=!1;function Bi(t,e,i){for(i=i.child;i!==null;)vv(t,e,i),i=i.sibling}function vv(t,e,i){if(Xe&&typeof Xe.onCommitFiberUnmount=="function")try{Xe.onCommitFiberUnmount(De,i)}catch{}switch(i.tag){case 26:We||Gn(i,e),Bi(t,e,i),i.memoizedState?i.memoizedState.count--:i.stateNode&&!We&&(i=i.stateNode,i.parentNode.removeChild(i));break;case 27:We||Gn(i,e),Qo(i);var r=dn,l=ri;fr(i.type)&&(dn=i.stateNode,ri=!1),Bi(t,e,i),S_(i.stateNode,i.type,i.memoizedProps),dn=r,ri=l;break;case 5:We||Gn(i,e),Qo(i);case 6:if(i.tag===6&&Qo(i),r=dn,l=ri,dn=null,Bi(t,e,i),dn=r,ri=l,dn!==null)if(ri)try{(dn.nodeType===9?dn.body:dn.nodeName==="HTML"?dn.ownerDocument.body:dn).removeChild(i.stateNode),ge=!0}catch(u){Qe(i,e,u)}else try{dn.removeChild(i.stateNode),ge=!0}catch(u){Qe(i,e,u)}break;case 18:dn!==null&&(ri?(t=dn,s_(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,i.stateNode),Zs(t)):s_(dn,i.stateNode));break;case 4:r=dn,l=ri,dn=i.stateNode.containerInfo,ri=!0,Bi(t,e,i),dn=r,ri=l;break;case 0:case 11:case 14:case 15:ar(2,i,e),We||ar(4,i,e),Bi(t,e,i);break;case 1:We||(Gn(i,e),r=i.stateNode,typeof r.componentWillUnmount=="function"&&iv(i,e,r)),Bi(t,e,i);break;case 21:Bi(t,e,i);break;case 22:We=(r=We)||i.memoizedState!==null,Bi(t,e,i),We=r;break;case 30:Gn(i,e),Bi(t,e,i);break;case 7:We||Gn(i,e),Bi(t,e,i);break;default:Bi(t,e,i)}}function _v(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Zs(t)}catch(i){Qe(e,e.return,i)}}}function xv(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Zs(t)}catch(i){Qe(e,e.return,i)}}function nS(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new dv),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new dv),e;default:throw Error(s(435,t.tag))}}function bc(t,e){var i=nS(t);e.forEach(function(r){if(!i.has(r)){i.add(r);var l=pS.bind(null,t,r);r.then(l,l)}})}function Qn(t,e,i){var r=e.deletions;if(r!==null)for(var l=0;l<r.length;l++){var u=r[l],v=t,E=e,z=E;t:for(;z!==null;){switch(z.tag){case 27:if(fr(z.type)){dn=z.stateNode,ri=!1;break t}break;case 5:dn=z.stateNode,ri=!1;break t;case 3:case 4:dn=z.stateNode.containerInfo,ri=!0;break t}z=z.return}if(dn===null)throw Error(s(160));vv(v,E,u),dn=null,ri=!1,v=u.alternate,v!==null&&(v.return=null),u.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)yv(e,t,i),e=e.sibling}var Fi=null;function yv(t,e,i){var r=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(l&4&&(r=t.updateQueue,r=r!==null?r.events:null,r!==null))for(var u=0;u<r.length;u++){var v=r[u];v.ref.impl=v.nextImpl}Qn(e,t,i),Jn(t),l&4&&(ar(3,t,t.return),Ko(3,t),ar(5,t,t.return));break;case 1:Qn(e,t,i),Jn(t),l&512&&(We||r===null||Gn(r,r.return)),l&64&&zn&&(t=t.updateQueue,t!==null&&(e=t.callbacks,e!==null&&(i=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=i===null?e:i.concat(e))));break;case 26:if(u=Fi,Qn(e,t,i),Jn(t),l&512&&(We||r===null||Gn(r,r.return)),l&4)if(l=r!==null?r.memoizedState:null,i=t.memoizedState,r===null)if(i===null)if(t.stateNode===null)if(zn)t.stateNode=i_(t.type,t.memoizedProps,e.containerInfo,t);else{t:{e=t.type,i=t.memoizedProps,l=u.ownerDocument||u;e:switch(e){case"title":r=l.getElementsByTagName("title")[0],(!r||r[Jt]||r[ee]||r.namespaceURI==="http://www.w3.org/2000/svg"||r.hasAttribute("itemprop"))&&(r=l.createElement(e),l.head.insertBefore(r,l.querySelector("head > title"))),Vn(r,e,i),r[ee]=t,me(r),e=r;break t;case"link":if(u=R_("link","href",l).get(e+(i.href||""))){for(v=0;v<u.length;v++)if(r=u[v],r.getAttribute("href")===(i.href==null||i.href===""?null:i.href)&&r.getAttribute("rel")===(i.rel==null?null:i.rel)&&r.getAttribute("title")===(i.title==null?null:i.title)&&r.getAttribute("crossorigin")===(i.crossOrigin==null?null:i.crossOrigin)){u.splice(v,1);break e}}r=l.createElement(e),Vn(r,e,i),l.head.appendChild(r);break;case"meta":if(u=R_("meta","content",l).get(e+(i.content||""))){for(v=0;v<u.length;v++)if(r=u[v],r.getAttribute("content")===(i.content==null?null:""+i.content)&&r.getAttribute("name")===(i.name==null?null:i.name)&&r.getAttribute("property")===(i.property==null?null:i.property)&&r.getAttribute("http-equiv")===(i.httpEquiv==null?null:i.httpEquiv)&&r.getAttribute("charset")===(i.charSet==null?null:i.charSet)){u.splice(v,1);break e}}r=l.createElement(e),Vn(r,e,i),l.head.appendChild(r);break;default:throw Error(s(468,e))}r[ee]=t,me(r),e=r}t.stateNode=e}else zn||$h(u,t.type,t.stateNode);else t.stateNode=A_(u,i,t.memoizedProps);else l!==i?(l===null?(e=r.stateNode,e===null||We||e.parentNode.removeChild(e)):l.count--,i===null?zn||$h(u,t.type,t.stateNode):A_(u,i,t.memoizedProps)):i===null&&t.stateNode!==null&&ah(t,t.memoizedProps,r.memoizedProps);break;case 27:Qn(e,t,i),Jn(t),l&512&&(We||r===null||Gn(r,r.return)),r!==null&&l&4&&ah(t,t.memoizedProps,r.memoizedProps);break;case 5:if(u=oa,oa=!1,Qn(e,t,i),oa=u,Jn(t),l&512&&(We||r===null||Gn(r,r.return)),t.flags&32){e=t.stateNode;try{hs(e,""),ge=!0}catch(st){Qe(t,t.return,st)}}l&4&&t.stateNode!=null&&(e=t.memoizedProps,ah(t,e,r!==null?r.memoizedProps:e)),l&1024&&(hh=!0);break;case 6:if(Qn(e,t,i),Jn(t),l&4){if(t.stateNode===null)throw Error(s(162));e=t.memoizedProps,i=t.stateNode;try{i.nodeValue=e,ge=!0}catch(st){Qe(t,t.return,st)}}break;case 3:if(ge=!1,Hc=null,u=Fi,Fi=ol(e.containerInfo),Qn(e,t,i),Fi=u,Jn(t),l&4&&r!==null&&r.memoizedState.isDehydrated)try{Zs(e.containerInfo)}catch(st){Qe(t,t.return,st)}hh&&(hh=!1,Sv(t)),ge=!1;break;case 4:l=oa,oa=zn,r=wn(),u=Fi,Fi=ol(t.stateNode.containerInfo),Qn(e,t,i),Jn(t),Fi=u,ge&&Jo&&(Ec=!0),ge=r,oa=l;break;case 12:Qn(e,t,i),Jn(t);break;case 31:Qn(e,t,i),Jn(t),l&4&&(e=t.updateQueue,e!==null&&(t.updateQueue=null,bc(t,e)));break;case 13:Qn(e,t,i),Jn(t),t.child.flags&8192&&t.memoizedState!==null!=(r!==null&&r.memoizedState!==null)&&(Cc=F()),l&4&&(e=t.updateQueue,e!==null&&(t.updateQueue=null,bc(t,e)));break;case 22:u=t.memoizedState!==null,v=r!==null&&r.memoizedState!==null;var E=zn,z=We,J=oa;zn=E||u,oa=J||u,We=z||v,Qn(e,t,i),We=z,oa=J,zn=E,Jn(t),l&8192&&(e=t.stateNode,e._visibility=u?e._visibility&-2:e._visibility|1,!u||r===null||v||zn||We||(e=v||We,i=zn,r=We,zn=u||zn,We=e,rr(t,2),zn=i,We=r),!u&&oa||ph(t,u)),l&4&&(e=t.updateQueue,e!==null&&(i=e.retryQueue,i!==null&&(e.retryQueue=null,bc(t,i))));break;case 19:Qn(e,t,i),Jn(t),l&4&&(e=t.updateQueue,e!==null&&(t.updateQueue=null,bc(t,e)));break;case 30:l&512&&(We||r===null||Gn(r,r.return)),l=wn(),u=Jo,v=(i&335544064)===i,E=t.memoizedProps,Jo=v&&_a(E.default,E.update)!=="none",Qn(e,t,i),Jn(t),v&&r!==null&&ge&&(t.flags|=4),Jo=u,ge=l;break;case 21:break;case 7:l&512&&(We||r===null||Gn(r,r.return)),r&&r.stateNode!==null&&(r.stateNode._fragmentFiber=t);default:Qn(e,t,i),Jn(t)}}function Jn(t){var e=t.flags;if(e&2){try{for(var i,r=t.return;r!==null;){if(rv(r)){i=r;break}r=r.return}r=null;for(var l=t.return;l!==null;){if(nh(l)){var u=l.stateNode;r===null?r=[u]:r.push(u)}if(eh(l))break;l=l.return}var v=r;if(i==null)throw Error(s(160));switch(i.tag){case 27:var E=i.stateNode,z=rh(t);xc(t,z,E,v);break;case 5:var J=i.stateNode;i.flags&32&&(hs(J,""),i.flags&=-33);var st=rh(t);xc(t,st,J,v);break;case 3:case 4:var Mt=i.stateNode.containerInfo,Y=rh(t);sh(t,Y,Mt,v);break;default:throw Error(s(161))}}catch(nt){Qe(t,t.return,nt)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function Sv(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;Sv(e),e.tag===5&&e.flags&1024&&(e=e.stateNode,Ws=!0,e.reset(),Ws=!1),t=t.sibling}}function Us(t,e){if(e.subtreeFlags&9270)for(e=e.child;e!==null;)Mv(e,t),e=e.sibling;else hv(e)}function Mv(t,e){var i=t.alternate;if(i===null)oh(t,!1);else switch(t.tag){case 3:if(dh=la=!1,lv(),Us(e,t),!la&&!Ec){if(t=ra,t!==null)for(var r=0;r<t.length;r+=3){i=t[r];var l=t[r+1];c_(i,t[r+2]),i=i.ownerDocument.documentElement,i!==null&&i.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+l+")"})}t=e.containerInfo,t=t.nodeType===9?t.documentElement:t.ownerDocument.documentElement,t!==null&&t.style.viewTransitionName===""&&(t.style.viewTransitionName="none",t.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),t.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),dh=!0}ra=null;break;case 5:Us(e,t);break;case 4:r=la,la=!1,Us(e,t),la&&(Ec=!0),la=r;break;case 22:t.memoizedState===null&&(i.memoizedState!==null?oh(t,!1):Us(e,t));break;case 30:r=la,l=lv(),la=!1,Us(e,t),la&&(t.flags|=4);var u=t.memoizedProps,v=t.stateNode;e=va(u,v),v=va(i.memoizedProps,v);var E=_a(u.default,u.update);E==="none"?e=!1:(u=i.memoizedState,i.memoizedState=null,i=t.child,ai=0,e=fh(t,i,e,v,E,u,!0),ai!==(u===null?0:u.length)&&(t.flags|=32)),(t.flags&4)!==0&&e?(Bs(t,t.memoizedProps.onUpdate),ra=l):l!==null&&(l.push.apply(l,ra),ra=l),la=(t.flags&32)!==0?!0:r;break;default:Us(e,t)}}function ca(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)pv(t,e.alternate,e),e=e.sibling}function rr(t,e){for(t=t.child;t!==null;){var i=t,r=e;switch(i.tag){case 0:case 11:case 14:case 15:ar(4,i,i.return),rr(i,r);break;case 1:Gn(i,i.return);var l=i.stateNode;typeof l.componentWillUnmount=="function"&&iv(i,i.return,l),rr(i,r);break;case 27:(r&2)!==0&&S_(i.stateNode,i.type,i.memoizedProps);case 5:Gn(i,i.return),i.tag!==5&&i.tag!==27||Qo(i),rr(i,r);break;case 6:Qo(i);break;case 26:Gn(i,i.return),l=i.stateNode,i.memoizedState!==null||l===null||We||l.parentNode.removeChild(l),rr(i,r);break;case 22:i.memoizedState===null&&rr(i,r);break;case 30:Gn(i,i.return),rr(i,r);break;case 7:Gn(i,i.return);default:rr(i,r)}t=t.sibling}}function Hi(t,e,i){for(i=(e.subtreeFlags&8772)!==0?i:i&-2,e=e.child;e!==null;){var r=e.alternate,l=t,u=e,v=u.flags,E=(i&1)!==0;switch(u.tag){case 0:case 11:case 15:Hi(l,u,i),Ko(4,u);break;case 1:if(Hi(l,u,i),r=u,l=r.stateNode,typeof l.componentDidMount=="function")try{l.componentDidMount()}catch(st){Qe(r,r.return,st)}if(r=u,l=r.updateQueue,l!==null){var z=r.stateNode;try{var J=l.shared.hiddenCallbacks;if(J!==null)for(l.shared.hiddenCallbacks=null,l=0;l<J.length;l++)km(J[l],z)}catch(st){Qe(r,r.return,st)}}E&&v&64&&nv(u),aa(u,u.return);break;case 27:(i&2)!==0&&sv(u);case 5:u.tag!==5&&u.tag!==27||av(u),Hi(l,u,i),E&&r===null&&v&4&&ih(u),aa(u,u.return);break;case 6:av(u);break;case 26:z=u.stateNode,u.memoizedState!==null||z===null||zn||$h(ol(z.ownerDocument),u.type,z),Hi(l,u,i),E&&r===null&&v&4&&ih(u),aa(u,u.return);break;case 12:Hi(l,u,i);break;case 31:Hi(l,u,i),E&&v&4&&_v(l,u);break;case 13:Hi(l,u,i),E&&v&4&&xv(l,u);break;case 22:u.memoizedState===null&&Hi(l,u,i),aa(u,u.return);break;case 30:Hi(l,u,i),aa(u,u.return);break;case 7:aa(u,u.return);default:Hi(l,u,i)}e=e.sibling}}function gh(t,e){var i=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==i&&(t!=null&&t.refCount++,i!=null&&Io(i))}function vh(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Io(t))}function wi(t,e,i,r){var l=(i&335544064)===i;if(e.subtreeFlags&(l?10262:10256))for(e=e.child;e!==null;)Ev(t,e,i,r),e=e.sibling;else l&&fv(e)}function Ev(t,e,i,r){var l=(i&335544064)===i;l&&e.alternate===null&&e.return!==null&&e.return.alternate!==null&&Mc(e);var u=e.flags;switch(e.tag){case 0:case 11:case 15:wi(t,e,i,r),u&2048&&Ko(9,e);break;case 1:wi(t,e,i,r);break;case 3:wi(t,e,i,r),l&&dh&&(t=t.containerInfo,t=t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,t.style.viewTransitionName==="root"&&(t.style.viewTransitionName=""),t=t.ownerDocument.documentElement,t!==null&&t.style.viewTransitionName==="none"&&(t.style.viewTransitionName="")),u&2048&&(u=null,e.alternate!==null&&(u=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==u&&(e.refCount++,u!=null&&Io(u)));break;case 12:if(u&2048){wi(t,e,i,r),u=e.stateNode;try{var v=e.memoizedProps,E=v.id,z=v.onPostCommit;typeof z=="function"&&z(E,e.alternate===null?"mount":"update",u.passiveEffectDuration,-0)}catch(J){Qe(e,e.return,J)}}else wi(t,e,i,r);break;case 31:wi(t,e,i,r);break;case 13:wi(t,e,i,r);break;case 23:break;case 22:v=e.stateNode,E=e.alternate,e.memoizedState!==null?(l&&E!==null&&E.memoizedState===null&&Mc(E),v._visibility&2?wi(t,e,i,r):$o(t,e)):(l&&E!==null&&E.memoizedState!==null&&Mc(e),v._visibility&2?wi(t,e,i,r):(v._visibility|=2,Ns(t,e,i,r,(e.subtreeFlags&10256)!==0||!1))),u&2048&&gh(E,e);break;case 24:wi(t,e,i,r),u&2048&&vh(e.alternate,e);break;case 30:l&&(u=e.alternate,u!==null&&(sa(u.child,!0),sa(e.child,!0))),wi(t,e,i,r);break;default:wi(t,e,i,r)}}function Ns(t,e,i,r,l){for(l=l&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var u=t,v=e,E=i,z=r,J=v.flags;switch(v.tag){case 0:case 11:case 15:Ns(u,v,E,z,l),Ko(8,v);break;case 23:break;case 22:var st=v.stateNode;v.memoizedState!==null?st._visibility&2?Ns(u,v,E,z,l):$o(u,v):(st._visibility|=2,Ns(u,v,E,z,l)),l&&J&2048&&gh(v.alternate,v);break;case 24:Ns(u,v,E,z,l),l&&J&2048&&vh(v.alternate,v);break;default:Ns(u,v,E,z,l)}e=e.sibling}}function $o(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var i=t,r=e,l=r.flags;switch(r.tag){case 22:$o(i,r),l&2048&&gh(r.alternate,r);break;case 24:$o(i,r),l&2048&&vh(r.alternate,r);break;default:$o(i,r)}e=e.sibling}}var Xr=8192;function kr(t,e,i){if(t.subtreeFlags&Xr)for(t=t.child;t!==null;)Tv(t,e,i),t=t.sibling}function Tv(t,e,i){switch(t.tag){case 26:kr(t,e,i),t.flags&Xr&&(t.memoizedState!==null?lM(i,Fi,t.memoizedState,t.memoizedProps):(t=t.stateNode,(e&335544128)===e&&U_(i,t)));break;case 5:kr(t,e,i),t.flags&Xr&&(t=t.stateNode,(e&335544128)===e&&U_(i,t));break;case 3:case 4:var r=Fi;Fi=ol(t.stateNode.containerInfo),kr(t,e,i),Fi=r;break;case 22:t.memoizedState===null&&(r=t.alternate,r!==null&&r.memoizedState!==null?(r=Xr,Xr=16777216,kr(t,e,i),Xr=r):kr(t,e,i));break;case 30:if((t.flags&Xr)!==0&&(r=t.memoizedProps.name,r!=null&&r!=="auto")){var l=t.stateNode;l.paired=null,mi===null&&(mi=new Map),mi.set(r,l)}kr(t,e,i);break;default:kr(t,e,i)}}function bv(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function tl(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var i=0;i<e.length;i++){var r=e[i];Pn=r,Rv(r,t)}bv(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Av(t),t=t.sibling}function Av(t){switch(t.tag){case 0:case 11:case 15:tl(t),t.flags&2048&&ar(9,t,t.return);break;case 3:tl(t);break;case 12:tl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Ac(t)):tl(t);break;default:tl(t)}}function Ac(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var i=0;i<e.length;i++){var r=e[i];Pn=r,Rv(r,t)}bv(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:ar(8,e,e.return),Ac(e);break;case 22:i=e.stateNode,i._visibility&2&&(i._visibility&=-3,Ac(e));break;default:Ac(e)}t=t.sibling}}function Rv(t,e){for(;Pn!==null;){var i=Pn;switch(i.tag){case 0:case 11:case 15:ar(8,i,e);break;case 23:case 22:if(i.memoizedState!==null&&i.memoizedState.cachePool!==null){var r=i.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:Io(i.memoizedState.cache)}if(r=i.child,r!==null)r.return=i,Pn=r;else t:for(i=t;Pn!==null;){r=Pn;var l=r.sibling,u=r.return;if(gv(r),r===i){Pn=null;break t}if(l!==null){l.return=u,Pn=l;break t}Pn=u}}}var iS={getCacheForType:function(t){var e=Bn(Tn),i=e.data.get(t);return i===void 0&&(i=t(),e.data.set(t,i)),i},cacheSignal:function(){return Bn(Tn).controller.signal}},aS=typeof WeakMap=="function"?WeakMap:Map,qe=0,nn=null,Le=null,Ie=0,Ke=0,gi=null,sr=!1,Ls=!1,_h=!1,Ra=0,vn=0,or=0,jr=0,Rc=0,vi=0,Os=0,el=null,si=null,xh=!1,Cc=0,Cv=0,wc=1/0,Dc=null,lr=null,pn=0,Gi=null,qr=null,ua=0,yh=0,Sh=null,wv=null,zs=null,Ps=null,Is=null,nl=0,Uc=null;function _i(){return(qe&2)!==0&&Ie!==0?Ie&-Ie:Ct.T!==null?Uh():Zt()}function Dv(){if(vi===0)if((Ie&536870912)===0||Ce){var t=Ji;Ji<<=1,(Ji&3932160)===0&&(Ji=262144),vi=t}else vi=536870912;return t=Fn.current,t!==null&&(t.flags|=32),vi}function Bs(t,e){if(e!=null){var i=t.stateNode,r=i.ref;r===null&&(r=i.ref=u_(va(t.memoizedProps,i))),Ps===null&&(Ps=[]),Ps.push(e.bind(null,r))}}function oi(t,e,i){(t===nn&&(Ke===2||Ke===9)||t.cancelPendingCommit!==null)&&(Fs(t,0),cr(t,Ie,vi,!1)),w(t,i),((qe&2)===0||t!==nn)&&(t===nn&&((qe&2)===0&&(jr|=i),vn===4&&cr(t,Ie,vi,!1)),fa(t))}function Uv(t,e,i){if((qe&6)!==0)throw Error(s(327));var r=!i&&(e&127)===0&&(e&t.expiredLanes)===0||$i(t,e),l=r?oS(t,e):Eh(t,e,!0),u=r;do{if(l===0){Ls&&!r&&cr(t,e,0,!1);break}else{if(i=t.current.alternate,u&&!rS(i)){l=Eh(t,e,!1),u=!1;continue}if(l===2){if(u=e,t.errorRecoveryDisabledLanes&u)var v=0;else v=t.pendingLanes&-536870913,v=v!==0?v:v&536870912?536870912:0;if(v!==0){e=v;t:{var E=t;l=el;var z=E.current.memoizedState.isDehydrated;if(z&&(Fs(E,v).flags|=256),v=Eh(E,v,!1),v!==2&&v!==6){if(_h&&!z){E.errorRecoveryDisabledLanes|=u,jr|=u,l=4;break t}u=si,si=l,u!==null&&(si===null?si=u:si.push.apply(si,u))}l=v}if(u=!1,l!==2)continue}}if(l===1){Fs(t,0),cr(t,e,0,!0);break}t:{switch(r=t,u=l,u){case 0:case 1:throw Error(s(345));case 4:if((e&4194048)!==e&&(e&62914560)!==e)break;case 6:cr(r,e,vi,!sr);break t;case 2:si=null;break;case 3:case 5:break;default:throw Error(s(329))}if((e&62914560)===e&&(l=Cc+300-F(),10<l)){if(cr(r,e,vi,!sr),ei(r,0,!0)!==0)break t;ua=e,r.timeoutHandle=Vh(Nv.bind(null,r,i,si,Dc,xh,e,vi,jr,Os,sr,u,"Throttled",-0,0),l);break t}Nv(r,i,si,Dc,xh,e,vi,jr,Os,sr,u,null,-0,0)}}break}while(!0);fa(t)}function Nv(t,e,i,r,l,u,v,E,z,J,st,Mt,Y,nt){t.timeoutHandle=-1;var Bt=e.subtreeFlags,$t=(u&335544064)===u;if(Mt=null,($t||Bt&8192||(Bt&16785408)===16785408)&&(Mt={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:ea},mi=null,Tv(e,u,Mt),$t&&(Bt=Mt,$t=t.containerInfo,$t=($t.nodeType===9?$t:$t.ownerDocument).__reactViewTransition,$t!=null&&(Bt.count++,Bt.waitingForViewTransition=!0,Bt=ul.bind(Bt),$t.finished.then(Bt,Bt))),Bt=(u&62914560)===u?Cc-F():(u&4194048)===u?Cv-F():0,Bt=cM(Mt,Bt),Bt!==null)){ua=u,t.cancelPendingCommit=Bt(Hv.bind(null,t,e,u,i,r,l,v,E,z,J,st,Mt,null,Y,nt)),cr(t,u,v,!J);return}Hv(t,e,u,i,r,l,v,E,z,J,st,Mt)}function rS(t){for(var e=t;;){var i=e.tag;if((i===0||i===11||i===15)&&e.flags&16384&&(i=e.updateQueue,i!==null&&(i=i.stores,i!==null)))for(var r=0;r<i.length;r++){var l=i[r],u=l.getSnapshot;l=l.value;try{if(!di(u(),l))return!1}catch{return!1}}if(i=e.child,e.subtreeFlags&16384&&i!==null)i.return=e,e=i;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function cr(t,e,i,r){e=ka(t,e),e&=~Rc,e&=~jr,t.suspendedLanes|=e,t.pingedLanes&=~e,r&&(t.warmLanes|=e),r=t.expirationTimes;for(var l=e;0<l;){var u=31-fn(l),v=1<<u;r[u]=-1,l&=~v}i!==0&&lt(t,i,e)}function Nc(){return(qe&6)===0?(il(0),!1):!0}function Mh(){if(Le!==null){if(Ke===0)var t=Le.return;else t=Le,Sa=Lr=null,Df(t),bs=null,Ho=0,t=Le;for(;t!==null;)ev(t.alternate,t),t=t.return;Le=null}}function Fs(t,e){var i=t.timeoutHandle;return i!==-1&&(t.timeoutHandle=-1,wS(i)),i=t.cancelPendingCommit,i!==null&&(t.cancelPendingCommit=null,i()),ua=0,Mh(),nn=t,Le=i=xa(t.current,null),Ie=e,Ke=0,gi=null,sr=!1,Ls=$i(t,e),_h=!1,Os=vi=Rc=jr=or=vn=0,si=el=null,xh=!1,Ra=ka(t,e),Hl(),i}function Lv(t,e){Me=null,Ct.H=fc,e===Ts||e===Ql?(e=Hm(),Ke=3):e===vf?(e=Hm(),Ke=4):Ke=e===jf?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,gi=e,Le===null&&(vn=1,hc(t,bi(e,t.current)))}function Ov(){var t=Fn.current;return t===null?!0:(Ie&4194048)===Ie?jn===null:(Ie&62914560)===Ie||(Ie&536870912)!==0?t===jn:!1}function zv(){var t=Ct.H;return Ct.H=fc,t===null?fc:t}function Pv(){var t=Ct.A;return Ct.A=iS,t}function Lc(){vn=4,sr||(Ie&4194048)!==Ie&&Fn.current!==null||(Ls=!0),(or&134217727)===0&&(jr&134217727)===0||nn===null||cr(nn,Ie,vi,!1)}function Eh(t,e,i){var r=qe;qe|=2;var l=zv(),u=Pv();(nn!==t||Ie!==e)&&(Dc=null,Fs(t,e)),e=!1;var v=vn;t:do try{if(Ke!==0&&Le!==null){var E=Le,z=gi;switch(Ke){case 8:Mh(),v=6;break t;case 3:case 2:case 9:case 6:Fn.current===null&&(e=!0);var J=Ke;if(Ke=0,gi=null,Hs(t,E,z,J),i&&Ls){v=0;break t}break;default:J=Ke,Ke=0,gi=null,Hs(t,E,z,J)}}sS(),v=vn;break}catch(st){Lv(t,st)}while(!0);return e&&t.shellSuspendCounter++,Sa=Lr=null,qe=r,Ct.H=l,Ct.A=u,Le===null&&(nn=null,Ie=0,Hl()),v}function sS(){for(;Le!==null;)Iv(Le)}function oS(t,e){var i=qe;qe|=2;var r=zv(),l=Pv();nn!==t||Ie!==e?(Dc=null,wc=F()+500,Fs(t,e)):Ls=$i(t,e);t:do try{if(Ke!==0&&Le!==null){e=Le;var u=gi;e:switch(Ke){case 1:Ke=0,gi=null,Hs(t,e,u,1);break;case 2:case 9:if(Bm(u)){Ke=0,gi=null,Bv(e);break}e=function(){Ke!==2&&Ke!==9||nn!==t||(Ke=7),fa(t)},u.then(e,e);break t;case 3:Ke=7;break t;case 4:Ke=5;break t;case 7:Bm(u)?(Ke=0,gi=null,Bv(e)):(Ke=0,gi=null,Hs(t,e,u,7));break;case 5:var v=null;switch(Le.tag){case 26:v=Le.memoizedState;case 5:case 27:var E=Le;if(v?w_(v):E.stateNode.complete){Ke=0,gi=null;var z=E.sibling;if(z!==null)Le=z;else{var J=E.return;J!==null?(Le=J,Oc(J)):Le=null}break e}}Ke=0,gi=null,Hs(t,e,u,5);break;case 6:Ke=0,gi=null,Hs(t,e,u,6);break;case 8:Mh(),vn=6;break t;default:throw Error(s(462))}}lS();break}catch(st){Lv(t,st)}while(!0);return Sa=Lr=null,Ct.H=r,Ct.A=l,qe=i,Le!==null?0:(nn=null,Ie=0,Hl(),vn)}function lS(){for(;Le!==null&&!xe();)Iv(Le)}function Iv(t){var e=$g(t.alternate,t,Ra);t.memoizedProps=t.pendingProps,e===null?Oc(t):Le=e}function Bv(t){var e=t,i=e.alternate;switch(e.tag){case 15:case 0:e=qg(i,e,e.pendingProps,e.type,void 0,Ie);break;case 11:e=qg(i,e,e.pendingProps,e.type.render,e.ref,Ie);break;case 5:Df(e);var r=e;r===On&&(Ce?(ql(r),r.tag===5&&r.stateNode!=null&&(on=r.stateNode)):(ql(r),Ce=!0));default:ev(i,e),e=Le=Rm(e,Ra),e=$g(i,e,Ra)}t.memoizedProps=t.pendingProps,e===null?Oc(t):Le=e}function Hs(t,e,i,r){Sa=Lr=null,Df(e),bs=null,Ho=0;var l=e.return;try{if(Zy(t,l,e,i,Ie)){vn=1,hc(t,bi(i,t.current)),Le=null;return}}catch(u){if(l!==null)throw Le=l,u;vn=1,hc(t,bi(i,t.current)),Le=null;return}e.flags&32768?(Ce||r===1?t=!0:Ls||(Ie&536870912)!==0?t=!1:(sr=t=!0,(r===2||r===9||r===3||r===6)&&(r=Fn.current,r!==null&&r.tag===13&&(r.flags|=16384))),Fv(e,t)):Oc(e)}function Oc(t){var e=t;do{if((e.flags&32768)!==0){Fv(e,sr);return}t=e.return;var i=$y(e.alternate,e,Ra);if(i!==null){Le=i;return}if(e=e.sibling,e!==null){Le=e;return}Le=e=t}while(e!==null);vn===0&&(vn=5)}function Fv(t,e){do{var i=tS(t.alternate,t);if(i!==null){i.flags&=32767,Le=i;return}if(i=t.return,i!==null&&(i.flags|=32768,i.subtreeFlags=0,i.deletions=null),!e&&(t=t.sibling,t!==null)){Le=t;return}Le=t=i}while(t!==null);vn=6,Le=null}function Hv(t,e,i,r,l,u,v,E,z,J,st,Mt){t.cancelPendingCommit=null;do zc();while(pn!==0);if((qe&6)!==0)throw Error(s(327));if(e!==null){if(e===t.current)throw Error(s(177));t===nn&&(Le=nn=null,Ie=0),qr=e,Gi=t,ua=i,Sh=l,wv=r,cS(t,e,i,v,E,z,Mt)}}function cS(t,e,i,r,l,u,v){var E=e.lanes|e.childLanes;if(yh=E,E|=af,Q(t,i,E,r,l,u),Ps=null,(i&335544064)===i?(Is=Iy(t),r=10262):(Is=null,r=10256),(e.subtreeFlags&r)!==0||(e.flags&r)!==0?(t.callbackNode=null,t.callbackPriority=0,mS(zt,function(){return Rh(),null})):(t.callbackNode=null,t.callbackPriority=0),yc=!1,r=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||r){r=Ct.T,Ct.T=null,l=Ut.p,Ut.p=2,u=qe,qe|=4;try{eS(t,e,i)}finally{qe=u,Ut.p=l,Ct.T=r}}pn=1,yc?zs=zS(v,t.containerInfo,Is,Th,bh,fS,Ah,Rh,uS):(Th(),bh(),Ah())}function uS(t){if(pn!==0){var e=Gi.onRecoverableError;e(t,{componentStack:null})}}function fS(){pn===3&&(pn=0,Mv(qr,Gi),pn=4)}function Th(){if(pn===1){pn=0;var t=Gi,e=qr,i=ua,r=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||r){r=Ct.T,Ct.T=null;var l=Ut.p;Ut.p=2;var u=qe;qe|=4;try{Jo=Ec=!1,yv(e,t,i),i=Fh;var v=vm(t.containerInfo),E=i.focusedElem,z=i.selectionRange;if(v!==E&&E&&E.ownerDocument&&gm(E.ownerDocument.documentElement,E)){if(z!==null&&Ju(E)){var J=z.start,st=z.end;if(st===void 0&&(st=J),"selectionStart"in E)E.selectionStart=J,E.selectionEnd=Math.min(st,E.value.length);else{var Mt=E.ownerDocument||document,Y=Mt&&Mt.defaultView||window;if(Y.getSelection){var nt=Y.getSelection(),Bt=E.textContent.length,$t=Math.min(z.start,Bt),Ee=z.end===void 0?$t:Math.min(z.end,Bt);!nt.extend&&$t>Ee&&(v=Ee,Ee=$t,$t=v);var K=mm(E,$t),G=mm(E,Ee);if(K&&G&&(nt.rangeCount!==1||nt.anchorNode!==K.node||nt.anchorOffset!==K.offset||nt.focusNode!==G.node||nt.focusOffset!==G.offset)){var tt=Mt.createRange();tt.setStart(K.node,K.offset),nt.removeAllRanges(),$t>Ee?(nt.addRange(tt),nt.extend(G.node,G.offset)):(tt.setEnd(G.node,G.offset),nt.addRange(tt))}}}}for(Mt=[],nt=E;nt=nt.parentNode;)nt.nodeType===1&&Mt.push({element:nt,left:nt.scrollLeft,top:nt.scrollTop});for(typeof E.focus=="function"&&E.focus(),E=0;E<Mt.length;E++){var yt=Mt[E];yt.element.scrollLeft=yt.left,yt.element.scrollTop=yt.top}}Ws=!!Bh,Fh=Bh=null}finally{qe=u,Ut.p=l,Ct.T=r}}t.current=e,pn=2}}function bh(){if(pn===2){pn=0;var t=Gi,e=qr,i=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||i){i=Ct.T,Ct.T=null;var r=Ut.p;Ut.p=2;var l=qe;qe|=4;try{pv(t,e.alternate,e)}finally{qe=l,Ut.p=r,Ct.T=i}}pn=3}}function Ah(){if(pn===4||pn===3){pn=0;var t=zs;zs=null,we();var e=Gi,i=qr,r=ua,l=wv,u=(r&335544064)===r?10262:10256;if((i.subtreeFlags&u)!==0||(i.flags&u)!==0?pn=5:(pn=0,qr=Gi=null,Gv(e,e.pendingLanes)),u=e.pendingLanes,u===0&&(lr=null),Pt(r),i=i.stateNode,Xe&&typeof Xe.onCommitFiberRoot=="function")try{Xe.onCommitFiberRoot(De,i,void 0,(i.current.flags&128)===128)}catch{}if(l!==null){i=Ct.T,u=Ut.p,Ut.p=2,Ct.T=null;try{for(var v=e.onRecoverableError,E=0;E<l.length;E++){var z=l[E];v(z.value,{componentStack:z.stack})}}finally{Ct.T=i,Ut.p=u}}if(l=Ps,v=Is,Is=null,l!==null&&(Ps=null,v===null&&(v=[]),t!==null))for(z=0;z<l.length;z++)i=(0,l[z])(v),i!==void 0&&t.finished.finally(i);(ua&3)!==0&&zc(),fa(e),u=e.pendingLanes,(r&261930)!==0&&(u&42)!==0?e===Uc?nl++:(nl=0,Uc=e):(nl=0,Uc=null),il(0)}}function Gv(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Io(e)))}function zc(){return zs!==null&&(zs.skipTransition(),zs=null),Th(),bh(),Ah(),Rh()}function Rh(){if(pn!==5)return!1;var t=Gi,e=yh;yh=0;var i=Pt(ua),r=Ct.T,l=Ut.p;try{Ut.p=32>i?32:i,Ct.T=null,i=Sh,Sh=null;var u=Gi,v=ua;if(pn=0,qr=Gi=null,ua=0,(qe&6)!==0)throw Error(s(331));var E=qe;if(qe|=4,Av(u.current),Ev(u,u.current,v,i),qe=E,il(0,!1),Xe&&typeof Xe.onPostCommitFiberRoot=="function")try{Xe.onPostCommitFiberRoot(De,u)}catch{}return!0}finally{Ut.p=l,Ct.T=r,Gv(t,e)}}function Vv(t,e,i){e=bi(i,e),e=kf(t.stateNode,e,2),t=tr(t,e,2),t!==null&&(w(t,2),fa(t))}function Qe(t,e,i){if(t.tag===3)Vv(t,t,i);else for(;e!==null;){if(e.tag===3){Vv(e,t,i);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(lr===null||!lr.has(r))){t=bi(i,t),i=Bg(2),r=tr(e,i,2),r!==null&&(Fg(i,r,e,t),w(r,2),fa(r));break}}e=e.return}}function Ch(t,e,i){var r=t.pingCache;if(r===null){r=t.pingCache=new aS;var l=new Set;r.set(e,l)}else l=r.get(e),l===void 0&&(l=new Set,r.set(e,l));l.has(i)||(_h=!0,l.add(i),t=hS.bind(null,t,e,i),e.then(t,t))}function hS(t,e,i){var r=t.pingCache;r!==null&&r.delete(e),t.pingedLanes|=t.suspendedLanes&i,t.warmLanes&=~i,nn===t&&(Ie&i)===i&&((vn===4||vn===3&&(Ie&62914560)===Ie&&300>F()-Cc)&&(qe&2)===0?Fs(t,0):Rc|=i,Os===Ie&&(Os=0)),fa(t)}function Xv(t,e){e===0&&(e=cs()),t=Dr(t,e),t!==null&&(w(t,e),fa(t))}function dS(t){var e=t.memoizedState,i=0;e!==null&&(i=e.retryLane),Xv(t,i)}function pS(t,e){var i=0;switch(t.tag){case 31:case 13:var r=t.stateNode,l=t.memoizedState;l!==null&&(i=l.retryLane);break;case 19:r=t.stateNode;break;case 22:r=t.stateNode._retryCache;break;default:throw Error(s(314))}r!==null&&r.delete(e),Xv(t,i)}function mS(t,e){return jt(t,e)}var Gs=null,Vs=null,wh=!1,Pc=!1,Dh=!1,ur=0;function fa(t){t!==Vs&&t.next===null&&(Vs===null?Gs=Vs=t:Vs=Vs.next=t),Pc=!0,wh||(wh=!0,vS())}function il(t,e){if(!Dh&&Pc){Dh=!0;do for(var i=!1,r=Gs;r!==null;){if(t!==0){var l=r.pendingLanes;if(l===0)var u=0;else{var v=r.suspendedLanes,E=r.pingedLanes;u=(1<<31-fn(42|t)+1)-1,u&=l&~(v&~E),u=u&201326741?u&201326741|1:u?u|2:0}u!==0&&(i=!0,Yv(r,u))}else u=Ie,u=ei(r,r===nn?u:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),(u&3)===0||$i(r,u)||(i=!0,Yv(r,u));r=r.next}while(i);Dh=!1}}function gS(){kv()}function kv(){Pc=wh=!1;var t=0;ur!==0&&CS()&&(t=ur);for(var e=F(),i=null,r=Gs;r!==null;){var l=r.next,u=jv(r,e);u===0?(r.next=null,i===null?Gs=l:i.next=l,l===null&&(Vs=i)):(i=r,(t!==0||(u&3)!==0)&&(Pc=!0)),r=l}pn!==0&&pn!==5||il(t),ur!==0&&(ur=0)}function jv(t,e){for(var i=t.suspendedLanes,r=t.pingedLanes,l=t.expirationTimes,u=t.pendingLanes&-62914561;0<u;){var v=31-fn(u),E=1<<v,z=l[v];z===-1?((E&i)===0||(E&r)!==0)&&(l[v]=bo(E,e)):z<=e&&(t.expiredLanes|=E),u&=~E}if(e=nn,i=Ie,i=ei(t,t===e?i:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r=t.callbackNode,i===0||t===e&&(Ke===2||Ke===9)||t.cancelPendingCommit!==null)return r!==null&&r!==null&&ye(r),t.callbackNode=null,t.callbackPriority=0;if((i&3)===0||$i(t,i)){if(e=i&-i,e===t.callbackPriority)return e;switch(r!==null&&ye(r),Pt(i)){case 2:case 8:i=Tt;break;case 32:i=zt;break;case 268435456:i=fe;break;default:i=zt}return r=qv.bind(null,t),i=jt(i,r),t.callbackPriority=e,t.callbackNode=i,e}return r!==null&&r!==null&&ye(r),t.callbackPriority=2,t.callbackNode=null,2}function qv(t,e){if(pn!==0&&pn!==5)return t.callbackNode=null,t.callbackPriority=0,null;var i=t.callbackNode;if(zc()&&t.callbackNode!==i)return null;var r=Ie;return r=ei(t,t===nn?r:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),r===0?null:(Uv(t,r,e),jv(t,F()),t.callbackNode!=null&&t.callbackNode===i?qv.bind(null,t):null)}function Yv(t,e){if(zc())return null;Uv(t,e,!0)}function vS(){DS(function(){(qe&6)!==0?jt(ut,gS):kv()})}function Uh(){if(ur===0){var t=Pr;t===0&&(t=Mi,Mi<<=1,(Mi&261888)===0&&(Mi=256)),ur=t}return ur}function Wv(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Nl(t)}function _S(t,e,i,r,l){if(e==="submit"&&i&&i.stateNode===l){var u=Wv((l[Xt]||null).action),v=r.submitter;v&&(e=(e=v[Xt]||null)?Wv(e.formAction):v.getAttribute("formAction"),e!==null&&(u=e,v=null));var E=new Pl("action","action",null,r,l);t.push({event:E,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(ur!==0){var z=new FormData(l,v);Ff(i,{pending:!0,data:z,method:l.method,action:u},null,z)}}else typeof u=="function"&&(E.preventDefault(),z=new FormData(l,v),Ff(i,{pending:!0,data:z,method:l.method,action:u},u,z))},currentTarget:l}]})}}for(var Nh=0;Nh<nf.length;Nh++){var Lh=nf[Nh],xS=Lh.toLowerCase(),yS=Lh[0].toUpperCase()+Lh.slice(1);Ii(xS,"on"+yS)}Ii(ym,"onAnimationEnd"),Ii(Sm,"onAnimationIteration"),Ii(Mm,"onAnimationStart"),Ii("dblclick","onDoubleClick"),Ii("focusin","onFocus"),Ii("focusout","onBlur"),Ii(wy,"onTransitionRun"),Ii(Dy,"onTransitionStart"),Ii(Uy,"onTransitionCancel"),Ii(Em,"onTransitionEnd"),Ot("onMouseEnter",["mouseout","mouseover"]),Ot("onMouseLeave",["mouseout","mouseover"]),Ot("onPointerEnter",["pointerout","pointerover"]),Ot("onPointerLeave",["pointerout","pointerover"]),Dt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),Dt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),Dt("onBeforeInput",["compositionend","keypress","textInput","paste"]),Dt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),Dt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),Dt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var al="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),SS=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(al));function Zv(t,e){e=(e&4)!==0;for(var i=0;i<t.length;i++){var r=t[i],l=r.event;r=r.listeners;t:{var u=void 0;if(e)for(var v=r.length-1;0<=v;v--){var E=r[v],z=E.instance,J=E.currentTarget;if(E=E.listener,z!==u&&l.isPropagationStopped())break t;u=E,l.currentTarget=J;try{u(l)}catch(st){Fl(st)}l.currentTarget=null,u=z}else for(v=0;v<r.length;v++){if(E=r[v],z=E.instance,J=E.currentTarget,E=E.listener,z!==u&&l.isPropagationStopped())break t;u=E,l.currentTarget=J;try{u(l)}catch(st){Fl(st)}l.currentTarget=null,u=z}}}}function Oe(t,e){var i=e[je];i===void 0&&(i=e[je]=new Set);var r=t+"__bubble";i.has(r)||(Kv(e,t,2,!1),i.add(r))}function Oh(t,e,i){var r=0;e&&(r|=4),Kv(i,t,r,e)}var Ic="_reactListening"+Math.random().toString(36).slice(2);function zh(t){if(!t[Ic]){t[Ic]=!0,ta.forEach(function(i){i!=="selectionchange"&&(SS.has(i)||Oh(i,!1,t),Oh(i,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Ic]||(e[Ic]=!0,Oh("selectionchange",!1,e))}}function Kv(t,e,i,r){switch(F_(e)){case 2:var l=dM;break;case 8:l=pM;break;default:l=ed}i=l.bind(null,e,i,t),l=void 0,!Vu||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(l=!0),r?l!==void 0?t.addEventListener(e,i,{capture:!0,passive:l}):t.addEventListener(e,i,!0):l!==void 0?t.addEventListener(e,i,{passive:l}):t.addEventListener(e,i,!1)}function Ph(t,e,i,r,l){var u=r;if((e&1)===0&&(e&2)===0&&r!==null)t:for(;;){if(r===null)return;var v=r.tag;if(v===3||v===4){var E=r.stateNode.containerInfo;if(E===l)break;if(v===4)for(v=r.return;v!==null;){var z=v.tag;if((z===3||z===4)&&v.stateNode.containerInfo===l)return;v=v.return}for(;E!==null;){if(v=sn(E),v===null)return;if(z=v.tag,z===5||z===6||z===26||z===27){r=u=v;continue t}E=E.parentNode}}r=r.return}Kp(function(){var J=u,st=Hu(i),Mt=[];t:{var Y=Tm.get(t);if(Y!==void 0){var nt=Pl,Bt=t;switch(t){case"keypress":if(Ol(i)===0)break t;case"keydown":case"keyup":nt=ry;break;case"focusin":Bt="focus",nt=qu;break;case"focusout":Bt="blur",nt=qu;break;case"beforeblur":case"afterblur":nt=qu;break;case"click":if(i.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":nt=$p;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":nt=Yx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":nt=uy;break;case ym:case Sm:case Mm:nt=Kx;break;case Em:nt=hy;break;case"scroll":case"scrollend":nt=jx;break;case"wheel":nt=py;break;case"copy":case"cut":case"paste":nt=Jx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":nt=em;break;case"submit":nt=ly;break;case"toggle":case"beforetoggle":nt=gy}var $t=(e&4)!==0,Ee=!$t&&(t==="scroll"||t==="scrollend"),K=$t?Y!==null?Y+"Capture":null:Y;$t=[];for(var G=J,tt;G!==null;){var yt=G;if(tt=yt.stateNode,yt=yt.tag,yt!==5&&yt!==26&&yt!==27||tt===null||K===null||(yt=Ao(G,K),yt!=null&&$t.push(rl(G,yt,tt))),Ee)break;G=G.return}0<$t.length&&(Y=new nt(Y,Bt,null,i,st),Mt.push({event:Y,listeners:$t}))}}if((e&7)===0){t:{if(nt=t==="mouseover"||t==="pointerover",Y=t==="mouseout"||t==="pointerout",nt&&i!==Fu&&(Bt=i.relatedTarget||i.fromElement)&&(sn(Bt)||Bt[be]))break t;(Y||nt)&&(Bt=st.window===st?st:(nt=st.ownerDocument)?nt.defaultView||nt.parentWindow:window,Y?(nt=i.relatedTarget||i.toElement,Y=J,nt=nt?sn(nt):null,nt!==null&&(Ee=f(nt),$t=nt.tag,nt!==Ee||$t!==5&&$t!==27&&$t!==6)&&(nt=null)):(Y=null,nt=J),Y!==nt&&($t=$p,yt="onMouseLeave",K="onMouseEnter",G="mouse",(t==="pointerout"||t==="pointerover")&&($t=em,yt="onPointerLeave",K="onPointerEnter",G="pointer"),Ee=Y==null?Bt:xn(Y),tt=nt==null?Bt:xn(nt),Bt=new $t(yt,G+"leave",Y,i,st),Bt.target=Ee,Bt.relatedTarget=tt,yt=null,sn(st)===J&&($t=new $t(K,G+"enter",nt,i,st),$t.target=tt,$t.relatedTarget=Ee,yt=$t),Ee=yt,$t=Y&&nt?V(Y,nt,MS):null,Y!==null&&Qv(Mt,Bt,Y,$t,!1),nt!==null&&Ee!==null&&Qv(Mt,Ee,nt,$t,!0)))}t:{if(Y=J?xn(J):window,nt=Y.nodeName&&Y.nodeName.toLowerCase(),nt==="select"||nt==="input"&&Y.type==="file")var Wt=cm;else if(om(Y))if(um)Wt=Ay;else{Wt=Ty;var Be=Ey}else nt=Y.nodeName,!nt||nt.toLowerCase()!=="input"||Y.type!=="checkbox"&&Y.type!=="radio"?J&&Bu(J.elementType)&&(Wt=cm):Wt=by;if(Wt&&(Wt=Wt(t,J))){lm(Mt,Wt,i,st);break t}Be&&Be(t,Y,J)}switch(Be=J?xn(J):window,t){case"focusin":(om(Be)||Be.contentEditable==="true")&&(gs=Be,$u=J,Oo=null);break;case"focusout":Oo=$u=gs=null;break;case"mousedown":tf=!0;break;case"contextmenu":case"mouseup":case"dragend":tf=!1,_m(Mt,i,st);break;case"selectionchange":if(Cy)break;case"keydown":case"keyup":_m(Mt,i,st)}var se;if(Wu)t:{switch(t){case"compositionstart":var pe="onCompositionStart";break t;case"compositionend":pe="onCompositionEnd";break t;case"compositionupdate":pe="onCompositionUpdate";break t}pe=void 0}else ms?rm(t,i)&&(pe="onCompositionEnd"):t==="keydown"&&i.keyCode===229&&(pe="onCompositionStart");pe&&(nm&&i.locale!=="ko"&&(ms||pe!=="onCompositionStart"?pe==="onCompositionEnd"&&ms&&(se=Qp()):(ja=st,Xu="value"in ja?ja.value:ja.textContent,ms=!0)),Be=Bc(J,pe),0<Be.length&&(pe=new tm(pe,t,null,i,st),Mt.push({event:pe,listeners:Be}),se?pe.data=se:(se=sm(i),se!==null&&(pe.data=se)))),(se=_y?xy(t,i):yy(t,i))&&(pe=Bc(J,"onBeforeInput"),0<pe.length&&(Be=new tm("onBeforeInput","beforeinput",null,i,st),Mt.push({event:Be,listeners:pe}),Be.data=se)),_S(Mt,t,J,i,st)}Zv(Mt,e)})}function rl(t,e,i){return{instance:t,listener:e,currentTarget:i}}function Bc(t,e){for(var i=e+"Capture",r=[];t!==null;){var l=t,u=l.stateNode;if(l=l.tag,l!==5&&l!==26&&l!==27||u===null||(l=Ao(t,i),l!=null&&r.unshift(rl(t,l,u)),l=Ao(t,e),l!=null&&r.push(rl(t,l,u))),t.tag===3)return r;t=t.return}return[]}function MS(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function Qv(t,e,i,r,l){for(var u=e._reactName,v=[];i!==null&&i!==r;){var E=i,z=E.alternate,J=E.stateNode;if(E=E.tag,z!==null&&z===r)break;E!==5&&E!==26&&E!==27||J===null||(z=J,l?(J=Ao(i,u),J!=null&&v.unshift(rl(i,J,z))):l||(J=Ao(i,u),J!=null&&v.push(rl(i,J,z)))),i=i.return}v.length!==0&&t.push({event:e,listeners:v})}var ES=/\r\n?/g,TS=/\u0000|\uFFFD/g;function Jv(t){return(typeof t=="string"?t:""+t).replace(ES,`
`).replace(TS,"")}function $v(t,e){return e=Jv(e),Jv(t)===e}function Je(t,e,i,r,l,u){switch(i){case"children":if(typeof r=="string")e==="body"||e==="textarea"&&r===""||hs(t,r);else if(typeof r=="number"||typeof r=="bigint")e!=="body"&&hs(t,""+r);else return;break;case"className":En(t,"class",r);break;case"tabIndex":En(t,"tabindex",r);break;case"dir":case"role":case"viewBox":case"width":case"height":En(t,i,r);break;case"style":Wp(t,r,u);return;case"data":if(e!=="object"){En(t,"data",r);break}case"src":case"href":if(r===""&&(e!=="a"||i!=="href")){t.removeAttribute(i);break}if(r==null||typeof r=="function"||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(i);break}r=Nl(r),t.setAttribute(i,r);break;case"action":case"formAction":if(typeof r=="function"){t.setAttribute(i,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof u=="function"&&(i==="formAction"?(e!=="input"&&Je(t,e,"name",l.name,l,null),Je(t,e,"formEncType",l.formEncType,l,null),Je(t,e,"formMethod",l.formMethod,l,null),Je(t,e,"formTarget",l.formTarget,l,null)):(Je(t,e,"encType",l.encType,l,null),Je(t,e,"method",l.method,l,null),Je(t,e,"target",l.target,l,null)));if(r==null||typeof r=="symbol"||typeof r=="boolean"){t.removeAttribute(i);break}r=Nl(r),t.setAttribute(i,r);break;case"onClick":r!=null&&(t.onclick=ea);return;case"onScroll":r!=null&&Oe("scroll",t);return;case"onScrollEnd":r!=null&&Oe("scrollend",t);return;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(s(61));if(i=r.__html,i!=null){if(l.children!=null)throw Error(s(60));u?.__html!==i&&(t.innerHTML=i)}}break;case"multiple":t.multiple=r&&typeof r!="function"&&typeof r!="symbol";break;case"muted":t.muted=r&&typeof r!="function"&&typeof r!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(r==null||typeof r=="function"||typeof r=="boolean"||typeof r=="symbol"){t.removeAttribute("xlink:href");break}i=Nl(r),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",i);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(i,r):t.removeAttribute(i);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":r&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(i,""):t.removeAttribute(i);break;case"capture":case"download":r===!0?t.setAttribute(i,""):r!==!1&&r!=null&&typeof r!="function"&&typeof r!="symbol"?t.setAttribute(i,r):t.removeAttribute(i);break;case"cols":case"rows":case"size":case"span":r!=null&&typeof r!="function"&&typeof r!="symbol"&&!isNaN(r)&&1<=r?t.setAttribute(i,r):t.removeAttribute(i);break;case"rowSpan":case"start":r==null||typeof r=="function"||typeof r=="symbol"||isNaN(r)?t.removeAttribute(i):t.setAttribute(i,r);break;case"popover":Oe("beforetoggle",t),Oe("toggle",t),de(t,"popover",r);break;case"xlinkActuate":mn(t,"http://www.w3.org/1999/xlink","xlink:actuate",r);break;case"xlinkArcrole":mn(t,"http://www.w3.org/1999/xlink","xlink:arcrole",r);break;case"xlinkRole":mn(t,"http://www.w3.org/1999/xlink","xlink:role",r);break;case"xlinkShow":mn(t,"http://www.w3.org/1999/xlink","xlink:show",r);break;case"xlinkTitle":mn(t,"http://www.w3.org/1999/xlink","xlink:title",r);break;case"xlinkType":mn(t,"http://www.w3.org/1999/xlink","xlink:type",r);break;case"xmlBase":mn(t,"http://www.w3.org/XML/1998/namespace","xml:base",r);break;case"xmlLang":mn(t,"http://www.w3.org/XML/1998/namespace","xml:lang",r);break;case"xmlSpace":mn(t,"http://www.w3.org/XML/1998/namespace","xml:space",r);break;case"is":de(t,"is",r);break;case"innerText":case"textContent":return;default:if(!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")i=Xx.get(i)||i,de(t,i,r);else return}ge=!0}function Ih(t,e,i,r,l,u){switch(i){case"style":Wp(t,r,u);return;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(s(61));if(i=r.__html,i!=null){if(l.children!=null)throw Error(s(60));u?.__html!==i&&(t.innerHTML=i)}}break;case"children":if(typeof r=="string")hs(t,r);else if(typeof r=="number"||typeof r=="bigint")hs(t,""+r);else return;break;case"onScroll":r!=null&&Oe("scroll",t);return;case"onScrollEnd":r!=null&&Oe("scrollend",t);return;case"onClick":r!=null&&(t.onclick=ea);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!dt.hasOwnProperty(i))t:{if(i[0]==="o"&&i[1]==="n"&&(l=i.endsWith("Capture"),u=i.slice(2,l?i.length-7:void 0),e=t[Xt]||null,e=e!=null?e[i]:null,typeof e=="function"&&t.removeEventListener(u,e,l),typeof r=="function")){typeof e!="function"&&e!==null&&(i in t?t[i]=null:t.hasAttribute(i)&&t.removeAttribute(i)),t.addEventListener(u,r,l);break t}ge=!0,i in t?t[i]=r:r===!0?t.setAttribute(i,""):de(t,i,r)}return}ge=!0}function Vn(t,e,i){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Oe("error",t),Oe("load",t);var r=!1,l=!1,u;for(u in i)if(i.hasOwnProperty(u)){var v=i[u];if(v!=null)switch(u){case"src":r=!0;break;case"srcSet":l=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(s(137,e));default:Je(t,e,u,v,i,null)}}l&&Je(t,e,"srcSet",i.srcSet,i,null),r&&Je(t,e,"src",i.src,i,null);return;case"input":Oe("invalid",t);var E=u=v=l=null,z=null,J=null;for(r in i)if(i.hasOwnProperty(r)){var st=i[r];if(st!=null)switch(r){case"name":l=st;break;case"type":v=st;break;case"checked":z=st;break;case"defaultChecked":J=st;break;case"value":u=st;break;case"defaultValue":E=st;break;case"children":case"dangerouslySetInnerHTML":if(st!=null)throw Error(s(137,e));break;default:Je(t,e,r,st,i,null)}}kp(t,u,E,z,J,v,l,!1);return;case"select":Oe("invalid",t),r=v=u=null;for(l in i)if(i.hasOwnProperty(l)&&(E=i[l],E!=null))switch(l){case"value":u=E;break;case"defaultValue":v=E;break;case"multiple":r=E;default:Je(t,e,l,E,i,null)}e=u,i=v,t.multiple=!!r,e!=null?fs(t,!!r,e,!1):i!=null&&fs(t,!!r,i,!0);return;case"textarea":Oe("invalid",t),u=l=r=null;for(v in i)if(i.hasOwnProperty(v)&&(E=i[v],E!=null))switch(v){case"value":r=E;break;case"defaultValue":l=E;break;case"children":u=E;break;case"dangerouslySetInnerHTML":if(E!=null)throw Error(s(91));break;default:Je(t,e,v,E,i,null)}qp(t,r,l,u);return;case"option":for(z in i)i.hasOwnProperty(z)&&(r=i[z],r!=null)&&(z==="selected"?t.selected=r&&typeof r!="function"&&typeof r!="symbol":Je(t,e,z,r,i,null));return;case"dialog":Oe("beforetoggle",t),Oe("toggle",t),Oe("cancel",t),Oe("close",t);break;case"iframe":case"object":Oe("load",t);break;case"video":case"audio":for(r=0;r<al.length;r++)Oe(al[r],t);break;case"image":Oe("error",t),Oe("load",t);break;case"details":Oe("toggle",t);break;case"embed":case"source":case"link":Oe("error",t),Oe("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(J in i)if(i.hasOwnProperty(J)&&(r=i[J],r!=null))switch(J){case"children":case"dangerouslySetInnerHTML":throw Error(s(137,e));default:Je(t,e,J,r,i,null)}return;default:if(Bu(e)){for(st in i)i.hasOwnProperty(st)&&(r=i[st],r!==void 0&&Ih(t,e,st,r,i,void 0));return}}for(E in i)i.hasOwnProperty(E)&&(r=i[E],r!=null&&Je(t,e,E,r,i,null))}var bS={};function AS(t,e,i,r){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var l=null,u=null,v=null,E=null,z=null,J=null,st=null;for(nt in i){var Mt=i[nt];if(i.hasOwnProperty(nt)&&Mt!=null)switch(nt){case"checked":break;case"value":break;case"defaultValue":z=Mt;default:r.hasOwnProperty(nt)||Je(t,e,nt,null,r,Mt)}}for(var Y in r){var nt=r[Y];if(Mt=i[Y],r.hasOwnProperty(Y)&&(nt!=null||Mt!=null))switch(Y){case"type":nt!==Mt&&(ge=!0),u=nt;break;case"name":nt!==Mt&&(ge=!0),l=nt;break;case"checked":nt!==Mt&&(ge=!0),J=nt;break;case"defaultChecked":nt!==Mt&&(ge=!0),st=nt;break;case"value":nt!==Mt&&(ge=!0),v=nt;break;case"defaultValue":nt!==Mt&&(ge=!0),E=nt;break;case"children":case"dangerouslySetInnerHTML":if(nt!=null)throw Error(s(137,e));break;default:nt!==Mt&&Je(t,e,Y,nt,r,Mt)}}Pu(t,v,E,z,J,st,u,l);return;case"select":nt=v=E=Y=null;for(u in i)if(z=i[u],i.hasOwnProperty(u)&&z!=null)switch(u){case"value":break;case"multiple":nt=z;default:r.hasOwnProperty(u)||Je(t,e,u,null,r,z)}for(l in r)if(u=r[l],z=i[l],r.hasOwnProperty(l)&&(u!=null||z!=null))switch(l){case"value":u!==z&&(ge=!0),Y=u;break;case"defaultValue":u!==z&&(ge=!0),E=u;break;case"multiple":u!==z&&(ge=!0),v=u;default:u!==z&&Je(t,e,l,u,r,z)}e=E,i=v,r=nt,Y!=null?fs(t,!!i,Y,!1):!!r!=!!i&&(e!=null?fs(t,!!i,e,!0):fs(t,!!i,i?[]:"",!1));return;case"textarea":nt=Y=null;for(E in i)if(l=i[E],i.hasOwnProperty(E)&&l!=null&&!r.hasOwnProperty(E))switch(E){case"value":break;case"children":break;default:Je(t,e,E,null,r,l)}for(v in r)if(l=r[v],u=i[v],r.hasOwnProperty(v)&&(l!=null||u!=null))switch(v){case"value":l!==u&&(ge=!0),Y=l;break;case"defaultValue":l!==u&&(ge=!0),nt=l;break;case"children":break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(s(91));break;default:l!==u&&Je(t,e,v,l,r,u)}jp(t,Y,nt);return;case"option":for(var Bt in i)Y=i[Bt],i.hasOwnProperty(Bt)&&Y!=null&&!r.hasOwnProperty(Bt)&&(Bt==="selected"?t.selected=!1:Je(t,e,Bt,null,r,Y));for(z in r)Y=r[z],nt=i[z],r.hasOwnProperty(z)&&Y!==nt&&(Y!=null||nt!=null)&&(z==="selected"?(Y!==nt&&(ge=!0),t.selected=Y&&typeof Y!="function"&&typeof Y!="symbol"):Je(t,e,z,Y,r,nt));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var $t in i)Y=i[$t],i.hasOwnProperty($t)&&Y!=null&&!r.hasOwnProperty($t)&&Je(t,e,$t,null,r,Y);for(J in r)if(Y=r[J],nt=i[J],r.hasOwnProperty(J)&&Y!==nt&&(Y!=null||nt!=null))switch(J){case"children":case"dangerouslySetInnerHTML":if(Y!=null)throw Error(s(137,e));break;default:Je(t,e,J,Y,r,nt)}return;default:if(Bu(e)){for(var Ee in i)Y=i[Ee],i.hasOwnProperty(Ee)&&Y!==void 0&&!r.hasOwnProperty(Ee)&&Ih(t,e,Ee,void 0,r,Y);for(st in r)Y=r[st],nt=i[st],!r.hasOwnProperty(st)||Y===nt||Y===void 0&&nt===void 0||Ih(t,e,st,Y,r,nt);return}}for(var K in i)Y=i[K],i.hasOwnProperty(K)&&Y!=null&&!r.hasOwnProperty(K)&&Je(t,e,K,null,r,Y);for(Mt in r)Y=r[Mt],nt=i[Mt],!r.hasOwnProperty(Mt)||Y===nt||Y==null&&nt==null||Je(t,e,Mt,Y,r,nt)}function t_(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function RS(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,i=performance.getEntriesByType("resource"),r=0;r<i.length;r++){var l=i[r],u=l.transferSize,v=l.initiatorType,E=l.duration;if(u&&E&&t_(v)){for(v=0,E=l.responseEnd,r+=1;r<i.length;r++){var z=i[r],J=z.startTime;if(J>E)break;var st=z.transferSize,Mt=z.initiatorType;st&&t_(Mt)&&(z=z.responseEnd,v+=st*(z<E?1:(E-J)/(z-J)))}if(--r,e+=8*(u+v)/(l.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Bh=null,Fh=null;function sl(t){return t.nodeType===9?t:t.ownerDocument}function e_(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function n_(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function i_(t,e,i,r){return i=sl(i).createElement(t),i[ee]=r,i[Xt]=e,Vn(i,t,e),me(i),i}function Hh(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Gh=null;function CS(){var t=window.event;return t&&t.type==="popstate"?t===Gh?!1:(Gh=t,!0):(Gh=null,!1)}var Vh=typeof setTimeout=="function"?setTimeout:void 0,wS=typeof clearTimeout=="function"?clearTimeout:void 0,a_=typeof Promise=="function"?Promise:void 0,r_=typeof requestAnimationFrame=="function"?requestAnimationFrame:Vh,DS=typeof queueMicrotask=="function"?queueMicrotask:typeof a_<"u"?function(t){return a_.resolve(null).then(t).catch(US)}:Vh;function US(t){setTimeout(function(){throw t})}function fr(t){return t==="head"}function s_(t,e){var i=e,r=0;do{var l=i.nextSibling;if(t.removeChild(i),l&&l.nodeType===8)if(i=l.data,i==="/$"||i==="/&"){if(r===0){t.removeChild(l),Zs(e);return}r--}else if(i==="$"||i==="$?"||i==="$~"||i==="$!"||i==="&")r++;else if(i==="html")Kh(t.ownerDocument.documentElement);else if(i==="head"){i=t.ownerDocument.head,Kh(i);for(var u=i.firstChild;u;){var v=u.nextSibling,E=u.nodeName;u[Jt]||E==="SCRIPT"||E==="STYLE"||E==="LINK"&&u.rel.toLowerCase()==="stylesheet"||i.removeChild(u),u=v}}else i==="body"&&Kh(t.ownerDocument.body);i=l}while(i);Zs(e)}function o_(t,e){var i=t;t=0;do{var r=i.nextSibling;if(i.nodeType===1?e?(i._stashedDisplay=i.style.display,i.style.display="none"):(i.style.display=i._stashedDisplay||"",i.getAttribute("style")===""&&i.removeAttribute("style")):i.nodeType===3&&(e?(i._stashedText=i.nodeValue,i.nodeValue=""):i.nodeValue=i._stashedText||""),r&&r.nodeType===8)if(i=r.data,i==="/$"){if(t===0)break;t--}else i!=="$"&&i!=="$?"&&i!=="$~"&&i!=="$!"||t++;i=r}while(i)}function l_(t,e,i){if(e=CSS.escape(e)!==e?"r-"+btoa(e).replace(/=/g,""):e,t.style.viewTransitionName=e,i!=null&&(t.style.viewTransitionClass=i),i=getComputedStyle(t),i.display==="inline"){if(e=t.getClientRects(),e.length===1)var r=1;else for(var l=r=0;l<e.length;l++){var u=e[l];0<u.width&&0<u.height&&r++}r===1&&(t=t.style,t.display=e.length===1?"inline-block":"block",t.marginTop="-"+i.paddingTop,t.marginBottom="-"+i.paddingBottom)}}function c_(t,e){t=t.style,e=e.style;var i=e!=null?e.hasOwnProperty("viewTransitionName")?e.viewTransitionName:e.hasOwnProperty("view-transition-name")?e["view-transition-name"]:null:null;t.viewTransitionName=i==null||typeof i=="boolean"?"":(""+i).trim(),i=e!=null?e.hasOwnProperty("viewTransitionClass")?e.viewTransitionClass:e.hasOwnProperty("view-transition-class")?e["view-transition-class"]:null:null,t.viewTransitionClass=i==null||typeof i=="boolean"?"":(""+i).trim(),t.display==="inline-block"&&(e==null?t.display=t.margin="":(i=e.display,t.display=i==null||typeof i=="boolean"?"":i,i=e.margin,i!=null?t.margin=i:(i=e.hasOwnProperty("marginTop")?e.marginTop:e["margin-top"],t.marginTop=i==null||typeof i=="boolean"?"":i,e=e.hasOwnProperty("marginBottom")?e.marginBottom:e["margin-bottom"],t.marginBottom=e==null||typeof e=="boolean"?"":e)))}function NS(t,e,i){return i=i.ownerDocument.defaultView,{rect:t,abs:e.position==="absolute"||e.position==="fixed",clip:e.clipPath!=="none"||e.overflow!=="visible"||e.filter!=="none"||e.mask!=="none"||e.mask!=="none"||e.borderRadius!=="0px",view:0<=t.bottom&&0<=t.right&&t.top<=i.innerHeight&&t.left<=i.innerWidth}}function Xh(t){var e=t.getBoundingClientRect(),i=getComputedStyle(t);return NS(e,i,t)}function LS(t){return t.documentElement.clientHeight}function OS(t){this.addEventListener("load",t),this.addEventListener("error",t)}function zS(t,e,i,r,l,u,v,E,z){var J=e.nodeType===9?e:e.ownerDocument;try{var st=J.startViewTransition({update:function(){var Y=J.defaultView,nt=Y.navigation&&Y.navigation.transition,Bt=J.fonts.status;r();var $t=[];if(Bt==="loaded"&&(LS(J),J.fonts.status==="loading"&&$t.push(J.fonts.ready)),Bt=$t.length,t!==null)for(var Ee=t.suspenseyImages,K=0,G=0;G<Ee.length;G++){var tt=Ee[G];if(!tt.complete){var yt=tt.getBoundingClientRect();if(0<yt.bottom&&0<yt.right&&yt.top<Y.innerHeight&&yt.left<Y.innerWidth){if(K+=D_(tt),K>Gc){$t.length=Bt;break}tt=new Promise(OS.bind(tt)),$t.push(tt)}}}if(0<$t.length)return Y=Promise.race([Promise.all($t),new Promise(function(Wt){return setTimeout(Wt,500)})]).then(l,l),(nt?Promise.allSettled([nt.finished,Y]):Y).then(u,u);if(l(),nt)return nt.finished.then(u,u);u()},types:i});J.__reactViewTransition=st;var Mt=[];return st.ready.then(function(){for(var Y=J.documentElement.getAnimations({subtree:!0}),nt=0;nt<Y.length;nt++){var Bt=Y[nt],$t=Bt.effect,Ee=$t.pseudoElement;if(Ee!=null&&Ee.startsWith("::view-transition")){Mt.push(Bt),Bt=$t.getKeyframes();for(var K=Ee=void 0,G=!0,tt=0;tt<Bt.length;tt++){var yt=Bt[tt],Wt=yt.width;if(Ee===void 0)Ee=Wt;else if(Ee!==Wt){G=!1;break}if(Wt=yt.height,K===void 0)K=Wt;else if(K!==Wt){G=!1;break}delete yt.width,delete yt.height,yt.transform==="none"&&delete yt.transform}G&&Ee!==void 0&&K!==void 0&&($t.setKeyframes(Bt),G=getComputedStyle($t.target,$t.pseudoElement),G.width!==Ee||G.height!==K)&&(G=Bt[0],G.width=Ee,G.height=K,G=Bt[Bt.length-1],G.width=Ee,G.height=K,$t.setKeyframes(Bt))}}v()},function(Y){J.__reactViewTransition===st&&(J.__reactViewTransition=null);try{typeof Y=="object"&&Y!==null&&Y.name==="InvalidStateError"&&(Y.message==="View transition was skipped because document visibility state is hidden."||Y.message==="Skipping view transition because document visibility state has become hidden."||Y.message==="Skipping view transition because viewport size changed."||Y.message==="Transition was aborted because of invalid state")&&(Y=null),Y!==null&&z(Y)}finally{r(),l(),v()}}),st.finished.finally(function(){for(var Y=0;Y<Mt.length;Y++)Mt[Y].cancel();J.__reactViewTransition===st&&(J.__reactViewTransition=null),E()}),st}catch{return r(),l(),v(),null}}function Yr(t,e){this._scope=document.documentElement,this._selector="::view-transition-"+t+"("+e+")"}Yr.prototype.animate=function(t,e){return e=typeof e=="number"?{duration:e}:I({},e),e.pseudoElement=this._selector,this._scope.animate(t,e)},Yr.prototype.getAnimations=function(){for(var t=this._scope,e=this._selector,i=t.getAnimations({subtree:!0}),r=[],l=0;l<i.length;l++){var u=i[l].effect;u!==null&&u.target===t&&u.pseudoElement===e&&r.push(i[l])}return r},Yr.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function u_(t){return{name:t,group:new Yr("group",t),imagePair:new Yr("image-pair",t),old:new Yr("old",t),new:new Yr("new",t)}}function xi(t){this._fragmentFiber=t,this._observers=this._eventListeners=null}xi.prototype.addEventListener=function(t,e,i){var r=null,l=null;if(!(i!=null&&typeof i!="boolean"&&(r=i.signal||null,r!==null&&r.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var u=this._eventListeners;if(h_(u,t,e,i)===-1){var v=this,E=e;i!=null&&typeof i!="boolean"&&i.once===!0&&(E=function(z){v.removeEventListener(t,e,i),typeof e=="function"?e.call(this,z):e.handleEvent(z)}),r!==null&&(l=v.removeEventListener.bind(v,t,e,i),r.addEventListener("abort",l,{once:!0}),l=r.removeEventListener.bind(r,"abort",l)),r=Xs(i),u.push({type:t,listener:e,optionsOrUseCapture:i,attachedListener:E,cleanup:l}),p(this._fragmentFiber.child,!1,PS,t,E,r)}this._eventListeners=u}};function PS(t,e,i,r){return S(t).addEventListener(e,i,r),!1}xi.prototype.removeEventListener=function(t,e,i){var r=this._eventListeners;if(r!==null&&(e=h_(r,t,e,i),e!==-1)){var l=r[e];i=l.attachedListener;var u=l.cleanup;l=Xs(l.optionsOrUseCapture),p(this._fragmentFiber.child,!1,IS,t,i,l),r.splice(e,1),u!==null&&u()}};function IS(t,e,i,r){return S(t).removeEventListener(e,i,r),!1}function Xs(t){return t!=null&&typeof t!="boolean"&&(t.once===!0||t.signal instanceof AbortSignal)?{capture:t.capture,passive:t.passive}:t}function f_(t){return t==null?"c=0":typeof t=="boolean"?"c="+(t?"1":"0"):"c="+(t.capture?"1":"0")}function h_(t,e,i,r){if(t.length===0)return-1;r=f_(r);for(var l=0;l<t.length;l++){var u=t[l];if(u.type===e&&u.listener===i&&f_(u.optionsOrUseCapture)===r)return l}return-1}xi.prototype.dispatchEvent=function(t){var e=x(this._fragmentFiber);if(e===null)return!0;e=S(e);var i=this._eventListeners;if(i!==null&&0<i.length||!t.bubbles){var r=e.nodeType===9?e.createComment(""):document.createTextNode("");if(i)for(var l=0;l<i.length;l++){var u=i[l];r.addEventListener(u.type,u.attachedListener,Xs(u.optionsOrUseCapture))}if(e.appendChild(r),t=r.dispatchEvent(t),i)for(l=0;l<i.length;l++)u=i[l],r.removeEventListener(u.type,u.attachedListener,Xs(u.optionsOrUseCapture));return e.removeChild(r),t}return e.dispatchEvent(t)},xi.prototype.focus=function(t){p(this._fragmentFiber.child,!0,d_,t,void 0,void 0)};function d_(t,e){return t.tag===6?!1:(t=S(t),ZS(t,e))}xi.prototype.focusLast=function(t){var e=[];p(this._fragmentFiber.child,!0,kh,e,void 0,void 0);for(var i=e.length-1;0<=i&&!d_(e[i],t);i--);};function kh(t,e){return e.push(t),!1}xi.prototype.blur=function(){var t=x(this._fragmentFiber);t!==null&&(t=S(t),t=sl(t).activeElement,t!==null&&p(this._fragmentFiber.child,!1,BS,t,void 0,void 0))};function BS(t,e){return t.tag===6?!1:(t=S(t),t===e||t.contains(e)?(e.blur(),!0):!1)}xi.prototype.observeUsing=function(t){this._observers===null&&(this._observers=new Set),this._observers.add(t),p(this._fragmentFiber.child,!1,FS,t,void 0,void 0)};function FS(t,e){return t.tag===6||(t=S(t),e.observe(t)),!1}xi.prototype.unobserveUsing=function(t){var e=this._observers;if(e!==null&&e.has(t)){e.delete(t),p(this._fragmentFiber.child,!1,HS,t,void 0,void 0);for(var i=e=0;i<Vi.length;i++){var r=Vi[i];r.fragmentInstance===this&&r.observer===t?t.unobserve(r.instance):Vi[e++]=r}Vi.length=e}};function HS(t,e){return t.tag===6||(t=S(t),e.unobserve(t)),!1}var Vi=[],jh=!1;function GS(t,e,i){Vi.push({fragmentInstance:t,observer:e,instance:i}),jh||(jh=!0,KS(function(){jh=!1;var r=Vi;Vi=[];for(var l=0;l<r.length;l++){var u=r[l];u.observer.unobserve(u.instance)}}))}xi.prototype.getClientRects=function(){var t=[];return p(this._fragmentFiber.child,!1,VS,t,void 0,void 0),t};function VS(t,e){if(t.tag===6){t=t.stateNode;var i=t.ownerDocument.createRange();i.selectNodeContents(t),e.push.apply(e,i.getClientRects())}else t=S(t),e.push.apply(e,t.getClientRects());return!1}xi.prototype.getRootNode=function(t){var e=x(this._fragmentFiber);return e===null?this:S(e).getRootNode(t)},xi.prototype.compareDocumentPosition=function(t){var e=x(this._fragmentFiber);if(e===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var i=[];p(this._fragmentFiber.child,!1,kh,i,void 0,void 0);var r=S(e);if(i.length===0){if(i=r,M(this._fragmentFiber)){t:{for(e=this._fragmentFiber.return;e!==null;){if(e.tag===4){e=e.stateNode.containerInfo;break t}if(e.tag===3||e.tag===5||e.tag===27)break;e=e.return}e=null}e!=null&&(i=e)}e=this._fragmentFiber;var l=r=i.compareDocumentPosition(t);return i===t?l=Node.DOCUMENT_POSITION_CONTAINS:r&Node.DOCUMENT_POSITION_CONTAINED_BY&&(i=T(e)[1],i===null?l=Node.DOCUMENT_POSITION_PRECEDING:(t=S(i).compareDocumentPosition(t),l=t===0||t&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),l|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}e=S(i[0]),l=S(i[i.length-1]);var u=M(this._fragmentFiber)?e.parentElement:r;if(u==null)return Node.DOCUMENT_POSITION_DISCONNECTED;r=u.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_CONTAINED_BY,u=u.compareDocumentPosition(l)&Node.DOCUMENT_POSITION_CONTAINED_BY;var v=e.compareDocumentPosition(t),E=l.compareDocumentPosition(t),z=v&Node.DOCUMENT_POSITION_CONTAINED_BY||E&Node.DOCUMENT_POSITION_CONTAINED_BY;return E=r&&u&&v&Node.DOCUMENT_POSITION_FOLLOWING&&E&Node.DOCUMENT_POSITION_PRECEDING,e=r&&e===t||u&&l===t||z||E?Node.DOCUMENT_POSITION_CONTAINED_BY:!r&&e===t||!u&&l===t?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:v,e&Node.DOCUMENT_POSITION_DISCONNECTED||e&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||XS(e,this._fragmentFiber,i[0],i[i.length-1],t)?e:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function XS(t,e,i,r,l){var u=sn(l);if(t&Node.DOCUMENT_POSITION_CONTAINED_BY){if(i=!!u)t:{for(;u!==null;){if(u.tag===7&&(u===e||u.alternate===e)){i=!0;break t}u=u.return}i=!1}return i}if(t&Node.DOCUMENT_POSITION_CONTAINS){if(u===null)return u=l.ownerDocument,l===u||l===u.documentElement||l===u.body;t:{for(u=e,e=x(e);u!==null;){if(!(u.tag!==5&&u.tag!==3&&u.tag!==27||u!==e&&u.alternate!==e)){u=!0;break t}u=u.return}u=!1}return u}return t&Node.DOCUMENT_POSITION_PRECEDING?((e=!!u)&&!(e=u===i)&&(e=V(i,u,et),e===null?e=!1:(p(e,!0,O,u,i),u=y,y=null,e=u!==null)),e):t&Node.DOCUMENT_POSITION_FOLLOWING?((e=!!u)&&!(e=u===r)&&(e=V(r,u,et),e===null?e=!1:(p(e,!0,N,u,r),u=y,P=y=null,e=u!==null)),e):!1}function p_(t,e){var i=t.ownerDocument.createRange();i.selectNodeContents(t),t=i.getBoundingClientRect(),window.scrollTo(window.scrollX+t.left,e?window.scrollY+t.top:window.scrollY+t.bottom-window.innerHeight)}xi.prototype.scrollIntoView=function(t){if(typeof t=="object")throw Error(s(566));var e=[];p(this._fragmentFiber.child,!1,kh,e,void 0,void 0);var i=t!==!1;if(e.length===0){var r=T(this._fragmentFiber);if(r=i?r[1]||r[0]||x(this._fragmentFiber):r[0]||r[1],r===null)return;if(r.tag===6){t=S(r),p_(t,i);return}if(r=S(r),r.nodeType!==9){if(r.nodeType===11){i="host"in r?r.host:null,i!==null&&i.scrollIntoView(t);return}r.scrollIntoView(t)}}for(r=i?e.length-1:0;r!==(i?-1:e.length);){var l=e[r];l.tag===6?(l=S(l),p_(l,i)):S(l).scrollIntoView(t),r+=i?-1:1}};function kS(t,e){return t=S(t),m_(t,e),!1}function m_(t,e){t.reactFragments==null&&(t.reactFragments=new Set),t.reactFragments.add(e)}function g_(t,e){var i=e._eventListeners;if(i!==null)for(var r=0;r<i.length;r++){var l=i[r];t.addEventListener(l.type,l.attachedListener,Xs(l.optionsOrUseCapture))}t.nodeType!==3&&(i=e._observers,i!==null&&i.forEach(function(u){for(var v=0,E=0;E<Vi.length;E++){var z=Vi[E];(z.fragmentInstance!==e||z.observer!==u||z.instance!==t)&&(Vi[v++]=z)}Vi.length=v,u.observe(t)}),m_(t,e))}function jS(t,e){var i=e._eventListeners;if(i!==null)for(var r=0;r<i.length;r++){var l=i[r];t.removeEventListener(l.type,l.attachedListener,Xs(l.optionsOrUseCapture))}t.nodeType!==3&&(i=e._observers,i!==null&&i.forEach(function(u){typeof u.rootMargin=="string"?GS(e,u,t):u.unobserve(t)}),t.reactFragments!=null&&t.reactFragments.delete(e))}function qh(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var i=e;switch(e=e.nextSibling,i.nodeName){case"HTML":case"HEAD":case"BODY":qh(i),Ne(i);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(i.rel.toLowerCase()==="stylesheet")continue}t.removeChild(i)}}function qS(t,e,i,r){for(;t.nodeType===1;){var l=i;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!r&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(r){if(!t[Jt])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(u=t.getAttribute("rel"),u==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(u!==l.rel||t.getAttribute("href")!==(l.href==null||l.href===""?null:l.href)||t.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin)||t.getAttribute("title")!==(l.title==null?null:l.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(u=t.getAttribute("src"),(u!==(l.src==null?null:l.src)||t.getAttribute("type")!==(l.type==null?null:l.type)||t.getAttribute("crossorigin")!==(l.crossOrigin==null?null:l.crossOrigin))&&u&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var u=l.name==null?null:""+l.name;if(l.type==="hidden"&&t.getAttribute("name")===u)return t}else return t;if(t=Di(t.nextSibling),t===null)break}return null}function YS(t,e,i){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!i||(t=Di(t.nextSibling),t===null))return null;return t}function v_(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Di(t.nextSibling),t===null))return null;return t}function Yh(t){return t.data==="$?"||t.data==="$~"}function Wh(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function WS(t,e){var i=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||i.readyState!=="loading")e();else{var r=function(){e(),i.removeEventListener("DOMContentLoaded",r)};i.addEventListener("DOMContentLoaded",r),t._reactRetry=r}}function Di(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Zh=null;function __(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var i=t.data;if(i==="/$"||i==="/&"){if(e===0)return Di(t.nextSibling);e--}else i!=="$"&&i!=="$!"&&i!=="$?"&&i!=="$~"&&i!=="&"||e++}t=t.nextSibling}return null}function x_(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var i=t.data;if(i==="$"||i==="$!"||i==="$?"||i==="$~"||i==="&"){if(e===0)return t;e--}else i!=="/$"&&i!=="/&"||e++}t=t.previousSibling}return null}function ZS(t,e){function i(){r=!0}if(t.ownerDocument.activeElement===t)return!0;var r=!1;try{t.ownerDocument.addEventListener("focus",i,!0),(t.focus||HTMLElement.prototype.focus).call(t,e)}finally{t.ownerDocument.removeEventListener("focus",i,!0)}return r}function KS(t){r_(function(){r_(function(e){return t(e)})})}function y_(t,e,i){switch(e=sl(i),t){case"html":if(t=e.documentElement,!t)throw Error(s(452));return t;case"head":if(t=e.head,!t)throw Error(s(453));return t;case"body":if(t=e.body,!t)throw Error(s(454));return t;default:throw Error(s(451))}}function S_(t,e,i){for(var r in i){var l=i[r];i.hasOwnProperty(r)&&l!=null&&Je(t,e,r,null,bS,l)}i.dangerouslySetInnerHTML!=null&&(t.textContent=""),t.onclick===ea&&(t.onclick=null),Ne(t)}function Kh(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);Ne(t)}var Ui=new Map,M_=new Set;function ol(t){if(typeof t.getRootNode=="function"){var e=t.getRootNode();if(e.nodeType===9||e.nodeType===11)return e}return t.nodeType===9?t:t.ownerDocument}var Ca=Ut.d;Ut.d={f:QS,r:JS,D:$S,C:tM,L:eM,m:nM,X:aM,S:iM,M:rM};function QS(){var t=Ca.f(),e=Nc();return t||e}function JS(t){var e=kn(t);e!==null&&e.tag===5&&e.type==="form"?Tg(e):Ca.r(t)}var ks=typeof document>"u"?null:document;function E_(t,e,i){var r=ks;if(r&&typeof e=="string"&&e){var l=Ei(e);l='link[rel="'+t+'"][href="'+l+'"]',typeof i=="string"&&(l+='[crossorigin="'+i+'"]'),M_.has(l)||(M_.add(l),t={rel:t,crossOrigin:i,href:e},r.querySelector(l)===null&&(e=r.createElement("link"),Vn(e,"link",t),me(e),r.head.appendChild(e)))}}function $S(t){Ca.D(t),E_("dns-prefetch",t,null)}function tM(t,e){Ca.C(t,e),E_("preconnect",t,e)}function eM(t,e,i){Ca.L(t,e,i);var r=ks;if(r&&t&&e){var l='link[rel="preload"][as="'+Ei(e)+'"]';e==="image"&&i&&i.imageSrcSet?(l+='[imagesrcset="'+Ei(i.imageSrcSet)+'"]',typeof i.imageSizes=="string"&&(l+='[imagesizes="'+Ei(i.imageSizes)+'"]')):l+='[href="'+Ei(t)+'"]';var u=l;switch(e){case"style":u=js(t);break;case"script":u=qs(t)}if(!(Ui.has(u)||(t=I({rel:"preload",href:e==="image"&&i&&i.imageSrcSet?void 0:t,as:e},i),Ui.set(u,t),r.querySelector(l)!==null||e==="style"&&r.querySelector(ll(u))||e==="script"&&r.querySelector(cl(u))))){var v=r.createElement("link");Vn(v,"link",t),e==="style"&&(v[hn]=!0,v.onload=v.onerror=function(){Wn(v)}),me(v),r.head.appendChild(v)}}}function nM(t,e){Ca.m(t,e);var i=ks;if(i&&t){var r=e&&typeof e.as=="string"?e.as:"script",l='link[rel="modulepreload"][as="'+Ei(r)+'"][href="'+Ei(t)+'"]',u=l;switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":u=qs(t)}if(!Ui.has(u)&&(t=I({rel:"modulepreload",href:t},e),Ui.set(u,t),i.querySelector(l)===null)){switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(i.querySelector(cl(u)))return}r=i.createElement("link"),Vn(r,"link",t),me(r),i.head.appendChild(r)}}}function iM(t,e,i){Ca.S(t,e,i);var r=ks;if(r&&t){var l=ni(r).hoistableStyles,u=js(t);e=e||"default";var v=l.get(u);if(!v){var E={loading:0,preload:null};if(v=r.querySelector(ll(u)))E.loading=5;else{t=I({rel:"stylesheet",href:t,"data-precedence":e},i),(i=Ui.get(u))&&Qh(t,i);var z=v=r.createElement("link");me(z),Vn(z,"link",t),z._p=new Promise(function(J,st){z.onload=J,z.onerror=st}),z.addEventListener("load",function(){E.loading|=1}),z.addEventListener("error",function(){E.loading|=2}),E.loading|=4,Fc(v,e,r)}v={type:"stylesheet",instance:v,count:1,state:E},l.set(u,v)}}}function aM(t,e){Ca.X(t,e);var i=ks;if(i&&t){var r=ni(i).hoistableScripts,l=qs(t),u=r.get(l);u||(u=i.querySelector(cl(l)),u||(t=I({src:t,async:!0},e),(e=Ui.get(l))&&Jh(t,e),u=i.createElement("script"),me(u),Vn(u,"link",t),i.head.appendChild(u)),u={type:"script",instance:u,count:1,state:null},r.set(l,u))}}function rM(t,e){Ca.M(t,e);var i=ks;if(i&&t){var r=ni(i).hoistableScripts,l=qs(t),u=r.get(l);u||(u=i.querySelector(cl(l)),u||(t=I({src:t,async:!0,type:"module"},e),(e=Ui.get(l))&&Jh(t,e),u=i.createElement("script"),me(u),Vn(u,"link",t),i.head.appendChild(u)),u={type:"script",instance:u,count:1,state:null},r.set(l,u))}}function T_(t,e,i,r){var l=(l=L.current)?ol(l):null;if(!l)throw Error(s(446));switch(t){case"meta":case"title":return null;case"style":return typeof i.precedence=="string"&&typeof i.href=="string"?(i=js(i.href),e=ni(l).hoistableStyles,r=e.get(i),r||(r={type:"style",instance:null,count:0,state:null},e.set(i,r)),r):{type:"void",instance:null,count:0,state:null};case"link":if(i.rel==="stylesheet"&&typeof i.href=="string"&&typeof i.precedence=="string"){t=js(i.href);var u=ni(l).hoistableStyles,v=u.get(t);if(v||(l=l.ownerDocument||l,v={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},u.set(t,v),(u=l.querySelector(ll(t)))?u._p||(v.instance=u,v.state.loading=5):(u=Ui.get(t),u||(u={rel:"preload",as:"style",href:i.href,crossOrigin:i.crossOrigin,integrity:i.integrity,media:i.media,hrefLang:i.hrefLang,referrerPolicy:i.referrerPolicy},Ui.set(t,u)),sM(l,t,u,v.state))),e&&r===null)throw Error(s(528,""));return v}if(e&&r!==null)throw Error(s(529,""));return null;case"script":return e=i.async,i=i.src,typeof i=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(i=qs(i),e=ni(l).hoistableScripts,r=e.get(i),r||(r={type:"script",instance:null,count:0,state:null},e.set(i,r)),r):{type:"void",instance:null,count:0,state:null};default:throw Error(s(444,t))}}function js(t){return'href="'+Ei(t)+'"'}function ll(t){return'link[rel="stylesheet"]['+t+"]"}function b_(t){return I({},t,{"data-precedence":t.precedence,precedence:null})}function sM(t,e,i,r){if(e=t.querySelector('link[rel="preload"][as="style"]['+e+"]")){if(e[hn]!==!0){r.loading=1;return}}else e=t.createElement("link"),e[hn]=!0,e.onload=e.onerror=Wn.bind(null,e),Vn(e,"link",i),me(e),t.head.appendChild(e);r.preload=e,e.addEventListener("load",function(){return r.loading|=1}),e.addEventListener("error",function(){return r.loading|=2})}function qs(t){return'[src="'+Ei(t)+'"]'}function cl(t){return"script[async]"+t}function A_(t,e,i){if(e.count++,e.instance===null)switch(e.type){case"style":var r=t.querySelector('style[data-href~="'+Ei(i.href)+'"]');if(r)return e.instance=r,me(r),r;var l=I({},i,{"data-href":i.href,"data-precedence":i.precedence,href:null,precedence:null});return r=(t.ownerDocument||t).createElement("style"),me(r),Vn(r,"style",l),Fc(r,i.precedence,t),e.instance=r;case"stylesheet":l=js(i.href);var u=t.querySelector(ll(l));if(u)return e.state.loading|=4,e.instance=u,me(u),u;r=b_(i),(l=Ui.get(l))&&Qh(r,l),u=(t.ownerDocument||t).createElement("link"),me(u);var v=u;return v._p=new Promise(function(E,z){v.onload=E,v.onerror=z}),Vn(u,"link",r),e.state.loading|=4,Fc(u,i.precedence,t),e.instance=u;case"script":return u=qs(i.src),(l=t.querySelector(cl(u)))?(e.instance=l,me(l),l):(r=i,(l=Ui.get(u))&&(r=I({},i),Jh(r,l)),t=t.ownerDocument||t,l=t.createElement("script"),me(l),Vn(l,"link",r),t.head.appendChild(l),e.instance=l);case"void":return null;default:throw Error(s(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(r=e.instance,e.state.loading|=4,Fc(r,i.precedence,t));return e.instance}function Fc(t,e,i){for(var r=i.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),l=r.length?r[r.length-1]:null,u=l,v=0;v<r.length;v++){var E=r[v];if(E.dataset.precedence===e)u=E;else if(u!==l)break}u?u.parentNode.insertBefore(t,u.nextSibling):(e=i.nodeType===9?i.head:i,e.insertBefore(t,e.firstChild))}function Qh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Jh(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var Hc=null;function R_(t,e,i){if(Hc===null){var r=new Map,l=Hc=new Map;l.set(i,r)}else l=Hc,r=l.get(i),r||(r=new Map,l.set(i,r));if(r.has(t))return r;for(r.set(t,null),i=i.getElementsByTagName(t),l=0;l<i.length;l++){var u=i[l];if(!(u[Jt]||u[ee]||t==="link"&&u.getAttribute("rel")==="stylesheet")&&u.namespaceURI!=="http://www.w3.org/2000/svg"){var v=u.getAttribute(e)||"";v=t+v;var E=r.get(v);E?E.push(u):r.set(v,[u])}}return r}function $h(t,e,i){t=t.ownerDocument||t,t.head.insertBefore(i,e==="title"?t.querySelector("head > title"):null)}function oM(t,e,i){if(i===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;return e.rel==="stylesheet"?(t=e.disabled,typeof e.precedence=="string"&&t==null):!0;case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function C_(t,e){return t==="img"&&e.src!=null&&e.src!==""&&e.onLoad==null&&e.loading!=="lazy"}function w_(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function D_(t){return(t.width||100)*(t.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function U_(t,e){typeof e.decode=="function"&&(t.imgCount++,e.complete||(t.imgBytes+=D_(e),t.suspenseyImages.push(e)),t=uM.bind(t),e.decode().then(t,t))}function lM(t,e,i,r){if(i.type==="stylesheet"&&(typeof r.media!="string"||matchMedia(r.media).matches!==!1)&&(i.state.loading&4)===0){if(i.instance===null){var l=js(r.href),u=e.querySelector(ll(l));if(u){e=u._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=ul.bind(t),e.then(t,t)),i.state.loading|=4,i.instance=u,me(u);return}u=e.ownerDocument||e,r=b_(r),(l=Ui.get(l))&&Qh(r,l),u=u.createElement("link"),me(u);var v=u;v._p=new Promise(function(E,z){v.onload=E,v.onerror=z}),Vn(u,"link",r),i.instance=u}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(i,e),(e=i.state.preload)&&(i.state.loading&3)===0&&(t.count++,i=ul.bind(t),e.addEventListener("load",i),e.addEventListener("error",i))}}var Gc=0;function cM(t,e){return t.stylesheets&&t.count===0&&Xc(t,t.stylesheets),0<t.count||0<t.imgCount?function(i){var r=setTimeout(function(){if(t.stylesheets&&Xc(t,t.stylesheets),t.unsuspend){var u=t.unsuspend;t.unsuspend=null,u()}},6e4+e);0<t.imgBytes&&Gc===0&&(Gc=62500*RS());var l=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Xc(t,t.stylesheets),t.unsuspend)){var u=t.unsuspend;t.unsuspend=null,u()}},(t.imgBytes>Gc?50:800)+e);return t.unsuspend=i,function(){t.unsuspend=null,clearTimeout(r),clearTimeout(l)}}:null}function N_(t){if(t.count===0&&(t.imgCount===0||!t.waitingForImages)){if(t.stylesheets)Xc(t,t.stylesheets);else if(t.unsuspend){var e=t.unsuspend;t.unsuspend=null,e()}}}function ul(){this.count--,N_(this)}function uM(){this.imgCount--,N_(this)}var Vc=null;function Xc(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Vc=new Map,e.forEach(fM,t),Vc=null,ul.call(t))}function fM(t,e){if(!(e.state.loading&4)){var i=Vc.get(t);if(i)var r=i.get(null);else{i=new Map,Vc.set(t,i);for(var l=t.querySelectorAll("link[data-precedence],style[data-precedence]"),u=0;u<l.length;u++){var v=l[u];(v.nodeName==="LINK"||v.getAttribute("media")!=="not all")&&(i.set(v.dataset.precedence,v),r=v)}r&&i.set(null,r)}l=e.instance,v=l.getAttribute("data-precedence"),u=i.get(v)||r,u===r&&i.set(null,l),i.set(v,l),this.count++,r=ul.bind(this),l.addEventListener("load",r),l.addEventListener("error",r),u?u.parentNode.insertBefore(l,u.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(l,t.firstChild)),e.state.loading|=4}}var Ys={$$typeof:gt,Provider:null,Consumer:null,_currentValue:re,_currentValue2:re,_threadCount:0};function hM(t,e,i,r,l,u,v,E,z){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Rr(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Rr(0),this.hiddenUpdates=Rr(null),this.identifierPrefix=r,this.onUncaughtError=l,this.onCaughtError=u,this.onRecoverableError=v,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=z,this.transitionTypes=null,this.incompleteTransitions=new Map}function L_(t,e,i,r,l,u,v,E,z,J,st,Mt){return t=new hM(t,e,i,v,z,J,st,Mt,E),e=1,u===!0&&(e|=24),u=ii(3,null,null,e),t.current=u,u.stateNode=t,e=pf(),e.refCount++,t.pooledCache=e,e.refCount++,u.memoizedState={element:r,isDehydrated:i,cache:e},_f(u),t}function O_(t){return t?(t=xs,t):xs}function z_(t,e,i,r,l,u){l=O_(l),r.context===null?r.context=l:r.pendingContext=l,r=$a(e),r.payload={element:i},u=u===void 0?null:u,u!==null&&(r.callback=u),i=tr(t,r,e),i!==null&&(oi(i,t,e),Go(i,t,e))}function P_(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var i=t.retryLane;t.retryLane=i!==0&&i<e?i:e}}function td(t,e){P_(t,e),(t=t.alternate)&&P_(t,e)}function I_(t){if(t.tag===13||t.tag===31){var e=Dr(t,67108864);e!==null&&oi(e,t,67108864),td(t,67108864)}}function B_(t){if(t.tag===13||t.tag===31){var e=_i();e=Lt(e);var i=Dr(t,e);i!==null&&oi(i,t,e),td(t,e)}}var Ws=!0;function dM(t,e,i,r){var l=Ct.T;Ct.T=null;var u=Ut.p;try{Ut.p=2,ed(t,e,i,r)}finally{Ut.p=u,Ct.T=l}}function pM(t,e,i,r){var l=Ct.T;Ct.T=null;var u=Ut.p;try{Ut.p=8,ed(t,e,i,r)}finally{Ut.p=u,Ct.T=l}}function ed(t,e,i,r){if(Ws){var l=nd(r);if(l===null)Ph(t,e,r,kc,i),H_(t,r);else if(gM(l,t,e,i,r))r.stopPropagation();else if(H_(t,r),e&4&&-1<mM.indexOf(t)){for(;l!==null;){var u=kn(l);if(u!==null)switch(u.tag){case 3:if(u=u.stateNode,u.current.memoizedState.isDehydrated){var v=hi(u.pendingLanes);if(v!==0){var E=u;for(E.pendingLanes|=2,E.entangledLanes|=2;v;){var z=1<<31-fn(v);E.entanglements[1]|=z,v&=~z}fa(u),(qe&6)===0&&(wc=F()+500,il(0))}}break;case 31:case 13:E=Dr(u,2),E!==null&&oi(E,u,2),Nc(),td(u,2)}if(u=nd(r),u===null&&Ph(t,e,r,kc,i),u===l)break;l=u}l!==null&&r.stopPropagation()}else Ph(t,e,r,null,i)}}function nd(t){return t=Hu(t),id(t)}var kc=null;function id(t){if(kc=null,t=sn(t),t!==null){var e=f(t);if(e===null)t=null;else{var i=e.tag;if(i===13){if(t=h(e),t!==null)return t;t=null}else if(i===31){if(t=d(e),t!==null)return t;t=null}else if(i===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return kc=t,null}function F_(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(wt()){case ut:return 2;case Tt:return 8;case zt:case Gt:return 32;case fe:return 268435456;default:return 32}default:return 32}}var ad=!1,hr=null,dr=null,pr=null,fl=new Map,hl=new Map,mr=[],mM="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function H_(t,e){switch(t){case"focusin":case"focusout":hr=null;break;case"dragenter":case"dragleave":dr=null;break;case"mouseover":case"mouseout":pr=null;break;case"pointerover":case"pointerout":fl.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":hl.delete(e.pointerId)}}function dl(t,e,i,r,l,u){return t===null||t.nativeEvent!==u?(t={blockedOn:e,domEventName:i,eventSystemFlags:r,nativeEvent:u,targetContainers:[l]},e!==null&&(e=kn(e),e!==null&&I_(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,l!==null&&e.indexOf(l)===-1&&e.push(l),t)}function gM(t,e,i,r,l){switch(e){case"focusin":return hr=dl(hr,t,e,i,r,l),!0;case"dragenter":return dr=dl(dr,t,e,i,r,l),!0;case"mouseover":return pr=dl(pr,t,e,i,r,l),!0;case"pointerover":var u=l.pointerId;return fl.set(u,dl(fl.get(u)||null,t,e,i,r,l)),!0;case"gotpointercapture":return u=l.pointerId,hl.set(u,dl(hl.get(u)||null,t,e,i,r,l)),!0}return!1}function G_(t){var e=sn(t.target);if(e!==null){var i=f(e);if(i!==null){if(e=i.tag,e===13){if(e=h(i),e!==null){t.blockedOn=e,Qt(t.priority,function(){B_(i)});return}}else if(e===31){if(e=d(i),e!==null){t.blockedOn=e,Qt(t.priority,function(){B_(i)});return}}else if(e===3&&i.stateNode.current.memoizedState.isDehydrated){t.blockedOn=i.tag===3?i.stateNode.containerInfo:null;return}}}t.blockedOn=null}function jc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var i=nd(t.nativeEvent);if(i===null){i=t.nativeEvent;var r=new i.constructor(i.type,i);Fu=r,i.target.dispatchEvent(r),Fu=null}else return e=kn(i),e!==null&&I_(e),t.blockedOn=i,!1;e.shift()}return!0}function V_(t,e,i){jc(t)&&i.delete(e)}function vM(){ad=!1,hr!==null&&jc(hr)&&(hr=null),dr!==null&&jc(dr)&&(dr=null),pr!==null&&jc(pr)&&(pr=null),fl.forEach(V_),hl.forEach(V_)}function qc(t,e){t.blockedOn===e&&(t.blockedOn=null,ad||(ad=!0,o.unstable_scheduleCallback(o.unstable_NormalPriority,vM)))}var Yc=null;function X_(t){Yc!==t&&(Yc=t,o.unstable_scheduleCallback(o.unstable_NormalPriority,function(){Yc===t&&(Yc=null);for(var e=0;e<t.length;e+=3){var i=t[e],r=t[e+1],l=t[e+2];if(typeof r!="function"){if(id(r||i)===null)continue;break}var u=kn(i);u!==null&&(t.splice(e,3),e-=3,Ff(u,{pending:!0,data:l,method:i.method,action:r},r,l))}}))}function Zs(t){function e(z){return qc(z,t)}hr!==null&&qc(hr,t),dr!==null&&qc(dr,t),pr!==null&&qc(pr,t),fl.forEach(e),hl.forEach(e);for(var i=0;i<mr.length;i++){var r=mr[i];r.blockedOn===t&&(r.blockedOn=null)}for(;0<mr.length&&(i=mr[0],i.blockedOn===null);)G_(i),i.blockedOn===null&&mr.shift();if(i=(t.ownerDocument||t).$$reactFormReplay,i!=null)for(r=0;r<i.length;r+=3){var l=i[r],u=i[r+1],v=l[Xt]||null;if(typeof u=="function")v||X_(i);else if(v){var E=null;if(u&&u.hasAttribute("formAction")){if(l=u,v=u[Xt]||null)E=v.formAction;else if(id(l)!==null)continue}else E=v.action;typeof E=="function"?i[r+1]=E:(i.splice(r,3),r-=3),X_(i)}}}function k_(){function t(u){u.canIntercept&&u.info==="react-transition"&&u.intercept({handler:function(){return new Promise(function(v){return l=v})},focusReset:"manual",scroll:"manual"})}function e(){l!==null&&(l(),l=null),r||setTimeout(i,20)}function i(){if(!r&&!navigation.transition){var u=navigation.currentEntry;u&&u.url!=null&&navigation.navigate(u.url,{state:u.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var r=!1,l=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(i,100),function(){r=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),l!==null&&(l(),l=null)}}}function rd(t){this._internalRoot=t}Wc.prototype.render=rd.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(s(409));var i=e.current,r=_i();z_(i,r,t,e,null,null)},Wc.prototype.unmount=rd.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;z_(t.current,2,null,t,null,null),Nc(),e[be]=null}};function Wc(t){this._internalRoot=t}Wc.prototype.unstable_scheduleHydration=function(t){if(t){var e=Zt();t={blockedOn:null,target:t,priority:e};for(var i=0;i<mr.length&&e!==0&&e<mr[i].priority;i++);mr.splice(i,0,t),i===0&&G_(t)}};var j_=n.version;if(j_!=="19.3.0")throw Error(s(527,j_,"19.3.0"));Ut.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(s(188)):(t=Object.keys(t).join(","),Error(s(268,t)));return t=_(e),t=t!==null?g(t):null,t=t===null?null:t.stateNode,t};var _M={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:Ct,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Zc=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Zc.isDisabled&&Zc.supportsFiber)try{De=Zc.inject(_M),Xe=Zc}catch{}}return ml.createRoot=function(t,e){if(!c(t))throw Error(s(299));var i=!1,r="",l=Og,u=zg,v=Pg;return e!=null&&(e.unstable_strictMode===!0&&(i=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onUncaughtError!==void 0&&(l=e.onUncaughtError),e.onCaughtError!==void 0&&(u=e.onCaughtError),e.onRecoverableError!==void 0&&(v=e.onRecoverableError)),e=L_(t,1,!1,null,null,i,r,null,l,u,v,k_),t[be]=e.current,zh(t),new rd(e)},ml.hydrateRoot=function(t,e,i){if(!c(t))throw Error(s(299));var r=!1,l="",u=Og,v=zg,E=Pg,z=null;return i!=null&&(i.unstable_strictMode===!0&&(r=!0),i.identifierPrefix!==void 0&&(l=i.identifierPrefix),i.onUncaughtError!==void 0&&(u=i.onUncaughtError),i.onCaughtError!==void 0&&(v=i.onCaughtError),i.onRecoverableError!==void 0&&(E=i.onRecoverableError),i.formState!==void 0&&(z=i.formState)),e=L_(t,1,!0,e,i??null,r,l,z,u,v,E,k_),e.context=O_(null),i=e.current,r=_i(),r=Lt(r),l=$a(r),l.callback=null,tr(i,l,r),i=r,e.current.lanes=i,w(e,i),fa(e),t[be]=e.current,zh(t),new Wc(e)},ml.version="19.3.0",ml}var e0;function CM(){if(e0)return ld.exports;e0=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(n){console.error(n)}}return o(),ld.exports=RM(),ld.exports}var wM=CM();const Lp="170",DM=0,n0=1,UM=2,lx=1,NM=2,Oa=3,Ar=0,ui=1,za=2,Tr=0,ss=1,uo=2,i0=3,a0=4,LM=5,ns=100,OM=101,zM=102,PM=103,IM=104,BM=200,FM=201,HM=202,GM=203,Xd=204,kd=205,VM=206,XM=207,kM=208,jM=209,qM=210,YM=211,WM=212,ZM=213,KM=214,jd=0,qd=1,Yd=2,mo=3,Wd=4,Zd=5,Kd=6,Qd=7,cx=0,QM=1,JM=2,br=0,$M=1,tE=2,eE=3,nE=4,iE=5,aE=6,rE=7,ux=300,go=301,vo=302,Jd=303,$d=304,Nu=306,tp=1e3,as=1001,ep=1002,Zi=1003,sE=1004,Kc=1005,da=1006,hd=1007,rs=1008,Ga=1009,fx=1010,hx=1011,bl=1012,Op=1013,os=1014,Pa=1015,Al=1016,zp=1017,Pp=1018,_o=1020,dx=35902,px=1021,mx=1022,Yi=1023,gx=1024,vx=1025,ho=1026,xo=1027,_x=1028,Ip=1029,xx=1030,Bp=1031,Fp=1033,Mu=33776,Eu=33777,Tu=33778,bu=33779,np=35840,ip=35841,ap=35842,rp=35843,sp=36196,op=37492,lp=37496,cp=37808,up=37809,fp=37810,hp=37811,dp=37812,pp=37813,mp=37814,gp=37815,vp=37816,_p=37817,xp=37818,yp=37819,Sp=37820,Mp=37821,Au=36492,Ep=36494,Tp=36495,yx=36283,bp=36284,Ap=36285,Rp=36286,oE=3200,lE=3201,cE=0,uE=1,Er="",Li="srgb",So="srgb-linear",Lu="linear",en="srgb",Ks=7680,r0=519,fE=512,hE=513,dE=514,Sx=515,pE=516,mE=517,gE=518,vE=519,s0=35044,o0="300 es",Ia=2e3,Cu=2001;class Mo{addEventListener(n,a){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[n]===void 0&&(s[n]=[]),s[n].indexOf(a)===-1&&s[n].push(a)}hasEventListener(n,a){if(this._listeners===void 0)return!1;const s=this._listeners;return s[n]!==void 0&&s[n].indexOf(a)!==-1}removeEventListener(n,a){if(this._listeners===void 0)return;const c=this._listeners[n];if(c!==void 0){const f=c.indexOf(a);f!==-1&&c.splice(f,1)}}dispatchEvent(n){if(this._listeners===void 0)return;const s=this._listeners[n.type];if(s!==void 0){n.target=this;const c=s.slice(0);for(let f=0,h=c.length;f<h;f++)c[f].call(this,n);n.target=null}}}const qn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],dd=Math.PI/180,Cp=180/Math.PI;function Rl(){const o=Math.random()*4294967295|0,n=Math.random()*4294967295|0,a=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(qn[o&255]+qn[o>>8&255]+qn[o>>16&255]+qn[o>>24&255]+"-"+qn[n&255]+qn[n>>8&255]+"-"+qn[n>>16&15|64]+qn[n>>24&255]+"-"+qn[a&63|128]+qn[a>>8&255]+"-"+qn[a>>16&255]+qn[a>>24&255]+qn[s&255]+qn[s>>8&255]+qn[s>>16&255]+qn[s>>24&255]).toLowerCase()}function ci(o,n,a){return Math.max(n,Math.min(a,o))}function _E(o,n){return(o%n+n)%n}function pd(o,n,a){return(1-a)*o+a*n}function gl(o,n){switch(n.constructor){case Float32Array:return o;case Uint32Array:return o/4294967295;case Uint16Array:return o/65535;case Uint8Array:return o/255;case Int32Array:return Math.max(o/2147483647,-1);case Int16Array:return Math.max(o/32767,-1);case Int8Array:return Math.max(o/127,-1);default:throw new Error("Invalid component type.")}}function li(o,n){switch(n.constructor){case Float32Array:return o;case Uint32Array:return Math.round(o*4294967295);case Uint16Array:return Math.round(o*65535);case Uint8Array:return Math.round(o*255);case Int32Array:return Math.round(o*2147483647);case Int16Array:return Math.round(o*32767);case Int8Array:return Math.round(o*127);default:throw new Error("Invalid component type.")}}class an{constructor(n=0,a=0){an.prototype.isVector2=!0,this.x=n,this.y=a}get width(){return this.x}set width(n){this.x=n}get height(){return this.y}set height(n){this.y=n}set(n,a){return this.x=n,this.y=a,this}setScalar(n){return this.x=n,this.y=n,this}setX(n){return this.x=n,this}setY(n){return this.y=n,this}setComponent(n,a){switch(n){case 0:this.x=a;break;case 1:this.y=a;break;default:throw new Error("index is out of range: "+n)}return this}getComponent(n){switch(n){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+n)}}clone(){return new this.constructor(this.x,this.y)}copy(n){return this.x=n.x,this.y=n.y,this}add(n){return this.x+=n.x,this.y+=n.y,this}addScalar(n){return this.x+=n,this.y+=n,this}addVectors(n,a){return this.x=n.x+a.x,this.y=n.y+a.y,this}addScaledVector(n,a){return this.x+=n.x*a,this.y+=n.y*a,this}sub(n){return this.x-=n.x,this.y-=n.y,this}subScalar(n){return this.x-=n,this.y-=n,this}subVectors(n,a){return this.x=n.x-a.x,this.y=n.y-a.y,this}multiply(n){return this.x*=n.x,this.y*=n.y,this}multiplyScalar(n){return this.x*=n,this.y*=n,this}divide(n){return this.x/=n.x,this.y/=n.y,this}divideScalar(n){return this.multiplyScalar(1/n)}applyMatrix3(n){const a=this.x,s=this.y,c=n.elements;return this.x=c[0]*a+c[3]*s+c[6],this.y=c[1]*a+c[4]*s+c[7],this}min(n){return this.x=Math.min(this.x,n.x),this.y=Math.min(this.y,n.y),this}max(n){return this.x=Math.max(this.x,n.x),this.y=Math.max(this.y,n.y),this}clamp(n,a){return this.x=Math.max(n.x,Math.min(a.x,this.x)),this.y=Math.max(n.y,Math.min(a.y,this.y)),this}clampScalar(n,a){return this.x=Math.max(n,Math.min(a,this.x)),this.y=Math.max(n,Math.min(a,this.y)),this}clampLength(n,a){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(n,Math.min(a,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(n){return this.x*n.x+this.y*n.y}cross(n){return this.x*n.y-this.y*n.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(n){const a=Math.sqrt(this.lengthSq()*n.lengthSq());if(a===0)return Math.PI/2;const s=this.dot(n)/a;return Math.acos(ci(s,-1,1))}distanceTo(n){return Math.sqrt(this.distanceToSquared(n))}distanceToSquared(n){const a=this.x-n.x,s=this.y-n.y;return a*a+s*s}manhattanDistanceTo(n){return Math.abs(this.x-n.x)+Math.abs(this.y-n.y)}setLength(n){return this.normalize().multiplyScalar(n)}lerp(n,a){return this.x+=(n.x-this.x)*a,this.y+=(n.y-this.y)*a,this}lerpVectors(n,a,s){return this.x=n.x+(a.x-n.x)*s,this.y=n.y+(a.y-n.y)*s,this}equals(n){return n.x===this.x&&n.y===this.y}fromArray(n,a=0){return this.x=n[a],this.y=n[a+1],this}toArray(n=[],a=0){return n[a]=this.x,n[a+1]=this.y,n}fromBufferAttribute(n,a){return this.x=n.getX(a),this.y=n.getY(a),this}rotateAround(n,a){const s=Math.cos(a),c=Math.sin(a),f=this.x-n.x,h=this.y-n.y;return this.x=f*s-h*c+n.x,this.y=f*c+h*s+n.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ae{constructor(n,a,s,c,f,h,d,m,_){Ae.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],n!==void 0&&this.set(n,a,s,c,f,h,d,m,_)}set(n,a,s,c,f,h,d,m,_){const g=this.elements;return g[0]=n,g[1]=c,g[2]=d,g[3]=a,g[4]=f,g[5]=m,g[6]=s,g[7]=h,g[8]=_,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(n){const a=this.elements,s=n.elements;return a[0]=s[0],a[1]=s[1],a[2]=s[2],a[3]=s[3],a[4]=s[4],a[5]=s[5],a[6]=s[6],a[7]=s[7],a[8]=s[8],this}extractBasis(n,a,s){return n.setFromMatrix3Column(this,0),a.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(n){const a=n.elements;return this.set(a[0],a[4],a[8],a[1],a[5],a[9],a[2],a[6],a[10]),this}multiply(n){return this.multiplyMatrices(this,n)}premultiply(n){return this.multiplyMatrices(n,this)}multiplyMatrices(n,a){const s=n.elements,c=a.elements,f=this.elements,h=s[0],d=s[3],m=s[6],_=s[1],g=s[4],p=s[7],x=s[2],M=s[5],T=s[8],R=c[0],S=c[3],y=c[6],P=c[1],O=c[4],N=c[7],et=c[2],V=c[5],I=c[8];return f[0]=h*R+d*P+m*et,f[3]=h*S+d*O+m*V,f[6]=h*y+d*N+m*I,f[1]=_*R+g*P+p*et,f[4]=_*S+g*O+p*V,f[7]=_*y+g*N+p*I,f[2]=x*R+M*P+T*et,f[5]=x*S+M*O+T*V,f[8]=x*y+M*N+T*I,this}multiplyScalar(n){const a=this.elements;return a[0]*=n,a[3]*=n,a[6]*=n,a[1]*=n,a[4]*=n,a[7]*=n,a[2]*=n,a[5]*=n,a[8]*=n,this}determinant(){const n=this.elements,a=n[0],s=n[1],c=n[2],f=n[3],h=n[4],d=n[5],m=n[6],_=n[7],g=n[8];return a*h*g-a*d*_-s*f*g+s*d*m+c*f*_-c*h*m}invert(){const n=this.elements,a=n[0],s=n[1],c=n[2],f=n[3],h=n[4],d=n[5],m=n[6],_=n[7],g=n[8],p=g*h-d*_,x=d*m-g*f,M=_*f-h*m,T=a*p+s*x+c*M;if(T===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/T;return n[0]=p*R,n[1]=(c*_-g*s)*R,n[2]=(d*s-c*h)*R,n[3]=x*R,n[4]=(g*a-c*m)*R,n[5]=(c*f-d*a)*R,n[6]=M*R,n[7]=(s*m-_*a)*R,n[8]=(h*a-s*f)*R,this}transpose(){let n;const a=this.elements;return n=a[1],a[1]=a[3],a[3]=n,n=a[2],a[2]=a[6],a[6]=n,n=a[5],a[5]=a[7],a[7]=n,this}getNormalMatrix(n){return this.setFromMatrix4(n).invert().transpose()}transposeIntoArray(n){const a=this.elements;return n[0]=a[0],n[1]=a[3],n[2]=a[6],n[3]=a[1],n[4]=a[4],n[5]=a[7],n[6]=a[2],n[7]=a[5],n[8]=a[8],this}setUvTransform(n,a,s,c,f,h,d){const m=Math.cos(f),_=Math.sin(f);return this.set(s*m,s*_,-s*(m*h+_*d)+h+n,-c*_,c*m,-c*(-_*h+m*d)+d+a,0,0,1),this}scale(n,a){return this.premultiply(md.makeScale(n,a)),this}rotate(n){return this.premultiply(md.makeRotation(-n)),this}translate(n,a){return this.premultiply(md.makeTranslation(n,a)),this}makeTranslation(n,a){return n.isVector2?this.set(1,0,n.x,0,1,n.y,0,0,1):this.set(1,0,n,0,1,a,0,0,1),this}makeRotation(n){const a=Math.cos(n),s=Math.sin(n);return this.set(a,-s,0,s,a,0,0,0,1),this}makeScale(n,a){return this.set(n,0,0,0,a,0,0,0,1),this}equals(n){const a=this.elements,s=n.elements;for(let c=0;c<9;c++)if(a[c]!==s[c])return!1;return!0}fromArray(n,a=0){for(let s=0;s<9;s++)this.elements[s]=n[s+a];return this}toArray(n=[],a=0){const s=this.elements;return n[a]=s[0],n[a+1]=s[1],n[a+2]=s[2],n[a+3]=s[3],n[a+4]=s[4],n[a+5]=s[5],n[a+6]=s[6],n[a+7]=s[7],n[a+8]=s[8],n}clone(){return new this.constructor().fromArray(this.elements)}}const md=new Ae;function Mx(o){for(let n=o.length-1;n>=0;--n)if(o[n]>=65535)return!0;return!1}function wu(o){return document.createElementNS("http://www.w3.org/1999/xhtml",o)}function xE(){const o=wu("canvas");return o.style.display="block",o}const l0={};function El(o){o in l0||(l0[o]=!0,console.warn(o))}function yE(o,n,a){return new Promise(function(s,c){function f(){switch(o.clientWaitSync(n,o.SYNC_FLUSH_COMMANDS_BIT,0)){case o.WAIT_FAILED:c();break;case o.TIMEOUT_EXPIRED:setTimeout(f,a);break;default:s()}}setTimeout(f,a)})}function SE(o){const n=o.elements;n[2]=.5*n[2]+.5*n[3],n[6]=.5*n[6]+.5*n[7],n[10]=.5*n[10]+.5*n[11],n[14]=.5*n[14]+.5*n[15]}function ME(o){const n=o.elements;n[11]===-1?(n[10]=-n[10]-1,n[14]=-n[14]):(n[10]=-n[10],n[14]=-n[14]+1)}const Ve={enabled:!0,workingColorSpace:So,spaces:{},convert:function(o,n,a){return this.enabled===!1||n===a||!n||!a||(this.spaces[n].transfer===en&&(o.r=Fa(o.r),o.g=Fa(o.g),o.b=Fa(o.b)),this.spaces[n].primaries!==this.spaces[a].primaries&&(o.applyMatrix3(this.spaces[n].toXYZ),o.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===en&&(o.r=po(o.r),o.g=po(o.g),o.b=po(o.b))),o},fromWorkingColorSpace:function(o,n){return this.convert(o,this.workingColorSpace,n)},toWorkingColorSpace:function(o,n){return this.convert(o,n,this.workingColorSpace)},getPrimaries:function(o){return this.spaces[o].primaries},getTransfer:function(o){return o===Er?Lu:this.spaces[o].transfer},getLuminanceCoefficients:function(o,n=this.workingColorSpace){return o.fromArray(this.spaces[n].luminanceCoefficients)},define:function(o){Object.assign(this.spaces,o)},_getMatrix:function(o,n,a){return o.copy(this.spaces[n].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(o){return this.spaces[o].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(o=this.workingColorSpace){return this.spaces[o].workingColorSpaceConfig.unpackColorSpace}};function Fa(o){return o<.04045?o*.0773993808:Math.pow(o*.9478672986+.0521327014,2.4)}function po(o){return o<.0031308?o*12.92:1.055*Math.pow(o,.41666)-.055}const c0=[.64,.33,.3,.6,.15,.06],u0=[.2126,.7152,.0722],f0=[.3127,.329],h0=new Ae().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),d0=new Ae().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ve.define({[So]:{primaries:c0,whitePoint:f0,transfer:Lu,toXYZ:h0,fromXYZ:d0,luminanceCoefficients:u0,workingColorSpaceConfig:{unpackColorSpace:Li},outputColorSpaceConfig:{drawingBufferColorSpace:Li}},[Li]:{primaries:c0,whitePoint:f0,transfer:en,toXYZ:h0,fromXYZ:d0,luminanceCoefficients:u0,outputColorSpaceConfig:{drawingBufferColorSpace:Li}}});let Qs;class EE{static getDataURL(n){if(/^data:/i.test(n.src)||typeof HTMLCanvasElement>"u")return n.src;let a;if(n instanceof HTMLCanvasElement)a=n;else{Qs===void 0&&(Qs=wu("canvas")),Qs.width=n.width,Qs.height=n.height;const s=Qs.getContext("2d");n instanceof ImageData?s.putImageData(n,0,0):s.drawImage(n,0,0,n.width,n.height),a=Qs}return a.width>2048||a.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",n),a.toDataURL("image/jpeg",.6)):a.toDataURL("image/png")}static sRGBToLinear(n){if(typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap){const a=wu("canvas");a.width=n.width,a.height=n.height;const s=a.getContext("2d");s.drawImage(n,0,0,n.width,n.height);const c=s.getImageData(0,0,n.width,n.height),f=c.data;for(let h=0;h<f.length;h++)f[h]=Fa(f[h]/255)*255;return s.putImageData(c,0,0),a}else if(n.data){const a=n.data.slice(0);for(let s=0;s<a.length;s++)a instanceof Uint8Array||a instanceof Uint8ClampedArray?a[s]=Math.floor(Fa(a[s]/255)*255):a[s]=Fa(a[s]);return{data:a,width:n.width,height:n.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),n}}let TE=0;class Ex{constructor(n=null){this.isSource=!0,Object.defineProperty(this,"id",{value:TE++}),this.uuid=Rl(),this.data=n,this.dataReady=!0,this.version=0}set needsUpdate(n){n===!0&&this.version++}toJSON(n){const a=n===void 0||typeof n=="string";if(!a&&n.images[this.uuid]!==void 0)return n.images[this.uuid];const s={uuid:this.uuid,url:""},c=this.data;if(c!==null){let f;if(Array.isArray(c)){f=[];for(let h=0,d=c.length;h<d;h++)c[h].isDataTexture?f.push(gd(c[h].image)):f.push(gd(c[h]))}else f=gd(c);s.url=f}return a||(n.images[this.uuid]=s),s}}function gd(o){return typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&o instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&o instanceof ImageBitmap?EE.getDataURL(o):o.data?{data:Array.from(o.data),width:o.width,height:o.height,type:o.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let bE=0;class fi extends Mo{constructor(n=fi.DEFAULT_IMAGE,a=fi.DEFAULT_MAPPING,s=as,c=as,f=da,h=rs,d=Yi,m=Ga,_=fi.DEFAULT_ANISOTROPY,g=Er){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:bE++}),this.uuid=Rl(),this.name="",this.source=new Ex(n),this.mipmaps=[],this.mapping=a,this.channel=0,this.wrapS=s,this.wrapT=c,this.magFilter=f,this.minFilter=h,this.anisotropy=_,this.format=d,this.internalFormat=null,this.type=m,this.offset=new an(0,0),this.repeat=new an(1,1),this.center=new an(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ae,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=g,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(n=null){this.source.data=n}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(n){return this.name=n.name,this.source=n.source,this.mipmaps=n.mipmaps.slice(0),this.mapping=n.mapping,this.channel=n.channel,this.wrapS=n.wrapS,this.wrapT=n.wrapT,this.magFilter=n.magFilter,this.minFilter=n.minFilter,this.anisotropy=n.anisotropy,this.format=n.format,this.internalFormat=n.internalFormat,this.type=n.type,this.offset.copy(n.offset),this.repeat.copy(n.repeat),this.center.copy(n.center),this.rotation=n.rotation,this.matrixAutoUpdate=n.matrixAutoUpdate,this.matrix.copy(n.matrix),this.generateMipmaps=n.generateMipmaps,this.premultiplyAlpha=n.premultiplyAlpha,this.flipY=n.flipY,this.unpackAlignment=n.unpackAlignment,this.colorSpace=n.colorSpace,this.userData=JSON.parse(JSON.stringify(n.userData)),this.needsUpdate=!0,this}toJSON(n){const a=n===void 0||typeof n=="string";if(!a&&n.textures[this.uuid]!==void 0)return n.textures[this.uuid];const s={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(n).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),a||(n.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(n){if(this.mapping!==ux)return n;if(n.applyMatrix3(this.matrix),n.x<0||n.x>1)switch(this.wrapS){case tp:n.x=n.x-Math.floor(n.x);break;case as:n.x=n.x<0?0:1;break;case ep:Math.abs(Math.floor(n.x)%2)===1?n.x=Math.ceil(n.x)-n.x:n.x=n.x-Math.floor(n.x);break}if(n.y<0||n.y>1)switch(this.wrapT){case tp:n.y=n.y-Math.floor(n.y);break;case as:n.y=n.y<0?0:1;break;case ep:Math.abs(Math.floor(n.y)%2)===1?n.y=Math.ceil(n.y)-n.y:n.y=n.y-Math.floor(n.y);break}return this.flipY&&(n.y=1-n.y),n}set needsUpdate(n){n===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(n){n===!0&&this.pmremVersion++}}fi.DEFAULT_IMAGE=null;fi.DEFAULT_MAPPING=ux;fi.DEFAULT_ANISOTROPY=1;class Mn{constructor(n=0,a=0,s=0,c=1){Mn.prototype.isVector4=!0,this.x=n,this.y=a,this.z=s,this.w=c}get width(){return this.z}set width(n){this.z=n}get height(){return this.w}set height(n){this.w=n}set(n,a,s,c){return this.x=n,this.y=a,this.z=s,this.w=c,this}setScalar(n){return this.x=n,this.y=n,this.z=n,this.w=n,this}setX(n){return this.x=n,this}setY(n){return this.y=n,this}setZ(n){return this.z=n,this}setW(n){return this.w=n,this}setComponent(n,a){switch(n){case 0:this.x=a;break;case 1:this.y=a;break;case 2:this.z=a;break;case 3:this.w=a;break;default:throw new Error("index is out of range: "+n)}return this}getComponent(n){switch(n){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+n)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(n){return this.x=n.x,this.y=n.y,this.z=n.z,this.w=n.w!==void 0?n.w:1,this}add(n){return this.x+=n.x,this.y+=n.y,this.z+=n.z,this.w+=n.w,this}addScalar(n){return this.x+=n,this.y+=n,this.z+=n,this.w+=n,this}addVectors(n,a){return this.x=n.x+a.x,this.y=n.y+a.y,this.z=n.z+a.z,this.w=n.w+a.w,this}addScaledVector(n,a){return this.x+=n.x*a,this.y+=n.y*a,this.z+=n.z*a,this.w+=n.w*a,this}sub(n){return this.x-=n.x,this.y-=n.y,this.z-=n.z,this.w-=n.w,this}subScalar(n){return this.x-=n,this.y-=n,this.z-=n,this.w-=n,this}subVectors(n,a){return this.x=n.x-a.x,this.y=n.y-a.y,this.z=n.z-a.z,this.w=n.w-a.w,this}multiply(n){return this.x*=n.x,this.y*=n.y,this.z*=n.z,this.w*=n.w,this}multiplyScalar(n){return this.x*=n,this.y*=n,this.z*=n,this.w*=n,this}applyMatrix4(n){const a=this.x,s=this.y,c=this.z,f=this.w,h=n.elements;return this.x=h[0]*a+h[4]*s+h[8]*c+h[12]*f,this.y=h[1]*a+h[5]*s+h[9]*c+h[13]*f,this.z=h[2]*a+h[6]*s+h[10]*c+h[14]*f,this.w=h[3]*a+h[7]*s+h[11]*c+h[15]*f,this}divide(n){return this.x/=n.x,this.y/=n.y,this.z/=n.z,this.w/=n.w,this}divideScalar(n){return this.multiplyScalar(1/n)}setAxisAngleFromQuaternion(n){this.w=2*Math.acos(n.w);const a=Math.sqrt(1-n.w*n.w);return a<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=n.x/a,this.y=n.y/a,this.z=n.z/a),this}setAxisAngleFromRotationMatrix(n){let a,s,c,f;const m=n.elements,_=m[0],g=m[4],p=m[8],x=m[1],M=m[5],T=m[9],R=m[2],S=m[6],y=m[10];if(Math.abs(g-x)<.01&&Math.abs(p-R)<.01&&Math.abs(T-S)<.01){if(Math.abs(g+x)<.1&&Math.abs(p+R)<.1&&Math.abs(T+S)<.1&&Math.abs(_+M+y-3)<.1)return this.set(1,0,0,0),this;a=Math.PI;const O=(_+1)/2,N=(M+1)/2,et=(y+1)/2,V=(g+x)/4,I=(p+R)/4,q=(T+S)/4;return O>N&&O>et?O<.01?(s=0,c=.707106781,f=.707106781):(s=Math.sqrt(O),c=V/s,f=I/s):N>et?N<.01?(s=.707106781,c=0,f=.707106781):(c=Math.sqrt(N),s=V/c,f=q/c):et<.01?(s=.707106781,c=.707106781,f=0):(f=Math.sqrt(et),s=I/f,c=q/f),this.set(s,c,f,a),this}let P=Math.sqrt((S-T)*(S-T)+(p-R)*(p-R)+(x-g)*(x-g));return Math.abs(P)<.001&&(P=1),this.x=(S-T)/P,this.y=(p-R)/P,this.z=(x-g)/P,this.w=Math.acos((_+M+y-1)/2),this}setFromMatrixPosition(n){const a=n.elements;return this.x=a[12],this.y=a[13],this.z=a[14],this.w=a[15],this}min(n){return this.x=Math.min(this.x,n.x),this.y=Math.min(this.y,n.y),this.z=Math.min(this.z,n.z),this.w=Math.min(this.w,n.w),this}max(n){return this.x=Math.max(this.x,n.x),this.y=Math.max(this.y,n.y),this.z=Math.max(this.z,n.z),this.w=Math.max(this.w,n.w),this}clamp(n,a){return this.x=Math.max(n.x,Math.min(a.x,this.x)),this.y=Math.max(n.y,Math.min(a.y,this.y)),this.z=Math.max(n.z,Math.min(a.z,this.z)),this.w=Math.max(n.w,Math.min(a.w,this.w)),this}clampScalar(n,a){return this.x=Math.max(n,Math.min(a,this.x)),this.y=Math.max(n,Math.min(a,this.y)),this.z=Math.max(n,Math.min(a,this.z)),this.w=Math.max(n,Math.min(a,this.w)),this}clampLength(n,a){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(n,Math.min(a,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(n){return this.x*n.x+this.y*n.y+this.z*n.z+this.w*n.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(n){return this.normalize().multiplyScalar(n)}lerp(n,a){return this.x+=(n.x-this.x)*a,this.y+=(n.y-this.y)*a,this.z+=(n.z-this.z)*a,this.w+=(n.w-this.w)*a,this}lerpVectors(n,a,s){return this.x=n.x+(a.x-n.x)*s,this.y=n.y+(a.y-n.y)*s,this.z=n.z+(a.z-n.z)*s,this.w=n.w+(a.w-n.w)*s,this}equals(n){return n.x===this.x&&n.y===this.y&&n.z===this.z&&n.w===this.w}fromArray(n,a=0){return this.x=n[a],this.y=n[a+1],this.z=n[a+2],this.w=n[a+3],this}toArray(n=[],a=0){return n[a]=this.x,n[a+1]=this.y,n[a+2]=this.z,n[a+3]=this.w,n}fromBufferAttribute(n,a){return this.x=n.getX(a),this.y=n.getY(a),this.z=n.getZ(a),this.w=n.getW(a),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class AE extends Mo{constructor(n=1,a=1,s={}){super(),this.isRenderTarget=!0,this.width=n,this.height=a,this.depth=1,this.scissor=new Mn(0,0,n,a),this.scissorTest=!1,this.viewport=new Mn(0,0,n,a);const c={width:n,height:a,depth:1};s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:da,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},s);const f=new fi(c,s.mapping,s.wrapS,s.wrapT,s.magFilter,s.minFilter,s.format,s.type,s.anisotropy,s.colorSpace);f.flipY=!1,f.generateMipmaps=s.generateMipmaps,f.internalFormat=s.internalFormat,this.textures=[];const h=s.count;for(let d=0;d<h;d++)this.textures[d]=f.clone(),this.textures[d].isRenderTargetTexture=!0;this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.resolveDepthBuffer=s.resolveDepthBuffer,this.resolveStencilBuffer=s.resolveStencilBuffer,this.depthTexture=s.depthTexture,this.samples=s.samples}get texture(){return this.textures[0]}set texture(n){this.textures[0]=n}setSize(n,a,s=1){if(this.width!==n||this.height!==a||this.depth!==s){this.width=n,this.height=a,this.depth=s;for(let c=0,f=this.textures.length;c<f;c++)this.textures[c].image.width=n,this.textures[c].image.height=a,this.textures[c].image.depth=s;this.dispose()}this.viewport.set(0,0,n,a),this.scissor.set(0,0,n,a)}clone(){return new this.constructor().copy(this)}copy(n){this.width=n.width,this.height=n.height,this.depth=n.depth,this.scissor.copy(n.scissor),this.scissorTest=n.scissorTest,this.viewport.copy(n.viewport),this.textures.length=0;for(let s=0,c=n.textures.length;s<c;s++)this.textures[s]=n.textures[s].clone(),this.textures[s].isRenderTargetTexture=!0;const a=Object.assign({},n.texture.image);return this.texture.source=new Ex(a),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,n.depthTexture!==null&&(this.depthTexture=n.depthTexture.clone()),this.samples=n.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ls extends AE{constructor(n=1,a=1,s={}){super(n,a,s),this.isWebGLRenderTarget=!0}}class Tx extends fi{constructor(n=null,a=1,s=1,c=1){super(null),this.isDataArrayTexture=!0,this.image={data:n,width:a,height:s,depth:c},this.magFilter=Zi,this.minFilter=Zi,this.wrapR=as,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(n){this.layerUpdates.add(n)}clearLayerUpdates(){this.layerUpdates.clear()}}class RE extends fi{constructor(n=null,a=1,s=1,c=1){super(null),this.isData3DTexture=!0,this.image={data:n,width:a,height:s,depth:c},this.magFilter=Zi,this.minFilter=Zi,this.wrapR=as,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Cl{constructor(n=0,a=0,s=0,c=1){this.isQuaternion=!0,this._x=n,this._y=a,this._z=s,this._w=c}static slerpFlat(n,a,s,c,f,h,d){let m=s[c+0],_=s[c+1],g=s[c+2],p=s[c+3];const x=f[h+0],M=f[h+1],T=f[h+2],R=f[h+3];if(d===0){n[a+0]=m,n[a+1]=_,n[a+2]=g,n[a+3]=p;return}if(d===1){n[a+0]=x,n[a+1]=M,n[a+2]=T,n[a+3]=R;return}if(p!==R||m!==x||_!==M||g!==T){let S=1-d;const y=m*x+_*M+g*T+p*R,P=y>=0?1:-1,O=1-y*y;if(O>Number.EPSILON){const et=Math.sqrt(O),V=Math.atan2(et,y*P);S=Math.sin(S*V)/et,d=Math.sin(d*V)/et}const N=d*P;if(m=m*S+x*N,_=_*S+M*N,g=g*S+T*N,p=p*S+R*N,S===1-d){const et=1/Math.sqrt(m*m+_*_+g*g+p*p);m*=et,_*=et,g*=et,p*=et}}n[a]=m,n[a+1]=_,n[a+2]=g,n[a+3]=p}static multiplyQuaternionsFlat(n,a,s,c,f,h){const d=s[c],m=s[c+1],_=s[c+2],g=s[c+3],p=f[h],x=f[h+1],M=f[h+2],T=f[h+3];return n[a]=d*T+g*p+m*M-_*x,n[a+1]=m*T+g*x+_*p-d*M,n[a+2]=_*T+g*M+d*x-m*p,n[a+3]=g*T-d*p-m*x-_*M,n}get x(){return this._x}set x(n){this._x=n,this._onChangeCallback()}get y(){return this._y}set y(n){this._y=n,this._onChangeCallback()}get z(){return this._z}set z(n){this._z=n,this._onChangeCallback()}get w(){return this._w}set w(n){this._w=n,this._onChangeCallback()}set(n,a,s,c){return this._x=n,this._y=a,this._z=s,this._w=c,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(n){return this._x=n.x,this._y=n.y,this._z=n.z,this._w=n.w,this._onChangeCallback(),this}setFromEuler(n,a=!0){const s=n._x,c=n._y,f=n._z,h=n._order,d=Math.cos,m=Math.sin,_=d(s/2),g=d(c/2),p=d(f/2),x=m(s/2),M=m(c/2),T=m(f/2);switch(h){case"XYZ":this._x=x*g*p+_*M*T,this._y=_*M*p-x*g*T,this._z=_*g*T+x*M*p,this._w=_*g*p-x*M*T;break;case"YXZ":this._x=x*g*p+_*M*T,this._y=_*M*p-x*g*T,this._z=_*g*T-x*M*p,this._w=_*g*p+x*M*T;break;case"ZXY":this._x=x*g*p-_*M*T,this._y=_*M*p+x*g*T,this._z=_*g*T+x*M*p,this._w=_*g*p-x*M*T;break;case"ZYX":this._x=x*g*p-_*M*T,this._y=_*M*p+x*g*T,this._z=_*g*T-x*M*p,this._w=_*g*p+x*M*T;break;case"YZX":this._x=x*g*p+_*M*T,this._y=_*M*p+x*g*T,this._z=_*g*T-x*M*p,this._w=_*g*p-x*M*T;break;case"XZY":this._x=x*g*p-_*M*T,this._y=_*M*p-x*g*T,this._z=_*g*T+x*M*p,this._w=_*g*p+x*M*T;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+h)}return a===!0&&this._onChangeCallback(),this}setFromAxisAngle(n,a){const s=a/2,c=Math.sin(s);return this._x=n.x*c,this._y=n.y*c,this._z=n.z*c,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(n){const a=n.elements,s=a[0],c=a[4],f=a[8],h=a[1],d=a[5],m=a[9],_=a[2],g=a[6],p=a[10],x=s+d+p;if(x>0){const M=.5/Math.sqrt(x+1);this._w=.25/M,this._x=(g-m)*M,this._y=(f-_)*M,this._z=(h-c)*M}else if(s>d&&s>p){const M=2*Math.sqrt(1+s-d-p);this._w=(g-m)/M,this._x=.25*M,this._y=(c+h)/M,this._z=(f+_)/M}else if(d>p){const M=2*Math.sqrt(1+d-s-p);this._w=(f-_)/M,this._x=(c+h)/M,this._y=.25*M,this._z=(m+g)/M}else{const M=2*Math.sqrt(1+p-s-d);this._w=(h-c)/M,this._x=(f+_)/M,this._y=(m+g)/M,this._z=.25*M}return this._onChangeCallback(),this}setFromUnitVectors(n,a){let s=n.dot(a)+1;return s<Number.EPSILON?(s=0,Math.abs(n.x)>Math.abs(n.z)?(this._x=-n.y,this._y=n.x,this._z=0,this._w=s):(this._x=0,this._y=-n.z,this._z=n.y,this._w=s)):(this._x=n.y*a.z-n.z*a.y,this._y=n.z*a.x-n.x*a.z,this._z=n.x*a.y-n.y*a.x,this._w=s),this.normalize()}angleTo(n){return 2*Math.acos(Math.abs(ci(this.dot(n),-1,1)))}rotateTowards(n,a){const s=this.angleTo(n);if(s===0)return this;const c=Math.min(1,a/s);return this.slerp(n,c),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(n){return this._x*n._x+this._y*n._y+this._z*n._z+this._w*n._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let n=this.length();return n===0?(this._x=0,this._y=0,this._z=0,this._w=1):(n=1/n,this._x=this._x*n,this._y=this._y*n,this._z=this._z*n,this._w=this._w*n),this._onChangeCallback(),this}multiply(n){return this.multiplyQuaternions(this,n)}premultiply(n){return this.multiplyQuaternions(n,this)}multiplyQuaternions(n,a){const s=n._x,c=n._y,f=n._z,h=n._w,d=a._x,m=a._y,_=a._z,g=a._w;return this._x=s*g+h*d+c*_-f*m,this._y=c*g+h*m+f*d-s*_,this._z=f*g+h*_+s*m-c*d,this._w=h*g-s*d-c*m-f*_,this._onChangeCallback(),this}slerp(n,a){if(a===0)return this;if(a===1)return this.copy(n);const s=this._x,c=this._y,f=this._z,h=this._w;let d=h*n._w+s*n._x+c*n._y+f*n._z;if(d<0?(this._w=-n._w,this._x=-n._x,this._y=-n._y,this._z=-n._z,d=-d):this.copy(n),d>=1)return this._w=h,this._x=s,this._y=c,this._z=f,this;const m=1-d*d;if(m<=Number.EPSILON){const M=1-a;return this._w=M*h+a*this._w,this._x=M*s+a*this._x,this._y=M*c+a*this._y,this._z=M*f+a*this._z,this.normalize(),this}const _=Math.sqrt(m),g=Math.atan2(_,d),p=Math.sin((1-a)*g)/_,x=Math.sin(a*g)/_;return this._w=h*p+this._w*x,this._x=s*p+this._x*x,this._y=c*p+this._y*x,this._z=f*p+this._z*x,this._onChangeCallback(),this}slerpQuaternions(n,a,s){return this.copy(n).slerp(a,s)}random(){const n=2*Math.PI*Math.random(),a=2*Math.PI*Math.random(),s=Math.random(),c=Math.sqrt(1-s),f=Math.sqrt(s);return this.set(c*Math.sin(n),c*Math.cos(n),f*Math.sin(a),f*Math.cos(a))}equals(n){return n._x===this._x&&n._y===this._y&&n._z===this._z&&n._w===this._w}fromArray(n,a=0){return this._x=n[a],this._y=n[a+1],this._z=n[a+2],this._w=n[a+3],this._onChangeCallback(),this}toArray(n=[],a=0){return n[a]=this._x,n[a+1]=this._y,n[a+2]=this._z,n[a+3]=this._w,n}fromBufferAttribute(n,a){return this._x=n.getX(a),this._y=n.getY(a),this._z=n.getZ(a),this._w=n.getW(a),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(n){return this._onChangeCallback=n,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ft{constructor(n=0,a=0,s=0){ft.prototype.isVector3=!0,this.x=n,this.y=a,this.z=s}set(n,a,s){return s===void 0&&(s=this.z),this.x=n,this.y=a,this.z=s,this}setScalar(n){return this.x=n,this.y=n,this.z=n,this}setX(n){return this.x=n,this}setY(n){return this.y=n,this}setZ(n){return this.z=n,this}setComponent(n,a){switch(n){case 0:this.x=a;break;case 1:this.y=a;break;case 2:this.z=a;break;default:throw new Error("index is out of range: "+n)}return this}getComponent(n){switch(n){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+n)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(n){return this.x=n.x,this.y=n.y,this.z=n.z,this}add(n){return this.x+=n.x,this.y+=n.y,this.z+=n.z,this}addScalar(n){return this.x+=n,this.y+=n,this.z+=n,this}addVectors(n,a){return this.x=n.x+a.x,this.y=n.y+a.y,this.z=n.z+a.z,this}addScaledVector(n,a){return this.x+=n.x*a,this.y+=n.y*a,this.z+=n.z*a,this}sub(n){return this.x-=n.x,this.y-=n.y,this.z-=n.z,this}subScalar(n){return this.x-=n,this.y-=n,this.z-=n,this}subVectors(n,a){return this.x=n.x-a.x,this.y=n.y-a.y,this.z=n.z-a.z,this}multiply(n){return this.x*=n.x,this.y*=n.y,this.z*=n.z,this}multiplyScalar(n){return this.x*=n,this.y*=n,this.z*=n,this}multiplyVectors(n,a){return this.x=n.x*a.x,this.y=n.y*a.y,this.z=n.z*a.z,this}applyEuler(n){return this.applyQuaternion(p0.setFromEuler(n))}applyAxisAngle(n,a){return this.applyQuaternion(p0.setFromAxisAngle(n,a))}applyMatrix3(n){const a=this.x,s=this.y,c=this.z,f=n.elements;return this.x=f[0]*a+f[3]*s+f[6]*c,this.y=f[1]*a+f[4]*s+f[7]*c,this.z=f[2]*a+f[5]*s+f[8]*c,this}applyNormalMatrix(n){return this.applyMatrix3(n).normalize()}applyMatrix4(n){const a=this.x,s=this.y,c=this.z,f=n.elements,h=1/(f[3]*a+f[7]*s+f[11]*c+f[15]);return this.x=(f[0]*a+f[4]*s+f[8]*c+f[12])*h,this.y=(f[1]*a+f[5]*s+f[9]*c+f[13])*h,this.z=(f[2]*a+f[6]*s+f[10]*c+f[14])*h,this}applyQuaternion(n){const a=this.x,s=this.y,c=this.z,f=n.x,h=n.y,d=n.z,m=n.w,_=2*(h*c-d*s),g=2*(d*a-f*c),p=2*(f*s-h*a);return this.x=a+m*_+h*p-d*g,this.y=s+m*g+d*_-f*p,this.z=c+m*p+f*g-h*_,this}project(n){return this.applyMatrix4(n.matrixWorldInverse).applyMatrix4(n.projectionMatrix)}unproject(n){return this.applyMatrix4(n.projectionMatrixInverse).applyMatrix4(n.matrixWorld)}transformDirection(n){const a=this.x,s=this.y,c=this.z,f=n.elements;return this.x=f[0]*a+f[4]*s+f[8]*c,this.y=f[1]*a+f[5]*s+f[9]*c,this.z=f[2]*a+f[6]*s+f[10]*c,this.normalize()}divide(n){return this.x/=n.x,this.y/=n.y,this.z/=n.z,this}divideScalar(n){return this.multiplyScalar(1/n)}min(n){return this.x=Math.min(this.x,n.x),this.y=Math.min(this.y,n.y),this.z=Math.min(this.z,n.z),this}max(n){return this.x=Math.max(this.x,n.x),this.y=Math.max(this.y,n.y),this.z=Math.max(this.z,n.z),this}clamp(n,a){return this.x=Math.max(n.x,Math.min(a.x,this.x)),this.y=Math.max(n.y,Math.min(a.y,this.y)),this.z=Math.max(n.z,Math.min(a.z,this.z)),this}clampScalar(n,a){return this.x=Math.max(n,Math.min(a,this.x)),this.y=Math.max(n,Math.min(a,this.y)),this.z=Math.max(n,Math.min(a,this.z)),this}clampLength(n,a){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(n,Math.min(a,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(n){return this.x*n.x+this.y*n.y+this.z*n.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(n){return this.normalize().multiplyScalar(n)}lerp(n,a){return this.x+=(n.x-this.x)*a,this.y+=(n.y-this.y)*a,this.z+=(n.z-this.z)*a,this}lerpVectors(n,a,s){return this.x=n.x+(a.x-n.x)*s,this.y=n.y+(a.y-n.y)*s,this.z=n.z+(a.z-n.z)*s,this}cross(n){return this.crossVectors(this,n)}crossVectors(n,a){const s=n.x,c=n.y,f=n.z,h=a.x,d=a.y,m=a.z;return this.x=c*m-f*d,this.y=f*h-s*m,this.z=s*d-c*h,this}projectOnVector(n){const a=n.lengthSq();if(a===0)return this.set(0,0,0);const s=n.dot(this)/a;return this.copy(n).multiplyScalar(s)}projectOnPlane(n){return vd.copy(this).projectOnVector(n),this.sub(vd)}reflect(n){return this.sub(vd.copy(n).multiplyScalar(2*this.dot(n)))}angleTo(n){const a=Math.sqrt(this.lengthSq()*n.lengthSq());if(a===0)return Math.PI/2;const s=this.dot(n)/a;return Math.acos(ci(s,-1,1))}distanceTo(n){return Math.sqrt(this.distanceToSquared(n))}distanceToSquared(n){const a=this.x-n.x,s=this.y-n.y,c=this.z-n.z;return a*a+s*s+c*c}manhattanDistanceTo(n){return Math.abs(this.x-n.x)+Math.abs(this.y-n.y)+Math.abs(this.z-n.z)}setFromSpherical(n){return this.setFromSphericalCoords(n.radius,n.phi,n.theta)}setFromSphericalCoords(n,a,s){const c=Math.sin(a)*n;return this.x=c*Math.sin(s),this.y=Math.cos(a)*n,this.z=c*Math.cos(s),this}setFromCylindrical(n){return this.setFromCylindricalCoords(n.radius,n.theta,n.y)}setFromCylindricalCoords(n,a,s){return this.x=n*Math.sin(a),this.y=s,this.z=n*Math.cos(a),this}setFromMatrixPosition(n){const a=n.elements;return this.x=a[12],this.y=a[13],this.z=a[14],this}setFromMatrixScale(n){const a=this.setFromMatrixColumn(n,0).length(),s=this.setFromMatrixColumn(n,1).length(),c=this.setFromMatrixColumn(n,2).length();return this.x=a,this.y=s,this.z=c,this}setFromMatrixColumn(n,a){return this.fromArray(n.elements,a*4)}setFromMatrix3Column(n,a){return this.fromArray(n.elements,a*3)}setFromEuler(n){return this.x=n._x,this.y=n._y,this.z=n._z,this}setFromColor(n){return this.x=n.r,this.y=n.g,this.z=n.b,this}equals(n){return n.x===this.x&&n.y===this.y&&n.z===this.z}fromArray(n,a=0){return this.x=n[a],this.y=n[a+1],this.z=n[a+2],this}toArray(n=[],a=0){return n[a]=this.x,n[a+1]=this.y,n[a+2]=this.z,n}fromBufferAttribute(n,a){return this.x=n.getX(a),this.y=n.getY(a),this.z=n.getZ(a),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const n=Math.random()*Math.PI*2,a=Math.random()*2-1,s=Math.sqrt(1-a*a);return this.x=s*Math.cos(n),this.y=a,this.z=s*Math.sin(n),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const vd=new ft,p0=new Cl;class wl{constructor(n=new ft(1/0,1/0,1/0),a=new ft(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=n,this.max=a}set(n,a){return this.min.copy(n),this.max.copy(a),this}setFromArray(n){this.makeEmpty();for(let a=0,s=n.length;a<s;a+=3)this.expandByPoint(Xi.fromArray(n,a));return this}setFromBufferAttribute(n){this.makeEmpty();for(let a=0,s=n.count;a<s;a++)this.expandByPoint(Xi.fromBufferAttribute(n,a));return this}setFromPoints(n){this.makeEmpty();for(let a=0,s=n.length;a<s;a++)this.expandByPoint(n[a]);return this}setFromCenterAndSize(n,a){const s=Xi.copy(a).multiplyScalar(.5);return this.min.copy(n).sub(s),this.max.copy(n).add(s),this}setFromObject(n,a=!1){return this.makeEmpty(),this.expandByObject(n,a)}clone(){return new this.constructor().copy(this)}copy(n){return this.min.copy(n.min),this.max.copy(n.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(n){return this.isEmpty()?n.set(0,0,0):n.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(n){return this.isEmpty()?n.set(0,0,0):n.subVectors(this.max,this.min)}expandByPoint(n){return this.min.min(n),this.max.max(n),this}expandByVector(n){return this.min.sub(n),this.max.add(n),this}expandByScalar(n){return this.min.addScalar(-n),this.max.addScalar(n),this}expandByObject(n,a=!1){n.updateWorldMatrix(!1,!1);const s=n.geometry;if(s!==void 0){const f=s.getAttribute("position");if(a===!0&&f!==void 0&&n.isInstancedMesh!==!0)for(let h=0,d=f.count;h<d;h++)n.isMesh===!0?n.getVertexPosition(h,Xi):Xi.fromBufferAttribute(f,h),Xi.applyMatrix4(n.matrixWorld),this.expandByPoint(Xi);else n.boundingBox!==void 0?(n.boundingBox===null&&n.computeBoundingBox(),Qc.copy(n.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),Qc.copy(s.boundingBox)),Qc.applyMatrix4(n.matrixWorld),this.union(Qc)}const c=n.children;for(let f=0,h=c.length;f<h;f++)this.expandByObject(c[f],a);return this}containsPoint(n){return n.x>=this.min.x&&n.x<=this.max.x&&n.y>=this.min.y&&n.y<=this.max.y&&n.z>=this.min.z&&n.z<=this.max.z}containsBox(n){return this.min.x<=n.min.x&&n.max.x<=this.max.x&&this.min.y<=n.min.y&&n.max.y<=this.max.y&&this.min.z<=n.min.z&&n.max.z<=this.max.z}getParameter(n,a){return a.set((n.x-this.min.x)/(this.max.x-this.min.x),(n.y-this.min.y)/(this.max.y-this.min.y),(n.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(n){return n.max.x>=this.min.x&&n.min.x<=this.max.x&&n.max.y>=this.min.y&&n.min.y<=this.max.y&&n.max.z>=this.min.z&&n.min.z<=this.max.z}intersectsSphere(n){return this.clampPoint(n.center,Xi),Xi.distanceToSquared(n.center)<=n.radius*n.radius}intersectsPlane(n){let a,s;return n.normal.x>0?(a=n.normal.x*this.min.x,s=n.normal.x*this.max.x):(a=n.normal.x*this.max.x,s=n.normal.x*this.min.x),n.normal.y>0?(a+=n.normal.y*this.min.y,s+=n.normal.y*this.max.y):(a+=n.normal.y*this.max.y,s+=n.normal.y*this.min.y),n.normal.z>0?(a+=n.normal.z*this.min.z,s+=n.normal.z*this.max.z):(a+=n.normal.z*this.max.z,s+=n.normal.z*this.min.z),a<=-n.constant&&s>=-n.constant}intersectsTriangle(n){if(this.isEmpty())return!1;this.getCenter(vl),Jc.subVectors(this.max,vl),Js.subVectors(n.a,vl),$s.subVectors(n.b,vl),to.subVectors(n.c,vl),vr.subVectors($s,Js),_r.subVectors(to,$s),Wr.subVectors(Js,to);let a=[0,-vr.z,vr.y,0,-_r.z,_r.y,0,-Wr.z,Wr.y,vr.z,0,-vr.x,_r.z,0,-_r.x,Wr.z,0,-Wr.x,-vr.y,vr.x,0,-_r.y,_r.x,0,-Wr.y,Wr.x,0];return!_d(a,Js,$s,to,Jc)||(a=[1,0,0,0,1,0,0,0,1],!_d(a,Js,$s,to,Jc))?!1:($c.crossVectors(vr,_r),a=[$c.x,$c.y,$c.z],_d(a,Js,$s,to,Jc))}clampPoint(n,a){return a.copy(n).clamp(this.min,this.max)}distanceToPoint(n){return this.clampPoint(n,Xi).distanceTo(n)}getBoundingSphere(n){return this.isEmpty()?n.makeEmpty():(this.getCenter(n.center),n.radius=this.getSize(Xi).length()*.5),n}intersect(n){return this.min.max(n.min),this.max.min(n.max),this.isEmpty()&&this.makeEmpty(),this}union(n){return this.min.min(n.min),this.max.max(n.max),this}applyMatrix4(n){return this.isEmpty()?this:(wa[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(n),wa[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(n),wa[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(n),wa[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(n),wa[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(n),wa[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(n),wa[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(n),wa[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(n),this.setFromPoints(wa),this)}translate(n){return this.min.add(n),this.max.add(n),this}equals(n){return n.min.equals(this.min)&&n.max.equals(this.max)}}const wa=[new ft,new ft,new ft,new ft,new ft,new ft,new ft,new ft],Xi=new ft,Qc=new wl,Js=new ft,$s=new ft,to=new ft,vr=new ft,_r=new ft,Wr=new ft,vl=new ft,Jc=new ft,$c=new ft,Zr=new ft;function _d(o,n,a,s,c){for(let f=0,h=o.length-3;f<=h;f+=3){Zr.fromArray(o,f);const d=c.x*Math.abs(Zr.x)+c.y*Math.abs(Zr.y)+c.z*Math.abs(Zr.z),m=n.dot(Zr),_=a.dot(Zr),g=s.dot(Zr);if(Math.max(-Math.max(m,_,g),Math.min(m,_,g))>d)return!1}return!0}const CE=new wl,_l=new ft,xd=new ft;class Dl{constructor(n=new ft,a=-1){this.isSphere=!0,this.center=n,this.radius=a}set(n,a){return this.center.copy(n),this.radius=a,this}setFromPoints(n,a){const s=this.center;a!==void 0?s.copy(a):CE.setFromPoints(n).getCenter(s);let c=0;for(let f=0,h=n.length;f<h;f++)c=Math.max(c,s.distanceToSquared(n[f]));return this.radius=Math.sqrt(c),this}copy(n){return this.center.copy(n.center),this.radius=n.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(n){return n.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(n){return n.distanceTo(this.center)-this.radius}intersectsSphere(n){const a=this.radius+n.radius;return n.center.distanceToSquared(this.center)<=a*a}intersectsBox(n){return n.intersectsSphere(this)}intersectsPlane(n){return Math.abs(n.distanceToPoint(this.center))<=this.radius}clampPoint(n,a){const s=this.center.distanceToSquared(n);return a.copy(n),s>this.radius*this.radius&&(a.sub(this.center).normalize(),a.multiplyScalar(this.radius).add(this.center)),a}getBoundingBox(n){return this.isEmpty()?(n.makeEmpty(),n):(n.set(this.center,this.center),n.expandByScalar(this.radius),n)}applyMatrix4(n){return this.center.applyMatrix4(n),this.radius=this.radius*n.getMaxScaleOnAxis(),this}translate(n){return this.center.add(n),this}expandByPoint(n){if(this.isEmpty())return this.center.copy(n),this.radius=0,this;_l.subVectors(n,this.center);const a=_l.lengthSq();if(a>this.radius*this.radius){const s=Math.sqrt(a),c=(s-this.radius)*.5;this.center.addScaledVector(_l,c/s),this.radius+=c}return this}union(n){return n.isEmpty()?this:this.isEmpty()?(this.copy(n),this):(this.center.equals(n.center)===!0?this.radius=Math.max(this.radius,n.radius):(xd.subVectors(n.center,this.center).setLength(n.radius),this.expandByPoint(_l.copy(n.center).add(xd)),this.expandByPoint(_l.copy(n.center).sub(xd))),this)}equals(n){return n.center.equals(this.center)&&n.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Da=new ft,yd=new ft,tu=new ft,xr=new ft,Sd=new ft,eu=new ft,Md=new ft;class Hp{constructor(n=new ft,a=new ft(0,0,-1)){this.origin=n,this.direction=a}set(n,a){return this.origin.copy(n),this.direction.copy(a),this}copy(n){return this.origin.copy(n.origin),this.direction.copy(n.direction),this}at(n,a){return a.copy(this.origin).addScaledVector(this.direction,n)}lookAt(n){return this.direction.copy(n).sub(this.origin).normalize(),this}recast(n){return this.origin.copy(this.at(n,Da)),this}closestPointToPoint(n,a){a.subVectors(n,this.origin);const s=a.dot(this.direction);return s<0?a.copy(this.origin):a.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(n){return Math.sqrt(this.distanceSqToPoint(n))}distanceSqToPoint(n){const a=Da.subVectors(n,this.origin).dot(this.direction);return a<0?this.origin.distanceToSquared(n):(Da.copy(this.origin).addScaledVector(this.direction,a),Da.distanceToSquared(n))}distanceSqToSegment(n,a,s,c){yd.copy(n).add(a).multiplyScalar(.5),tu.copy(a).sub(n).normalize(),xr.copy(this.origin).sub(yd);const f=n.distanceTo(a)*.5,h=-this.direction.dot(tu),d=xr.dot(this.direction),m=-xr.dot(tu),_=xr.lengthSq(),g=Math.abs(1-h*h);let p,x,M,T;if(g>0)if(p=h*m-d,x=h*d-m,T=f*g,p>=0)if(x>=-T)if(x<=T){const R=1/g;p*=R,x*=R,M=p*(p+h*x+2*d)+x*(h*p+x+2*m)+_}else x=f,p=Math.max(0,-(h*x+d)),M=-p*p+x*(x+2*m)+_;else x=-f,p=Math.max(0,-(h*x+d)),M=-p*p+x*(x+2*m)+_;else x<=-T?(p=Math.max(0,-(-h*f+d)),x=p>0?-f:Math.min(Math.max(-f,-m),f),M=-p*p+x*(x+2*m)+_):x<=T?(p=0,x=Math.min(Math.max(-f,-m),f),M=x*(x+2*m)+_):(p=Math.max(0,-(h*f+d)),x=p>0?f:Math.min(Math.max(-f,-m),f),M=-p*p+x*(x+2*m)+_);else x=h>0?-f:f,p=Math.max(0,-(h*x+d)),M=-p*p+x*(x+2*m)+_;return s&&s.copy(this.origin).addScaledVector(this.direction,p),c&&c.copy(yd).addScaledVector(tu,x),M}intersectSphere(n,a){Da.subVectors(n.center,this.origin);const s=Da.dot(this.direction),c=Da.dot(Da)-s*s,f=n.radius*n.radius;if(c>f)return null;const h=Math.sqrt(f-c),d=s-h,m=s+h;return m<0?null:d<0?this.at(m,a):this.at(d,a)}intersectsSphere(n){return this.distanceSqToPoint(n.center)<=n.radius*n.radius}distanceToPlane(n){const a=n.normal.dot(this.direction);if(a===0)return n.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(n.normal)+n.constant)/a;return s>=0?s:null}intersectPlane(n,a){const s=this.distanceToPlane(n);return s===null?null:this.at(s,a)}intersectsPlane(n){const a=n.distanceToPoint(this.origin);return a===0||n.normal.dot(this.direction)*a<0}intersectBox(n,a){let s,c,f,h,d,m;const _=1/this.direction.x,g=1/this.direction.y,p=1/this.direction.z,x=this.origin;return _>=0?(s=(n.min.x-x.x)*_,c=(n.max.x-x.x)*_):(s=(n.max.x-x.x)*_,c=(n.min.x-x.x)*_),g>=0?(f=(n.min.y-x.y)*g,h=(n.max.y-x.y)*g):(f=(n.max.y-x.y)*g,h=(n.min.y-x.y)*g),s>h||f>c||((f>s||isNaN(s))&&(s=f),(h<c||isNaN(c))&&(c=h),p>=0?(d=(n.min.z-x.z)*p,m=(n.max.z-x.z)*p):(d=(n.max.z-x.z)*p,m=(n.min.z-x.z)*p),s>m||d>c)||((d>s||s!==s)&&(s=d),(m<c||c!==c)&&(c=m),c<0)?null:this.at(s>=0?s:c,a)}intersectsBox(n){return this.intersectBox(n,Da)!==null}intersectTriangle(n,a,s,c,f){Sd.subVectors(a,n),eu.subVectors(s,n),Md.crossVectors(Sd,eu);let h=this.direction.dot(Md),d;if(h>0){if(c)return null;d=1}else if(h<0)d=-1,h=-h;else return null;xr.subVectors(this.origin,n);const m=d*this.direction.dot(eu.crossVectors(xr,eu));if(m<0)return null;const _=d*this.direction.dot(Sd.cross(xr));if(_<0||m+_>h)return null;const g=-d*xr.dot(Md);return g<0?null:this.at(g/h,f)}applyMatrix4(n){return this.origin.applyMatrix4(n),this.direction.transformDirection(n),this}equals(n){return n.origin.equals(this.origin)&&n.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class _n{constructor(n,a,s,c,f,h,d,m,_,g,p,x,M,T,R,S){_n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],n!==void 0&&this.set(n,a,s,c,f,h,d,m,_,g,p,x,M,T,R,S)}set(n,a,s,c,f,h,d,m,_,g,p,x,M,T,R,S){const y=this.elements;return y[0]=n,y[4]=a,y[8]=s,y[12]=c,y[1]=f,y[5]=h,y[9]=d,y[13]=m,y[2]=_,y[6]=g,y[10]=p,y[14]=x,y[3]=M,y[7]=T,y[11]=R,y[15]=S,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new _n().fromArray(this.elements)}copy(n){const a=this.elements,s=n.elements;return a[0]=s[0],a[1]=s[1],a[2]=s[2],a[3]=s[3],a[4]=s[4],a[5]=s[5],a[6]=s[6],a[7]=s[7],a[8]=s[8],a[9]=s[9],a[10]=s[10],a[11]=s[11],a[12]=s[12],a[13]=s[13],a[14]=s[14],a[15]=s[15],this}copyPosition(n){const a=this.elements,s=n.elements;return a[12]=s[12],a[13]=s[13],a[14]=s[14],this}setFromMatrix3(n){const a=n.elements;return this.set(a[0],a[3],a[6],0,a[1],a[4],a[7],0,a[2],a[5],a[8],0,0,0,0,1),this}extractBasis(n,a,s){return n.setFromMatrixColumn(this,0),a.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this}makeBasis(n,a,s){return this.set(n.x,a.x,s.x,0,n.y,a.y,s.y,0,n.z,a.z,s.z,0,0,0,0,1),this}extractRotation(n){const a=this.elements,s=n.elements,c=1/eo.setFromMatrixColumn(n,0).length(),f=1/eo.setFromMatrixColumn(n,1).length(),h=1/eo.setFromMatrixColumn(n,2).length();return a[0]=s[0]*c,a[1]=s[1]*c,a[2]=s[2]*c,a[3]=0,a[4]=s[4]*f,a[5]=s[5]*f,a[6]=s[6]*f,a[7]=0,a[8]=s[8]*h,a[9]=s[9]*h,a[10]=s[10]*h,a[11]=0,a[12]=0,a[13]=0,a[14]=0,a[15]=1,this}makeRotationFromEuler(n){const a=this.elements,s=n.x,c=n.y,f=n.z,h=Math.cos(s),d=Math.sin(s),m=Math.cos(c),_=Math.sin(c),g=Math.cos(f),p=Math.sin(f);if(n.order==="XYZ"){const x=h*g,M=h*p,T=d*g,R=d*p;a[0]=m*g,a[4]=-m*p,a[8]=_,a[1]=M+T*_,a[5]=x-R*_,a[9]=-d*m,a[2]=R-x*_,a[6]=T+M*_,a[10]=h*m}else if(n.order==="YXZ"){const x=m*g,M=m*p,T=_*g,R=_*p;a[0]=x+R*d,a[4]=T*d-M,a[8]=h*_,a[1]=h*p,a[5]=h*g,a[9]=-d,a[2]=M*d-T,a[6]=R+x*d,a[10]=h*m}else if(n.order==="ZXY"){const x=m*g,M=m*p,T=_*g,R=_*p;a[0]=x-R*d,a[4]=-h*p,a[8]=T+M*d,a[1]=M+T*d,a[5]=h*g,a[9]=R-x*d,a[2]=-h*_,a[6]=d,a[10]=h*m}else if(n.order==="ZYX"){const x=h*g,M=h*p,T=d*g,R=d*p;a[0]=m*g,a[4]=T*_-M,a[8]=x*_+R,a[1]=m*p,a[5]=R*_+x,a[9]=M*_-T,a[2]=-_,a[6]=d*m,a[10]=h*m}else if(n.order==="YZX"){const x=h*m,M=h*_,T=d*m,R=d*_;a[0]=m*g,a[4]=R-x*p,a[8]=T*p+M,a[1]=p,a[5]=h*g,a[9]=-d*g,a[2]=-_*g,a[6]=M*p+T,a[10]=x-R*p}else if(n.order==="XZY"){const x=h*m,M=h*_,T=d*m,R=d*_;a[0]=m*g,a[4]=-p,a[8]=_*g,a[1]=x*p+R,a[5]=h*g,a[9]=M*p-T,a[2]=T*p-M,a[6]=d*g,a[10]=R*p+x}return a[3]=0,a[7]=0,a[11]=0,a[12]=0,a[13]=0,a[14]=0,a[15]=1,this}makeRotationFromQuaternion(n){return this.compose(wE,n,DE)}lookAt(n,a,s){const c=this.elements;return yi.subVectors(n,a),yi.lengthSq()===0&&(yi.z=1),yi.normalize(),yr.crossVectors(s,yi),yr.lengthSq()===0&&(Math.abs(s.z)===1?yi.x+=1e-4:yi.z+=1e-4,yi.normalize(),yr.crossVectors(s,yi)),yr.normalize(),nu.crossVectors(yi,yr),c[0]=yr.x,c[4]=nu.x,c[8]=yi.x,c[1]=yr.y,c[5]=nu.y,c[9]=yi.y,c[2]=yr.z,c[6]=nu.z,c[10]=yi.z,this}multiply(n){return this.multiplyMatrices(this,n)}premultiply(n){return this.multiplyMatrices(n,this)}multiplyMatrices(n,a){const s=n.elements,c=a.elements,f=this.elements,h=s[0],d=s[4],m=s[8],_=s[12],g=s[1],p=s[5],x=s[9],M=s[13],T=s[2],R=s[6],S=s[10],y=s[14],P=s[3],O=s[7],N=s[11],et=s[15],V=c[0],I=c[4],q=c[8],U=c[12],C=c[1],B=c[5],at=c[9],ot=c[13],ht=c[2],gt=c[6],X=c[10],rt=c[14],Z=c[3],St=c[7],bt=c[11],Vt=c[15];return f[0]=h*V+d*C+m*ht+_*Z,f[4]=h*I+d*B+m*gt+_*St,f[8]=h*q+d*at+m*X+_*bt,f[12]=h*U+d*ot+m*rt+_*Vt,f[1]=g*V+p*C+x*ht+M*Z,f[5]=g*I+p*B+x*gt+M*St,f[9]=g*q+p*at+x*X+M*bt,f[13]=g*U+p*ot+x*rt+M*Vt,f[2]=T*V+R*C+S*ht+y*Z,f[6]=T*I+R*B+S*gt+y*St,f[10]=T*q+R*at+S*X+y*bt,f[14]=T*U+R*ot+S*rt+y*Vt,f[3]=P*V+O*C+N*ht+et*Z,f[7]=P*I+O*B+N*gt+et*St,f[11]=P*q+O*at+N*X+et*bt,f[15]=P*U+O*ot+N*rt+et*Vt,this}multiplyScalar(n){const a=this.elements;return a[0]*=n,a[4]*=n,a[8]*=n,a[12]*=n,a[1]*=n,a[5]*=n,a[9]*=n,a[13]*=n,a[2]*=n,a[6]*=n,a[10]*=n,a[14]*=n,a[3]*=n,a[7]*=n,a[11]*=n,a[15]*=n,this}determinant(){const n=this.elements,a=n[0],s=n[4],c=n[8],f=n[12],h=n[1],d=n[5],m=n[9],_=n[13],g=n[2],p=n[6],x=n[10],M=n[14],T=n[3],R=n[7],S=n[11],y=n[15];return T*(+f*m*p-c*_*p-f*d*x+s*_*x+c*d*M-s*m*M)+R*(+a*m*M-a*_*x+f*h*x-c*h*M+c*_*g-f*m*g)+S*(+a*_*p-a*d*M-f*h*p+s*h*M+f*d*g-s*_*g)+y*(-c*d*g-a*m*p+a*d*x+c*h*p-s*h*x+s*m*g)}transpose(){const n=this.elements;let a;return a=n[1],n[1]=n[4],n[4]=a,a=n[2],n[2]=n[8],n[8]=a,a=n[6],n[6]=n[9],n[9]=a,a=n[3],n[3]=n[12],n[12]=a,a=n[7],n[7]=n[13],n[13]=a,a=n[11],n[11]=n[14],n[14]=a,this}setPosition(n,a,s){const c=this.elements;return n.isVector3?(c[12]=n.x,c[13]=n.y,c[14]=n.z):(c[12]=n,c[13]=a,c[14]=s),this}invert(){const n=this.elements,a=n[0],s=n[1],c=n[2],f=n[3],h=n[4],d=n[5],m=n[6],_=n[7],g=n[8],p=n[9],x=n[10],M=n[11],T=n[12],R=n[13],S=n[14],y=n[15],P=p*S*_-R*x*_+R*m*M-d*S*M-p*m*y+d*x*y,O=T*x*_-g*S*_-T*m*M+h*S*M+g*m*y-h*x*y,N=g*R*_-T*p*_+T*d*M-h*R*M-g*d*y+h*p*y,et=T*p*m-g*R*m-T*d*x+h*R*x+g*d*S-h*p*S,V=a*P+s*O+c*N+f*et;if(V===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/V;return n[0]=P*I,n[1]=(R*x*f-p*S*f-R*c*M+s*S*M+p*c*y-s*x*y)*I,n[2]=(d*S*f-R*m*f+R*c*_-s*S*_-d*c*y+s*m*y)*I,n[3]=(p*m*f-d*x*f-p*c*_+s*x*_+d*c*M-s*m*M)*I,n[4]=O*I,n[5]=(g*S*f-T*x*f+T*c*M-a*S*M-g*c*y+a*x*y)*I,n[6]=(T*m*f-h*S*f-T*c*_+a*S*_+h*c*y-a*m*y)*I,n[7]=(h*x*f-g*m*f+g*c*_-a*x*_-h*c*M+a*m*M)*I,n[8]=N*I,n[9]=(T*p*f-g*R*f-T*s*M+a*R*M+g*s*y-a*p*y)*I,n[10]=(h*R*f-T*d*f+T*s*_-a*R*_-h*s*y+a*d*y)*I,n[11]=(g*d*f-h*p*f-g*s*_+a*p*_+h*s*M-a*d*M)*I,n[12]=et*I,n[13]=(g*R*c-T*p*c+T*s*x-a*R*x-g*s*S+a*p*S)*I,n[14]=(T*d*c-h*R*c-T*s*m+a*R*m+h*s*S-a*d*S)*I,n[15]=(h*p*c-g*d*c+g*s*m-a*p*m-h*s*x+a*d*x)*I,this}scale(n){const a=this.elements,s=n.x,c=n.y,f=n.z;return a[0]*=s,a[4]*=c,a[8]*=f,a[1]*=s,a[5]*=c,a[9]*=f,a[2]*=s,a[6]*=c,a[10]*=f,a[3]*=s,a[7]*=c,a[11]*=f,this}getMaxScaleOnAxis(){const n=this.elements,a=n[0]*n[0]+n[1]*n[1]+n[2]*n[2],s=n[4]*n[4]+n[5]*n[5]+n[6]*n[6],c=n[8]*n[8]+n[9]*n[9]+n[10]*n[10];return Math.sqrt(Math.max(a,s,c))}makeTranslation(n,a,s){return n.isVector3?this.set(1,0,0,n.x,0,1,0,n.y,0,0,1,n.z,0,0,0,1):this.set(1,0,0,n,0,1,0,a,0,0,1,s,0,0,0,1),this}makeRotationX(n){const a=Math.cos(n),s=Math.sin(n);return this.set(1,0,0,0,0,a,-s,0,0,s,a,0,0,0,0,1),this}makeRotationY(n){const a=Math.cos(n),s=Math.sin(n);return this.set(a,0,s,0,0,1,0,0,-s,0,a,0,0,0,0,1),this}makeRotationZ(n){const a=Math.cos(n),s=Math.sin(n);return this.set(a,-s,0,0,s,a,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(n,a){const s=Math.cos(a),c=Math.sin(a),f=1-s,h=n.x,d=n.y,m=n.z,_=f*h,g=f*d;return this.set(_*h+s,_*d-c*m,_*m+c*d,0,_*d+c*m,g*d+s,g*m-c*h,0,_*m-c*d,g*m+c*h,f*m*m+s,0,0,0,0,1),this}makeScale(n,a,s){return this.set(n,0,0,0,0,a,0,0,0,0,s,0,0,0,0,1),this}makeShear(n,a,s,c,f,h){return this.set(1,s,f,0,n,1,h,0,a,c,1,0,0,0,0,1),this}compose(n,a,s){const c=this.elements,f=a._x,h=a._y,d=a._z,m=a._w,_=f+f,g=h+h,p=d+d,x=f*_,M=f*g,T=f*p,R=h*g,S=h*p,y=d*p,P=m*_,O=m*g,N=m*p,et=s.x,V=s.y,I=s.z;return c[0]=(1-(R+y))*et,c[1]=(M+N)*et,c[2]=(T-O)*et,c[3]=0,c[4]=(M-N)*V,c[5]=(1-(x+y))*V,c[6]=(S+P)*V,c[7]=0,c[8]=(T+O)*I,c[9]=(S-P)*I,c[10]=(1-(x+R))*I,c[11]=0,c[12]=n.x,c[13]=n.y,c[14]=n.z,c[15]=1,this}decompose(n,a,s){const c=this.elements;let f=eo.set(c[0],c[1],c[2]).length();const h=eo.set(c[4],c[5],c[6]).length(),d=eo.set(c[8],c[9],c[10]).length();this.determinant()<0&&(f=-f),n.x=c[12],n.y=c[13],n.z=c[14],ki.copy(this);const _=1/f,g=1/h,p=1/d;return ki.elements[0]*=_,ki.elements[1]*=_,ki.elements[2]*=_,ki.elements[4]*=g,ki.elements[5]*=g,ki.elements[6]*=g,ki.elements[8]*=p,ki.elements[9]*=p,ki.elements[10]*=p,a.setFromRotationMatrix(ki),s.x=f,s.y=h,s.z=d,this}makePerspective(n,a,s,c,f,h,d=Ia){const m=this.elements,_=2*f/(a-n),g=2*f/(s-c),p=(a+n)/(a-n),x=(s+c)/(s-c);let M,T;if(d===Ia)M=-(h+f)/(h-f),T=-2*h*f/(h-f);else if(d===Cu)M=-h/(h-f),T=-h*f/(h-f);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return m[0]=_,m[4]=0,m[8]=p,m[12]=0,m[1]=0,m[5]=g,m[9]=x,m[13]=0,m[2]=0,m[6]=0,m[10]=M,m[14]=T,m[3]=0,m[7]=0,m[11]=-1,m[15]=0,this}makeOrthographic(n,a,s,c,f,h,d=Ia){const m=this.elements,_=1/(a-n),g=1/(s-c),p=1/(h-f),x=(a+n)*_,M=(s+c)*g;let T,R;if(d===Ia)T=(h+f)*p,R=-2*p;else if(d===Cu)T=f*p,R=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return m[0]=2*_,m[4]=0,m[8]=0,m[12]=-x,m[1]=0,m[5]=2*g,m[9]=0,m[13]=-M,m[2]=0,m[6]=0,m[10]=R,m[14]=-T,m[3]=0,m[7]=0,m[11]=0,m[15]=1,this}equals(n){const a=this.elements,s=n.elements;for(let c=0;c<16;c++)if(a[c]!==s[c])return!1;return!0}fromArray(n,a=0){for(let s=0;s<16;s++)this.elements[s]=n[s+a];return this}toArray(n=[],a=0){const s=this.elements;return n[a]=s[0],n[a+1]=s[1],n[a+2]=s[2],n[a+3]=s[3],n[a+4]=s[4],n[a+5]=s[5],n[a+6]=s[6],n[a+7]=s[7],n[a+8]=s[8],n[a+9]=s[9],n[a+10]=s[10],n[a+11]=s[11],n[a+12]=s[12],n[a+13]=s[13],n[a+14]=s[14],n[a+15]=s[15],n}}const eo=new ft,ki=new _n,wE=new ft(0,0,0),DE=new ft(1,1,1),yr=new ft,nu=new ft,yi=new ft,m0=new _n,g0=new Cl;class Va{constructor(n=0,a=0,s=0,c=Va.DEFAULT_ORDER){this.isEuler=!0,this._x=n,this._y=a,this._z=s,this._order=c}get x(){return this._x}set x(n){this._x=n,this._onChangeCallback()}get y(){return this._y}set y(n){this._y=n,this._onChangeCallback()}get z(){return this._z}set z(n){this._z=n,this._onChangeCallback()}get order(){return this._order}set order(n){this._order=n,this._onChangeCallback()}set(n,a,s,c=this._order){return this._x=n,this._y=a,this._z=s,this._order=c,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(n){return this._x=n._x,this._y=n._y,this._z=n._z,this._order=n._order,this._onChangeCallback(),this}setFromRotationMatrix(n,a=this._order,s=!0){const c=n.elements,f=c[0],h=c[4],d=c[8],m=c[1],_=c[5],g=c[9],p=c[2],x=c[6],M=c[10];switch(a){case"XYZ":this._y=Math.asin(ci(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-g,M),this._z=Math.atan2(-h,f)):(this._x=Math.atan2(x,_),this._z=0);break;case"YXZ":this._x=Math.asin(-ci(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(d,M),this._z=Math.atan2(m,_)):(this._y=Math.atan2(-p,f),this._z=0);break;case"ZXY":this._x=Math.asin(ci(x,-1,1)),Math.abs(x)<.9999999?(this._y=Math.atan2(-p,M),this._z=Math.atan2(-h,_)):(this._y=0,this._z=Math.atan2(m,f));break;case"ZYX":this._y=Math.asin(-ci(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(x,M),this._z=Math.atan2(m,f)):(this._x=0,this._z=Math.atan2(-h,_));break;case"YZX":this._z=Math.asin(ci(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(-g,_),this._y=Math.atan2(-p,f)):(this._x=0,this._y=Math.atan2(d,M));break;case"XZY":this._z=Math.asin(-ci(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(x,_),this._y=Math.atan2(d,f)):(this._x=Math.atan2(-g,M),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+a)}return this._order=a,s===!0&&this._onChangeCallback(),this}setFromQuaternion(n,a,s){return m0.makeRotationFromQuaternion(n),this.setFromRotationMatrix(m0,a,s)}setFromVector3(n,a=this._order){return this.set(n.x,n.y,n.z,a)}reorder(n){return g0.setFromEuler(this),this.setFromQuaternion(g0,n)}equals(n){return n._x===this._x&&n._y===this._y&&n._z===this._z&&n._order===this._order}fromArray(n){return this._x=n[0],this._y=n[1],this._z=n[2],n[3]!==void 0&&(this._order=n[3]),this._onChangeCallback(),this}toArray(n=[],a=0){return n[a]=this._x,n[a+1]=this._y,n[a+2]=this._z,n[a+3]=this._order,n}_onChange(n){return this._onChangeCallback=n,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Va.DEFAULT_ORDER="XYZ";class bx{constructor(){this.mask=1}set(n){this.mask=(1<<n|0)>>>0}enable(n){this.mask|=1<<n|0}enableAll(){this.mask=-1}toggle(n){this.mask^=1<<n|0}disable(n){this.mask&=~(1<<n|0)}disableAll(){this.mask=0}test(n){return(this.mask&n.mask)!==0}isEnabled(n){return(this.mask&(1<<n|0))!==0}}let UE=0;const v0=new ft,no=new Cl,Ua=new _n,iu=new ft,xl=new ft,NE=new ft,LE=new Cl,_0=new ft(1,0,0),x0=new ft(0,1,0),y0=new ft(0,0,1),S0={type:"added"},OE={type:"removed"},io={type:"childadded",child:null},Ed={type:"childremoved",child:null};class ti extends Mo{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:UE++}),this.uuid=Rl(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ti.DEFAULT_UP.clone();const n=new ft,a=new Va,s=new Cl,c=new ft(1,1,1);function f(){s.setFromEuler(a,!1)}function h(){a.setFromQuaternion(s,void 0,!1)}a._onChange(f),s._onChange(h),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:n},rotation:{configurable:!0,enumerable:!0,value:a},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:c},modelViewMatrix:{value:new _n},normalMatrix:{value:new Ae}}),this.matrix=new _n,this.matrixWorld=new _n,this.matrixAutoUpdate=ti.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ti.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new bx,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(n){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(n),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(n){return this.quaternion.premultiply(n),this}setRotationFromAxisAngle(n,a){this.quaternion.setFromAxisAngle(n,a)}setRotationFromEuler(n){this.quaternion.setFromEuler(n,!0)}setRotationFromMatrix(n){this.quaternion.setFromRotationMatrix(n)}setRotationFromQuaternion(n){this.quaternion.copy(n)}rotateOnAxis(n,a){return no.setFromAxisAngle(n,a),this.quaternion.multiply(no),this}rotateOnWorldAxis(n,a){return no.setFromAxisAngle(n,a),this.quaternion.premultiply(no),this}rotateX(n){return this.rotateOnAxis(_0,n)}rotateY(n){return this.rotateOnAxis(x0,n)}rotateZ(n){return this.rotateOnAxis(y0,n)}translateOnAxis(n,a){return v0.copy(n).applyQuaternion(this.quaternion),this.position.add(v0.multiplyScalar(a)),this}translateX(n){return this.translateOnAxis(_0,n)}translateY(n){return this.translateOnAxis(x0,n)}translateZ(n){return this.translateOnAxis(y0,n)}localToWorld(n){return this.updateWorldMatrix(!0,!1),n.applyMatrix4(this.matrixWorld)}worldToLocal(n){return this.updateWorldMatrix(!0,!1),n.applyMatrix4(Ua.copy(this.matrixWorld).invert())}lookAt(n,a,s){n.isVector3?iu.copy(n):iu.set(n,a,s);const c=this.parent;this.updateWorldMatrix(!0,!1),xl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ua.lookAt(xl,iu,this.up):Ua.lookAt(iu,xl,this.up),this.quaternion.setFromRotationMatrix(Ua),c&&(Ua.extractRotation(c.matrixWorld),no.setFromRotationMatrix(Ua),this.quaternion.premultiply(no.invert()))}add(n){if(arguments.length>1){for(let a=0;a<arguments.length;a++)this.add(arguments[a]);return this}return n===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",n),this):(n&&n.isObject3D?(n.removeFromParent(),n.parent=this,this.children.push(n),n.dispatchEvent(S0),io.child=n,this.dispatchEvent(io),io.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",n),this)}remove(n){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const a=this.children.indexOf(n);return a!==-1&&(n.parent=null,this.children.splice(a,1),n.dispatchEvent(OE),Ed.child=n,this.dispatchEvent(Ed),Ed.child=null),this}removeFromParent(){const n=this.parent;return n!==null&&n.remove(this),this}clear(){return this.remove(...this.children)}attach(n){return this.updateWorldMatrix(!0,!1),Ua.copy(this.matrixWorld).invert(),n.parent!==null&&(n.parent.updateWorldMatrix(!0,!1),Ua.multiply(n.parent.matrixWorld)),n.applyMatrix4(Ua),n.removeFromParent(),n.parent=this,this.children.push(n),n.updateWorldMatrix(!1,!0),n.dispatchEvent(S0),io.child=n,this.dispatchEvent(io),io.child=null,this}getObjectById(n){return this.getObjectByProperty("id",n)}getObjectByName(n){return this.getObjectByProperty("name",n)}getObjectByProperty(n,a){if(this[n]===a)return this;for(let s=0,c=this.children.length;s<c;s++){const h=this.children[s].getObjectByProperty(n,a);if(h!==void 0)return h}}getObjectsByProperty(n,a,s=[]){this[n]===a&&s.push(this);const c=this.children;for(let f=0,h=c.length;f<h;f++)c[f].getObjectsByProperty(n,a,s);return s}getWorldPosition(n){return this.updateWorldMatrix(!0,!1),n.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(n){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xl,n,NE),n}getWorldScale(n){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xl,LE,n),n}getWorldDirection(n){this.updateWorldMatrix(!0,!1);const a=this.matrixWorld.elements;return n.set(a[8],a[9],a[10]).normalize()}raycast(){}traverse(n){n(this);const a=this.children;for(let s=0,c=a.length;s<c;s++)a[s].traverse(n)}traverseVisible(n){if(this.visible===!1)return;n(this);const a=this.children;for(let s=0,c=a.length;s<c;s++)a[s].traverseVisible(n)}traverseAncestors(n){const a=this.parent;a!==null&&(n(a),a.traverseAncestors(n))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(n){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0);const a=this.children;for(let s=0,c=a.length;s<c;s++)a[s].updateMatrixWorld(n)}updateWorldMatrix(n,a){const s=this.parent;if(n===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),a===!0){const c=this.children;for(let f=0,h=c.length;f<h;f++)c[f].updateWorldMatrix(!1,!0)}}toJSON(n){const a=n===void 0||typeof n=="string",s={};a&&(n={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const c={};c.uuid=this.uuid,c.type=this.type,this.name!==""&&(c.name=this.name),this.castShadow===!0&&(c.castShadow=!0),this.receiveShadow===!0&&(c.receiveShadow=!0),this.visible===!1&&(c.visible=!1),this.frustumCulled===!1&&(c.frustumCulled=!1),this.renderOrder!==0&&(c.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(c.userData=this.userData),c.layers=this.layers.mask,c.matrix=this.matrix.toArray(),c.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(c.matrixAutoUpdate=!1),this.isInstancedMesh&&(c.type="InstancedMesh",c.count=this.count,c.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(c.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(c.type="BatchedMesh",c.perObjectFrustumCulled=this.perObjectFrustumCulled,c.sortObjects=this.sortObjects,c.drawRanges=this._drawRanges,c.reservedRanges=this._reservedRanges,c.visibility=this._visibility,c.active=this._active,c.bounds=this._bounds.map(d=>({boxInitialized:d.boxInitialized,boxMin:d.box.min.toArray(),boxMax:d.box.max.toArray(),sphereInitialized:d.sphereInitialized,sphereRadius:d.sphere.radius,sphereCenter:d.sphere.center.toArray()})),c.maxInstanceCount=this._maxInstanceCount,c.maxVertexCount=this._maxVertexCount,c.maxIndexCount=this._maxIndexCount,c.geometryInitialized=this._geometryInitialized,c.geometryCount=this._geometryCount,c.matricesTexture=this._matricesTexture.toJSON(n),this._colorsTexture!==null&&(c.colorsTexture=this._colorsTexture.toJSON(n)),this.boundingSphere!==null&&(c.boundingSphere={center:c.boundingSphere.center.toArray(),radius:c.boundingSphere.radius}),this.boundingBox!==null&&(c.boundingBox={min:c.boundingBox.min.toArray(),max:c.boundingBox.max.toArray()}));function f(d,m){return d[m.uuid]===void 0&&(d[m.uuid]=m.toJSON(n)),m.uuid}if(this.isScene)this.background&&(this.background.isColor?c.background=this.background.toJSON():this.background.isTexture&&(c.background=this.background.toJSON(n).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(c.environment=this.environment.toJSON(n).uuid);else if(this.isMesh||this.isLine||this.isPoints){c.geometry=f(n.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const m=d.shapes;if(Array.isArray(m))for(let _=0,g=m.length;_<g;_++){const p=m[_];f(n.shapes,p)}else f(n.shapes,m)}}if(this.isSkinnedMesh&&(c.bindMode=this.bindMode,c.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(f(n.skeletons,this.skeleton),c.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let m=0,_=this.material.length;m<_;m++)d.push(f(n.materials,this.material[m]));c.material=d}else c.material=f(n.materials,this.material);if(this.children.length>0){c.children=[];for(let d=0;d<this.children.length;d++)c.children.push(this.children[d].toJSON(n).object)}if(this.animations.length>0){c.animations=[];for(let d=0;d<this.animations.length;d++){const m=this.animations[d];c.animations.push(f(n.animations,m))}}if(a){const d=h(n.geometries),m=h(n.materials),_=h(n.textures),g=h(n.images),p=h(n.shapes),x=h(n.skeletons),M=h(n.animations),T=h(n.nodes);d.length>0&&(s.geometries=d),m.length>0&&(s.materials=m),_.length>0&&(s.textures=_),g.length>0&&(s.images=g),p.length>0&&(s.shapes=p),x.length>0&&(s.skeletons=x),M.length>0&&(s.animations=M),T.length>0&&(s.nodes=T)}return s.object=c,s;function h(d){const m=[];for(const _ in d){const g=d[_];delete g.metadata,m.push(g)}return m}}clone(n){return new this.constructor().copy(this,n)}copy(n,a=!0){if(this.name=n.name,this.up.copy(n.up),this.position.copy(n.position),this.rotation.order=n.rotation.order,this.quaternion.copy(n.quaternion),this.scale.copy(n.scale),this.matrix.copy(n.matrix),this.matrixWorld.copy(n.matrixWorld),this.matrixAutoUpdate=n.matrixAutoUpdate,this.matrixWorldAutoUpdate=n.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=n.matrixWorldNeedsUpdate,this.layers.mask=n.layers.mask,this.visible=n.visible,this.castShadow=n.castShadow,this.receiveShadow=n.receiveShadow,this.frustumCulled=n.frustumCulled,this.renderOrder=n.renderOrder,this.animations=n.animations.slice(),this.userData=JSON.parse(JSON.stringify(n.userData)),a===!0)for(let s=0;s<n.children.length;s++){const c=n.children[s];this.add(c.clone())}return this}}ti.DEFAULT_UP=new ft(0,1,0);ti.DEFAULT_MATRIX_AUTO_UPDATE=!0;ti.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ji=new ft,Na=new ft,Td=new ft,La=new ft,ao=new ft,ro=new ft,M0=new ft,bd=new ft,Ad=new ft,Rd=new ft,Cd=new Mn,wd=new Mn,Dd=new Mn;class qi{constructor(n=new ft,a=new ft,s=new ft){this.a=n,this.b=a,this.c=s}static getNormal(n,a,s,c){c.subVectors(s,a),ji.subVectors(n,a),c.cross(ji);const f=c.lengthSq();return f>0?c.multiplyScalar(1/Math.sqrt(f)):c.set(0,0,0)}static getBarycoord(n,a,s,c,f){ji.subVectors(c,a),Na.subVectors(s,a),Td.subVectors(n,a);const h=ji.dot(ji),d=ji.dot(Na),m=ji.dot(Td),_=Na.dot(Na),g=Na.dot(Td),p=h*_-d*d;if(p===0)return f.set(0,0,0),null;const x=1/p,M=(_*m-d*g)*x,T=(h*g-d*m)*x;return f.set(1-M-T,T,M)}static containsPoint(n,a,s,c){return this.getBarycoord(n,a,s,c,La)===null?!1:La.x>=0&&La.y>=0&&La.x+La.y<=1}static getInterpolation(n,a,s,c,f,h,d,m){return this.getBarycoord(n,a,s,c,La)===null?(m.x=0,m.y=0,"z"in m&&(m.z=0),"w"in m&&(m.w=0),null):(m.setScalar(0),m.addScaledVector(f,La.x),m.addScaledVector(h,La.y),m.addScaledVector(d,La.z),m)}static getInterpolatedAttribute(n,a,s,c,f,h){return Cd.setScalar(0),wd.setScalar(0),Dd.setScalar(0),Cd.fromBufferAttribute(n,a),wd.fromBufferAttribute(n,s),Dd.fromBufferAttribute(n,c),h.setScalar(0),h.addScaledVector(Cd,f.x),h.addScaledVector(wd,f.y),h.addScaledVector(Dd,f.z),h}static isFrontFacing(n,a,s,c){return ji.subVectors(s,a),Na.subVectors(n,a),ji.cross(Na).dot(c)<0}set(n,a,s){return this.a.copy(n),this.b.copy(a),this.c.copy(s),this}setFromPointsAndIndices(n,a,s,c){return this.a.copy(n[a]),this.b.copy(n[s]),this.c.copy(n[c]),this}setFromAttributeAndIndices(n,a,s,c){return this.a.fromBufferAttribute(n,a),this.b.fromBufferAttribute(n,s),this.c.fromBufferAttribute(n,c),this}clone(){return new this.constructor().copy(this)}copy(n){return this.a.copy(n.a),this.b.copy(n.b),this.c.copy(n.c),this}getArea(){return ji.subVectors(this.c,this.b),Na.subVectors(this.a,this.b),ji.cross(Na).length()*.5}getMidpoint(n){return n.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(n){return qi.getNormal(this.a,this.b,this.c,n)}getPlane(n){return n.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(n,a){return qi.getBarycoord(n,this.a,this.b,this.c,a)}getInterpolation(n,a,s,c,f){return qi.getInterpolation(n,this.a,this.b,this.c,a,s,c,f)}containsPoint(n){return qi.containsPoint(n,this.a,this.b,this.c)}isFrontFacing(n){return qi.isFrontFacing(this.a,this.b,this.c,n)}intersectsBox(n){return n.intersectsTriangle(this)}closestPointToPoint(n,a){const s=this.a,c=this.b,f=this.c;let h,d;ao.subVectors(c,s),ro.subVectors(f,s),bd.subVectors(n,s);const m=ao.dot(bd),_=ro.dot(bd);if(m<=0&&_<=0)return a.copy(s);Ad.subVectors(n,c);const g=ao.dot(Ad),p=ro.dot(Ad);if(g>=0&&p<=g)return a.copy(c);const x=m*p-g*_;if(x<=0&&m>=0&&g<=0)return h=m/(m-g),a.copy(s).addScaledVector(ao,h);Rd.subVectors(n,f);const M=ao.dot(Rd),T=ro.dot(Rd);if(T>=0&&M<=T)return a.copy(f);const R=M*_-m*T;if(R<=0&&_>=0&&T<=0)return d=_/(_-T),a.copy(s).addScaledVector(ro,d);const S=g*T-M*p;if(S<=0&&p-g>=0&&M-T>=0)return M0.subVectors(f,c),d=(p-g)/(p-g+(M-T)),a.copy(c).addScaledVector(M0,d);const y=1/(S+R+x);return h=R*y,d=x*y,a.copy(s).addScaledVector(ao,h).addScaledVector(ro,d)}equals(n){return n.a.equals(this.a)&&n.b.equals(this.b)&&n.c.equals(this.c)}}const Ax={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Sr={h:0,s:0,l:0},au={h:0,s:0,l:0};function Ud(o,n,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?o+(n-o)*6*a:a<1/2?n:a<2/3?o+(n-o)*6*(2/3-a):o}class ke{constructor(n,a,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(n,a,s)}set(n,a,s){if(a===void 0&&s===void 0){const c=n;c&&c.isColor?this.copy(c):typeof c=="number"?this.setHex(c):typeof c=="string"&&this.setStyle(c)}else this.setRGB(n,a,s);return this}setScalar(n){return this.r=n,this.g=n,this.b=n,this}setHex(n,a=Li){return n=Math.floor(n),this.r=(n>>16&255)/255,this.g=(n>>8&255)/255,this.b=(n&255)/255,Ve.toWorkingColorSpace(this,a),this}setRGB(n,a,s,c=Ve.workingColorSpace){return this.r=n,this.g=a,this.b=s,Ve.toWorkingColorSpace(this,c),this}setHSL(n,a,s,c=Ve.workingColorSpace){if(n=_E(n,1),a=ci(a,0,1),s=ci(s,0,1),a===0)this.r=this.g=this.b=s;else{const f=s<=.5?s*(1+a):s+a-s*a,h=2*s-f;this.r=Ud(h,f,n+1/3),this.g=Ud(h,f,n),this.b=Ud(h,f,n-1/3)}return Ve.toWorkingColorSpace(this,c),this}setStyle(n,a=Li){function s(f){f!==void 0&&parseFloat(f)<1&&console.warn("THREE.Color: Alpha component of "+n+" will be ignored.")}let c;if(c=/^(\w+)\(([^\)]*)\)/.exec(n)){let f;const h=c[1],d=c[2];switch(h){case"rgb":case"rgba":if(f=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return s(f[4]),this.setRGB(Math.min(255,parseInt(f[1],10))/255,Math.min(255,parseInt(f[2],10))/255,Math.min(255,parseInt(f[3],10))/255,a);if(f=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return s(f[4]),this.setRGB(Math.min(100,parseInt(f[1],10))/100,Math.min(100,parseInt(f[2],10))/100,Math.min(100,parseInt(f[3],10))/100,a);break;case"hsl":case"hsla":if(f=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return s(f[4]),this.setHSL(parseFloat(f[1])/360,parseFloat(f[2])/100,parseFloat(f[3])/100,a);break;default:console.warn("THREE.Color: Unknown color model "+n)}}else if(c=/^\#([A-Fa-f\d]+)$/.exec(n)){const f=c[1],h=f.length;if(h===3)return this.setRGB(parseInt(f.charAt(0),16)/15,parseInt(f.charAt(1),16)/15,parseInt(f.charAt(2),16)/15,a);if(h===6)return this.setHex(parseInt(f,16),a);console.warn("THREE.Color: Invalid hex color "+n)}else if(n&&n.length>0)return this.setColorName(n,a);return this}setColorName(n,a=Li){const s=Ax[n.toLowerCase()];return s!==void 0?this.setHex(s,a):console.warn("THREE.Color: Unknown color "+n),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(n){return this.r=n.r,this.g=n.g,this.b=n.b,this}copySRGBToLinear(n){return this.r=Fa(n.r),this.g=Fa(n.g),this.b=Fa(n.b),this}copyLinearToSRGB(n){return this.r=po(n.r),this.g=po(n.g),this.b=po(n.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(n=Li){return Ve.fromWorkingColorSpace(Yn.copy(this),n),Math.round(ci(Yn.r*255,0,255))*65536+Math.round(ci(Yn.g*255,0,255))*256+Math.round(ci(Yn.b*255,0,255))}getHexString(n=Li){return("000000"+this.getHex(n).toString(16)).slice(-6)}getHSL(n,a=Ve.workingColorSpace){Ve.fromWorkingColorSpace(Yn.copy(this),a);const s=Yn.r,c=Yn.g,f=Yn.b,h=Math.max(s,c,f),d=Math.min(s,c,f);let m,_;const g=(d+h)/2;if(d===h)m=0,_=0;else{const p=h-d;switch(_=g<=.5?p/(h+d):p/(2-h-d),h){case s:m=(c-f)/p+(c<f?6:0);break;case c:m=(f-s)/p+2;break;case f:m=(s-c)/p+4;break}m/=6}return n.h=m,n.s=_,n.l=g,n}getRGB(n,a=Ve.workingColorSpace){return Ve.fromWorkingColorSpace(Yn.copy(this),a),n.r=Yn.r,n.g=Yn.g,n.b=Yn.b,n}getStyle(n=Li){Ve.fromWorkingColorSpace(Yn.copy(this),n);const a=Yn.r,s=Yn.g,c=Yn.b;return n!==Li?`color(${n} ${a.toFixed(3)} ${s.toFixed(3)} ${c.toFixed(3)})`:`rgb(${Math.round(a*255)},${Math.round(s*255)},${Math.round(c*255)})`}offsetHSL(n,a,s){return this.getHSL(Sr),this.setHSL(Sr.h+n,Sr.s+a,Sr.l+s)}add(n){return this.r+=n.r,this.g+=n.g,this.b+=n.b,this}addColors(n,a){return this.r=n.r+a.r,this.g=n.g+a.g,this.b=n.b+a.b,this}addScalar(n){return this.r+=n,this.g+=n,this.b+=n,this}sub(n){return this.r=Math.max(0,this.r-n.r),this.g=Math.max(0,this.g-n.g),this.b=Math.max(0,this.b-n.b),this}multiply(n){return this.r*=n.r,this.g*=n.g,this.b*=n.b,this}multiplyScalar(n){return this.r*=n,this.g*=n,this.b*=n,this}lerp(n,a){return this.r+=(n.r-this.r)*a,this.g+=(n.g-this.g)*a,this.b+=(n.b-this.b)*a,this}lerpColors(n,a,s){return this.r=n.r+(a.r-n.r)*s,this.g=n.g+(a.g-n.g)*s,this.b=n.b+(a.b-n.b)*s,this}lerpHSL(n,a){this.getHSL(Sr),n.getHSL(au);const s=pd(Sr.h,au.h,a),c=pd(Sr.s,au.s,a),f=pd(Sr.l,au.l,a);return this.setHSL(s,c,f),this}setFromVector3(n){return this.r=n.x,this.g=n.y,this.b=n.z,this}applyMatrix3(n){const a=this.r,s=this.g,c=this.b,f=n.elements;return this.r=f[0]*a+f[3]*s+f[6]*c,this.g=f[1]*a+f[4]*s+f[7]*c,this.b=f[2]*a+f[5]*s+f[8]*c,this}equals(n){return n.r===this.r&&n.g===this.g&&n.b===this.b}fromArray(n,a=0){return this.r=n[a],this.g=n[a+1],this.b=n[a+2],this}toArray(n=[],a=0){return n[a]=this.r,n[a+1]=this.g,n[a+2]=this.b,n}fromBufferAttribute(n,a){return this.r=n.getX(a),this.g=n.getY(a),this.b=n.getZ(a),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Yn=new ke;ke.NAMES=Ax;let zE=0;class Eo extends Mo{static get type(){return"Material"}get type(){return this.constructor.type}set type(n){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zE++}),this.uuid=Rl(),this.name="",this.blending=ss,this.side=Ar,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xd,this.blendDst=kd,this.blendEquation=ns,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=mo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=r0,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ks,this.stencilZFail=Ks,this.stencilZPass=Ks,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(n){this._alphaTest>0!=n>0&&this.version++,this._alphaTest=n}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(n){if(n!==void 0)for(const a in n){const s=n[a];if(s===void 0){console.warn(`THREE.Material: parameter '${a}' has value of undefined.`);continue}const c=this[a];if(c===void 0){console.warn(`THREE.Material: '${a}' is not a property of THREE.${this.type}.`);continue}c&&c.isColor?c.set(s):c&&c.isVector3&&s&&s.isVector3?c.copy(s):this[a]=s}}toJSON(n){const a=n===void 0||typeof n=="string";a&&(n={textures:{},images:{}});const s={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(n).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(n).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(n).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(n).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(n).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(n).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(n).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(n).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(n).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(n).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(n).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(n).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(n).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(n).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(n).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(n).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(n).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(n).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(n).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(n).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(n).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(n).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(n).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(n).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.shadowSide!==null&&(s.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),this.blending!==ss&&(s.blending=this.blending),this.side!==Ar&&(s.side=this.side),this.vertexColors===!0&&(s.vertexColors=!0),this.opacity<1&&(s.opacity=this.opacity),this.transparent===!0&&(s.transparent=!0),this.blendSrc!==Xd&&(s.blendSrc=this.blendSrc),this.blendDst!==kd&&(s.blendDst=this.blendDst),this.blendEquation!==ns&&(s.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(s.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(s.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(s.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(s.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(s.blendAlpha=this.blendAlpha),this.depthFunc!==mo&&(s.depthFunc=this.depthFunc),this.depthTest===!1&&(s.depthTest=this.depthTest),this.depthWrite===!1&&(s.depthWrite=this.depthWrite),this.colorWrite===!1&&(s.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(s.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==r0&&(s.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(s.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(s.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ks&&(s.stencilFail=this.stencilFail),this.stencilZFail!==Ks&&(s.stencilZFail=this.stencilZFail),this.stencilZPass!==Ks&&(s.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(s.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(s.rotation=this.rotation),this.polygonOffset===!0&&(s.polygonOffset=!0),this.polygonOffsetFactor!==0&&(s.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(s.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(s.linewidth=this.linewidth),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.dithering===!0&&(s.dithering=!0),this.alphaTest>0&&(s.alphaTest=this.alphaTest),this.alphaHash===!0&&(s.alphaHash=!0),this.alphaToCoverage===!0&&(s.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(s.premultipliedAlpha=!0),this.forceSinglePass===!0&&(s.forceSinglePass=!0),this.wireframe===!0&&(s.wireframe=!0),this.wireframeLinewidth>1&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(s.flatShading=!0),this.visible===!1&&(s.visible=!1),this.toneMapped===!1&&(s.toneMapped=!1),this.fog===!1&&(s.fog=!1),Object.keys(this.userData).length>0&&(s.userData=this.userData);function c(f){const h=[];for(const d in f){const m=f[d];delete m.metadata,h.push(m)}return h}if(a){const f=c(n.textures),h=c(n.images);f.length>0&&(s.textures=f),h.length>0&&(s.images=h)}return s}clone(){return new this.constructor().copy(this)}copy(n){this.name=n.name,this.blending=n.blending,this.side=n.side,this.vertexColors=n.vertexColors,this.opacity=n.opacity,this.transparent=n.transparent,this.blendSrc=n.blendSrc,this.blendDst=n.blendDst,this.blendEquation=n.blendEquation,this.blendSrcAlpha=n.blendSrcAlpha,this.blendDstAlpha=n.blendDstAlpha,this.blendEquationAlpha=n.blendEquationAlpha,this.blendColor.copy(n.blendColor),this.blendAlpha=n.blendAlpha,this.depthFunc=n.depthFunc,this.depthTest=n.depthTest,this.depthWrite=n.depthWrite,this.stencilWriteMask=n.stencilWriteMask,this.stencilFunc=n.stencilFunc,this.stencilRef=n.stencilRef,this.stencilFuncMask=n.stencilFuncMask,this.stencilFail=n.stencilFail,this.stencilZFail=n.stencilZFail,this.stencilZPass=n.stencilZPass,this.stencilWrite=n.stencilWrite;const a=n.clippingPlanes;let s=null;if(a!==null){const c=a.length;s=new Array(c);for(let f=0;f!==c;++f)s[f]=a[f].clone()}return this.clippingPlanes=s,this.clipIntersection=n.clipIntersection,this.clipShadows=n.clipShadows,this.shadowSide=n.shadowSide,this.colorWrite=n.colorWrite,this.precision=n.precision,this.polygonOffset=n.polygonOffset,this.polygonOffsetFactor=n.polygonOffsetFactor,this.polygonOffsetUnits=n.polygonOffsetUnits,this.dithering=n.dithering,this.alphaTest=n.alphaTest,this.alphaHash=n.alphaHash,this.alphaToCoverage=n.alphaToCoverage,this.premultipliedAlpha=n.premultipliedAlpha,this.forceSinglePass=n.forceSinglePass,this.visible=n.visible,this.toneMapped=n.toneMapped,this.userData=JSON.parse(JSON.stringify(n.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(n){n===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Rx extends Eo{static get type(){return"MeshBasicMaterial"}constructor(n){super(),this.isMeshBasicMaterial=!0,this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Va,this.combine=cx,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(n)}copy(n){return super.copy(n),this.color.copy(n.color),this.map=n.map,this.lightMap=n.lightMap,this.lightMapIntensity=n.lightMapIntensity,this.aoMap=n.aoMap,this.aoMapIntensity=n.aoMapIntensity,this.specularMap=n.specularMap,this.alphaMap=n.alphaMap,this.envMap=n.envMap,this.envMapRotation.copy(n.envMapRotation),this.combine=n.combine,this.reflectivity=n.reflectivity,this.refractionRatio=n.refractionRatio,this.wireframe=n.wireframe,this.wireframeLinewidth=n.wireframeLinewidth,this.wireframeLinecap=n.wireframeLinecap,this.wireframeLinejoin=n.wireframeLinejoin,this.fog=n.fog,this}}const Cn=new ft,ru=new an;class Sn{constructor(n,a,s=!1){if(Array.isArray(n))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=n,this.itemSize=a,this.count=n!==void 0?n.length/a:0,this.normalized=s,this.usage=s0,this.updateRanges=[],this.gpuType=Pa,this.version=0}onUploadCallback(){}set needsUpdate(n){n===!0&&this.version++}setUsage(n){return this.usage=n,this}addUpdateRange(n,a){this.updateRanges.push({start:n,count:a})}clearUpdateRanges(){this.updateRanges.length=0}copy(n){return this.name=n.name,this.array=new n.array.constructor(n.array),this.itemSize=n.itemSize,this.count=n.count,this.normalized=n.normalized,this.usage=n.usage,this.gpuType=n.gpuType,this}copyAt(n,a,s){n*=this.itemSize,s*=a.itemSize;for(let c=0,f=this.itemSize;c<f;c++)this.array[n+c]=a.array[s+c];return this}copyArray(n){return this.array.set(n),this}applyMatrix3(n){if(this.itemSize===2)for(let a=0,s=this.count;a<s;a++)ru.fromBufferAttribute(this,a),ru.applyMatrix3(n),this.setXY(a,ru.x,ru.y);else if(this.itemSize===3)for(let a=0,s=this.count;a<s;a++)Cn.fromBufferAttribute(this,a),Cn.applyMatrix3(n),this.setXYZ(a,Cn.x,Cn.y,Cn.z);return this}applyMatrix4(n){for(let a=0,s=this.count;a<s;a++)Cn.fromBufferAttribute(this,a),Cn.applyMatrix4(n),this.setXYZ(a,Cn.x,Cn.y,Cn.z);return this}applyNormalMatrix(n){for(let a=0,s=this.count;a<s;a++)Cn.fromBufferAttribute(this,a),Cn.applyNormalMatrix(n),this.setXYZ(a,Cn.x,Cn.y,Cn.z);return this}transformDirection(n){for(let a=0,s=this.count;a<s;a++)Cn.fromBufferAttribute(this,a),Cn.transformDirection(n),this.setXYZ(a,Cn.x,Cn.y,Cn.z);return this}set(n,a=0){return this.array.set(n,a),this}getComponent(n,a){let s=this.array[n*this.itemSize+a];return this.normalized&&(s=gl(s,this.array)),s}setComponent(n,a,s){return this.normalized&&(s=li(s,this.array)),this.array[n*this.itemSize+a]=s,this}getX(n){let a=this.array[n*this.itemSize];return this.normalized&&(a=gl(a,this.array)),a}setX(n,a){return this.normalized&&(a=li(a,this.array)),this.array[n*this.itemSize]=a,this}getY(n){let a=this.array[n*this.itemSize+1];return this.normalized&&(a=gl(a,this.array)),a}setY(n,a){return this.normalized&&(a=li(a,this.array)),this.array[n*this.itemSize+1]=a,this}getZ(n){let a=this.array[n*this.itemSize+2];return this.normalized&&(a=gl(a,this.array)),a}setZ(n,a){return this.normalized&&(a=li(a,this.array)),this.array[n*this.itemSize+2]=a,this}getW(n){let a=this.array[n*this.itemSize+3];return this.normalized&&(a=gl(a,this.array)),a}setW(n,a){return this.normalized&&(a=li(a,this.array)),this.array[n*this.itemSize+3]=a,this}setXY(n,a,s){return n*=this.itemSize,this.normalized&&(a=li(a,this.array),s=li(s,this.array)),this.array[n+0]=a,this.array[n+1]=s,this}setXYZ(n,a,s,c){return n*=this.itemSize,this.normalized&&(a=li(a,this.array),s=li(s,this.array),c=li(c,this.array)),this.array[n+0]=a,this.array[n+1]=s,this.array[n+2]=c,this}setXYZW(n,a,s,c,f){return n*=this.itemSize,this.normalized&&(a=li(a,this.array),s=li(s,this.array),c=li(c,this.array),f=li(f,this.array)),this.array[n+0]=a,this.array[n+1]=s,this.array[n+2]=c,this.array[n+3]=f,this}onUpload(n){return this.onUploadCallback=n,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const n={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(n.name=this.name),this.usage!==s0&&(n.usage=this.usage),n}}class Cx extends Sn{constructor(n,a,s){super(new Uint16Array(n),a,s)}}class wx extends Sn{constructor(n,a,s){super(new Uint32Array(n),a,s)}}class Ha extends Sn{constructor(n,a,s){super(new Float32Array(n),a,s)}}let PE=0;const Ni=new _n,Nd=new ti,so=new ft,Si=new wl,yl=new wl,In=new ft;class Qi extends Mo{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:PE++}),this.uuid=Rl(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(n){return Array.isArray(n)?this.index=new(Mx(n)?wx:Cx)(n,1):this.index=n,this}setIndirect(n){return this.indirect=n,this}getIndirect(){return this.indirect}getAttribute(n){return this.attributes[n]}setAttribute(n,a){return this.attributes[n]=a,this}deleteAttribute(n){return delete this.attributes[n],this}hasAttribute(n){return this.attributes[n]!==void 0}addGroup(n,a,s=0){this.groups.push({start:n,count:a,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(n,a){this.drawRange.start=n,this.drawRange.count=a}applyMatrix4(n){const a=this.attributes.position;a!==void 0&&(a.applyMatrix4(n),a.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const f=new Ae().getNormalMatrix(n);s.applyNormalMatrix(f),s.needsUpdate=!0}const c=this.attributes.tangent;return c!==void 0&&(c.transformDirection(n),c.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(n){return Ni.makeRotationFromQuaternion(n),this.applyMatrix4(Ni),this}rotateX(n){return Ni.makeRotationX(n),this.applyMatrix4(Ni),this}rotateY(n){return Ni.makeRotationY(n),this.applyMatrix4(Ni),this}rotateZ(n){return Ni.makeRotationZ(n),this.applyMatrix4(Ni),this}translate(n,a,s){return Ni.makeTranslation(n,a,s),this.applyMatrix4(Ni),this}scale(n,a,s){return Ni.makeScale(n,a,s),this.applyMatrix4(Ni),this}lookAt(n){return Nd.lookAt(n),Nd.updateMatrix(),this.applyMatrix4(Nd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(so).negate(),this.translate(so.x,so.y,so.z),this}setFromPoints(n){const a=this.getAttribute("position");if(a===void 0){const s=[];for(let c=0,f=n.length;c<f;c++){const h=n[c];s.push(h.x,h.y,h.z||0)}this.setAttribute("position",new Ha(s,3))}else{for(let s=0,c=a.count;s<c;s++){const f=n[s];a.setXYZ(s,f.x,f.y,f.z||0)}n.length>a.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),a.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wl);const n=this.attributes.position,a=this.morphAttributes.position;if(n&&n.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new ft(-1/0,-1/0,-1/0),new ft(1/0,1/0,1/0));return}if(n!==void 0){if(this.boundingBox.setFromBufferAttribute(n),a)for(let s=0,c=a.length;s<c;s++){const f=a[s];Si.setFromBufferAttribute(f),this.morphTargetsRelative?(In.addVectors(this.boundingBox.min,Si.min),this.boundingBox.expandByPoint(In),In.addVectors(this.boundingBox.max,Si.max),this.boundingBox.expandByPoint(In)):(this.boundingBox.expandByPoint(Si.min),this.boundingBox.expandByPoint(Si.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Dl);const n=this.attributes.position,a=this.morphAttributes.position;if(n&&n.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new ft,1/0);return}if(n){const s=this.boundingSphere.center;if(Si.setFromBufferAttribute(n),a)for(let f=0,h=a.length;f<h;f++){const d=a[f];yl.setFromBufferAttribute(d),this.morphTargetsRelative?(In.addVectors(Si.min,yl.min),Si.expandByPoint(In),In.addVectors(Si.max,yl.max),Si.expandByPoint(In)):(Si.expandByPoint(yl.min),Si.expandByPoint(yl.max))}Si.getCenter(s);let c=0;for(let f=0,h=n.count;f<h;f++)In.fromBufferAttribute(n,f),c=Math.max(c,s.distanceToSquared(In));if(a)for(let f=0,h=a.length;f<h;f++){const d=a[f],m=this.morphTargetsRelative;for(let _=0,g=d.count;_<g;_++)In.fromBufferAttribute(d,_),m&&(so.fromBufferAttribute(n,_),In.add(so)),c=Math.max(c,s.distanceToSquared(In))}this.boundingSphere.radius=Math.sqrt(c),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const n=this.index,a=this.attributes;if(n===null||a.position===void 0||a.normal===void 0||a.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=a.position,c=a.normal,f=a.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Sn(new Float32Array(4*s.count),4));const h=this.getAttribute("tangent"),d=[],m=[];for(let q=0;q<s.count;q++)d[q]=new ft,m[q]=new ft;const _=new ft,g=new ft,p=new ft,x=new an,M=new an,T=new an,R=new ft,S=new ft;function y(q,U,C){_.fromBufferAttribute(s,q),g.fromBufferAttribute(s,U),p.fromBufferAttribute(s,C),x.fromBufferAttribute(f,q),M.fromBufferAttribute(f,U),T.fromBufferAttribute(f,C),g.sub(_),p.sub(_),M.sub(x),T.sub(x);const B=1/(M.x*T.y-T.x*M.y);isFinite(B)&&(R.copy(g).multiplyScalar(T.y).addScaledVector(p,-M.y).multiplyScalar(B),S.copy(p).multiplyScalar(M.x).addScaledVector(g,-T.x).multiplyScalar(B),d[q].add(R),d[U].add(R),d[C].add(R),m[q].add(S),m[U].add(S),m[C].add(S))}let P=this.groups;P.length===0&&(P=[{start:0,count:n.count}]);for(let q=0,U=P.length;q<U;++q){const C=P[q],B=C.start,at=C.count;for(let ot=B,ht=B+at;ot<ht;ot+=3)y(n.getX(ot+0),n.getX(ot+1),n.getX(ot+2))}const O=new ft,N=new ft,et=new ft,V=new ft;function I(q){et.fromBufferAttribute(c,q),V.copy(et);const U=d[q];O.copy(U),O.sub(et.multiplyScalar(et.dot(U))).normalize(),N.crossVectors(V,U);const B=N.dot(m[q])<0?-1:1;h.setXYZW(q,O.x,O.y,O.z,B)}for(let q=0,U=P.length;q<U;++q){const C=P[q],B=C.start,at=C.count;for(let ot=B,ht=B+at;ot<ht;ot+=3)I(n.getX(ot+0)),I(n.getX(ot+1)),I(n.getX(ot+2))}}computeVertexNormals(){const n=this.index,a=this.getAttribute("position");if(a!==void 0){let s=this.getAttribute("normal");if(s===void 0)s=new Sn(new Float32Array(a.count*3),3),this.setAttribute("normal",s);else for(let x=0,M=s.count;x<M;x++)s.setXYZ(x,0,0,0);const c=new ft,f=new ft,h=new ft,d=new ft,m=new ft,_=new ft,g=new ft,p=new ft;if(n)for(let x=0,M=n.count;x<M;x+=3){const T=n.getX(x+0),R=n.getX(x+1),S=n.getX(x+2);c.fromBufferAttribute(a,T),f.fromBufferAttribute(a,R),h.fromBufferAttribute(a,S),g.subVectors(h,f),p.subVectors(c,f),g.cross(p),d.fromBufferAttribute(s,T),m.fromBufferAttribute(s,R),_.fromBufferAttribute(s,S),d.add(g),m.add(g),_.add(g),s.setXYZ(T,d.x,d.y,d.z),s.setXYZ(R,m.x,m.y,m.z),s.setXYZ(S,_.x,_.y,_.z)}else for(let x=0,M=a.count;x<M;x+=3)c.fromBufferAttribute(a,x+0),f.fromBufferAttribute(a,x+1),h.fromBufferAttribute(a,x+2),g.subVectors(h,f),p.subVectors(c,f),g.cross(p),s.setXYZ(x+0,g.x,g.y,g.z),s.setXYZ(x+1,g.x,g.y,g.z),s.setXYZ(x+2,g.x,g.y,g.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const n=this.attributes.normal;for(let a=0,s=n.count;a<s;a++)In.fromBufferAttribute(n,a),In.normalize(),n.setXYZ(a,In.x,In.y,In.z)}toNonIndexed(){function n(d,m){const _=d.array,g=d.itemSize,p=d.normalized,x=new _.constructor(m.length*g);let M=0,T=0;for(let R=0,S=m.length;R<S;R++){d.isInterleavedBufferAttribute?M=m[R]*d.data.stride+d.offset:M=m[R]*g;for(let y=0;y<g;y++)x[T++]=_[M++]}return new Sn(x,g,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const a=new Qi,s=this.index.array,c=this.attributes;for(const d in c){const m=c[d],_=n(m,s);a.setAttribute(d,_)}const f=this.morphAttributes;for(const d in f){const m=[],_=f[d];for(let g=0,p=_.length;g<p;g++){const x=_[g],M=n(x,s);m.push(M)}a.morphAttributes[d]=m}a.morphTargetsRelative=this.morphTargetsRelative;const h=this.groups;for(let d=0,m=h.length;d<m;d++){const _=h[d];a.addGroup(_.start,_.count,_.materialIndex)}return a}toJSON(){const n={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),Object.keys(this.userData).length>0&&(n.userData=this.userData),this.parameters!==void 0){const m=this.parameters;for(const _ in m)m[_]!==void 0&&(n[_]=m[_]);return n}n.data={attributes:{}};const a=this.index;a!==null&&(n.data.index={type:a.array.constructor.name,array:Array.prototype.slice.call(a.array)});const s=this.attributes;for(const m in s){const _=s[m];n.data.attributes[m]=_.toJSON(n.data)}const c={};let f=!1;for(const m in this.morphAttributes){const _=this.morphAttributes[m],g=[];for(let p=0,x=_.length;p<x;p++){const M=_[p];g.push(M.toJSON(n.data))}g.length>0&&(c[m]=g,f=!0)}f&&(n.data.morphAttributes=c,n.data.morphTargetsRelative=this.morphTargetsRelative);const h=this.groups;h.length>0&&(n.data.groups=JSON.parse(JSON.stringify(h)));const d=this.boundingSphere;return d!==null&&(n.data.boundingSphere={center:d.center.toArray(),radius:d.radius}),n}clone(){return new this.constructor().copy(this)}copy(n){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const a={};this.name=n.name;const s=n.index;s!==null&&this.setIndex(s.clone(a));const c=n.attributes;for(const _ in c){const g=c[_];this.setAttribute(_,g.clone(a))}const f=n.morphAttributes;for(const _ in f){const g=[],p=f[_];for(let x=0,M=p.length;x<M;x++)g.push(p[x].clone(a));this.morphAttributes[_]=g}this.morphTargetsRelative=n.morphTargetsRelative;const h=n.groups;for(let _=0,g=h.length;_<g;_++){const p=h[_];this.addGroup(p.start,p.count,p.materialIndex)}const d=n.boundingBox;d!==null&&(this.boundingBox=d.clone());const m=n.boundingSphere;return m!==null&&(this.boundingSphere=m.clone()),this.drawRange.start=n.drawRange.start,this.drawRange.count=n.drawRange.count,this.userData=n.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const E0=new _n,Kr=new Hp,su=new Dl,T0=new ft,ou=new ft,lu=new ft,cu=new ft,Ld=new ft,uu=new ft,b0=new ft,fu=new ft;class Ba extends ti{constructor(n=new Qi,a=new Rx){super(),this.isMesh=!0,this.type="Mesh",this.geometry=n,this.material=a,this.updateMorphTargets()}copy(n,a){return super.copy(n,a),n.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=n.morphTargetInfluences.slice()),n.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},n.morphTargetDictionary)),this.material=Array.isArray(n.material)?n.material.slice():n.material,this.geometry=n.geometry,this}updateMorphTargets(){const a=this.geometry.morphAttributes,s=Object.keys(a);if(s.length>0){const c=a[s[0]];if(c!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let f=0,h=c.length;f<h;f++){const d=c[f].name||String(f);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=f}}}}getVertexPosition(n,a){const s=this.geometry,c=s.attributes.position,f=s.morphAttributes.position,h=s.morphTargetsRelative;a.fromBufferAttribute(c,n);const d=this.morphTargetInfluences;if(f&&d){uu.set(0,0,0);for(let m=0,_=f.length;m<_;m++){const g=d[m],p=f[m];g!==0&&(Ld.fromBufferAttribute(p,n),h?uu.addScaledVector(Ld,g):uu.addScaledVector(Ld.sub(a),g))}a.add(uu)}return a}raycast(n,a){const s=this.geometry,c=this.material,f=this.matrixWorld;c!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),su.copy(s.boundingSphere),su.applyMatrix4(f),Kr.copy(n.ray).recast(n.near),!(su.containsPoint(Kr.origin)===!1&&(Kr.intersectSphere(su,T0)===null||Kr.origin.distanceToSquared(T0)>(n.far-n.near)**2))&&(E0.copy(f).invert(),Kr.copy(n.ray).applyMatrix4(E0),!(s.boundingBox!==null&&Kr.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(n,a,Kr)))}_computeIntersections(n,a,s){let c;const f=this.geometry,h=this.material,d=f.index,m=f.attributes.position,_=f.attributes.uv,g=f.attributes.uv1,p=f.attributes.normal,x=f.groups,M=f.drawRange;if(d!==null)if(Array.isArray(h))for(let T=0,R=x.length;T<R;T++){const S=x[T],y=h[S.materialIndex],P=Math.max(S.start,M.start),O=Math.min(d.count,Math.min(S.start+S.count,M.start+M.count));for(let N=P,et=O;N<et;N+=3){const V=d.getX(N),I=d.getX(N+1),q=d.getX(N+2);c=hu(this,y,n,s,_,g,p,V,I,q),c&&(c.faceIndex=Math.floor(N/3),c.face.materialIndex=S.materialIndex,a.push(c))}}else{const T=Math.max(0,M.start),R=Math.min(d.count,M.start+M.count);for(let S=T,y=R;S<y;S+=3){const P=d.getX(S),O=d.getX(S+1),N=d.getX(S+2);c=hu(this,h,n,s,_,g,p,P,O,N),c&&(c.faceIndex=Math.floor(S/3),a.push(c))}}else if(m!==void 0)if(Array.isArray(h))for(let T=0,R=x.length;T<R;T++){const S=x[T],y=h[S.materialIndex],P=Math.max(S.start,M.start),O=Math.min(m.count,Math.min(S.start+S.count,M.start+M.count));for(let N=P,et=O;N<et;N+=3){const V=N,I=N+1,q=N+2;c=hu(this,y,n,s,_,g,p,V,I,q),c&&(c.faceIndex=Math.floor(N/3),c.face.materialIndex=S.materialIndex,a.push(c))}}else{const T=Math.max(0,M.start),R=Math.min(m.count,M.start+M.count);for(let S=T,y=R;S<y;S+=3){const P=S,O=S+1,N=S+2;c=hu(this,h,n,s,_,g,p,P,O,N),c&&(c.faceIndex=Math.floor(S/3),a.push(c))}}}}function IE(o,n,a,s,c,f,h,d){let m;if(n.side===ui?m=s.intersectTriangle(h,f,c,!0,d):m=s.intersectTriangle(c,f,h,n.side===Ar,d),m===null)return null;fu.copy(d),fu.applyMatrix4(o.matrixWorld);const _=a.ray.origin.distanceTo(fu);return _<a.near||_>a.far?null:{distance:_,point:fu.clone(),object:o}}function hu(o,n,a,s,c,f,h,d,m,_){o.getVertexPosition(d,ou),o.getVertexPosition(m,lu),o.getVertexPosition(_,cu);const g=IE(o,n,a,s,ou,lu,cu,b0);if(g){const p=new ft;qi.getBarycoord(b0,ou,lu,cu,p),c&&(g.uv=qi.getInterpolatedAttribute(c,d,m,_,p,new an)),f&&(g.uv1=qi.getInterpolatedAttribute(f,d,m,_,p,new an)),h&&(g.normal=qi.getInterpolatedAttribute(h,d,m,_,p,new ft),g.normal.dot(s.direction)>0&&g.normal.multiplyScalar(-1));const x={a:d,b:m,c:_,normal:new ft,materialIndex:0};qi.getNormal(ou,lu,cu,x.normal),g.face=x,g.barycoord=p}return g}class Ul extends Qi{constructor(n=1,a=1,s=1,c=1,f=1,h=1){super(),this.type="BoxGeometry",this.parameters={width:n,height:a,depth:s,widthSegments:c,heightSegments:f,depthSegments:h};const d=this;c=Math.floor(c),f=Math.floor(f),h=Math.floor(h);const m=[],_=[],g=[],p=[];let x=0,M=0;T("z","y","x",-1,-1,s,a,n,h,f,0),T("z","y","x",1,-1,s,a,-n,h,f,1),T("x","z","y",1,1,n,s,a,c,h,2),T("x","z","y",1,-1,n,s,-a,c,h,3),T("x","y","z",1,-1,n,a,s,c,f,4),T("x","y","z",-1,-1,n,a,-s,c,f,5),this.setIndex(m),this.setAttribute("position",new Ha(_,3)),this.setAttribute("normal",new Ha(g,3)),this.setAttribute("uv",new Ha(p,2));function T(R,S,y,P,O,N,et,V,I,q,U){const C=N/I,B=et/q,at=N/2,ot=et/2,ht=V/2,gt=I+1,X=q+1;let rt=0,Z=0;const St=new ft;for(let bt=0;bt<X;bt++){const Vt=bt*B-ot;for(let ce=0;ce<gt;ce++){const pt=ce*C-at;St[R]=pt*P,St[S]=Vt*O,St[y]=ht,_.push(St.x,St.y,St.z),St[R]=0,St[S]=0,St[y]=V>0?1:-1,g.push(St.x,St.y,St.z),p.push(ce/I),p.push(1-bt/q),rt+=1}}for(let bt=0;bt<q;bt++)for(let Vt=0;Vt<I;Vt++){const ce=x+Vt+gt*bt,pt=x+Vt+gt*(bt+1),A=x+(Vt+1)+gt*(bt+1),k=x+(Vt+1)+gt*bt;m.push(ce,pt,k),m.push(pt,A,k),Z+=6}d.addGroup(M,Z,U),M+=Z,x+=rt}}copy(n){return super.copy(n),this.parameters=Object.assign({},n.parameters),this}static fromJSON(n){return new Ul(n.width,n.height,n.depth,n.widthSegments,n.heightSegments,n.depthSegments)}}function yo(o){const n={};for(const a in o){n[a]={};for(const s in o[a]){const c=o[a][s];c&&(c.isColor||c.isMatrix3||c.isMatrix4||c.isVector2||c.isVector3||c.isVector4||c.isTexture||c.isQuaternion)?c.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),n[a][s]=null):n[a][s]=c.clone():Array.isArray(c)?n[a][s]=c.slice():n[a][s]=c}}return n}function $n(o){const n={};for(let a=0;a<o.length;a++){const s=yo(o[a]);for(const c in s)n[c]=s[c]}return n}function BE(o){const n=[];for(let a=0;a<o.length;a++)n.push(o[a].clone());return n}function Dx(o){const n=o.getRenderTarget();return n===null?o.outputColorSpace:n.isXRRenderTarget===!0?n.texture.colorSpace:Ve.workingColorSpace}const FE={clone:yo,merge:$n};var HE=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,GE=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ki extends Eo{static get type(){return"ShaderMaterial"}constructor(n){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=HE,this.fragmentShader=GE,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,n!==void 0&&this.setValues(n)}copy(n){return super.copy(n),this.fragmentShader=n.fragmentShader,this.vertexShader=n.vertexShader,this.uniforms=yo(n.uniforms),this.uniformsGroups=BE(n.uniformsGroups),this.defines=Object.assign({},n.defines),this.wireframe=n.wireframe,this.wireframeLinewidth=n.wireframeLinewidth,this.fog=n.fog,this.lights=n.lights,this.clipping=n.clipping,this.extensions=Object.assign({},n.extensions),this.glslVersion=n.glslVersion,this}toJSON(n){const a=super.toJSON(n);a.glslVersion=this.glslVersion,a.uniforms={};for(const c in this.uniforms){const h=this.uniforms[c].value;h&&h.isTexture?a.uniforms[c]={type:"t",value:h.toJSON(n).uuid}:h&&h.isColor?a.uniforms[c]={type:"c",value:h.getHex()}:h&&h.isVector2?a.uniforms[c]={type:"v2",value:h.toArray()}:h&&h.isVector3?a.uniforms[c]={type:"v3",value:h.toArray()}:h&&h.isVector4?a.uniforms[c]={type:"v4",value:h.toArray()}:h&&h.isMatrix3?a.uniforms[c]={type:"m3",value:h.toArray()}:h&&h.isMatrix4?a.uniforms[c]={type:"m4",value:h.toArray()}:a.uniforms[c]={value:h}}Object.keys(this.defines).length>0&&(a.defines=this.defines),a.vertexShader=this.vertexShader,a.fragmentShader=this.fragmentShader,a.lights=this.lights,a.clipping=this.clipping;const s={};for(const c in this.extensions)this.extensions[c]===!0&&(s[c]=!0);return Object.keys(s).length>0&&(a.extensions=s),a}}class Ux extends ti{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new _n,this.projectionMatrix=new _n,this.projectionMatrixInverse=new _n,this.coordinateSystem=Ia}copy(n,a){return super.copy(n,a),this.matrixWorldInverse.copy(n.matrixWorldInverse),this.projectionMatrix.copy(n.projectionMatrix),this.projectionMatrixInverse.copy(n.projectionMatrixInverse),this.coordinateSystem=n.coordinateSystem,this}getWorldDirection(n){return super.getWorldDirection(n).negate()}updateMatrixWorld(n){super.updateMatrixWorld(n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(n,a){super.updateWorldMatrix(n,a),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mr=new ft,A0=new an,R0=new an;class Oi extends Ux{constructor(n=50,a=1,s=.1,c=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=n,this.zoom=1,this.near=s,this.far=c,this.focus=10,this.aspect=a,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(n,a){return super.copy(n,a),this.fov=n.fov,this.zoom=n.zoom,this.near=n.near,this.far=n.far,this.focus=n.focus,this.aspect=n.aspect,this.view=n.view===null?null:Object.assign({},n.view),this.filmGauge=n.filmGauge,this.filmOffset=n.filmOffset,this}setFocalLength(n){const a=.5*this.getFilmHeight()/n;this.fov=Cp*2*Math.atan(a),this.updateProjectionMatrix()}getFocalLength(){const n=Math.tan(dd*.5*this.fov);return .5*this.getFilmHeight()/n}getEffectiveFOV(){return Cp*2*Math.atan(Math.tan(dd*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(n,a,s){Mr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),a.set(Mr.x,Mr.y).multiplyScalar(-n/Mr.z),Mr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(Mr.x,Mr.y).multiplyScalar(-n/Mr.z)}getViewSize(n,a){return this.getViewBounds(n,A0,R0),a.subVectors(R0,A0)}setViewOffset(n,a,s,c,f,h){this.aspect=n/a,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=n,this.view.fullHeight=a,this.view.offsetX=s,this.view.offsetY=c,this.view.width=f,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const n=this.near;let a=n*Math.tan(dd*.5*this.fov)/this.zoom,s=2*a,c=this.aspect*s,f=-.5*c;const h=this.view;if(this.view!==null&&this.view.enabled){const m=h.fullWidth,_=h.fullHeight;f+=h.offsetX*c/m,a-=h.offsetY*s/_,c*=h.width/m,s*=h.height/_}const d=this.filmOffset;d!==0&&(f+=n*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(f,f+c,a,a-s,n,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(n){const a=super.toJSON(n);return a.object.fov=this.fov,a.object.zoom=this.zoom,a.object.near=this.near,a.object.far=this.far,a.object.focus=this.focus,a.object.aspect=this.aspect,this.view!==null&&(a.object.view=Object.assign({},this.view)),a.object.filmGauge=this.filmGauge,a.object.filmOffset=this.filmOffset,a}}const oo=-90,lo=1;class VE extends ti{constructor(n,a,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const c=new Oi(oo,lo,n,a);c.layers=this.layers,this.add(c);const f=new Oi(oo,lo,n,a);f.layers=this.layers,this.add(f);const h=new Oi(oo,lo,n,a);h.layers=this.layers,this.add(h);const d=new Oi(oo,lo,n,a);d.layers=this.layers,this.add(d);const m=new Oi(oo,lo,n,a);m.layers=this.layers,this.add(m);const _=new Oi(oo,lo,n,a);_.layers=this.layers,this.add(_)}updateCoordinateSystem(){const n=this.coordinateSystem,a=this.children.concat(),[s,c,f,h,d,m]=a;for(const _ of a)this.remove(_);if(n===Ia)s.up.set(0,1,0),s.lookAt(1,0,0),c.up.set(0,1,0),c.lookAt(-1,0,0),f.up.set(0,0,-1),f.lookAt(0,1,0),h.up.set(0,0,1),h.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),m.up.set(0,1,0),m.lookAt(0,0,-1);else if(n===Cu)s.up.set(0,-1,0),s.lookAt(-1,0,0),c.up.set(0,-1,0),c.lookAt(1,0,0),f.up.set(0,0,1),f.lookAt(0,1,0),h.up.set(0,0,-1),h.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),m.up.set(0,-1,0),m.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+n);for(const _ of a)this.add(_),_.updateMatrixWorld()}update(n,a){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:c}=this;this.coordinateSystem!==n.coordinateSystem&&(this.coordinateSystem=n.coordinateSystem,this.updateCoordinateSystem());const[f,h,d,m,_,g]=this.children,p=n.getRenderTarget(),x=n.getActiveCubeFace(),M=n.getActiveMipmapLevel(),T=n.xr.enabled;n.xr.enabled=!1;const R=s.texture.generateMipmaps;s.texture.generateMipmaps=!1,n.setRenderTarget(s,0,c),n.render(a,f),n.setRenderTarget(s,1,c),n.render(a,h),n.setRenderTarget(s,2,c),n.render(a,d),n.setRenderTarget(s,3,c),n.render(a,m),n.setRenderTarget(s,4,c),n.render(a,_),s.texture.generateMipmaps=R,n.setRenderTarget(s,5,c),n.render(a,g),n.setRenderTarget(p,x,M),n.xr.enabled=T,s.texture.needsPMREMUpdate=!0}}class Nx extends fi{constructor(n,a,s,c,f,h,d,m,_,g){n=n!==void 0?n:[],a=a!==void 0?a:go,super(n,a,s,c,f,h,d,m,_,g),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(n){this.image=n}}class XE extends ls{constructor(n=1,a={}){super(n,n,a),this.isWebGLCubeRenderTarget=!0;const s={width:n,height:n,depth:1},c=[s,s,s,s,s,s];this.texture=new Nx(c,a.mapping,a.wrapS,a.wrapT,a.magFilter,a.minFilter,a.format,a.type,a.anisotropy,a.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=a.generateMipmaps!==void 0?a.generateMipmaps:!1,this.texture.minFilter=a.minFilter!==void 0?a.minFilter:da}fromEquirectangularTexture(n,a){this.texture.type=a.type,this.texture.colorSpace=a.colorSpace,this.texture.generateMipmaps=a.generateMipmaps,this.texture.minFilter=a.minFilter,this.texture.magFilter=a.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},c=new Ul(5,5,5),f=new Ki({name:"CubemapFromEquirect",uniforms:yo(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:ui,blending:Tr});f.uniforms.tEquirect.value=a;const h=new Ba(c,f),d=a.minFilter;return a.minFilter===rs&&(a.minFilter=da),new VE(1,10,this).update(n,h),a.minFilter=d,h.geometry.dispose(),h.material.dispose(),this}clear(n,a,s,c){const f=n.getRenderTarget();for(let h=0;h<6;h++)n.setRenderTarget(this,h),n.clear(a,s,c);n.setRenderTarget(f)}}const Od=new ft,kE=new ft,jE=new Ae;class ts{constructor(n=new ft(1,0,0),a=0){this.isPlane=!0,this.normal=n,this.constant=a}set(n,a){return this.normal.copy(n),this.constant=a,this}setComponents(n,a,s,c){return this.normal.set(n,a,s),this.constant=c,this}setFromNormalAndCoplanarPoint(n,a){return this.normal.copy(n),this.constant=-a.dot(this.normal),this}setFromCoplanarPoints(n,a,s){const c=Od.subVectors(s,a).cross(kE.subVectors(n,a)).normalize();return this.setFromNormalAndCoplanarPoint(c,n),this}copy(n){return this.normal.copy(n.normal),this.constant=n.constant,this}normalize(){const n=1/this.normal.length();return this.normal.multiplyScalar(n),this.constant*=n,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(n){return this.normal.dot(n)+this.constant}distanceToSphere(n){return this.distanceToPoint(n.center)-n.radius}projectPoint(n,a){return a.copy(n).addScaledVector(this.normal,-this.distanceToPoint(n))}intersectLine(n,a){const s=n.delta(Od),c=this.normal.dot(s);if(c===0)return this.distanceToPoint(n.start)===0?a.copy(n.start):null;const f=-(n.start.dot(this.normal)+this.constant)/c;return f<0||f>1?null:a.copy(n.start).addScaledVector(s,f)}intersectsLine(n){const a=this.distanceToPoint(n.start),s=this.distanceToPoint(n.end);return a<0&&s>0||s<0&&a>0}intersectsBox(n){return n.intersectsPlane(this)}intersectsSphere(n){return n.intersectsPlane(this)}coplanarPoint(n){return n.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(n,a){const s=a||jE.getNormalMatrix(n),c=this.coplanarPoint(Od).applyMatrix4(n),f=this.normal.applyMatrix3(s).normalize();return this.constant=-c.dot(f),this}translate(n){return this.constant-=n.dot(this.normal),this}equals(n){return n.normal.equals(this.normal)&&n.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Qr=new Dl,du=new ft;class Lx{constructor(n=new ts,a=new ts,s=new ts,c=new ts,f=new ts,h=new ts){this.planes=[n,a,s,c,f,h]}set(n,a,s,c,f,h){const d=this.planes;return d[0].copy(n),d[1].copy(a),d[2].copy(s),d[3].copy(c),d[4].copy(f),d[5].copy(h),this}copy(n){const a=this.planes;for(let s=0;s<6;s++)a[s].copy(n.planes[s]);return this}setFromProjectionMatrix(n,a=Ia){const s=this.planes,c=n.elements,f=c[0],h=c[1],d=c[2],m=c[3],_=c[4],g=c[5],p=c[6],x=c[7],M=c[8],T=c[9],R=c[10],S=c[11],y=c[12],P=c[13],O=c[14],N=c[15];if(s[0].setComponents(m-f,x-_,S-M,N-y).normalize(),s[1].setComponents(m+f,x+_,S+M,N+y).normalize(),s[2].setComponents(m+h,x+g,S+T,N+P).normalize(),s[3].setComponents(m-h,x-g,S-T,N-P).normalize(),s[4].setComponents(m-d,x-p,S-R,N-O).normalize(),a===Ia)s[5].setComponents(m+d,x+p,S+R,N+O).normalize();else if(a===Cu)s[5].setComponents(d,p,R,O).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+a);return this}intersectsObject(n){if(n.boundingSphere!==void 0)n.boundingSphere===null&&n.computeBoundingSphere(),Qr.copy(n.boundingSphere).applyMatrix4(n.matrixWorld);else{const a=n.geometry;a.boundingSphere===null&&a.computeBoundingSphere(),Qr.copy(a.boundingSphere).applyMatrix4(n.matrixWorld)}return this.intersectsSphere(Qr)}intersectsSprite(n){return Qr.center.set(0,0,0),Qr.radius=.7071067811865476,Qr.applyMatrix4(n.matrixWorld),this.intersectsSphere(Qr)}intersectsSphere(n){const a=this.planes,s=n.center,c=-n.radius;for(let f=0;f<6;f++)if(a[f].distanceToPoint(s)<c)return!1;return!0}intersectsBox(n){const a=this.planes;for(let s=0;s<6;s++){const c=a[s];if(du.x=c.normal.x>0?n.max.x:n.min.x,du.y=c.normal.y>0?n.max.y:n.min.y,du.z=c.normal.z>0?n.max.z:n.min.z,c.distanceToPoint(du)<0)return!1}return!0}containsPoint(n){const a=this.planes;for(let s=0;s<6;s++)if(a[s].distanceToPoint(n)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Ox(){let o=null,n=!1,a=null,s=null;function c(f,h){a(f,h),s=o.requestAnimationFrame(c)}return{start:function(){n!==!0&&a!==null&&(s=o.requestAnimationFrame(c),n=!0)},stop:function(){o.cancelAnimationFrame(s),n=!1},setAnimationLoop:function(f){a=f},setContext:function(f){o=f}}}function qE(o){const n=new WeakMap;function a(d,m){const _=d.array,g=d.usage,p=_.byteLength,x=o.createBuffer();o.bindBuffer(m,x),o.bufferData(m,_,g),d.onUploadCallback();let M;if(_ instanceof Float32Array)M=o.FLOAT;else if(_ instanceof Uint16Array)d.isFloat16BufferAttribute?M=o.HALF_FLOAT:M=o.UNSIGNED_SHORT;else if(_ instanceof Int16Array)M=o.SHORT;else if(_ instanceof Uint32Array)M=o.UNSIGNED_INT;else if(_ instanceof Int32Array)M=o.INT;else if(_ instanceof Int8Array)M=o.BYTE;else if(_ instanceof Uint8Array)M=o.UNSIGNED_BYTE;else if(_ instanceof Uint8ClampedArray)M=o.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+_);return{buffer:x,type:M,bytesPerElement:_.BYTES_PER_ELEMENT,version:d.version,size:p}}function s(d,m,_){const g=m.array,p=m.updateRanges;if(o.bindBuffer(_,d),p.length===0)o.bufferSubData(_,0,g);else{p.sort((M,T)=>M.start-T.start);let x=0;for(let M=1;M<p.length;M++){const T=p[x],R=p[M];R.start<=T.start+T.count+1?T.count=Math.max(T.count,R.start+R.count-T.start):(++x,p[x]=R)}p.length=x+1;for(let M=0,T=p.length;M<T;M++){const R=p[M];o.bufferSubData(_,R.start*g.BYTES_PER_ELEMENT,g,R.start,R.count)}m.clearUpdateRanges()}m.onUploadCallback()}function c(d){return d.isInterleavedBufferAttribute&&(d=d.data),n.get(d)}function f(d){d.isInterleavedBufferAttribute&&(d=d.data);const m=n.get(d);m&&(o.deleteBuffer(m.buffer),n.delete(d))}function h(d,m){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const g=n.get(d);(!g||g.version<d.version)&&n.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const _=n.get(d);if(_===void 0)n.set(d,a(d,m));else if(_.version<d.version){if(_.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(_.buffer,d,m),_.version=d.version}}return{get:c,remove:f,update:h}}class Ou extends Qi{constructor(n=1,a=1,s=1,c=1){super(),this.type="PlaneGeometry",this.parameters={width:n,height:a,widthSegments:s,heightSegments:c};const f=n/2,h=a/2,d=Math.floor(s),m=Math.floor(c),_=d+1,g=m+1,p=n/d,x=a/m,M=[],T=[],R=[],S=[];for(let y=0;y<g;y++){const P=y*x-h;for(let O=0;O<_;O++){const N=O*p-f;T.push(N,-P,0),R.push(0,0,1),S.push(O/d),S.push(1-y/m)}}for(let y=0;y<m;y++)for(let P=0;P<d;P++){const O=P+_*y,N=P+_*(y+1),et=P+1+_*(y+1),V=P+1+_*y;M.push(O,N,V),M.push(N,et,V)}this.setIndex(M),this.setAttribute("position",new Ha(T,3)),this.setAttribute("normal",new Ha(R,3)),this.setAttribute("uv",new Ha(S,2))}copy(n){return super.copy(n),this.parameters=Object.assign({},n.parameters),this}static fromJSON(n){return new Ou(n.width,n.height,n.widthSegments,n.heightSegments)}}var YE=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,WE=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ZE=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,KE=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,QE=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,JE=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$E=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tT=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,eT=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,nT=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,iT=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,aT=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,rT=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,sT=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,oT=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,lT=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,cT=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,uT=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,fT=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hT=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,dT=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,pT=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,mT=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,gT=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,vT=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,_T=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,xT=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yT=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ST=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,MT=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ET="gl_FragColor = linearToOutputTexel( gl_FragColor );",TT=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,bT=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,AT=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,RT=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,CT=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wT=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,DT=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,UT=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,NT=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,LT=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,OT=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,zT=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,PT=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,IT=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,BT=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,FT=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,HT=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,GT=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,VT=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,XT=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kT=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,jT=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,qT=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,YT=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,WT=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ZT=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,KT=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,QT=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,JT=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,$T=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,t1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,e1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,n1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,i1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,a1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,r1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,s1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,o1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,l1=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,c1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,u1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,f1=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,h1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,d1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,p1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,m1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,g1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,v1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,_1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,x1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,y1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,S1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,M1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,E1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,T1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,b1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,A1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,R1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,C1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,w1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,D1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,U1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,N1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,L1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,O1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,z1=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,P1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,I1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,B1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,F1=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,H1=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,G1=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,V1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,X1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,k1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,j1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const q1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Y1=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Z1=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,K1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Q1=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,J1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,$1=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,tb=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,eb=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,nb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ib=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ab=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rb=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sb=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ob=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lb=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cb=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ub=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,fb=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,db=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,pb=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gb=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,vb=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_b=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xb=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yb=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Sb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Mb=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Eb=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Tb=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,bb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Re={alphahash_fragment:YE,alphahash_pars_fragment:WE,alphamap_fragment:ZE,alphamap_pars_fragment:KE,alphatest_fragment:QE,alphatest_pars_fragment:JE,aomap_fragment:$E,aomap_pars_fragment:tT,batching_pars_vertex:eT,batching_vertex:nT,begin_vertex:iT,beginnormal_vertex:aT,bsdfs:rT,iridescence_fragment:sT,bumpmap_pars_fragment:oT,clipping_planes_fragment:lT,clipping_planes_pars_fragment:cT,clipping_planes_pars_vertex:uT,clipping_planes_vertex:fT,color_fragment:hT,color_pars_fragment:dT,color_pars_vertex:pT,color_vertex:mT,common:gT,cube_uv_reflection_fragment:vT,defaultnormal_vertex:_T,displacementmap_pars_vertex:xT,displacementmap_vertex:yT,emissivemap_fragment:ST,emissivemap_pars_fragment:MT,colorspace_fragment:ET,colorspace_pars_fragment:TT,envmap_fragment:bT,envmap_common_pars_fragment:AT,envmap_pars_fragment:RT,envmap_pars_vertex:CT,envmap_physical_pars_fragment:FT,envmap_vertex:wT,fog_vertex:DT,fog_pars_vertex:UT,fog_fragment:NT,fog_pars_fragment:LT,gradientmap_pars_fragment:OT,lightmap_pars_fragment:zT,lights_lambert_fragment:PT,lights_lambert_pars_fragment:IT,lights_pars_begin:BT,lights_toon_fragment:HT,lights_toon_pars_fragment:GT,lights_phong_fragment:VT,lights_phong_pars_fragment:XT,lights_physical_fragment:kT,lights_physical_pars_fragment:jT,lights_fragment_begin:qT,lights_fragment_maps:YT,lights_fragment_end:WT,logdepthbuf_fragment:ZT,logdepthbuf_pars_fragment:KT,logdepthbuf_pars_vertex:QT,logdepthbuf_vertex:JT,map_fragment:$T,map_pars_fragment:t1,map_particle_fragment:e1,map_particle_pars_fragment:n1,metalnessmap_fragment:i1,metalnessmap_pars_fragment:a1,morphinstance_vertex:r1,morphcolor_vertex:s1,morphnormal_vertex:o1,morphtarget_pars_vertex:l1,morphtarget_vertex:c1,normal_fragment_begin:u1,normal_fragment_maps:f1,normal_pars_fragment:h1,normal_pars_vertex:d1,normal_vertex:p1,normalmap_pars_fragment:m1,clearcoat_normal_fragment_begin:g1,clearcoat_normal_fragment_maps:v1,clearcoat_pars_fragment:_1,iridescence_pars_fragment:x1,opaque_fragment:y1,packing:S1,premultiplied_alpha_fragment:M1,project_vertex:E1,dithering_fragment:T1,dithering_pars_fragment:b1,roughnessmap_fragment:A1,roughnessmap_pars_fragment:R1,shadowmap_pars_fragment:C1,shadowmap_pars_vertex:w1,shadowmap_vertex:D1,shadowmask_pars_fragment:U1,skinbase_vertex:N1,skinning_pars_vertex:L1,skinning_vertex:O1,skinnormal_vertex:z1,specularmap_fragment:P1,specularmap_pars_fragment:I1,tonemapping_fragment:B1,tonemapping_pars_fragment:F1,transmission_fragment:H1,transmission_pars_fragment:G1,uv_pars_fragment:V1,uv_pars_vertex:X1,uv_vertex:k1,worldpos_vertex:j1,background_vert:q1,background_frag:Y1,backgroundCube_vert:W1,backgroundCube_frag:Z1,cube_vert:K1,cube_frag:Q1,depth_vert:J1,depth_frag:$1,distanceRGBA_vert:tb,distanceRGBA_frag:eb,equirect_vert:nb,equirect_frag:ib,linedashed_vert:ab,linedashed_frag:rb,meshbasic_vert:sb,meshbasic_frag:ob,meshlambert_vert:lb,meshlambert_frag:cb,meshmatcap_vert:ub,meshmatcap_frag:fb,meshnormal_vert:hb,meshnormal_frag:db,meshphong_vert:pb,meshphong_frag:mb,meshphysical_vert:gb,meshphysical_frag:vb,meshtoon_vert:_b,meshtoon_frag:xb,points_vert:yb,points_frag:Sb,shadow_vert:Mb,shadow_frag:Eb,sprite_vert:Tb,sprite_frag:bb},kt={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ae},alphaMap:{value:null},alphaMapTransform:{value:new Ae},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ae}},envmap:{envMap:{value:null},envMapRotation:{value:new Ae},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ae}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ae}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ae},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ae},normalScale:{value:new an(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ae},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ae}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ae}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ae}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ae},alphaTest:{value:0},uvTransform:{value:new Ae}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new an(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ae},alphaMap:{value:null},alphaMapTransform:{value:new Ae},alphaTest:{value:0}}},ha={basic:{uniforms:$n([kt.common,kt.specularmap,kt.envmap,kt.aomap,kt.lightmap,kt.fog]),vertexShader:Re.meshbasic_vert,fragmentShader:Re.meshbasic_frag},lambert:{uniforms:$n([kt.common,kt.specularmap,kt.envmap,kt.aomap,kt.lightmap,kt.emissivemap,kt.bumpmap,kt.normalmap,kt.displacementmap,kt.fog,kt.lights,{emissive:{value:new ke(0)}}]),vertexShader:Re.meshlambert_vert,fragmentShader:Re.meshlambert_frag},phong:{uniforms:$n([kt.common,kt.specularmap,kt.envmap,kt.aomap,kt.lightmap,kt.emissivemap,kt.bumpmap,kt.normalmap,kt.displacementmap,kt.fog,kt.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30}}]),vertexShader:Re.meshphong_vert,fragmentShader:Re.meshphong_frag},standard:{uniforms:$n([kt.common,kt.envmap,kt.aomap,kt.lightmap,kt.emissivemap,kt.bumpmap,kt.normalmap,kt.displacementmap,kt.roughnessmap,kt.metalnessmap,kt.fog,kt.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Re.meshphysical_vert,fragmentShader:Re.meshphysical_frag},toon:{uniforms:$n([kt.common,kt.aomap,kt.lightmap,kt.emissivemap,kt.bumpmap,kt.normalmap,kt.displacementmap,kt.gradientmap,kt.fog,kt.lights,{emissive:{value:new ke(0)}}]),vertexShader:Re.meshtoon_vert,fragmentShader:Re.meshtoon_frag},matcap:{uniforms:$n([kt.common,kt.bumpmap,kt.normalmap,kt.displacementmap,kt.fog,{matcap:{value:null}}]),vertexShader:Re.meshmatcap_vert,fragmentShader:Re.meshmatcap_frag},points:{uniforms:$n([kt.points,kt.fog]),vertexShader:Re.points_vert,fragmentShader:Re.points_frag},dashed:{uniforms:$n([kt.common,kt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Re.linedashed_vert,fragmentShader:Re.linedashed_frag},depth:{uniforms:$n([kt.common,kt.displacementmap]),vertexShader:Re.depth_vert,fragmentShader:Re.depth_frag},normal:{uniforms:$n([kt.common,kt.bumpmap,kt.normalmap,kt.displacementmap,{opacity:{value:1}}]),vertexShader:Re.meshnormal_vert,fragmentShader:Re.meshnormal_frag},sprite:{uniforms:$n([kt.sprite,kt.fog]),vertexShader:Re.sprite_vert,fragmentShader:Re.sprite_frag},background:{uniforms:{uvTransform:{value:new Ae},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Re.background_vert,fragmentShader:Re.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ae}},vertexShader:Re.backgroundCube_vert,fragmentShader:Re.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Re.cube_vert,fragmentShader:Re.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Re.equirect_vert,fragmentShader:Re.equirect_frag},distanceRGBA:{uniforms:$n([kt.common,kt.displacementmap,{referencePosition:{value:new ft},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Re.distanceRGBA_vert,fragmentShader:Re.distanceRGBA_frag},shadow:{uniforms:$n([kt.lights,kt.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:Re.shadow_vert,fragmentShader:Re.shadow_frag}};ha.physical={uniforms:$n([ha.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ae},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ae},clearcoatNormalScale:{value:new an(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ae},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ae},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ae},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ae},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ae},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ae},transmissionSamplerSize:{value:new an},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ae},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ae},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ae},anisotropyVector:{value:new an},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ae}}]),vertexShader:Re.meshphysical_vert,fragmentShader:Re.meshphysical_frag};const pu={r:0,b:0,g:0},Jr=new Va,Ab=new _n;function Rb(o,n,a,s,c,f,h){const d=new ke(0);let m=f===!0?0:1,_,g,p=null,x=0,M=null;function T(P){let O=P.isScene===!0?P.background:null;return O&&O.isTexture&&(O=(P.backgroundBlurriness>0?a:n).get(O)),O}function R(P){let O=!1;const N=T(P);N===null?y(d,m):N&&N.isColor&&(y(N,1),O=!0);const et=o.xr.getEnvironmentBlendMode();et==="additive"?s.buffers.color.setClear(0,0,0,1,h):et==="alpha-blend"&&s.buffers.color.setClear(0,0,0,0,h),(o.autoClear||O)&&(s.buffers.depth.setTest(!0),s.buffers.depth.setMask(!0),s.buffers.color.setMask(!0),o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil))}function S(P,O){const N=T(O);N&&(N.isCubeTexture||N.mapping===Nu)?(g===void 0&&(g=new Ba(new Ul(1,1,1),new Ki({name:"BackgroundCubeMaterial",uniforms:yo(ha.backgroundCube.uniforms),vertexShader:ha.backgroundCube.vertexShader,fragmentShader:ha.backgroundCube.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1})),g.geometry.deleteAttribute("normal"),g.geometry.deleteAttribute("uv"),g.onBeforeRender=function(et,V,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(g.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),c.update(g)),Jr.copy(O.backgroundRotation),Jr.x*=-1,Jr.y*=-1,Jr.z*=-1,N.isCubeTexture&&N.isRenderTargetTexture===!1&&(Jr.y*=-1,Jr.z*=-1),g.material.uniforms.envMap.value=N,g.material.uniforms.flipEnvMap.value=N.isCubeTexture&&N.isRenderTargetTexture===!1?-1:1,g.material.uniforms.backgroundBlurriness.value=O.backgroundBlurriness,g.material.uniforms.backgroundIntensity.value=O.backgroundIntensity,g.material.uniforms.backgroundRotation.value.setFromMatrix4(Ab.makeRotationFromEuler(Jr)),g.material.toneMapped=Ve.getTransfer(N.colorSpace)!==en,(p!==N||x!==N.version||M!==o.toneMapping)&&(g.material.needsUpdate=!0,p=N,x=N.version,M=o.toneMapping),g.layers.enableAll(),P.unshift(g,g.geometry,g.material,0,0,null)):N&&N.isTexture&&(_===void 0&&(_=new Ba(new Ou(2,2),new Ki({name:"BackgroundMaterial",uniforms:yo(ha.background.uniforms),vertexShader:ha.background.vertexShader,fragmentShader:ha.background.fragmentShader,side:Ar,depthTest:!1,depthWrite:!1,fog:!1})),_.geometry.deleteAttribute("normal"),Object.defineProperty(_.material,"map",{get:function(){return this.uniforms.t2D.value}}),c.update(_)),_.material.uniforms.t2D.value=N,_.material.uniforms.backgroundIntensity.value=O.backgroundIntensity,_.material.toneMapped=Ve.getTransfer(N.colorSpace)!==en,N.matrixAutoUpdate===!0&&N.updateMatrix(),_.material.uniforms.uvTransform.value.copy(N.matrix),(p!==N||x!==N.version||M!==o.toneMapping)&&(_.material.needsUpdate=!0,p=N,x=N.version,M=o.toneMapping),_.layers.enableAll(),P.unshift(_,_.geometry,_.material,0,0,null))}function y(P,O){P.getRGB(pu,Dx(o)),s.buffers.color.setClear(pu.r,pu.g,pu.b,O,h)}return{getClearColor:function(){return d},setClearColor:function(P,O=1){d.set(P),m=O,y(d,m)},getClearAlpha:function(){return m},setClearAlpha:function(P){m=P,y(d,m)},render:R,addToRenderList:S}}function Cb(o,n){const a=o.getParameter(o.MAX_VERTEX_ATTRIBS),s={},c=x(null);let f=c,h=!1;function d(C,B,at,ot,ht){let gt=!1;const X=p(ot,at,B);f!==X&&(f=X,_(f.object)),gt=M(C,ot,at,ht),gt&&T(C,ot,at,ht),ht!==null&&n.update(ht,o.ELEMENT_ARRAY_BUFFER),(gt||h)&&(h=!1,N(C,B,at,ot),ht!==null&&o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,n.get(ht).buffer))}function m(){return o.createVertexArray()}function _(C){return o.bindVertexArray(C)}function g(C){return o.deleteVertexArray(C)}function p(C,B,at){const ot=at.wireframe===!0;let ht=s[C.id];ht===void 0&&(ht={},s[C.id]=ht);let gt=ht[B.id];gt===void 0&&(gt={},ht[B.id]=gt);let X=gt[ot];return X===void 0&&(X=x(m()),gt[ot]=X),X}function x(C){const B=[],at=[],ot=[];for(let ht=0;ht<a;ht++)B[ht]=0,at[ht]=0,ot[ht]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:at,attributeDivisors:ot,object:C,attributes:{},index:null}}function M(C,B,at,ot){const ht=f.attributes,gt=B.attributes;let X=0;const rt=at.getAttributes();for(const Z in rt)if(rt[Z].location>=0){const bt=ht[Z];let Vt=gt[Z];if(Vt===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(Vt=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(Vt=C.instanceColor)),bt===void 0||bt.attribute!==Vt||Vt&&bt.data!==Vt.data)return!0;X++}return f.attributesNum!==X||f.index!==ot}function T(C,B,at,ot){const ht={},gt=B.attributes;let X=0;const rt=at.getAttributes();for(const Z in rt)if(rt[Z].location>=0){let bt=gt[Z];bt===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(bt=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(bt=C.instanceColor));const Vt={};Vt.attribute=bt,bt&&bt.data&&(Vt.data=bt.data),ht[Z]=Vt,X++}f.attributes=ht,f.attributesNum=X,f.index=ot}function R(){const C=f.newAttributes;for(let B=0,at=C.length;B<at;B++)C[B]=0}function S(C){y(C,0)}function y(C,B){const at=f.newAttributes,ot=f.enabledAttributes,ht=f.attributeDivisors;at[C]=1,ot[C]===0&&(o.enableVertexAttribArray(C),ot[C]=1),ht[C]!==B&&(o.vertexAttribDivisor(C,B),ht[C]=B)}function P(){const C=f.newAttributes,B=f.enabledAttributes;for(let at=0,ot=B.length;at<ot;at++)B[at]!==C[at]&&(o.disableVertexAttribArray(at),B[at]=0)}function O(C,B,at,ot,ht,gt,X){X===!0?o.vertexAttribIPointer(C,B,at,ht,gt):o.vertexAttribPointer(C,B,at,ot,ht,gt)}function N(C,B,at,ot){R();const ht=ot.attributes,gt=at.getAttributes(),X=B.defaultAttributeValues;for(const rt in gt){const Z=gt[rt];if(Z.location>=0){let St=ht[rt];if(St===void 0&&(rt==="instanceMatrix"&&C.instanceMatrix&&(St=C.instanceMatrix),rt==="instanceColor"&&C.instanceColor&&(St=C.instanceColor)),St!==void 0){const bt=St.normalized,Vt=St.itemSize,ce=n.get(St);if(ce===void 0)continue;const pt=ce.buffer,A=ce.type,k=ce.bytesPerElement,H=A===o.INT||A===o.UNSIGNED_INT||St.gpuType===Op;if(St.isInterleavedBufferAttribute){const W=St.data,mt=W.stride,_t=St.offset;if(W.isInstancedInterleavedBuffer){for(let At=0;At<Z.locationSize;At++)y(Z.location+At,W.meshPerAttribute);C.isInstancedMesh!==!0&&ot._maxInstanceCount===void 0&&(ot._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let At=0;At<Z.locationSize;At++)S(Z.location+At);o.bindBuffer(o.ARRAY_BUFFER,pt);for(let At=0;At<Z.locationSize;At++)O(Z.location+At,Vt/Z.locationSize,A,bt,mt*k,(_t+Vt/Z.locationSize*At)*k,H)}else{if(St.isInstancedBufferAttribute){for(let W=0;W<Z.locationSize;W++)y(Z.location+W,St.meshPerAttribute);C.isInstancedMesh!==!0&&ot._maxInstanceCount===void 0&&(ot._maxInstanceCount=St.meshPerAttribute*St.count)}else for(let W=0;W<Z.locationSize;W++)S(Z.location+W);o.bindBuffer(o.ARRAY_BUFFER,pt);for(let W=0;W<Z.locationSize;W++)O(Z.location+W,Vt/Z.locationSize,A,bt,Vt*k,Vt/Z.locationSize*W*k,H)}}else if(X!==void 0){const bt=X[rt];if(bt!==void 0)switch(bt.length){case 2:o.vertexAttrib2fv(Z.location,bt);break;case 3:o.vertexAttrib3fv(Z.location,bt);break;case 4:o.vertexAttrib4fv(Z.location,bt);break;default:o.vertexAttrib1fv(Z.location,bt)}}}}P()}function et(){q();for(const C in s){const B=s[C];for(const at in B){const ot=B[at];for(const ht in ot)g(ot[ht].object),delete ot[ht];delete B[at]}delete s[C]}}function V(C){if(s[C.id]===void 0)return;const B=s[C.id];for(const at in B){const ot=B[at];for(const ht in ot)g(ot[ht].object),delete ot[ht];delete B[at]}delete s[C.id]}function I(C){for(const B in s){const at=s[B];if(at[C.id]===void 0)continue;const ot=at[C.id];for(const ht in ot)g(ot[ht].object),delete ot[ht];delete at[C.id]}}function q(){U(),h=!0,f!==c&&(f=c,_(f.object))}function U(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:d,reset:q,resetDefaultState:U,dispose:et,releaseStatesOfGeometry:V,releaseStatesOfProgram:I,initAttributes:R,enableAttribute:S,disableUnusedAttributes:P}}function wb(o,n,a){let s;function c(_){s=_}function f(_,g){o.drawArrays(s,_,g),a.update(g,s,1)}function h(_,g,p){p!==0&&(o.drawArraysInstanced(s,_,g,p),a.update(g,s,p))}function d(_,g,p){if(p===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,_,0,g,0,p);let M=0;for(let T=0;T<p;T++)M+=g[T];a.update(M,s,1)}function m(_,g,p,x){if(p===0)return;const M=n.get("WEBGL_multi_draw");if(M===null)for(let T=0;T<_.length;T++)h(_[T],g[T],x[T]);else{M.multiDrawArraysInstancedWEBGL(s,_,0,g,0,x,0,p);let T=0;for(let R=0;R<p;R++)T+=g[R]*x[R];a.update(T,s,1)}}this.setMode=c,this.render=f,this.renderInstances=h,this.renderMultiDraw=d,this.renderMultiDrawInstances=m}function Db(o,n,a,s){let c;function f(){if(c!==void 0)return c;if(n.has("EXT_texture_filter_anisotropic")===!0){const I=n.get("EXT_texture_filter_anisotropic");c=o.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else c=0;return c}function h(I){return!(I!==Yi&&s.convert(I)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(I){const q=I===Al&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(I!==Ga&&s.convert(I)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Pa&&!q)}function m(I){if(I==="highp"){if(o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.HIGH_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.MEDIUM_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let _=a.precision!==void 0?a.precision:"highp";const g=m(_);g!==_&&(console.warn("THREE.WebGLRenderer:",_,"not supported, using",g,"instead."),_=g);const p=a.logarithmicDepthBuffer===!0,x=a.reverseDepthBuffer===!0&&n.has("EXT_clip_control"),M=o.getParameter(o.MAX_TEXTURE_IMAGE_UNITS),T=o.getParameter(o.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=o.getParameter(o.MAX_TEXTURE_SIZE),S=o.getParameter(o.MAX_CUBE_MAP_TEXTURE_SIZE),y=o.getParameter(o.MAX_VERTEX_ATTRIBS),P=o.getParameter(o.MAX_VERTEX_UNIFORM_VECTORS),O=o.getParameter(o.MAX_VARYING_VECTORS),N=o.getParameter(o.MAX_FRAGMENT_UNIFORM_VECTORS),et=T>0,V=o.getParameter(o.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:f,getMaxPrecision:m,textureFormatReadable:h,textureTypeReadable:d,precision:_,logarithmicDepthBuffer:p,reverseDepthBuffer:x,maxTextures:M,maxVertexTextures:T,maxTextureSize:R,maxCubemapSize:S,maxAttributes:y,maxVertexUniforms:P,maxVaryings:O,maxFragmentUniforms:N,vertexTextures:et,maxSamples:V}}function Ub(o){const n=this;let a=null,s=0,c=!1,f=!1;const h=new ts,d=new Ae,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(p,x){const M=p.length!==0||x||s!==0||c;return c=x,s=p.length,M},this.beginShadows=function(){f=!0,g(null)},this.endShadows=function(){f=!1},this.setGlobalState=function(p,x){a=g(p,x,0)},this.setState=function(p,x,M){const T=p.clippingPlanes,R=p.clipIntersection,S=p.clipShadows,y=o.get(p);if(!c||T===null||T.length===0||f&&!S)f?g(null):_();else{const P=f?0:s,O=P*4;let N=y.clippingState||null;m.value=N,N=g(T,x,O,M);for(let et=0;et!==O;++et)N[et]=a[et];y.clippingState=N,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=P}};function _(){m.value!==a&&(m.value=a,m.needsUpdate=s>0),n.numPlanes=s,n.numIntersection=0}function g(p,x,M,T){const R=p!==null?p.length:0;let S=null;if(R!==0){if(S=m.value,T!==!0||S===null){const y=M+R*4,P=x.matrixWorldInverse;d.getNormalMatrix(P),(S===null||S.length<y)&&(S=new Float32Array(y));for(let O=0,N=M;O!==R;++O,N+=4)h.copy(p[O]).applyMatrix4(P,d),h.normal.toArray(S,N),S[N+3]=h.constant}m.value=S,m.needsUpdate=!0}return n.numPlanes=R,n.numIntersection=0,S}}function Nb(o){let n=new WeakMap;function a(h,d){return d===Jd?h.mapping=go:d===$d&&(h.mapping=vo),h}function s(h){if(h&&h.isTexture){const d=h.mapping;if(d===Jd||d===$d)if(n.has(h)){const m=n.get(h).texture;return a(m,h.mapping)}else{const m=h.image;if(m&&m.height>0){const _=new XE(m.height);return _.fromEquirectangularTexture(o,h),n.set(h,_),h.addEventListener("dispose",c),a(_.texture,h.mapping)}else return null}}return h}function c(h){const d=h.target;d.removeEventListener("dispose",c);const m=n.get(d);m!==void 0&&(n.delete(d),m.dispose())}function f(){n=new WeakMap}return{get:s,dispose:f}}class Lb extends Ux{constructor(n=-1,a=1,s=1,c=-1,f=.1,h=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=n,this.right=a,this.top=s,this.bottom=c,this.near=f,this.far=h,this.updateProjectionMatrix()}copy(n,a){return super.copy(n,a),this.left=n.left,this.right=n.right,this.top=n.top,this.bottom=n.bottom,this.near=n.near,this.far=n.far,this.zoom=n.zoom,this.view=n.view===null?null:Object.assign({},n.view),this}setViewOffset(n,a,s,c,f,h){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=n,this.view.fullHeight=a,this.view.offsetX=s,this.view.offsetY=c,this.view.width=f,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const n=(this.right-this.left)/(2*this.zoom),a=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,c=(this.top+this.bottom)/2;let f=s-n,h=s+n,d=c+a,m=c-a;if(this.view!==null&&this.view.enabled){const _=(this.right-this.left)/this.view.fullWidth/this.zoom,g=(this.top-this.bottom)/this.view.fullHeight/this.zoom;f+=_*this.view.offsetX,h=f+_*this.view.width,d-=g*this.view.offsetY,m=d-g*this.view.height}this.projectionMatrix.makeOrthographic(f,h,d,m,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(n){const a=super.toJSON(n);return a.object.zoom=this.zoom,a.object.left=this.left,a.object.right=this.right,a.object.top=this.top,a.object.bottom=this.bottom,a.object.near=this.near,a.object.far=this.far,this.view!==null&&(a.object.view=Object.assign({},this.view)),a}}const fo=4,C0=[.125,.215,.35,.446,.526,.582],is=20,zd=new Lb,w0=new ke;let Pd=null,Id=0,Bd=0,Fd=!1;const es=(1+Math.sqrt(5))/2,co=1/es,D0=[new ft(-es,co,0),new ft(es,co,0),new ft(-co,0,es),new ft(co,0,es),new ft(0,es,-co),new ft(0,es,co),new ft(-1,1,-1),new ft(1,1,-1),new ft(-1,1,1),new ft(1,1,1)];class U0{constructor(n){this._renderer=n,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(n,a=0,s=.1,c=100){Pd=this._renderer.getRenderTarget(),Id=this._renderer.getActiveCubeFace(),Bd=this._renderer.getActiveMipmapLevel(),Fd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const f=this._allocateTargets();return f.depthBuffer=!0,this._sceneToCubeUV(n,s,c,f),a>0&&this._blur(f,0,0,a),this._applyPMREM(f),this._cleanup(f),f}fromEquirectangular(n,a=null){return this._fromTexture(n,a)}fromCubemap(n,a=null){return this._fromTexture(n,a)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=O0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=L0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(n){this._lodMax=Math.floor(Math.log2(n)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let n=0;n<this._lodPlanes.length;n++)this._lodPlanes[n].dispose()}_cleanup(n){this._renderer.setRenderTarget(Pd,Id,Bd),this._renderer.xr.enabled=Fd,n.scissorTest=!1,mu(n,0,0,n.width,n.height)}_fromTexture(n,a){n.mapping===go||n.mapping===vo?this._setSize(n.image.length===0?16:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4),Pd=this._renderer.getRenderTarget(),Id=this._renderer.getActiveCubeFace(),Bd=this._renderer.getActiveMipmapLevel(),Fd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const s=a||this._allocateTargets();return this._textureToCubeUV(n,s),this._applyPMREM(s),this._cleanup(s),s}_allocateTargets(){const n=3*Math.max(this._cubeSize,112),a=4*this._cubeSize,s={magFilter:da,minFilter:da,generateMipmaps:!1,type:Al,format:Yi,colorSpace:So,depthBuffer:!1},c=N0(n,a,s);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==n||this._pingPongRenderTarget.height!==a){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=N0(n,a,s);const{_lodMax:f}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ob(f)),this._blurMaterial=zb(f,n,a)}return c}_compileMaterial(n){const a=new Ba(this._lodPlanes[0],n);this._renderer.compile(a,zd)}_sceneToCubeUV(n,a,s,c){const d=new Oi(90,1,a,s),m=[1,-1,1,1,1,1],_=[1,1,1,-1,-1,-1],g=this._renderer,p=g.autoClear,x=g.toneMapping;g.getClearColor(w0),g.toneMapping=br,g.autoClear=!1;const M=new Rx({name:"PMREM.Background",side:ui,depthWrite:!1,depthTest:!1}),T=new Ba(new Ul,M);let R=!1;const S=n.background;S?S.isColor&&(M.color.copy(S),n.background=null,R=!0):(M.color.copy(w0),R=!0);for(let y=0;y<6;y++){const P=y%3;P===0?(d.up.set(0,m[y],0),d.lookAt(_[y],0,0)):P===1?(d.up.set(0,0,m[y]),d.lookAt(0,_[y],0)):(d.up.set(0,m[y],0),d.lookAt(0,0,_[y]));const O=this._cubeSize;mu(c,P*O,y>2?O:0,O,O),g.setRenderTarget(c),R&&g.render(T,d),g.render(n,d)}T.geometry.dispose(),T.material.dispose(),g.toneMapping=x,g.autoClear=p,n.background=S}_textureToCubeUV(n,a){const s=this._renderer,c=n.mapping===go||n.mapping===vo;c?(this._cubemapMaterial===null&&(this._cubemapMaterial=O0()),this._cubemapMaterial.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=L0());const f=c?this._cubemapMaterial:this._equirectMaterial,h=new Ba(this._lodPlanes[0],f),d=f.uniforms;d.envMap.value=n;const m=this._cubeSize;mu(a,0,0,3*m,2*m),s.setRenderTarget(a),s.render(h,zd)}_applyPMREM(n){const a=this._renderer,s=a.autoClear;a.autoClear=!1;const c=this._lodPlanes.length;for(let f=1;f<c;f++){const h=Math.sqrt(this._sigmas[f]*this._sigmas[f]-this._sigmas[f-1]*this._sigmas[f-1]),d=D0[(c-f-1)%D0.length];this._blur(n,f-1,f,h,d)}a.autoClear=s}_blur(n,a,s,c,f){const h=this._pingPongRenderTarget;this._halfBlur(n,h,a,s,c,"latitudinal",f),this._halfBlur(h,n,s,s,c,"longitudinal",f)}_halfBlur(n,a,s,c,f,h,d){const m=this._renderer,_=this._blurMaterial;h!=="latitudinal"&&h!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const g=3,p=new Ba(this._lodPlanes[c],_),x=_.uniforms,M=this._sizeLods[s]-1,T=isFinite(f)?Math.PI/(2*M):2*Math.PI/(2*is-1),R=f/T,S=isFinite(f)?1+Math.floor(g*R):is;S>is&&console.warn(`sigmaRadians, ${f}, is too large and will clip, as it requested ${S} samples when the maximum is set to ${is}`);const y=[];let P=0;for(let I=0;I<is;++I){const q=I/R,U=Math.exp(-q*q/2);y.push(U),I===0?P+=U:I<S&&(P+=2*U)}for(let I=0;I<y.length;I++)y[I]=y[I]/P;x.envMap.value=n.texture,x.samples.value=S,x.weights.value=y,x.latitudinal.value=h==="latitudinal",d&&(x.poleAxis.value=d);const{_lodMax:O}=this;x.dTheta.value=T,x.mipInt.value=O-s;const N=this._sizeLods[c],et=3*N*(c>O-fo?c-O+fo:0),V=4*(this._cubeSize-N);mu(a,et,V,3*N,2*N),m.setRenderTarget(a),m.render(p,zd)}}function Ob(o){const n=[],a=[],s=[];let c=o;const f=o-fo+1+C0.length;for(let h=0;h<f;h++){const d=Math.pow(2,c);a.push(d);let m=1/d;h>o-fo?m=C0[h-o+fo-1]:h===0&&(m=0),s.push(m);const _=1/(d-2),g=-_,p=1+_,x=[g,g,p,g,p,p,g,g,p,p,g,p],M=6,T=6,R=3,S=2,y=1,P=new Float32Array(R*T*M),O=new Float32Array(S*T*M),N=new Float32Array(y*T*M);for(let V=0;V<M;V++){const I=V%3*2/3-1,q=V>2?0:-1,U=[I,q,0,I+2/3,q,0,I+2/3,q+1,0,I,q,0,I+2/3,q+1,0,I,q+1,0];P.set(U,R*T*V),O.set(x,S*T*V);const C=[V,V,V,V,V,V];N.set(C,y*T*V)}const et=new Qi;et.setAttribute("position",new Sn(P,R)),et.setAttribute("uv",new Sn(O,S)),et.setAttribute("faceIndex",new Sn(N,y)),n.push(et),c>fo&&c--}return{lodPlanes:n,sizeLods:a,sigmas:s}}function N0(o,n,a){const s=new ls(o,n,a);return s.texture.mapping=Nu,s.texture.name="PMREM.cubeUv",s.scissorTest=!0,s}function mu(o,n,a,s,c){o.viewport.set(n,a,s,c),o.scissor.set(n,a,s,c)}function zb(o,n,a){const s=new Float32Array(is),c=new ft(0,1,0);return new Ki({name:"SphericalGaussianBlur",defines:{n:is,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/a,CUBEUV_MAX_MIP:`${o}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:s},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:c}},vertexShader:Gp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Tr,depthTest:!1,depthWrite:!1})}function L0(){return new Ki({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Gp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Tr,depthTest:!1,depthWrite:!1})}function O0(){return new Ki({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Gp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Tr,depthTest:!1,depthWrite:!1})}function Gp(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Pb(o){let n=new WeakMap,a=null;function s(d){if(d&&d.isTexture){const m=d.mapping,_=m===Jd||m===$d,g=m===go||m===vo;if(_||g){let p=n.get(d);const x=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==x)return a===null&&(a=new U0(o)),p=_?a.fromEquirectangular(d,p):a.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,n.set(d,p),p.texture;if(p!==void 0)return p.texture;{const M=d.image;return _&&M&&M.height>0||g&&M&&c(M)?(a===null&&(a=new U0(o)),p=_?a.fromEquirectangular(d):a.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,n.set(d,p),d.addEventListener("dispose",f),p.texture):null}}}return d}function c(d){let m=0;const _=6;for(let g=0;g<_;g++)d[g]!==void 0&&m++;return m===_}function f(d){const m=d.target;m.removeEventListener("dispose",f);const _=n.get(m);_!==void 0&&(n.delete(m),_.dispose())}function h(){n=new WeakMap,a!==null&&(a.dispose(),a=null)}return{get:s,dispose:h}}function Ib(o){const n={};function a(s){if(n[s]!==void 0)return n[s];let c;switch(s){case"WEBGL_depth_texture":c=o.getExtension("WEBGL_depth_texture")||o.getExtension("MOZ_WEBGL_depth_texture")||o.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":c=o.getExtension("EXT_texture_filter_anisotropic")||o.getExtension("MOZ_EXT_texture_filter_anisotropic")||o.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":c=o.getExtension("WEBGL_compressed_texture_s3tc")||o.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||o.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":c=o.getExtension("WEBGL_compressed_texture_pvrtc")||o.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:c=o.getExtension(s)}return n[s]=c,c}return{has:function(s){return a(s)!==null},init:function(){a("EXT_color_buffer_float"),a("WEBGL_clip_cull_distance"),a("OES_texture_float_linear"),a("EXT_color_buffer_half_float"),a("WEBGL_multisampled_render_to_texture"),a("WEBGL_render_shared_exponent")},get:function(s){const c=a(s);return c===null&&El("THREE.WebGLRenderer: "+s+" extension not supported."),c}}}function Bb(o,n,a,s){const c={},f=new WeakMap;function h(p){const x=p.target;x.index!==null&&n.remove(x.index);for(const T in x.attributes)n.remove(x.attributes[T]);for(const T in x.morphAttributes){const R=x.morphAttributes[T];for(let S=0,y=R.length;S<y;S++)n.remove(R[S])}x.removeEventListener("dispose",h),delete c[x.id];const M=f.get(x);M&&(n.remove(M),f.delete(x)),s.releaseStatesOfGeometry(x),x.isInstancedBufferGeometry===!0&&delete x._maxInstanceCount,a.memory.geometries--}function d(p,x){return c[x.id]===!0||(x.addEventListener("dispose",h),c[x.id]=!0,a.memory.geometries++),x}function m(p){const x=p.attributes;for(const T in x)n.update(x[T],o.ARRAY_BUFFER);const M=p.morphAttributes;for(const T in M){const R=M[T];for(let S=0,y=R.length;S<y;S++)n.update(R[S],o.ARRAY_BUFFER)}}function _(p){const x=[],M=p.index,T=p.attributes.position;let R=0;if(M!==null){const P=M.array;R=M.version;for(let O=0,N=P.length;O<N;O+=3){const et=P[O+0],V=P[O+1],I=P[O+2];x.push(et,V,V,I,I,et)}}else if(T!==void 0){const P=T.array;R=T.version;for(let O=0,N=P.length/3-1;O<N;O+=3){const et=O+0,V=O+1,I=O+2;x.push(et,V,V,I,I,et)}}else return;const S=new(Mx(x)?wx:Cx)(x,1);S.version=R;const y=f.get(p);y&&n.remove(y),f.set(p,S)}function g(p){const x=f.get(p);if(x){const M=p.index;M!==null&&x.version<M.version&&_(p)}else _(p);return f.get(p)}return{get:d,update:m,getWireframeAttribute:g}}function Fb(o,n,a){let s;function c(x){s=x}let f,h;function d(x){f=x.type,h=x.bytesPerElement}function m(x,M){o.drawElements(s,M,f,x*h),a.update(M,s,1)}function _(x,M,T){T!==0&&(o.drawElementsInstanced(s,M,f,x*h,T),a.update(M,s,T))}function g(x,M,T){if(T===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,M,0,f,x,0,T);let S=0;for(let y=0;y<T;y++)S+=M[y];a.update(S,s,1)}function p(x,M,T,R){if(T===0)return;const S=n.get("WEBGL_multi_draw");if(S===null)for(let y=0;y<x.length;y++)_(x[y]/h,M[y],R[y]);else{S.multiDrawElementsInstancedWEBGL(s,M,0,f,x,0,R,0,T);let y=0;for(let P=0;P<T;P++)y+=M[P]*R[P];a.update(y,s,1)}}this.setMode=c,this.setIndex=d,this.render=m,this.renderInstances=_,this.renderMultiDraw=g,this.renderMultiDrawInstances=p}function Hb(o){const n={geometries:0,textures:0},a={frame:0,calls:0,triangles:0,points:0,lines:0};function s(f,h,d){switch(a.calls++,h){case o.TRIANGLES:a.triangles+=d*(f/3);break;case o.LINES:a.lines+=d*(f/2);break;case o.LINE_STRIP:a.lines+=d*(f-1);break;case o.LINE_LOOP:a.lines+=d*f;break;case o.POINTS:a.points+=d*f;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",h);break}}function c(){a.calls=0,a.triangles=0,a.points=0,a.lines=0}return{memory:n,render:a,programs:null,autoReset:!0,reset:c,update:s}}function Gb(o,n,a){const s=new WeakMap,c=new Mn;function f(h,d,m){const _=h.morphTargetInfluences,g=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,p=g!==void 0?g.length:0;let x=s.get(d);if(x===void 0||x.count!==p){let U=function(){I.dispose(),s.delete(d),d.removeEventListener("dispose",U)};x!==void 0&&x.texture.dispose();const M=d.morphAttributes.position!==void 0,T=d.morphAttributes.normal!==void 0,R=d.morphAttributes.color!==void 0,S=d.morphAttributes.position||[],y=d.morphAttributes.normal||[],P=d.morphAttributes.color||[];let O=0;M===!0&&(O=1),T===!0&&(O=2),R===!0&&(O=3);let N=d.attributes.position.count*O,et=1;N>n.maxTextureSize&&(et=Math.ceil(N/n.maxTextureSize),N=n.maxTextureSize);const V=new Float32Array(N*et*4*p),I=new Tx(V,N,et,p);I.type=Pa,I.needsUpdate=!0;const q=O*4;for(let C=0;C<p;C++){const B=S[C],at=y[C],ot=P[C],ht=N*et*4*C;for(let gt=0;gt<B.count;gt++){const X=gt*q;M===!0&&(c.fromBufferAttribute(B,gt),V[ht+X+0]=c.x,V[ht+X+1]=c.y,V[ht+X+2]=c.z,V[ht+X+3]=0),T===!0&&(c.fromBufferAttribute(at,gt),V[ht+X+4]=c.x,V[ht+X+5]=c.y,V[ht+X+6]=c.z,V[ht+X+7]=0),R===!0&&(c.fromBufferAttribute(ot,gt),V[ht+X+8]=c.x,V[ht+X+9]=c.y,V[ht+X+10]=c.z,V[ht+X+11]=ot.itemSize===4?c.w:1)}}x={count:p,texture:I,size:new an(N,et)},s.set(d,x),d.addEventListener("dispose",U)}if(h.isInstancedMesh===!0&&h.morphTexture!==null)m.getUniforms().setValue(o,"morphTexture",h.morphTexture,a);else{let M=0;for(let R=0;R<_.length;R++)M+=_[R];const T=d.morphTargetsRelative?1:1-M;m.getUniforms().setValue(o,"morphTargetBaseInfluence",T),m.getUniforms().setValue(o,"morphTargetInfluences",_)}m.getUniforms().setValue(o,"morphTargetsTexture",x.texture,a),m.getUniforms().setValue(o,"morphTargetsTextureSize",x.size)}return{update:f}}function Vb(o,n,a,s){let c=new WeakMap;function f(m){const _=s.render.frame,g=m.geometry,p=n.get(m,g);if(c.get(p)!==_&&(n.update(p),c.set(p,_)),m.isInstancedMesh&&(m.hasEventListener("dispose",d)===!1&&m.addEventListener("dispose",d),c.get(m)!==_&&(a.update(m.instanceMatrix,o.ARRAY_BUFFER),m.instanceColor!==null&&a.update(m.instanceColor,o.ARRAY_BUFFER),c.set(m,_))),m.isSkinnedMesh){const x=m.skeleton;c.get(x)!==_&&(x.update(),c.set(x,_))}return p}function h(){c=new WeakMap}function d(m){const _=m.target;_.removeEventListener("dispose",d),a.remove(_.instanceMatrix),_.instanceColor!==null&&a.remove(_.instanceColor)}return{update:f,dispose:h}}class zx extends fi{constructor(n,a,s,c,f,h,d,m,_,g=ho){if(g!==ho&&g!==xo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");s===void 0&&g===ho&&(s=os),s===void 0&&g===xo&&(s=_o),super(null,c,f,h,d,m,g,s,_),this.isDepthTexture=!0,this.image={width:n,height:a},this.magFilter=d!==void 0?d:Zi,this.minFilter=m!==void 0?m:Zi,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(n){return super.copy(n),this.compareFunction=n.compareFunction,this}toJSON(n){const a=super.toJSON(n);return this.compareFunction!==null&&(a.compareFunction=this.compareFunction),a}}const Px=new fi,z0=new zx(1,1),Ix=new Tx,Bx=new RE,Fx=new Nx,P0=[],I0=[],B0=new Float32Array(16),F0=new Float32Array(9),H0=new Float32Array(4);function To(o,n,a){const s=o[0];if(s<=0||s>0)return o;const c=n*a;let f=P0[c];if(f===void 0&&(f=new Float32Array(c),P0[c]=f),n!==0){s.toArray(f,0);for(let h=1,d=0;h!==n;++h)d+=a,o[h].toArray(f,d)}return f}function Un(o,n){if(o.length!==n.length)return!1;for(let a=0,s=o.length;a<s;a++)if(o[a]!==n[a])return!1;return!0}function Nn(o,n){for(let a=0,s=n.length;a<s;a++)o[a]=n[a]}function zu(o,n){let a=I0[n];a===void 0&&(a=new Int32Array(n),I0[n]=a);for(let s=0;s!==n;++s)a[s]=o.allocateTextureUnit();return a}function Xb(o,n){const a=this.cache;a[0]!==n&&(o.uniform1f(this.addr,n),a[0]=n)}function kb(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y)&&(o.uniform2f(this.addr,n.x,n.y),a[0]=n.x,a[1]=n.y);else{if(Un(a,n))return;o.uniform2fv(this.addr,n),Nn(a,n)}}function jb(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y||a[2]!==n.z)&&(o.uniform3f(this.addr,n.x,n.y,n.z),a[0]=n.x,a[1]=n.y,a[2]=n.z);else if(n.r!==void 0)(a[0]!==n.r||a[1]!==n.g||a[2]!==n.b)&&(o.uniform3f(this.addr,n.r,n.g,n.b),a[0]=n.r,a[1]=n.g,a[2]=n.b);else{if(Un(a,n))return;o.uniform3fv(this.addr,n),Nn(a,n)}}function qb(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y||a[2]!==n.z||a[3]!==n.w)&&(o.uniform4f(this.addr,n.x,n.y,n.z,n.w),a[0]=n.x,a[1]=n.y,a[2]=n.z,a[3]=n.w);else{if(Un(a,n))return;o.uniform4fv(this.addr,n),Nn(a,n)}}function Yb(o,n){const a=this.cache,s=n.elements;if(s===void 0){if(Un(a,n))return;o.uniformMatrix2fv(this.addr,!1,n),Nn(a,n)}else{if(Un(a,s))return;H0.set(s),o.uniformMatrix2fv(this.addr,!1,H0),Nn(a,s)}}function Wb(o,n){const a=this.cache,s=n.elements;if(s===void 0){if(Un(a,n))return;o.uniformMatrix3fv(this.addr,!1,n),Nn(a,n)}else{if(Un(a,s))return;F0.set(s),o.uniformMatrix3fv(this.addr,!1,F0),Nn(a,s)}}function Zb(o,n){const a=this.cache,s=n.elements;if(s===void 0){if(Un(a,n))return;o.uniformMatrix4fv(this.addr,!1,n),Nn(a,n)}else{if(Un(a,s))return;B0.set(s),o.uniformMatrix4fv(this.addr,!1,B0),Nn(a,s)}}function Kb(o,n){const a=this.cache;a[0]!==n&&(o.uniform1i(this.addr,n),a[0]=n)}function Qb(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y)&&(o.uniform2i(this.addr,n.x,n.y),a[0]=n.x,a[1]=n.y);else{if(Un(a,n))return;o.uniform2iv(this.addr,n),Nn(a,n)}}function Jb(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y||a[2]!==n.z)&&(o.uniform3i(this.addr,n.x,n.y,n.z),a[0]=n.x,a[1]=n.y,a[2]=n.z);else{if(Un(a,n))return;o.uniform3iv(this.addr,n),Nn(a,n)}}function $b(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y||a[2]!==n.z||a[3]!==n.w)&&(o.uniform4i(this.addr,n.x,n.y,n.z,n.w),a[0]=n.x,a[1]=n.y,a[2]=n.z,a[3]=n.w);else{if(Un(a,n))return;o.uniform4iv(this.addr,n),Nn(a,n)}}function tA(o,n){const a=this.cache;a[0]!==n&&(o.uniform1ui(this.addr,n),a[0]=n)}function eA(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y)&&(o.uniform2ui(this.addr,n.x,n.y),a[0]=n.x,a[1]=n.y);else{if(Un(a,n))return;o.uniform2uiv(this.addr,n),Nn(a,n)}}function nA(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y||a[2]!==n.z)&&(o.uniform3ui(this.addr,n.x,n.y,n.z),a[0]=n.x,a[1]=n.y,a[2]=n.z);else{if(Un(a,n))return;o.uniform3uiv(this.addr,n),Nn(a,n)}}function iA(o,n){const a=this.cache;if(n.x!==void 0)(a[0]!==n.x||a[1]!==n.y||a[2]!==n.z||a[3]!==n.w)&&(o.uniform4ui(this.addr,n.x,n.y,n.z,n.w),a[0]=n.x,a[1]=n.y,a[2]=n.z,a[3]=n.w);else{if(Un(a,n))return;o.uniform4uiv(this.addr,n),Nn(a,n)}}function aA(o,n,a){const s=this.cache,c=a.allocateTextureUnit();s[0]!==c&&(o.uniform1i(this.addr,c),s[0]=c);let f;this.type===o.SAMPLER_2D_SHADOW?(z0.compareFunction=Sx,f=z0):f=Px,a.setTexture2D(n||f,c)}function rA(o,n,a){const s=this.cache,c=a.allocateTextureUnit();s[0]!==c&&(o.uniform1i(this.addr,c),s[0]=c),a.setTexture3D(n||Bx,c)}function sA(o,n,a){const s=this.cache,c=a.allocateTextureUnit();s[0]!==c&&(o.uniform1i(this.addr,c),s[0]=c),a.setTextureCube(n||Fx,c)}function oA(o,n,a){const s=this.cache,c=a.allocateTextureUnit();s[0]!==c&&(o.uniform1i(this.addr,c),s[0]=c),a.setTexture2DArray(n||Ix,c)}function lA(o){switch(o){case 5126:return Xb;case 35664:return kb;case 35665:return jb;case 35666:return qb;case 35674:return Yb;case 35675:return Wb;case 35676:return Zb;case 5124:case 35670:return Kb;case 35667:case 35671:return Qb;case 35668:case 35672:return Jb;case 35669:case 35673:return $b;case 5125:return tA;case 36294:return eA;case 36295:return nA;case 36296:return iA;case 35678:case 36198:case 36298:case 36306:case 35682:return aA;case 35679:case 36299:case 36307:return rA;case 35680:case 36300:case 36308:case 36293:return sA;case 36289:case 36303:case 36311:case 36292:return oA}}function cA(o,n){o.uniform1fv(this.addr,n)}function uA(o,n){const a=To(n,this.size,2);o.uniform2fv(this.addr,a)}function fA(o,n){const a=To(n,this.size,3);o.uniform3fv(this.addr,a)}function hA(o,n){const a=To(n,this.size,4);o.uniform4fv(this.addr,a)}function dA(o,n){const a=To(n,this.size,4);o.uniformMatrix2fv(this.addr,!1,a)}function pA(o,n){const a=To(n,this.size,9);o.uniformMatrix3fv(this.addr,!1,a)}function mA(o,n){const a=To(n,this.size,16);o.uniformMatrix4fv(this.addr,!1,a)}function gA(o,n){o.uniform1iv(this.addr,n)}function vA(o,n){o.uniform2iv(this.addr,n)}function _A(o,n){o.uniform3iv(this.addr,n)}function xA(o,n){o.uniform4iv(this.addr,n)}function yA(o,n){o.uniform1uiv(this.addr,n)}function SA(o,n){o.uniform2uiv(this.addr,n)}function MA(o,n){o.uniform3uiv(this.addr,n)}function EA(o,n){o.uniform4uiv(this.addr,n)}function TA(o,n,a){const s=this.cache,c=n.length,f=zu(a,c);Un(s,f)||(o.uniform1iv(this.addr,f),Nn(s,f));for(let h=0;h!==c;++h)a.setTexture2D(n[h]||Px,f[h])}function bA(o,n,a){const s=this.cache,c=n.length,f=zu(a,c);Un(s,f)||(o.uniform1iv(this.addr,f),Nn(s,f));for(let h=0;h!==c;++h)a.setTexture3D(n[h]||Bx,f[h])}function AA(o,n,a){const s=this.cache,c=n.length,f=zu(a,c);Un(s,f)||(o.uniform1iv(this.addr,f),Nn(s,f));for(let h=0;h!==c;++h)a.setTextureCube(n[h]||Fx,f[h])}function RA(o,n,a){const s=this.cache,c=n.length,f=zu(a,c);Un(s,f)||(o.uniform1iv(this.addr,f),Nn(s,f));for(let h=0;h!==c;++h)a.setTexture2DArray(n[h]||Ix,f[h])}function CA(o){switch(o){case 5126:return cA;case 35664:return uA;case 35665:return fA;case 35666:return hA;case 35674:return dA;case 35675:return pA;case 35676:return mA;case 5124:case 35670:return gA;case 35667:case 35671:return vA;case 35668:case 35672:return _A;case 35669:case 35673:return xA;case 5125:return yA;case 36294:return SA;case 36295:return MA;case 36296:return EA;case 35678:case 36198:case 36298:case 36306:case 35682:return TA;case 35679:case 36299:case 36307:return bA;case 35680:case 36300:case 36308:case 36293:return AA;case 36289:case 36303:case 36311:case 36292:return RA}}class wA{constructor(n,a,s){this.id=n,this.addr=s,this.cache=[],this.type=a.type,this.setValue=lA(a.type)}}class DA{constructor(n,a,s){this.id=n,this.addr=s,this.cache=[],this.type=a.type,this.size=a.size,this.setValue=CA(a.type)}}class UA{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,a,s){const c=this.seq;for(let f=0,h=c.length;f!==h;++f){const d=c[f];d.setValue(n,a[d.id],s)}}}const Hd=/(\w+)(\])?(\[|\.)?/g;function G0(o,n){o.seq.push(n),o.map[n.id]=n}function NA(o,n,a){const s=o.name,c=s.length;for(Hd.lastIndex=0;;){const f=Hd.exec(s),h=Hd.lastIndex;let d=f[1];const m=f[2]==="]",_=f[3];if(m&&(d=d|0),_===void 0||_==="["&&h+2===c){G0(a,_===void 0?new wA(d,o,n):new DA(d,o,n));break}else{let p=a.map[d];p===void 0&&(p=new UA(d),G0(a,p)),a=p}}}class Ru{constructor(n,a){this.seq=[],this.map={};const s=n.getProgramParameter(a,n.ACTIVE_UNIFORMS);for(let c=0;c<s;++c){const f=n.getActiveUniform(a,c),h=n.getUniformLocation(a,f.name);NA(f,h,this)}}setValue(n,a,s,c){const f=this.map[a];f!==void 0&&f.setValue(n,s,c)}setOptional(n,a,s){const c=a[s];c!==void 0&&this.setValue(n,s,c)}static upload(n,a,s,c){for(let f=0,h=a.length;f!==h;++f){const d=a[f],m=s[d.id];m.needsUpdate!==!1&&d.setValue(n,m.value,c)}}static seqWithValue(n,a){const s=[];for(let c=0,f=n.length;c!==f;++c){const h=n[c];h.id in a&&s.push(h)}return s}}function V0(o,n,a){const s=o.createShader(n);return o.shaderSource(s,a),o.compileShader(s),s}const LA=37297;let OA=0;function zA(o,n){const a=o.split(`
`),s=[],c=Math.max(n-6,0),f=Math.min(n+6,a.length);for(let h=c;h<f;h++){const d=h+1;s.push(`${d===n?">":" "} ${d}: ${a[h]}`)}return s.join(`
`)}const X0=new Ae;function PA(o){Ve._getMatrix(X0,Ve.workingColorSpace,o);const n=`mat3( ${X0.elements.map(a=>a.toFixed(4))} )`;switch(Ve.getTransfer(o)){case Lu:return[n,"LinearTransferOETF"];case en:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",o),[n,"LinearTransferOETF"]}}function k0(o,n,a){const s=o.getShaderParameter(n,o.COMPILE_STATUS),c=o.getShaderInfoLog(n).trim();if(s&&c==="")return"";const f=/ERROR: 0:(\d+)/.exec(c);if(f){const h=parseInt(f[1]);return a.toUpperCase()+`

`+c+`

`+zA(o.getShaderSource(n),h)}else return c}function IA(o,n){const a=PA(n);return[`vec4 ${o}( vec4 value ) {`,`	return ${a[1]}( vec4( value.rgb * ${a[0]}, value.a ) );`,"}"].join(`
`)}function BA(o,n){let a;switch(n){case $M:a="Linear";break;case tE:a="Reinhard";break;case eE:a="Cineon";break;case nE:a="ACESFilmic";break;case aE:a="AgX";break;case rE:a="Neutral";break;case iE:a="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",n),a="Linear"}return"vec3 "+o+"( vec3 color ) { return "+a+"ToneMapping( color ); }"}const gu=new ft;function FA(){Ve.getLuminanceCoefficients(gu);const o=gu.x.toFixed(4),n=gu.y.toFixed(4),a=gu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${o}, ${n}, ${a} );`,"	return dot( weights, rgb );","}"].join(`
`)}function HA(o){return[o.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",o.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Tl).join(`
`)}function GA(o){const n=[];for(const a in o){const s=o[a];s!==!1&&n.push("#define "+a+" "+s)}return n.join(`
`)}function VA(o,n){const a={},s=o.getProgramParameter(n,o.ACTIVE_ATTRIBUTES);for(let c=0;c<s;c++){const f=o.getActiveAttrib(n,c),h=f.name;let d=1;f.type===o.FLOAT_MAT2&&(d=2),f.type===o.FLOAT_MAT3&&(d=3),f.type===o.FLOAT_MAT4&&(d=4),a[h]={type:f.type,location:o.getAttribLocation(n,h),locationSize:d}}return a}function Tl(o){return o!==""}function j0(o,n){const a=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return o.replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,a).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows)}function q0(o,n){return o.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}const XA=/^[ \t]*#include +<([\w\d./]+)>/gm;function wp(o){return o.replace(XA,jA)}const kA=new Map;function jA(o,n){let a=Re[n];if(a===void 0){const s=kA.get(n);if(s!==void 0)a=Re[s],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',n,s);else throw new Error("Can not resolve #include <"+n+">")}return wp(a)}const qA=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Y0(o){return o.replace(qA,YA)}function YA(o,n,a,s){let c="";for(let f=parseInt(n);f<parseInt(a);f++)c+=s.replace(/\[\s*i\s*\]/g,"[ "+f+" ]").replace(/UNROLLED_LOOP_INDEX/g,f);return c}function W0(o){let n=`precision ${o.precision} float;
	precision ${o.precision} int;
	precision ${o.precision} sampler2D;
	precision ${o.precision} samplerCube;
	precision ${o.precision} sampler3D;
	precision ${o.precision} sampler2DArray;
	precision ${o.precision} sampler2DShadow;
	precision ${o.precision} samplerCubeShadow;
	precision ${o.precision} sampler2DArrayShadow;
	precision ${o.precision} isampler2D;
	precision ${o.precision} isampler3D;
	precision ${o.precision} isamplerCube;
	precision ${o.precision} isampler2DArray;
	precision ${o.precision} usampler2D;
	precision ${o.precision} usampler3D;
	precision ${o.precision} usamplerCube;
	precision ${o.precision} usampler2DArray;
	`;return o.precision==="highp"?n+=`
#define HIGH_PRECISION`:o.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:o.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}function WA(o){let n="SHADOWMAP_TYPE_BASIC";return o.shadowMapType===lx?n="SHADOWMAP_TYPE_PCF":o.shadowMapType===NM?n="SHADOWMAP_TYPE_PCF_SOFT":o.shadowMapType===Oa&&(n="SHADOWMAP_TYPE_VSM"),n}function ZA(o){let n="ENVMAP_TYPE_CUBE";if(o.envMap)switch(o.envMapMode){case go:case vo:n="ENVMAP_TYPE_CUBE";break;case Nu:n="ENVMAP_TYPE_CUBE_UV";break}return n}function KA(o){let n="ENVMAP_MODE_REFLECTION";return o.envMap&&o.envMapMode===vo&&(n="ENVMAP_MODE_REFRACTION"),n}function QA(o){let n="ENVMAP_BLENDING_NONE";if(o.envMap)switch(o.combine){case cx:n="ENVMAP_BLENDING_MULTIPLY";break;case QM:n="ENVMAP_BLENDING_MIX";break;case JM:n="ENVMAP_BLENDING_ADD";break}return n}function JA(o){const n=o.envMapCubeUVHeight;if(n===null)return null;const a=Math.log2(n)-2,s=1/n;return{texelWidth:1/(3*Math.max(Math.pow(2,a),112)),texelHeight:s,maxMip:a}}function $A(o,n,a,s){const c=o.getContext(),f=a.defines;let h=a.vertexShader,d=a.fragmentShader;const m=WA(a),_=ZA(a),g=KA(a),p=QA(a),x=JA(a),M=HA(a),T=GA(f),R=c.createProgram();let S,y,P=a.glslVersion?"#version "+a.glslVersion+`
`:"";a.isRawShaderMaterial?(S=["#define SHADER_TYPE "+a.shaderType,"#define SHADER_NAME "+a.shaderName,T].filter(Tl).join(`
`),S.length>0&&(S+=`
`),y=["#define SHADER_TYPE "+a.shaderType,"#define SHADER_NAME "+a.shaderName,T].filter(Tl).join(`
`),y.length>0&&(y+=`
`)):(S=[W0(a),"#define SHADER_TYPE "+a.shaderType,"#define SHADER_NAME "+a.shaderName,T,a.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",a.batching?"#define USE_BATCHING":"",a.batchingColor?"#define USE_BATCHING_COLOR":"",a.instancing?"#define USE_INSTANCING":"",a.instancingColor?"#define USE_INSTANCING_COLOR":"",a.instancingMorph?"#define USE_INSTANCING_MORPH":"",a.useFog&&a.fog?"#define USE_FOG":"",a.useFog&&a.fogExp2?"#define FOG_EXP2":"",a.map?"#define USE_MAP":"",a.envMap?"#define USE_ENVMAP":"",a.envMap?"#define "+g:"",a.lightMap?"#define USE_LIGHTMAP":"",a.aoMap?"#define USE_AOMAP":"",a.bumpMap?"#define USE_BUMPMAP":"",a.normalMap?"#define USE_NORMALMAP":"",a.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",a.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",a.displacementMap?"#define USE_DISPLACEMENTMAP":"",a.emissiveMap?"#define USE_EMISSIVEMAP":"",a.anisotropy?"#define USE_ANISOTROPY":"",a.anisotropyMap?"#define USE_ANISOTROPYMAP":"",a.clearcoatMap?"#define USE_CLEARCOATMAP":"",a.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",a.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",a.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",a.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",a.specularMap?"#define USE_SPECULARMAP":"",a.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",a.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",a.roughnessMap?"#define USE_ROUGHNESSMAP":"",a.metalnessMap?"#define USE_METALNESSMAP":"",a.alphaMap?"#define USE_ALPHAMAP":"",a.alphaHash?"#define USE_ALPHAHASH":"",a.transmission?"#define USE_TRANSMISSION":"",a.transmissionMap?"#define USE_TRANSMISSIONMAP":"",a.thicknessMap?"#define USE_THICKNESSMAP":"",a.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",a.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",a.mapUv?"#define MAP_UV "+a.mapUv:"",a.alphaMapUv?"#define ALPHAMAP_UV "+a.alphaMapUv:"",a.lightMapUv?"#define LIGHTMAP_UV "+a.lightMapUv:"",a.aoMapUv?"#define AOMAP_UV "+a.aoMapUv:"",a.emissiveMapUv?"#define EMISSIVEMAP_UV "+a.emissiveMapUv:"",a.bumpMapUv?"#define BUMPMAP_UV "+a.bumpMapUv:"",a.normalMapUv?"#define NORMALMAP_UV "+a.normalMapUv:"",a.displacementMapUv?"#define DISPLACEMENTMAP_UV "+a.displacementMapUv:"",a.metalnessMapUv?"#define METALNESSMAP_UV "+a.metalnessMapUv:"",a.roughnessMapUv?"#define ROUGHNESSMAP_UV "+a.roughnessMapUv:"",a.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+a.anisotropyMapUv:"",a.clearcoatMapUv?"#define CLEARCOATMAP_UV "+a.clearcoatMapUv:"",a.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+a.clearcoatNormalMapUv:"",a.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+a.clearcoatRoughnessMapUv:"",a.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+a.iridescenceMapUv:"",a.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+a.iridescenceThicknessMapUv:"",a.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+a.sheenColorMapUv:"",a.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+a.sheenRoughnessMapUv:"",a.specularMapUv?"#define SPECULARMAP_UV "+a.specularMapUv:"",a.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+a.specularColorMapUv:"",a.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+a.specularIntensityMapUv:"",a.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+a.transmissionMapUv:"",a.thicknessMapUv?"#define THICKNESSMAP_UV "+a.thicknessMapUv:"",a.vertexTangents&&a.flatShading===!1?"#define USE_TANGENT":"",a.vertexColors?"#define USE_COLOR":"",a.vertexAlphas?"#define USE_COLOR_ALPHA":"",a.vertexUv1s?"#define USE_UV1":"",a.vertexUv2s?"#define USE_UV2":"",a.vertexUv3s?"#define USE_UV3":"",a.pointsUvs?"#define USE_POINTS_UV":"",a.flatShading?"#define FLAT_SHADED":"",a.skinning?"#define USE_SKINNING":"",a.morphTargets?"#define USE_MORPHTARGETS":"",a.morphNormals&&a.flatShading===!1?"#define USE_MORPHNORMALS":"",a.morphColors?"#define USE_MORPHCOLORS":"",a.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+a.morphTextureStride:"",a.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+a.morphTargetsCount:"",a.doubleSided?"#define DOUBLE_SIDED":"",a.flipSided?"#define FLIP_SIDED":"",a.shadowMapEnabled?"#define USE_SHADOWMAP":"",a.shadowMapEnabled?"#define "+m:"",a.sizeAttenuation?"#define USE_SIZEATTENUATION":"",a.numLightProbes>0?"#define USE_LIGHT_PROBES":"",a.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",a.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Tl).join(`
`),y=[W0(a),"#define SHADER_TYPE "+a.shaderType,"#define SHADER_NAME "+a.shaderName,T,a.useFog&&a.fog?"#define USE_FOG":"",a.useFog&&a.fogExp2?"#define FOG_EXP2":"",a.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",a.map?"#define USE_MAP":"",a.matcap?"#define USE_MATCAP":"",a.envMap?"#define USE_ENVMAP":"",a.envMap?"#define "+_:"",a.envMap?"#define "+g:"",a.envMap?"#define "+p:"",x?"#define CUBEUV_TEXEL_WIDTH "+x.texelWidth:"",x?"#define CUBEUV_TEXEL_HEIGHT "+x.texelHeight:"",x?"#define CUBEUV_MAX_MIP "+x.maxMip+".0":"",a.lightMap?"#define USE_LIGHTMAP":"",a.aoMap?"#define USE_AOMAP":"",a.bumpMap?"#define USE_BUMPMAP":"",a.normalMap?"#define USE_NORMALMAP":"",a.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",a.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",a.emissiveMap?"#define USE_EMISSIVEMAP":"",a.anisotropy?"#define USE_ANISOTROPY":"",a.anisotropyMap?"#define USE_ANISOTROPYMAP":"",a.clearcoat?"#define USE_CLEARCOAT":"",a.clearcoatMap?"#define USE_CLEARCOATMAP":"",a.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",a.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",a.dispersion?"#define USE_DISPERSION":"",a.iridescence?"#define USE_IRIDESCENCE":"",a.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",a.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",a.specularMap?"#define USE_SPECULARMAP":"",a.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",a.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",a.roughnessMap?"#define USE_ROUGHNESSMAP":"",a.metalnessMap?"#define USE_METALNESSMAP":"",a.alphaMap?"#define USE_ALPHAMAP":"",a.alphaTest?"#define USE_ALPHATEST":"",a.alphaHash?"#define USE_ALPHAHASH":"",a.sheen?"#define USE_SHEEN":"",a.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",a.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",a.transmission?"#define USE_TRANSMISSION":"",a.transmissionMap?"#define USE_TRANSMISSIONMAP":"",a.thicknessMap?"#define USE_THICKNESSMAP":"",a.vertexTangents&&a.flatShading===!1?"#define USE_TANGENT":"",a.vertexColors||a.instancingColor||a.batchingColor?"#define USE_COLOR":"",a.vertexAlphas?"#define USE_COLOR_ALPHA":"",a.vertexUv1s?"#define USE_UV1":"",a.vertexUv2s?"#define USE_UV2":"",a.vertexUv3s?"#define USE_UV3":"",a.pointsUvs?"#define USE_POINTS_UV":"",a.gradientMap?"#define USE_GRADIENTMAP":"",a.flatShading?"#define FLAT_SHADED":"",a.doubleSided?"#define DOUBLE_SIDED":"",a.flipSided?"#define FLIP_SIDED":"",a.shadowMapEnabled?"#define USE_SHADOWMAP":"",a.shadowMapEnabled?"#define "+m:"",a.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",a.numLightProbes>0?"#define USE_LIGHT_PROBES":"",a.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",a.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",a.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",a.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",a.toneMapping!==br?"#define TONE_MAPPING":"",a.toneMapping!==br?Re.tonemapping_pars_fragment:"",a.toneMapping!==br?BA("toneMapping",a.toneMapping):"",a.dithering?"#define DITHERING":"",a.opaque?"#define OPAQUE":"",Re.colorspace_pars_fragment,IA("linearToOutputTexel",a.outputColorSpace),FA(),a.useDepthPacking?"#define DEPTH_PACKING "+a.depthPacking:"",`
`].filter(Tl).join(`
`)),h=wp(h),h=j0(h,a),h=q0(h,a),d=wp(d),d=j0(d,a),d=q0(d,a),h=Y0(h),d=Y0(d),a.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,S=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+S,y=["#define varying in",a.glslVersion===o0?"":"layout(location = 0) out highp vec4 pc_fragColor;",a.glslVersion===o0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);const O=P+S+h,N=P+y+d,et=V0(c,c.VERTEX_SHADER,O),V=V0(c,c.FRAGMENT_SHADER,N);c.attachShader(R,et),c.attachShader(R,V),a.index0AttributeName!==void 0?c.bindAttribLocation(R,0,a.index0AttributeName):a.morphTargets===!0&&c.bindAttribLocation(R,0,"position"),c.linkProgram(R);function I(B){if(o.debug.checkShaderErrors){const at=c.getProgramInfoLog(R).trim(),ot=c.getShaderInfoLog(et).trim(),ht=c.getShaderInfoLog(V).trim();let gt=!0,X=!0;if(c.getProgramParameter(R,c.LINK_STATUS)===!1)if(gt=!1,typeof o.debug.onShaderError=="function")o.debug.onShaderError(c,R,et,V);else{const rt=k0(c,et,"vertex"),Z=k0(c,V,"fragment");console.error("THREE.WebGLProgram: Shader Error "+c.getError()+" - VALIDATE_STATUS "+c.getProgramParameter(R,c.VALIDATE_STATUS)+`

Material Name: `+B.name+`
Material Type: `+B.type+`

Program Info Log: `+at+`
`+rt+`
`+Z)}else at!==""?console.warn("THREE.WebGLProgram: Program Info Log:",at):(ot===""||ht==="")&&(X=!1);X&&(B.diagnostics={runnable:gt,programLog:at,vertexShader:{log:ot,prefix:S},fragmentShader:{log:ht,prefix:y}})}c.deleteShader(et),c.deleteShader(V),q=new Ru(c,R),U=VA(c,R)}let q;this.getUniforms=function(){return q===void 0&&I(this),q};let U;this.getAttributes=function(){return U===void 0&&I(this),U};let C=a.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=c.getProgramParameter(R,LA)),C},this.destroy=function(){s.releaseStatesOfProgram(this),c.deleteProgram(R),this.program=void 0},this.type=a.shaderType,this.name=a.shaderName,this.id=OA++,this.cacheKey=n,this.usedTimes=1,this.program=R,this.vertexShader=et,this.fragmentShader=V,this}let tR=0;class eR{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n){const a=n.vertexShader,s=n.fragmentShader,c=this._getShaderStage(a),f=this._getShaderStage(s),h=this._getShaderCacheForMaterial(n);return h.has(c)===!1&&(h.add(c),c.usedTimes++),h.has(f)===!1&&(h.add(f),f.usedTimes++),this}remove(n){const a=this.materialCache.get(n);for(const s of a)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(n),this}getVertexShaderID(n){return this._getShaderStage(n.vertexShader).id}getFragmentShaderID(n){return this._getShaderStage(n.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){const a=this.materialCache;let s=a.get(n);return s===void 0&&(s=new Set,a.set(n,s)),s}_getShaderStage(n){const a=this.shaderCache;let s=a.get(n);return s===void 0&&(s=new nR(n),a.set(n,s)),s}}class nR{constructor(n){this.id=tR++,this.code=n,this.usedTimes=0}}function iR(o,n,a,s,c,f,h){const d=new bx,m=new eR,_=new Set,g=[],p=c.logarithmicDepthBuffer,x=c.vertexTextures;let M=c.precision;const T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function R(U){return _.add(U),U===0?"uv":`uv${U}`}function S(U,C,B,at,ot){const ht=at.fog,gt=ot.geometry,X=U.isMeshStandardMaterial?at.environment:null,rt=(U.isMeshStandardMaterial?a:n).get(U.envMap||X),Z=rt&&rt.mapping===Nu?rt.image.height:null,St=T[U.type];U.precision!==null&&(M=c.getMaxPrecision(U.precision),M!==U.precision&&console.warn("THREE.WebGLProgram.getParameters:",U.precision,"not supported, using",M,"instead."));const bt=gt.morphAttributes.position||gt.morphAttributes.normal||gt.morphAttributes.color,Vt=bt!==void 0?bt.length:0;let ce=0;gt.morphAttributes.position!==void 0&&(ce=1),gt.morphAttributes.normal!==void 0&&(ce=2),gt.morphAttributes.color!==void 0&&(ce=3);let pt,A,k,H;if(St){const De=ha[St];pt=De.vertexShader,A=De.fragmentShader}else pt=U.vertexShader,A=U.fragmentShader,m.update(U),k=m.getVertexShaderID(U),H=m.getFragmentShaderID(U);const W=o.getRenderTarget(),mt=o.state.buffers.depth.getReversed(),_t=ot.isInstancedMesh===!0,At=ot.isBatchedMesh===!0,Ct=!!U.map,Ut=!!U.matcap,re=!!rt,j=!!U.aoMap,Fe=!!U.lightMap,le=!!U.bumpMap,ae=!!U.normalMap,Ft=!!U.displacementMap,Se=!!U.emissiveMap,ne=!!U.metalnessMap,L=!!U.roughnessMap,b=U.anisotropy>0,it=U.clearcoat>0,xt=U.dispersion>0,Rt=U.iridescence>0,Et=U.sheen>0,qt=U.transmission>0,vt=b&&!!U.anisotropyMap,Ht=it&&!!U.clearcoatMap,Te=it&&!!U.clearcoatNormalMap,Nt=it&&!!U.clearcoatRoughnessMap,Yt=Rt&&!!U.iridescenceMap,te=Rt&&!!U.iridescenceThicknessMap,ue=Et&&!!U.sheenColorMap,jt=Et&&!!U.sheenRoughnessMap,ye=!!U.specularMap,xe=!!U.specularColorMap,we=!!U.specularIntensityMap,F=qt&&!!U.transmissionMap,wt=qt&&!!U.thicknessMap,ut=!!U.gradientMap,Tt=!!U.alphaMap,zt=U.alphaTest>0,Gt=!!U.alphaHash,fe=!!U.extensions;let $e=br;U.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&($e=o.toneMapping);const cn={shaderID:St,shaderType:U.type,shaderName:U.name,vertexShader:pt,fragmentShader:A,defines:U.defines,customVertexShaderID:k,customFragmentShaderID:H,isRawShaderMaterial:U.isRawShaderMaterial===!0,glslVersion:U.glslVersion,precision:M,batching:At,batchingColor:At&&ot._colorsTexture!==null,instancing:_t,instancingColor:_t&&ot.instanceColor!==null,instancingMorph:_t&&ot.morphTexture!==null,supportsVertexTextures:x,outputColorSpace:W===null?o.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:So,alphaToCoverage:!!U.alphaToCoverage,map:Ct,matcap:Ut,envMap:re,envMapMode:re&&rt.mapping,envMapCubeUVHeight:Z,aoMap:j,lightMap:Fe,bumpMap:le,normalMap:ae,displacementMap:x&&Ft,emissiveMap:Se,normalMapObjectSpace:ae&&U.normalMapType===uE,normalMapTangentSpace:ae&&U.normalMapType===cE,metalnessMap:ne,roughnessMap:L,anisotropy:b,anisotropyMap:vt,clearcoat:it,clearcoatMap:Ht,clearcoatNormalMap:Te,clearcoatRoughnessMap:Nt,dispersion:xt,iridescence:Rt,iridescenceMap:Yt,iridescenceThicknessMap:te,sheen:Et,sheenColorMap:ue,sheenRoughnessMap:jt,specularMap:ye,specularColorMap:xe,specularIntensityMap:we,transmission:qt,transmissionMap:F,thicknessMap:wt,gradientMap:ut,opaque:U.transparent===!1&&U.blending===ss&&U.alphaToCoverage===!1,alphaMap:Tt,alphaTest:zt,alphaHash:Gt,combine:U.combine,mapUv:Ct&&R(U.map.channel),aoMapUv:j&&R(U.aoMap.channel),lightMapUv:Fe&&R(U.lightMap.channel),bumpMapUv:le&&R(U.bumpMap.channel),normalMapUv:ae&&R(U.normalMap.channel),displacementMapUv:Ft&&R(U.displacementMap.channel),emissiveMapUv:Se&&R(U.emissiveMap.channel),metalnessMapUv:ne&&R(U.metalnessMap.channel),roughnessMapUv:L&&R(U.roughnessMap.channel),anisotropyMapUv:vt&&R(U.anisotropyMap.channel),clearcoatMapUv:Ht&&R(U.clearcoatMap.channel),clearcoatNormalMapUv:Te&&R(U.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Nt&&R(U.clearcoatRoughnessMap.channel),iridescenceMapUv:Yt&&R(U.iridescenceMap.channel),iridescenceThicknessMapUv:te&&R(U.iridescenceThicknessMap.channel),sheenColorMapUv:ue&&R(U.sheenColorMap.channel),sheenRoughnessMapUv:jt&&R(U.sheenRoughnessMap.channel),specularMapUv:ye&&R(U.specularMap.channel),specularColorMapUv:xe&&R(U.specularColorMap.channel),specularIntensityMapUv:we&&R(U.specularIntensityMap.channel),transmissionMapUv:F&&R(U.transmissionMap.channel),thicknessMapUv:wt&&R(U.thicknessMap.channel),alphaMapUv:Tt&&R(U.alphaMap.channel),vertexTangents:!!gt.attributes.tangent&&(ae||b),vertexColors:U.vertexColors,vertexAlphas:U.vertexColors===!0&&!!gt.attributes.color&&gt.attributes.color.itemSize===4,pointsUvs:ot.isPoints===!0&&!!gt.attributes.uv&&(Ct||Tt),fog:!!ht,useFog:U.fog===!0,fogExp2:!!ht&&ht.isFogExp2,flatShading:U.flatShading===!0,sizeAttenuation:U.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:mt,skinning:ot.isSkinnedMesh===!0,morphTargets:gt.morphAttributes.position!==void 0,morphNormals:gt.morphAttributes.normal!==void 0,morphColors:gt.morphAttributes.color!==void 0,morphTargetsCount:Vt,morphTextureStride:ce,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:h.numPlanes,numClipIntersection:h.numIntersection,dithering:U.dithering,shadowMapEnabled:o.shadowMap.enabled&&B.length>0,shadowMapType:o.shadowMap.type,toneMapping:$e,decodeVideoTexture:Ct&&U.map.isVideoTexture===!0&&Ve.getTransfer(U.map.colorSpace)===en,decodeVideoTextureEmissive:Se&&U.emissiveMap.isVideoTexture===!0&&Ve.getTransfer(U.emissiveMap.colorSpace)===en,premultipliedAlpha:U.premultipliedAlpha,doubleSided:U.side===za,flipSided:U.side===ui,useDepthPacking:U.depthPacking>=0,depthPacking:U.depthPacking||0,index0AttributeName:U.index0AttributeName,extensionClipCullDistance:fe&&U.extensions.clipCullDistance===!0&&s.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(fe&&U.extensions.multiDraw===!0||At)&&s.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:s.has("KHR_parallel_shader_compile"),customProgramCacheKey:U.customProgramCacheKey()};return cn.vertexUv1s=_.has(1),cn.vertexUv2s=_.has(2),cn.vertexUv3s=_.has(3),_.clear(),cn}function y(U){const C=[];if(U.shaderID?C.push(U.shaderID):(C.push(U.customVertexShaderID),C.push(U.customFragmentShaderID)),U.defines!==void 0)for(const B in U.defines)C.push(B),C.push(U.defines[B]);return U.isRawShaderMaterial===!1&&(P(C,U),O(C,U),C.push(o.outputColorSpace)),C.push(U.customProgramCacheKey),C.join()}function P(U,C){U.push(C.precision),U.push(C.outputColorSpace),U.push(C.envMapMode),U.push(C.envMapCubeUVHeight),U.push(C.mapUv),U.push(C.alphaMapUv),U.push(C.lightMapUv),U.push(C.aoMapUv),U.push(C.bumpMapUv),U.push(C.normalMapUv),U.push(C.displacementMapUv),U.push(C.emissiveMapUv),U.push(C.metalnessMapUv),U.push(C.roughnessMapUv),U.push(C.anisotropyMapUv),U.push(C.clearcoatMapUv),U.push(C.clearcoatNormalMapUv),U.push(C.clearcoatRoughnessMapUv),U.push(C.iridescenceMapUv),U.push(C.iridescenceThicknessMapUv),U.push(C.sheenColorMapUv),U.push(C.sheenRoughnessMapUv),U.push(C.specularMapUv),U.push(C.specularColorMapUv),U.push(C.specularIntensityMapUv),U.push(C.transmissionMapUv),U.push(C.thicknessMapUv),U.push(C.combine),U.push(C.fogExp2),U.push(C.sizeAttenuation),U.push(C.morphTargetsCount),U.push(C.morphAttributeCount),U.push(C.numDirLights),U.push(C.numPointLights),U.push(C.numSpotLights),U.push(C.numSpotLightMaps),U.push(C.numHemiLights),U.push(C.numRectAreaLights),U.push(C.numDirLightShadows),U.push(C.numPointLightShadows),U.push(C.numSpotLightShadows),U.push(C.numSpotLightShadowsWithMaps),U.push(C.numLightProbes),U.push(C.shadowMapType),U.push(C.toneMapping),U.push(C.numClippingPlanes),U.push(C.numClipIntersection),U.push(C.depthPacking)}function O(U,C){d.disableAll(),C.supportsVertexTextures&&d.enable(0),C.instancing&&d.enable(1),C.instancingColor&&d.enable(2),C.instancingMorph&&d.enable(3),C.matcap&&d.enable(4),C.envMap&&d.enable(5),C.normalMapObjectSpace&&d.enable(6),C.normalMapTangentSpace&&d.enable(7),C.clearcoat&&d.enable(8),C.iridescence&&d.enable(9),C.alphaTest&&d.enable(10),C.vertexColors&&d.enable(11),C.vertexAlphas&&d.enable(12),C.vertexUv1s&&d.enable(13),C.vertexUv2s&&d.enable(14),C.vertexUv3s&&d.enable(15),C.vertexTangents&&d.enable(16),C.anisotropy&&d.enable(17),C.alphaHash&&d.enable(18),C.batching&&d.enable(19),C.dispersion&&d.enable(20),C.batchingColor&&d.enable(21),U.push(d.mask),d.disableAll(),C.fog&&d.enable(0),C.useFog&&d.enable(1),C.flatShading&&d.enable(2),C.logarithmicDepthBuffer&&d.enable(3),C.reverseDepthBuffer&&d.enable(4),C.skinning&&d.enable(5),C.morphTargets&&d.enable(6),C.morphNormals&&d.enable(7),C.morphColors&&d.enable(8),C.premultipliedAlpha&&d.enable(9),C.shadowMapEnabled&&d.enable(10),C.doubleSided&&d.enable(11),C.flipSided&&d.enable(12),C.useDepthPacking&&d.enable(13),C.dithering&&d.enable(14),C.transmission&&d.enable(15),C.sheen&&d.enable(16),C.opaque&&d.enable(17),C.pointsUvs&&d.enable(18),C.decodeVideoTexture&&d.enable(19),C.decodeVideoTextureEmissive&&d.enable(20),C.alphaToCoverage&&d.enable(21),U.push(d.mask)}function N(U){const C=T[U.type];let B;if(C){const at=ha[C];B=FE.clone(at.uniforms)}else B=U.uniforms;return B}function et(U,C){let B;for(let at=0,ot=g.length;at<ot;at++){const ht=g[at];if(ht.cacheKey===C){B=ht,++B.usedTimes;break}}return B===void 0&&(B=new $A(o,C,U,f),g.push(B)),B}function V(U){if(--U.usedTimes===0){const C=g.indexOf(U);g[C]=g[g.length-1],g.pop(),U.destroy()}}function I(U){m.remove(U)}function q(){m.dispose()}return{getParameters:S,getProgramCacheKey:y,getUniforms:N,acquireProgram:et,releaseProgram:V,releaseShaderCache:I,programs:g,dispose:q}}function aR(){let o=new WeakMap;function n(h){return o.has(h)}function a(h){let d=o.get(h);return d===void 0&&(d={},o.set(h,d)),d}function s(h){o.delete(h)}function c(h,d,m){o.get(h)[d]=m}function f(){o=new WeakMap}return{has:n,get:a,remove:s,update:c,dispose:f}}function rR(o,n){return o.groupOrder!==n.groupOrder?o.groupOrder-n.groupOrder:o.renderOrder!==n.renderOrder?o.renderOrder-n.renderOrder:o.material.id!==n.material.id?o.material.id-n.material.id:o.z!==n.z?o.z-n.z:o.id-n.id}function Z0(o,n){return o.groupOrder!==n.groupOrder?o.groupOrder-n.groupOrder:o.renderOrder!==n.renderOrder?o.renderOrder-n.renderOrder:o.z!==n.z?n.z-o.z:o.id-n.id}function K0(){const o=[];let n=0;const a=[],s=[],c=[];function f(){n=0,a.length=0,s.length=0,c.length=0}function h(p,x,M,T,R,S){let y=o[n];return y===void 0?(y={id:p.id,object:p,geometry:x,material:M,groupOrder:T,renderOrder:p.renderOrder,z:R,group:S},o[n]=y):(y.id=p.id,y.object=p,y.geometry=x,y.material=M,y.groupOrder=T,y.renderOrder=p.renderOrder,y.z=R,y.group=S),n++,y}function d(p,x,M,T,R,S){const y=h(p,x,M,T,R,S);M.transmission>0?s.push(y):M.transparent===!0?c.push(y):a.push(y)}function m(p,x,M,T,R,S){const y=h(p,x,M,T,R,S);M.transmission>0?s.unshift(y):M.transparent===!0?c.unshift(y):a.unshift(y)}function _(p,x){a.length>1&&a.sort(p||rR),s.length>1&&s.sort(x||Z0),c.length>1&&c.sort(x||Z0)}function g(){for(let p=n,x=o.length;p<x;p++){const M=o[p];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:a,transmissive:s,transparent:c,init:f,push:d,unshift:m,finish:g,sort:_}}function sR(){let o=new WeakMap;function n(s,c){const f=o.get(s);let h;return f===void 0?(h=new K0,o.set(s,[h])):c>=f.length?(h=new K0,f.push(h)):h=f[c],h}function a(){o=new WeakMap}return{get:n,dispose:a}}function oR(){const o={};return{get:function(n){if(o[n.id]!==void 0)return o[n.id];let a;switch(n.type){case"DirectionalLight":a={direction:new ft,color:new ke};break;case"SpotLight":a={position:new ft,direction:new ft,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":a={position:new ft,color:new ke,distance:0,decay:0};break;case"HemisphereLight":a={direction:new ft,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":a={color:new ke,position:new ft,halfWidth:new ft,halfHeight:new ft};break}return o[n.id]=a,a}}}function lR(){const o={};return{get:function(n){if(o[n.id]!==void 0)return o[n.id];let a;switch(n.type){case"DirectionalLight":a={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new an};break;case"SpotLight":a={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new an};break;case"PointLight":a={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new an,shadowCameraNear:1,shadowCameraFar:1e3};break}return o[n.id]=a,a}}}let cR=0;function uR(o,n){return(n.castShadow?2:0)-(o.castShadow?2:0)+(n.map?1:0)-(o.map?1:0)}function fR(o){const n=new oR,a=lR(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let _=0;_<9;_++)s.probe.push(new ft);const c=new ft,f=new _n,h=new _n;function d(_){let g=0,p=0,x=0;for(let U=0;U<9;U++)s.probe[U].set(0,0,0);let M=0,T=0,R=0,S=0,y=0,P=0,O=0,N=0,et=0,V=0,I=0;_.sort(uR);for(let U=0,C=_.length;U<C;U++){const B=_[U],at=B.color,ot=B.intensity,ht=B.distance,gt=B.shadow&&B.shadow.map?B.shadow.map.texture:null;if(B.isAmbientLight)g+=at.r*ot,p+=at.g*ot,x+=at.b*ot;else if(B.isLightProbe){for(let X=0;X<9;X++)s.probe[X].addScaledVector(B.sh.coefficients[X],ot);I++}else if(B.isDirectionalLight){const X=n.get(B);if(X.color.copy(B.color).multiplyScalar(B.intensity),B.castShadow){const rt=B.shadow,Z=a.get(B);Z.shadowIntensity=rt.intensity,Z.shadowBias=rt.bias,Z.shadowNormalBias=rt.normalBias,Z.shadowRadius=rt.radius,Z.shadowMapSize=rt.mapSize,s.directionalShadow[M]=Z,s.directionalShadowMap[M]=gt,s.directionalShadowMatrix[M]=B.shadow.matrix,P++}s.directional[M]=X,M++}else if(B.isSpotLight){const X=n.get(B);X.position.setFromMatrixPosition(B.matrixWorld),X.color.copy(at).multiplyScalar(ot),X.distance=ht,X.coneCos=Math.cos(B.angle),X.penumbraCos=Math.cos(B.angle*(1-B.penumbra)),X.decay=B.decay,s.spot[R]=X;const rt=B.shadow;if(B.map&&(s.spotLightMap[et]=B.map,et++,rt.updateMatrices(B),B.castShadow&&V++),s.spotLightMatrix[R]=rt.matrix,B.castShadow){const Z=a.get(B);Z.shadowIntensity=rt.intensity,Z.shadowBias=rt.bias,Z.shadowNormalBias=rt.normalBias,Z.shadowRadius=rt.radius,Z.shadowMapSize=rt.mapSize,s.spotShadow[R]=Z,s.spotShadowMap[R]=gt,N++}R++}else if(B.isRectAreaLight){const X=n.get(B);X.color.copy(at).multiplyScalar(ot),X.halfWidth.set(B.width*.5,0,0),X.halfHeight.set(0,B.height*.5,0),s.rectArea[S]=X,S++}else if(B.isPointLight){const X=n.get(B);if(X.color.copy(B.color).multiplyScalar(B.intensity),X.distance=B.distance,X.decay=B.decay,B.castShadow){const rt=B.shadow,Z=a.get(B);Z.shadowIntensity=rt.intensity,Z.shadowBias=rt.bias,Z.shadowNormalBias=rt.normalBias,Z.shadowRadius=rt.radius,Z.shadowMapSize=rt.mapSize,Z.shadowCameraNear=rt.camera.near,Z.shadowCameraFar=rt.camera.far,s.pointShadow[T]=Z,s.pointShadowMap[T]=gt,s.pointShadowMatrix[T]=B.shadow.matrix,O++}s.point[T]=X,T++}else if(B.isHemisphereLight){const X=n.get(B);X.skyColor.copy(B.color).multiplyScalar(ot),X.groundColor.copy(B.groundColor).multiplyScalar(ot),s.hemi[y]=X,y++}}S>0&&(o.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=kt.LTC_FLOAT_1,s.rectAreaLTC2=kt.LTC_FLOAT_2):(s.rectAreaLTC1=kt.LTC_HALF_1,s.rectAreaLTC2=kt.LTC_HALF_2)),s.ambient[0]=g,s.ambient[1]=p,s.ambient[2]=x;const q=s.hash;(q.directionalLength!==M||q.pointLength!==T||q.spotLength!==R||q.rectAreaLength!==S||q.hemiLength!==y||q.numDirectionalShadows!==P||q.numPointShadows!==O||q.numSpotShadows!==N||q.numSpotMaps!==et||q.numLightProbes!==I)&&(s.directional.length=M,s.spot.length=R,s.rectArea.length=S,s.point.length=T,s.hemi.length=y,s.directionalShadow.length=P,s.directionalShadowMap.length=P,s.pointShadow.length=O,s.pointShadowMap.length=O,s.spotShadow.length=N,s.spotShadowMap.length=N,s.directionalShadowMatrix.length=P,s.pointShadowMatrix.length=O,s.spotLightMatrix.length=N+et-V,s.spotLightMap.length=et,s.numSpotLightShadowsWithMaps=V,s.numLightProbes=I,q.directionalLength=M,q.pointLength=T,q.spotLength=R,q.rectAreaLength=S,q.hemiLength=y,q.numDirectionalShadows=P,q.numPointShadows=O,q.numSpotShadows=N,q.numSpotMaps=et,q.numLightProbes=I,s.version=cR++)}function m(_,g){let p=0,x=0,M=0,T=0,R=0;const S=g.matrixWorldInverse;for(let y=0,P=_.length;y<P;y++){const O=_[y];if(O.isDirectionalLight){const N=s.directional[p];N.direction.setFromMatrixPosition(O.matrixWorld),c.setFromMatrixPosition(O.target.matrixWorld),N.direction.sub(c),N.direction.transformDirection(S),p++}else if(O.isSpotLight){const N=s.spot[M];N.position.setFromMatrixPosition(O.matrixWorld),N.position.applyMatrix4(S),N.direction.setFromMatrixPosition(O.matrixWorld),c.setFromMatrixPosition(O.target.matrixWorld),N.direction.sub(c),N.direction.transformDirection(S),M++}else if(O.isRectAreaLight){const N=s.rectArea[T];N.position.setFromMatrixPosition(O.matrixWorld),N.position.applyMatrix4(S),h.identity(),f.copy(O.matrixWorld),f.premultiply(S),h.extractRotation(f),N.halfWidth.set(O.width*.5,0,0),N.halfHeight.set(0,O.height*.5,0),N.halfWidth.applyMatrix4(h),N.halfHeight.applyMatrix4(h),T++}else if(O.isPointLight){const N=s.point[x];N.position.setFromMatrixPosition(O.matrixWorld),N.position.applyMatrix4(S),x++}else if(O.isHemisphereLight){const N=s.hemi[R];N.direction.setFromMatrixPosition(O.matrixWorld),N.direction.transformDirection(S),R++}}}return{setup:d,setupView:m,state:s}}function Q0(o){const n=new fR(o),a=[],s=[];function c(g){_.camera=g,a.length=0,s.length=0}function f(g){a.push(g)}function h(g){s.push(g)}function d(){n.setup(a)}function m(g){n.setupView(a,g)}const _={lightsArray:a,shadowsArray:s,camera:null,lights:n,transmissionRenderTarget:{}};return{init:c,state:_,setupLights:d,setupLightsView:m,pushLight:f,pushShadow:h}}function hR(o){let n=new WeakMap;function a(c,f=0){const h=n.get(c);let d;return h===void 0?(d=new Q0(o),n.set(c,[d])):f>=h.length?(d=new Q0(o),h.push(d)):d=h[f],d}function s(){n=new WeakMap}return{get:a,dispose:s}}class dR extends Eo{static get type(){return"MeshDepthMaterial"}constructor(n){super(),this.isMeshDepthMaterial=!0,this.depthPacking=oE,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(n)}copy(n){return super.copy(n),this.depthPacking=n.depthPacking,this.map=n.map,this.alphaMap=n.alphaMap,this.displacementMap=n.displacementMap,this.displacementScale=n.displacementScale,this.displacementBias=n.displacementBias,this.wireframe=n.wireframe,this.wireframeLinewidth=n.wireframeLinewidth,this}}class pR extends Eo{static get type(){return"MeshDistanceMaterial"}constructor(n){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(n)}copy(n){return super.copy(n),this.map=n.map,this.alphaMap=n.alphaMap,this.displacementMap=n.displacementMap,this.displacementScale=n.displacementScale,this.displacementBias=n.displacementBias,this}}const mR=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gR=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function vR(o,n,a){let s=new Lx;const c=new an,f=new an,h=new Mn,d=new dR({depthPacking:lE}),m=new pR,_={},g=a.maxTextureSize,p={[Ar]:ui,[ui]:Ar,[za]:za},x=new Ki({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new an},radius:{value:4}},vertexShader:mR,fragmentShader:gR}),M=x.clone();M.defines.HORIZONTAL_PASS=1;const T=new Qi;T.setAttribute("position",new Sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new Ba(T,x),S=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=lx;let y=this.type;this.render=function(V,I,q){if(S.enabled===!1||S.autoUpdate===!1&&S.needsUpdate===!1||V.length===0)return;const U=o.getRenderTarget(),C=o.getActiveCubeFace(),B=o.getActiveMipmapLevel(),at=o.state;at.setBlending(Tr),at.buffers.color.setClear(1,1,1,1),at.buffers.depth.setTest(!0),at.setScissorTest(!1);const ot=y!==Oa&&this.type===Oa,ht=y===Oa&&this.type!==Oa;for(let gt=0,X=V.length;gt<X;gt++){const rt=V[gt],Z=rt.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",rt,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;c.copy(Z.mapSize);const St=Z.getFrameExtents();if(c.multiply(St),f.copy(Z.mapSize),(c.x>g||c.y>g)&&(c.x>g&&(f.x=Math.floor(g/St.x),c.x=f.x*St.x,Z.mapSize.x=f.x),c.y>g&&(f.y=Math.floor(g/St.y),c.y=f.y*St.y,Z.mapSize.y=f.y)),Z.map===null||ot===!0||ht===!0){const Vt=this.type!==Oa?{minFilter:Zi,magFilter:Zi}:{};Z.map!==null&&Z.map.dispose(),Z.map=new ls(c.x,c.y,Vt),Z.map.texture.name=rt.name+".shadowMap",Z.camera.updateProjectionMatrix()}o.setRenderTarget(Z.map),o.clear();const bt=Z.getViewportCount();for(let Vt=0;Vt<bt;Vt++){const ce=Z.getViewport(Vt);h.set(f.x*ce.x,f.y*ce.y,f.x*ce.z,f.y*ce.w),at.viewport(h),Z.updateMatrices(rt,Vt),s=Z.getFrustum(),N(I,q,Z.camera,rt,this.type)}Z.isPointLightShadow!==!0&&this.type===Oa&&P(Z,q),Z.needsUpdate=!1}y=this.type,S.needsUpdate=!1,o.setRenderTarget(U,C,B)};function P(V,I){const q=n.update(R);x.defines.VSM_SAMPLES!==V.blurSamples&&(x.defines.VSM_SAMPLES=V.blurSamples,M.defines.VSM_SAMPLES=V.blurSamples,x.needsUpdate=!0,M.needsUpdate=!0),V.mapPass===null&&(V.mapPass=new ls(c.x,c.y)),x.uniforms.shadow_pass.value=V.map.texture,x.uniforms.resolution.value=V.mapSize,x.uniforms.radius.value=V.radius,o.setRenderTarget(V.mapPass),o.clear(),o.renderBufferDirect(I,null,q,x,R,null),M.uniforms.shadow_pass.value=V.mapPass.texture,M.uniforms.resolution.value=V.mapSize,M.uniforms.radius.value=V.radius,o.setRenderTarget(V.map),o.clear(),o.renderBufferDirect(I,null,q,M,R,null)}function O(V,I,q,U){let C=null;const B=q.isPointLight===!0?V.customDistanceMaterial:V.customDepthMaterial;if(B!==void 0)C=B;else if(C=q.isPointLight===!0?m:d,o.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0){const at=C.uuid,ot=I.uuid;let ht=_[at];ht===void 0&&(ht={},_[at]=ht);let gt=ht[ot];gt===void 0&&(gt=C.clone(),ht[ot]=gt,I.addEventListener("dispose",et)),C=gt}if(C.visible=I.visible,C.wireframe=I.wireframe,U===Oa?C.side=I.shadowSide!==null?I.shadowSide:I.side:C.side=I.shadowSide!==null?I.shadowSide:p[I.side],C.alphaMap=I.alphaMap,C.alphaTest=I.alphaTest,C.map=I.map,C.clipShadows=I.clipShadows,C.clippingPlanes=I.clippingPlanes,C.clipIntersection=I.clipIntersection,C.displacementMap=I.displacementMap,C.displacementScale=I.displacementScale,C.displacementBias=I.displacementBias,C.wireframeLinewidth=I.wireframeLinewidth,C.linewidth=I.linewidth,q.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const at=o.properties.get(C);at.light=q}return C}function N(V,I,q,U,C){if(V.visible===!1)return;if(V.layers.test(I.layers)&&(V.isMesh||V.isLine||V.isPoints)&&(V.castShadow||V.receiveShadow&&C===Oa)&&(!V.frustumCulled||s.intersectsObject(V))){V.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,V.matrixWorld);const ot=n.update(V),ht=V.material;if(Array.isArray(ht)){const gt=ot.groups;for(let X=0,rt=gt.length;X<rt;X++){const Z=gt[X],St=ht[Z.materialIndex];if(St&&St.visible){const bt=O(V,St,U,C);V.onBeforeShadow(o,V,I,q,ot,bt,Z),o.renderBufferDirect(q,null,ot,bt,V,Z),V.onAfterShadow(o,V,I,q,ot,bt,Z)}}}else if(ht.visible){const gt=O(V,ht,U,C);V.onBeforeShadow(o,V,I,q,ot,gt,null),o.renderBufferDirect(q,null,ot,gt,V,null),V.onAfterShadow(o,V,I,q,ot,gt,null)}}const at=V.children;for(let ot=0,ht=at.length;ot<ht;ot++)N(at[ot],I,q,U,C)}function et(V){V.target.removeEventListener("dispose",et);for(const q in _){const U=_[q],C=V.target.uuid;C in U&&(U[C].dispose(),delete U[C])}}}const _R={[jd]:qd,[Yd]:Kd,[Wd]:Qd,[mo]:Zd,[qd]:jd,[Kd]:Yd,[Qd]:Wd,[Zd]:mo};function xR(o,n){function a(){let F=!1;const wt=new Mn;let ut=null;const Tt=new Mn(0,0,0,0);return{setMask:function(zt){ut!==zt&&!F&&(o.colorMask(zt,zt,zt,zt),ut=zt)},setLocked:function(zt){F=zt},setClear:function(zt,Gt,fe,$e,cn){cn===!0&&(zt*=$e,Gt*=$e,fe*=$e),wt.set(zt,Gt,fe,$e),Tt.equals(wt)===!1&&(o.clearColor(zt,Gt,fe,$e),Tt.copy(wt))},reset:function(){F=!1,ut=null,Tt.set(-1,0,0,0)}}}function s(){let F=!1,wt=!1,ut=null,Tt=null,zt=null;return{setReversed:function(Gt){if(wt!==Gt){const fe=n.get("EXT_clip_control");wt?fe.clipControlEXT(fe.LOWER_LEFT_EXT,fe.ZERO_TO_ONE_EXT):fe.clipControlEXT(fe.LOWER_LEFT_EXT,fe.NEGATIVE_ONE_TO_ONE_EXT);const $e=zt;zt=null,this.setClear($e)}wt=Gt},getReversed:function(){return wt},setTest:function(Gt){Gt?W(o.DEPTH_TEST):mt(o.DEPTH_TEST)},setMask:function(Gt){ut!==Gt&&!F&&(o.depthMask(Gt),ut=Gt)},setFunc:function(Gt){if(wt&&(Gt=_R[Gt]),Tt!==Gt){switch(Gt){case jd:o.depthFunc(o.NEVER);break;case qd:o.depthFunc(o.ALWAYS);break;case Yd:o.depthFunc(o.LESS);break;case mo:o.depthFunc(o.LEQUAL);break;case Wd:o.depthFunc(o.EQUAL);break;case Zd:o.depthFunc(o.GEQUAL);break;case Kd:o.depthFunc(o.GREATER);break;case Qd:o.depthFunc(o.NOTEQUAL);break;default:o.depthFunc(o.LEQUAL)}Tt=Gt}},setLocked:function(Gt){F=Gt},setClear:function(Gt){zt!==Gt&&(wt&&(Gt=1-Gt),o.clearDepth(Gt),zt=Gt)},reset:function(){F=!1,ut=null,Tt=null,zt=null,wt=!1}}}function c(){let F=!1,wt=null,ut=null,Tt=null,zt=null,Gt=null,fe=null,$e=null,cn=null;return{setTest:function(De){F||(De?W(o.STENCIL_TEST):mt(o.STENCIL_TEST))},setMask:function(De){wt!==De&&!F&&(o.stencilMask(De),wt=De)},setFunc:function(De,Xe,rn){(ut!==De||Tt!==Xe||zt!==rn)&&(o.stencilFunc(De,Xe,rn),ut=De,Tt=Xe,zt=rn)},setOp:function(De,Xe,rn){(Gt!==De||fe!==Xe||$e!==rn)&&(o.stencilOp(De,Xe,rn),Gt=De,fe=Xe,$e=rn)},setLocked:function(De){F=De},setClear:function(De){cn!==De&&(o.clearStencil(De),cn=De)},reset:function(){F=!1,wt=null,ut=null,Tt=null,zt=null,Gt=null,fe=null,$e=null,cn=null}}}const f=new a,h=new s,d=new c,m=new WeakMap,_=new WeakMap;let g={},p={},x=new WeakMap,M=[],T=null,R=!1,S=null,y=null,P=null,O=null,N=null,et=null,V=null,I=new ke(0,0,0),q=0,U=!1,C=null,B=null,at=null,ot=null,ht=null;const gt=o.getParameter(o.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,rt=0;const Z=o.getParameter(o.VERSION);Z.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(Z)[1]),X=rt>=1):Z.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),X=rt>=2);let St=null,bt={};const Vt=o.getParameter(o.SCISSOR_BOX),ce=o.getParameter(o.VIEWPORT),pt=new Mn().fromArray(Vt),A=new Mn().fromArray(ce);function k(F,wt,ut,Tt){const zt=new Uint8Array(4),Gt=o.createTexture();o.bindTexture(F,Gt),o.texParameteri(F,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(F,o.TEXTURE_MAG_FILTER,o.NEAREST);for(let fe=0;fe<ut;fe++)F===o.TEXTURE_3D||F===o.TEXTURE_2D_ARRAY?o.texImage3D(wt,0,o.RGBA,1,1,Tt,0,o.RGBA,o.UNSIGNED_BYTE,zt):o.texImage2D(wt+fe,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,zt);return Gt}const H={};H[o.TEXTURE_2D]=k(o.TEXTURE_2D,o.TEXTURE_2D,1),H[o.TEXTURE_CUBE_MAP]=k(o.TEXTURE_CUBE_MAP,o.TEXTURE_CUBE_MAP_POSITIVE_X,6),H[o.TEXTURE_2D_ARRAY]=k(o.TEXTURE_2D_ARRAY,o.TEXTURE_2D_ARRAY,1,1),H[o.TEXTURE_3D]=k(o.TEXTURE_3D,o.TEXTURE_3D,1,1),f.setClear(0,0,0,1),h.setClear(1),d.setClear(0),W(o.DEPTH_TEST),h.setFunc(mo),le(!1),ae(n0),W(o.CULL_FACE),j(Tr);function W(F){g[F]!==!0&&(o.enable(F),g[F]=!0)}function mt(F){g[F]!==!1&&(o.disable(F),g[F]=!1)}function _t(F,wt){return p[F]!==wt?(o.bindFramebuffer(F,wt),p[F]=wt,F===o.DRAW_FRAMEBUFFER&&(p[o.FRAMEBUFFER]=wt),F===o.FRAMEBUFFER&&(p[o.DRAW_FRAMEBUFFER]=wt),!0):!1}function At(F,wt){let ut=M,Tt=!1;if(F){ut=x.get(wt),ut===void 0&&(ut=[],x.set(wt,ut));const zt=F.textures;if(ut.length!==zt.length||ut[0]!==o.COLOR_ATTACHMENT0){for(let Gt=0,fe=zt.length;Gt<fe;Gt++)ut[Gt]=o.COLOR_ATTACHMENT0+Gt;ut.length=zt.length,Tt=!0}}else ut[0]!==o.BACK&&(ut[0]=o.BACK,Tt=!0);Tt&&o.drawBuffers(ut)}function Ct(F){return T!==F?(o.useProgram(F),T=F,!0):!1}const Ut={[ns]:o.FUNC_ADD,[OM]:o.FUNC_SUBTRACT,[zM]:o.FUNC_REVERSE_SUBTRACT};Ut[PM]=o.MIN,Ut[IM]=o.MAX;const re={[BM]:o.ZERO,[FM]:o.ONE,[HM]:o.SRC_COLOR,[Xd]:o.SRC_ALPHA,[qM]:o.SRC_ALPHA_SATURATE,[kM]:o.DST_COLOR,[VM]:o.DST_ALPHA,[GM]:o.ONE_MINUS_SRC_COLOR,[kd]:o.ONE_MINUS_SRC_ALPHA,[jM]:o.ONE_MINUS_DST_COLOR,[XM]:o.ONE_MINUS_DST_ALPHA,[YM]:o.CONSTANT_COLOR,[WM]:o.ONE_MINUS_CONSTANT_COLOR,[ZM]:o.CONSTANT_ALPHA,[KM]:o.ONE_MINUS_CONSTANT_ALPHA};function j(F,wt,ut,Tt,zt,Gt,fe,$e,cn,De){if(F===Tr){R===!0&&(mt(o.BLEND),R=!1);return}if(R===!1&&(W(o.BLEND),R=!0),F!==LM){if(F!==S||De!==U){if((y!==ns||N!==ns)&&(o.blendEquation(o.FUNC_ADD),y=ns,N=ns),De)switch(F){case ss:o.blendFuncSeparate(o.ONE,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case uo:o.blendFunc(o.ONE,o.ONE);break;case i0:o.blendFuncSeparate(o.ZERO,o.ONE_MINUS_SRC_COLOR,o.ZERO,o.ONE);break;case a0:o.blendFuncSeparate(o.ZERO,o.SRC_COLOR,o.ZERO,o.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case ss:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case uo:o.blendFunc(o.SRC_ALPHA,o.ONE);break;case i0:o.blendFuncSeparate(o.ZERO,o.ONE_MINUS_SRC_COLOR,o.ZERO,o.ONE);break;case a0:o.blendFunc(o.ZERO,o.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}P=null,O=null,et=null,V=null,I.set(0,0,0),q=0,S=F,U=De}return}zt=zt||wt,Gt=Gt||ut,fe=fe||Tt,(wt!==y||zt!==N)&&(o.blendEquationSeparate(Ut[wt],Ut[zt]),y=wt,N=zt),(ut!==P||Tt!==O||Gt!==et||fe!==V)&&(o.blendFuncSeparate(re[ut],re[Tt],re[Gt],re[fe]),P=ut,O=Tt,et=Gt,V=fe),($e.equals(I)===!1||cn!==q)&&(o.blendColor($e.r,$e.g,$e.b,cn),I.copy($e),q=cn),S=F,U=!1}function Fe(F,wt){F.side===za?mt(o.CULL_FACE):W(o.CULL_FACE);let ut=F.side===ui;wt&&(ut=!ut),le(ut),F.blending===ss&&F.transparent===!1?j(Tr):j(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),h.setFunc(F.depthFunc),h.setTest(F.depthTest),h.setMask(F.depthWrite),f.setMask(F.colorWrite);const Tt=F.stencilWrite;d.setTest(Tt),Tt&&(d.setMask(F.stencilWriteMask),d.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),d.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Se(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?W(o.SAMPLE_ALPHA_TO_COVERAGE):mt(o.SAMPLE_ALPHA_TO_COVERAGE)}function le(F){C!==F&&(F?o.frontFace(o.CW):o.frontFace(o.CCW),C=F)}function ae(F){F!==DM?(W(o.CULL_FACE),F!==B&&(F===n0?o.cullFace(o.BACK):F===UM?o.cullFace(o.FRONT):o.cullFace(o.FRONT_AND_BACK))):mt(o.CULL_FACE),B=F}function Ft(F){F!==at&&(X&&o.lineWidth(F),at=F)}function Se(F,wt,ut){F?(W(o.POLYGON_OFFSET_FILL),(ot!==wt||ht!==ut)&&(o.polygonOffset(wt,ut),ot=wt,ht=ut)):mt(o.POLYGON_OFFSET_FILL)}function ne(F){F?W(o.SCISSOR_TEST):mt(o.SCISSOR_TEST)}function L(F){F===void 0&&(F=o.TEXTURE0+gt-1),St!==F&&(o.activeTexture(F),St=F)}function b(F,wt,ut){ut===void 0&&(St===null?ut=o.TEXTURE0+gt-1:ut=St);let Tt=bt[ut];Tt===void 0&&(Tt={type:void 0,texture:void 0},bt[ut]=Tt),(Tt.type!==F||Tt.texture!==wt)&&(St!==ut&&(o.activeTexture(ut),St=ut),o.bindTexture(F,wt||H[F]),Tt.type=F,Tt.texture=wt)}function it(){const F=bt[St];F!==void 0&&F.type!==void 0&&(o.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function xt(){try{o.compressedTexImage2D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Rt(){try{o.compressedTexImage3D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Et(){try{o.texSubImage2D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function qt(){try{o.texSubImage3D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function vt(){try{o.compressedTexSubImage2D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ht(){try{o.compressedTexSubImage3D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Te(){try{o.texStorage2D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Nt(){try{o.texStorage3D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Yt(){try{o.texImage2D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function te(){try{o.texImage3D.apply(o,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ue(F){pt.equals(F)===!1&&(o.scissor(F.x,F.y,F.z,F.w),pt.copy(F))}function jt(F){A.equals(F)===!1&&(o.viewport(F.x,F.y,F.z,F.w),A.copy(F))}function ye(F,wt){let ut=_.get(wt);ut===void 0&&(ut=new WeakMap,_.set(wt,ut));let Tt=ut.get(F);Tt===void 0&&(Tt=o.getUniformBlockIndex(wt,F.name),ut.set(F,Tt))}function xe(F,wt){const Tt=_.get(wt).get(F);m.get(wt)!==Tt&&(o.uniformBlockBinding(wt,Tt,F.__bindingPointIndex),m.set(wt,Tt))}function we(){o.disable(o.BLEND),o.disable(o.CULL_FACE),o.disable(o.DEPTH_TEST),o.disable(o.POLYGON_OFFSET_FILL),o.disable(o.SCISSOR_TEST),o.disable(o.STENCIL_TEST),o.disable(o.SAMPLE_ALPHA_TO_COVERAGE),o.blendEquation(o.FUNC_ADD),o.blendFunc(o.ONE,o.ZERO),o.blendFuncSeparate(o.ONE,o.ZERO,o.ONE,o.ZERO),o.blendColor(0,0,0,0),o.colorMask(!0,!0,!0,!0),o.clearColor(0,0,0,0),o.depthMask(!0),o.depthFunc(o.LESS),h.setReversed(!1),o.clearDepth(1),o.stencilMask(4294967295),o.stencilFunc(o.ALWAYS,0,4294967295),o.stencilOp(o.KEEP,o.KEEP,o.KEEP),o.clearStencil(0),o.cullFace(o.BACK),o.frontFace(o.CCW),o.polygonOffset(0,0),o.activeTexture(o.TEXTURE0),o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),o.bindFramebuffer(o.READ_FRAMEBUFFER,null),o.useProgram(null),o.lineWidth(1),o.scissor(0,0,o.canvas.width,o.canvas.height),o.viewport(0,0,o.canvas.width,o.canvas.height),g={},St=null,bt={},p={},x=new WeakMap,M=[],T=null,R=!1,S=null,y=null,P=null,O=null,N=null,et=null,V=null,I=new ke(0,0,0),q=0,U=!1,C=null,B=null,at=null,ot=null,ht=null,pt.set(0,0,o.canvas.width,o.canvas.height),A.set(0,0,o.canvas.width,o.canvas.height),f.reset(),h.reset(),d.reset()}return{buffers:{color:f,depth:h,stencil:d},enable:W,disable:mt,bindFramebuffer:_t,drawBuffers:At,useProgram:Ct,setBlending:j,setMaterial:Fe,setFlipSided:le,setCullFace:ae,setLineWidth:Ft,setPolygonOffset:Se,setScissorTest:ne,activeTexture:L,bindTexture:b,unbindTexture:it,compressedTexImage2D:xt,compressedTexImage3D:Rt,texImage2D:Yt,texImage3D:te,updateUBOMapping:ye,uniformBlockBinding:xe,texStorage2D:Te,texStorage3D:Nt,texSubImage2D:Et,texSubImage3D:qt,compressedTexSubImage2D:vt,compressedTexSubImage3D:Ht,scissor:ue,viewport:jt,reset:we}}function J0(o,n,a,s){const c=yR(s);switch(a){case px:return o*n;case gx:return o*n;case vx:return o*n*2;case _x:return o*n/c.components*c.byteLength;case Ip:return o*n/c.components*c.byteLength;case xx:return o*n*2/c.components*c.byteLength;case Bp:return o*n*2/c.components*c.byteLength;case mx:return o*n*3/c.components*c.byteLength;case Yi:return o*n*4/c.components*c.byteLength;case Fp:return o*n*4/c.components*c.byteLength;case Mu:case Eu:return Math.floor((o+3)/4)*Math.floor((n+3)/4)*8;case Tu:case bu:return Math.floor((o+3)/4)*Math.floor((n+3)/4)*16;case ip:case rp:return Math.max(o,16)*Math.max(n,8)/4;case np:case ap:return Math.max(o,8)*Math.max(n,8)/2;case sp:case op:return Math.floor((o+3)/4)*Math.floor((n+3)/4)*8;case lp:return Math.floor((o+3)/4)*Math.floor((n+3)/4)*16;case cp:return Math.floor((o+3)/4)*Math.floor((n+3)/4)*16;case up:return Math.floor((o+4)/5)*Math.floor((n+3)/4)*16;case fp:return Math.floor((o+4)/5)*Math.floor((n+4)/5)*16;case hp:return Math.floor((o+5)/6)*Math.floor((n+4)/5)*16;case dp:return Math.floor((o+5)/6)*Math.floor((n+5)/6)*16;case pp:return Math.floor((o+7)/8)*Math.floor((n+4)/5)*16;case mp:return Math.floor((o+7)/8)*Math.floor((n+5)/6)*16;case gp:return Math.floor((o+7)/8)*Math.floor((n+7)/8)*16;case vp:return Math.floor((o+9)/10)*Math.floor((n+4)/5)*16;case _p:return Math.floor((o+9)/10)*Math.floor((n+5)/6)*16;case xp:return Math.floor((o+9)/10)*Math.floor((n+7)/8)*16;case yp:return Math.floor((o+9)/10)*Math.floor((n+9)/10)*16;case Sp:return Math.floor((o+11)/12)*Math.floor((n+9)/10)*16;case Mp:return Math.floor((o+11)/12)*Math.floor((n+11)/12)*16;case Au:case Ep:case Tp:return Math.ceil(o/4)*Math.ceil(n/4)*16;case yx:case bp:return Math.ceil(o/4)*Math.ceil(n/4)*8;case Ap:case Rp:return Math.ceil(o/4)*Math.ceil(n/4)*16}throw new Error(`Unable to determine texture byte length for ${a} format.`)}function yR(o){switch(o){case Ga:case fx:return{byteLength:1,components:1};case bl:case hx:case Al:return{byteLength:2,components:1};case zp:case Pp:return{byteLength:2,components:4};case os:case Op:case Pa:return{byteLength:4,components:1};case dx:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${o}.`)}function SR(o,n,a,s,c,f,h){const d=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),_=new an,g=new WeakMap;let p;const x=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(L,b){return M?new OffscreenCanvas(L,b):wu("canvas")}function R(L,b,it){let xt=1;const Rt=ne(L);if((Rt.width>it||Rt.height>it)&&(xt=it/Math.max(Rt.width,Rt.height)),xt<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){const Et=Math.floor(xt*Rt.width),qt=Math.floor(xt*Rt.height);p===void 0&&(p=T(Et,qt));const vt=b?T(Et,qt):p;return vt.width=Et,vt.height=qt,vt.getContext("2d").drawImage(L,0,0,Et,qt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Rt.width+"x"+Rt.height+") to ("+Et+"x"+qt+")."),vt}else return"data"in L&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Rt.width+"x"+Rt.height+")."),L;return L}function S(L){return L.generateMipmaps}function y(L){o.generateMipmap(L)}function P(L){return L.isWebGLCubeRenderTarget?o.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?o.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?o.TEXTURE_2D_ARRAY:o.TEXTURE_2D}function O(L,b,it,xt,Rt=!1){if(L!==null){if(o[L]!==void 0)return o[L];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let Et=b;if(b===o.RED&&(it===o.FLOAT&&(Et=o.R32F),it===o.HALF_FLOAT&&(Et=o.R16F),it===o.UNSIGNED_BYTE&&(Et=o.R8)),b===o.RED_INTEGER&&(it===o.UNSIGNED_BYTE&&(Et=o.R8UI),it===o.UNSIGNED_SHORT&&(Et=o.R16UI),it===o.UNSIGNED_INT&&(Et=o.R32UI),it===o.BYTE&&(Et=o.R8I),it===o.SHORT&&(Et=o.R16I),it===o.INT&&(Et=o.R32I)),b===o.RG&&(it===o.FLOAT&&(Et=o.RG32F),it===o.HALF_FLOAT&&(Et=o.RG16F),it===o.UNSIGNED_BYTE&&(Et=o.RG8)),b===o.RG_INTEGER&&(it===o.UNSIGNED_BYTE&&(Et=o.RG8UI),it===o.UNSIGNED_SHORT&&(Et=o.RG16UI),it===o.UNSIGNED_INT&&(Et=o.RG32UI),it===o.BYTE&&(Et=o.RG8I),it===o.SHORT&&(Et=o.RG16I),it===o.INT&&(Et=o.RG32I)),b===o.RGB_INTEGER&&(it===o.UNSIGNED_BYTE&&(Et=o.RGB8UI),it===o.UNSIGNED_SHORT&&(Et=o.RGB16UI),it===o.UNSIGNED_INT&&(Et=o.RGB32UI),it===o.BYTE&&(Et=o.RGB8I),it===o.SHORT&&(Et=o.RGB16I),it===o.INT&&(Et=o.RGB32I)),b===o.RGBA_INTEGER&&(it===o.UNSIGNED_BYTE&&(Et=o.RGBA8UI),it===o.UNSIGNED_SHORT&&(Et=o.RGBA16UI),it===o.UNSIGNED_INT&&(Et=o.RGBA32UI),it===o.BYTE&&(Et=o.RGBA8I),it===o.SHORT&&(Et=o.RGBA16I),it===o.INT&&(Et=o.RGBA32I)),b===o.RGB&&it===o.UNSIGNED_INT_5_9_9_9_REV&&(Et=o.RGB9_E5),b===o.RGBA){const qt=Rt?Lu:Ve.getTransfer(xt);it===o.FLOAT&&(Et=o.RGBA32F),it===o.HALF_FLOAT&&(Et=o.RGBA16F),it===o.UNSIGNED_BYTE&&(Et=qt===en?o.SRGB8_ALPHA8:o.RGBA8),it===o.UNSIGNED_SHORT_4_4_4_4&&(Et=o.RGBA4),it===o.UNSIGNED_SHORT_5_5_5_1&&(Et=o.RGB5_A1)}return(Et===o.R16F||Et===o.R32F||Et===o.RG16F||Et===o.RG32F||Et===o.RGBA16F||Et===o.RGBA32F)&&n.get("EXT_color_buffer_float"),Et}function N(L,b){let it;return L?b===null||b===os||b===_o?it=o.DEPTH24_STENCIL8:b===Pa?it=o.DEPTH32F_STENCIL8:b===bl&&(it=o.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===os||b===_o?it=o.DEPTH_COMPONENT24:b===Pa?it=o.DEPTH_COMPONENT32F:b===bl&&(it=o.DEPTH_COMPONENT16),it}function et(L,b){return S(L)===!0||L.isFramebufferTexture&&L.minFilter!==Zi&&L.minFilter!==da?Math.log2(Math.max(b.width,b.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?b.mipmaps.length:1}function V(L){const b=L.target;b.removeEventListener("dispose",V),q(b),b.isVideoTexture&&g.delete(b)}function I(L){const b=L.target;b.removeEventListener("dispose",I),C(b)}function q(L){const b=s.get(L);if(b.__webglInit===void 0)return;const it=L.source,xt=x.get(it);if(xt){const Rt=xt[b.__cacheKey];Rt.usedTimes--,Rt.usedTimes===0&&U(L),Object.keys(xt).length===0&&x.delete(it)}s.remove(L)}function U(L){const b=s.get(L);o.deleteTexture(b.__webglTexture);const it=L.source,xt=x.get(it);delete xt[b.__cacheKey],h.memory.textures--}function C(L){const b=s.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),s.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let xt=0;xt<6;xt++){if(Array.isArray(b.__webglFramebuffer[xt]))for(let Rt=0;Rt<b.__webglFramebuffer[xt].length;Rt++)o.deleteFramebuffer(b.__webglFramebuffer[xt][Rt]);else o.deleteFramebuffer(b.__webglFramebuffer[xt]);b.__webglDepthbuffer&&o.deleteRenderbuffer(b.__webglDepthbuffer[xt])}else{if(Array.isArray(b.__webglFramebuffer))for(let xt=0;xt<b.__webglFramebuffer.length;xt++)o.deleteFramebuffer(b.__webglFramebuffer[xt]);else o.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&o.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&o.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let xt=0;xt<b.__webglColorRenderbuffer.length;xt++)b.__webglColorRenderbuffer[xt]&&o.deleteRenderbuffer(b.__webglColorRenderbuffer[xt]);b.__webglDepthRenderbuffer&&o.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const it=L.textures;for(let xt=0,Rt=it.length;xt<Rt;xt++){const Et=s.get(it[xt]);Et.__webglTexture&&(o.deleteTexture(Et.__webglTexture),h.memory.textures--),s.remove(it[xt])}s.remove(L)}let B=0;function at(){B=0}function ot(){const L=B;return L>=c.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+c.maxTextures),B+=1,L}function ht(L){const b=[];return b.push(L.wrapS),b.push(L.wrapT),b.push(L.wrapR||0),b.push(L.magFilter),b.push(L.minFilter),b.push(L.anisotropy),b.push(L.internalFormat),b.push(L.format),b.push(L.type),b.push(L.generateMipmaps),b.push(L.premultiplyAlpha),b.push(L.flipY),b.push(L.unpackAlignment),b.push(L.colorSpace),b.join()}function gt(L,b){const it=s.get(L);if(L.isVideoTexture&&Ft(L),L.isRenderTargetTexture===!1&&L.version>0&&it.__version!==L.version){const xt=L.image;if(xt===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(xt.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{A(it,L,b);return}}a.bindTexture(o.TEXTURE_2D,it.__webglTexture,o.TEXTURE0+b)}function X(L,b){const it=s.get(L);if(L.version>0&&it.__version!==L.version){A(it,L,b);return}a.bindTexture(o.TEXTURE_2D_ARRAY,it.__webglTexture,o.TEXTURE0+b)}function rt(L,b){const it=s.get(L);if(L.version>0&&it.__version!==L.version){A(it,L,b);return}a.bindTexture(o.TEXTURE_3D,it.__webglTexture,o.TEXTURE0+b)}function Z(L,b){const it=s.get(L);if(L.version>0&&it.__version!==L.version){k(it,L,b);return}a.bindTexture(o.TEXTURE_CUBE_MAP,it.__webglTexture,o.TEXTURE0+b)}const St={[tp]:o.REPEAT,[as]:o.CLAMP_TO_EDGE,[ep]:o.MIRRORED_REPEAT},bt={[Zi]:o.NEAREST,[sE]:o.NEAREST_MIPMAP_NEAREST,[Kc]:o.NEAREST_MIPMAP_LINEAR,[da]:o.LINEAR,[hd]:o.LINEAR_MIPMAP_NEAREST,[rs]:o.LINEAR_MIPMAP_LINEAR},Vt={[fE]:o.NEVER,[vE]:o.ALWAYS,[hE]:o.LESS,[Sx]:o.LEQUAL,[dE]:o.EQUAL,[gE]:o.GEQUAL,[pE]:o.GREATER,[mE]:o.NOTEQUAL};function ce(L,b){if(b.type===Pa&&n.has("OES_texture_float_linear")===!1&&(b.magFilter===da||b.magFilter===hd||b.magFilter===Kc||b.magFilter===rs||b.minFilter===da||b.minFilter===hd||b.minFilter===Kc||b.minFilter===rs)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),o.texParameteri(L,o.TEXTURE_WRAP_S,St[b.wrapS]),o.texParameteri(L,o.TEXTURE_WRAP_T,St[b.wrapT]),(L===o.TEXTURE_3D||L===o.TEXTURE_2D_ARRAY)&&o.texParameteri(L,o.TEXTURE_WRAP_R,St[b.wrapR]),o.texParameteri(L,o.TEXTURE_MAG_FILTER,bt[b.magFilter]),o.texParameteri(L,o.TEXTURE_MIN_FILTER,bt[b.minFilter]),b.compareFunction&&(o.texParameteri(L,o.TEXTURE_COMPARE_MODE,o.COMPARE_REF_TO_TEXTURE),o.texParameteri(L,o.TEXTURE_COMPARE_FUNC,Vt[b.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Zi||b.minFilter!==Kc&&b.minFilter!==rs||b.type===Pa&&n.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||s.get(b).__currentAnisotropy){const it=n.get("EXT_texture_filter_anisotropic");o.texParameterf(L,it.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,c.getMaxAnisotropy())),s.get(b).__currentAnisotropy=b.anisotropy}}}function pt(L,b){let it=!1;L.__webglInit===void 0&&(L.__webglInit=!0,b.addEventListener("dispose",V));const xt=b.source;let Rt=x.get(xt);Rt===void 0&&(Rt={},x.set(xt,Rt));const Et=ht(b);if(Et!==L.__cacheKey){Rt[Et]===void 0&&(Rt[Et]={texture:o.createTexture(),usedTimes:0},h.memory.textures++,it=!0),Rt[Et].usedTimes++;const qt=Rt[L.__cacheKey];qt!==void 0&&(Rt[L.__cacheKey].usedTimes--,qt.usedTimes===0&&U(b)),L.__cacheKey=Et,L.__webglTexture=Rt[Et].texture}return it}function A(L,b,it){let xt=o.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(xt=o.TEXTURE_2D_ARRAY),b.isData3DTexture&&(xt=o.TEXTURE_3D);const Rt=pt(L,b),Et=b.source;a.bindTexture(xt,L.__webglTexture,o.TEXTURE0+it);const qt=s.get(Et);if(Et.version!==qt.__version||Rt===!0){a.activeTexture(o.TEXTURE0+it);const vt=Ve.getPrimaries(Ve.workingColorSpace),Ht=b.colorSpace===Er?null:Ve.getPrimaries(b.colorSpace),Te=b.colorSpace===Er||vt===Ht?o.NONE:o.BROWSER_DEFAULT_WEBGL;o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,b.flipY),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),o.pixelStorei(o.UNPACK_ALIGNMENT,b.unpackAlignment),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let Nt=R(b.image,!1,c.maxTextureSize);Nt=Se(b,Nt);const Yt=f.convert(b.format,b.colorSpace),te=f.convert(b.type);let ue=O(b.internalFormat,Yt,te,b.colorSpace,b.isVideoTexture);ce(xt,b);let jt;const ye=b.mipmaps,xe=b.isVideoTexture!==!0,we=qt.__version===void 0||Rt===!0,F=Et.dataReady,wt=et(b,Nt);if(b.isDepthTexture)ue=N(b.format===xo,b.type),we&&(xe?a.texStorage2D(o.TEXTURE_2D,1,ue,Nt.width,Nt.height):a.texImage2D(o.TEXTURE_2D,0,ue,Nt.width,Nt.height,0,Yt,te,null));else if(b.isDataTexture)if(ye.length>0){xe&&we&&a.texStorage2D(o.TEXTURE_2D,wt,ue,ye[0].width,ye[0].height);for(let ut=0,Tt=ye.length;ut<Tt;ut++)jt=ye[ut],xe?F&&a.texSubImage2D(o.TEXTURE_2D,ut,0,0,jt.width,jt.height,Yt,te,jt.data):a.texImage2D(o.TEXTURE_2D,ut,ue,jt.width,jt.height,0,Yt,te,jt.data);b.generateMipmaps=!1}else xe?(we&&a.texStorage2D(o.TEXTURE_2D,wt,ue,Nt.width,Nt.height),F&&a.texSubImage2D(o.TEXTURE_2D,0,0,0,Nt.width,Nt.height,Yt,te,Nt.data)):a.texImage2D(o.TEXTURE_2D,0,ue,Nt.width,Nt.height,0,Yt,te,Nt.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){xe&&we&&a.texStorage3D(o.TEXTURE_2D_ARRAY,wt,ue,ye[0].width,ye[0].height,Nt.depth);for(let ut=0,Tt=ye.length;ut<Tt;ut++)if(jt=ye[ut],b.format!==Yi)if(Yt!==null)if(xe){if(F)if(b.layerUpdates.size>0){const zt=J0(jt.width,jt.height,b.format,b.type);for(const Gt of b.layerUpdates){const fe=jt.data.subarray(Gt*zt/jt.data.BYTES_PER_ELEMENT,(Gt+1)*zt/jt.data.BYTES_PER_ELEMENT);a.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,ut,0,0,Gt,jt.width,jt.height,1,Yt,fe)}b.clearLayerUpdates()}else a.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,ut,0,0,0,jt.width,jt.height,Nt.depth,Yt,jt.data)}else a.compressedTexImage3D(o.TEXTURE_2D_ARRAY,ut,ue,jt.width,jt.height,Nt.depth,0,jt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else xe?F&&a.texSubImage3D(o.TEXTURE_2D_ARRAY,ut,0,0,0,jt.width,jt.height,Nt.depth,Yt,te,jt.data):a.texImage3D(o.TEXTURE_2D_ARRAY,ut,ue,jt.width,jt.height,Nt.depth,0,Yt,te,jt.data)}else{xe&&we&&a.texStorage2D(o.TEXTURE_2D,wt,ue,ye[0].width,ye[0].height);for(let ut=0,Tt=ye.length;ut<Tt;ut++)jt=ye[ut],b.format!==Yi?Yt!==null?xe?F&&a.compressedTexSubImage2D(o.TEXTURE_2D,ut,0,0,jt.width,jt.height,Yt,jt.data):a.compressedTexImage2D(o.TEXTURE_2D,ut,ue,jt.width,jt.height,0,jt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):xe?F&&a.texSubImage2D(o.TEXTURE_2D,ut,0,0,jt.width,jt.height,Yt,te,jt.data):a.texImage2D(o.TEXTURE_2D,ut,ue,jt.width,jt.height,0,Yt,te,jt.data)}else if(b.isDataArrayTexture)if(xe){if(we&&a.texStorage3D(o.TEXTURE_2D_ARRAY,wt,ue,Nt.width,Nt.height,Nt.depth),F)if(b.layerUpdates.size>0){const ut=J0(Nt.width,Nt.height,b.format,b.type);for(const Tt of b.layerUpdates){const zt=Nt.data.subarray(Tt*ut/Nt.data.BYTES_PER_ELEMENT,(Tt+1)*ut/Nt.data.BYTES_PER_ELEMENT);a.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,Tt,Nt.width,Nt.height,1,Yt,te,zt)}b.clearLayerUpdates()}else a.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,0,Nt.width,Nt.height,Nt.depth,Yt,te,Nt.data)}else a.texImage3D(o.TEXTURE_2D_ARRAY,0,ue,Nt.width,Nt.height,Nt.depth,0,Yt,te,Nt.data);else if(b.isData3DTexture)xe?(we&&a.texStorage3D(o.TEXTURE_3D,wt,ue,Nt.width,Nt.height,Nt.depth),F&&a.texSubImage3D(o.TEXTURE_3D,0,0,0,0,Nt.width,Nt.height,Nt.depth,Yt,te,Nt.data)):a.texImage3D(o.TEXTURE_3D,0,ue,Nt.width,Nt.height,Nt.depth,0,Yt,te,Nt.data);else if(b.isFramebufferTexture){if(we)if(xe)a.texStorage2D(o.TEXTURE_2D,wt,ue,Nt.width,Nt.height);else{let ut=Nt.width,Tt=Nt.height;for(let zt=0;zt<wt;zt++)a.texImage2D(o.TEXTURE_2D,zt,ue,ut,Tt,0,Yt,te,null),ut>>=1,Tt>>=1}}else if(ye.length>0){if(xe&&we){const ut=ne(ye[0]);a.texStorage2D(o.TEXTURE_2D,wt,ue,ut.width,ut.height)}for(let ut=0,Tt=ye.length;ut<Tt;ut++)jt=ye[ut],xe?F&&a.texSubImage2D(o.TEXTURE_2D,ut,0,0,Yt,te,jt):a.texImage2D(o.TEXTURE_2D,ut,ue,Yt,te,jt);b.generateMipmaps=!1}else if(xe){if(we){const ut=ne(Nt);a.texStorage2D(o.TEXTURE_2D,wt,ue,ut.width,ut.height)}F&&a.texSubImage2D(o.TEXTURE_2D,0,0,0,Yt,te,Nt)}else a.texImage2D(o.TEXTURE_2D,0,ue,Yt,te,Nt);S(b)&&y(xt),qt.__version=Et.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function k(L,b,it){if(b.image.length!==6)return;const xt=pt(L,b),Rt=b.source;a.bindTexture(o.TEXTURE_CUBE_MAP,L.__webglTexture,o.TEXTURE0+it);const Et=s.get(Rt);if(Rt.version!==Et.__version||xt===!0){a.activeTexture(o.TEXTURE0+it);const qt=Ve.getPrimaries(Ve.workingColorSpace),vt=b.colorSpace===Er?null:Ve.getPrimaries(b.colorSpace),Ht=b.colorSpace===Er||qt===vt?o.NONE:o.BROWSER_DEFAULT_WEBGL;o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,b.flipY),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),o.pixelStorei(o.UNPACK_ALIGNMENT,b.unpackAlignment),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ht);const Te=b.isCompressedTexture||b.image[0].isCompressedTexture,Nt=b.image[0]&&b.image[0].isDataTexture,Yt=[];for(let Tt=0;Tt<6;Tt++)!Te&&!Nt?Yt[Tt]=R(b.image[Tt],!0,c.maxCubemapSize):Yt[Tt]=Nt?b.image[Tt].image:b.image[Tt],Yt[Tt]=Se(b,Yt[Tt]);const te=Yt[0],ue=f.convert(b.format,b.colorSpace),jt=f.convert(b.type),ye=O(b.internalFormat,ue,jt,b.colorSpace),xe=b.isVideoTexture!==!0,we=Et.__version===void 0||xt===!0,F=Rt.dataReady;let wt=et(b,te);ce(o.TEXTURE_CUBE_MAP,b);let ut;if(Te){xe&&we&&a.texStorage2D(o.TEXTURE_CUBE_MAP,wt,ye,te.width,te.height);for(let Tt=0;Tt<6;Tt++){ut=Yt[Tt].mipmaps;for(let zt=0;zt<ut.length;zt++){const Gt=ut[zt];b.format!==Yi?ue!==null?xe?F&&a.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt,0,0,Gt.width,Gt.height,ue,Gt.data):a.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt,ye,Gt.width,Gt.height,0,Gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):xe?F&&a.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt,0,0,Gt.width,Gt.height,ue,jt,Gt.data):a.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt,ye,Gt.width,Gt.height,0,ue,jt,Gt.data)}}}else{if(ut=b.mipmaps,xe&&we){ut.length>0&&wt++;const Tt=ne(Yt[0]);a.texStorage2D(o.TEXTURE_CUBE_MAP,wt,ye,Tt.width,Tt.height)}for(let Tt=0;Tt<6;Tt++)if(Nt){xe?F&&a.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,0,0,Yt[Tt].width,Yt[Tt].height,ue,jt,Yt[Tt].data):a.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,ye,Yt[Tt].width,Yt[Tt].height,0,ue,jt,Yt[Tt].data);for(let zt=0;zt<ut.length;zt++){const fe=ut[zt].image[Tt].image;xe?F&&a.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt+1,0,0,fe.width,fe.height,ue,jt,fe.data):a.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt+1,ye,fe.width,fe.height,0,ue,jt,fe.data)}}else{xe?F&&a.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,0,0,ue,jt,Yt[Tt]):a.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,0,ye,ue,jt,Yt[Tt]);for(let zt=0;zt<ut.length;zt++){const Gt=ut[zt];xe?F&&a.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt+1,0,0,ue,jt,Gt.image[Tt]):a.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Tt,zt+1,ye,ue,jt,Gt.image[Tt])}}}S(b)&&y(o.TEXTURE_CUBE_MAP),Et.__version=Rt.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function H(L,b,it,xt,Rt,Et){const qt=f.convert(it.format,it.colorSpace),vt=f.convert(it.type),Ht=O(it.internalFormat,qt,vt,it.colorSpace),Te=s.get(b),Nt=s.get(it);if(Nt.__renderTarget=b,!Te.__hasExternalTextures){const Yt=Math.max(1,b.width>>Et),te=Math.max(1,b.height>>Et);Rt===o.TEXTURE_3D||Rt===o.TEXTURE_2D_ARRAY?a.texImage3D(Rt,Et,Ht,Yt,te,b.depth,0,qt,vt,null):a.texImage2D(Rt,Et,Ht,Yt,te,0,qt,vt,null)}a.bindFramebuffer(o.FRAMEBUFFER,L),ae(b)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,xt,Rt,Nt.__webglTexture,0,le(b)):(Rt===o.TEXTURE_2D||Rt>=o.TEXTURE_CUBE_MAP_POSITIVE_X&&Rt<=o.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&o.framebufferTexture2D(o.FRAMEBUFFER,xt,Rt,Nt.__webglTexture,Et),a.bindFramebuffer(o.FRAMEBUFFER,null)}function W(L,b,it){if(o.bindRenderbuffer(o.RENDERBUFFER,L),b.depthBuffer){const xt=b.depthTexture,Rt=xt&&xt.isDepthTexture?xt.type:null,Et=N(b.stencilBuffer,Rt),qt=b.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,vt=le(b);ae(b)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,vt,Et,b.width,b.height):it?o.renderbufferStorageMultisample(o.RENDERBUFFER,vt,Et,b.width,b.height):o.renderbufferStorage(o.RENDERBUFFER,Et,b.width,b.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,qt,o.RENDERBUFFER,L)}else{const xt=b.textures;for(let Rt=0;Rt<xt.length;Rt++){const Et=xt[Rt],qt=f.convert(Et.format,Et.colorSpace),vt=f.convert(Et.type),Ht=O(Et.internalFormat,qt,vt,Et.colorSpace),Te=le(b);it&&ae(b)===!1?o.renderbufferStorageMultisample(o.RENDERBUFFER,Te,Ht,b.width,b.height):ae(b)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Te,Ht,b.width,b.height):o.renderbufferStorage(o.RENDERBUFFER,Ht,b.width,b.height)}}o.bindRenderbuffer(o.RENDERBUFFER,null)}function mt(L,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(a.bindFramebuffer(o.FRAMEBUFFER,L),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const xt=s.get(b.depthTexture);xt.__renderTarget=b,(!xt.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),gt(b.depthTexture,0);const Rt=xt.__webglTexture,Et=le(b);if(b.depthTexture.format===ho)ae(b)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,o.DEPTH_ATTACHMENT,o.TEXTURE_2D,Rt,0,Et):o.framebufferTexture2D(o.FRAMEBUFFER,o.DEPTH_ATTACHMENT,o.TEXTURE_2D,Rt,0);else if(b.depthTexture.format===xo)ae(b)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,o.DEPTH_STENCIL_ATTACHMENT,o.TEXTURE_2D,Rt,0,Et):o.framebufferTexture2D(o.FRAMEBUFFER,o.DEPTH_STENCIL_ATTACHMENT,o.TEXTURE_2D,Rt,0);else throw new Error("Unknown depthTexture format")}function _t(L){const b=s.get(L),it=L.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==L.depthTexture){const xt=L.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),xt){const Rt=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,xt.removeEventListener("dispose",Rt)};xt.addEventListener("dispose",Rt),b.__depthDisposeCallback=Rt}b.__boundDepthTexture=xt}if(L.depthTexture&&!b.__autoAllocateDepthBuffer){if(it)throw new Error("target.depthTexture not supported in Cube render targets");mt(b.__webglFramebuffer,L)}else if(it){b.__webglDepthbuffer=[];for(let xt=0;xt<6;xt++)if(a.bindFramebuffer(o.FRAMEBUFFER,b.__webglFramebuffer[xt]),b.__webglDepthbuffer[xt]===void 0)b.__webglDepthbuffer[xt]=o.createRenderbuffer(),W(b.__webglDepthbuffer[xt],L,!1);else{const Rt=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Et=b.__webglDepthbuffer[xt];o.bindRenderbuffer(o.RENDERBUFFER,Et),o.framebufferRenderbuffer(o.FRAMEBUFFER,Rt,o.RENDERBUFFER,Et)}}else if(a.bindFramebuffer(o.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=o.createRenderbuffer(),W(b.__webglDepthbuffer,L,!1);else{const xt=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Rt=b.__webglDepthbuffer;o.bindRenderbuffer(o.RENDERBUFFER,Rt),o.framebufferRenderbuffer(o.FRAMEBUFFER,xt,o.RENDERBUFFER,Rt)}a.bindFramebuffer(o.FRAMEBUFFER,null)}function At(L,b,it){const xt=s.get(L);b!==void 0&&H(xt.__webglFramebuffer,L,L.texture,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,0),it!==void 0&&_t(L)}function Ct(L){const b=L.texture,it=s.get(L),xt=s.get(b);L.addEventListener("dispose",I);const Rt=L.textures,Et=L.isWebGLCubeRenderTarget===!0,qt=Rt.length>1;if(qt||(xt.__webglTexture===void 0&&(xt.__webglTexture=o.createTexture()),xt.__version=b.version,h.memory.textures++),Et){it.__webglFramebuffer=[];for(let vt=0;vt<6;vt++)if(b.mipmaps&&b.mipmaps.length>0){it.__webglFramebuffer[vt]=[];for(let Ht=0;Ht<b.mipmaps.length;Ht++)it.__webglFramebuffer[vt][Ht]=o.createFramebuffer()}else it.__webglFramebuffer[vt]=o.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){it.__webglFramebuffer=[];for(let vt=0;vt<b.mipmaps.length;vt++)it.__webglFramebuffer[vt]=o.createFramebuffer()}else it.__webglFramebuffer=o.createFramebuffer();if(qt)for(let vt=0,Ht=Rt.length;vt<Ht;vt++){const Te=s.get(Rt[vt]);Te.__webglTexture===void 0&&(Te.__webglTexture=o.createTexture(),h.memory.textures++)}if(L.samples>0&&ae(L)===!1){it.__webglMultisampledFramebuffer=o.createFramebuffer(),it.__webglColorRenderbuffer=[],a.bindFramebuffer(o.FRAMEBUFFER,it.__webglMultisampledFramebuffer);for(let vt=0;vt<Rt.length;vt++){const Ht=Rt[vt];it.__webglColorRenderbuffer[vt]=o.createRenderbuffer(),o.bindRenderbuffer(o.RENDERBUFFER,it.__webglColorRenderbuffer[vt]);const Te=f.convert(Ht.format,Ht.colorSpace),Nt=f.convert(Ht.type),Yt=O(Ht.internalFormat,Te,Nt,Ht.colorSpace,L.isXRRenderTarget===!0),te=le(L);o.renderbufferStorageMultisample(o.RENDERBUFFER,te,Yt,L.width,L.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+vt,o.RENDERBUFFER,it.__webglColorRenderbuffer[vt])}o.bindRenderbuffer(o.RENDERBUFFER,null),L.depthBuffer&&(it.__webglDepthRenderbuffer=o.createRenderbuffer(),W(it.__webglDepthRenderbuffer,L,!0)),a.bindFramebuffer(o.FRAMEBUFFER,null)}}if(Et){a.bindTexture(o.TEXTURE_CUBE_MAP,xt.__webglTexture),ce(o.TEXTURE_CUBE_MAP,b);for(let vt=0;vt<6;vt++)if(b.mipmaps&&b.mipmaps.length>0)for(let Ht=0;Ht<b.mipmaps.length;Ht++)H(it.__webglFramebuffer[vt][Ht],L,b,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+vt,Ht);else H(it.__webglFramebuffer[vt],L,b,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0);S(b)&&y(o.TEXTURE_CUBE_MAP),a.unbindTexture()}else if(qt){for(let vt=0,Ht=Rt.length;vt<Ht;vt++){const Te=Rt[vt],Nt=s.get(Te);a.bindTexture(o.TEXTURE_2D,Nt.__webglTexture),ce(o.TEXTURE_2D,Te),H(it.__webglFramebuffer,L,Te,o.COLOR_ATTACHMENT0+vt,o.TEXTURE_2D,0),S(Te)&&y(o.TEXTURE_2D)}a.unbindTexture()}else{let vt=o.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(vt=L.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),a.bindTexture(vt,xt.__webglTexture),ce(vt,b),b.mipmaps&&b.mipmaps.length>0)for(let Ht=0;Ht<b.mipmaps.length;Ht++)H(it.__webglFramebuffer[Ht],L,b,o.COLOR_ATTACHMENT0,vt,Ht);else H(it.__webglFramebuffer,L,b,o.COLOR_ATTACHMENT0,vt,0);S(b)&&y(vt),a.unbindTexture()}L.depthBuffer&&_t(L)}function Ut(L){const b=L.textures;for(let it=0,xt=b.length;it<xt;it++){const Rt=b[it];if(S(Rt)){const Et=P(L),qt=s.get(Rt).__webglTexture;a.bindTexture(Et,qt),y(Et),a.unbindTexture()}}}const re=[],j=[];function Fe(L){if(L.samples>0){if(ae(L)===!1){const b=L.textures,it=L.width,xt=L.height;let Rt=o.COLOR_BUFFER_BIT;const Et=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,qt=s.get(L),vt=b.length>1;if(vt)for(let Ht=0;Ht<b.length;Ht++)a.bindFramebuffer(o.FRAMEBUFFER,qt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ht,o.RENDERBUFFER,null),a.bindFramebuffer(o.FRAMEBUFFER,qt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ht,o.TEXTURE_2D,null,0);a.bindFramebuffer(o.READ_FRAMEBUFFER,qt.__webglMultisampledFramebuffer),a.bindFramebuffer(o.DRAW_FRAMEBUFFER,qt.__webglFramebuffer);for(let Ht=0;Ht<b.length;Ht++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(Rt|=o.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(Rt|=o.STENCIL_BUFFER_BIT)),vt){o.framebufferRenderbuffer(o.READ_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.RENDERBUFFER,qt.__webglColorRenderbuffer[Ht]);const Te=s.get(b[Ht]).__webglTexture;o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,Te,0)}o.blitFramebuffer(0,0,it,xt,0,0,it,xt,Rt,o.NEAREST),m===!0&&(re.length=0,j.length=0,re.push(o.COLOR_ATTACHMENT0+Ht),L.depthBuffer&&L.resolveDepthBuffer===!1&&(re.push(Et),j.push(Et),o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,j)),o.invalidateFramebuffer(o.READ_FRAMEBUFFER,re))}if(a.bindFramebuffer(o.READ_FRAMEBUFFER,null),a.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),vt)for(let Ht=0;Ht<b.length;Ht++){a.bindFramebuffer(o.FRAMEBUFFER,qt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ht,o.RENDERBUFFER,qt.__webglColorRenderbuffer[Ht]);const Te=s.get(b[Ht]).__webglTexture;a.bindFramebuffer(o.FRAMEBUFFER,qt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ht,o.TEXTURE_2D,Te,0)}a.bindFramebuffer(o.DRAW_FRAMEBUFFER,qt.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&m){const b=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,[b])}}}function le(L){return Math.min(c.maxSamples,L.samples)}function ae(L){const b=s.get(L);return L.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Ft(L){const b=h.render.frame;g.get(L)!==b&&(g.set(L,b),L.update())}function Se(L,b){const it=L.colorSpace,xt=L.format,Rt=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||it!==So&&it!==Er&&(Ve.getTransfer(it)===en?(xt!==Yi||Rt!==Ga)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",it)),b}function ne(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(_.width=L.naturalWidth||L.width,_.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(_.width=L.displayWidth,_.height=L.displayHeight):(_.width=L.width,_.height=L.height),_}this.allocateTextureUnit=ot,this.resetTextureUnits=at,this.setTexture2D=gt,this.setTexture2DArray=X,this.setTexture3D=rt,this.setTextureCube=Z,this.rebindTextures=At,this.setupRenderTarget=Ct,this.updateRenderTargetMipmap=Ut,this.updateMultisampleRenderTarget=Fe,this.setupDepthRenderbuffer=_t,this.setupFrameBufferTexture=H,this.useMultisampledRTT=ae}function MR(o,n){function a(s,c=Er){let f;const h=Ve.getTransfer(c);if(s===Ga)return o.UNSIGNED_BYTE;if(s===zp)return o.UNSIGNED_SHORT_4_4_4_4;if(s===Pp)return o.UNSIGNED_SHORT_5_5_5_1;if(s===dx)return o.UNSIGNED_INT_5_9_9_9_REV;if(s===fx)return o.BYTE;if(s===hx)return o.SHORT;if(s===bl)return o.UNSIGNED_SHORT;if(s===Op)return o.INT;if(s===os)return o.UNSIGNED_INT;if(s===Pa)return o.FLOAT;if(s===Al)return o.HALF_FLOAT;if(s===px)return o.ALPHA;if(s===mx)return o.RGB;if(s===Yi)return o.RGBA;if(s===gx)return o.LUMINANCE;if(s===vx)return o.LUMINANCE_ALPHA;if(s===ho)return o.DEPTH_COMPONENT;if(s===xo)return o.DEPTH_STENCIL;if(s===_x)return o.RED;if(s===Ip)return o.RED_INTEGER;if(s===xx)return o.RG;if(s===Bp)return o.RG_INTEGER;if(s===Fp)return o.RGBA_INTEGER;if(s===Mu||s===Eu||s===Tu||s===bu)if(h===en)if(f=n.get("WEBGL_compressed_texture_s3tc_srgb"),f!==null){if(s===Mu)return f.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Eu)return f.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Tu)return f.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===bu)return f.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(f=n.get("WEBGL_compressed_texture_s3tc"),f!==null){if(s===Mu)return f.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Eu)return f.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Tu)return f.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===bu)return f.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===np||s===ip||s===ap||s===rp)if(f=n.get("WEBGL_compressed_texture_pvrtc"),f!==null){if(s===np)return f.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===ip)return f.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===ap)return f.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===rp)return f.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===sp||s===op||s===lp)if(f=n.get("WEBGL_compressed_texture_etc"),f!==null){if(s===sp||s===op)return h===en?f.COMPRESSED_SRGB8_ETC2:f.COMPRESSED_RGB8_ETC2;if(s===lp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:f.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===cp||s===up||s===fp||s===hp||s===dp||s===pp||s===mp||s===gp||s===vp||s===_p||s===xp||s===yp||s===Sp||s===Mp)if(f=n.get("WEBGL_compressed_texture_astc"),f!==null){if(s===cp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:f.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===up)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:f.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===fp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:f.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===hp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:f.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===dp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:f.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===pp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:f.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===mp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:f.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===gp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:f.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===vp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:f.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===_p)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:f.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===xp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:f.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===yp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:f.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Sp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:f.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Mp)return h===en?f.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:f.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Au||s===Ep||s===Tp)if(f=n.get("EXT_texture_compression_bptc"),f!==null){if(s===Au)return h===en?f.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:f.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Ep)return f.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Tp)return f.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===yx||s===bp||s===Ap||s===Rp)if(f=n.get("EXT_texture_compression_rgtc"),f!==null){if(s===Au)return f.COMPRESSED_RED_RGTC1_EXT;if(s===bp)return f.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Ap)return f.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Rp)return f.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===_o?o.UNSIGNED_INT_24_8:o[s]!==void 0?o[s]:null}return{convert:a}}class ER extends Oi{constructor(n=[]){super(),this.isArrayCamera=!0,this.cameras=n}}class vu extends ti{constructor(){super(),this.isGroup=!0,this.type="Group"}}const TR={type:"move"};class Gd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new vu,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new vu,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new ft,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new ft),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new vu,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new ft,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new ft),this._grip}dispatchEvent(n){return this._targetRay!==null&&this._targetRay.dispatchEvent(n),this._grip!==null&&this._grip.dispatchEvent(n),this._hand!==null&&this._hand.dispatchEvent(n),this}connect(n){if(n&&n.hand){const a=this._hand;if(a)for(const s of n.hand.values())this._getHandJoint(a,s)}return this.dispatchEvent({type:"connected",data:n}),this}disconnect(n){return this.dispatchEvent({type:"disconnected",data:n}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(n,a,s){let c=null,f=null,h=null;const d=this._targetRay,m=this._grip,_=this._hand;if(n&&a.session.visibilityState!=="visible-blurred"){if(_&&n.hand){h=!0;for(const R of n.hand.values()){const S=a.getJointPose(R,s),y=this._getHandJoint(_,R);S!==null&&(y.matrix.fromArray(S.transform.matrix),y.matrix.decompose(y.position,y.rotation,y.scale),y.matrixWorldNeedsUpdate=!0,y.jointRadius=S.radius),y.visible=S!==null}const g=_.joints["index-finger-tip"],p=_.joints["thumb-tip"],x=g.position.distanceTo(p.position),M=.02,T=.005;_.inputState.pinching&&x>M+T?(_.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:n.handedness,target:this})):!_.inputState.pinching&&x<=M-T&&(_.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:n.handedness,target:this}))}else m!==null&&n.gripSpace&&(f=a.getPose(n.gripSpace,s),f!==null&&(m.matrix.fromArray(f.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,f.linearVelocity?(m.hasLinearVelocity=!0,m.linearVelocity.copy(f.linearVelocity)):m.hasLinearVelocity=!1,f.angularVelocity?(m.hasAngularVelocity=!0,m.angularVelocity.copy(f.angularVelocity)):m.hasAngularVelocity=!1));d!==null&&(c=a.getPose(n.targetRaySpace,s),c===null&&f!==null&&(c=f),c!==null&&(d.matrix.fromArray(c.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,c.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(c.linearVelocity)):d.hasLinearVelocity=!1,c.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(c.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(TR)))}return d!==null&&(d.visible=c!==null),m!==null&&(m.visible=f!==null),_!==null&&(_.visible=h!==null),this}_getHandJoint(n,a){if(n.joints[a.jointName]===void 0){const s=new vu;s.matrixAutoUpdate=!1,s.visible=!1,n.joints[a.jointName]=s,n.add(s)}return n.joints[a.jointName]}}const bR=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,AR=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class RR{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,a,s){if(this.texture===null){const c=new fi,f=n.properties.get(c);f.__webglTexture=a.texture,(a.depthNear!=s.depthNear||a.depthFar!=s.depthFar)&&(this.depthNear=a.depthNear,this.depthFar=a.depthFar),this.texture=c}}getMesh(n){if(this.texture!==null&&this.mesh===null){const a=n.cameras[0].viewport,s=new Ki({vertexShader:bR,fragmentShader:AR,uniforms:{depthColor:{value:this.texture},depthWidth:{value:a.z},depthHeight:{value:a.w}}});this.mesh=new Ba(new Ou(20,20),s)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class CR extends Mo{constructor(n,a){super();const s=this;let c=null,f=1,h=null,d="local-floor",m=1,_=null,g=null,p=null,x=null,M=null,T=null;const R=new RR,S=a.getContextAttributes();let y=null,P=null;const O=[],N=[],et=new an;let V=null;const I=new Oi;I.viewport=new Mn;const q=new Oi;q.viewport=new Mn;const U=[I,q],C=new ER;let B=null,at=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(A){let k=O[A];return k===void 0&&(k=new Gd,O[A]=k),k.getTargetRaySpace()},this.getControllerGrip=function(A){let k=O[A];return k===void 0&&(k=new Gd,O[A]=k),k.getGripSpace()},this.getHand=function(A){let k=O[A];return k===void 0&&(k=new Gd,O[A]=k),k.getHandSpace()};function ot(A){const k=N.indexOf(A.inputSource);if(k===-1)return;const H=O[k];H!==void 0&&(H.update(A.inputSource,A.frame,_||h),H.dispatchEvent({type:A.type,data:A.inputSource}))}function ht(){c.removeEventListener("select",ot),c.removeEventListener("selectstart",ot),c.removeEventListener("selectend",ot),c.removeEventListener("squeeze",ot),c.removeEventListener("squeezestart",ot),c.removeEventListener("squeezeend",ot),c.removeEventListener("end",ht),c.removeEventListener("inputsourceschange",gt);for(let A=0;A<O.length;A++){const k=N[A];k!==null&&(N[A]=null,O[A].disconnect(k))}B=null,at=null,R.reset(),n.setRenderTarget(y),M=null,x=null,p=null,c=null,P=null,pt.stop(),s.isPresenting=!1,n.setPixelRatio(V),n.setSize(et.width,et.height,!1),s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(A){f=A,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(A){d=A,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return _||h},this.setReferenceSpace=function(A){_=A},this.getBaseLayer=function(){return x!==null?x:M},this.getBinding=function(){return p},this.getFrame=function(){return T},this.getSession=function(){return c},this.setSession=async function(A){if(c=A,c!==null){if(y=n.getRenderTarget(),c.addEventListener("select",ot),c.addEventListener("selectstart",ot),c.addEventListener("selectend",ot),c.addEventListener("squeeze",ot),c.addEventListener("squeezestart",ot),c.addEventListener("squeezeend",ot),c.addEventListener("end",ht),c.addEventListener("inputsourceschange",gt),S.xrCompatible!==!0&&await a.makeXRCompatible(),V=n.getPixelRatio(),n.getSize(et),c.renderState.layers===void 0){const k={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:f};M=new XRWebGLLayer(c,a,k),c.updateRenderState({baseLayer:M}),n.setPixelRatio(1),n.setSize(M.framebufferWidth,M.framebufferHeight,!1),P=new ls(M.framebufferWidth,M.framebufferHeight,{format:Yi,type:Ga,colorSpace:n.outputColorSpace,stencilBuffer:S.stencil})}else{let k=null,H=null,W=null;S.depth&&(W=S.stencil?a.DEPTH24_STENCIL8:a.DEPTH_COMPONENT24,k=S.stencil?xo:ho,H=S.stencil?_o:os);const mt={colorFormat:a.RGBA8,depthFormat:W,scaleFactor:f};p=new XRWebGLBinding(c,a),x=p.createProjectionLayer(mt),c.updateRenderState({layers:[x]}),n.setPixelRatio(1),n.setSize(x.textureWidth,x.textureHeight,!1),P=new ls(x.textureWidth,x.textureHeight,{format:Yi,type:Ga,depthTexture:new zx(x.textureWidth,x.textureHeight,H,void 0,void 0,void 0,void 0,void 0,void 0,k),stencilBuffer:S.stencil,colorSpace:n.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:x.ignoreDepthValues===!1})}P.isXRRenderTarget=!0,this.setFoveation(m),_=null,h=await c.requestReferenceSpace(d),pt.setContext(c),pt.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(c!==null)return c.environmentBlendMode},this.getDepthTexture=function(){return R.getDepthTexture()};function gt(A){for(let k=0;k<A.removed.length;k++){const H=A.removed[k],W=N.indexOf(H);W>=0&&(N[W]=null,O[W].disconnect(H))}for(let k=0;k<A.added.length;k++){const H=A.added[k];let W=N.indexOf(H);if(W===-1){for(let _t=0;_t<O.length;_t++)if(_t>=N.length){N.push(H),W=_t;break}else if(N[_t]===null){N[_t]=H,W=_t;break}if(W===-1)break}const mt=O[W];mt&&mt.connect(H)}}const X=new ft,rt=new ft;function Z(A,k,H){X.setFromMatrixPosition(k.matrixWorld),rt.setFromMatrixPosition(H.matrixWorld);const W=X.distanceTo(rt),mt=k.projectionMatrix.elements,_t=H.projectionMatrix.elements,At=mt[14]/(mt[10]-1),Ct=mt[14]/(mt[10]+1),Ut=(mt[9]+1)/mt[5],re=(mt[9]-1)/mt[5],j=(mt[8]-1)/mt[0],Fe=(_t[8]+1)/_t[0],le=At*j,ae=At*Fe,Ft=W/(-j+Fe),Se=Ft*-j;if(k.matrixWorld.decompose(A.position,A.quaternion,A.scale),A.translateX(Se),A.translateZ(Ft),A.matrixWorld.compose(A.position,A.quaternion,A.scale),A.matrixWorldInverse.copy(A.matrixWorld).invert(),mt[10]===-1)A.projectionMatrix.copy(k.projectionMatrix),A.projectionMatrixInverse.copy(k.projectionMatrixInverse);else{const ne=At+Ft,L=Ct+Ft,b=le-Se,it=ae+(W-Se),xt=Ut*Ct/L*ne,Rt=re*Ct/L*ne;A.projectionMatrix.makePerspective(b,it,xt,Rt,ne,L),A.projectionMatrixInverse.copy(A.projectionMatrix).invert()}}function St(A,k){k===null?A.matrixWorld.copy(A.matrix):A.matrixWorld.multiplyMatrices(k.matrixWorld,A.matrix),A.matrixWorldInverse.copy(A.matrixWorld).invert()}this.updateCamera=function(A){if(c===null)return;let k=A.near,H=A.far;R.texture!==null&&(R.depthNear>0&&(k=R.depthNear),R.depthFar>0&&(H=R.depthFar)),C.near=q.near=I.near=k,C.far=q.far=I.far=H,(B!==C.near||at!==C.far)&&(c.updateRenderState({depthNear:C.near,depthFar:C.far}),B=C.near,at=C.far),I.layers.mask=A.layers.mask|2,q.layers.mask=A.layers.mask|4,C.layers.mask=I.layers.mask|q.layers.mask;const W=A.parent,mt=C.cameras;St(C,W);for(let _t=0;_t<mt.length;_t++)St(mt[_t],W);mt.length===2?Z(C,I,q):C.projectionMatrix.copy(I.projectionMatrix),bt(A,C,W)};function bt(A,k,H){H===null?A.matrix.copy(k.matrixWorld):(A.matrix.copy(H.matrixWorld),A.matrix.invert(),A.matrix.multiply(k.matrixWorld)),A.matrix.decompose(A.position,A.quaternion,A.scale),A.updateMatrixWorld(!0),A.projectionMatrix.copy(k.projectionMatrix),A.projectionMatrixInverse.copy(k.projectionMatrixInverse),A.isPerspectiveCamera&&(A.fov=Cp*2*Math.atan(1/A.projectionMatrix.elements[5]),A.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(x===null&&M===null))return m},this.setFoveation=function(A){m=A,x!==null&&(x.fixedFoveation=A),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=A)},this.hasDepthSensing=function(){return R.texture!==null},this.getDepthSensingMesh=function(){return R.getMesh(C)};let Vt=null;function ce(A,k){if(g=k.getViewerPose(_||h),T=k,g!==null){const H=g.views;M!==null&&(n.setRenderTargetFramebuffer(P,M.framebuffer),n.setRenderTarget(P));let W=!1;H.length!==C.cameras.length&&(C.cameras.length=0,W=!0);for(let _t=0;_t<H.length;_t++){const At=H[_t];let Ct=null;if(M!==null)Ct=M.getViewport(At);else{const re=p.getViewSubImage(x,At);Ct=re.viewport,_t===0&&(n.setRenderTargetTextures(P,re.colorTexture,x.ignoreDepthValues?void 0:re.depthStencilTexture),n.setRenderTarget(P))}let Ut=U[_t];Ut===void 0&&(Ut=new Oi,Ut.layers.enable(_t),Ut.viewport=new Mn,U[_t]=Ut),Ut.matrix.fromArray(At.transform.matrix),Ut.matrix.decompose(Ut.position,Ut.quaternion,Ut.scale),Ut.projectionMatrix.fromArray(At.projectionMatrix),Ut.projectionMatrixInverse.copy(Ut.projectionMatrix).invert(),Ut.viewport.set(Ct.x,Ct.y,Ct.width,Ct.height),_t===0&&(C.matrix.copy(Ut.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),W===!0&&C.cameras.push(Ut)}const mt=c.enabledFeatures;if(mt&&mt.includes("depth-sensing")){const _t=p.getDepthInformation(H[0]);_t&&_t.isValid&&_t.texture&&R.init(n,_t,c.renderState)}}for(let H=0;H<O.length;H++){const W=N[H],mt=O[H];W!==null&&mt!==void 0&&mt.update(W,k,_||h)}Vt&&Vt(A,k),k.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:k}),T=null}const pt=new Ox;pt.setAnimationLoop(ce),this.setAnimationLoop=function(A){Vt=A},this.dispose=function(){}}}const $r=new Va,wR=new _n;function DR(o,n){function a(S,y){S.matrixAutoUpdate===!0&&S.updateMatrix(),y.value.copy(S.matrix)}function s(S,y){y.color.getRGB(S.fogColor.value,Dx(o)),y.isFog?(S.fogNear.value=y.near,S.fogFar.value=y.far):y.isFogExp2&&(S.fogDensity.value=y.density)}function c(S,y,P,O,N){y.isMeshBasicMaterial||y.isMeshLambertMaterial?f(S,y):y.isMeshToonMaterial?(f(S,y),p(S,y)):y.isMeshPhongMaterial?(f(S,y),g(S,y)):y.isMeshStandardMaterial?(f(S,y),x(S,y),y.isMeshPhysicalMaterial&&M(S,y,N)):y.isMeshMatcapMaterial?(f(S,y),T(S,y)):y.isMeshDepthMaterial?f(S,y):y.isMeshDistanceMaterial?(f(S,y),R(S,y)):y.isMeshNormalMaterial?f(S,y):y.isLineBasicMaterial?(h(S,y),y.isLineDashedMaterial&&d(S,y)):y.isPointsMaterial?m(S,y,P,O):y.isSpriteMaterial?_(S,y):y.isShadowMaterial?(S.color.value.copy(y.color),S.opacity.value=y.opacity):y.isShaderMaterial&&(y.uniformsNeedUpdate=!1)}function f(S,y){S.opacity.value=y.opacity,y.color&&S.diffuse.value.copy(y.color),y.emissive&&S.emissive.value.copy(y.emissive).multiplyScalar(y.emissiveIntensity),y.map&&(S.map.value=y.map,a(y.map,S.mapTransform)),y.alphaMap&&(S.alphaMap.value=y.alphaMap,a(y.alphaMap,S.alphaMapTransform)),y.bumpMap&&(S.bumpMap.value=y.bumpMap,a(y.bumpMap,S.bumpMapTransform),S.bumpScale.value=y.bumpScale,y.side===ui&&(S.bumpScale.value*=-1)),y.normalMap&&(S.normalMap.value=y.normalMap,a(y.normalMap,S.normalMapTransform),S.normalScale.value.copy(y.normalScale),y.side===ui&&S.normalScale.value.negate()),y.displacementMap&&(S.displacementMap.value=y.displacementMap,a(y.displacementMap,S.displacementMapTransform),S.displacementScale.value=y.displacementScale,S.displacementBias.value=y.displacementBias),y.emissiveMap&&(S.emissiveMap.value=y.emissiveMap,a(y.emissiveMap,S.emissiveMapTransform)),y.specularMap&&(S.specularMap.value=y.specularMap,a(y.specularMap,S.specularMapTransform)),y.alphaTest>0&&(S.alphaTest.value=y.alphaTest);const P=n.get(y),O=P.envMap,N=P.envMapRotation;O&&(S.envMap.value=O,$r.copy(N),$r.x*=-1,$r.y*=-1,$r.z*=-1,O.isCubeTexture&&O.isRenderTargetTexture===!1&&($r.y*=-1,$r.z*=-1),S.envMapRotation.value.setFromMatrix4(wR.makeRotationFromEuler($r)),S.flipEnvMap.value=O.isCubeTexture&&O.isRenderTargetTexture===!1?-1:1,S.reflectivity.value=y.reflectivity,S.ior.value=y.ior,S.refractionRatio.value=y.refractionRatio),y.lightMap&&(S.lightMap.value=y.lightMap,S.lightMapIntensity.value=y.lightMapIntensity,a(y.lightMap,S.lightMapTransform)),y.aoMap&&(S.aoMap.value=y.aoMap,S.aoMapIntensity.value=y.aoMapIntensity,a(y.aoMap,S.aoMapTransform))}function h(S,y){S.diffuse.value.copy(y.color),S.opacity.value=y.opacity,y.map&&(S.map.value=y.map,a(y.map,S.mapTransform))}function d(S,y){S.dashSize.value=y.dashSize,S.totalSize.value=y.dashSize+y.gapSize,S.scale.value=y.scale}function m(S,y,P,O){S.diffuse.value.copy(y.color),S.opacity.value=y.opacity,S.size.value=y.size*P,S.scale.value=O*.5,y.map&&(S.map.value=y.map,a(y.map,S.uvTransform)),y.alphaMap&&(S.alphaMap.value=y.alphaMap,a(y.alphaMap,S.alphaMapTransform)),y.alphaTest>0&&(S.alphaTest.value=y.alphaTest)}function _(S,y){S.diffuse.value.copy(y.color),S.opacity.value=y.opacity,S.rotation.value=y.rotation,y.map&&(S.map.value=y.map,a(y.map,S.mapTransform)),y.alphaMap&&(S.alphaMap.value=y.alphaMap,a(y.alphaMap,S.alphaMapTransform)),y.alphaTest>0&&(S.alphaTest.value=y.alphaTest)}function g(S,y){S.specular.value.copy(y.specular),S.shininess.value=Math.max(y.shininess,1e-4)}function p(S,y){y.gradientMap&&(S.gradientMap.value=y.gradientMap)}function x(S,y){S.metalness.value=y.metalness,y.metalnessMap&&(S.metalnessMap.value=y.metalnessMap,a(y.metalnessMap,S.metalnessMapTransform)),S.roughness.value=y.roughness,y.roughnessMap&&(S.roughnessMap.value=y.roughnessMap,a(y.roughnessMap,S.roughnessMapTransform)),y.envMap&&(S.envMapIntensity.value=y.envMapIntensity)}function M(S,y,P){S.ior.value=y.ior,y.sheen>0&&(S.sheenColor.value.copy(y.sheenColor).multiplyScalar(y.sheen),S.sheenRoughness.value=y.sheenRoughness,y.sheenColorMap&&(S.sheenColorMap.value=y.sheenColorMap,a(y.sheenColorMap,S.sheenColorMapTransform)),y.sheenRoughnessMap&&(S.sheenRoughnessMap.value=y.sheenRoughnessMap,a(y.sheenRoughnessMap,S.sheenRoughnessMapTransform))),y.clearcoat>0&&(S.clearcoat.value=y.clearcoat,S.clearcoatRoughness.value=y.clearcoatRoughness,y.clearcoatMap&&(S.clearcoatMap.value=y.clearcoatMap,a(y.clearcoatMap,S.clearcoatMapTransform)),y.clearcoatRoughnessMap&&(S.clearcoatRoughnessMap.value=y.clearcoatRoughnessMap,a(y.clearcoatRoughnessMap,S.clearcoatRoughnessMapTransform)),y.clearcoatNormalMap&&(S.clearcoatNormalMap.value=y.clearcoatNormalMap,a(y.clearcoatNormalMap,S.clearcoatNormalMapTransform),S.clearcoatNormalScale.value.copy(y.clearcoatNormalScale),y.side===ui&&S.clearcoatNormalScale.value.negate())),y.dispersion>0&&(S.dispersion.value=y.dispersion),y.iridescence>0&&(S.iridescence.value=y.iridescence,S.iridescenceIOR.value=y.iridescenceIOR,S.iridescenceThicknessMinimum.value=y.iridescenceThicknessRange[0],S.iridescenceThicknessMaximum.value=y.iridescenceThicknessRange[1],y.iridescenceMap&&(S.iridescenceMap.value=y.iridescenceMap,a(y.iridescenceMap,S.iridescenceMapTransform)),y.iridescenceThicknessMap&&(S.iridescenceThicknessMap.value=y.iridescenceThicknessMap,a(y.iridescenceThicknessMap,S.iridescenceThicknessMapTransform))),y.transmission>0&&(S.transmission.value=y.transmission,S.transmissionSamplerMap.value=P.texture,S.transmissionSamplerSize.value.set(P.width,P.height),y.transmissionMap&&(S.transmissionMap.value=y.transmissionMap,a(y.transmissionMap,S.transmissionMapTransform)),S.thickness.value=y.thickness,y.thicknessMap&&(S.thicknessMap.value=y.thicknessMap,a(y.thicknessMap,S.thicknessMapTransform)),S.attenuationDistance.value=y.attenuationDistance,S.attenuationColor.value.copy(y.attenuationColor)),y.anisotropy>0&&(S.anisotropyVector.value.set(y.anisotropy*Math.cos(y.anisotropyRotation),y.anisotropy*Math.sin(y.anisotropyRotation)),y.anisotropyMap&&(S.anisotropyMap.value=y.anisotropyMap,a(y.anisotropyMap,S.anisotropyMapTransform))),S.specularIntensity.value=y.specularIntensity,S.specularColor.value.copy(y.specularColor),y.specularColorMap&&(S.specularColorMap.value=y.specularColorMap,a(y.specularColorMap,S.specularColorMapTransform)),y.specularIntensityMap&&(S.specularIntensityMap.value=y.specularIntensityMap,a(y.specularIntensityMap,S.specularIntensityMapTransform))}function T(S,y){y.matcap&&(S.matcap.value=y.matcap)}function R(S,y){const P=n.get(y).light;S.referencePosition.value.setFromMatrixPosition(P.matrixWorld),S.nearDistance.value=P.shadow.camera.near,S.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:c}}function UR(o,n,a,s){let c={},f={},h=[];const d=o.getParameter(o.MAX_UNIFORM_BUFFER_BINDINGS);function m(P,O){const N=O.program;s.uniformBlockBinding(P,N)}function _(P,O){let N=c[P.id];N===void 0&&(T(P),N=g(P),c[P.id]=N,P.addEventListener("dispose",S));const et=O.program;s.updateUBOMapping(P,et);const V=n.render.frame;f[P.id]!==V&&(x(P),f[P.id]=V)}function g(P){const O=p();P.__bindingPointIndex=O;const N=o.createBuffer(),et=P.__size,V=P.usage;return o.bindBuffer(o.UNIFORM_BUFFER,N),o.bufferData(o.UNIFORM_BUFFER,et,V),o.bindBuffer(o.UNIFORM_BUFFER,null),o.bindBufferBase(o.UNIFORM_BUFFER,O,N),N}function p(){for(let P=0;P<d;P++)if(h.indexOf(P)===-1)return h.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function x(P){const O=c[P.id],N=P.uniforms,et=P.__cache;o.bindBuffer(o.UNIFORM_BUFFER,O);for(let V=0,I=N.length;V<I;V++){const q=Array.isArray(N[V])?N[V]:[N[V]];for(let U=0,C=q.length;U<C;U++){const B=q[U];if(M(B,V,U,et)===!0){const at=B.__offset,ot=Array.isArray(B.value)?B.value:[B.value];let ht=0;for(let gt=0;gt<ot.length;gt++){const X=ot[gt],rt=R(X);typeof X=="number"||typeof X=="boolean"?(B.__data[0]=X,o.bufferSubData(o.UNIFORM_BUFFER,at+ht,B.__data)):X.isMatrix3?(B.__data[0]=X.elements[0],B.__data[1]=X.elements[1],B.__data[2]=X.elements[2],B.__data[3]=0,B.__data[4]=X.elements[3],B.__data[5]=X.elements[4],B.__data[6]=X.elements[5],B.__data[7]=0,B.__data[8]=X.elements[6],B.__data[9]=X.elements[7],B.__data[10]=X.elements[8],B.__data[11]=0):(X.toArray(B.__data,ht),ht+=rt.storage/Float32Array.BYTES_PER_ELEMENT)}o.bufferSubData(o.UNIFORM_BUFFER,at,B.__data)}}}o.bindBuffer(o.UNIFORM_BUFFER,null)}function M(P,O,N,et){const V=P.value,I=O+"_"+N;if(et[I]===void 0)return typeof V=="number"||typeof V=="boolean"?et[I]=V:et[I]=V.clone(),!0;{const q=et[I];if(typeof V=="number"||typeof V=="boolean"){if(q!==V)return et[I]=V,!0}else if(q.equals(V)===!1)return q.copy(V),!0}return!1}function T(P){const O=P.uniforms;let N=0;const et=16;for(let I=0,q=O.length;I<q;I++){const U=Array.isArray(O[I])?O[I]:[O[I]];for(let C=0,B=U.length;C<B;C++){const at=U[C],ot=Array.isArray(at.value)?at.value:[at.value];for(let ht=0,gt=ot.length;ht<gt;ht++){const X=ot[ht],rt=R(X),Z=N%et,St=Z%rt.boundary,bt=Z+St;N+=St,bt!==0&&et-bt<rt.storage&&(N+=et-bt),at.__data=new Float32Array(rt.storage/Float32Array.BYTES_PER_ELEMENT),at.__offset=N,N+=rt.storage}}}const V=N%et;return V>0&&(N+=et-V),P.__size=N,P.__cache={},this}function R(P){const O={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(O.boundary=4,O.storage=4):P.isVector2?(O.boundary=8,O.storage=8):P.isVector3||P.isColor?(O.boundary=16,O.storage=12):P.isVector4?(O.boundary=16,O.storage=16):P.isMatrix3?(O.boundary=48,O.storage=48):P.isMatrix4?(O.boundary=64,O.storage=64):P.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",P),O}function S(P){const O=P.target;O.removeEventListener("dispose",S);const N=h.indexOf(O.__bindingPointIndex);h.splice(N,1),o.deleteBuffer(c[O.id]),delete c[O.id],delete f[O.id]}function y(){for(const P in c)o.deleteBuffer(c[P]);h=[],c={},f={}}return{bind:m,update:_,dispose:y}}class NR{constructor(n={}){const{canvas:a=xE(),context:s=null,depth:c=!0,stencil:f=!1,alpha:h=!1,antialias:d=!1,premultipliedAlpha:m=!0,preserveDrawingBuffer:_=!1,powerPreference:g="default",failIfMajorPerformanceCaveat:p=!1,reverseDepthBuffer:x=!1}=n;this.isWebGLRenderer=!0;let M;if(s!==null){if(typeof WebGLRenderingContext<"u"&&s instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=s.getContextAttributes().alpha}else M=h;const T=new Uint32Array(4),R=new Int32Array(4);let S=null,y=null;const P=[],O=[];this.domElement=a,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Li,this.toneMapping=br,this.toneMappingExposure=1;const N=this;let et=!1,V=0,I=0,q=null,U=-1,C=null;const B=new Mn,at=new Mn;let ot=null;const ht=new ke(0);let gt=0,X=a.width,rt=a.height,Z=1,St=null,bt=null;const Vt=new Mn(0,0,X,rt),ce=new Mn(0,0,X,rt);let pt=!1;const A=new Lx;let k=!1,H=!1;const W=new _n,mt=new _n,_t=new ft,At=new Mn,Ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ut=!1;function re(){return q===null?Z:1}let j=s;function Fe(w,Q){return a.getContext(w,Q)}try{const w={alpha:!0,depth:c,stencil:f,antialias:d,premultipliedAlpha:m,preserveDrawingBuffer:_,powerPreference:g,failIfMajorPerformanceCaveat:p};if("setAttribute"in a&&a.setAttribute("data-engine",`three.js r${Lp}`),a.addEventListener("webglcontextlost",Tt,!1),a.addEventListener("webglcontextrestored",zt,!1),a.addEventListener("webglcontextcreationerror",Gt,!1),j===null){const Q="webgl2";if(j=Fe(Q,w),j===null)throw Fe(Q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let le,ae,Ft,Se,ne,L,b,it,xt,Rt,Et,qt,vt,Ht,Te,Nt,Yt,te,ue,jt,ye,xe,we,F;function wt(){le=new Ib(j),le.init(),xe=new MR(j,le),ae=new Db(j,le,n,xe),Ft=new xR(j,le),ae.reverseDepthBuffer&&x&&Ft.buffers.depth.setReversed(!0),Se=new Hb(j),ne=new aR,L=new SR(j,le,Ft,ne,ae,xe,Se),b=new Nb(N),it=new Pb(N),xt=new qE(j),we=new Cb(j,xt),Rt=new Bb(j,xt,Se,we),Et=new Vb(j,Rt,xt,Se),ue=new Gb(j,ae,L),Nt=new Ub(ne),qt=new iR(N,b,it,le,ae,we,Nt),vt=new DR(N,ne),Ht=new sR,Te=new hR(le),te=new Rb(N,b,it,Ft,Et,M,m),Yt=new vR(N,Et,ae),F=new UR(j,Se,ae,Ft),jt=new wb(j,le,Se),ye=new Fb(j,le,Se),Se.programs=qt.programs,N.capabilities=ae,N.extensions=le,N.properties=ne,N.renderLists=Ht,N.shadowMap=Yt,N.state=Ft,N.info=Se}wt();const ut=new CR(N,j);this.xr=ut,this.getContext=function(){return j},this.getContextAttributes=function(){return j.getContextAttributes()},this.forceContextLoss=function(){const w=le.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=le.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(w){w!==void 0&&(Z=w,this.setSize(X,rt,!1))},this.getSize=function(w){return w.set(X,rt)},this.setSize=function(w,Q,lt=!0){if(ut.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=w,rt=Q,a.width=Math.floor(w*Z),a.height=Math.floor(Q*Z),lt===!0&&(a.style.width=w+"px",a.style.height=Q+"px"),this.setViewport(0,0,w,Q)},this.getDrawingBufferSize=function(w){return w.set(X*Z,rt*Z).floor()},this.setDrawingBufferSize=function(w,Q,lt){X=w,rt=Q,Z=lt,a.width=Math.floor(w*lt),a.height=Math.floor(Q*lt),this.setViewport(0,0,w,Q)},this.getCurrentViewport=function(w){return w.copy(B)},this.getViewport=function(w){return w.copy(Vt)},this.setViewport=function(w,Q,lt,ct){w.isVector4?Vt.set(w.x,w.y,w.z,w.w):Vt.set(w,Q,lt,ct),Ft.viewport(B.copy(Vt).multiplyScalar(Z).round())},this.getScissor=function(w){return w.copy(ce)},this.setScissor=function(w,Q,lt,ct){w.isVector4?ce.set(w.x,w.y,w.z,w.w):ce.set(w,Q,lt,ct),Ft.scissor(at.copy(ce).multiplyScalar(Z).round())},this.getScissorTest=function(){return pt},this.setScissorTest=function(w){Ft.setScissorTest(pt=w)},this.setOpaqueSort=function(w){St=w},this.setTransparentSort=function(w){bt=w},this.getClearColor=function(w){return w.copy(te.getClearColor())},this.setClearColor=function(){te.setClearColor.apply(te,arguments)},this.getClearAlpha=function(){return te.getClearAlpha()},this.setClearAlpha=function(){te.setClearAlpha.apply(te,arguments)},this.clear=function(w=!0,Q=!0,lt=!0){let ct=0;if(w){let $=!1;if(q!==null){const Lt=q.texture.format;$=Lt===Fp||Lt===Bp||Lt===Ip}if($){const Lt=q.texture.type,Pt=Lt===Ga||Lt===os||Lt===bl||Lt===_o||Lt===zp||Lt===Pp,Zt=te.getClearColor(),Qt=te.getClearAlpha(),ie=Zt.r,ee=Zt.g,Xt=Zt.b;Pt?(T[0]=ie,T[1]=ee,T[2]=Xt,T[3]=Qt,j.clearBufferuiv(j.COLOR,0,T)):(R[0]=ie,R[1]=ee,R[2]=Xt,R[3]=Qt,j.clearBufferiv(j.COLOR,0,R))}else ct|=j.COLOR_BUFFER_BIT}Q&&(ct|=j.DEPTH_BUFFER_BIT),lt&&(ct|=j.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j.clear(ct)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){a.removeEventListener("webglcontextlost",Tt,!1),a.removeEventListener("webglcontextrestored",zt,!1),a.removeEventListener("webglcontextcreationerror",Gt,!1),Ht.dispose(),Te.dispose(),ne.dispose(),b.dispose(),it.dispose(),Et.dispose(),we.dispose(),F.dispose(),qt.dispose(),ut.dispose(),ut.removeEventListener("sessionstart",fn),ut.removeEventListener("sessionend",Xa),zi.stop()};function Tt(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),et=!0}function zt(){console.log("THREE.WebGLRenderer: Context Restored."),et=!1;const w=Se.autoReset,Q=Yt.enabled,lt=Yt.autoUpdate,ct=Yt.needsUpdate,$=Yt.type;wt(),Se.autoReset=w,Yt.enabled=Q,Yt.autoUpdate=lt,Yt.needsUpdate=ct,Yt.type=$}function Gt(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function fe(w){const Q=w.target;Q.removeEventListener("dispose",fe),$e(Q)}function $e(w){cn(w),ne.remove(w)}function cn(w){const Q=ne.get(w).programs;Q!==void 0&&(Q.forEach(function(lt){qt.releaseProgram(lt)}),w.isShaderMaterial&&qt.releaseShaderCache(w))}this.renderBufferDirect=function(w,Q,lt,ct,$,Lt){Q===null&&(Q=Ct);const Pt=$.isMesh&&$.matrixWorld.determinant()<0,Zt=bo(w,Q,lt,ct,$);Ft.setMaterial(ct,Pt);let Qt=lt.index,ie=1;if(ct.wireframe===!0){if(Qt=Rt.getWireframeAttribute(lt),Qt===void 0)return;ie=2}const ee=lt.drawRange,Xt=lt.attributes.position;let be=ee.start*ie,je=(ee.start+ee.count)*ie;Lt!==null&&(be=Math.max(be,Lt.start*ie),je=Math.min(je,(Lt.start+Lt.count)*ie)),Qt!==null?(be=Math.max(be,0),je=Math.min(je,Qt.count)):Xt!=null&&(be=Math.max(be,0),je=Math.min(je,Xt.count));const Ye=je-be;if(Ye<0||Ye===1/0)return;we.setup($,ct,Zt,lt,Qt);let un,Ue=jt;if(Qt!==null&&(un=xt.get(Qt),Ue=ye,Ue.setIndex(un)),$.isMesh)ct.wireframe===!0?(Ft.setLineWidth(ct.wireframeLinewidth*re()),Ue.setMode(j.LINES)):Ue.setMode(j.TRIANGLES);else if($.isLine){let Jt=ct.linewidth;Jt===void 0&&(Jt=1),Ft.setLineWidth(Jt*re()),$.isLineSegments?Ue.setMode(j.LINES):$.isLineLoop?Ue.setMode(j.LINE_LOOP):Ue.setMode(j.LINE_STRIP)}else $.isPoints?Ue.setMode(j.POINTS):$.isSprite&&Ue.setMode(j.TRIANGLES);if($.isBatchedMesh)if($._multiDrawInstances!==null)Ue.renderMultiDrawInstances($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount,$._multiDrawInstances);else if(le.get("WEBGL_multi_draw"))Ue.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{const Jt=$._multiDrawStarts,hn=$._multiDrawCounts,Ne=$._multiDrawCount,sn=Qt?xt.get(Qt).bytesPerElement:1,kn=ne.get(ct).currentProgram.getUniforms();for(let xn=0;xn<Ne;xn++)kn.setValue(j,"_gl_DrawID",xn),Ue.render(Jt[xn]/sn,hn[xn])}else if($.isInstancedMesh)Ue.renderInstances(be,Ye,$.count);else if(lt.isInstancedBufferGeometry){const Jt=lt._maxInstanceCount!==void 0?lt._maxInstanceCount:1/0,hn=Math.min(lt.instanceCount,Jt);Ue.renderInstances(be,Ye,hn)}else Ue.render(be,Ye)};function De(w,Q,lt){w.transparent===!0&&w.side===za&&w.forceSinglePass===!1?(w.side=ui,w.needsUpdate=!0,ei(w,Q,lt),w.side=Ar,w.needsUpdate=!0,ei(w,Q,lt),w.side=za):ei(w,Q,lt)}this.compile=function(w,Q,lt=null){lt===null&&(lt=w),y=Te.get(lt),y.init(Q),O.push(y),lt.traverseVisible(function($){$.isLight&&$.layers.test(Q.layers)&&(y.pushLight($),$.castShadow&&y.pushShadow($))}),w!==lt&&w.traverseVisible(function($){$.isLight&&$.layers.test(Q.layers)&&(y.pushLight($),$.castShadow&&y.pushShadow($))}),y.setupLights();const ct=new Set;return w.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;const Lt=$.material;if(Lt)if(Array.isArray(Lt))for(let Pt=0;Pt<Lt.length;Pt++){const Zt=Lt[Pt];De(Zt,lt,$),ct.add(Zt)}else De(Lt,lt,$),ct.add(Lt)}),O.pop(),y=null,ct},this.compileAsync=function(w,Q,lt=null){const ct=this.compile(w,Q,lt);return new Promise($=>{function Lt(){if(ct.forEach(function(Pt){ne.get(Pt).currentProgram.isReady()&&ct.delete(Pt)}),ct.size===0){$(w);return}setTimeout(Lt,10)}le.get("KHR_parallel_shader_compile")!==null?Lt():setTimeout(Lt,10)})};let Xe=null;function rn(w){Xe&&Xe(w)}function fn(){zi.stop()}function Xa(){zi.start()}const zi=new Ox;zi.setAnimationLoop(rn),typeof self<"u"&&zi.setContext(self),this.setAnimationLoop=function(w){Xe=w,ut.setAnimationLoop(w),w===null?zi.stop():zi.start()},ut.addEventListener("sessionstart",fn),ut.addEventListener("sessionend",Xa),this.render=function(w,Q){if(Q!==void 0&&Q.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(et===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),Q.parent===null&&Q.matrixWorldAutoUpdate===!0&&Q.updateMatrixWorld(),ut.enabled===!0&&ut.isPresenting===!0&&(ut.cameraAutoUpdate===!0&&ut.updateCamera(Q),Q=ut.getCamera()),w.isScene===!0&&w.onBeforeRender(N,w,Q,q),y=Te.get(w,O.length),y.init(Q),O.push(y),mt.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),A.setFromProjectionMatrix(mt),H=this.localClippingEnabled,k=Nt.init(this.clippingPlanes,H),S=Ht.get(w,P.length),S.init(),P.push(S),ut.enabled===!0&&ut.isPresenting===!0){const Lt=N.xr.getDepthSensingMesh();Lt!==null&&pa(Lt,Q,-1/0,N.sortObjects)}pa(w,Q,0,N.sortObjects),S.finish(),N.sortObjects===!0&&S.sort(St,bt),Ut=ut.enabled===!1||ut.isPresenting===!1||ut.hasDepthSensing()===!1,Ut&&te.addToRenderList(S,w),this.info.render.frame++,k===!0&&Nt.beginShadows();const lt=y.state.shadowsArray;Yt.render(lt,w,Q),k===!0&&Nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const ct=S.opaque,$=S.transmissive;if(y.setupLights(),Q.isArrayCamera){const Lt=Q.cameras;if($.length>0)for(let Pt=0,Zt=Lt.length;Pt<Zt;Pt++){const Qt=Lt[Pt];Ji(ct,$,w,Qt)}Ut&&te.render(w);for(let Pt=0,Zt=Lt.length;Pt<Zt;Pt++){const Qt=Lt[Pt];Mi(S,w,Qt,Qt.viewport)}}else $.length>0&&Ji(ct,$,w,Q),Ut&&te.render(w),Mi(S,w,Q);q!==null&&(L.updateMultisampleRenderTarget(q),L.updateRenderTargetMipmap(q)),w.isScene===!0&&w.onAfterRender(N,w,Q),we.resetDefaultState(),U=-1,C=null,O.pop(),O.length>0?(y=O[O.length-1],k===!0&&Nt.setGlobalState(N.clippingPlanes,y.state.camera)):y=null,P.pop(),P.length>0?S=P[P.length-1]:S=null};function pa(w,Q,lt,ct){if(w.visible===!1)return;if(w.layers.test(Q.layers)){if(w.isGroup)lt=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(Q);else if(w.isLight)y.pushLight(w),w.castShadow&&y.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||A.intersectsSprite(w)){ct&&At.setFromMatrixPosition(w.matrixWorld).applyMatrix4(mt);const Pt=Et.update(w),Zt=w.material;Zt.visible&&S.push(w,Pt,Zt,lt,At.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||A.intersectsObject(w))){const Pt=Et.update(w),Zt=w.material;if(ct&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),At.copy(w.boundingSphere.center)):(Pt.boundingSphere===null&&Pt.computeBoundingSphere(),At.copy(Pt.boundingSphere.center)),At.applyMatrix4(w.matrixWorld).applyMatrix4(mt)),Array.isArray(Zt)){const Qt=Pt.groups;for(let ie=0,ee=Qt.length;ie<ee;ie++){const Xt=Qt[ie],be=Zt[Xt.materialIndex];be&&be.visible&&S.push(w,Pt,be,lt,At.z,Xt)}}else Zt.visible&&S.push(w,Pt,Zt,lt,At.z,null)}}const Lt=w.children;for(let Pt=0,Zt=Lt.length;Pt<Zt;Pt++)pa(Lt[Pt],Q,lt,ct)}function Mi(w,Q,lt,ct){const $=w.opaque,Lt=w.transmissive,Pt=w.transparent;y.setupLightsView(lt),k===!0&&Nt.setGlobalState(N.clippingPlanes,lt),ct&&Ft.viewport(B.copy(ct)),$.length>0&&Pi($,Q,lt),Lt.length>0&&Pi(Lt,Q,lt),Pt.length>0&&Pi(Pt,Q,lt),Ft.buffers.depth.setTest(!0),Ft.buffers.depth.setMask(!0),Ft.buffers.color.setMask(!0),Ft.setPolygonOffset(!1)}function Ji(w,Q,lt,ct){if((lt.isScene===!0?lt.overrideMaterial:null)!==null)return;y.state.transmissionRenderTarget[ct.id]===void 0&&(y.state.transmissionRenderTarget[ct.id]=new ls(1,1,{generateMipmaps:!0,type:le.has("EXT_color_buffer_half_float")||le.has("EXT_color_buffer_float")?Al:Ga,minFilter:rs,samples:4,stencilBuffer:f,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ve.workingColorSpace}));const Lt=y.state.transmissionRenderTarget[ct.id],Pt=ct.viewport||B;Lt.setSize(Pt.z,Pt.w);const Zt=N.getRenderTarget();N.setRenderTarget(Lt),N.getClearColor(ht),gt=N.getClearAlpha(),gt<1&&N.setClearColor(16777215,.5),N.clear(),Ut&&te.render(lt);const Qt=N.toneMapping;N.toneMapping=br;const ie=ct.viewport;if(ct.viewport!==void 0&&(ct.viewport=void 0),y.setupLightsView(ct),k===!0&&Nt.setGlobalState(N.clippingPlanes,ct),Pi(w,lt,ct),L.updateMultisampleRenderTarget(Lt),L.updateRenderTargetMipmap(Lt),le.has("WEBGL_multisampled_render_to_texture")===!1){let ee=!1;for(let Xt=0,be=Q.length;Xt<be;Xt++){const je=Q[Xt],Ye=je.object,un=je.geometry,Ue=je.material,Jt=je.group;if(Ue.side===za&&Ye.layers.test(ct.layers)){const hn=Ue.side;Ue.side=ui,Ue.needsUpdate=!0,hi(Ye,lt,ct,un,Ue,Jt),Ue.side=hn,Ue.needsUpdate=!0,ee=!0}}ee===!0&&(L.updateMultisampleRenderTarget(Lt),L.updateRenderTargetMipmap(Lt))}N.setRenderTarget(Zt),N.setClearColor(ht,gt),ie!==void 0&&(ct.viewport=ie),N.toneMapping=Qt}function Pi(w,Q,lt){const ct=Q.isScene===!0?Q.overrideMaterial:null;for(let $=0,Lt=w.length;$<Lt;$++){const Pt=w[$],Zt=Pt.object,Qt=Pt.geometry,ie=ct===null?Pt.material:ct,ee=Pt.group;Zt.layers.test(lt.layers)&&hi(Zt,Q,lt,Qt,ie,ee)}}function hi(w,Q,lt,ct,$,Lt){w.onBeforeRender(N,Q,lt,ct,$,Lt),w.modelViewMatrix.multiplyMatrices(lt.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),$.onBeforeRender(N,Q,lt,ct,w,Lt),$.transparent===!0&&$.side===za&&$.forceSinglePass===!1?($.side=ui,$.needsUpdate=!0,N.renderBufferDirect(lt,Q,ct,$,w,Lt),$.side=Ar,$.needsUpdate=!0,N.renderBufferDirect(lt,Q,ct,$,w,Lt),$.side=za):N.renderBufferDirect(lt,Q,ct,$,w,Lt),w.onAfterRender(N,Q,lt,ct,$,Lt)}function ei(w,Q,lt){Q.isScene!==!0&&(Q=Ct);const ct=ne.get(w),$=y.state.lights,Lt=y.state.shadowsArray,Pt=$.state.version,Zt=qt.getParameters(w,$.state,Lt,Q,lt),Qt=qt.getProgramCacheKey(Zt);let ie=ct.programs;ct.environment=w.isMeshStandardMaterial?Q.environment:null,ct.fog=Q.fog,ct.envMap=(w.isMeshStandardMaterial?it:b).get(w.envMap||ct.environment),ct.envMapRotation=ct.environment!==null&&w.envMap===null?Q.environmentRotation:w.envMapRotation,ie===void 0&&(w.addEventListener("dispose",fe),ie=new Map,ct.programs=ie);let ee=ie.get(Qt);if(ee!==void 0){if(ct.currentProgram===ee&&ct.lightsStateVersion===Pt)return ka(w,Zt),ee}else Zt.uniforms=qt.getUniforms(w),w.onBeforeCompile(Zt,N),ee=qt.acquireProgram(Zt,Qt),ie.set(Qt,ee),ct.uniforms=Zt.uniforms;const Xt=ct.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Xt.clippingPlanes=Nt.uniform),ka(w,Zt),ct.needsLights=Rr(w),ct.lightsStateVersion=Pt,ct.needsLights&&(Xt.ambientLightColor.value=$.state.ambient,Xt.lightProbe.value=$.state.probe,Xt.directionalLights.value=$.state.directional,Xt.directionalLightShadows.value=$.state.directionalShadow,Xt.spotLights.value=$.state.spot,Xt.spotLightShadows.value=$.state.spotShadow,Xt.rectAreaLights.value=$.state.rectArea,Xt.ltc_1.value=$.state.rectAreaLTC1,Xt.ltc_2.value=$.state.rectAreaLTC2,Xt.pointLights.value=$.state.point,Xt.pointLightShadows.value=$.state.pointShadow,Xt.hemisphereLights.value=$.state.hemi,Xt.directionalShadowMap.value=$.state.directionalShadowMap,Xt.directionalShadowMatrix.value=$.state.directionalShadowMatrix,Xt.spotShadowMap.value=$.state.spotShadowMap,Xt.spotLightMatrix.value=$.state.spotLightMatrix,Xt.spotLightMap.value=$.state.spotLightMap,Xt.pointShadowMap.value=$.state.pointShadowMap,Xt.pointShadowMatrix.value=$.state.pointShadowMatrix),ct.currentProgram=ee,ct.uniformsList=null,ee}function $i(w){if(w.uniformsList===null){const Q=w.currentProgram.getUniforms();w.uniformsList=Ru.seqWithValue(Q.seq,w.uniforms)}return w.uniformsList}function ka(w,Q){const lt=ne.get(w);lt.outputColorSpace=Q.outputColorSpace,lt.batching=Q.batching,lt.batchingColor=Q.batchingColor,lt.instancing=Q.instancing,lt.instancingColor=Q.instancingColor,lt.instancingMorph=Q.instancingMorph,lt.skinning=Q.skinning,lt.morphTargets=Q.morphTargets,lt.morphNormals=Q.morphNormals,lt.morphColors=Q.morphColors,lt.morphTargetsCount=Q.morphTargetsCount,lt.numClippingPlanes=Q.numClippingPlanes,lt.numIntersection=Q.numClipIntersection,lt.vertexAlphas=Q.vertexAlphas,lt.vertexTangents=Q.vertexTangents,lt.toneMapping=Q.toneMapping}function bo(w,Q,lt,ct,$){Q.isScene!==!0&&(Q=Ct),L.resetTextureUnits();const Lt=Q.fog,Pt=ct.isMeshStandardMaterial?Q.environment:null,Zt=q===null?N.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:So,Qt=(ct.isMeshStandardMaterial?it:b).get(ct.envMap||Pt),ie=ct.vertexColors===!0&&!!lt.attributes.color&&lt.attributes.color.itemSize===4,ee=!!lt.attributes.tangent&&(!!ct.normalMap||ct.anisotropy>0),Xt=!!lt.morphAttributes.position,be=!!lt.morphAttributes.normal,je=!!lt.morphAttributes.color;let Ye=br;ct.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Ye=N.toneMapping);const un=lt.morphAttributes.position||lt.morphAttributes.normal||lt.morphAttributes.color,Ue=un!==void 0?un.length:0,Jt=ne.get(ct),hn=y.state.lights;if(k===!0&&(H===!0||w!==C)){const dt=w===C&&ct.id===U;Nt.setState(ct,w,dt)}let Ne=!1;ct.version===Jt.__version?(Jt.needsLights&&Jt.lightsStateVersion!==hn.state.version||Jt.outputColorSpace!==Zt||$.isBatchedMesh&&Jt.batching===!1||!$.isBatchedMesh&&Jt.batching===!0||$.isBatchedMesh&&Jt.batchingColor===!0&&$.colorTexture===null||$.isBatchedMesh&&Jt.batchingColor===!1&&$.colorTexture!==null||$.isInstancedMesh&&Jt.instancing===!1||!$.isInstancedMesh&&Jt.instancing===!0||$.isSkinnedMesh&&Jt.skinning===!1||!$.isSkinnedMesh&&Jt.skinning===!0||$.isInstancedMesh&&Jt.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&Jt.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&Jt.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&Jt.instancingMorph===!1&&$.morphTexture!==null||Jt.envMap!==Qt||ct.fog===!0&&Jt.fog!==Lt||Jt.numClippingPlanes!==void 0&&(Jt.numClippingPlanes!==Nt.numPlanes||Jt.numIntersection!==Nt.numIntersection)||Jt.vertexAlphas!==ie||Jt.vertexTangents!==ee||Jt.morphTargets!==Xt||Jt.morphNormals!==be||Jt.morphColors!==je||Jt.toneMapping!==Ye||Jt.morphTargetsCount!==Ue)&&(Ne=!0):(Ne=!0,Jt.__version=ct.version);let sn=Jt.currentProgram;Ne===!0&&(sn=ei(ct,Q,$));let kn=!1,xn=!1,ni=!1;const me=sn.getUniforms(),Wn=Jt.uniforms;if(Ft.useProgram(sn.program)&&(kn=!0,xn=!0,ni=!0),ct.id!==U&&(U=ct.id,xn=!0),kn||C!==w){Ft.buffers.depth.getReversed()?(W.copy(w.projectionMatrix),SE(W),ME(W),me.setValue(j,"projectionMatrix",W)):me.setValue(j,"projectionMatrix",w.projectionMatrix),me.setValue(j,"viewMatrix",w.matrixWorldInverse);const Dt=me.map.cameraPosition;Dt!==void 0&&Dt.setValue(j,_t.setFromMatrixPosition(w.matrixWorld)),ae.logarithmicDepthBuffer&&me.setValue(j,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(ct.isMeshPhongMaterial||ct.isMeshToonMaterial||ct.isMeshLambertMaterial||ct.isMeshBasicMaterial||ct.isMeshStandardMaterial||ct.isShaderMaterial)&&me.setValue(j,"isOrthographic",w.isOrthographicCamera===!0),C!==w&&(C=w,xn=!0,ni=!0)}if($.isSkinnedMesh){me.setOptional(j,$,"bindMatrix"),me.setOptional(j,$,"bindMatrixInverse");const dt=$.skeleton;dt&&(dt.boneTexture===null&&dt.computeBoneTexture(),me.setValue(j,"boneTexture",dt.boneTexture,L))}$.isBatchedMesh&&(me.setOptional(j,$,"batchingTexture"),me.setValue(j,"batchingTexture",$._matricesTexture,L),me.setOptional(j,$,"batchingIdTexture"),me.setValue(j,"batchingIdTexture",$._indirectTexture,L),me.setOptional(j,$,"batchingColorTexture"),$._colorsTexture!==null&&me.setValue(j,"batchingColorTexture",$._colorsTexture,L));const ta=lt.morphAttributes;if((ta.position!==void 0||ta.normal!==void 0||ta.color!==void 0)&&ue.update($,lt,sn),(xn||Jt.receiveShadow!==$.receiveShadow)&&(Jt.receiveShadow=$.receiveShadow,me.setValue(j,"receiveShadow",$.receiveShadow)),ct.isMeshGouraudMaterial&&ct.envMap!==null&&(Wn.envMap.value=Qt,Wn.flipEnvMap.value=Qt.isCubeTexture&&Qt.isRenderTargetTexture===!1?-1:1),ct.isMeshStandardMaterial&&ct.envMap===null&&Q.environment!==null&&(Wn.envMapIntensity.value=Q.environmentIntensity),xn&&(me.setValue(j,"toneMappingExposure",N.toneMappingExposure),Jt.needsLights&&cs(Wn,ni),Lt&&ct.fog===!0&&vt.refreshFogUniforms(Wn,Lt),vt.refreshMaterialUniforms(Wn,ct,Z,rt,y.state.transmissionRenderTarget[w.id]),Ru.upload(j,$i(Jt),Wn,L)),ct.isShaderMaterial&&ct.uniformsNeedUpdate===!0&&(Ru.upload(j,$i(Jt),Wn,L),ct.uniformsNeedUpdate=!1),ct.isSpriteMaterial&&me.setValue(j,"center",$.center),me.setValue(j,"modelViewMatrix",$.modelViewMatrix),me.setValue(j,"normalMatrix",$.normalMatrix),me.setValue(j,"modelMatrix",$.matrixWorld),ct.isShaderMaterial||ct.isRawShaderMaterial){const dt=ct.uniformsGroups;for(let Dt=0,Ot=dt.length;Dt<Ot;Dt++){const Kt=dt[Dt];F.update(Kt,sn),F.bind(Kt,sn)}}return sn}function cs(w,Q){w.ambientLightColor.needsUpdate=Q,w.lightProbe.needsUpdate=Q,w.directionalLights.needsUpdate=Q,w.directionalLightShadows.needsUpdate=Q,w.pointLights.needsUpdate=Q,w.pointLightShadows.needsUpdate=Q,w.spotLights.needsUpdate=Q,w.spotLightShadows.needsUpdate=Q,w.rectAreaLights.needsUpdate=Q,w.hemisphereLights.needsUpdate=Q}function Rr(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(w,Q,lt){ne.get(w.texture).__webglTexture=Q,ne.get(w.depthTexture).__webglTexture=lt;const ct=ne.get(w);ct.__hasExternalTextures=!0,ct.__autoAllocateDepthBuffer=lt===void 0,ct.__autoAllocateDepthBuffer||le.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ct.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,Q){const lt=ne.get(w);lt.__webglFramebuffer=Q,lt.__useDefaultFramebuffer=Q===void 0},this.setRenderTarget=function(w,Q=0,lt=0){q=w,V=Q,I=lt;let ct=!0,$=null,Lt=!1,Pt=!1;if(w){const Qt=ne.get(w);if(Qt.__useDefaultFramebuffer!==void 0)Ft.bindFramebuffer(j.FRAMEBUFFER,null),ct=!1;else if(Qt.__webglFramebuffer===void 0)L.setupRenderTarget(w);else if(Qt.__hasExternalTextures)L.rebindTextures(w,ne.get(w.texture).__webglTexture,ne.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const Xt=w.depthTexture;if(Qt.__boundDepthTexture!==Xt){if(Xt!==null&&ne.has(Xt)&&(w.width!==Xt.image.width||w.height!==Xt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");L.setupDepthRenderbuffer(w)}}const ie=w.texture;(ie.isData3DTexture||ie.isDataArrayTexture||ie.isCompressedArrayTexture)&&(Pt=!0);const ee=ne.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(ee[Q])?$=ee[Q][lt]:$=ee[Q],Lt=!0):w.samples>0&&L.useMultisampledRTT(w)===!1?$=ne.get(w).__webglMultisampledFramebuffer:Array.isArray(ee)?$=ee[lt]:$=ee,B.copy(w.viewport),at.copy(w.scissor),ot=w.scissorTest}else B.copy(Vt).multiplyScalar(Z).floor(),at.copy(ce).multiplyScalar(Z).floor(),ot=pt;if(Ft.bindFramebuffer(j.FRAMEBUFFER,$)&&ct&&Ft.drawBuffers(w,$),Ft.viewport(B),Ft.scissor(at),Ft.setScissorTest(ot),Lt){const Qt=ne.get(w.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Qt.__webglTexture,lt)}else if(Pt){const Qt=ne.get(w.texture),ie=Q||0;j.framebufferTextureLayer(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,Qt.__webglTexture,lt||0,ie)}U=-1},this.readRenderTargetPixels=function(w,Q,lt,ct,$,Lt,Pt){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Zt=ne.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Pt!==void 0&&(Zt=Zt[Pt]),Zt){Ft.bindFramebuffer(j.FRAMEBUFFER,Zt);try{const Qt=w.texture,ie=Qt.format,ee=Qt.type;if(!ae.textureFormatReadable(ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ae.textureTypeReadable(ee)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Q>=0&&Q<=w.width-ct&&lt>=0&&lt<=w.height-$&&j.readPixels(Q,lt,ct,$,xe.convert(ie),xe.convert(ee),Lt)}finally{const Qt=q!==null?ne.get(q).__webglFramebuffer:null;Ft.bindFramebuffer(j.FRAMEBUFFER,Qt)}}},this.readRenderTargetPixelsAsync=async function(w,Q,lt,ct,$,Lt,Pt){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Zt=ne.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Pt!==void 0&&(Zt=Zt[Pt]),Zt){const Qt=w.texture,ie=Qt.format,ee=Qt.type;if(!ae.textureFormatReadable(ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ae.textureTypeReadable(ee))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(Q>=0&&Q<=w.width-ct&&lt>=0&&lt<=w.height-$){Ft.bindFramebuffer(j.FRAMEBUFFER,Zt);const Xt=j.createBuffer();j.bindBuffer(j.PIXEL_PACK_BUFFER,Xt),j.bufferData(j.PIXEL_PACK_BUFFER,Lt.byteLength,j.STREAM_READ),j.readPixels(Q,lt,ct,$,xe.convert(ie),xe.convert(ee),0);const be=q!==null?ne.get(q).__webglFramebuffer:null;Ft.bindFramebuffer(j.FRAMEBUFFER,be);const je=j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE,0);return j.flush(),await yE(j,je,4),j.bindBuffer(j.PIXEL_PACK_BUFFER,Xt),j.getBufferSubData(j.PIXEL_PACK_BUFFER,0,Lt),j.deleteBuffer(Xt),j.deleteSync(je),Lt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,Q=null,lt=0){w.isTexture!==!0&&(El("WebGLRenderer: copyFramebufferToTexture function signature has changed."),Q=arguments[0]||null,w=arguments[1]);const ct=Math.pow(2,-lt),$=Math.floor(w.image.width*ct),Lt=Math.floor(w.image.height*ct),Pt=Q!==null?Q.x:0,Zt=Q!==null?Q.y:0;L.setTexture2D(w,0),j.copyTexSubImage2D(j.TEXTURE_2D,lt,0,0,Pt,Zt,$,Lt),Ft.unbindTexture()},this.copyTextureToTexture=function(w,Q,lt=null,ct=null,$=0){w.isTexture!==!0&&(El("WebGLRenderer: copyTextureToTexture function signature has changed."),ct=arguments[0]||null,w=arguments[1],Q=arguments[2],$=arguments[3]||0,lt=null);let Lt,Pt,Zt,Qt,ie,ee,Xt,be,je;const Ye=w.isCompressedTexture?w.mipmaps[$]:w.image;lt!==null?(Lt=lt.max.x-lt.min.x,Pt=lt.max.y-lt.min.y,Zt=lt.isBox3?lt.max.z-lt.min.z:1,Qt=lt.min.x,ie=lt.min.y,ee=lt.isBox3?lt.min.z:0):(Lt=Ye.width,Pt=Ye.height,Zt=Ye.depth||1,Qt=0,ie=0,ee=0),ct!==null?(Xt=ct.x,be=ct.y,je=ct.z):(Xt=0,be=0,je=0);const un=xe.convert(Q.format),Ue=xe.convert(Q.type);let Jt;Q.isData3DTexture?(L.setTexture3D(Q,0),Jt=j.TEXTURE_3D):Q.isDataArrayTexture||Q.isCompressedArrayTexture?(L.setTexture2DArray(Q,0),Jt=j.TEXTURE_2D_ARRAY):(L.setTexture2D(Q,0),Jt=j.TEXTURE_2D),j.pixelStorei(j.UNPACK_FLIP_Y_WEBGL,Q.flipY),j.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Q.premultiplyAlpha),j.pixelStorei(j.UNPACK_ALIGNMENT,Q.unpackAlignment);const hn=j.getParameter(j.UNPACK_ROW_LENGTH),Ne=j.getParameter(j.UNPACK_IMAGE_HEIGHT),sn=j.getParameter(j.UNPACK_SKIP_PIXELS),kn=j.getParameter(j.UNPACK_SKIP_ROWS),xn=j.getParameter(j.UNPACK_SKIP_IMAGES);j.pixelStorei(j.UNPACK_ROW_LENGTH,Ye.width),j.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Ye.height),j.pixelStorei(j.UNPACK_SKIP_PIXELS,Qt),j.pixelStorei(j.UNPACK_SKIP_ROWS,ie),j.pixelStorei(j.UNPACK_SKIP_IMAGES,ee);const ni=w.isDataArrayTexture||w.isData3DTexture,me=Q.isDataArrayTexture||Q.isData3DTexture;if(w.isRenderTargetTexture||w.isDepthTexture){const Wn=ne.get(w),ta=ne.get(Q),dt=ne.get(Wn.__renderTarget),Dt=ne.get(ta.__renderTarget);Ft.bindFramebuffer(j.READ_FRAMEBUFFER,dt.__webglFramebuffer),Ft.bindFramebuffer(j.DRAW_FRAMEBUFFER,Dt.__webglFramebuffer);for(let Ot=0;Ot<Zt;Ot++)ni&&j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,ne.get(w).__webglTexture,$,ee+Ot),w.isDepthTexture?(me&&j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,ne.get(Q).__webglTexture,$,je+Ot),j.blitFramebuffer(Qt,ie,Lt,Pt,Xt,be,Lt,Pt,j.DEPTH_BUFFER_BIT,j.NEAREST)):me?j.copyTexSubImage3D(Jt,$,Xt,be,je+Ot,Qt,ie,Lt,Pt):j.copyTexSubImage2D(Jt,$,Xt,be,je+Ot,Qt,ie,Lt,Pt);Ft.bindFramebuffer(j.READ_FRAMEBUFFER,null),Ft.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else me?w.isDataTexture||w.isData3DTexture?j.texSubImage3D(Jt,$,Xt,be,je,Lt,Pt,Zt,un,Ue,Ye.data):Q.isCompressedArrayTexture?j.compressedTexSubImage3D(Jt,$,Xt,be,je,Lt,Pt,Zt,un,Ye.data):j.texSubImage3D(Jt,$,Xt,be,je,Lt,Pt,Zt,un,Ue,Ye):w.isDataTexture?j.texSubImage2D(j.TEXTURE_2D,$,Xt,be,Lt,Pt,un,Ue,Ye.data):w.isCompressedTexture?j.compressedTexSubImage2D(j.TEXTURE_2D,$,Xt,be,Ye.width,Ye.height,un,Ye.data):j.texSubImage2D(j.TEXTURE_2D,$,Xt,be,Lt,Pt,un,Ue,Ye);j.pixelStorei(j.UNPACK_ROW_LENGTH,hn),j.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Ne),j.pixelStorei(j.UNPACK_SKIP_PIXELS,sn),j.pixelStorei(j.UNPACK_SKIP_ROWS,kn),j.pixelStorei(j.UNPACK_SKIP_IMAGES,xn),$===0&&Q.generateMipmaps&&j.generateMipmap(Jt),Ft.unbindTexture()},this.copyTextureToTexture3D=function(w,Q,lt=null,ct=null,$=0){return w.isTexture!==!0&&(El("WebGLRenderer: copyTextureToTexture3D function signature has changed."),lt=arguments[0]||null,ct=arguments[1]||null,w=arguments[2],Q=arguments[3],$=arguments[4]||0),El('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(w,Q,lt,ct,$)},this.initRenderTarget=function(w){ne.get(w).__webglFramebuffer===void 0&&L.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?L.setTextureCube(w,0):w.isData3DTexture?L.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?L.setTexture2DArray(w,0):L.setTexture2D(w,0),Ft.unbindTexture()},this.resetState=function(){V=0,I=0,q=null,Ft.reset(),we.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ia}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;const a=this.getContext();a.drawingBufferColorspace=Ve._getDrawingBufferColorSpace(n),a.unpackColorSpace=Ve._getUnpackColorSpace()}}class Vp{constructor(n,a=25e-5){this.isFogExp2=!0,this.name="",this.color=new ke(n),this.density=a}clone(){return new Vp(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class LR extends ti{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Va,this.environmentIntensity=1,this.environmentRotation=new Va,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(n,a){return super.copy(n,a),n.background!==null&&(this.background=n.background.clone()),n.environment!==null&&(this.environment=n.environment.clone()),n.fog!==null&&(this.fog=n.fog.clone()),this.backgroundBlurriness=n.backgroundBlurriness,this.backgroundIntensity=n.backgroundIntensity,this.backgroundRotation.copy(n.backgroundRotation),this.environmentIntensity=n.environmentIntensity,this.environmentRotation.copy(n.environmentRotation),n.overrideMaterial!==null&&(this.overrideMaterial=n.overrideMaterial.clone()),this.matrixAutoUpdate=n.matrixAutoUpdate,this}toJSON(n){const a=super.toJSON(n);return this.fog!==null&&(a.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(a.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(a.object.backgroundIntensity=this.backgroundIntensity),a.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(a.object.environmentIntensity=this.environmentIntensity),a.object.environmentRotation=this.environmentRotation.toArray(),a}}class OR extends Eo{static get type(){return"LineBasicMaterial"}constructor(n){super(),this.isLineBasicMaterial=!0,this.color=new ke(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(n)}copy(n){return super.copy(n),this.color.copy(n.color),this.map=n.map,this.linewidth=n.linewidth,this.linecap=n.linecap,this.linejoin=n.linejoin,this.fog=n.fog,this}}const Du=new ft,Uu=new ft,$0=new _n,Sl=new Hp,_u=new Dl,Vd=new ft,tx=new ft;class zR extends ti{constructor(n=new Qi,a=new OR){super(),this.isLine=!0,this.type="Line",this.geometry=n,this.material=a,this.updateMorphTargets()}copy(n,a){return super.copy(n,a),this.material=Array.isArray(n.material)?n.material.slice():n.material,this.geometry=n.geometry,this}computeLineDistances(){const n=this.geometry;if(n.index===null){const a=n.attributes.position,s=[0];for(let c=1,f=a.count;c<f;c++)Du.fromBufferAttribute(a,c-1),Uu.fromBufferAttribute(a,c),s[c]=s[c-1],s[c]+=Du.distanceTo(Uu);n.setAttribute("lineDistance",new Ha(s,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(n,a){const s=this.geometry,c=this.matrixWorld,f=n.params.Line.threshold,h=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),_u.copy(s.boundingSphere),_u.applyMatrix4(c),_u.radius+=f,n.ray.intersectsSphere(_u)===!1)return;$0.copy(c).invert(),Sl.copy(n.ray).applyMatrix4($0);const d=f/((this.scale.x+this.scale.y+this.scale.z)/3),m=d*d,_=this.isLineSegments?2:1,g=s.index,x=s.attributes.position;if(g!==null){const M=Math.max(0,h.start),T=Math.min(g.count,h.start+h.count);for(let R=M,S=T-1;R<S;R+=_){const y=g.getX(R),P=g.getX(R+1),O=xu(this,n,Sl,m,y,P);O&&a.push(O)}if(this.isLineLoop){const R=g.getX(T-1),S=g.getX(M),y=xu(this,n,Sl,m,R,S);y&&a.push(y)}}else{const M=Math.max(0,h.start),T=Math.min(x.count,h.start+h.count);for(let R=M,S=T-1;R<S;R+=_){const y=xu(this,n,Sl,m,R,R+1);y&&a.push(y)}if(this.isLineLoop){const R=xu(this,n,Sl,m,T-1,M);R&&a.push(R)}}}updateMorphTargets(){const a=this.geometry.morphAttributes,s=Object.keys(a);if(s.length>0){const c=a[s[0]];if(c!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let f=0,h=c.length;f<h;f++){const d=c[f].name||String(f);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=f}}}}}function xu(o,n,a,s,c,f){const h=o.geometry.attributes.position;if(Du.fromBufferAttribute(h,c),Uu.fromBufferAttribute(h,f),a.distanceSqToSegment(Du,Uu,Vd,tx)>s)return;Vd.applyMatrix4(o.matrixWorld);const m=n.ray.origin.distanceTo(Vd);if(!(m<n.near||m>n.far))return{distance:m,point:tx.clone().applyMatrix4(o.matrixWorld),index:c,face:null,faceIndex:null,barycoord:null,object:o}}const ex=new ft,nx=new ft;class PR extends zR{constructor(n,a){super(n,a),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const n=this.geometry;if(n.index===null){const a=n.attributes.position,s=[];for(let c=0,f=a.count;c<f;c+=2)ex.fromBufferAttribute(a,c),nx.fromBufferAttribute(a,c+1),s[c]=c===0?0:s[c-1],s[c+1]=s[c]+ex.distanceTo(nx);n.setAttribute("lineDistance",new Ha(s,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class IR extends Eo{static get type(){return"PointsMaterial"}constructor(n){super(),this.isPointsMaterial=!0,this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(n)}copy(n){return super.copy(n),this.color.copy(n.color),this.map=n.map,this.alphaMap=n.alphaMap,this.size=n.size,this.sizeAttenuation=n.sizeAttenuation,this.fog=n.fog,this}}const ix=new _n,Dp=new Hp,yu=new Dl,Su=new ft;class ax extends ti{constructor(n=new Qi,a=new IR){super(),this.isPoints=!0,this.type="Points",this.geometry=n,this.material=a,this.updateMorphTargets()}copy(n,a){return super.copy(n,a),this.material=Array.isArray(n.material)?n.material.slice():n.material,this.geometry=n.geometry,this}raycast(n,a){const s=this.geometry,c=this.matrixWorld,f=n.params.Points.threshold,h=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),yu.copy(s.boundingSphere),yu.applyMatrix4(c),yu.radius+=f,n.ray.intersectsSphere(yu)===!1)return;ix.copy(c).invert(),Dp.copy(n.ray).applyMatrix4(ix);const d=f/((this.scale.x+this.scale.y+this.scale.z)/3),m=d*d,_=s.index,p=s.attributes.position;if(_!==null){const x=Math.max(0,h.start),M=Math.min(_.count,h.start+h.count);for(let T=x,R=M;T<R;T++){const S=_.getX(T);Su.fromBufferAttribute(p,S),rx(Su,S,m,c,n,a,this)}}else{const x=Math.max(0,h.start),M=Math.min(p.count,h.start+h.count);for(let T=x,R=M;T<R;T++)Su.fromBufferAttribute(p,T),rx(Su,T,m,c,n,a,this)}}updateMorphTargets(){const a=this.geometry.morphAttributes,s=Object.keys(a);if(s.length>0){const c=a[s[0]];if(c!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let f=0,h=c.length;f<h;f++){const d=c[f].name||String(f);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=f}}}}}function rx(o,n,a,s,c,f,h){const d=Dp.distanceSqToPoint(o);if(d<a){const m=new ft;Dp.closestPointToPoint(o,m),m.applyMatrix4(s);const _=c.ray.origin.distanceTo(m);if(_<c.near||_>c.far)return;f.push({distance:_,distanceToRay:Math.sqrt(d),point:m,index:n,face:null,faceIndex:null,barycoord:null,object:h})}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lp}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lp);function BR(o){return Math.min(4.8,1.45+Math.sqrt(Math.max(0,Number(o)||0))*.78)}function FR({x:o,y:n,radius:a,width:s,viewportWidth:c,viewportHeight:f},h){const m=Math.max(8,a+6),_=6;return[[o+m,n-44/2,s,44],[o-m-s,n-44/2,s,44],[o-s/2,n-m-44,s,44],[o-s/2,n+m,s,44]].find(p=>p[0]>=_&&p[1]>=_&&p[0]+p[2]<=c-_&&p[1]+p[3]<=f-_&&!h.some(x=>p[0]<x[0]+x[2]+4&&p[0]+p[2]+4>x[0]&&p[1]<x[1]+x[3]&&p[1]+p[3]>x[1]))||null}function HR({settleMs:o=180,movementPx:n=.35}={}){let a,s,c=[],f=[],h=0,d=!1;const m=g=>g.map(p=>[...p]),_=(g,p,x)=>g.length!==p.length||g.some((M,T)=>M.some((R,S)=>Math.abs(R-p[T][S])>x));return{update({key:g,geometry:p,now:x,compute:M}){return _(p,c,n)&&(c=m(p),h=x),d||=_(p,f,2),(s===void 0||a!==g||d&&x-h>=o)&&(s=M(),a=g,f=m(p),c=m(p),d=!1),s}}}function GR({els:o,emit:n,data:a,initialTheme:s="dark",language:c="cn"}){const f=a.clusters.map(H=>({...H,color:H.light})),h=a.nodes,d=a.edges;let m=s;for(const H of f)H.color=H[m];const _=Object.fromEntries(f.map(H=>[H.id,H])),g=h.map(([H,W,mt,_t],At)=>({i:At,name:H,cid:W,w:mt,desc:_t,cluster:_[W],out:[],in:[],rel:[],x:0,y:0,z:0,vx:0,vy:0,vz:0,sx:0,sy:0,sz:0,vis:!0,alpha:1,scale:1})),p=Object.fromEntries(g.map(H=>[H.name,H])),x=[];for(const[H,W,mt]of d){const _t=p[H],At=p[W];if(!_t||!At){console.warn("[atlas] 丢弃无效边：",H,"→",W);continue}x.push({s:_t,t:At,kind:mt,i:x.length,alpha:1}),mt==="pre"?(_t.out.push(At),At.in.push(_t)):(_t.rel.push(At),At.rel.push(_t))}const M=H=>H.out.length+H.in.length+H.rel.length,T=g.map(()=>[]);for(const H of x)T[H.s.i].push(H.t.i),T[H.t.i].push(H.s.i);const R=42;for(const H of f){const[W,mt,_t]=H.anchor,At=Math.hypot(W,mt,_t)||1;H.dir=[W/At,mt/At,_t/At]}const S=new Array(g.length).fill(-1);(function(){let W=!0,mt=0;for(const _t of g)_t.in.length||(S[_t.i]=0);for(;W&&mt++<40;){W=!1;for(const _t of g){let At=_t.in.length?-1:0;for(const Ct of _t.in)S[Ct.i]>=0&&(At=Math.max(At,S[Ct.i]+1));At>=0&&At!==S[_t.i]&&(S[_t.i]=At,W=!0)}}for(let _t=0;_t<S.length;_t++)S[_t]<0&&(S[_t]=2)})();const y=Math.max(1,...S),P={atlas:[],shell:[],tier:[]};g.forEach((H,W)=>{const mt=H.cluster.dir,_t=1-Math.min(M(H),12)/26;P.atlas.push([mt[0]*R*_t,mt[1]*R*_t,mt[2]*R*_t]);const At=f.indexOf(H.cluster),Ct=g.filter(Fe=>Fe.cid===H.cid).indexOf(H),Ut=g.filter(Fe=>Fe.cid===H.cid).length,re=(At/f.length+Ct/Ut/f.length)*Math.PI*2,j=(Ct/Ut-.5)*1.5;P.shell.push([R*.95*Math.cos(j)*Math.cos(re),R*.95*Math.sin(j),R*.95*Math.cos(j)*Math.sin(re)]),P.tier.push([mt[0]*R*.72,(S[W]/y-.5)*R*1.5,mt[2]*R*.72])});const O=JSON.parse(JSON.stringify(P));let N="atlas";g.forEach((H,W)=>{const mt=P.atlas[W];H.x=mt[0]+Math.sin(W*31.7+1)*.5*16,H.y=mt[1]+Math.sin(W*31.7+1)*.5*16,H.z=mt[2]+Math.sin(W*31.7+1)*.5*16});let et=1;const V=9,I=.04,q=130,U=.05;function C(){if(et<.004)return;const H=P[N];for(let W=0;W<g.length;W++){const mt=g[W];for(let _t=W+1;_t<g.length;_t++){const At=g[_t];let Ct=mt.x-At.x,Ut=mt.y-At.y,re=mt.z-At.z,j=Ct*Ct+Ut*Ut+re*re+.6;const Fe=q/j,le=Math.sqrt(j);Ct/=le,Ut/=le,re/=le,mt.vx+=Ct*Fe,mt.vy+=Ut*Fe,mt.vz+=re*Fe,At.vx-=Ct*Fe,At.vy-=Ut*Fe,At.vz-=re*Fe}}for(const W of x){const mt=W.s,_t=W.t;let At=_t.x-mt.x,Ct=_t.y-mt.y,Ut=_t.z-mt.z;const re=Math.hypot(At,Ct,Ut)||1,j=(re-V)*I;At/=re,Ct/=re,Ut/=re,mt.vx+=At*j,mt.vy+=Ct*j,mt.vz+=Ut*j,_t.vx-=At*j,_t.vy-=Ct*j,_t.vz-=Ut*j}for(let W=0;W<g.length;W++){const mt=g[W],_t=H[W];mt.vx+=(_t[0]-mt.x)*U,mt.vy+=(_t[1]-mt.y)*U,mt.vz+=(_t[2]-mt.z)*U;const At=.82;mt.vx*=At,mt.vy*=At,mt.vz*=At,mt.x+=mt.vx*et,mt.y+=mt.vy*et,mt.z+=mt.vz*et}et*=.988}for(let H=0;H<220;H++)C();const B=46;function at(){let H=0;for(const W of g)H=Math.max(H,Math.hypot(W.x,W.y,W.z));return H/Math.sin(B*Math.PI/360)*.88}const ot=new AbortController,{signal:ht}=ot,gt=(H,W,mt,_t)=>H.addEventListener(W,mt,{..._t,signal:ht});let X=0;const rt=matchMedia("(prefers-reduced-motion: reduce)");N="atlas",m=s,et=1;for(const H of Object.keys(P))P[H]=O[H].map(W=>[...W]);g.forEach((H,W)=>{[H.x,H.y,H.z]=P.atlas[W],H.x+=Math.sin(W*31.7+1)*8,H.y+=Math.cos(W*17.3+2)*8,H.vx=H.vy=H.vz=0,H.alpha=H.scale=1,H.vis=!0});for(let H=0;H<220;H++)C();const{stage:Z}=o;let St,bt,Vt,ce,pt,A,k=!0;try{St=new NR({antialias:!0,alpha:!0,powerPreference:"high-performance"})}catch{k=!1}if(St||(k=!1),!k){n.gate(!0);const H=(...W)=>{};return{setTheme:H,clearSel:H,setView:H,toggleFlow:H,toggleLabel:H,toggleSpin:H,reset:H,toggleTheme:H,dolly:H,zoomReset:H,toggleCluster:H,selectAt:H,hoverAt:H,setQuery:H,clearPath:H,centerOn:H,startPath:H,dispose(){ot.abort()}}}{let De=function(dt,Dt){const Ot=le.uniforms.uPx.value;for(const Kt of g){cn.set(Kt.x,Kt.y,Kt.z);const he=Vt.position.distanceTo(cn);cn.project(Vt),Kt.sx=(cn.x*.5+.5)*dt,Kt.sy=(-cn.y*.5+.5)*Dt,Kt.sz=cn.z,Kt.labelRadius=Kt.size*Ot/St.getPixelRatio()/Math.max(he,1)*.5,Kt.sr=Kt.labelRadius*Kt.scale}},zi=function(){Xe.fill(1),rn.fill(1),fn.fill(1);const dt=Xa,Dt=Ot=>!dt||Ot.name.toLowerCase().includes(dt)||Ot.desc.toLowerCase().includes(dt);for(const Ot of g)Ot.vis=!fe.has(Ot.cid)&&Dt(Ot),Ot.vis||(Xe[Ot.i]=0,rn[Ot.i]=.6);for(const Ot of x)(!Ot.s.vis||!Ot.t.vis)&&(fn[Ot.i]=0);if(ut){for(const Ot of g)Ot.vis&&(Xe[Ot.i]=ut.has(Ot.i)?1:$e,rn[Ot.i]=ut.has(Ot.i)?1.25:.8);for(const Ot of x)fn[Ot.i]&&(fn[Ot.i]=ut.has(Ot.s.i)&&ut.has(Ot.t.i)?1.35:$e*.5)}else if(wt||F){const Ot=wt||F,Kt=new Set([Ot.i,...T[Ot.i]]),he=wt?$e:.22;for(const ve of g)ve.vis&&(Xe[ve.i]=Kt.has(ve.i)?1:he,rn[ve.i]=ve===Ot?1.35:Kt.has(ve.i)?1.06:.9);for(const ve of x)fn[ve.i]&&(fn[ve.i]=ve.s===Ot||ve.t===Ot?1.65:he*.5)}return F&&F.vis&&(Xe[F.i]=1,rn[F.i]=Math.max(rn[F.i],1.35)),{nT:Xe,sT:rn,eT:fn}},pa=function(dt){wt=dt,ut=null,o.pathbar.classList.remove("on"),vt.tx=dt.x,vt.ty=dt.y,vt.tz=dt.z,vt.tDist=Math.min(vt.tDist,qt*.92),jt(),me(dt),sn(),hn()},Mi=function(){wt=null,ut=null,vt.tx=vt.ty=vt.tz=0,o.pathbar.classList.remove("on"),me(null),sn(),hn()},Ji=function(dt,Dt){const Ot=new Array(g.length).fill(-1),Kt=new Set([dt.i]),he=[dt.i];for(;he.length;){const ge=he.shift();if(ge===Dt.i)break;for(const wn of T[ge])!Kt.has(wn)&&g[wn].vis&&(Kt.add(wn),Ot[wn]=ge,he.push(wn))}if(!Kt.has(Dt.i)){o.chain.textContent=c==="en"?"No visible path between these concepts":"两点之间没有可见通路",o.pathbar.classList.add("on");return}const ve=[];let Ze=Dt.i;for(;Ze!==-1&&(ve.unshift(Ze),Ze!==dt.i);)Ze=Ot[Ze];ut=new Set(ve),o.chain.textContent=ve.map(ge=>g[ge].name).join(" → "),o.pathbar.classList.add("on"),hn()},Pi=function(){ut=null,o.pathbar.classList.remove("on"),hn()},Rr=function(dt,Dt,Ot){const Kt=[dt,Dt,N,Xa,[...fe].join(","),zt,wt?.i,ut?[...ut].join(","):"",document.fonts.status].join("|"),he=cs.update({key:Kt,now:Ot,geometry:g.map(ve=>[ve.sx,ve.sy,ve.labelRadius]),compute(){const ve=new Set(wt?T[wt.i]:[]),Ze=new Set(zt?bo.slice(0,dt<500?16:28).map(oe=>oe.i):[]);wt&&(Ze.add(wt.i),ve.forEach(oe=>Ze.add(oe))),ut&&ut.forEach(oe=>Ze.add(oe));const ge=oe=>(oe===wt?1e4:ut?.has(oe.i)?8e3:ve.has(oe.i)?1e3:0)+M(oe),wn=[...Ze].map(oe=>g[oe]).filter(oe=>oe.vis&&oe.sz<1).sort((oe,Ln)=>ge(Ln)-ge(oe)||oe.i-Ln.i),de=g.filter(oe=>oe.vis&&oe.sz<1).map(oe=>{const Ln=oe.labelRadius*1.4;return[oe.sx-Ln-2,oe.sy-Ln-2,Ln*2+4,Ln*2+4]}),En=dt<500?11:12;ei&&(ei.font="450 "+En+"px "+$i);const mn=new Map;for(const oe of wn){const Ln=Math.min(dt-16,Math.max(44,Math.ceil(ei?ei.measureText(oe.name).width:oe.name.length*En)+20)),ma=FR({x:oe.sx,y:oe.sy,radius:oe.labelRadius*1.4,width:Ln,viewportWidth:dt,viewportHeight:Dt},de);ma&&(de.push(ma),mn.set(oe.i,{dx:ma[0]-oe.sx,dy:ma[1]-oe.sy,width:Ln}))}return mn}});for(const ve of g){const Ze=ka[ve.i],ge=he.get(ve.i),wn=!ge||!ve.vis||ve.sz>=1;if(Ze.hidden!==wn&&(Ze.hidden=wn),wn)continue;const de=`translate(${Math.round(ve.sx+ge.dx)}px,${Math.round(ve.sy+ge.dy)}px)`,En=ge.width+"px",mn="g-lab"+(ve===F||ve===wt?" is-selected":""),oe=ve===F||ve===wt?ve.cluster.color:"";Ze.style.transform!==de&&(Ze.style.transform=de),Ze.style.width!==En&&(Ze.style.width=En),Ze.className!==mn&&(Ze.className=mn),Ze.style.color!==oe&&(Ze.style.color=oe)}},Qt=function(dt){X=requestAnimationFrame(Qt);const Dt=Math.min(.05,(dt-w)/1e3);w=dt;const Ot=Z.clientWidth,Kt=Z.clientHeight;if(!Ot||!Kt)return;if(St.domElement.width!==Math.round(Ot*St.getPixelRatio())||St.domElement.height!==Math.round(Kt*St.getPixelRatio())){St.setSize(Ot,Kt,!1);const de=Et();vt.tDist*=de/qt,vt.dist*=de/qt,qt=de,jt(),Vt.aspect=Ot/Kt,Vt.updateProjectionMatrix(),Fe.uniforms.uPx.value=le.uniforms.uPx.value=Kt*St.getPixelRatio()/(2*Math.tan(Vt.fov*Math.PI/360))}C(),Tt&&!rt.matches&&(vt.tTheta+=Dt*.09);const he=rt.matches?1:1-Math.pow(.0016,Dt);if(vt.theta+=(vt.tTheta-vt.theta)*he,vt.phi+=(vt.tPhi-vt.phi)*he,vt.dist+=(vt.tDist-vt.dist)*he,vt.cx+=(vt.tx-vt.cx)*he,vt.cy+=(vt.ty-vt.cy)*he,vt.cz+=(vt.tz-vt.cz)*he,Vt.position.set(vt.cx+vt.dist*Math.sin(vt.phi)*Math.cos(vt.theta),vt.cy+vt.dist*Math.cos(vt.phi),vt.cz+vt.dist*Math.sin(vt.phi)*Math.sin(vt.theta)),Vt.lookAt(vt.cx,vt.cy,vt.cz),De(Ot,Kt),we.live&&!Ht){let de=null,En=1/0;for(const mn of g){if(!mn.vis||mn.sz>1)continue;const oe=mn.sx-we.x,Ln=mn.sy-we.y,ma=mn.sr+18;if(oe*oe+Ln*Ln>ma*ma)continue;const us=oe*oe+Ln*Ln;us<En&&(de=mn,En=us)}de!==F&&(F=de,te.style.cursor=de?"pointer":"grab",hn())}const{nT:ve,sT:Ze,eT:ge}=zi(),wn=rt.matches?1:1-Math.pow(.002,Dt);for(const de of g)de.alpha+=(ve[de.i]-de.alpha)*wn,de.scale+=(Ze[de.i]-de.scale)*wn,ct.array[de.i*3]=de.x,ct.array[de.i*3+1]=de.y,ct.array[de.i*3+2]=de.z,$.array[de.i]=de.alpha,Lt.array[de.i]=de.scale;ct.needsUpdate=$.needsUpdate=Lt.needsUpdate=!0;for(const de of x){de.alpha+=(ge[de.i]-de.alpha)*wn;const En=de.i*6;Pt.array[En]=de.s.x,Pt.array[En+1]=de.s.y,Pt.array[En+2]=de.s.z,Pt.array[En+3]=de.t.x,Pt.array[En+4]=de.t.y,Pt.array[En+5]=de.t.z,Zt.array[de.i*2]=Zt.array[de.i*2+1]=de.alpha}Pt.needsUpdate=Zt.needsUpdate=!0,Rt.uniforms.uTime.value=dt/1e3,Rt.uniforms.uFlow.value+=((Gt&&!rt.matches?1:0)-Rt.uniforms.uFlow.value)*wn,Rr(Ot,Kt,dt),St.render(bt,Vt),Q+=1/Math.max(Dt,1e-4),lt++,lt>=30&&(o.sFps.textContent=Math.round(Q/lt),Q=lt=0)},ie=function(dt=.55){et=Math.max(et,dt)},ee=function(dt){N=dt,o.hudMode.textContent={atlas:"FREE ORBIT",shell:"SHELL VIEW",tier:"DEPENDENCY TIERS"}[N],ie(1)},Ye=function(){vt.tTheta=1.55,vt.tPhi=1.48,vt.tDist=qt,Mi(),ie(.8),jt()},un=function(){n.tools({flow:Gt,label:zt,spin:Tt})},Ue=function(dt){m=dt,document.documentElement.dataset.theme=dt,n.theme(dt);const Dt=dt==="light";for(const he of f)he.color=he[dt];g.forEach((he,ve)=>{const Ze=H(he.cluster.color);_t[ve*3]=Ze[0],_t[ve*3+1]=Ze[1],_t[ve*3+2]=Ze[2]}),re.getAttribute("aColor").needsUpdate=!0,x.forEach((he,ve)=>{Se.set(H(he.s.cluster.color),ve*6),Se.set(H(he.t.cluster.color),ve*6+3)}),xt.getAttribute("aColor").needsUpdate=!0;const Ot=Dt?ss:uo;for(const he of[Fe,le,Rt])he.uniforms.uLight.value=Dt?1:0,he.blending=Ot,he.needsUpdate=!0;const Kt=Dt?16053489:328967;St.setClearColor(Kt,0),bt.fog.color.setHex(Kt),bt.fog.density=Dt?.0042:.0068,sn(),wt&&me(wt)},hn=function(){o.hudSel.textContent=ut?`${Math.max(0,ut.size-1)} ${c==="en"?"connections":"条连接"}`:wt?wt.name:F?F.name:""},Ne=function(dt){fe.has(dt)?fe.delete(dt):fe.add(dt),sn(),ie(.4)},sn=function(){const dt=o.q.value.trim().toLowerCase(),Dt=g.filter(Kt=>!fe.has(Kt.cid)&&(!dt||Kt.name.toLowerCase().includes(dt)||Kt.desc.toLowerCase().includes(dt))).sort((Kt,he)=>M(he)-M(Kt));n.list({q:dt,rows:Dt.map(Kt=>({i:Kt.i,name:Kt.name,color:Kt.cluster.color,deg:M(Kt),on:Kt===wt}))}),o.sNode.textContent=Dt.length;const Ot=x.filter(Kt=>Dt.includes(Kt.s)&&Dt.includes(Kt.t)).length;o.sEdge.textContent=Ot,o.sDeg.textContent=Dt.length?(Ot*2/Dt.length).toFixed(1):"0"},ni=function(dt){Xa=dt.trim().toLowerCase(),sn(),ie(.25)},me=function(dt){n.drawer(dt&&{i:dt.i,name:dt.name,desc:dt.desc,cname:dt.cluster.name,color:dt.cluster.color,deg:M(dt),depth:S[dt.i],groups:[["前置 · 学它之前",dt.in,"PRE"],["延伸 · 它撑起了",dt.out,"NEXT"],["并列 · 相关概念",dt.rel,"REL"]].filter(([,Dt])=>Dt.length).map(([Dt,Ot,Kt])=>({title:Dt,tag:Kt,items:Ot.map(he=>({i:he.i,name:he.name,color:he.cluster.color}))}))})},Wn=function(dt){const Dt=g[dt],Ot=P[N],Kt=Ot[Dt.i].slice();for(let he=0;he<Ot.length;he++)Ot[he][0]-=Kt[0],Ot[he][1]-=Kt[1],Ot[he][2]-=Kt[2];vt.tx=vt.ty=vt.tz=0,ie(1)},ta=function(dt){const Dt=g[dt];pa(Dt),o.chain.textContent=c==="en"?`From ${Dt.name} — Shift-click another concept`:`从 ${Dt.name} 出发 — 按住 Shift 点击另一个知识点`,o.pathbar.classList.add("on")};St.setPixelRatio(Math.min(devicePixelRatio,2)),Z.appendChild(St.domElement),bt=new LR,bt.fog=new Vp(328967,.0068),Vt=new Oi(B,1,1,1400);const H=dt=>{const Dt=new ke(dt);return[Dt.r,Dt.g,Dt.b]},W=g.length,mt=new Float32Array(W*3),_t=new Float32Array(W*3),At=new Float32Array(W),Ct=new Float32Array(W),Ut=new Float32Array(W);g.forEach((dt,Dt)=>{const Ot=H(dt.cluster.color);_t[Dt*3]=Ot[0],_t[Dt*3+1]=Ot[1],_t[Dt*3+2]=Ot[2],At[Dt]=dt.size=BR(M(dt)),Ct[Dt]=1,Ut[Dt]=1});const re=new Qi;re.setAttribute("position",new Sn(mt,3)),re.setAttribute("aColor",new Sn(_t,3)),re.setAttribute("aSize",new Sn(At,1)),re.setAttribute("aAlpha",new Sn(Ct,1)),re.setAttribute("aScale",new Sn(Ut,1));const j=`
    attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aScale;
    varying vec3 vColor; varying float vAlpha;
    uniform float uPx, uMul;
    void main(){
      vColor = aColor; vAlpha = aAlpha;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * aScale * uMul * uPx / max(-mv.z, 1.0);
      gl_Position = projectionMatrix * mv;
    }`,Fe=new Ki({uniforms:{uPx:{value:300},uMul:{value:4.5},uLight:{value:0}},vertexShader:j,fragmentShader:`
      varying vec3 vColor; varying float vAlpha;
      uniform float uLight;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        // 三次衰减而不是高斯：边缘落得更干净，不会在近处糊成一片方块。
        float halo = pow(1.0 - d, 3.0);
        if (uLight > 0.5) {
          // 白纸上这一层不是"发光"，是墨在纸上洇开的一圈 —— 只压深，不加亮。
          gl_FragColor = vec4(vColor * 0.62, halo * 0.07 * vAlpha);
        } else {
          vec2 p = gl_PointCoord - 0.5;
          float rays = exp(-abs(p.x) * 140.0) * exp(-abs(p.y) * 9.0) + exp(-abs(p.y) * 140.0) * exp(-abs(p.x) * 9.0);
          gl_FragColor = vec4(mix(vColor, vec3(1.0), 0.25) * (halo + rays * 0.35), (halo * 0.24 + rays * 0.18) * vAlpha);
        }
      }`,transparent:!0,blending:uo,depthWrite:!1}),le=new Ki({uniforms:{uPx:{value:300},uMul:{value:1},uLight:{value:0}},vertexShader:j,fragmentShader:`
      varying vec3 vColor; varying float vAlpha;
      uniform float uLight;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        if (uLight > 0.5) {
          // A crisp, topic-colored core on the light chart.
          float disc = 1.0 - smoothstep(0.82, 1.0, d);
          gl_FragColor = vec4(vColor, disc * 0.95 * vAlpha);
        } else {
          float core = 1.0 - smoothstep(0.12, 1.0, d);
          float disc = 1.0 - smoothstep(0.80, 1.0, d);
          vec3 c = mix(vColor, vec3(1.0), core * 0.08);
          gl_FragColor = vec4(c, disc * vAlpha);
        }
        #include <colorspace_fragment>
      }`,transparent:!0,blending:uo,depthWrite:!1});ce=new ax(re,Fe),pt=new ax(re,le),ce.frustumCulled=!1,pt.frustumCulled=!1,bt.add(ce,pt);const ae=x.length,Ft=new Float32Array(ae*6),Se=new Float32Array(ae*6),ne=new Float32Array(ae*2),L=new Float32Array(ae*2),b=new Float32Array(ae*2),it=new Float32Array(ae*2);x.forEach((dt,Dt)=>{const Ot=H(dt.s.cluster.color),Kt=H(dt.t.cluster.color);Se.set(Ot,Dt*6),Se.set(Kt,Dt*6+3),ne[Dt*2]=0,ne[Dt*2+1]=1;const he=Dt*.6180339887%1;L[Dt*2]=he,L[Dt*2+1]=he,b[Dt*2]=b[Dt*2+1]=1,it[Dt*2]=it[Dt*2+1]=dt.kind==="pre"?1:0});const xt=new Qi;xt.setAttribute("position",new Sn(Ft,3)),xt.setAttribute("aColor",new Sn(Se,3)),xt.setAttribute("aT",new Sn(ne,1)),xt.setAttribute("aSeed",new Sn(L,1)),xt.setAttribute("aAlpha",new Sn(b,1)),xt.setAttribute("aDir",new Sn(it,1));const Rt=new Ki({uniforms:{uTime:{value:0},uFlow:{value:1},uLight:{value:0}},vertexShader:`
      attribute vec3 aColor; attribute float aT, aSeed, aAlpha, aDir;
      varying vec3 vColor; varying float vT, vSeed, vAlpha, vDir;
      void main(){
        vColor = aColor; vT = aT; vSeed = aSeed; vAlpha = aAlpha; vDir = aDir;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,fragmentShader:`
      precision mediump float;
      varying vec3 vColor; varying float vT, vSeed, vAlpha, vDir;
      uniform float uTime, uFlow, uLight;
      void main(){
        // 光点位置在 0..1 上循环；用环上最短距离算亮度，
        // 否则每绕一圈都会在接缝处闪一下。
        float head = fract(vSeed + uTime * 0.16);
        float d = abs(vT - head);
        d = min(d, 1.0 - d);
        float pulse = exp(-pow(d * 7.0, 2.0)) * vDir * uFlow;
        if (uLight > 0.5) {
          gl_FragColor = vec4(mix(vColor * 0.42, vColor, pulse), vAlpha * (0.28 + 0.46 * pulse));
        } else {
          gl_FragColor = vec4(mix(vec3(0.38, 0.43, 0.52), vColor, 0.55) * (0.8 + 0.8 * pulse), vAlpha * (0.40 + 0.45 * pulse));
        }
      }`,transparent:!0,blending:uo,depthWrite:!1});A=new PR(xt,Rt),A.frustumCulled=!1,bt.add(A);const Et=()=>at()*(Z.clientWidth<500?1.06:.82)*Math.max(1,Z.clientHeight/Math.max(Z.clientWidth,1));let qt=Et();const vt={theta:1.55,phi:1.48,dist:qt,tTheta:1.55,tPhi:1.48,tDist:qt,tx:0,ty:0,tz:0,cx:0,cy:0,cz:0};let Ht=!1,Te=0,Nt=0,Yt=0;const te=St.domElement;gt(te,"pointerdown",dt=>{Ht=!0,Yt=0,Te=dt.clientX,Nt=dt.clientY,te.setPointerCapture(dt.pointerId)}),gt(te,"pointerup",dt=>{Ht=!1,te.releasePointerCapture(dt.pointerId)}),gt(te,"pointermove",dt=>{const Dt=te.getBoundingClientRect();if(we.x=dt.clientX-Dt.left,we.y=dt.clientY-Dt.top,we.live=!0,!Ht)return;const Ot=dt.clientX-Te,Kt=dt.clientY-Nt;Yt+=Math.abs(Ot)+Math.abs(Kt),Te=dt.clientX,Nt=dt.clientY,vt.tTheta-=Ot*.0052,vt.tPhi=Math.max(.12,Math.min(Math.PI-.12,vt.tPhi-Kt*.0052)),Tt=!1,un()}),gt(te,"pointerleave",()=>{we.live=!1,F=null,hn()});const ue=o.zlvl,jt=()=>{ue.textContent=Math.round(qt/vt.tDist*100)+"%"},ye=dt=>{vt.tDist=Math.max(qt*.22,Math.min(qt*2.6,vt.tDist*dt)),jt()};gt(te,"wheel",dt=>{dt.preventDefault(),ye(1+Math.sign(dt.deltaY)*.11)},{passive:!1});const xe=()=>{vt.tDist=qt,jt()};jt();const we={x:-1,y:-1,live:!1};let F=null,wt=null,ut=null,Tt=!1,zt=!0,Gt=!rt.matches;gt(rt,"change",()=>{rt.matches&&(Tt=!1,Gt=!1,un())});const fe=new Set,$e=.12,cn=new ft;gt(te,"click",dt=>{if(!(Yt>5)){if(!F){dt.shiftKey||Mi();return}if(dt.shiftKey&&wt&&F!==wt){Ji(wt,F);return}pa(F)}});const Xe=new Float32Array(g.length),rn=new Float32Array(g.length),fn=new Float32Array(x.length);let Xa="";const hi=o.labels,ei=document.createElement("canvas").getContext("2d"),$i=getComputedStyle(hi).fontFamily,ka=g.map(dt=>{const Dt=document.createElement("button");Dt.type="button",Dt.hidden=!0,Dt.className="g-lab",Dt.style.opacity="1",Dt.dataset.index=dt.i,Dt.textContent=dt.name,Dt.setAttribute("aria-label",(c==="en"?"Explore ":"探索知识点：")+dt.name);const Ot=()=>{we.live=!1,F=dt,hn()},Kt=()=>{F===dt&&(F=null,hn())};return gt(Dt,"click",he=>{he.stopPropagation(),kn(dt.i,he.shiftKey)}),gt(Dt,"pointerenter",Ot),gt(Dt,"pointerleave",Kt),gt(Dt,"focus",Ot),gt(Dt,"blur",Kt),hi.appendChild(Dt),Dt}),bo=[...g].sort((dt,Dt)=>M(Dt)-M(dt)),cs=HR();let w=performance.now(),Q=0,lt=0;const ct=re.getAttribute("position"),$=re.getAttribute("aAlpha"),Lt=re.getAttribute("aScale"),Pt=xt.getAttribute("position"),Zt=xt.getAttribute("aAlpha");X=requestAnimationFrame(Qt);const Xt=()=>{Gt=!rt.matches&&!Gt,un()},be=()=>{zt=!zt,un()},je=()=>{Tt=!rt.matches&&!Tt,un()},Jt=()=>Ue(m==="light"?"dark":"light");gt(window,"keydown",dt=>{if(/^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(dt.target.tagName)){dt.key==="Escape"&&dt.target.blur();return}dt.key==="Escape"?Mi():dt.key==="l"||dt.key==="L"?(zt=!zt,un()):dt.key==="r"||dt.key==="R"?Ye():dt.key===" "?(dt.preventDefault(),Tt=!rt.matches&&!Tt,un()):dt.key==="/"?(dt.preventDefault(),o.q.focus()):dt.key==="="||dt.key==="+"?ye(1/1.18):(dt.key==="-"||dt.key==="_")&&ye(1.18)});const kn=(dt,Dt=!1)=>{Dt&&wt&&wt!==g[dt]?Ji(wt,g[dt]):pa(g[dt])},xn=dt=>{F=dt===null?null:g[dt]};return Ue(m),sn(),me(null),un(),hn(),{setTheme:Ue,clearSel:Mi,setView:ee,toggleFlow:Xt,toggleLabel:be,toggleSpin:je,reset:Ye,toggleTheme:Jt,dolly:ye,zoomReset:xe,toggleCluster:Ne,selectAt:kn,hoverAt:xn,setQuery:ni,clearPath:Pi,centerOn:Wn,startPath:ta,dispose(){ot.abort(),cancelAnimationFrame(X),ka.forEach(dt=>dt.remove()),re.dispose(),xt.dispose(),Fe.dispose(),le.dispose(),Rt.dispose(),St.dispose(),te.remove()}}}}const Hx="cn",Wi=(o,n)=>o,VR="https://openstax.org/books/college-physics-2e/pages/",XR=[["s1","2.1 · 位移","2.1 · Displacement","2-1-displacement"],["s2","2.4 · 加速度","2.4 · Acceleration","2-4-acceleration"],["s3","4.2 · 牛顿第一定律","4.2 · Newton’s first law","4-2-newtons-first-law-of-motion-inertia"],["s4","4.3 · 牛顿第二定律","4.3 · Newton’s second law","4-3-newtons-second-law-of-motion-concept-of-a-system"],["s5","4.4 · 牛顿第三定律","4.4 · Newton’s third law","4-4-newtons-third-law-of-motion-symmetry-in-forces"],["s6","7.2 · 动能与动能定理","7.2 · Work & kinetic energy","7-2-kinetic-energy-and-the-work-energy-theorem"],["s7","7.3 · 重力势能","7.3 · Gravitational potential energy","7-3-gravitational-potential-energy"],["s8","7.6 · 能量守恒","7.6 · Conservation of energy","7-6-conservation-of-energy"],["s9","8.1 · 动量与力","8.1 · Momentum & force","8-1-linear-momentum-and-force"],["s10","8.3 · 动量守恒","8.3 · Conservation of momentum","8-3-conservation-of-momentum"]].map(([o,n,a,s])=>({id:o,title:Wi(n),url:VR+s})),kR=[{id:"motion",name:Wi("运动学"),light:"#365f9e",dark:"#a6d5ff",anchor:[-1.2,.8,0]},{id:"force",name:Wi("力与定律"),light:"#6853a5",dark:"#c7b4ff",anchor:[1,.8,.1]},{id:"energy",name:Wi("功与能"),light:"#956328",dark:"#f1d4a0",anchor:[-.9,-.9,.1]},{id:"momentum",name:Wi("动量与守恒"),light:"#865985",dark:"#e9b7e5",anchor:[1.1,-.9,-.1]}],jR=[["frame","motion","参考系","Reference frame","描述位置和运动前，先选定参照物和坐标方向。","Choose a reference object and coordinate directions before describing motion.","","s1","同一物体相对不同参考系的速度可以不同。","Velocity depends on the chosen reference frame."],["position","motion","位置","Position","位置描述物体在所选参考系中的所在之处。","Position locates an object within a chosen reference frame.","x(t)","s1","",""],["displacement","motion","位移","Displacement","从初位置指向末位置的变化量，有大小和方向。","The change from initial to final position; it has both magnitude and direction.","Δx = x₂ − x₁","s1","位移只看起点和终点，不等于实际走过的路程。","Displacement depends on the endpoints, not the path taken."],["distance","motion","路程","Distance traveled","沿实际路径累计的长度，是标量。","The total length of the traveled path, a scalar quantity.","s ≥ |Δx|","s1","走一圈回到起点时，位移为零，路程不为零。","A round trip can have zero displacement but nonzero distance."],["velocity","motion","速度","Velocity","位置随时间的变化率；方向是速度的一部分。","The rate of change of position, including direction.","v̄ = Δx / Δt","s2","",""],["acceleration","motion","加速度","Acceleration","速度随时间的变化率。速率不变而方向改变，也有加速度。","The rate of change of velocity. Turning at constant speed still involves acceleration.","ā = Δv / Δt","s2","负加速度不一定表示减速，要同时看速度方向。","Negative acceleration does not necessarily mean slowing down."],["deceleration","motion","减速运动","Slowing down","加速度与速度方向相反时，物体的速率减小。","Speed decreases when acceleration opposes velocity.","a · v < 0","s2","",""],["inertia","force","惯性","Inertia","物体保持原有运动状态的性质；质量衡量惯性的大小。","Resistance to changes in motion, measured by mass.","","s3","惯性不是一种力。","Inertia is not a force."],["mass","force","质量","Mass","质量是惯性的量度，相同合力下质量越大，加速度越小。","Mass measures inertia: a larger mass accelerates less under the same net force.","[m] = kg","s4","",""],["first","force","牛顿第一定律","Newton’s first law","在惯性参考系中，合外力为零时物体保持静止或匀速直线运动。","In an inertial frame, zero net external force means constant velocity, including rest.","ΣF = 0 ⇒ v = constant","s3","匀速运动不需要一个持续向前的合力。","Constant velocity does not require a forward net force."],["netforce","force","合外力","Net external force","作用于研究对象的所有外力的矢量和。","The vector sum of all external forces acting on the chosen system.","Fₙₑₜ = ΣF","s4","合力是矢量和，不是所有力大小的简单相加。","Add forces as vectors, not just their magnitudes."],["second","force","牛顿第二定律","Newton’s second law","质量不变时，加速度由合外力决定，并与合外力同向。","For constant mass, acceleration is determined by and points along the net external force.","ΣF = ma","s4","先确定研究对象，再画受力图；不要把内力算作外力。","Define the system before drawing its free-body diagram."],["third","force","牛顿第三定律","Newton’s third law","相互作用的两个物体对彼此施加大小相等、方向相反的力。","Interacting bodies exert forces equal in magnitude and opposite in direction on one another.","F₁₂ = −F₂₁","s5","这对力作用在不同物体上，不是同一物体的平衡力。","These forces act on different bodies; they do not cancel on one body."],["system","force","研究系统","System boundary","系统边界决定哪些力是外力、哪些是系统内部相互作用。","The system boundary determines which forces are external and which are internal.","","s4","",""],["weight","force","重力","Weight","近地表重力的大小约为质量乘以重力加速度。","Near Earth’s surface, weight is approximately mass times gravitational acceleration.","G = mg","s4","质量和重力不是同一物理量。","Mass and weight are different physical quantities."],["work","energy","功","Work","力沿位移方向的分量与位移的乘积，可用来描述能量转移。","Work transfers energy; for a constant force it is the force component along displacement times displacement.","W = Fd cos θ","s6","此式适用于恒力；与位移垂直的力不做功。","This formula assumes constant force; perpendicular forces do no work."],["network","energy","总功","Net work","所有力对物体做功的代数和，等于动能的改变量。","The sum of work done by all forces, equal to the change in kinetic energy.","Wₙₑₜ = ΣW","s6","",""],["kinetic","energy","动能","Kinetic energy","物体因运动而具有的能量；经典平动动能与速率的平方成正比。","Energy associated with motion; classical translational kinetic energy scales with speed squared.","Eₖ = ½mv²","s6","速度变为两倍，动能变为四倍；动能是标量。","Doubling speed quadruples kinetic energy; energy is a scalar."],["workenergy","energy","动能定理","Work–energy theorem","合力对物体做的总功等于该物体动能的变化。","The net work done on a body equals its change in kinetic energy.","Wₙₑₜ = ΔEₖ","s6","用总功，而不是只用某一个力的功。","Use the work of all forces, not just one."],["potential","energy","重力势能","Gravitational potential energy","近地表物体与地球组成的系统因相对高度而储存能量。","Near Earth’s surface, energy stored in the object–Earth system depends on relative height.","Eₚ = mgh","s7","零势能面可选；物理上重要的是势能差。","The zero level is arbitrary; changes in potential energy matter."],["mechanical","energy","机械能","Mechanical energy","系统的动能和势能之和。只有保守力做功时，机械能保持不变。","The sum of kinetic and potential energy, conserved when only conservative forces do work.","E = Eₖ + Eₚ","s8","",""],["conservation","energy","能量守恒","Energy conservation","能量可以在不同形式间转化或在系统间转移，总量守恒。","Energy can change form or transfer between systems; total energy is conserved.","ΔEₜₒₜₐₗ = 0 (isolated)","s8","机械能减少不表示总能量消失，可能转化为内能。","Loss of mechanical energy may become thermal energy, not disappear."],["momentum","momentum","动量","Momentum","质量与速度的乘积，是与速度方向相同的矢量。","The product of mass and velocity, a vector pointing along velocity.","p = mv","s9","动量相同的物体，动能不一定相同。","Equal momentum does not imply equal kinetic energy."],["change","momentum","动量变化","Momentum change","末动量减去初动量，方向与平均合外力相同。","Final minus initial momentum; it points along the average net external force.","Δp = p₂ − p₁","s9","",""],["impulse","momentum","冲量","Impulse","力在一段时间内的累积效应；合外力的冲量等于动量变化。","The accumulated effect of force over time; net impulse equals the change in momentum.","J = F̄Δt = Δp","s9","变力情形用平均力或对时间积分，不能任取瞬时力。","For varying forces, use the average force or integrate over time."],["isolated","momentum","孤立系统近似","Isolated-system approximation","系统所受合外力为零或在短时间内外力冲量可忽略时，可应用动量守恒。","Momentum is conserved when net external force is zero, or approximately when external impulse is negligible.","Jₑₓₜ ≈ 0","s10","",""],["momcon","momentum","动量守恒","Momentum conservation","合外力为零时，系统总动量保持不变。","A system’s total momentum stays constant when its net external force is zero.","Σpᵢ = Σp𝒇","s10","系统内部相互作用可以改变各物体的动量，但不改变总动量。","Internal interactions can change individual momenta while preserving the total."],["collision","momentum","碰撞","Collisions","碰撞分析先检查外力冲量能否忽略，再对整个系统应用动量守恒。","In a collision, first check whether external impulse is negligible, then apply momentum conservation to the whole system.","","s10","动量守恒不等于动能也守恒。","Conservation of momentum does not guarantee conservation of kinetic energy."]],qR=jR.map(([o,n,a,s,c,f,h,d,m,_])=>({id:o,cluster:n,name:Wi(a),summary:Wi(c),formula:h,sourceId:d,caution:Wi(m)})),YR=[["frame","position","定义参照","sets reference"],["position","displacement","变化量","change in"],["displacement","distance","区分","contrasts with","rel"],["displacement","velocity","时间变化率","rate over time"],["velocity","acceleration","时间变化率","rate over time"],["velocity","deceleration","方向比较","direction comparison"],["acceleration","deceleration","方向相反","opposes velocity"],["mass","inertia","衡量","measures"],["inertia","first","体现","expressed by"],["first","netforce","零合力情形","zero-force case","rel"],["netforce","second","决定加速度","determines acceleration"],["mass","second","决定响应","sets response"],["second","acceleration","产生","produces"],["system","netforce","划分内外力","defines external"],["system","third","内部相互作用","internal interaction"],["third","netforce","区分受力对象","distinct bodies","rel"],["mass","weight","近地表","near Earth"],["weight","netforce","参与矢量求和","contributes to","rel"],["netforce","work","沿位移作用","acts through displacement"],["displacement","work","提供位移","provides displacement"],["work","network","代数求和","summed as"],["velocity","kinetic","平方关系","squared dependence"],["mass","kinetic","线性关系","linear dependence"],["network","workenergy","改变动能","changes kinetic energy"],["kinetic","workenergy","变化量","change in"],["second","workenergy","联系","connects to","rel"],["weight","potential","克服重力做功","work against gravity"],["potential","mechanical","组成","part of"],["kinetic","mechanical","组成","part of"],["mechanical","conservation","特定条件下守恒","special case"],["work","conservation","转移能量","transfers energy","rel"],["mass","momentum","乘以速度","times velocity"],["velocity","momentum","决定方向","sets direction"],["momentum","change","矢量差","vector difference"],["netforce","impulse","在时间上累积","accumulates over time"],["impulse","change","等于","equals"],["second","impulse","动量形式","momentum form","rel"],["system","isolated","划定边界","sets boundary"],["isolated","momcon","适用条件","condition"],["momentum","momcon","系统求和","sum over system"],["third","momcon","内力成对","paired internal forces"],["momcon","collision","应用","applies to"],["collision","kinetic","不一定守恒","not always conserved","rel"]].map(([o,n,a,s,c])=>({from:o,to:n,label:Wi(a),kind:c||"pre"})),WR={id:"mechanics",title:Wi("力学知识星系"),subtitle:Wi("从运动出发，看见知识如何相连"),sample:!0,clusters:kR,concepts:qR,relations:YR,sources:XR},Ml={files:4,bytes:10*1024*1024,chars:6e4,pages:40};function ZR(o){const n=new Map(o.concepts.map(a=>[a.id,a]));return{clusters:o.clusters,nodes:o.concepts.map(a=>[a.name,a.cluster,Math.min(5,1+o.relations.filter(s=>s.from===a.id||s.to===a.id).length*.4),a.summary]),edges:o.relations.map(a=>[n.get(a.from).name,n.get(a.to).name,a.kind])}}function Pe({name:o,size:n=18}){const a={star:D.jsx(D.Fragment,{children:D.jsx("path",{d:"m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"})}),graph:D.jsxs(D.Fragment,{children:[D.jsx("path",{d:"m5 6 13-2-3 14L5 6l-2 13 12-1"}),D.jsx("circle",{cx:"5",cy:"6",r:"2"}),D.jsx("circle",{cx:"18",cy:"4",r:"2"}),D.jsx("circle",{cx:"15",cy:"18",r:"2"})]}),book:D.jsx(D.Fragment,{children:D.jsx("path",{d:"M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3Z M12 6v15"})}),plus:D.jsx("path",{d:"M12 5v14M5 12h14"}),minus:D.jsx("path",{d:"M5 12h14"}),search:D.jsxs(D.Fragment,{children:[D.jsx("circle",{cx:"10",cy:"10",r:"6"}),D.jsx("path",{d:"m15 15 5 5"})]}),sun:D.jsxs(D.Fragment,{children:[D.jsx("circle",{cx:"12",cy:"12",r:"4"}),D.jsx("path",{d:"M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"})]}),moon:D.jsx("path",{d:"M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"}),upload:D.jsx(D.Fragment,{children:D.jsx("path",{d:"M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"})}),close:D.jsx("path",{d:"m6 6 12 12M6 18 18 6"}),arrow:D.jsx("path",{d:"M5 12h14m-5-5 5 5-5 5"}),external:D.jsx("path",{d:"M13 4h7v7m0-7L10 14M9 4H4v16h16v-5"}),file:D.jsx(D.Fragment,{children:D.jsx("path",{d:"M5 3h9l5 5v13H5Z M14 3v6h5M8 13h8M8 17h5"})}),reset:D.jsx(D.Fragment,{children:D.jsx("path",{d:"M4 10a8 8 0 1 1 1 7M4 3v7h7"})}),orbit:D.jsxs(D.Fragment,{children:[D.jsx("circle",{cx:"12",cy:"12",r:"3"}),D.jsx("ellipse",{cx:"12",cy:"12",rx:"10",ry:"5",transform:"rotate(-35 12 12)"})]}),menu:D.jsx("path",{d:"M4 6h16M4 12h16M4 18h16"}),check:D.jsx("path",{d:"m5 12 4 4L19 6"}),download:D.jsx("path",{d:"M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"}),list:D.jsx("path",{d:"M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1"}),layers:D.jsx(D.Fragment,{children:D.jsx("path",{d:"m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5"})})};return D.jsx("svg",{width:n,height:n,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:a[o]||a.star})}function Up({title:o,onClose:n,children:a,wide:s=!1}){const c=He.useRef(null);return He.useEffect(()=>(c.current?.showModal(),()=>c.current?.close()),[]),D.jsxs("dialog",{ref:c,className:"g-dialog"+(s?" g-dialog-wide":""),"aria-label":o,onCancel:f=>{f.preventDefault(),n()},onClick:f=>{if(f.target===f.currentTarget){const h=f.currentTarget.getBoundingClientRect();(f.clientX<h.left||f.clientX>h.right||f.clientY<h.top||f.clientY>h.bottom)&&n()}},children:[D.jsxs("header",{className:"g-dialog-head",children:[D.jsx("h2",{children:o}),D.jsx("button",{className:"g-icon",onClick:n,"aria-label":"Close / 关闭",children:D.jsx(Pe,{name:"close"})})]}),a]})}const KR="modulepreload",QR=function(o,n){return new URL(o,n).href},sx={},JR=function(n,a,s){let c=Promise.resolve();if(a&&a.length>0){let _=function(g){return Promise.all(g.map(p=>Promise.resolve(p).then(x=>({status:"fulfilled",value:x}),x=>({status:"rejected",reason:x}))))};const h=document.getElementsByTagName("link"),d=document.querySelector("meta[property=csp-nonce]"),m=d?.nonce||d?.getAttribute("nonce");c=_(a.map(g=>{if(g=QR(g,s),g in sx)return;sx[g]=!0;const p=g.endsWith(".css"),x=p?'[rel="stylesheet"]':"";if(s)for(let T=h.length-1;T>=0;T--){const R=h[T];if(R.href===g&&(!p||R.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${g}"]${x}`))return;const M=document.createElement("link");if(M.rel=p?"stylesheet":KR,p||(M.as="script"),M.crossOrigin="",M.href=g,m&&M.setAttribute("nonce",m),document.head.appendChild(M),p)return new Promise((T,R)=>{M.addEventListener("load",T),M.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${g}`)))})}))}function f(h){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=h,window.dispatchEvent(d),!d.defaultPrevented)throw h}return c.then(h=>{for(const d of h||[])d.status==="rejected"&&f(d.reason);return n().catch(f)})},ze=(o,n)=>o,$R=ze(`# 细胞与能量
细胞膜：将细胞内部与外界分开，并选择性地控制物质进出。
细胞质：细胞膜以内、细胞核以外的部分，许多代谢反应在其中进行。
细胞核：储存遗传信息，参与调控细胞活动。
线粒体：真核细胞进行有氧呼吸的重要场所，产生ATP。
ATP：细胞中常用的直接能源物质，其水解可为细胞活动供能。
有氧呼吸：细胞利用氧气分解有机物，释放能量并合成ATP。
叶绿体：植物细胞进行光合作用的场所。
光合作用：利用光能把二氧化碳和水转化为有机物，并释放氧气。
联系：光合作用产生的有机物可用于有氧呼吸；有氧呼吸产生ATP，为多种细胞活动提供能量。`);function tC({onClose:o,onGenerated:n}){const[a,s]=He.useState("file"),[c,f]=He.useState([]),[h,d]=He.useState(""),[m,_]=He.useState(!1),[g,p]=He.useState("idle"),[x,M]=He.useState(""),[T,R]=He.useState(null),[S,y]=He.useState(!1),P=He.useRef(null),O=He.useRef(null),N=He.useRef(!0);He.useEffect(()=>{N.current=!0;const U=new AbortController;return fetch("/api/health",{signal:U.signal}).then(C=>C.json()).then(C=>R(!!C.configured)).catch(()=>{U.signal.aborted||R(!1)}),()=>{N.current=!1,U.abort(),O.current?.abort()}},[]);const et=g==="read"||g==="generate";async function V(U){M(""),p("read");try{if(U.length+c.length>Ml.files)throw new Error(ze("每次最多导入 4 份资料。","Import up to 4 documents at a time."));const C=[];for(const B of Array.from(U)){if(B.size>Ml.bytes)throw new Error(ze("文件超过 10 MB，请拆分后再上传。","The file exceeds 10 MB. Split it first."));const at=B.name.split(".").pop()?.toLowerCase();if(!["pdf","txt","md"].includes(at||""))throw new Error(ze("目前支持 PDF、TXT、Markdown，不支持此文件类型。","Use a PDF, TXT or Markdown file."));let ot="";if(at==="pdf"){const ht=await JR(()=>import("./pdf-gh-BrLFn.js"),[],import.meta.url);ht.GlobalWorkerOptions.workerSrc=new URL(""+new URL("pdf.worker.min-yatZIOMy.mjs",import.meta.url).href,import.meta.url).toString();const gt=ht.getDocument({data:await B.arrayBuffer(),isEvalSupported:!1});let X;try{if(X=await gt.promise,X.numPages>Ml.pages)throw new Error(ze("PDF 超过 40 页，请按章节拆分。","Split PDFs longer than 40 pages into chapters."));for(let rt=1;rt<=X.numPages;rt++){const Z=await X.getPage(rt),St=await Z.getTextContent();ot+=St.items.map(bt=>"str"in bt?bt.str+("hasEOL"in bt&&bt.hasEOL?`
`:" "):"").join("")+`
`}}finally{await gt.destroy()}}else ot=await B.text();if(ot.trim().length<30)throw new Error(ze("没有提取到足够文字。扫描版 PDF 请先做 OCR，或粘贴文字。","Not enough text. Run OCR on scanned PDFs, or paste the text."));C.push({id:crypto.randomUUID(),title:B.name,text:ot})}if([...c,...C].reduce((B,at)=>B+(at.text?.length||0),0)>Ml.chars)throw new Error(ze("资料合计超过 60,000 字符，请按章节拆分。","Keep the combined text under 60,000 characters."));N.current&&f(B=>[...B,...C])}catch(C){N.current&&M(C instanceof Error&&C.message&&!/password|Invalid PDF|worker/i.test(C.message)?C.message:ze("无法读取这份 PDF。请解密文件，或改用文字版资料。"))}finally{N.current&&p("idle"),P.current&&(P.current.value="")}}const I=a==="paste"?h.trim()?[{id:"pasted-note",title:ze("我的学习笔记"),text:h}]:[]:c;async function q(){if(!m||et)return;if(M(""),I.some(B=>(B.text?.trim().length||0)<30)||!I.length){M(ze("请先上传资料或输入至少 30 个字符。"));return}if(I.reduce((B,at)=>B+(at.text?.length||0),0)>Ml.chars){M(ze("资料超过 60,000 字符，请拆分。"));return}const U=new AbortController;O.current=U,p("generate");const C=setTimeout(()=>U.abort(),165e3);try{const B=await fetch("/api/graph",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({documents:I,language:Hx,consent:!0}),signal:U.signal}),at=await B.json();if(!B.ok)throw new Error(at.message||ze("生成失败，请重试。","Generation failed. Try again."));N.current&&n(at.graph)}catch(B){N.current&&M(B instanceof Error&&B.name==="AbortError"?ze("生成已取消或超时，可以缩短资料后重试。"):B instanceof Error?B.message:ze("无法连接生成服务。"))}finally{clearTimeout(C),N.current&&p("idle")}}return D.jsx(Up,{title:ze("让你的资料，连成星系"),onClose:o,children:D.jsxs("div",{className:"g-import-body",children:[D.jsx("p",{className:"g-subtitle",children:ze("上传课堂笔记、教材节选或复习资料，提取知识点与它们的联系。")}),D.jsxs("div",{className:"g-import-steps",children:[D.jsxs("span",{children:["01 ",ze("编辑笔记")]}),D.jsx("i",{}),D.jsxs("span",{children:["02 ",ze("提取知识")]}),D.jsx("i",{}),D.jsxs("span",{children:["03 ",ze("探索星图")]})]}),D.jsxs("div",{className:"g-tabs",children:[D.jsx("button",{"aria-pressed":a==="file",disabled:et,onClick:()=>{s("file"),M("")},children:ze("上传文件")}),D.jsx("button",{"aria-pressed":a==="paste",disabled:et,onClick:()=>{s("paste"),M("")},children:ze("粘贴文字")})]}),a==="file"?D.jsxs(D.Fragment,{children:[D.jsx("input",{ref:P,type:"file",accept:".pdf,.txt,.md",multiple:!0,hidden:!0,onChange:U=>{U.target.files&&V(U.target.files)}}),D.jsxs("button",{disabled:et,className:"g-dropzone"+(S?" is-drag":""),onClick:()=>P.current?.click(),onDragOver:U=>{U.preventDefault(),y(!0)},onDragLeave:()=>y(!1),onDrop:U=>{U.preventDefault(),y(!1),et||V(U.dataTransfer.files)},children:[D.jsx(Pe,{name:"upload",size:30}),D.jsx("strong",{children:ze(g==="read"?"正在读取资料文字…":"拖入资料，或点击选择")}),D.jsx("small",{children:"PDF · TXT · Markdown"}),D.jsx("small",{children:ze("每份 10 MB 内 · PDF 最多 40 页 · 不支持扫描件 OCR")})]}),c.length>0&&D.jsx("ul",{className:"g-file-list",children:c.map(U=>D.jsxs("li",{children:[D.jsx(Pe,{name:"file"}),D.jsxs("span",{children:[U.title,D.jsxs("small",{children:[U.text?.length.toLocaleString()," ",ze("字符")]})]}),D.jsx("button",{className:"g-icon",disabled:et,"aria-label":ze("移除 ")+U.title,onClick:()=>f(C=>C.filter(B=>B.id!==U.id)),children:D.jsx(Pe,{name:"close"})})]},U.id))})]}):D.jsxs("label",{className:"g-paste-label",children:[ze("学习资料正文"),D.jsx("textarea",{disabled:et,value:h,maxLength:60001,onChange:U=>d(U.target.value),placeholder:ze("粘贴你的笔记、知识定义或教材节选…")}),D.jsxs("small",{children:[h.length.toLocaleString()," / 60,000"]})]}),D.jsxs("button",{className:"g-text-button",disabled:et,onClick:()=>{s("paste"),d($R),M("")},children:[ze("没有资料？试用一份细胞生物学笔记")," ",D.jsx(Pe,{name:"arrow",size:15})]}),D.jsxs("label",{className:"g-consent",children:[D.jsx("input",{type:"checkbox",checked:m,disabled:et,onChange:U=>_(U.target.checked)}),D.jsxs("span",{children:[ze("同意将资料正文发送给 Agent Gateway 模型进行提取。请只使用有权处理的资料。"),D.jsx("small",{children:ze("原文件不上传，服务器不保存资料；图谱仅在当前页面会话保留。")})]})]}),T===!1&&D.jsx("p",{className:"g-warning",children:ze("生成服务暂不可用。请启动已配置模型的本地服务；示例图谱仍可使用。")}),x&&D.jsx("p",{role:"alert",className:"g-error",children:x}),g==="generate"&&D.jsxs("div",{className:"g-generation",role:"status",children:[D.jsx("div",{className:"g-skeleton"}),D.jsx("strong",{children:ze("正在识别概念、连接关系并核对出处")}),D.jsx("p",{children:ze("通常需要 30–90 秒。完成后将自动打开新星图。")})]}),D.jsxs("div",{className:"g-import-footer",children:[D.jsx("small",{children:ze("AI 生成内容请结合原文核对")}),D.jsxs("button",{className:"g-primary",disabled:!m||et||!I.length||T!==!0,onClick:()=>{q()},children:[D.jsx(Pe,{name:"star"}),ze(g==="generate"?"生成中…":"生成知识图谱")]})]})]})})}const It=(o,n)=>o,ox=window.BikoToolGraph||WR;function eC(){try{return localStorage.getItem("knowledge-atlas:theme")==="light"?"light":"dark"}catch{return"dark"}}const nC=Array.from({length:620},(o,n)=>{const a=s=>{const c=Math.sin(s*127.1+311.7)*43758.5453;return c-Math.floor(c)};return{x:a(n+1)*1400,y:a(n+901)*1e3,r:n%31===0?1.4:.35+a(n+90)*.7,opacity:.13+a(n+801)*.55}});function iC(){return D.jsxs("div",{className:"g-cosmos","aria-hidden":"true",children:[D.jsx("div",{className:"g-nebula"}),D.jsxs("svg",{className:"g-starfield",viewBox:"0 0 1400 1000",preserveAspectRatio:"xMidYMid slice",children:[D.jsxs("defs",{children:[D.jsx("filter",{id:"starglow",children:D.jsx("feGaussianBlur",{stdDeviation:"2"})}),D.jsxs("filter",{id:"cloudnoise",children:[D.jsx("feTurbulence",{type:"fractalNoise",baseFrequency:".008 .013",numOctaves:"4",seed:"12"}),D.jsx("feColorMatrix",{type:"saturate",values:"0"})]}),D.jsx("mask",{id:"cloudmask",children:D.jsx("rect",{width:"1400",height:"1000",filter:"url(#cloudnoise)"})}),D.jsxs("linearGradient",{id:"cloudcolor",x2:"1",y2:".8",children:[D.jsx("stop",{stopColor:"#3474b7",stopOpacity:"0"}),D.jsx("stop",{offset:".4",stopColor:"#7672d4"}),D.jsx("stop",{offset:".65",stopColor:"#366ebd"}),D.jsx("stop",{offset:"1",stopColor:"#272540",stopOpacity:"0"})]})]}),D.jsx("ellipse",{className:"g-cloud",cx:"700",cy:"530",rx:"760",ry:"290",transform:"rotate(-32 700 530)",fill:"url(#cloudcolor)",mask:"url(#cloudmask)"}),nC.map((o,n)=>D.jsxs("g",{opacity:o.opacity,children:[D.jsx("circle",{cx:o.x,cy:o.y,r:o.r,fill:"currentColor"}),n%31===0&&D.jsxs(D.Fragment,{children:[D.jsx("circle",{cx:o.x,cy:o.y,r:"4",fill:"currentColor",filter:"url(#starglow)",opacity:".7"}),D.jsx("path",{d:`M${o.x-3} ${o.y}h6M${o.x} ${o.y-3}v6`,stroke:"currentColor",strokeWidth:".4"})]})]},n))]})]})}function aC(){const[o,n]=He.useState(ox),[a,s]=He.useState([]),[c,f]=He.useState(eC),[h,d]=He.useState(""),[m,_]=He.useState([]),[g,p]=He.useState(null),[x,M]=He.useState(!1),[T,R]=He.useState("atlas"),[S,y]=He.useState({flow:!0,label:!0,spin:!1}),[P,O]=He.useState(null),[N,et]=He.useState(!1),[V,I]=He.useState(""),q=He.useRef(null),U=He.useRef(null),C=He.useRef(null),B=He.useRef({}),at=He.useRef(null);He.useEffect(()=>{p(null),_([]),d(""),R("atlas"),M(!1),C.current&&(C.current.value="");const pt=GR({els:{stage:q.current,labels:U.current,q:C.current,...B.current},data:ZR(o),initialTheme:c,language:Hx,emit:{gate:M,list:()=>{},drawer:A=>p(A?.i??null),tools:y,theme:()=>{}}});return at.current=pt,()=>{pt.dispose(),at.current=null}},[o]),He.useEffect(()=>{document.documentElement.dataset.theme=c,at.current?.setTheme(c);try{localStorage.setItem("knowledge-atlas:theme",c)}catch{I(It("主题仅在本次页面生效，浏览器禁止保存。"))}},[c]),He.useEffect(()=>{if(!V)return;const pt=setTimeout(()=>I(""),4500);return()=>clearTimeout(pt)},[V]);const ot=(pt,A=!1)=>{x?p(pt):at.current?.selectAt(pt,A),et(!1)},ht=g===null?null:o.concepts[g],gt=o.sources.find(pt=>pt.id===ht?.sourceId),X=ht?o.relations.filter(pt=>pt.from===ht.id||pt.to===ht.id):[],rt=o.concepts.map((pt,A)=>({...pt,i:A})).filter(pt=>!m.includes(pt.cluster)&&(!h||(pt.name+" "+pt.summary).toLowerCase().includes(h.toLowerCase()))),Z=o.concepts.map((pt,A)=>({...pt,i:A,degree:o.relations.filter(k=>k.from===pt.id||k.to===pt.id).length})).sort((pt,A)=>A.degree-pt.degree).slice(0,3),St=pt=>o.clusters.find(A=>A.id===pt)?.[c]||"currentColor",bt=pt=>{n(pt),et(!1)};function Vt(){const pt=new Blob([JSON.stringify({...o,sources:o.sources.map(({text:H,...W})=>W)},null,2)],{type:"application/json"}),A=URL.createObjectURL(pt),k=document.createElement("a");k.href=A,k.download="knowledge-atlas.json",k.click(),setTimeout(()=>URL.revokeObjectURL(A),1e3),I(It("已请求导出图谱，请查看浏览器下载记录。"))}const ce=D.jsx("div",{className:"g-concept-list",children:rt.length?rt.map(pt=>D.jsxs("button",{className:g===pt.i?"is-selected":"",onClick:A=>{ot(pt.i,A.shiftKey),O(null)},children:[D.jsx("i",{style:{background:St(pt.cluster)}}),D.jsx("span",{children:pt.name}),D.jsx(Pe,{name:"arrow",size:14})]},pt.id)):D.jsx("p",{className:"g-empty",children:It("没有匹配的知识点，试试别的关键词或开启更多分区。")})});return D.jsxs("div",{className:"g-app",children:[D.jsxs("header",{className:"g-topbar",children:[D.jsx("button",{className:"g-icon g-mobile-menu","aria-label":It("打开资料导航"),onClick:()=>et(!N),children:D.jsx(Pe,{name:"menu"})}),D.jsxs("a",{className:"g-brand",href:"./","aria-label":It("知识星图首页"),children:[D.jsx("span",{className:"g-logo",children:D.jsx(Pe,{name:"graph",size:23})}),D.jsxs("span",{children:[It("知识星图"),D.jsx("small",{children:"KNOWLEDGE ATLAS"})]})]}),D.jsxs("div",{className:"g-breadcrumb",children:[It("我的知识空间"),D.jsx("span",{children:"/"}),D.jsx("b",{children:o.sample?It("物理 · 力学"):It("我的资料")})]}),D.jsxs("div",{className:"g-top-actions",children:[D.jsxs("label",{className:"g-search",children:[D.jsx(Pe,{name:"search",size:17}),D.jsx("input",{ref:C,value:h,onChange:pt=>{d(pt.target.value),at.current?.setQuery(pt.target.value)},"aria-label":It("搜索知识点"),placeholder:It("搜索知识点…")}),D.jsx("kbd",{children:"/"})]}),D.jsx("button",{className:"g-icon g-theme","aria-label":It(c==="dark"?"切换亮色主题":"切换暗色主题"),title:It(c==="dark"?"亮色模式":"暗色模式"),onClick:()=>f(pt=>pt==="dark"?"light":"dark"),children:D.jsx(Pe,{name:c==="dark"?"sun":"moon"})}),D.jsxs("button",{className:"g-primary g-top-import","aria-label":It("编辑笔记"),onClick:()=>window.parent.postMessage({type:"biko-tools:notes"},location.origin),children:[D.jsx(Pe,{name:"plus"}),D.jsx("span",{children:It("编辑笔记")})]})]})]}),D.jsxs("div",{className:"g-workspace",children:[N&&D.jsx("button",{className:"g-sidebar-shade","aria-label":It("关闭导航"),onClick:()=>et(!1)}),D.jsxs("aside",{className:"g-sidebar"+(N?" is-open":""),children:[D.jsxs("div",{className:"g-space-label",children:[D.jsx("span",{children:It("探索空间")}),D.jsx("span",{children:"01"})]}),D.jsxs("button",{className:"g-nav is-active",onClick:()=>{at.current?.reset(),p(null),et(!1)},children:[D.jsx(Pe,{name:"graph"}),It("知识图谱"),D.jsx("i",{})]}),D.jsxs("button",{className:"g-nav",onClick:()=>{O("sources"),et(!1)},children:[D.jsx(Pe,{name:"book"}),It("来源资料"),D.jsx("b",{children:o.sources.length})]}),D.jsxs("div",{className:"g-side-section",children:[D.jsxs("div",{className:"g-section-title",children:[It("知识分区"),D.jsx("small",{children:o.clusters.length})]}),o.clusters.map(pt=>D.jsxs("button",{className:"g-cluster"+(m.includes(pt.id)?" is-muted":""),"aria-pressed":!m.includes(pt.id),onClick:()=>{_(A=>A.includes(pt.id)?A.filter(k=>k!==pt.id):[...A,pt.id]),at.current?.toggleCluster(pt.id)},children:[D.jsx("i",{style:{background:pt[c]}}),D.jsx("span",{children:pt.name}),D.jsx("b",{children:o.concepts.filter(A=>A.cluster===pt.id).length})]},pt.id))]}),h?D.jsxs("div",{className:"g-side-section",children:[D.jsxs("div",{className:"g-section-title",children:[It("搜索结果"),D.jsx("small",{children:rt.length})]}),ce]}):D.jsxs("div",{className:"g-side-section",children:[D.jsx("div",{className:"g-section-title",children:It("我的图谱")}),D.jsxs("button",{className:"g-library-item"+(o.sample?" is-current":""),onClick:()=>bt(ox),children:[D.jsx(Pe,{name:"graph"}),D.jsxs("span",{children:[It("当前笔记"),D.jsx("small",{children:It("与笔记导图共用内容")})]})]}),a.map(pt=>D.jsxs("button",{className:"g-library-item"+(pt.id===o.id?" is-current":""),onClick:()=>bt(pt),children:[D.jsx(Pe,{name:"file"}),D.jsxs("span",{children:[pt.title,D.jsxs("small",{children:[pt.concepts.length," ",It("个知识点 · 本次会话")]})]})]},pt.id))]}),D.jsxs("div",{className:"g-sidebar-bottom",children:[D.jsxs("div",{className:"g-hub-title",children:[D.jsx("span",{children:It("关键知识点")}),D.jsx("small",{children:It("连接数")})]}),Z.map(pt=>D.jsxs("button",{className:"g-hub",onClick:()=>ot(pt.i),children:[D.jsx("span",{children:pt.name}),D.jsx("small",{children:pt.degree}),D.jsx(Pe,{name:"arrow",size:12})]},pt.id)),D.jsx("small",{children:It("笔记保存在当前浏览器，可导出图谱备份")})]})]}),D.jsxs("main",{className:"g-main","aria-label":It("知识图谱工作区"),children:[D.jsx(iC,{}),D.jsx("div",{className:"g-graph-stage",ref:q,children:D.jsx("div",{className:"g-labels",ref:U})}),D.jsxs("section",{className:"g-map-heading",children:[D.jsxs("div",{className:"g-map-kicker",children:[D.jsx("span",{}),o.sample?It("示例星系 · 高中 / 大学基础物理"):It("从你的资料生成")]}),D.jsx("h1",{children:o.title}),D.jsx("p",{children:o.subtitle}),D.jsxs("div",{className:"g-map-meta",children:[D.jsxs("span",{children:[D.jsx("b",{children:o.concepts.length})," ",It("知识点")]}),D.jsx("i",{}),D.jsxs("span",{children:[D.jsx("b",{children:o.relations.length})," ",It("关联")]}),D.jsx("i",{}),D.jsxs("button",{onClick:()=>O("sources"),children:[o.sources.length," ",It("篇来源")," ",D.jsx(Pe,{name:"external",size:12})]})]})]}),D.jsxs("div",{className:"g-map-corner",children:[D.jsx("span",{className:"g-live-dot"}),It("可交互三维星图")]}),D.jsxs("div",{className:"g-pathbar",ref:pt=>{pt&&(B.current.pathbar=pt)},children:[D.jsx("span",{ref:pt=>{pt&&(B.current.chain=pt)}}),D.jsx("button",{className:"g-icon","aria-label":It("清除路径"),onClick:()=>at.current?.clearPath(),children:D.jsx(Pe,{name:"close"})})]}),(h||x||m.length===o.clusters.length)&&D.jsxs("div",{className:"g-map-message",children:[D.jsx("strong",{children:x?It("当前设备不支持三维图谱"):rt.length?It("找到 "+rt.length+" 个知识点",rt.length+" concepts found"):It("暂时没有显示的知识点")}),D.jsxs("button",{onClick:()=>O("concepts"),children:[It("打开知识点列表"),D.jsx(Pe,{name:"list"})]}),m.length===o.clusters.length&&D.jsx("button",{onClick:()=>{m.forEach(pt=>at.current?.toggleCluster(pt)),_([])},children:It("显示全部分区")})]}),!ht&&!h&&!x&&D.jsxs("div",{className:"g-explore-note",children:[D.jsx(Pe,{name:"star",size:20}),D.jsxs("div",{children:[D.jsx("strong",{children:It("一个知识点，一片新星空")}),D.jsx("p",{children:It("点击星点，探索概念、公式与资料出处")})]})]}),D.jsxs("div",{className:"g-map-footer",children:[D.jsxs("div",{className:"g-view-controls","aria-label":It("图谱工具"),children:[[["atlas","graph",It("星图")],["shell","orbit",It("球面")],["tier","layers",It("分层")]].map(([pt,A,k])=>D.jsxs("button",{"aria-label":k,"aria-pressed":T===pt,onClick:()=>{R(pt),at.current?.setView(pt)},children:[D.jsx(Pe,{name:A,size:17}),D.jsx("span",{children:k})]},pt)),D.jsx("i",{}),D.jsx("button",{"aria-label":It("拉远"),onClick:()=>at.current?.dolly(1.18),children:D.jsx(Pe,{name:"minus",size:17})}),D.jsx("button",{className:"g-zoom",ref:pt=>{pt&&(B.current.zlvl=pt)},"aria-label":It("恢复默认缩放"),onClick:()=>at.current?.zoomReset(),children:"100%"}),D.jsx("button",{"aria-label":It("拉近"),onClick:()=>at.current?.dolly(1/1.18),children:D.jsx(Pe,{name:"plus",size:17})}),D.jsx("i",{}),D.jsx("button",{"aria-label":It("复位视角"),onClick:()=>at.current?.reset(),children:D.jsx(Pe,{name:"reset",size:17})})]}),D.jsxs("div",{className:"g-secondary-controls",children:[D.jsxs("button",{"aria-pressed":S.spin,title:It("自动旋转"),onClick:()=>at.current?.toggleSpin(),children:[D.jsx(Pe,{name:"orbit",size:16}),D.jsx("span",{children:It("自转")})]}),D.jsx("button",{"aria-pressed":S.flow,onClick:()=>at.current?.toggleFlow(),children:It("流光")}),D.jsx("button",{"aria-pressed":S.label,onClick:()=>at.current?.toggleLabel(),children:It("标签")}),D.jsx("button",{"aria-label":It("打开知识点列表"),onClick:()=>O("concepts"),children:D.jsx(Pe,{name:"list",size:17})}),D.jsx("button",{"aria-label":It("导出图谱"),onClick:Vt,children:D.jsx(Pe,{name:"download",size:17})})]})]}),D.jsxs("div",{className:"g-gesture-hint",children:[It("拖拽旋转 · 滚轮缩放 · 点击星点探索"),D.jsx("span",{children:It("SHIFT + 点击第二个节点，追溯连接路径")})]}),D.jsx("div",{hidden:!0,children:["hudMode","hudSel","sNode","sEdge","sDeg","sFps"].map(pt=>D.jsx("span",{ref:A=>{A&&(B.current[pt]=A)}},pt))}),ht&&D.jsxs("section",{className:"g-detail","aria-label":It("知识点详情"),children:[D.jsxs("header",{children:[D.jsxs("span",{style:{color:St(ht.cluster)},children:[D.jsx("i",{style:{background:St(ht.cluster)}}),o.clusters.find(pt=>pt.id===ht.cluster)?.name]}),D.jsx("button",{className:"g-icon","aria-label":It("关闭知识点详情"),onClick:()=>{at.current?.clearSel(),p(null)},children:D.jsx(Pe,{name:"close"})})]}),D.jsxs("div",{className:"g-detail-content",children:[D.jsx("div",{className:"g-detail-star",style:{color:St(ht.cluster)},children:D.jsx(Pe,{name:"star",size:32})}),D.jsx("h2",{children:ht.name}),D.jsx("p",{children:ht.summary}),ht.formula&&D.jsx("div",{className:"g-formula",children:ht.formula}),ht.caution&&D.jsxs("div",{className:"g-caution",children:[D.jsx("strong",{children:It("理解关键")}),D.jsx("p",{children:ht.caution})]}),D.jsxs("h3",{children:[It("知识连接")," ",D.jsx("small",{children:X.length})]}),D.jsx("div",{className:"g-neighbors",children:X.map((pt,A)=>{const k=pt.from===ht.id?pt.to:pt.from,H=o.concepts.find(W=>W.id===k);return D.jsxs("button",{onClick:W=>ot(o.concepts.indexOf(H),W.shiftKey),children:[D.jsx("i",{style:{background:St(H.cluster)}}),D.jsxs("span",{children:[H.name,D.jsxs("small",{children:[pt.from===ht.id?"→ ":"← ",pt.label]})]}),D.jsx(Pe,{name:"arrow",size:15})]},A)})}),D.jsx("h3",{children:It("资料出处")}),gt&&D.jsxs("div",{className:"g-source-card",children:[D.jsx(Pe,{name:"file"}),D.jsxs("div",{children:[D.jsx("strong",{children:gt.title}),o.sample&&D.jsx("small",{children:"OpenStax · College Physics 2e"}),gt.url&&D.jsxs("a",{href:gt.url,target:"_blank",rel:"noreferrer",children:[It("阅读原章节")," ",D.jsx(Pe,{name:"external",size:13})]})]})]}),ht.excerpt&&D.jsx("blockquote",{children:ht.excerpt}),D.jsx("small",{className:"g-source-disclaimer",children:o.sample?It("根据公开教材知识整理；概念摘要与连接为编辑整理。"):It("摘录已与资料文字匹配；AI 的概念解释和关系仍需核对。")})]}),D.jsxs("footer",{children:[D.jsx("button",{className:"g-secondary",onClick:()=>at.current?.centerOn(g),children:It("以此为中心")}),D.jsx("button",{className:"g-primary",onClick:()=>at.current?.startPath(g),children:It("追溯知识路径")})]})]})]})]}),P==="import"&&D.jsx(tC,{onClose:()=>O(null),onGenerated:pt=>{s(A=>[...A,pt]),n(pt),O(null),I(It("已生成 "+pt.concepts.length+" 个知识点，点击星点查看出处。","Generated "+pt.concepts.length+" concepts. Select a star to view its source."))}}),P==="concepts"&&D.jsx(Up,{title:It("探索知识点"),onClose:()=>O(null),children:D.jsxs("div",{className:"g-dialog-content",children:[D.jsx("p",{className:"g-subtitle",children:It("键盘或触摸均可选择；Shift + 选择第二个节点查看路径。")}),ce]})}),P==="sources"&&D.jsx(Up,{title:It("这片星系，来自这些资料"),onClose:()=>O(null),children:D.jsxs("div",{className:"g-dialog-content",children:[D.jsx("p",{className:"g-subtitle",children:o.sample?It("示例选取适合高中复习与大学基础物理学习的公开教材内容。知识点为自写摘要，每个节点对应具体章节。"):It("原文件未保存到服务器。点击知识点可查看对应摘录。")}),o.sources.map(pt=>D.jsxs("div",{className:"g-source-row",children:[D.jsx(Pe,{name:"file"}),D.jsxs("div",{children:[D.jsx("strong",{children:pt.title}),D.jsxs("small",{children:[o.concepts.filter(A=>A.sourceId===pt.id).length," ",It("个知识点"),o.sample?" · OpenStax":""]})]}),pt.url&&D.jsx("a",{className:"g-icon","aria-label":It("阅读 ")+pt.title,href:pt.url,target:"_blank",rel:"noreferrer",children:D.jsx(Pe,{name:"external"})})]},pt.id)),o.sample&&D.jsxs("p",{className:"g-license",children:["Paul Peter Urone & Roger Hinrichs · College Physics 2e · OpenStax. ",D.jsx("a",{href:"https://openstax.org/books/college-physics-2e/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units",target:"_blank",rel:"noreferrer",children:"Access for free at OpenStax"}),". ",It("教材现行许可 CC BY-NC-SA 4.0。本站不转载教材正文或插图。")]}),D.jsxs("button",{className:"g-primary",onClick:()=>window.parent.postMessage({type:"biko-tools:notes"},location.origin),children:[D.jsx(Pe,{name:"plus"}),It("编辑共同笔记")]})]})}),V&&D.jsxs("div",{className:"g-toast",role:"status",children:[D.jsx(Pe,{name:"check"}),V]})]})}wM.createRoot(document.getElementById("root")).render(D.jsx(He.StrictMode,{children:D.jsx(aC,{})}));
