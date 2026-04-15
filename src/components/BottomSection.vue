<template>
  <div class="bottom-wrap">
    <div class="notes-box">
      <label>整體備註</label>
      <textarea :value="notes" @input="$emit('update-notes',$event.target.value)"
        placeholder="例：材料費含稅，工資另計；完工後保固一年&#10;付款方式：簽約付 5 成，完工付尾款" />
    </div>
    <div class="sum-box">
      <div class="sum-row">
        <div class="sum-lbl">工程小計</div>
        <div class="sum-val">NT$&nbsp;{{ fmt(subtotal) }}</div>
      </div>
      <div class="sum-row">
        <div class="sum-lbl">
          <span class="lt">稅　　率</span>
          <select class="tax-sel" :value="taxRate" @change="$emit('update-tax',+$event.target.value)">
            <option value="0">未稅 0%</option>
            <option value="5">含稅 5%</option>
          </select>
        </div>
        <div class="sum-val" :class="{muted:taxRate===0}">{{ taxRate>0?'NT$\u00a0'+fmt(taxAmt):'—' }}</div>
      </div>
      <div class="sum-row grand">
        <div class="sum-lbl">總　金　額</div>
        <div class="sum-val">NT$&nbsp;{{ fmt(grand) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const p = defineProps({ categories:Array, items:Object, notes:String, taxRate:Number })
defineEmits(['update-notes','update-tax'])
const fmt      = n => Math.round(n).toLocaleString('zh-TW')
const subtotal = computed(()=>p.categories.reduce((s,c)=>s+(p.items[c.id]||[]).reduce((a,r)=>a+(+r.qty||0)*(+r.price||0),0),0))
const taxAmt   = computed(()=>Math.round(subtotal.value*p.taxRate/100))
const grand    = computed(()=>subtotal.value+taxAmt.value)
</script>

<style scoped>
.bottom-wrap { padding:1rem 1.5rem 1.5rem;display:grid;grid-template-columns:1fr 290px;gap:1.5rem;align-items:start }
.notes-box label { display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px;letter-spacing:.04em }
.notes-box textarea { width:100%;border:1px solid var(--border);border-radius:4px;padding:10px;font-size:14px;color:var(--text);resize:vertical;min-height:90px;outline:none }
.notes-box textarea:focus { border-color:var(--navy-mid) }
.sum-box { border:2px solid var(--navy);overflow:hidden }
.sum-row { display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border) }
.sum-row:last-child { border-bottom:none }
.sum-lbl { background:var(--navy-pale);padding:10px 14px;font-size:13px;font-weight:700;color:var(--navy);display:flex;flex-direction:column;justify-content:center;gap:6px;border-right:1px solid var(--border);white-space:nowrap }
.lt { font-size:13px;font-weight:700;color:var(--navy) }
.sum-val { background:#fff;padding:10px 14px;font-size:14px;font-weight:700;color:var(--navy);text-align:right;display:flex;align-items:center;justify-content:flex-end }
.sum-val.muted { color:#bbb;font-weight:400 }
.tax-sel { border:1.5px solid var(--gold);border-radius:4px;padding:4px 8px;font-size:13px;font-weight:700;color:#7A5500;background:var(--gold-light);cursor:pointer;outline:none }
.sum-row.grand .sum-lbl { background:var(--navy);color:#fff;font-size:14px;letter-spacing:.08em;border-right:1px solid rgba(255,255,255,.2);flex-direction:row;align-items:center }
.sum-row.grand .sum-val { background:var(--navy);color:#fff;font-size:16px }
</style>
