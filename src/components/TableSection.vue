<template>
  <div class="table-section">

    <!-- ══ DESKTOP TABLE ══════════════════════════════════════════ -->
    <div class="tbl-outer desktop-only">
      <table class="qt">
        <colgroup>
          <col style="width:30px">
          <col style="width:17%">
          <col style="width:19%">
          <col style="width:44px">
          <col style="width:58px">
          <col style="width:94px">
          <col style="width:94px">
          <col style="width:14%">
          <col class="col-act-col" style="width:44px">
        </colgroup>
        <thead>
          <tr>
            <th>#</th><th>項目說明</th><th>規格 / 品牌</th>
            <th>單位</th><th>數量</th><th>單價（NT$）</th>
            <th>總價（NT$）</th><th>備　　註</th><th class="col-act-hdr"></th>
          </tr>
        </thead>
        <template v-for="(cat, ci) in categories" :key="cat.id">
        <tbody class="cat-group">
            <tr class="cat-row">
              <td colspan="9">
                <div class="cat-inner">
                  <div class="cat-left">
                    <template v-if="editingCat === cat.id">
                      <input class="cat-rename" :value="cat.label"
                        @change="doRename(cat.id,$event.target.value)"
                        @blur="editingCat=null" @keyup.enter="editingCat=null" ref="renameRef" />
                    </template>
                    <template v-else>
                      <span class="cat-label">{{ cat.label }}</span>
                      <span class="cat-hint">（點✏️改名）</span>
                    </template>
                  </div>
                  <div class="cat-acts">
                    <button class="ca rename" @click="startRename(cat.id)">✏️</button>
                    <button class="ca mv" @click="$emit('move-category',cat.id,-1)" :disabled="ci===0">↑</button>
                    <button class="ca mv" @click="$emit('move-category',cat.id, 1)" :disabled="ci===categories.length-1">↓</button>
                    <button class="ca add-i" @click="$emit('add-item',cat.id);$emit('change')">＋ 項目</button>
                    <button class="ca del-c" @click="$emit('delete-category',cat.id)">✕</button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-for="(row,ri) in items[cat.id]||[]" :key="`d-${cat.id}-${ri}`"
              class="data-row" :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}"><span class="idx">{{ ri+1 }}</span></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input :value="row.desc" @change="up(cat.id,ri,'desc',$event)" placeholder="項目說明" /></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <textarea :value="row.spec" @change="up(cat.id,ri,'spec',$event)"
                  placeholder="品牌、型號、規格" class="spec-ta" rows="1" @input="autoH($event)" /></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input :value="row.unit" @change="up(cat.id,ri,'unit',$event)" placeholder="式" class="c-center" /></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input type="number" :value="row.qty" @change="up(cat.id,ri,'qty',$event,true)" min="0" step="1" class="c-right" /></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input type="number" :value="row.price" @change="up(cat.id,ri,'price',$event,true)" min="0" class="c-right" /></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <span class="total-val">{{ fmt((+row.qty||0)*(+row.price||0)) }}</span></td>
              <td :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <input :value="row.note" @change="up(cat.id,ri,'note',$event)" placeholder="備註" class="c-muted" /></td>
              <td class="td-c col-act-td" :style="{background:ri%2===0?'#fff':'var(--gray1)'}">
                <button class="del-row" @click="$emit('delete-item',cat.id,ri)">×</button></td>
            </tr>
            <tr class="subtotal-row">
              <td colspan="5"></td>
              <td class="st-lbl">{{ cat.label }}&nbsp;小計</td>
              <td class="st-val">{{ fmt(catSub(cat.id)) }}</td>
              <td colspan="2"></td>
            </tr>
        </tbody>
        </template>
      </table>
    </div>
    <div class="add-cat-row no-print desktop-only">
      <button class="add-cat" @click="$emit('add-category')">＋ 新增大類</button>
    </div>

    <!-- ══ MOBILE CARDS ════════════════════════════════════════════ -->
    <div class="mobile-table mobile-only">
      <div v-for="(cat, ci) in categories" :key="`m-${cat.id}`" class="m-category">
        <!-- category header -->
        <div class="m-cat-hdr" @click="toggleCat(cat.id)">
          <div class="m-cat-left">
            <span class="m-cat-chevron" :class="{open: !collapsed[cat.id]}">›</span>
            <template v-if="mEditingCat === cat.id">
              <input class="m-cat-rename" :value="cat.label"
                @change="doRename(cat.id,$event.target.value)"
                @blur="mEditingCat=null" @keyup.enter="mEditingCat=null"
                @click.stop ref="mRenameRef" />
            </template>
            <span v-else class="m-cat-title">{{ cat.label }}</span>
          </div>
          <div class="m-cat-right" @click.stop>
            <span class="m-cat-sub">{{ fmt(catSub(cat.id)) }}</span>
            <button class="m-ca rename" @click="startMRename(cat.id)">✏️</button>
            <button class="m-ca mv" @click="$emit('move-category',cat.id,-1)" :disabled="ci===0">↑</button>
            <button class="m-ca mv" @click="$emit('move-category',cat.id, 1)" :disabled="ci===categories.length-1">↓</button>
            <button class="m-ca del" @click="$emit('delete-category',cat.id)">✕</button>
          </div>
        </div>

        <!-- items (collapsible) -->
        <div v-show="!collapsed[cat.id]" class="m-items">
          <div v-for="(row,ri) in items[cat.id]||[]" :key="`mc-${cat.id}-${ri}`" class="m-item-card">
            <div class="m-item-top">
              <span class="m-item-no">{{ ri+1 }}</span>
              <button class="m-del-item" @click="$emit('delete-item',cat.id,ri)">×</button>
            </div>
            <div class="m-fields">
              <div class="mf full">
                <label>項目說明</label>
                <input :value="row.desc" @change="up(cat.id,ri,'desc',$event)" placeholder="項目說明" />
              </div>
              <div class="mf full">
                <label>規格 / 品牌</label>
                <input :value="row.spec" @change="up(cat.id,ri,'spec',$event)" placeholder="品牌、型號、規格" />
              </div>
              <div class="mf">
                <label>單位</label>
                <input :value="row.unit" @change="up(cat.id,ri,'unit',$event)" placeholder="式" class="c-center" />
              </div>
              <div class="mf">
                <label>數量</label>
                <input type="number" :value="row.qty" @change="up(cat.id,ri,'qty',$event,true)" min="0" step="1" class="c-right" />
              </div>
              <div class="mf">
                <label>單價（NT$）</label>
                <input type="number" :value="row.price" @change="up(cat.id,ri,'price',$event,true)" min="0" class="c-right" />
              </div>
              <div class="mf">
                <label>總價（NT$）</label>
                <div class="m-total">{{ fmt((+row.qty||0)*(+row.price||0)) }}</div>
              </div>
              <div class="mf full">
                <label>備註</label>
                <input :value="row.note" @change="up(cat.id,ri,'note',$event)" placeholder="備註" />
              </div>
            </div>
          </div>

          <button class="m-add-item" @click="$emit('add-item',cat.id);$emit('change')">＋ 新增項目</button>
          <div class="m-subtotal">
            <span>{{ cat.label }} 小計</span>
            <span class="m-sub-val">NT$ {{ fmt(catSub(cat.id)) }}</span>
          </div>
        </div>
      </div>

      <button class="m-add-cat" @click="$emit('add-category')">＋ 新增大類</button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
