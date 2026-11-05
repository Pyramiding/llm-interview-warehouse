import {ownerAccess} from "@/lib/server";
import {chatGPTSignInPath,chatGPTSignOutPath} from "./chatgpt-auth";
import Dashboard from "./dashboard";
export const dynamic = "force-dynamic";
export default async function Page() {
  const access = await ownerAccess();
  return <main className="shell"><header><a href="https://pyramiding.github.io/llm-interview-warehouse/">← 面经仓库</a><span>访问统计</span>{access.user && <a href={chatGPTSignOutPath("/")} target="_top">退出登录</a>}</header>
    {access.allowed ? <Dashboard signInPath={chatGPTSignInPath("/")}/> : <section className="login"><span className="eyebrow">LLM INTERVIEW WAREHOUSE</span><h1>访问明细仅管理员可见</h1><p>{access.user ? "当前登录账号没有查看权限。可以退出后使用仓库所有者账号登录。" : "公开页面只显示访问次数。查看IP访问明细，请使用仓库所有者的ChatGPT账号登录。"}</p>{!access.user && <a className="button" href={chatGPTSignInPath("/")} target="_top">使用ChatGPT登录</a>}<a className="back" href="https://pyramiding.github.io/llm-interview-warehouse/">回到面经仓库 ↗</a></section>}
    <footer>时间采用北京时间。IP明细仅保留最近30天；累计访问量从统计启用时开始计算。</footer>
  </main>;
}
