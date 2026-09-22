'use client';
import {useEffect,useState} from 'react';
import type {MarketingSlide} from '@/lib/prototype/types';
export default function Marketing({slides}:{slides:MarketingSlide[]}){
 const [index,setIndex]=useState(0);
 const slide=slides[index%Math.max(slides.length,1)];
 useEffect(()=>{const timer=setTimeout(()=>setIndex(i=>i+1),(slide?.seconds??5)*1000);return()=>clearTimeout(timer);},[index,slide]);
 return <section className={'marketing tone-'+(index%3)} aria-label="品牌行銷">
 <div className="brand"><span className="brand-mark">日</span><div>日常茶事<small>EVERYDAY TEA</small></div></div>
 {slide?.image ? <div className="uploaded-ad" style={{backgroundImage:'url("'+slide.image+'")'}} role="img" aria-label={slide.title}/> :
 <><div className="ad-copy"><span className="eyebrow">A LITTLE PAUSE, A GOOD CUP.</span><h1>{slide?.title??'歡迎光臨，日常茶事。'}</h1><p>{slide?.subtitle??'每日現泡・原葉純茶'}</p></div>
 <div className="cup-scene" aria-hidden="true"><div className="cup cup-back"><div className="straw"/><div className="cup-lid"/><div className="cup-body"><span>日常<br/>茶事</span></div></div><div className="cup"><div className="straw"/><div className="cup-lid"/><div className="cup-body"><span>日常<br/>茶事</span></div></div><span className="scene-caption">用一杯茶，把日常慢下來。</span></div></>}
 <footer><span>好茶，日常就好。</span><div className="dots">{slides.map((s,i)=><i key={s.id} className={i===index%slides.length?'active':''}/>)}</div><span>{String(index%Math.max(slides.length,1)+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span></footer>
 </section>;
}
