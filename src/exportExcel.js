import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY  = 'FF1A3557'
const MID   = 'FF2E6DA4'
const PALE  = 'FFEAF2FB'
const GRAY  = 'FFF2F5F8'
const GRAY2 = 'FFE8EDF2'
const GOLD  = 'FFC8A96E'
const WHITE = 'FFFFFFFF'
const SUB   = 'FFEAF2FB'

const solid = rgb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: rgb } })
const fnt   = (sz=11, bold=false, color='FF000000', name='Arial') => ({ name, size: sz, bold, color: { argb: color } })
const aln   = (h='left', v='middle', wrap=false) => ({ horizontal: h, vertical: v, wrapText: wrap })
const thinB = (color='FFCCCCCC') => {
  const s = { style: 'thin', color: { argb: color } }
  return { top: s, bottom: s, left: s, right: s }
}
const medB = (color='FF555555') => {
  const s = { style: 'medium', color: { argb: color } }
  return { top: s, bottom: s, left: s, right: s }
}

function setCell(ws, row, col, value, styles = {}) {
  const cell = ws.getCell(row, col)
  cell.value = value
  if (styles.font)      cell.font      = styles.font
  if (styles.fill)      cell.fill      = styles.fill
  if (styles.alignment) cell.alignment = styles.alignment
  if (styles.border)    cell.border    = styles.border
  if (styles.numFmt)    cell.numFmt    = styles.numFmt
  return cell
}

function fillRow(ws, row, colCount, fill, border) {
  for (let c = 1; c <= colCount; c++) {
    const cell = ws.getCell(row, c)
    cell.fill = fill
    if (border) cell.border = border
  }
}

function mergeAndSet(ws, r1, c1, r2, c2, value, styles = {}) {
  ws.mergeCells(r1, c1, r2, c2)
  setCell(ws, r1, c1, value, styles)
}

function applyOuterMediumBorder(ws, r1, c1, r2, c2, color = 'FF555555') {
  const med = { style: 'medium', color: { argb: color } }
  const thin = { style: 'thin', color: { argb: 'FFCCCCCC' } }
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = ws.getCell(r, c)
      cell.border = {
        left:   c === c1 ? med : thin,
        right:  c === c2 ? med : thin,
        top:    r === r1 ? med : thin,
        bottom: r === r2 ? med : thin,
      }
    }
  }
}

