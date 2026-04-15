<template>
  <div class="sign-section">
    <div class="sign-block">
      <p class="stitle">業主確認簽章</p>
      <div class="sign-line"></div>
      <div class="sign-footer"><span>簽名：_______________</span><span>日期：_______________</span></div>
    </div>
    <div class="sign-block">
      <p class="stitle">承包商簽章</p>
      <div class="sign-line"></div>
      <div class="sign-footer"><span>簽名：_______________</span><span>日期：_______________</span></div>
    </div>
  </div>
</template>
<style scoped>
.sign-section{margin:0 1.25rem 1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:2rem;border:1px solid var(--border);padding:1.2rem 1.5rem 1rem;background:var(--gray1);border-radius:4px}
.stitle{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:12px}
.sign-line{border-bottom:1px solid #999;height:46px;margin-bottom:10px}
.sign-footer{font-size:13px;color:var(--muted);display:flex;gap:1.5rem;flex-wrap:wrap}
@media(max-width:500px){
  .sign-section{grid-template-columns:1fr;gap:1rem;margin:0 .85rem 1.5rem}
}
</style>
