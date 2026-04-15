<template>
  <div class="info-wrap">
    <table class="it">
      <tbody>
        <tr>
          <td class="lbl">單　號</td>
          <td class="val" style="width:180px"><input v-model="info.qno" @input="$emit('change')" /></td>
          <td class="lbl">報價日期</td>
          <td class="val" style="width:155px"><input v-model="info.qdate" type="date" @change="$emit('change')" /></td>
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
  </div>
</template>

<script setup>
defineProps({ info: Object })
defineEmits(['change'])
</script>

<style scoped>
.info-wrap { padding:1.1rem 1.5rem 0.9rem }
.it { width:100%;border-collapse:collapse;border:1.5px solid #999 }
.it td { border:1px solid var(--border);padding:0;vertical-align:middle }
.lbl {
  background:var(--gray1);font-size:14px;font-weight:700;
  color:var(--muted);text-align:center;padding:9px 8px;
  white-space:nowrap;width:80px
}
.val { padding:6px 12px;min-width:0 }
.val input, .val textarea {
  width:100%;border:none;outline:none;
  font-size:15px;color:var(--text);background:transparent;resize:none;display:block
}
.val textarea { line-height:1.55;padding-top:2px }
.val input:focus,.val textarea:focus { background:rgba(46,109,164,.06);border-radius:3px }
.lbl.last,.val.last { border-bottom:none }
</style>
