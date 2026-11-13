import { currentMonth, monthMove, today } from './finance';

export const DEMO_FLAG='dompetkita_demo';
const RECORDS_KEY='dompetkita_records';
const GOALS_KEY='dompetkita_goals';
const PROFILE_KEY='dompetkita_profile';
const makeDate=(month,day)=>`${month}-${String(day).padStart(2,'0')}`;

export function seedDemo() {
  const month=currentMonth(), previous=monthMove(month,-1);
  const dateDay=Number(today().slice(-2));
  const day=(n)=>Math.max(1,Math.min(n,dateDay));
  const list=[
    ['income','salary',4200,day(1),'Gaji bulanan'],
    ['income','allowance',250,day(4),'Elaun'],
    ['income','wages',180,day(10),'Kerja sambilan'],
    ['income','loan_ptptn',600,day(3),'Pinjaman PTPTN'],
    ['expense','groceries',356.8,day(2),'Barang dapur keluarga'],
    ['expense','groceries',132.5,day(9),'Pasar minggu'],
    ['expense','snacks',46,day(7),'Jajan anak-anak'],
    ['expense','toiletries',61.9,day(5),'Sabun dan syampu'],
    ['expense','laundry',34.8,day(5),'Sabun pencuci'],
    ['expense','clothing',110,day(12),'Baju harian'],
    ['expense','gadgets',79,day(11),'Kabel pengecas'],
    ['expense','fuel',70,day(2),'Petrol'],
    ['expense','fuel',65,day(10),'Petrol'],
    ['expense','motor',48,day(8),'Servis ringan'],
    ['expense','bill_astro',69.9,day(6),'Bil Astro'],
    ['expense','bill_water',32.1,day(6),'Bil air'],
    ['expense','bill_electricity',145.35,day(6),'Bil elektrik'],
    ['savings','saving_daily',55,day(8),'Tabung simpanan harian'],
    ['savings','saving_weekly',100,day(10),'Tabung minggu ini'],
    ['savings','saving_monthly',300,day(12),'Dana kecemasan'],
  ].map(([type,category,amount,d,note],i)=>({id:`demo-${i}`,type,category,amount,occurred_on:makeDate(month,d),note,member:'',created_at:new Date(Date.now()-i*100000).toISOString()}));
  const older=[['income','salary',4200,1],['expense','groceries',610,3],['expense','bill_astro',69.9,5],['expense','bill_water',25.4,5],['expense','bill_electricity',171.2,5],['expense','fuel',175,7],['expense','snacks',88,9],['savings','saving_monthly',500,12]];
  list.push(...older.map(([type,category,amount,d],i)=>({id:`old-${i}`,type,category,amount,occurred_on:makeDate(previous,d),note:'',member:'',created_at:new Date(Date.now()-3600000*i).toISOString()})));
  return list;
}
export function demoLoad() {
  if (!localStorage.getItem(RECORDS_KEY)) localStorage.setItem(RECORDS_KEY,JSON.stringify(seedDemo()));
  if (!localStorage.getItem(GOALS_KEY)) localStorage.setItem(GOALS_KEY,JSON.stringify([
    {id:'goal1',name:'Dana Kecemasan',target_amount:6000, saved_amount:1200},
    {id:'goal2',name:'Percutian Keluarga',target_amount:2500,saved_amount:500},
  ]));
  if (!localStorage.getItem(PROFILE_KEY)) localStorage.setItem(PROFILE_KEY,JSON.stringify({full_name:'Keluarga Demo',family_name:'Keluarga Harmoni',monthly_budget:2200,savings_target_pct:15,locale:'ms',avatar_url:'',avatar_path:''}));
  return {records:JSON.parse(localStorage.getItem(RECORDS_KEY)),goals:JSON.parse(localStorage.getItem(GOALS_KEY)),profile:JSON.parse(localStorage.getItem(PROFILE_KEY))};
}
export function demoSave(records,goals,profile) {
  if (records!==undefined) localStorage.setItem(RECORDS_KEY,JSON.stringify(records));
  if (goals!==undefined) localStorage.setItem(GOALS_KEY,JSON.stringify(goals));
  if (profile!==undefined) localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
}
