'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinance } from '@/context/finance-context';
import AppShell from '@/components/app-shell';
export default function SystemLayout({children}){
  const {user,loading}=useFinance();const router=useRouter();
  useEffect(()=>{if(!loading&&!user)router.replace('/login');},[loading,user,router]);
  if(loading||!user)return <div className="center-loading"><div className="loading-brand">◈</div><p>DompetKita</p></div>;
  return <AppShell>{children}</AppShell>;
}
