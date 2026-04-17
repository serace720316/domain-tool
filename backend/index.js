// 測試方法:
// 終端機到目錄 D:\VS Code\domain-tool\backend\
// 執行 node index.js

const express = require('express');
const dns = require('dns').promises; // 使用 promise 版本
const cors = require('cors');

const app = express();
const PORT = 4000;

// 1. 啟動 CORS，讓你的 Vue 前端（5173 埠）可以跨網域呼叫這個 API
app.use(cors());
// 2. 讓 Express 能夠解析前端傳來的 JSON 資料
app.use(express.json());

// 大量解析域名的 API
app.post('/api/resolve', async (req, res) => {
    const { domains } = req.body;

    if (!domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: '請提供域名陣列' });
    }

    const results = await Promise.all(domains.map(async (domain) => {
        const cleanDomain = domain.trim();
        if (!cleanDomain) return null;

        let ip = 'N/A';
        let cname = '-';
        let status = 'Failed';

        try {
            // 1. 嘗試解析 CNAME
            try {
                const cnames = await dns.resolveCname(cleanDomain);
                if (cnames && cnames.length > 0) {
                    cname = cnames[0]; // 取得第一個 CNAME
                }
            } catch (e) {
                // 沒有 CNAME 很正常，忽略此錯誤繼續往下查 IP
            }

            // 2. 嘗試解析 IP (A Record)
            // 使用 resolve4 獲取 A 紀錄，若有 CNAME 則 lookup 通常會回傳最終 IP
            const lookupResult = await dns.lookup(cleanDomain);
            ip = lookupResult.address;
            status = 'Success';

            return { domain: cleanDomain, ip, cname, status };
        } catch (err) {
            return { domain: cleanDomain, ip: 'N/A', cname: '-', status: 'Failed' };
        }
    }));

    res.json(results.filter(r => r !== null));
});
// app.post('/api/resolve', async (req, res) => {
//     const { domains } = req.body;

//     // 檢查輸入是否為陣列
//     if (!domains || !Array.isArray(domains)) {
//         return res.status(400).json({ error: '請提供域名陣列 (Array of domains)' });
//     }

//     console.log(`收到解析請求，數量：${domains.length}`);

//     // 使用 Promise.all 同時解析所有域名
//     const results = await Promise.all(domains.map(async (domain) => {
//         const cleanDomain = domain.trim();
        
//         // 排除空行
//         if (!cleanDomain) return null;

//         try {
//             // 使用 lookup，這會調用作業系統層級的解析，最穩定
//             const result = await dns.lookup(cleanDomain);
//             return {
//                 domain: cleanDomain,
//                 ip: result.address,
//                 status: 'Success'
//             };
//         } catch (err) {
//             // 如果解析失敗（如域名不存在或網路斷開）
//             return {
//                 domain: cleanDomain,
//                 ip: 'N/A',
//                 status: 'Failed'
//             };
//         }
//     }));

//     // 過濾掉 null 並回傳結果
//     res.json(results.filter(r => r !== null));
// });

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`  DNS 解析後端已啟動！`);
    console.log(`  本地測試網址: http://localhost:${PORT}`);
    console.log(`========================================`);
});