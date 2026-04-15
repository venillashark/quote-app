<template>
  <div class="table-section">
    <div class="tbl-outer">
      <table class="qt">
        <colgroup>
          <col style="width:30px">      <!-- # -->
          <col style="width:16%">       <!-- 項目說明 -->
          <col style="width:19%">       <!-- 規格/品牌 — wider -->
          <col style="width:42px">      <!-- 單位 -->
          <col style="width:56px">      <!-- 數量 -->
          <col style="width:92px">      <!-- 單價 -->
          <col style="width:92px">      <!-- 總價 -->
          <col style="width:13%">       <!-- 備註 — narrower -->
          <col class="no-print" style="width:72px"> <!-- 操作 -->
        </colgroup>
        <thead>
          <tr>
            <th>#</th><th>項目說明</th><th>規格 / 品牌</th>
            <th>單位</th><th>數量</th><th>單價（NT$）</th>
            <th>總價（NT$）</th><th>備　　註</th>
            <th class="no-print"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(cat, ci) in categories" :key="cat.id">
            <!-- category header -->
            <tr class="cat-row">
              <td colspan="8">
                <div class="cat-inner">
                  <div class="cat-left">
                    <template v-if="editingCat === cat.id">
                      <input class="cat-rename" :value="cat.label"
                        @change="doRename(cat.id, $event.target.value)"
                        @blur="editingCat=null" @keyup.enter="editingCat=null"
                        ref="renameInput" />
                    </template>
                    <template v-else>
                      <span class="cat-label">{{ cat.label }}</span>
                      <span class="cat-hint no-print">（點✏️改名）</span>
                    </template>
                  </div>
                  <div class="cat-acts no-print">
                    <button class="ca rename" @click="startRename(cat.id)">✏️</button>
                    <button class="ca mv" @click="$emit('move-category',cat.id,-1)" :disabled="ci===0">↑</button>
                    <button class="ca mv" @click="$emit('move-category',cat.id, 1)" :disabled="ci===categories.length-1">↓</button>
                    <button class="ca add-i" @click="onAddItem(cat.id)">＋ 項目</button>
                    <button class="ca del-c" @click="$emit('delete-category',cat.id)">✕</button>
                  </div>
                </div>
              </td>
              <td class="no-print" style="background:var(--navy-mid)"></td>
            </tr>

            <!-- data rows -->
            <tr v-for="(row, ri) in items[cat.id]||[]" :key="`${cat.id}-${ri}`"
              class="data-row" :style="{background: ri%2===0?'#fff':'var(--gray1)'}">
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <span class="idx">{{ ri+1 }}</span>
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input :value="row.desc" @change="up(cat.id,ri,'desc',$event)" placeholder="項目說明" />
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <!-- spec: textarea so it wraps -->
                <textarea :value="row.spec" @change="up(cat.id,ri,'spec',$event)"
                  placeholder="品牌、型號、規格" class="spec-area" rows="1"
                  @input="autoResize($event)" />
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input :value="row.unit" @change="up(cat.id,ri,'unit',$event)" placeholder="式" class="c-center" />
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input type="number" :value="row.qty" @change="up(cat.id,ri,'qty',$event,true)" min="0" step="1" class="c-right" />
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input type="number" :value="row.price" @change="up(cat.id,ri,'price',$event,true)" min="0" class="c-right" />
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <span class="total-val">{{ fmt((+row.qty||0)*(+row.price||0)) }}</span>
              </td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input :value="row.note" @change="up(cat.id,ri,'note',$event)" placeholder="備註" class="c-muted" />
              </td>
              <td class="no-print td-c" :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <button class="del-row" @click="$emit('delete-item',cat.id,ri)">×</button>
              </td>
            </tr>

            <!-- subtotal -->
            <tr class="subtotal-row">
              <td colspan="5" class="st-gap"></td>
              <td class="st-lbl">{{ cat.label }}&nbsp;小計</td>
              <td class="st-val">{{ fmt(catSub(cat.id)) }}</td>
              <td colspan="2"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="add-cat-row no-print">
      <button class="add-cat" @click="$emit('add-category')">＋ 新增大類</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const props = defineProps({ categories:Array, items:Object })
const emit  = defineEmits(['add-category','update-category','delete-category','move-category','add-item','update-item','delete-item','change'])

const editingCat  = ref(null)
const renameInput = ref(null)

const fmt    = n => Math.round(n).toLocaleString('zh-TW')
const catSub = id => (props.items[id]||[]).reduce((s,r)=>s+(+r.qty||0)*(+r.price||0),0)

