import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportPDF(filename = '水電工程估價單') {
  const el = document.getElementById('print-area')
  if (!el) { alert('找不到列印區域'); return }

  // ── 1. 記錄原始樣式，等等要還原 ──────────────────────────────
  const saved = {
    width:     el.style.width,
    maxWidth:  el.style.maxWidth,
    boxShadow: el.style.boxShadow,
  }

  // ── 2. 收集所有要隱藏的元素（記錄原始 display）────────────────
  const hideSelectors = [
    '.cat-acts',        // 大類按鈕群 (✏️ ↑ ↓ ＋ ✕)
    '.cat-hint',        // 「點✏️改名」提示
    '.add-cat-row',     // 桌面版「＋新增大類」容器
    '.add-cat',         // 桌面版「＋新增大類」按鈕
    '.m-add-cat',       // 手機版「＋新增大類」按鈕
    '.del-row',         // 每列的 × 按鈕
    '.col-act-hdr',     // 操作欄 <th>（表頭空白格）
    '.col-act-col',     // 操作欄 <col>（colgroup 欄寬定義）
    '.col-act-td',      // 操作欄 <td>（每列的 × 按鈕格）
    '.mobile-total-bar',
    '.mobile-only',
    '.no-print',
  ]
  const snapshots = []

  hideSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(node => {
      const tag = node.tagName.toLowerCase()
      if (tag === 'col') {
        // <col> 要用 visibility:collapse 才能隱藏整欄
        snapshots.push({ node, prop: 'visibility', val: node.style.visibility })
        node.style.visibility = 'collapse'
        node.style.width = '0'
      } else {
        snapshots.push({ node, prop: 'display', val: node.style.display })
        node.style.display = 'none'
      }
    })
  })

  // 強制顯示桌面版表格（只處理 print-area 內部，不動 Toolbar）
  el.querySelectorAll('.desktop-only').forEach(node => {
    snapshots.push({ node, prop: 'display', val: node.style.display })
    node.style.display = 'block'
  })

  // ── 3. 把所有 textarea 內容用 div 替換，讓 html2canvas 能截到換行 ──
  const textareaSwaps = []
  document.querySelectorAll('#print-area textarea').forEach(ta => {
    const div = document.createElement('div')
    div.style.cssText = window.getComputedStyle(ta).cssText
    div.style.whiteSpace = 'pre-wrap'
    div.style.wordBreak = 'break-word'
    div.style.overflow = 'visible'
    div.style.height = 'auto'
    div.style.minHeight = ta.offsetHeight + 'px'
    div.textContent = ta.value
    ta.parentNode.insertBefore(div, ta)
    ta.style.display = 'none'
    textareaSwaps.push({ ta, div })
  })

  // ── 4. 固定寬度，讓 table-layout 完整展開 ────────────────────
  //   用 1200px 讓各欄有足夠空間，不被壓縮截字
  el.style.width     = '1200px'
  el.style.maxWidth  = '1200px'
  el.style.boxShadow = 'none'

  // ── 5. 等瀏覽器 reflow（確保換行、欄寬都已重新計算）
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  await new Promise(r => setTimeout(r, 120))

  try {
    const A4_W_MM   = 210
    const A4_H_MM   = 297
    const MARGIN_MM = 7
    const contentW  = A4_W_MM - MARGIN_MM * 2   // 196mm
    const contentH  = A4_H_MM - MARGIN_MM * 2   // 283mm

    // scale: 2.5 → 更清晰，中文不模糊
    const canvas = await html2canvas(el, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width:       el.offsetWidth,
      windowWidth: el.offsetWidth,
      scrollX: 0,
      scrollY: -window.scrollY,
      // 確保整個元素都截到
      height:       el.scrollHeight,
      windowHeight: el.scrollHeight,
    })

    const imgW = canvas.width   // px（已 ×2.5）
    const imgH = canvas.height

    const pdf      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pxPerMm  = imgW / contentW
    const pageHpx  = contentH * pxPerMm   // 一頁可容納的 canvas px 高度

    let y = 0, page = 0

    while (y < imgH) {
      if (page > 0) pdf.addPage()

      const sliceH = Math.min(pageHpx, imgH - y)

      // 裁切這一頁
      const pg = document.createElement('canvas')
      pg.width  = imgW
      pg.height = Math.ceil(sliceH)
      pg.getContext('2d').drawImage(canvas, 0, y, imgW, sliceH, 0, 0, imgW, sliceH)

      pdf.addImage(
        pg.toDataURL('image/jpeg', 0.97),
        'JPEG',
        MARGIN_MM, MARGIN_MM,
        contentW, sliceH / pxPerMm
      )

      y    += pageHpx
      page += 1
    }

    pdf.save(`${filename}.pdf`)

  } finally {
    // ── 5. 還原所有元素 ────────────────────────────────────────
    // 移除 textarea 替換的 div，還原 textarea 顯示
    textareaSwaps.forEach(({ ta, div }) => {
      div.parentNode.removeChild(div)
      ta.style.display = ''
    })
    snapshots.forEach(({ node, prop, val }) => {
      if (prop === 'visibility') {
        node.style.visibility = val
        node.style.width = ''
      } else {
        node.style.display = val
      }
    })
    el.style.width     = saved.width
    el.style.maxWidth  = saved.maxWidth
    el.style.boxShadow = saved.boxShadow
  }
}
