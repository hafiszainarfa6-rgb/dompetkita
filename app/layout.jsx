import './globals.css';
import { FinanceProvider } from '@/context/finance-context';

export const metadata={
  title:'DompetKita | Pengurusan Kewangan Keluarga',
  description:'Aplikasi kewangan keluarga dwibahasa dengan graf, simpanan, bil dan chatbot.',
};
export const viewport={width:'device-width',initialScale:1,themeColor:'#f6f8f8'};

export default function RootLayout({children}){
  return <html lang="ms"><body><FinanceProvider>{children}</FinanceProvider></body></html>;
}