const props = defineProps({ categories:Array, items:Object })
const emit  = defineEmits(['add-category','update-category','delete-category','move-category','add-item','update-item','delete-item','change'])

const editingCat  = ref(null)
const mEditingCat = ref(null)
const renameRef   = ref(null)
const mRenameRef  = ref(null)
const collapsed   = reactive({})

const fmt    = n => Math.round(n).toLocaleString('zh-TW')
const catSub = id => (props.items[id]||[]).reduce((s,r)=>s+(+r.qty||0)*(+r.price||0),0)

function up(catId,ri,field,e,isNum=false) {
  emit('update-item',catId,ri,field,isNum?+e.target.value:e.target.value)
  emit('change')
}
function startRename(id){ editingCat.value=id; nextTick(()=>{ const el=Array.isArray(renameRef.value)?renameRef.value[0]:renameRef.value; if(el){el.focus();el.select()} }) }
function startMRename(id){ mEditingCat.value=id; nextTick(()=>{ const el=Array.isArray(mRenameRef.value)?mRenameRef.value[0]:mRenameRef.value; if(el){el.focus();el.select()} }) }
function doRename(id,val){ emit('update-category',id,val); editingCat.value=null; mEditingCat.value=null; emit('change') }
function toggleCat(id){ collapsed[id]=!collapsed[id] }
function autoH(e){ const el=e.target; el.style.height='auto'; el.style.height=el.scrollHeight+'px' }
</script>