export async function exportExcel({ info, categories, items, taxRate }) {
  const wb = new ExcelJS.Workbook()
  wb.creator = '水電工程估價單'
  const ws = wb.addWorksheet('估價單', { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0, footer: 0 } } })

  ws.views = [{ showGridLines: false }]

  // Column widths (A=1..H=8)
  const colWidths = [4, 20, 20, 6, 7, 12, 12, 18]
  colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  const C = 8
  let R = 1

  // ── top navy bar ──────────────────────────────────────────────────
  ws.getRow(R).height = 6
  fillRow(ws, R, C, solid(NAVY))
  ws.mergeCells(R, 1, R, C)
  R++

  // ── title ─────────────────────────────────────────────────────────
  ws.getRow(R).height = 42
  mergeAndSet(ws, R, 1, R, C, '水電工程估價單', {
    font:      fnt(20, true, 'FFFFFFFF'),
    fill:      solid(NAVY),
    alignment: aln('center', 'middle'),
  })
  R++

  // ── gold bar ──────────────────────────────────────────────────────
  ws.getRow(R).height = 4
  fillRow(ws, R, C, solid(GOLD))
  ws.mergeCells(R, 1, R, C)
  R++

  // ── info block ────────────────────────────────────────────────────
  const lblStyle = { font: fnt(11, true, 'FF555555'), fill: solid(GRAY),  alignment: aln('center','middle'), border: thinB() }
  const valStyle = { font: fnt(11, false,'FF1a1a1a'), fill: solid(WHITE), alignment: aln('left','middle', true),   border: thinB() }

  const infoRows = [
    [ ['單　號',1], [info.qno||'',1], ['報價日期',1], [info.qdate||'',1], ['有效期限',1], [info.qvalid||'30天',2] ],
    [ ['施工地址',1], [info.qaddr||'',5] ],
    [ ['工程說明',1], [info.qdesc||'',5] ],
  ]
  const infoHeights = [20, 20, 30]
  infoRows.forEach((row, idx) => {
    ws.getRow(R).height = infoHeights[idx]
    let col = 1; let isLbl = true
    row.forEach(([val, span]) => {
      if (span > 1) ws.mergeCells(R, col, R, col + span - 1)
      setCell(ws, R, col, val, isLbl ? lblStyle : valStyle)
      col += span; isLbl = false
    })
    R++
  })
  R++ // gap

  // ── table header ──────────────────────────────────────────────────
  ws.getRow(R).height = 22
  const hdrs = ['#', '項目說明', '規格 / 品牌', '單位', '數量', '單價（NT$）', '總價（NT$）', '備　　註']
  hdrs.forEach((h, i) => setCell(ws, R, i + 1, h, {
    font: fnt(11, true, 'FFFFFFFF'), fill: solid(NAVY),
    alignment: aln('center','middle'), border: thinB(NAVY),
  }))
  R++

  // ── categories & items ────────────────────────────────────────────
  const subtotalAddresses = []

  for (const cat of categories) {
    const catItems = items[cat.id] || []

    // category header
    ws.getRow(R).height = 20
    ws.mergeCells(R, 1, R, C)
    setCell(ws, R, 1, cat.label, {
      font: fnt(12, true, 'FFFFFFFF'), fill: solid(MID),
      alignment: aln('left', 'middle'), border: thinB(MID),
    })
    const catStart = R
    R++

    const firstData = R

    for (let ri = 0; ri < catItems.length; ri++) {
      const row = catItems[ri]
      ws.getRow(R).height = 20
      const bg = ri % 2 === 0 ? WHITE : GRAY
      const bf = { font: fnt(11), fill: solid(bg), alignment: aln('left','middle', true), border: thinB() }
      const br = { ...bf, alignment: aln('right','middle'), numFmt: '#,##0' }
      const bc = { ...bf, alignment: aln('center','middle') }

      setCell(ws, R, 1, ri + 1,               { ...bc, font: fnt(11, false, 'FF999999') })
      setCell(ws, R, 2, row.desc  || '',       bf)
      setCell(ws, R, 3, row.spec  || '',       { ...bf, font: fnt(11, false, 'FF555555') })
      setCell(ws, R, 4, row.unit  || '式',     bc)
      setCell(ws, R, 5, +row.qty  || 0,        br)
      setCell(ws, R, 6, +row.price|| 0,        br)
      // total formula
      const tc = ws.getCell(R, 7)
      tc.value = { formula: `E${R}*F${R}`, result: (+row.qty||0)*(+row.price||0) }
      tc.font = fnt(11, true, 'FF1A3557'); tc.fill = solid(bg)
      tc.alignment = aln('right','middle'); tc.border = thinB(); tc.numFmt = '#,##0'
      setCell(ws, R, 8, row.note  || '',       { ...bf, font: fnt(10, false, 'FF666666') })
      R++
    }

    const lastData = R - 1

    // subtotal row
    ws.getRow(R).height = 20
    ws.mergeCells(R, 1, R, 5)
    setCell(ws, R, 1, '', { fill: solid(SUB), border: thinB('FFAAAAAA') })
    setCell(ws, R, 6, `${cat.label} 小計`, { font: fnt(11, true, 'FF1A3557'), fill: solid(SUB), alignment: aln('right','middle'), border: thinB('FFAAAAAA') })
    const stc = ws.getCell(R, 7)
    stc.value = { formula: `SUM(G${firstData}:G${lastData})`, result: catItems.reduce((s,r)=>s+(+r.qty||0)*(+r.price||0),0) }
    stc.font = fnt(11, true, 'FF1A3557'); stc.fill = solid(SUB)
    stc.alignment = aln('right','middle'); stc.border = thinB('FFAAAAAA'); stc.numFmt = '#,##0'
    setCell(ws, R, 8, '', { fill: solid(SUB), border: thinB('FFAAAAAA') })
    subtotalAddresses.push(`G${R}`)

    applyOuterMediumBorder(ws, catStart, 1, R, C)
    R++
    R++ // gap
  }

  // ── totals ────────────────────────────────────────────────────────
  R++
  const SUBTOTAL_R = R
  ws.getRow(R).height = 22

  const sLbl = { font: fnt(12, true, 'FF1A3557'), fill: solid(PALE), alignment: aln('right','middle'), border: thinB() }
  const sVal = { font: fnt(12, true, 'FF1A3557'), fill: solid(WHITE), alignment: aln('right','middle'), border: thinB(), numFmt: '#,##0' }

  ws.mergeCells(R, 1, R, 5)
  setCell(ws, R, 1, '', { fill: solid(PALE), border: thinB() })
  setCell(ws, R, 6, '工程小計', sLbl)
  const subCell = ws.getCell(R, 7)
  const subTotal = Array.from(categories).reduce((s,c)=>(items[c.id]||[]).reduce((a,r)=>a+(+r.qty||0)*(+r.price||0),s),0)
  subCell.value = { formula: subtotalAddresses.join('+'), result: subTotal }
  Object.assign(subCell, { font: sVal.font, fill: sVal.fill, alignment: sVal.alignment, border: sVal.border, numFmt: sVal.numFmt })
  setCell(ws, R, 8, '', { fill: solid(PALE), border: thinB() })
  R++

  const TAX_R = R
  ws.getRow(R).height = 22
  ws.mergeCells(R, 1, R, 5)
  setCell(ws, R, 1, '', { fill: solid(PALE), border: thinB() })
  setCell(ws, R, 6, taxRate > 0 ? `稅額 ${taxRate}%` : '稅額 0%', { ...sLbl, font: fnt(11, true, 'FF555555') })
  const taxAmt = Math.round(subTotal * taxRate / 100)
  const taxCell = ws.getCell(R, 7)
  taxCell.value = taxRate > 0 ? { formula: `ROUND(G${SUBTOTAL_R}*${taxRate}/100,0)`, result: taxAmt } : 0
  Object.assign(taxCell, { font: fnt(11, false, 'FF555555'), fill: solid(WHITE), alignment: aln('right','middle'), border: thinB(), numFmt: '#,##0' })
  setCell(ws, R, 8, '', { fill: solid(PALE), border: thinB() })
  R++

  const GRAND_R = R
  ws.getRow(R).height = 30
  ws.mergeCells(R, 1, R, 5)
  setCell(ws, R, 1, '', { fill: solid(NAVY), border: thinB(NAVY) })
  setCell(ws, R, 6, '總　金　額', { font: fnt(14, true, 'FFFFFFFF'), fill: solid(NAVY), alignment: aln('right','middle'), border: thinB(NAVY) })
  const grandCell = ws.getCell(R, 7)
  grandCell.value = { formula: `G${SUBTOTAL_R}+G${TAX_R}`, result: subTotal + taxAmt }
  Object.assign(grandCell, { font: fnt(14, true, 'FFFFFFFF'), fill: solid(NAVY), alignment: aln('right','middle'), border: thinB(NAVY), numFmt: '#,##0' })
  setCell(ws, R, 8, 'NT$', { font: fnt(12, true, 'FFFFFFFF'), fill: solid(NAVY), alignment: aln('center','middle'), border: thinB(NAVY) })
  applyOuterMediumBorder(ws, SUBTOTAL_R, 6, GRAND_R, C)
  R += 2

  // ── notes ─────────────────────────────────────────────────────────
  const notes = info.notes || ''
  if (notes) {
    ws.getRow(R).height = 16
    ws.mergeCells(R, 1, R, C)
    setCell(ws, R, 1, '備　　註', { font: fnt(11, true, 'FF1A3557'), fill: solid(GRAY2), alignment: aln('left','middle'), border: thinB() })
    R++
    ws.getRow(R).height = 24
    ws.mergeCells(R, 1, R, C)
    setCell(ws, R, 1, notes, { font: fnt(11, false, 'FF444444'), fill: solid(WHITE), alignment: aln('left','middle', true), border: thinB() })
    R += 2
  }

  // ── signature ─────────────────────────────────────────────────────
  ws.getRow(R).height = 20
  ws.mergeCells(R, 1, R, 4)
  setCell(ws, R, 1, '業主簽名：_______________　　日期：_______________', { font: fnt(11, false, 'FF444444'), fill: solid(GRAY), alignment: aln('left','middle'), border: thinB() })
  ws.mergeCells(R, 5, R, C)
  setCell(ws, R, 5, '承包商簽名：_______________　日期：_______________', { font: fnt(11, false, 'FF444444'), fill: solid(GRAY), alignment: aln('left','middle'), border: thinB() })

  // ── export ────────────────────────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `水電工程估價單_${info.qno || 'quote'}.xlsx`)
}
