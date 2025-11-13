// Sistema de tienda y monedas

export interface HatItem {
  id: string
  name: string
  price: number
  owned: boolean
}

export interface ShoeItem {
  id: string
  name: string
  price: number
  owned: boolean
}

export interface StoreData {
  coins: number
  hats: HatItem[]
  shoes: ShoeItem[]
  equippedHat: string | null
  equippedShoes: string | null
}

const DEFAULT_STORE_DATA: StoreData = {
  coins: 0,
  hats: [
    { id: 'none', name: 'Sin gorro', price: 0, owned: true },
    { id: 'cap-basic', name: 'Gorra Básica', price: 100, owned: false },
    { id: 'cap-premium', name: 'Gorra Premium', price: 1000, owned: false },
    { id: 'cap-legendary', name: 'Gorra Legendaria', price: 10000, owned: false },
  ],
  shoes: [
    { id: 'none', name: 'Sin zapatos', price: 0, owned: true },
    { id: 'shoes-basic', name: 'Zapatillas Básicas', price: 100, owned: false },
    { id: 'shoes-premium', name: 'Zapatillas Premium', price: 1000, owned: false },
    { id: 'shoes-legendary', name: 'Zapatillas Legendarias', price: 10000, owned: false },
  ],
  equippedHat: 'none',
  equippedShoes: 'none',
}

export function getStoreData(): StoreData {
  if (typeof window === 'undefined') return DEFAULT_STORE_DATA
  
  const stored = localStorage.getItem('utnstore')
  if (!stored) {
    localStorage.setItem('utnstore', JSON.stringify(DEFAULT_STORE_DATA))
    return DEFAULT_STORE_DATA
  }
  
  try {
    const parsed = JSON.parse(stored)
    // Migración: asegurarse de que exista el array de shoes
    if (!parsed.shoes) {
      parsed.shoes = DEFAULT_STORE_DATA.shoes
      parsed.equippedShoes = 'none'
      localStorage.setItem('utnstore', JSON.stringify(parsed))
    }
    return parsed
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

export function buyShoes(shoesId: string): boolean {
  const storeData = getStoreData()
  const shoes = storeData.shoes.find(s => s.id === shoesId)
  
  if (!shoes || shoes.owned || storeData.coins < shoes.price) {
    return false
  }
  
  storeData.coins -= shoes.price
  shoes.owned = true
  saveStoreData(storeData)
  return true
}

export function equipShoes(shoesId: string): boolean {
  const storeData = getStoreData()
  const shoes = storeData.shoes.find(s => s.id === shoesId)
  
  if (!shoes || !shoes.owned) {
    return false
  }
  
  storeData.equippedShoes = shoesId
  saveStoreData(storeData)
  return true
}

export function getEquippedShoes(): string | null {
  const storeData = getStoreData()
  return storeData.equippedShoes
}
