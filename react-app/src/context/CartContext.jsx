import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('pc_cart')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('pc_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item) => {
    const entry = { ...item, cartId: uuidv4() }
    setCartItems((prev) => [...prev, entry])
  }

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId))
  }

  const updateQty = (cartId, newQty) => {
    setCartItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: Math.max(1, Math.min(10, newQty)) } : i))
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('pc_cart')
  }

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cartItems.length

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
