<template>
  <div class="app">
    <Toolbar
      :auto-saved-at="autoSavedAt"
      :pdf-loading="pdfLoading"
      @export-excel="doExportExcel"
      @export-json="exportJSON"
      @import-json="triggerImport"
      @print="doPrint"
      @export-pdf="doExportPDF"
    />
    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="importJSON" />

    <div class="page" id="print-area">
      <div class="bar-navy" />
      <div class="title-block">
        <h1>水電工程估價單</h1>
        <p>Plumbing &amp; Electrical Engineering Quotation</p>
      </div>
      <div class="bar-gold" />
      <InfoSection :info="info" @change="onAnyChange" />
      <TableSection
        :categories="categories" :items="items"
        @add-category="addCategory" @update-category="updateCategory"
        @delete-category="deleteCategory" @move-category="moveCategory"
        @add-item="addItem" @update-item="updateItem" @delete-item="deleteItem"
        @change="onAnyChange"
      />
      <BottomSection
        :categories="categories" :items="items"
        :notes="info.notes" :tax-rate="taxRate"
        @update-notes="v => { info.notes = v; onAnyChange() }"
        @update-tax="v => { taxRate = v; onAnyChange() }"
      />
      <SignSection />
      <div class="bar-gold" />
      <div class="bar-navy" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Toolbar       from './components/Toolbar.vue'
import InfoSection   from './components/InfoSection.vue'
import TableSection  from './components/TableSection.vue'
import BottomSection from './components/BottomSection.vue'
import SignSection   from './components/SignSection.vue'
import { useAutoSave }  from './useAutoSave.js'
import { exportExcel }  from './exportExcel.js'
import { exportPDF }    from './exportPDF.js'

/* ── state ── */
const taxRate     = ref(0)
const autoSavedAt = ref('')
const pdfLoading  = ref(false)
const fileInput   = ref(null)

const info = reactive({
  qno:'QT-2026001', qdate: new Date().toISOString().slice(0,10),
  qvalid:'30 天', qaddr:'', qdesc:'', notes:'',
})

const categories = ref([
  { id:'elec',  label:'電力工程'   },
  { id:'plumb', label:'給排水工程' },
  { id:'base',  label:'基礎施工'   },
  { id:'equip', label:'設備安裝'   },
  { id:'misc',  label:'其他項目'   },
])

const items = reactive({
  elec: [
    { desc:'全屋電線抽換',  spec:'太平洋 2.0mm 實心線',          unit:'式', qty:7,  price:2700,  note:'依現況抽換'   },
    { desc:'專用迴路配置',  spec:'太平洋 5.5mm 絞線',            unit:'組', qty:7,  price:3200,  note:'含漏電斷路器'  },
    { desc:'總開關箱更新',  spec:'匯流排電箱、無熔絲斷路器更新',  unit:'式', qty:1,  price:12000, note:'提升用電安全'  },
    { desc:'插座',          spec:'Panasonic 星光系列',            unit:'式', qty:26, price:850,   note:'全室'         },
    { desc:'開關',          spec:'Panasonic 星光系列',            unit:'式', qty:16, price:850,   note:'全室'         },
    { desc:'網路配線',      spec:'太平洋',                        unit:'式', qty:4,  price:2000,  note:'3房和客廳'    },
    { desc:'TV配線',        spec:'太平洋',                        unit:'式', qty:2,  price:2000,  note:'主臥和客廳'   },
  ],
  plumb: [
    { desc:'冷水管路配置', spec:'南亞 PVC 管',                  unit:'式', qty:1, price:0, note:'' },
    { desc:'熱水管路配置', spec:'白鐵不鏽鋼管（壓接/保溫）',    unit:'式', qty:1, price:0, note:'' },
    { desc:'排水管路修正', spec:'南亞 PVC 管（廚、衛、陽台）',  unit:'式', qty:1, price:0, note:'' },
  ],
  base:  [{ desc:'管路打溝工程', spec:'室內水電管溝打鑿', unit:'式', qty:1, price:0, note:'不含大面積拆除' }],
  equip: [
    { desc:'衛浴設備安裝', spec:'馬桶、洗手台、淋浴組', unit:'組', qty:2, price:0, note:'業主提供' },
    { desc:'暖風機安裝',   spec:'含排風管連接',          unit:'式', qty:1, price:0, note:'業主提供' },
  ],
  misc: [
    { desc:'五金零件費', spec:'噴燈、凡而、黏劑、膠帶等', unit:'式', qty:1, price:0, note:'' },
    { desc:'粗清費',     spec:'水電施工廢料清理與運棄',    unit:'式', qty:1, price:0, note:'不含大宗拆除垃圾' },
  ],
})

