export const INCOME_CATEGORIES = [
  { id: 'salary', ms: 'Gaji', en: 'Salary', icon: '💼' },
  { id: 'allowance', ms: 'Elaun', en: 'Allowance', icon: '🎓' },
  { id: 'wages', ms: 'Upah', en: 'Side income', icon: '🛠️' },
  { id: 'loan_ptptn', ms: 'Pinjaman PTPTN', en: 'PTPTN loan', icon: '🏦', loan: true },
  { id: 'loan_other', ms: 'Pinjaman lain-lain', en: 'Other loan', icon: '📋', loan: true },
];
export const EXPENSE_CATEGORIES = [
  { id: 'groceries', ms: 'Barang Dapur', en: 'Groceries', icon: '🛒' },
  { id: 'snacks', ms: 'Jajan', en: 'Snacks', icon: '🍪' },
  { id: 'toiletries', ms: 'Peralatan Mandi', en: 'Toiletries', icon: '🧴' },
  { id: 'laundry', ms: 'Peralatan Laundry', en: 'Laundry supplies', icon: '🧺' },
  { id: 'clothing', ms: 'Pakaian', en: 'Clothing', icon: '👕' },
  { id: 'gadgets', ms: 'Peralatan Gajet', en: 'Gadgets', icon: '📱' },
  { id: 'fuel', ms: 'Minyak Petrol', en: 'Petrol', icon: '⛽' },
  { id: 'motor', ms: 'Peralatan Motor', en: 'Motorcycle items', icon: '🏍️' },
  { id: 'bill_astro', ms: 'Bil Astro', en: 'Astro bill', icon: '📺', bill: true },
  { id: 'bill_water', ms: 'Bil Air', en: 'Water bill', icon: '💧', bill: true },
  { id: 'bill_electricity', ms: 'Bil Elektrik', en: 'Electricity bill', icon: '⚡', bill: true },
];
export const SAVING_CATEGORIES = [
  { id: 'saving_daily', ms: 'Simpanan Harian', en: 'Daily savings', icon: '☀️' },
  { id: 'saving_weekly', ms: 'Simpanan Mingguan', en: 'Weekly savings', icon: '📅' },
  { id: 'saving_monthly', ms: 'Simpanan Bulanan', en: 'Monthly savings', icon: '🌱' },
  { id: 'saving_other', ms: 'Simpanan Lain', en: 'Other savings', icon: '🐷' },
];
export const CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...SAVING_CATEGORIES];
export const lookup = (id) => CATEGORIES.find((x) => x.id === id) || { id, ms: id, en: id, icon: '💳' };
export const catLabel = (id, locale) => lookup(id)[locale] || id;
export const localeText = (locale, ms, en) => locale === 'en' ? en : ms;
export const money = (n) => new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
export const sum = (rows) => rows.reduce((a, r) => a + Number(r.amount || 0), 0);
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const currentMonth = () => today().slice(0,7);
export const inMonth = (rows, month) => rows.filter((r) => r.occurred_on?.slice(0,7) === month);
export const isLoan = (r) => r.type === 'income' && lookup(r.category).loan === true;
export const isBill = (r) => r.type === 'expense' && lookup(r.category).bill === true;
export const monthMove = (month, diff) => { const [y, m] = month.split('-').map(Number); const d = new Date(y, m - 1 + diff, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
export const monthLabel = (month, locale='ms') => { const [y,m]=month.split('-').map(Number); return new Intl.DateTimeFormat(locale==='en'?'en-MY':'ms-MY', {month:'long',year:'numeric'}).format(new Date(y,m-1,1)); };
export const shortDate = (date, locale='ms') => { if (!date) return ''; const [y,m,d]=date.split('-').map(Number); return new Intl.DateTimeFormat(locale==='en'?'en-MY':'ms-MY',{day:'numeric',month:'short',year:'numeric'}).format(new Date(y,m-1,d)); };
export const startOfWeek = (date) => { const [y,m,d]=date.split('-').map(Number); const dt = new Date(y,m-1,d); const day=(dt.getDay()+6)%7; dt.setDate(dt.getDate()-day); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
export const weekExpenses = (rows, targetDate=today()) => { const start=startOfWeek(targetDate); const end = new Date(`${start}T12:00:00`); end.setDate(end.getDate()+7); const endKey=`${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`; return sum(rows.filter(r => r.type==='expense' && r.occurred_on>=start && r.occurred_on<endKey)); };
export const getStats = (records) => {
  const earned = sum(records.filter(r => r.type==='income' && !isLoan(r)));
  const loans = sum(records.filter(isLoan));
  const expenses = sum(records.filter(r => r.type==='expense'));
  const bills = sum(records.filter(isBill));
  const savings = sum(records.filter(r => r.type==='savings'));
  return {earned, loans, expenses, bills, savings, balance: earned-expenses-savings, cashFlow: earned+loans-expenses-savings};
};
export const categoryTotals = (rows, type='expense') => {
  const cats = type==='expense' ? EXPENSE_CATEGORIES : type==='income' ? INCOME_CATEGORIES : SAVING_CATEGORIES;
  return cats.map(c => ({...c, value:sum(rows.filter(r=>r.type===type && r.category===c.id))})).filter(c=>c.value>0).sort((a,b)=>b.value-a.value);
};
export const getRecent = (rows, max=6) => [...rows].sort((a,b)=>(b.occurred_on || '').localeCompare(a.occurred_on || '') || (b.created_at || '').localeCompare(a.created_at || '')).slice(0,max);
export const weeklyBuckets = (rows, month, locale='ms') => {
  const [year, m] = month.split('-').map(Number);
  const count = new Date(year,m,0).getDate();
  const result=[];
  for(let start=1;start<=count;start+=7){
    const end=Math.min(count,start+6);
    const amount=sum(rows.filter(r=>r.type==='expense' && Number(r.occurred_on?.slice(-2))>=start && Number(r.occurred_on?.slice(-2))<=end));
    result.push({name:`${start}–${end}`,value:amount,id:`${start}`});
  }
  return result;
};
export const chartPalette = ['#3B82A0','#9A79DA','#F2AA6D','#6BB99B','#DC8096','#8BA8CF','#A2B46A','#C8A0DB','#D7BC69','#5B8A93','#A9ACBD'];
export const dailyTrend = (rows, month) => {
  const [y,m] = month.split('-').map(Number);
  const count=new Date(y,m,0).getDate();
  return Array.from({length:count},(_,i)=>{
    const date=`${month}-${String(i+1).padStart(2,'0')}`;
    return {day:String(i+1), expenses:sum(rows.filter(r=>r.type==='expense'&&r.occurred_on===date)), income:sum(rows.filter(r=>r.type==='income'&&!isLoan(r)&&r.occurred_on===date))};
  });
};
export function csvExport(rows, fileName) {
  const cols=['occurred_on','type','category','amount','note','member'];
  const escapeCell = (value) => { const s = String(value ?? ''); const safe = /^[=+\-@\t\r]/.test(s) ? "'"+s : s; return '"'+safe.replace(/"/g,'""')+'"'; };
  const csv='\uFEFF'+[cols.join(','), ...rows.map(r=>cols.map(k=>escapeCell(r[k])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a'); a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
