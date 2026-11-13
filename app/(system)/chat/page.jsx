'use client';
import { useRef,useState,useEffect } from 'react';
import { Bot, RotateCcw, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useFinance } from '@/context/finance-context';
import { getStats, inMonth, localeText as t } from '@/lib/finance';
import { basicReply } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { SectionHeading } from '@/components/ui';

export default function ChatPage(){
  const {records,month,locale,mode}=useFinance();
  const [messages,setMessages]=useState([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[lastMode,setLastMode]=useState('basic');
  const bottom=useRef(null);const stats=getStats(inMonth(records,month));
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages,busy]);
  async function ask(question){const text=question.trim();if(!text||busy)return;
    setMessages(p=>[...p,{id:crypto.randomUUID(),role:'user',text}]);setInput('');setBusy(true);
    try{
      let reply='';let activeMode='basic';
      if(mode==='live'&&supabase){
        const {data:{session}}=await supabase.auth.getSession();
        if(!session?.access_token)throw new Error(t(locale,'Sesi tamat. Sila log masuk semula.','Session expired. Please log in again.'));
        const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({message:text,locale,summary:{...stats,month},history:messages.filter(m=>!m.isError).slice(-6).map(m=>({role:m.role,text:m.text}))})});
        const data=await response.json();
        if(response.ok){reply=data.reply;activeMode='ai';}
        else if(data.code==='NO_AI_KEY'){reply=basicReply(text,locale,stats);}
        else throw new Error(data.error||'Service unavailable');
      }else reply=basicReply(text,locale,stats);
      setLastMode(activeMode);setMessages(p=>[...p,{id:crypto.randomUUID(),role:'assistant',text:reply}]);
    }catch(err){setMessages(p=>[...p,{id:crypto.randomUUID(),role:'assistant',text:err.message,isError:true}]);}finally{setBusy(false);}
  }
  const suggestions=locale==='ms'?['Macam mana nak kurangkan bil elektrik?','Berapa perlu saya simpan setiap bulan?','Bagaimana cara buat bajet keluarga?','Apakah cara urus pinjaman dengan baik?']:['How can I lower electricity bills?','How much should I save each month?','How can I create a family budget?','How should I manage loans?'];
  return <><SectionHeading eyebrow={t(locale,'PEMBANTU KEWANGAN','FINANCE ASSISTANT')} title={t(locale,'Tanya DompetBot 🤖','Ask DompetBot 🤖')} subtitle={t(locale,'Tanyakan tentang bajet, simpanan, bil dan pengurusan wang.','Ask about budgets, savings, bills and money habits.')}><button className="btn btn-outline" onClick={()=>setMessages([])}><RotateCcw size={16}/>{t(locale,'Chat baharu','New chat')}</button></SectionHeading><div className="chat-layout"><div className="chat-card"><div className="chat-head"><div className="bot-avatar"><Bot size={22}/></div><div><b>DompetBot</b><span>{lastMode==='ai'?t(locale,'Gemini AI aktif','Gemini AI active'):(mode==='demo'?t(locale,'Mod Demo • jawapan asas','Demo mode • basic replies'):t(locale,'Gemini AI / mod asas','Gemini AI / basic mode'))}</span></div><span className="online-dot"/></div><div className="chat-messages">{messages.length===0&&<div className="chat-empty"><div className="chat-emoji">🤖</div><h3>{t(locale,'Hai! Nak bantu urus duit keluarga?','Hi! Want help with family finances?')}</h3><p>{t(locale,'Tanya saya apa-apa tentang perbelanjaan, simpanan atau hutang. Pilih contoh soalan di bawah.','Ask about spending, savings or debt. Try a question below.')}</p><div className="chat-suggestions">{suggestions.map(q=><button key={q} onClick={()=>ask(q)}>{q}</button>)}</div></div>}{messages.map(m=><div key={m.id} className={`chat-message ${m.role==='user'?'chat-user':'chat-assistant'} ${m.isError?'chat-error':''}`}><span className="chat-bubble">{m.text}</span></div>)}{busy&&<div className="chat-message chat-assistant"><span className="chat-bubble loading-dots">● ● ●</span></div>}<div ref={bottom}/></div><form className="chat-input-row" onSubmit={e=>{e.preventDefault();ask(input);}}><input aria-label={t(locale,'Tulis soalan','Type a question')} value={input} onChange={e=>setInput(e.target.value)} placeholder={t(locale,'Tanya sesuatu kepada DompetBot...','Ask DompetBot anything...')} maxLength={1200}/><button type="submit" disabled={busy||!input.trim()} className="btn btn-primary" aria-label="Send"><Send size={19}/></button></form></div><aside className="chat-aside"><div className="chat-aside-card"><Sparkles size={22}/><b>{t(locale,'Apa yang DompetBot boleh bantu?','What can DompetBot help with?')}</b><p>{t(locale,'Panduan belanjawan, tabiat menabung, kos bil dan tips urus hutang. Gemini AI menyokong soalan terbuka apabila GEMINI_API_KEY diaktifkan.','Budgeting, saving habits, bills and debt management. Gemini AI supports broader questions when GEMINI_API_KEY is configured.')}</p></div><div className="chat-aside-card neutral"><ShieldCheck size={22}/><b>{t(locale,'Privasi & keselamatan','Privacy & safety')}</b><p>{t(locale,'Mod Gemini menghantar soalan, sejarah chat ringkas dan jumlah bulanan kepada Google, bukan transaksi individu. Data Free Tier mungkin digunakan untuk menambah baik produk Google. Jangan kongsi maklumat sensitif.','Gemini mode sends your question, recent chat and selected-month aggregate totals to Google, not individual transactions. Free-tier data may be used to improve Google products. Never share sensitive information.')}</p></div><p className="chat-disclaimer">{t(locale,'Jawapan untuk pendidikan umum sahaja, bukan nasihat kewangan profesional.','General educational guidance only; not professional financial advice.')}</p></aside></div></>;
}
