// 測試方法:
// 終端機到目錄 D:\VS Code\domain-tool\frontend\
// 執行 npm run dev
// 瀏覽器開啟 http://localhost:5173/

<template>
  <div class="app-container">
    <nav class="sidebar">
      <div class="logo">Tony工具箱Ver1.1</div>
      <ul>
        <li :class="{ active: currentTab === 'dns' }" @click="currentTab = 'dns'">
          🌐 大量域名解析
        </li>
        <li class="disabled">🔍 WHOIS 查詢 (預留)</li>
        <li class="disabled">🛡️ 安全性掃描 (預留)</li>
      </ul>
    </nav>

    <main class="content">
      <div v-if="currentTab === 'dns'">
        <h1>大量域名解析工具</h1>
        <p class="hint">請在下方貼上域名清單（每行一個）</p>
        
        <textarea 
          v-model="inputText" 
          placeholder="example.com&#10;google.com&#10;apple.com"
        ></textarea>

        <div class="action-bar">
          <button @click="handleResolve" :disabled="loading" class="btn-primary">
            {{ loading ? '解析中...' : '開始解析' }}
          </button>
          <button @click="clearAll" class="btn-outline">清除</button>
        </div>

        <div v-if="results.length > 0" class="result-section">
          <div class="summary">
            解析完成，共 {{ results.length }} 筆資料
          </div>
          <table>
            <thead>
              <tr>
                <th>域名</th>
                <th>CNAME (別名)</th><th>IP 位址</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in results" :key="item.domain">
                <td>{{ item.domain }}</td>
                <td class="cname-text">{{ item.cname }}</td>
                <td class="ip-text">{{ item.ip }}</td>
                <td>
                  <span :class="['status-tag', item.status]">{{ item.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const currentTab = ref('dns');
const inputText = ref('');
const results = ref([]);
const loading = ref(false);

const handleResolve = async () => {
  const domains = inputText.value.split('\n')
    .map(d => d.trim())
    .filter(d => d !== '');

  if (domains.length === 0) {
    alert('請輸入至少一個域名');
    return;
  }

  loading.value = true;
  try {  
    // 開發用
    // const response = await axios.post('http://localhost:3000/api/resolve', { domains });

    // server轉發用
    // const response = await axios.post('/api/resolve', { domains });

    // 自動
    const apiUrl = import.meta.env.DEV 
  ? 'http://localhost:4000/api/resolve' 
  : '/api/resolve';
    const response = await axios.post(apiUrl, { domains });

    results.value = response.data;
  } catch (error) {
    console.error(error);
    alert('解析失敗，請檢查網路或伺服器狀態');
  } finally {
    loading.value = false;
  }
};

const clearAll = () => {
  inputText.value = '';
  results.value = [];
};
</script>

<style scoped>
.app-container { display: flex; min-height: 100vh; font-family: 'Segoe UI', sans-serif; background: #f4f7f6; }
.sidebar { width: 240px; background: #2c3e50; color: white; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); }
.logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 30px; color: #42b983; }
.sidebar ul { list-style: none; padding: 0; }
.sidebar li { padding: 12px 15px; margin-bottom: 5px; cursor: pointer; border-radius: 4px; transition: 0.3s; }
.sidebar li:hover:not(.disabled) { background: #34495e; }
.sidebar li.active { background: #42b983; color: white; }
.sidebar li.disabled { color: #7f8c8d; cursor: not-allowed; opacity: 0.6; }

.content { flex: 1; padding: 40px; overflow-y: auto; }
h1 { margin-top: 0; color: #333; }
.hint { color: #666; margin-bottom: 10px; }
textarea { width: 100%; height: 200px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; margin-bottom: 20px; box-sizing: border-box; }

.action-bar { display: flex; gap: 10px; margin-bottom: 30px; }
.btn-primary { padding: 10px 25px; background: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.btn-primary:disabled { background: #a8d8c0; }
.btn-outline { padding: 10px 25px; background: white; color: #666; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }

.result-section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.summary { margin-bottom: 15px; font-weight: bold; color: #2c3e50; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; }
td { padding: 12px; border-bottom: 1px solid #eee; }
.cname-text { font-family: monospace; color: #3498db; word-break: break-all; /* 防止長域名撐開表格 */ font-size: 0.9rem; }
.ip-text { font-family: monospace; color: #e67e22; }
.status-tag { padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }
.status-tag.Success { background: #e8f5e9; color: #2e7d32; }
.status-tag.Failed { background: #ffebee; color: #c62828; }
</style>