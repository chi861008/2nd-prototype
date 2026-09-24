import type { Order, OrderLine, PrototypeState, MarketingSlide, PaymentEntry } from './types';
export const money = (n: number) => '$' + n.toLocaleString('zh-TW');
export const uid = () => Math.random().toString(36).slice(2, 10);
export const integer = (n: number) => Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
export const ORDER_PAGE_SIZE = 5;
export const pageCount = (order: Order) => Math.max(1, Math.ceil(order.lines.length / ORDER_PAGE_SIZE));
export const slides: MarketingSlide[] = [
 { id: 'tea', title: '留一點時間，\n給一杯好茶。', subtitle: '每日現泡・原葉純茶', seconds: 5 },
 { id: 'milk', title: '茶香與奶香，\n剛剛好的日常。', subtitle: '招牌紅茶拿鐵・醇厚登場', seconds: 5 },
 { id: 'share', title: '好喝的時光，\n一起分享。', subtitle: '雙人分享套餐・為相聚準備', seconds: 5 }
];
export const catalog = [
 { name: '春摘四季青茶', price: 40 }, { name: '招牌紅茶拿鐵', price: 70 },
 { name: '黑糖珍珠鮮奶', price: 80 }, { name: '白桃烏龍冷泡茶', price: 65 },
 { name: '蜂蜜檸檬青茶', price: 60 }, { name: '原味雞蛋糕', price: 60 },
 { name: '超值雙人分享套餐', price: 320 }, { name: '午後一人茶點套餐', price: 120 }
];
export const newLine = (index: number): OrderLine => {
 const p = catalog[index % catalog.length];
 return { id: uid(), ...p, quantity: 1, specs: index % catalog.length === 5 ? ['6 入', '原味'] : ['大杯', '微糖', '少冰'], modifiers: [], note: '', complimentary: false,
 children: index >= 6 ? [
 {id: uid(), name:'招牌紅茶拿鐵', specs:['大杯','微糖','少冰'], modifiers:[], note:''},
 {id: uid(), name:'原味雞蛋糕', specs:['6 入'], modifiers:[], note:''}
 ] : [] };
};
export const emptyOrder = (): Order => ({id:uid(), number:String(Math.floor(100 + Math.random()*900)), lines:[], invoice:null, payments:[]});
export const initialState = (): PrototypeState => ({ version:1, revision:0, stage:'idle', order:emptyOrder(), slides:structuredClone(slides), page:1, pinComplimentary:false, focusAt:0, deadline:null, remaining:5000, paused:false, scenario:null, nextAt:null });
export function lineTotals(l: OrderLine) {
 const unit = l.price + l.modifiers.reduce((a,m)=>a+m.price,0) + l.children.reduce((a,c)=>a+c.modifiers.reduce((b,m)=>b+m.price,0),0);
 const gross = unit*l.quantity;
 const discount = l.complimentary ? 0 : Math.min(gross, integer(l.discount?.amount ?? 0));
 return {gross, discount, net:l.complimentary ? 0 : gross-discount};
}
export function totals(o: Order) {
 const rows=o.lines.map(lineTotals);
 const subtotal=rows.reduce((a,l)=>a+l.net,0);
 const orderDiscount=Math.min(subtotal,integer(o.discount?.amount ?? 0));
 const total=subtotal-orderDiscount;
 const paid=o.payments.reduce((a,p)=>a+p.amount,0);
 return {total, paid, unpaid:Math.max(0,total-paid), change:Math.max(0,paid-total), orderDiscount,
 discount:orderDiscount+rows.reduce((a,l)=>a+l.discount,0), quantity:o.lines.reduce((a,l)=>a+l.quantity,0),
 giftQuantity:o.lines.filter(l=>l.complimentary).reduce((a,l)=>a+l.quantity,0),
 giftValue:o.lines.filter(l=>l.complimentary).reduce((a,l)=>a+lineTotals(l).gross,0)};
}
export type Action =
 | {type:'new'} | {type:'idle'} | {type:'reset'} | {type:'clear'} | {type:'pay'} | {type:'complete'; now:number}
 | {type:'tick'; now:number} | {type:'pause'; now:number} | {type:'scenario'; index:number; now:number}
 | {type:'add'; index:number; now:number} | {type:'line'; line:OrderLine; now:number} | {type:'delete'; id:string}
 | {type:'focus'; id:string; now:number} | {type:'page'; page:number} | {type:'order'; patch:Partial<Pick<Order,'member'|'invoice'|'discount'>>}
 | {type:'payment'; payment:PaymentEntry} | {type:'removePayment'; id:string} | {type:'resetPayments'} | {type:'cancelPay'}
 | {type:'pinGifts'; value:boolean} | {type:'slides'; slides:MarketingSlide[]};
