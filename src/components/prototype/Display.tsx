'use client';
import {useEffect,useRef,useState} from 'react';
import {usePrototype} from '@/lib/prototype/store';
import {lineTotals,money,totals} from '@/lib/prototype/model';
import type {OrderLine,Modifier} from '@/lib/prototype/types';
import Marketing from './Marketing';
function Mods({items}:{items:Modifier[]}){return items.map(m=><div className="modifier" key={m.id}><span>＋{m.name}</span><span>＋{money(m.price)}</span></div>);}
function Specifications({specs}:{specs:string[]}){return specs.length?<p>{specs.join('／')}</p>:null;}
function Line({line,highlight}:{line:OrderLine;highlight:boolean}){
 const t=lineTotals(line);
 return <article data-line-id={line.id} className={'order-line '+(highlight?'highlight':'')}>
 <div className="line-main"><span className={line.children.length ? "quantity combo-quantity" : "quantity quantity-box"} aria-label={line.quantity+" 份"}>{line.quantity}{line.children.length>0&&"×"}</span><strong>{line.name}</strong><strong className="line-price">{money(t.net)}</strong></div>
 <div className="line-detail">
 {line.complimentary&&<p className="gift-label">招待 · 原價 {money(t.gross)} · 實付 NT$0</p>}
 <Specifications specs={line.children.length?[]:line.specs}/><Mods items={line.modifiers}/>
 {line.children.map(c=><div className="combo-child" key={c.id}><div className="child-heading"><span className="quantity-box" aria-label="每組 1 份">1</span><strong>{c.name}</strong></div><Specifications specs={c.specs}/><Mods items={c.modifiers}/>{c.note&&<p className="note">備註：{c.note}</p>}</div>)}
 {line.note&&<p className="note">備註：{line.note}</p>}
 {t.discount>0&&<div className="discount-row"><span>{line.discount?.label}</span><strong>−{money(t.discount)}</strong></div>}
 </div></article>;
}
export default function Display(){
 const {state:s}=usePrototype();
 const [now,setNow]=useState(0);
 const list=useRef<HTMLDivElement>(null);
 const t=totals(s.order);
 const giftedLines=s.order.lines.filter(l=>l.complimentary);
 const regularLines=s.order.lines.filter(l=>!l.complimentary);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),200);return()=>clearInterval(timer);},[]);
 useEffect(()=>{
 const box=list.current;if(!box)return;
 const el=Array.from(box.querySelectorAll<HTMLElement>('[data-line-id]')).find(x=>x.dataset.lineId===s.focusId);
 if(el){const top=el.offsetTop;const bottom=top+el.offsetHeight;box.scrollTo({top:el.offsetHeight>box.clientHeight?top:Math.max(0,bottom-box.clientHeight),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 },[s.focusAt,s.focusId,s.stage]);
 const seconds=Math.min(5,Math.max(0,Math.ceil((s.paused?s.remaining:(s.deadline??now)-now)/1000)));
 if(s.stage==='idle')return <main className="customer idle"><Marketing slides={s.slides}/></main>;
 if(s.stage==='completed')return <main className="customer completion"><div className="complete-brand">日常茶事 <span>EVERYDAY TEA</span></div><div className="completed-card"><div className="checkmark" aria-hidden="true">✓</div><p className="eyebrow">THANK YOU</p><h1>付款完成</h1><p className="thanks">謝謝你，讓好茶成為日常。</p><div className="completed-total"><span>訂單總額</span><strong>{money(t.total)}</strong></div><div className="payment-list">{s.order.payments.map(p=><div key={p.id}><span>{p.method}</span><strong>{money(p.amount)}</strong></div>)}</div>{t.change>0&&<div className="change-row"><span>請收好找零</span><strong>{money(t.change)}</strong></div>}<div className="pickup"><span>取餐號碼</span><strong>{s.order.number}</strong><span>請留意叫號</span></div><p className="countdown">{seconds} 秒後返回首頁</p></div></main>;
 return <main className="customer split"><Marketing slides={s.slides}/><section className="transaction"><header className="transaction-head"><div><h1>{s.stage==='ordering'?'確認你的好茶':'正在付款'}</h1></div></header>
 <div ref={list} className="order-list">{giftedLines.length>0&&<section className="pinned-gifts" aria-label="招待品項"><div className="pinned-label">招待品項</div>{giftedLines.map(l=><Line key={l.id} line={l} highlight={l.id===s.focusId&&now-s.focusAt<1800}/>)}</section>}<div className="scrollable-lines">{regularLines.length?regularLines.map(l=><Line key={l.id} line={l} highlight={l.id===s.focusId&&now-s.focusAt<1800}/>):!giftedLines.length&&<div className="empty-order"><span>好茶，正在準備中</span><p>加入餐點後，訂單明細將顯示於此。</p></div>}</div></div>
 <footer className="order-summary">
 {(s.order.member||s.order.invoice||t.discount>0)&&<div className="summary-meta"><div className="identity">{s.order.member&&<span>會員 <strong>{s.order.member.name}</strong></span>}{s.order.invoice&&<span>{s.order.invoice.type==='taxId'?'統編':'載具'} <strong>{s.order.invoice.value}</strong></span>}</div>{t.discount>0&&<div className="summary-discount"><span>總折扣</span><strong>−{money(t.discount)}</strong></div>}</div>}
 {s.stage==='paying'&&<div className="payment-strip"><span>已付 {money(t.paid)}</span><span>付款後待付金額</span></div>}
 <div className="summary-bottom"><div className="summary-facts"><span>共 <strong>{t.quantity}</strong> 項</span></div><div className="grand-total"><span>{s.stage==='ordering'?'總計':'待付金額'}</span><strong><small>NT$</small>{(s.stage==='paying'?t.unpaid:t.total).toLocaleString('zh-TW')}</strong></div></div>
 </footer></section></main>;
}