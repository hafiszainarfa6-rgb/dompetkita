'use client';
import Link from 'next/link';
import { usePathname,useRouter } from 'next/navigation';
import { BarChart3, Bot, CalendarDays, ChevronDown, CircleHelp, Home, LogOut, Menu, PiggyBank, Plus, Settings2, Wallet, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { useFinance } from '@/context/finance-context';
import { localeText as t } from '@/lib/finance';
import TransactionModal from '@/components/transaction-modal';

const NAV=[
  {href:'/dashboard',icon:Home,ms:'Utama',en:'Home'},
  {href:'/income',icon:WalletCards,ms:'Duit Masuk',en:'Income'},
  {href:'/expenses',icon:BarChart3,ms:'Perbelanjaan',en:'Expenses'},
  {href:'/savings',icon:PiggyBank,ms:'Simpanan',en:'Savings'},
  {href:'/summary',icon:BarChart3,ms:'Ringkasan',en:'Summary'},
  {href:'/calendar',icon:CalendarDays,ms:'Kalendar',en:'Calendar'},
  {href:'/chat',icon:Bot,ms:'Chatbot',en:'Chatbot'},
  {href:'/profile',icon:Settings2,ms:'Profil',en:'Profile'},
];
const mobile= ['/dashboard','/income','/expenses','/savings','/profile'];
export function UserAvatar({size=40}){
  const {profile}=useFinance();
  return profile.avatar_url?<img src={profile.avatar_url} className="avatar" width={size} height={size} alt="Profile" style={{width:size,height:size}}/>:<div className="avatar avatar-placeholder" style={{width:size,height:size,fontSize:size*.36}}>{(profile.full_name||'K').slice(0,1).toUpperCase()}</div>;
}
export default function AppShell({children}){
  const {mode,profile,user,locale,chooseLocale,logout,error,setError,reload}=useFinance();
  const pathname=usePathname();const router=useRouter();
  const [navOpen,setNavOpen]=useState(false),[quickAdd,setQuickAdd]=useState(false),[userOpen,setUserOpen]=useState(false);
  async function out(){await logout();router.replace('/login');}
  return <div className="app-layout">
    {navOpen&&<button className="nav-shade" aria-label="Close navigation" onClick={()=>setNavOpen(false)}/>}
    <aside className={`sidebar ${navOpen?'sidebar-open':''}`}><div className="sidebar-head"><Link href="/dashboard" className="brand" onClick={()=>setNavOpen(false)}><span className="brand-mark"><Wallet size={20}/></span><span>Dompet<b>Kita</b></span></Link><button className="mobile-only nav-close" onClick={()=>setNavOpen(false)} aria-label="Close"><X size={20}/></button></div><p className="sidebar-label">{t(locale,'MENU UTAMA','MAIN MENU')}</p><nav className="side-nav">{NAV.map(item=>{const Icon=item.icon;const active=pathname.startsWith(item.href);return <Link href={item.href} key={item.href} onClick={()=>setNavOpen(false)} className={`side-nav-item ${active?'active':''}`}><Icon size={19} strokeWidth={active?2.4:1.8}/>{item[locale]}{active&&<span className="active-dot"/>}</Link>;})}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><span>🌱</span><b>{t(locale,'Langkah kecil hari ini','Small steps today')}</b><p>{t(locale,'Masa depan keluarga yang lebih cerah.','A brighter future for your family.')}</p></div><button className="sidebar-logout" onClick={out}><LogOut size={18}/>{t(locale,'Log keluar','Log out')}</button></div></aside>
    <div className="app-main"><header className="topbar"><div className="topbar-left"><button className="hamburger" onClick={()=>setNavOpen(true)} aria-label="Open menu"><Menu size={22}/></button><span className="topbar-crumb">DompetKita</span><ChevronDown size={14} className="topbar-chevron"/><span className="topbar-current">{NAV.find(x=>pathname.startsWith(x.href))?.[locale]||'Utama'}</span></div><div className="topbar-right"><button className="language-toggle" onClick={()=>chooseLocale(locale==='ms'?'en':'ms')}>{locale==='ms'?'EN':'BM'}</button><Link className="icon-button topbar-shortcut" href="/calendar" title={t(locale,'Kalendar','Calendar')}><CalendarDays size={19}/></Link><Link className="icon-button topbar-shortcut" href="/summary" title={t(locale,'Ringkasan','Summary')}><BarChart3 size={19}/></Link><button className="btn btn-primary topbar-add" onClick={()=>setQuickAdd(true)}><Plus size={16}/>{t(locale,'Tambah Rekod','Add Record')}</button><div className="user-menu-wrap"><button className="user-menu-trigger" onClick={()=>setUserOpen(!userOpen)}><UserAvatar size={35}/><div className="user-menu-name"><b>{profile.full_name||t(locale,'Pengguna','User')}</b><small>{mode==='demo'?'Demo':user?.email}</small></div><ChevronDown size={15}/></button>{userOpen&&<div className="user-popover"><Link href="/profile" onClick={()=>setUserOpen(false)}><Settings2 size={16}/>{t(locale,'Tetapan profil','Profile settings')}</Link><button onClick={()=>{setUserOpen(false);out();}}><LogOut size={16}/>{t(locale,'Log keluar','Log out')}</button></div>}</div></div></header>
    {mode==='demo'&&<div className="demo-banner">🧪 {t(locale,'Mod Demo aktif — data contoh disimpan dalam browser ini sahaja, bukan dalam database.','Demo Mode — sample data lives only in this browser, not the database.')} <button className="banner-link" onClick={async()=>{await logout();router.push('/register');}}>{t(locale,'Daftar akaun sebenar','Create a real account')}</button></div>}
    {error&&<div className="shell-error alert error">{error} <button onClick={async()=>{setError('');try{await reload();}catch(e){setError(e.message);}}}>{t(locale,'Cuba semula','Retry')}</button></div>}
    <main className="page-content">{children}</main></div>
    <nav className="bottom-nav">{NAV.filter(x=>mobile.includes(x.href)).map(item=>{const Icon=item.icon;return <Link href={item.href} key={item.href} className={`bottom-item ${pathname.startsWith(item.href)?'selected':''}`}><Icon size={20}/><small>{item[locale]}</small></Link>;})}</nav>
    <Link href="/chat" className={`floating-chat ${pathname==='/chat'?'hide-floating':''}`} title="Chatbot"><Bot size={23}/></Link>
    {quickAdd&&<TransactionModal onClose={()=>setQuickAdd(false)}/>}
  </div>;
}
