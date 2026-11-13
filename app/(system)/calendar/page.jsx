'use client';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useFinance } from '@/context/finance-context';
import { getStats, inMonth, money, monthLabel, monthMove, sum, today, localeText as t } from '@/lib/finance';
import { MonthSwitcher, NewRecordButton, RecordList, SectionCard, SectionHeading } from '@/components/ui';

export default function CalendarPage(){
  const {records,month,locale,setMonth}=useFinance();
  const [selected,setSelected]=useState(today());
  const [year,mon]=month.split('-').map(Number);
  const days=new Date(year,mon,0).getDate();
  const firstOffset=(new Date(year,mon-1,1).getDay()+6)%7;
  const selectedDay=selected.slice(0,7)===month?selected:`${month}-01`;
  const rows=inMonth(records,month);
  const selectedRecords=rows.filter(r=>r.occurred_on===selectedDay);
  const selectedStats=getStats(selectedRecords);
  const weeks=Array.from({length:Math.ceil((firstOffset+days)/7)},(_,w)=>Array.from({length:7},(_,d)=>{const n=w*7+d-firstOffset+1;return n>=1&&n<=days?n:null;}));
  const labels=locale==='ms'?['Isn','Sel','Rab','Kha','Jum','Sab','Aha']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return <><SectionHeading eyebrow={t(locale,'PILIH, SEMAK & EDIT','SELECT, VIEW & EDIT')} title={t(locale,'Kalendar kewangan 📅','Finance calendar 📅')} subtitle={t(locale,'Tekan mana-mana tarikh untuk melihat serta mengedit rekod.','Select any day to view or edit transactions.')}><MonthSwitcher/><NewRecordButton defaultDate={selectedDay}/></SectionHeading><div className="calendar-layout"><SectionCard title={monthLabel(month,locale)} subtitle={t(locale,'Titik menunjukkan transaksi pada tarikh tersebut','Dots indicate activity on a given day')}><div className="calendar-grid">{labels.map(x=><div className="calendar-weekday" key={x}>{x}</div>)}{weeks.flatMap((week,i)=>week.map((d,j)=>{const date=d?`${month}-${String(d).padStart(2,'0')}`:'';const daily=rows.filter(r=>r.occurred_on===date);const hasIncome=daily.some(r=>r.type==='income');const hasExpense=daily.some(r=>r.type==='expense');const hasSavings=daily.some(r=>r.type==='savings');return <button key={`${i}-${j}`} disabled={!d} className={`calendar-day ${!d?'calendar-blank':''} ${date===selectedDay?'calendar-selected':''} ${date===today()?'calendar-today':''}`} onClick={()=>d&&setSelected(date)}><span>{d}</span><div className="calendar-dots">{hasIncome&&<i className="dot-income"/>}{hasExpense&&<i className="dot-expense"/>}{hasSavings&&<i className="dot-saving"/>}</div></button>;}))}</div><div className="calendar-legend"><span><i className="dot-income"/>{t(locale,'Masuk','Income')}</span><span><i className="dot-expense"/>{t(locale,'Belanja','Expense')}</span><span><i className="dot-saving"/>{t(locale,'Simpanan','Savings')}</span></div></SectionCard><SectionCard title={selectedDay} subtitle={t(locale,'Transaksi pada tarikh yang dipilih','Transactions on the selected date')} action={<NewRecordButton defaultDate={selectedDay}>{t(locale,'Tambah','Add')}</NewRecordButton>}><div className="calendar-day-totals"><div><small>{t(locale,'Masuk termasuk pinjaman','Inflow incl. loans')}</small><b className="positive-text">{money(selectedStats.earned+selectedStats.loans)}</b></div><div><small>{t(locale,'Keluar','Expenses')}</small><b>{money(selectedStats.expenses)}</b></div><div><small>{t(locale,'Simpan','Savings')}</small><b>{money(selectedStats.savings)}</b></div></div><RecordList rows={selectedRecords} max={100} emptyTitle={t(locale,'Tiada transaksi pada hari ini','No transactions on this date')} emptySubtitle={t(locale,'Tekan Tambah untuk merekod kewangan.','Tap Add to record a transaction.')}/></SectionCard></div></>;
}
