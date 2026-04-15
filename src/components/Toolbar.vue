<template>
  <div class="toolbar-wrapper">
    <div class="toolbar">
      <span class="t-title">水電工程估價單</span>
      <div class="t-btns desktop-only">
        <span class="autosave-badge"><span class="dot" />{{ autoSavedAt || '自動儲存' }}</span>
        <button class="btn import"      @click="$emit('import-json')">⬆ 匯入</button>
        <button class="btn export-json" @click="$emit('export-json')">⬇ 匯出存檔</button>
        <button class="btn excel"       @click="$emit('export-excel')">Excel</button>
        <button class="btn pdf" :disabled="pdfLoading" @click="doPDF">
          <span v-if="pdfLoading" class="spinner" />
          {{ pdfLoading ? '產生中...' : '匯出 PDF' }}
        </button>
        <button class="btn print" @click="$emit('print')" title="瀏覽器列印">🖨</button>
      </div>
      <div class="mobile-right mobile-only">
        <span class="dot-sm" />
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{open: menuOpen}">
          <span /><span /><span />
        </button>
      </div>
    </div>
    <Transition name="slide-down">
      <div v-if="menuOpen" class="mobile-menu mobile-only">
        <button class="mm-btn"       @click="$emit('import-json'); menuOpen=false">⬆ 匯入估價單</button>
        <button class="mm-btn"       @click="$emit('export-json'); menuOpen=false">⬇ 匯出存檔 (JSON)</button>
        <button class="mm-btn green" @click="$emit('export-excel'); menuOpen=false">Excel 匯出</button>
        <button class="mm-btn red"   :disabled="pdfLoading" @click="doPDF(); menuOpen=false">
          {{ pdfLoading ? '⏳ 產生中...' : '📄 匯出 PDF' }}
        </button>
        <button class="mm-btn"       @click="$emit('print'); menuOpen=false">🖨 瀏覽器列印</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ autoSavedAt: String, pdfLoading: Boolean })
const emit  = defineEmits(['export-excel','export-json','import-json','print','export-pdf'])
const menuOpen = ref(false)
function doPDF() { emit('export-pdf') }
</script>

<style scoped>
.toolbar-wrapper {
  position: sticky; top: 0; z-index: 300;
  background: var(--navy);
  box-shadow: 0 2px 16px rgba(26,53,87,.3);
}
.toolbar {
  max-width: 1060px; margin: 0 auto;
  padding: 10px 1.5rem;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.t-title { font-size: 14px; color: rgba(255,255,255,.6); letter-spacing: .05em; white-space: nowrap; }

/* ── desktop buttons ── */
.t-btns  { display: flex; align-items: center; gap: 8px; }
.autosave-badge { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,.45); white-space: nowrap; margin-right: 4px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #4caf50; display: inline-block; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.btn {
  padding: 7px 15px; border-radius: 5px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; border: none;
  white-space: nowrap;
  transition: opacity .15s, transform .1s;
  display: flex; align-items: center; gap: 5px;
}
.btn:active { transform: scale(.97); }
.btn:hover  { opacity: .85; }
.btn:disabled { opacity: .55; cursor: wait; }

.btn.import      { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3); }
.btn.export-json { background: rgba(255,255,255,.18); color: #fff; border: 1px solid rgba(255,255,255,.3); }
.btn.excel       { background: #1e7145; color: #fff; }
.btn.pdf         { background: #b03030; color: #fff; }
.btn.print       { background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.25); padding: 7px 11px; }

.spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── mobile ── */
.mobile-right { display: flex; align-items: center; gap: 10px; }
.dot-sm { width: 8px; height: 8px; border-radius: 50%; background: #4caf50; animation: pulse 2s infinite; }
.hamburger { background: none; border: none; cursor: pointer; padding: 4px; display: flex; flex-direction: column; gap: 5px; }
.hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; transition: all .25s; }
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-menu { background: var(--navy); border-top: 1px solid rgba(255,255,255,.12); padding: 8px 1rem 14px; }
.mm-btn {
  display: block; width: 100%; padding: 13px 16px; margin-bottom: 7px;
  background: rgba(255,255,255,.1); color: #fff;
  border: 1px solid rgba(255,255,255,.18); border-radius: 10px;
  font-size: 15px; font-weight: 700; text-align: left; cursor: pointer;
}
.mm-btn:last-child { margin-bottom: 0; }
.mm-btn.green { background: #1e7145; }
.mm-btn.red   { background: #b03030; }
.mm-btn:active { opacity: .8; }
.mm-btn:disabled { opacity: .55; cursor: wait; }

.slide-down-enter-active, .slide-down-leave-active { transition: all .22s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.desktop-only { display: flex; }
.mobile-only  { display: none; }
@media (max-width: 700px) {
  .desktop-only { display: none !important; }
  .mobile-only  { display: flex !important; }
  .t-title { font-size: 15px; }
}
</style>
