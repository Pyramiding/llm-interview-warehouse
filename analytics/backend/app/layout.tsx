import type {Metadata} from "next";
import "./globals.css";
export const metadata: Metadata = {title:"面经仓库 · 访问统计", description:"面经仓库访问统计与管理员访问明细", robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
