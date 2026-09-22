import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'日常茶事｜顧客顯示器 Prototype',description:'可同步操作的餐飲顧客顯示器研究原型'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>;}