<style scoped>
.table-section{padding:0 1.25rem}

/* ── Desktop table ── */
.tbl-outer{border:2px solid var(--navy);overflow-x:auto}
table.qt{width:100%;border-collapse:collapse;table-layout:fixed;min-width:680px}
thead th{background:var(--navy);color:#fff;font-size:13px;font-weight:700;padding:9px 6px;text-align:center;border-right:1px solid rgba(255,255,255,.18);white-space:nowrap}
thead th:last-child{border-right:none}
.cat-row>td{background:var(--navy-mid);border-top:2px solid var(--navy);padding:0}
.cat-inner{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;gap:8px}
.cat-left{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.cat-label{font-size:14px;font-weight:700;color:#fff;letter-spacing:.06em}
.cat-hint{font-size:11px;color:rgba(255,255,255,.38);white-space:nowrap}
.cat-rename{font-size:14px;font-weight:700;color:#fff;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.5);border-radius:4px;padding:2px 8px;outline:none;min-width:120px}
.cat-acts{display:flex;gap:4px;flex-shrink:0}
.ca{padding:3px 9px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:opacity .15s}
.ca:disabled{opacity:.3;cursor:default}
.ca.rename{background:rgba(255,255,255,.2);color:#fff}
.ca.mv{background:rgba(255,255,255,.15);color:#fff;padding:3px 7px}
.ca.add-i{background:rgba(255,255,255,.25);color:#fff}
.ca.del-c{background:rgba(192,57,43,.75);color:#fff}
.ca:not(:disabled):hover{opacity:.78}
.data-row td{border-bottom:1px solid var(--border);border-right:1px solid var(--border);padding:2px 3px;vertical-align:middle}
.data-row td:last-child{border-right:none}
.data-row td input,.data-row td textarea{width:100%;border:none;outline:none;font-size:14px;color:var(--text);background:transparent;padding:4px 5px}
.data-row td input:focus,.data-row td textarea:focus{background:rgba(46,109,164,.07);border-radius:3px}
.spec-ta{resize:none;overflow:hidden;min-height:28px;line-height:1.45;color:var(--muted)!important;display:block}
.c-muted{color:var(--muted)!important}
.c-center{text-align:center!important}
.c-right{text-align:right!important}
input[type=number]{text-align:right}
.idx{display:block;text-align:center;color:#aaa;font-size:12px;padding:4px 0}
.td-c{text-align:center}
.total-val{display:block;text-align:right;padding:4px 7px;font-weight:700;font-size:14px;color:var(--navy)}
.col-act-hdr,.col-act-td{width:44px!important;min-width:44px;max-width:44px;text-align:center}
.del-row{background:none;border:none;cursor:pointer;color:#ccc;font-size:16px;padding:2px 5px;border-radius:4px;line-height:1;display:block;margin:0 auto;transition:color .15s}
.del-row:hover{color:var(--red);background:#fef0f0}
.subtotal-row td{background:var(--navy-pale);border-top:1px solid var(--navy-light);border-bottom:2px solid var(--navy);border-right:1px solid var(--border);padding:7px 8px;font-size:13px;font-weight:700;color:var(--navy);white-space:nowrap}
.subtotal-row td:last-child{border-right:none}
.st-lbl{text-align:right}
.st-val{text-align:right;min-width:90px}
.add-cat-row{padding:10px 0 14px}
.add-cat{background:none;border:1.5px dashed var(--navy-mid);border-radius:6px;padding:7px 22px;font-size:13px;font-weight:700;color:var(--navy-mid);cursor:pointer;transition:background .15s}
.add-cat:hover{background:var(--navy-pale)}

/* ── Mobile cards ── */
.mobile-table{display:flex;flex-direction:column;gap:10px;padding-bottom:4px}
.m-category{border:1.5px solid var(--navy-light);border-radius:12px;overflow:hidden}
.m-cat-hdr{background:var(--navy-mid);padding:11px 12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none}
.m-cat-left{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.m-cat-chevron{font-size:18px;color:#fff;transition:transform .25s;transform:rotate(0deg);display:inline-block;line-height:1}
.m-cat-chevron.open{transform:rotate(90deg)}
.m-cat-title{font-size:15px;font-weight:700;color:#fff;letter-spacing:.05em}
.m-cat-rename{font-size:15px;font-weight:700;color:#fff;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.5);border-radius:6px;padding:3px 10px;outline:none;width:140px}
.m-cat-right{display:flex;align-items:center;gap:5px;flex-shrink:0}
.m-cat-sub{font-size:13px;font-weight:700;color:rgba(255,255,255,.85);margin-right:4px;white-space:nowrap}
.m-ca{padding:4px 8px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:opacity .15s}
.m-ca:disabled{opacity:.3;cursor:default}
.m-ca.rename{background:rgba(255,255,255,.2);color:#fff}
.m-ca.mv{background:rgba(255,255,255,.15);color:#fff}
.m-ca.del{background:rgba(192,57,43,.8);color:#fff}
.m-items{background:#fff;padding:10px 10px 4px}
.m-item-card{background:var(--gray1);border-radius:10px;padding:10px 12px;margin-bottom:8px}
.m-item-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.m-item-no{font-size:12px;font-weight:700;color:var(--muted);background:var(--navy-pale);border-radius:20px;padding:2px 9px}
.m-del-item{background:none;border:1px solid #ddd;border-radius:6px;color:#bbb;font-size:16px;cursor:pointer;padding:1px 8px;line-height:1.4;transition:color .15s}
.m-del-item:hover{color:var(--red);border-color:#fcc;background:#fff5f5}
.m-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mf{display:flex;flex-direction:column;gap:3px}
.mf.full{grid-column:1/-1}
.mf label{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.02em}
.mf input{border:1px solid var(--border);border-radius:7px;padding:8px 10px;font-size:14px;color:var(--text);background:#fff;outline:none;width:100%}
.mf input:focus{border-color:var(--navy-mid);background:var(--navy-pale)}
.m-total{background:#fff;border:1px solid var(--navy-light);border-radius:7px;padding:8px 10px;font-size:14px;font-weight:700;color:var(--navy);text-align:right}
.m-add-item{width:100%;padding:10px;background:none;border:1.5px dashed var(--navy-mid);border-radius:8px;color:var(--navy-mid);font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px;transition:background .15s}
.m-add-item:hover{background:var(--navy-pale)}
.m-subtotal{display:flex;justify-content:space-between;align-items:center;background:var(--navy-pale);border-radius:8px;padding:9px 14px;margin-bottom:8px}
.m-subtotal span{font-size:13px;font-weight:700;color:var(--navy)}
.m-sub-val{font-size:15px}
.m-add-cat{width:100%;padding:12px;background:none;border:2px dashed var(--navy-mid);border-radius:12px;color:var(--navy-mid);font-size:15px;font-weight:700;cursor:pointer;transition:background .15s}
.m-add-cat:hover{background:var(--navy-pale)}

/* show/hide */
.desktop-only{display:block}
.mobile-only{display:none}
@media(max-width:700px){
  .table-section{padding:0 .85rem}
  .desktop-only{display:none!important}
  .mobile-only{display:flex!important;flex-direction:column}
}
</style>