function up(catId, ri, field, e, isNum=false) {
  emit('update-item', catId, ri, field, isNum ? +e.target.value : e.target.value)
  emit('change')
}
function startRename(id) {
  editingCat.value = id
  nextTick(() => { const el = renameInput.value?.[0] || renameInput.value; if(el){el.focus();el.select()} })
}
function doRename(id, val) { emit('update-category', id, val); editingCat.value = null; emit('change') }
function onAddItem(catId) { emit('add-item', catId); emit('change') }
function autoResize(e) { const el=e.target; el.style.height='auto'; el.style.height=el.scrollHeight+'px' }
</script>

<style scoped>
.table-section { padding:0 1.5rem }
.tbl-outer { border:2px solid var(--navy);overflow-x:auto }
table.qt { width:100%;border-collapse:collapse;table-layout:fixed;min-width:680px }

thead th {
  background:var(--navy);color:#fff;font-size:13px;font-weight:700;
  padding:9px 6px;text-align:center;
  border-right:1px solid rgba(255,255,255,.18);white-space:nowrap
}
thead th:last-child { border-right:none }

.cat-row > td { background:var(--navy-mid);border-top:2px solid var(--navy);padding:0 }
.cat-inner { display:flex;align-items:center;justify-content:space-between;padding:6px 10px;gap:8px }
.cat-left  { display:flex;align-items:center;gap:8px;flex:1;min-width:0 }
.cat-label { font-size:14px;font-weight:700;color:#fff;letter-spacing:.06em }
.cat-hint  { font-size:11px;color:rgba(255,255,255,.38);white-space:nowrap }
.cat-rename {
  font-size:14px;font-weight:700;color:#fff;
  background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.5);
  border-radius:4px;padding:2px 8px;outline:none;min-width:120px
}
.cat-acts { display:flex;gap:4px;flex-shrink:0 }
.ca { padding:3px 9px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:opacity .15s }
.ca:disabled { opacity:.3;cursor:default }
.ca.rename { background:rgba(255,255,255,.2);color:#fff }
.ca.mv     { background:rgba(255,255,255,.15);color:#fff;padding:3px 7px }
.ca.add-i  { background:rgba(255,255,255,.25);color:#fff }
.ca.del-c  { background:rgba(192,57,43,.75);color:#fff }
.ca:not(:disabled):hover { opacity:.78 }

.data-row td {
  border-bottom:1px solid var(--border);border-right:1px solid var(--border);
  padding:2px 2px;vertical-align:middle
}
.data-row td:last-child { border-right:none }
.data-row td input,.data-row td textarea {
  width:100%;border:none;outline:none;font-size:14px;color:var(--text);
  background:transparent;padding:4px 5px
}
.data-row td input:focus,.data-row td textarea:focus { background:rgba(46,109,164,.07);border-radius:3px }
/* spec textarea — auto-height, no scrollbar */
.spec-area {
  resize:none;overflow:hidden;min-height:28px;line-height:1.45;
  color:var(--muted) !important;display:block
}
.c-muted  { color:var(--muted) !important }
.c-center { text-align:center !important }
.c-right  { text-align:right !important }
input[type=number] { text-align:right }
.idx { display:block;text-align:center;color:#aaa;font-size:12px;padding:4px 0 }
.td-c { text-align:center }
.total-val { display:block;text-align:right;padding:4px 7px;font-weight:700;font-size:14px;color:var(--navy) }
.del-row {
  background:none;border:none;cursor:pointer;color:#ccc;font-size:16px;
  padding:2px 5px;border-radius:4px;line-height:1;display:block;margin:0 auto;transition:color .15s
}
.del-row:hover { color:var(--red);background:#fef0f0 }

.subtotal-row td {
  background:var(--navy-pale);border-top:1px solid var(--navy-light);
  border-bottom:2px solid var(--navy);border-right:1px solid var(--border);
  padding:7px 8px;font-size:13px;font-weight:700;color:var(--navy);white-space:nowrap
}
.subtotal-row td:last-child { border-right:none }
.st-lbl { text-align:right }
.st-val { text-align:right;min-width:90px }

.add-cat-row { padding:10px 0 14px }
.add-cat {
  background:none;border:1.5px dashed var(--navy-mid);border-radius:6px;
  padding:7px 22px;font-size:13px;font-weight:700;color:var(--navy-mid);cursor:pointer;transition:background .15s
}
.add-cat:hover { background:var(--navy-pale) }
</style>
