'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { currentMonth } from '@/lib/finance';
import { DEMO_FLAG, demoLoad, demoSave } from '@/lib/demo';

const Context=createContext(null);
const EMPTY_PROFILE={full_name:'',family_name:'',monthly_budget:0,savings_target_pct:15,locale:'ms',avatar_path:'',avatar_url:''};
const storageLocale='dompetkita_locale';

export function FinanceProvider({children}) {
  const [loading,setLoading]=useState(true);
  const [user,setUser]=useState(null);
  const [mode,setMode]=useState(null);
  const [records,setRecords]=useState([]);
  const [goals,setGoals]=useState([]);
  const [profile,setProfile]=useState(EMPTY_PROFILE);
  const [locale,setLanguage]=useState('ms');
  const [month,setMonth]=useState(currentMonth);
  const [error,setError]=useState('');
  const live=useRef(true);

  const reload=async (uid) => {
    if (!supabase || !uid) return;
    const [a,b,c]=await Promise.all([
      supabase.from('transactions').select('*').eq('user_id',uid).order('occurred_on',{ascending:false}).limit(2000),
      supabase.from('savings_goals').select('*').eq('user_id',uid).order('created_at',{ascending:false}),
      supabase.from('profiles').select('*').eq('user_id',uid).maybeSingle(),
    ]);
    const fail=[a.error,b.error,c.error].find(Boolean);
    if (fail) throw new Error(fail.message);
    if (!live.current) return;
    const p={...EMPTY_PROFILE,...(c.data||{})};
    if (p.avatar_path) {
      const {data}=await supabase.storage.from('avatars').createSignedUrl(p.avatar_path,3600);
      p.avatar_url=data?.signedUrl||'';
    }
    setRecords(a.data||[]);setGoals(b.data||[]);setProfile(p);
    if (p.locale && !localStorage.getItem(storageLocale)) setLanguage(p.locale);
  };

  useEffect(()=>{
    live.current=true;
    const pref=localStorage.getItem(storageLocale);
    if (pref==='en'||pref==='ms') setLanguage(pref);
    if (localStorage.getItem(DEMO_FLAG)==='1') {
      const d=demoLoad();setUser({id:'demo',email:'demo@dompetkita.local'});setMode('demo');
      setRecords(d.records);setGoals(d.goals);setProfile(d.profile);setLoading(false);
      return ()=>{live.current=false;};
    }
    if (!supabase) {setLoading(false);return ()=>{live.current=false;};}
    supabase.auth.getUser().then(async ({data:{user:authUser},error:e})=>{
      if (!live.current) return;
      if (e || !authUser) {setUser(null);setMode(null);setLoading(false);return;}
      setUser(authUser);setMode('live');
      try {await reload(authUser.id);} catch(err){setError(err.message);}
      if(live.current) setLoading(false);
    }).catch(()=>{if(live.current){setError('Sambungan pangkalan data gagal.');setLoading(false);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if (!live.current || localStorage.getItem(DEMO_FLAG)==='1') return;
      if(event==='SIGNED_OUT'){setUser(null);setMode(null);setRecords([]);setGoals([]);setProfile(EMPTY_PROFILE);}
      // Login/register actions update state explicitly after successful authentication.
    });
    return ()=>{live.current=false;subscription.unsubscribe();};
  },[]);

  const chooseLocale=(lang)=>{if(lang!=='ms'&&lang!=='en')return;setLanguage(lang);localStorage.setItem(storageLocale,lang);};
  const enterDemo=()=>{
    localStorage.setItem(DEMO_FLAG,'1');
    const d=demoLoad();setUser({id:'demo',email:'demo@dompetkita.local'});setMode('demo');
    setRecords(d.records);setGoals(d.goals);setProfile(d.profile);setError('');setLoading(false);
  };
  const login=async(email,password)=>{
    if(!supabase)throw new Error('Sila konfigurasi Supabase terlebih dahulu atau cuba Mod Demo.');
    const {data,error:e}=await supabase.auth.signInWithPassword({email,password});
    if(e)throw e;
    setUser(data.user);setMode('live');await reload(data.user.id);
  };
  const register=async(fullName,email,password)=>{
    if(!supabase)throw new Error('Sila konfigurasi Supabase terlebih dahulu atau cuba Mod Demo.');
    const {data,error:e}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}});
    if(e)throw e;
    if(data.session && data.user){setUser(data.user);setMode('live');await reload(data.user.id);return true;}
    return false; // Email confirmation needed.
  };
  const logout=async()=>{
    if(mode==='demo') localStorage.removeItem(DEMO_FLAG);
    else if(supabase) await supabase.auth.signOut();
    setUser(null);setMode(null);setRecords([]);setGoals([]);setProfile(EMPTY_PROFILE);
  };
  const writeTransaction=async(action,raw)=>{
    if(!user)throw new Error('Sila log masuk.');
    const payload={type:raw.type,category:raw.category,amount:Number(raw.amount),occurred_on:raw.occurred_on,note:(raw.note||'').trim().slice(0,200),member:(raw.member||'').trim().slice(0,80)};
    if(mode==='demo') {
      let next;
      if(action==='add') next=[{...payload,id:crypto.randomUUID(),created_at:new Date().toISOString()},...records];
      else if(action==='edit')next=records.map(x=>x.id===raw.id?{...x,...payload}:x);
      else next=records.filter(x=>x.id!==raw.id);
      setRecords(next);demoSave(next);return;
    }
    let result;
    if(action==='add')result=await supabase.from('transactions').insert({...payload,user_id:user.id});
    else if(action==='edit')result=await supabase.from('transactions').update(payload).eq('id',raw.id).eq('user_id',user.id);
    else result=await supabase.from('transactions').delete().eq('id',raw.id).eq('user_id',user.id);
    if(result.error)throw result.error;
    await reload(user.id);
  };
  const writeGoal=async(action,raw)=>{
    if(!user)throw new Error('Sila log masuk.');
    const payload={name:(raw.name||'').trim().slice(0,80),target_amount:Number(raw.target_amount),saved_amount:Number(raw.saved_amount||0)};
    if(mode==='demo'){
      const next=action==='add'?[{...payload,id:crypto.randomUUID()},...goals]:action==='edit'?goals.map(x=>x.id===raw.id?{...x,...payload}:x):goals.filter(x=>x.id!==raw.id);
      setGoals(next);demoSave(undefined,next);return;
    }
    let result;
    if(action==='add')result=await supabase.from('savings_goals').insert({...payload,user_id:user.id});
    else if(action==='edit')result=await supabase.from('savings_goals').update(payload).eq('id',raw.id).eq('user_id',user.id);
    else result=await supabase.from('savings_goals').delete().eq('id',raw.id).eq('user_id',user.id);
    if(result.error)throw result.error;
    await reload(user.id);
  };
  const saveProfile=async(raw)=>{
    if(!user)throw new Error('Sila log masuk.');
    const payload={full_name:(raw.full_name||'').trim().slice(0,100),family_name:(raw.family_name||'').trim().slice(0,100),monthly_budget:Number(raw.monthly_budget||0),savings_target_pct:Number(raw.savings_target_pct??15),locale:raw.locale==='en'?'en':'ms'};
    if(mode==='demo'){
      const next={...profile,...payload};setProfile(next);demoSave(undefined,undefined,next);chooseLocale(payload.locale);return;
    }
    const {error:e}=await supabase.from('profiles').upsert({...payload,user_id:user.id},{onConflict:'user_id'});
    if(e)throw e;
    setProfile(p=>({...p,...payload}));chooseLocale(payload.locale);
  };
  const uploadAvatar=async(file)=>{
    if(!user)throw new Error('Sila log masuk.');
    if(!file?.type?.startsWith('image/'))throw new Error('Pilih fail gambar sahaja.');
    if(file.size>2*1024*1024)throw new Error('Saiz gambar maksimum ialah 2 MB.');
    if(mode==='demo'){
      const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Gagal membaca gambar.'));reader.readAsDataURL(file);});
      const next={...profile,avatar_url:url};setProfile(next);
      try{demoSave(undefined,undefined,next);}catch{throw new Error('Ruang storan browser penuh. Gunakan gambar lebih kecil.');}
      return;
    }
    const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':file.type==='image/gif'?'gif':'jpg';
    const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
    const {error:upError}=await supabase.storage.from('avatars').upload(path,file,{contentType:file.type,upsert:false});
    if(upError)throw upError;
    const {error:profileError}=await supabase.from('profiles').update({avatar_path:path}).eq('user_id',user.id);
    if(profileError)throw profileError;
    const {data}=await supabase.storage.from('avatars').createSignedUrl(path,3600);
    setProfile(p=>({...p,avatar_path:path,avatar_url:data?.signedUrl||''}));
    // Previous photos can be deleted manually in the Supabase Storage dashboard.
  };
  const changePassword=async(password)=>{
    if(mode==='demo')throw new Error('Tukar kata laluan tersedia untuk akaun sebenar sahaja.');
    const {error:e}=await supabase.auth.updateUser({password});if(e)throw e;
  };
  return <Context.Provider value={{loading,user,mode,records,goals,profile,locale,month,setMonth,error,setError,chooseLocale,enterDemo,login,register,logout,writeTransaction,writeGoal,saveProfile,uploadAvatar,changePassword,reload:()=>reload(user?.id)}}>{children}</Context.Provider>;
}
export function useFinance(){const v=useContext(Context);if(!v)throw new Error('Missing FinanceProvider');return v;}
