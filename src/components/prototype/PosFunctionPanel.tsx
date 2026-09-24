'use client';
import { usePrototype } from '@/lib/prototype/store';
import { money, totals, integer } from '@/lib/prototype/model';

export default function PosFunctionPanel() {
  const { state: s, dispatch } = usePrototype();
  const editable = s.stage === 'ordering';
  const t = totals(s.order);
  const selected = s.focusId ? s.order.lines.find((line) => line.id === s.focusId) : undefined;
  return <aside className="pos-panel function-panel">
    <div className="pos-panel-head"><h2>{'功能'}</h2><span>{s.stage}</span></div>
    <section className="function-section"><h3>{'會員'}</h3>
      {s.order.member ? <div className="member-card"><strong>{s.order.member.name}</strong><span>{s.order.member.code}</span><button disabled={!editable} onClick={() => dispatch({ type: 'order', patch: { member: undefined } })}>{'清除會員'}</button></div> : <button className="function-button" disabled={!editable} onClick={() => dispatch({ type: 'order', patch: { member: { name: '林小姐（測試）', code: 'M0001' } } })}>{'載入熟客／會員'}</button>}
    </section>
    <section className="function-section"><h3>{'發票資訊'}</h3>
      <select disabled={!editable} value={s.order.invoice?.type ?? ''} onChange={(e) => dispatch({ type: 'order', patch: { invoice: e.target.value ? { type: e.target.value as 'taxId' | 'carrier', value: e.target.value === 'taxId' ? '12345675' : '/AB12CD3' } : null } })}><option value="">不設定</option><option value="carrier">載具</option><option value="taxId">統一編號</option></select>
      {s.order.invoice && <input disabled={!editable} value={s.order.invoice.value} onChange={(e) => dispatch({ type: 'order', patch: { invoice: { type: s.order.invoice!.type, value: e.target.value } } })} />}
    </section>
    <section className="function-section"><h3>{'折扣與招待'}</h3>
      <label>{'整單折扣'}<input disabled={!editable} type="number" min="0" value={s.order.discount?.amount ?? 0} onChange={(e) => dispatch({ type: 'order', patch: { discount: { level: 'order', label: '整單折扣', amount: integer(Number(e.target.value)) } } })} /></label>
      <button className="function-button" disabled={!editable || !selected} onClick={() => selected && dispatch({ type: 'line', line: { ...selected, complimentary: true }, now: Date.now() })}>{'將選取品項設為招待'}</button>
    </section>
    <label className="check-label"><input type="checkbox" disabled={!editable} checked={s.pinComplimentary} onChange={(e) => dispatch({ type: "pinGifts", value: e.target.checked })} /> &#x62DB;&#x5F85;&#x7F6E;&#x9802;</label>
    <section className="function-section function-total"><span>{'總計'}</span><strong>{money(t.total)}</strong></section>
  </aside>;
}