'use client';
import {useState} from 'react';
import Control from './Control';
export default function Preview(){const [size,setSize]=useState('1366');return <main className="preview"><div className="preview-control"><Control compact/></div><section className="preview-display"><header><div><span className="eyebrow">LIVE CUSTOMER VIEW</span><h2>顧客端即時預覽</h2></div><label>模擬裝置<select value={size} onChange={e=>setSize(e.target.value)}><option value="1366">Windows · 1366 × 768</option><option value="1920">Windows · 1920 × 1080</option><option value="1194">iPad · 1194 × 834</option></select></label></header><div className="preview-viewport"><div className={'preview-device device-'+size}><iframe title="顧客顯示器即時預覽" src="/display"/></div></div><p>同步顯示目前訂單 · 顧客畫面不可操作</p></section></main>;}
