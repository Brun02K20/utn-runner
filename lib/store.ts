// Sistema de tienda y monedas

export interface HatItem {
  id: string
  name: string
  price: number
  owned: boolean
}

export interface StoreData {
  coins: number
  hats: HatItem[]
  equippedHat: string | null
}

const DEFAULT_STORE_DATA: StoreData = {
  coins: 0,
  hats: [
    { id: 'none', name: 'Sin gorro', price: 0, owned: true },
    { id: 'cap-basic', name: 'Gorra Básica', price: 100, owned: false },
    { id: 'cap-premium', name: 'Gorra Premium', price: 1000, owned: false },
    { id: 'cap-legendary', name: 'Gorra Legendaria', price: 10000, owned: false },
  ],
  equippedHat: 'none',
}

export function getStoreData(): StoreData {
  if (typeof window === 'undefined') return DEFAULT_STORE_DATA
  
  const stored = localStorage.getItem('utnstore')
  if (!stored) {
    localStorage.setItem('utnstore', JSON.stringify(DEFAULT_STORE_DATA))
    return DEFAULT_STORE_DATA
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return DEFAULT_STORE_DATA
  }
}

export function saveStoreData(data: StoreData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('utnstore', JSON.stringify(data))
}

export function addCoins(score: number): number {
  const coins = Math.floor(score * 0.1)
  const storeData = getStoreData()
  storeData.coins += coins
  saveStoreData(storeData)
  return coins
}

export function buyHat(hatId: string): boolean {
  const storeData = getStoreData()
  const hat = storeData.hats.find(h => h.id === hatId)
  
  if (!hat || hat.owned || storeData.coins < hat.price) {
    return false
  }
  
  storeData.coins -= hat.price
  hat.owned = true
  saveStoreData(storeData)
  return true
}

export function equipHat(hatId: string): boolean {
  const storeData = getStoreData()
  const hat = storeData.hats.find(h => h.id === hatId)
  
  if (!hat || !hat.owned) {
    return false
  }
  
  storeData.equippedHat = hatId
  saveStoreData(storeData)
  return true
}

export function getEquippedHat(): string | null {
  const storeData = getStoreData()
  return storeData.equippedHat
}
