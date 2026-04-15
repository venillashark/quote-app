<template>
  <div class="info-wrap">
    <!-- Desktop: table layout -->
    <table class="it desktop-only">
      <tbody>
        <tr>
          <td class="lbl">單　號</td>
          <td class="val" style="width:175px"><input v-model="info.qno" @input="$emit('change')" /></td>
          <td class="lbl">報價日期</td>
          <td class="val" style="width:150px"><input v-model="info.qdate" type="date" @change="$emit('change')" /></td>
          <td class="lbl">有效期限</td>
          <td class="val"><input v-model="info.qvalid" @input="$emit('change')" /></td>
        </tr>
        <tr>
          <td class="lbl">施工地址</td>
          <td class="val" colspan="5"><input v-model="info.qaddr" placeholder="台北市○○區○○路○號○樓" @input="$emit('change')" /></td>
        </tr>
        <tr>
          <td class="lbl last">工程說明</td>
          <td class="val last" colspan="5">
            <textarea v-model="info.qdesc" rows="2" placeholder="例：新成屋水電裝潢工程，含全室配管、配線、衛浴設備安裝…" @input="$emit('change')" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile: stacked cards -->
    <div class="mobile-info mobile-only">
      <div class="mi-row">
        <div class="mi-field">
          <label>單號</label>
          <input v-model="info.qno" @input="$emit('change')" />
        </div>
        <div class="mi-field">
          <label>報價日期</label>
          <input v-model="info.qdate" type="date" @change="$emit('change')" />
        </div>
        <div class="mi-field">
          <label>有效期限</label>
          <input v-model="info.qvalid" @input="$emit('change')" />
        </div>
      </div>
      <div class="mi-field full">
        <label>施工地址</label>
        <input v-model="info.qaddr" placeholder="台北市○○區○○路○號○樓" @input="$emit('change')" />
      </div>
      <div class="mi-field full">
        <label>工程說明</label>
        <textarea v-model="info.qdesc" rows="2" placeholder="例：新成屋水電裝潢工程，含全室配管、配線…" @input="$emit('change')" />
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({ info: Object })
defineEmits(['change'])
</script>
<style scoped>
.info-wrap{padding:1rem 1.25rem 0.9rem}
/* Desktop table */
.it{width:100%;border-collapse:collapse;border:1.5px solid #999}
.it td{border:1px solid var(--border);padding:0;vertical-align:middle}
.lbl{background:var(--gray1);font-size:14px;font-weight:700;color:var(--muted);text-align:center;padding:9px 8px;white-space:nowrap;width:80px}
.val{padding:6px 12px;min-width:0}
.val input,.val textarea{width:100%;border:none;outline:none;font-size:15px;color:var(--text);background:transparent;resize:none;display:block}
.val textarea{line-height:1.55;padding-top:2px}
.val input:focus,.val textarea:focus{background:rgba(46,109,164,.06);border-radius:3px}
.lbl.last,.val.last{border-bottom:none}
/* Mobile stacked */
.mobile-info{display:flex;flex-direction:column;gap:10px}
.mi-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.mi-field{display:flex;flex-direction:column;gap:4px}
.mi-field.full{}
.mi-field label{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.03em}
.mi-field input,.mi-field textarea{border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:15px;color:var(--text);outline:none;width:100%;background:#fff}
.mi-field textarea{resize:none;line-height:1.5;min-height:56px}
.mi-field input:focus,.mi-field textarea:focus{border-color:var(--navy-mid);background:var(--navy-pale)}
/* show/hide */
.desktop-only{display:table}
.mobile-only{display:none}
@media(max-width:700px){
  .info-wrap{padding:.9rem 1rem .8rem}
  .desktop-only{display:none!important}
  .mobile-only{display:flex!important}
  .mi-row{grid-template-columns:1fr 1fr}
}
@media(max-width:400px){
  .mi-row{grid-template-columns:1fr}
}
</style>
