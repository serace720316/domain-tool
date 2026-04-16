🚀 伺服器部署步驟 (Ubuntu)
當你在 Windows 完成修改並 git push 後，請連線至伺服器執行：

1. 同步代碼
Bash
cd /opt/app/domain-tool
git pull origin main
2. 更新前端 (需重新編譯)
Bash
cd frontend
npm run build
3. 更新後端 (重啟 PM2)
Bash
cd ../backend
pm2 restart domain-api --update-env
⚙️ 系統配置資訊
網頁伺服器: Nginx (反向代理 Port 4000)

後端進程: PM2 (Name: domain-api)

專案路徑: /opt/app/domain-tool

Nginx 設定檔: /etc/nginx/sites-available/default

📝 常用維護指令
查看即時日誌: pm2 logs domain-api

檢查埠號佔用: sudo ss -tlnp | grep :4000

重啟 Nginx: sudo systemctl restart nginx

修正權限: sudo chmod -R 755 /opt/app/domain-tool