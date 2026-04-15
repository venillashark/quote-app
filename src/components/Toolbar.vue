<template>
  <div class="toolbar-wrapper">
    <div class="toolbar">
      <span class="t-title">水電工程估價單</span>
      <div class="t-btns">
        <span class="autosave-badge">
          <span class="dot" />
          {{ autoSavedAt ? autoSavedAt : '自動儲存中' }}
        </span>
        <button class="btn import" @click="$emit('import-json')" title="匯入估價單 JSON">⬆ 匯入</button>
        <button class="btn export-json" @click="$emit('export-json')" title="匯出估價單為 JSON，可下次匯入">⬇ 匯出存檔</button>
        <button class="btn excel" @click="$emit('export-excel')">📊 匯出 Excel</button>
        <button class="btn print"  @click="$emit('print')">🖨 列印 / PDF</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ autoSavedAt: String })
defineEmits(['export-excel','export-json','import-json','print'])
</script>

<style scoped>
.toolbar-wrapper { position:sticky;top:0;z-index:200;background:var(--navy);box-shadow:0 2px 16px rgba(26,53,87,.3) }
.toolbar { max-width:1060px;margin:0 auto;padding:9px 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:12px }
.t-title { font-size:14px;color:rgba(255,255,255,.6);letter-spacing:.06em;white-space:nowrap }
.t-btns  { display:flex;align-items:center;gap:7px;flex-wrap:wrap }
.autosave-badge { display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.45);white-space:nowrap }
.dot { width:7px;height:7px;border-radius:50%;background:#4caf50;display:inline-block;animation:pulse 2s infinite }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
.btn { padding:6px 14px;border-radius:5px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:opacity .15s,transform .1s;white-space:nowrap }
.btn:active{transform:scale(.97)}
.btn.import      { background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3) }
.btn.export-json { background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3) }
.btn.excel  { background:#1e7145;color:#fff }
.btn.print  { background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25) }
.btn:hover { opacity:.82 }
</style>