export const scenarioNames = ['點餐前行銷輪播','一般短訂單','18 個品項的長訂單','超長商品名稱與折行','多層套餐與多個加料','會員＋載具','會員＋統編','單品與整單折扣','招待品項','混合支付進行中','現金溢付與找零','付款完成與倒數','倒數期間開始下一筆'];
export function scenario(index:number, previous:PrototypeState, now:number):PrototypeState {
 const s={...initialState(),slides:previous.slides,scenario:index};
 if(index===0)return s;
 s.stage='ordering'; s.order.lines=[newLine(1),newLine(2),newLine(0)];
 if(index===2)s.order.lines=Array.from({length:18},(_,i)=>newLine(i%6));
 if(index===3)s.order.lines[1].name='嚴選台灣高山手摘烏龍佐北海道濃醇鮮乳與手作黑糖珍珠期間限定特調';
 if(index===4) { const l=newLine(6); l.discount={level:'item',label:'套餐優惠',amount:30}; l.children[0].modifiers=[{id:uid(),name:'珍珠',price:10},{id:uid(),name:'椰果',price:10}]; l.children[0].note='鮮奶分開裝'; s.order.lines=[l,newLine(0)]; }
 if(index===5||index===6){s.order.member={name:'林小姐（測試）',code:'M0001'};s.order.invoice=index===5?{type:'carrier',value:'/AB12CD3'}:{type:'taxId',value:'12345675'};}
 if(index===7){s.order.lines[0].discount={level:'item',label:'單品優惠',amount:10};s.order.discount={level:'order',label:'整單優惠',amount:30};}
 if(index===8){s.order.lines[2].complimentary=true;s.pinComplimentary=true;}
 if(index>=9){s.stage='paying';s.order.lines=[newLine(1),newLine(2)];s.order.lines[1].quantity=2;s.order.payments=[{id:uid(),method:'行動支付',amount:50}];}
 if(index>=10)s.order.payments.push({id:uid(),method:'現金',amount:200});
 if(index>=11){s.stage='completed';s.deadline=now+5000;}
 if(index===12)s.nextAt=now+2500;
 s.focusId=s.order.lines.at(-1)?.id;s.focusAt=now;
 return s;
}
export function reduce(s:PrototypeState,a:Action):PrototypeState {
 let n:PrototypeState=s;
 const editable=s.stage==='ordering';
 switch(a.type){
 case 'new': n={...s,stage:'ordering',order:emptyOrder(),page:1,deadline:null,paused:false,remaining:5000,nextAt:null,scenario:null,focusId:undefined};break;
 case 'idle':n={...s,stage:'idle',deadline:null,nextAt:null,paused:false};break;
 case 'reset':n=initialState();break;
 case 'page':n={...s,page:Math.max(1,Math.min(pageCount(s.order),integer(a.page))),focusId:undefined};break;
 case 'clear':if(editable)n={...s,order:{...emptyOrder(),id:s.order.id,number:s.order.number},page:1};break;
 case 'scenario':n=scenario(a.index,s,a.now);break;
 case 'add':if(editable){const l=newLine(a.index);const order={...s.order,lines:[...s.order.lines,l]};n={...s,order,page:pageCount(order),focusId:l.id,focusAt:a.now};}break;
 case 'line':if(editable){const order={...s.order,lines:s.order.lines.map(l=>l.id===a.line.id?{...a.line,quantity:Math.max(1,Math.min(99,integer(a.line.quantity)))}:l)};n={...s,order,page:Math.min(s.page,pageCount(order)),focusId:a.line.id,focusAt:a.now};}break;
 case 'delete':if(editable){const order={...s.order,lines:s.order.lines.filter(l=>l.id!==a.id)};n={...s,order,page:Math.min(s.page,pageCount(order))};}break;
 case 'focus':n={...s,focusId:a.id,focusAt:a.now};break;
 case 'order':if(editable)n={...s,order:{...s.order,...a.patch}};break;
 case 'pay':if(editable&&s.order.lines.length)n={...s,stage:'paying'};break;
 case 'cancelPay':if(s.stage==='paying')n={...s,stage:'ordering',order:{...s.order,payments:[]}};break;
 case 'payment':{const t=totals(s.order);const p={...a.payment,amount:integer(a.payment.amount)};if(s.stage==='paying'&&t.unpaid>0&&p.amount>0&&(p.method==='現金'||p.amount<=t.unpaid))n={...s,order:{...s.order,payments:[...s.order.payments,p]}};break;}
 case 'removePayment':if(s.stage==='paying')n={...s,order:{...s.order,payments:s.order.payments.filter(p=>p.id!==a.id)}};break;
 case 'resetPayments':if(s.stage==='paying')n={...s,order:{...s.order,payments:[]}};break;
 case 'complete':if(s.stage==='paying'&&totals(s.order).unpaid===0)n={...s,stage:'completed',deadline:a.now+5000,remaining:5000,paused:false};break;
 case 'pause':if(s.stage==='completed')n=s.paused?{...s,paused:false,deadline:a.now+s.remaining}:{...s,paused:true,remaining:Math.max(0,(s.deadline??a.now)-a.now),deadline:null};break;
 case 'tick':if(s.stage==='completed'&&!s.paused){if(s.nextAt&&a.now>=s.nextAt)n={...reduce(s,{type:'new'}),order:{...emptyOrder(),lines:[newLine(0)]}};else if(s.deadline&&a.now>=s.deadline)n={...s,stage:'idle',deadline:null,nextAt:null};}break;
 case 'pinGifts':n={...s,pinComplimentary:a.value};break;
 case 'slides':n={...s,slides:a.slides};break;
 }
 return n===s?s:{...n,revision:Math.max(Date.now(),s.revision+1)};
}
