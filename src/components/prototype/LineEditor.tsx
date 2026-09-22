'use client';
import type {OrderLine,ComboChild,Modifier} from '@/lib/prototype/types';
import {dispatch} from '@/lib/prototype/store';
import {integer,uid} from '@/lib/prototype/model';
function Configuration({specs,modifiers,note,onChange}:{specs:string[];modifiers:Modifier[];note:string;onChange:(patch:Partial<ComboChild>)=>void}){
 return <div className="configuration"><div className="field-grid">{[['尺寸',['中杯','大杯','6 入']],['甜度',['無糖','微糖','半糖','正常糖']],['冰量',['去冰','少冰','正常冰','熱飲']]].map(([label,options],i)=><label key={label as string}>{label}<select value={specs[i]??(options as string[])[0]} onChange={e=>{const v=[...specs];v[i]=e.target.value;onChange({specs:v});}}>{(options as string[]).map(o=><option key={o}>{o}</option>)}</select></label>)}</div><div className="modifier-options">{['珍珠','椰果','仙草'].map(name=><label key={name}><input type="checkbox" checked={modifiers.some(m=>m.name===name)} onChange={e=>onChange({modifiers:e.target.checked?[...modifiers,{id:uid(),name,price:10}]:modifiers.filter(m=>m.name!==name)})}/>{name} +10</label>)}</div><label>商品備註<input value={note} placeholder="例如：分開裝" onChange={e=>onChange({note:e.target.value})}/></label></div>;
}
export default function LineEditor({line}:{line:OrderLine}){
 const update=(patch:Partial<OrderLine>)=>dispatch({type:'line',line:{...line,...patch},now:Date.now()});
 return <div className="line-editor"><label>商品名稱<input value={line.name} onChange={e=>update({name:e.target.value})}/></label>
 {line.children.length?line.children.map((c,i)=><fieldset key={c.id}><legend>{c.name}</legend><Configuration {...c} onChange={patch=>update({children:line.children.map((v,j)=>i===j?{...v,...patch}:v)})}/></fieldset>):<Configuration {...line} onChange={update}/>}
 <div>{line.children.length>0&&<label>套餐備註<input value={line.note} placeholder="例如：整組分開裝" onChange={e=>update({note:e.target.value})}/></label>}</div><div className="field-grid"><label>數量<input type="number" min="1" max="99" value={line.quantity} onChange={e=>update({quantity:Number(e.target.value)})}/></label><label>單品折扣（整列金額）<input type="number" min="0" value={line.discount?.amount??0} onChange={e=>update({discount:{level:'item',label:line.children.length?'套餐優惠':'單品優惠',amount:integer(Number(e.target.value))}})}/></label></div><label className="check-label"><input type="checkbox" checked={line.complimentary} onChange={e=>update({complimentary:e.target.checked})}/>招待此品項（實付 0）</label>
 </div>;
}
