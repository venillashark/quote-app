import { watch } from 'vue'

const KEY = 'wq_autosave_v1'

export function useAutoSave(info, categories, items, taxRate) {
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        info: { ...info },
        categories: categories.value,
        items: JSON.parse(JSON.stringify(items)),
        taxRate: taxRate.value,
        savedAt: new Date().toISOString(),
      }))
    } catch {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return false
      const p = JSON.parse(raw)
      if (p.info) Object.assign(info, p.info)
      if (p.categories) categories.value = p.categories
      if (p.items) Object.keys(p.items).forEach(k => { items[k] = p.items[k] })
      if (p.taxRate !== undefined) taxRate.value = p.taxRate
      return true
    } catch { return false }
  }

  // debounced auto-save
  let timer = null
  function scheduleSave() {
    clearTimeout(timer)
    timer = setTimeout(save, 800)
  }

  return { save, load, scheduleSave }
}
