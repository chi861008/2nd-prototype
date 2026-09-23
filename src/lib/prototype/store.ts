'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { initialState, reduce, type Action } from './model';
import type { PrototypeState } from './types';
const KEY='counter-study-v1';
const SCROLL_KEY=KEY+':scroll-sync';
export type PosScrollSyncEvent={event:'POS_SCROLL_SYNC';direction:'UP'|'DOWN';top_item_id:string;bottom_item_id:string;order_id:string;sent_at:number};
let state=initialState();
state.order.id='initial';
state.order.number='—';
const server=state;
let initialized=false;
let channel:BroadcastChannel|null=null;
const listeners=new Set<()=>void>();
const scrollListeners=new Set<(event:PosScrollSyncEvent)=>void>();
let error='';
const notify=()=>listeners.forEach(fn=>fn());
function isScrollSyncEvent(raw:unknown):raw is PosScrollSyncEvent{
 if(!raw||typeof raw!=='object')return false;
 const event=raw as Partial<PosScrollSyncEvent>;
 return event.event==='POS_SCROLL_SYNC'&&(event.direction==='UP'||event.direction==='DOWN')&&typeof event.top_item_id==='string'&&typeof event.bottom_item_id==='string'&&typeof event.order_id==='string'&&typeof event.sent_at==='number';
}
function accept(raw:unknown){
 if(!raw||typeof raw!=='object')return;
 const s=raw as PrototypeState;
 if(s.version===1&&Array.isArray(s.order?.lines)&&Array.isArray(s.slides)&&s.revision>state.revision){state=s;notify();}
}
function receive(raw:unknown){
 if(isScrollSyncEvent(raw)){scrollListeners.forEach(listener=>listener(raw));return;}
 accept(raw);
}
function init(){
 if(initialized||typeof window==='undefined')return;
 initialized=true;
 try{const raw=localStorage.getItem(KEY);if(raw)accept(JSON.parse(raw));}catch{error='無法讀取本機儲存，請確認瀏覽器允許網站資料。';}
 if(typeof BroadcastChannel !== 'undefined'){channel=new BroadcastChannel(KEY);channel.onmessage=e=>receive(e.data);}
 window.addEventListener('storage',e=>{if((e.key===KEY||e.key===SCROLL_KEY)&&e.newValue){try{receive(JSON.parse(e.newValue));}catch{}}});
 setInterval(()=>dispatch({type:'tick',now:Date.now()}),150);
 notify();
}
export function dispatch(action:Action){
 const next=reduce(state,action);if(next===state)return;
 state=next;
 try{localStorage.setItem(KEY,JSON.stringify(state));error='';}catch{error='本機儲存空間不足：本次變更僅暫存，重新整理可能遺失。請移除上傳圖片。';}
 channel?.postMessage(state);notify();
}
export function publishScrollSync(event:PosScrollSyncEvent){
 if(typeof window==='undefined')return;
 init();
 if(channel)channel.postMessage(event);
 else try{localStorage.setItem(SCROLL_KEY,JSON.stringify(event));}catch{}
}
export function subscribeScrollSync(listener:(event:PosScrollSyncEvent)=>void){
 scrollListeners.add(listener);
 return()=>{scrollListeners.delete(listener);};
}
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export function usePrototype(){
 const value=useSyncExternalStore(subscribe,()=>state,()=>server);
 useEffect(()=>{init();},[]);
 return {state:value,dispatch,error};
}