/* ── auto-save ── */
const { save, load, scheduleSave } = useAutoSave(info, categories, items, taxRate)
function onAnyChange() {
  scheduleSave()
  autoSavedAt.value = ''
}

/* ── categories ── */
const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,5)
function addCategory() { const id=newId(); categories.value.push({id,label:'新類別'}); items[id]=[{desc:'',spec:'',unit:'式',qty:1,price:0,note:''}]; onAnyChange() }
function updateCategory(id,label) { const c=categories.value.find(c=>c.id===id); if(c){c.label=label;onAnyChange()} }
function deleteCategory(id) {
  if (categories.value.length<=1){alert('至少保留一個大類');return}
  const name=categories.value.find(c=>c.id===id)?.label
  if (!confirm(`確定刪除「${name}」及所有子項目？`)) return
  categories.value=categories.value.filter(c=>c.id!==id); delete items[id]; onAnyChange()
}
function moveCategory(id,dir) {
  const idx=categories.value.findIndex(c=>c.id===id), ni=idx+dir
  if(ni<0||ni>=categories.value.length) return
  const a=[...categories.value];[a[idx],a[ni]]=[a[ni],a[idx]];categories.value=a; onAnyChange()
}
function addItem(catId)             { if(!items[catId])items[catId]=[]; items[catId].push({desc:'',spec:'',unit:'式',qty:1,price:0,note:''}); onAnyChange() }
function updateItem(catId,ri,f,v)   { if(items[catId]?.[ri]!=null){items[catId][ri][f]=v;onAnyChange()} }
function deleteItem(catId,ri) {
  if((items[catId]?.length||0)<=1){alert('每個大類至少保留一列');return}
  items[catId].splice(ri,1); onAnyChange()
}

/* ── export excel ── */
async function doExportExcel() {
  await exportExcel({ info:{ ...info }, categories: categories.value, items: JSON.parse(JSON.stringify(items)), taxRate: taxRate.value })
}

/* ── export/import JSON ── */
function exportJSON() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    info: { ...info },
    categories: categories.value,
    items: JSON.parse(JSON.stringify(items)),
    taxRate: taxRate.value,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href=url; a.download=`估價單_${info.qno}_${new Date().toISOString().slice(0,10)}.json`; a.click()
  URL.revokeObjectURL(url)
}
function triggerImport() { fileInput.value.click() }
function importJSON(e) {
  const file = e.target.files[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    try {
      const p = JSON.parse(ev.target.result)
      if (p.info)       Object.assign(info, p.info)
      if (p.categories) categories.value = p.categories
      if (p.items)      Object.keys(p.items).forEach(k=>{ items[k]=p.items[k] })
      if (p.taxRate!=null) taxRate.value = p.taxRate
      save(); autoSavedAt.value = '已匯入'
    } catch { alert('檔案格式錯誤') }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function doPrint() { window.print() }
async function doExportPDF() {
  pdfLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 80))
    await exportPDF(`水電工程估價單_${info.qno || 'quote'}`)
  } catch (e) {
    console.error('PDF 匯出失敗:', e)
    alert('PDF 匯出失敗：' + e.message)
  } finally {
    pdfLoading.value = false
  }
}

onMounted(() => { load() })
</script>

<style scoped>
.title-block { background:var(--navy); padding:1.3rem 2rem; text-align:center }
.title-block h1 { font-family:'Noto Serif TC',serif; font-size:24px; font-weight:700; color:#fff; letter-spacing:.2em }
.title-block p  { font-size:12px; color:rgba(255,255,255,.4); letter-spacing:.12em; margin-top:4px }
</style>
