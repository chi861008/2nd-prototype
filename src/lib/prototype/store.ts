'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { initialState, pageCount, reduce, type Action } from './model';
import type { PrototypeState } from './types';
const KEY='counter-study-v1';
const AD_CLEANUP_KEY='counter-study-v1-default-ads-cleaned';
let state=initialState();
state.order.id='initial';
state.order.number='—';
const server=state;
let initialized=false;
let channel:BroadcastChannel|null=null;
const listeners=new Set<()=>void>();
let error='';
const notify=()=>listeners.forEach(fn=>fn());
function accept(raw:unknown){
 if(!raw||typeof raw!=='object')return;
 const s=raw as PrototypeState;
 if(s.version===1&&Array.isArray(s.order?.lines)&&Array.isArray(s.slides)&&s.revision>state.revision){state={...s,pinComplimentary:Boolean((s as PrototypeState).pinComplimentary),page:Math.max(1,Math.min(pageCount(s.order),typeof s.page==='number'?s.page:1))};notify();}
}
function init(){
 if(initialized||typeof window==='undefined')return;
 initialized=true;
 try{const raw=localStorage.getItem(KEY);if(raw)accept(JSON.parse(raw));if(!localStorage.getItem(AD_CLEANUP_KEY)){const clean=state.slides.filter(slide=>!slide.image);if(clean.length!==state.slides.length){state={...state,slides:clean,revision:Date.now()};localStorage.setItem(KEY,JSON.stringify(state));}localStorage.setItem(AD_CLEANUP_KEY,'1');}}catch{error='無法讀取本機儲存，請確認瀏覽器允許網站資料。';}
 if(typeof BroadcastChannel !== 'undefined'){channel=new BroadcastChannel(KEY);channel.onmessage=e=>accept(e.data);}
 window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{accept(JSON.parse(e.newValue));}catch{}}});
 setInterval(()=>dispatch({type:'tick',now:Date.now()}),150);
 notify();
}
export function dispatch(action:Action){
 const next=reduce(state,action);if(next===state)return;
 state=next;
 try{localStorage.setItem(KEY,JSON.stringify(state));error='';}catch{error='本機儲存空間不足：本次變更僅暫存，重新整理可能遺失。請移除上傳圖片。';}
 channel?.postMessage(state);notify();
}
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export function usePrototype(){
 const value=useSyncExternalStore(subscribe,()=>state,()=>server);
 useEffect(()=>{init();},[]);
 return {state:value,dispatch,error};
}
