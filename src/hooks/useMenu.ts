
import { useState, useEffect } from 'react';
import { ALL_MENU_ITEMS, MenuItem } from '../data/menu';

export interface Category {
  id: string;
  name: string;
  order_index: number;
}

const STATIC_CATEGORIES = [
  { id: 'promocoes', name: 'Promoções', order_index: 1 },
  { id: 'menu-do-dia', name: 'Menu do Dia', order_index: 2 },
  { id: 'pizzas', name: 'Pizzas', order_index: 3 },
  { id: 'esfihas-salgadas-tradicionais', name: 'Esfihas Salgadas Tradicionais', order_index: 4 },
  { id: 'esfihas-salgadas-especiais', name: 'Esfihas Salgadas Especiais', order_index: 5 },
  { id: 'esfihas-doces', name: 'Esfihas Doces', order_index: 6 },
  { id: 'bebidas', name: 'Bebidas', order_index: 7 },
  { id: 'bordas', name: 'Bordas', order_index: 8 }
];

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(ALL_MENU_ITEMS);
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    // Just use static data for frontend-only
    setMenuItems(ALL_MENU_ITEMS);
    setCategories(STATIC_CATEGORIES);
    setLoading(false);
    setUsingFallback(true);
  }, []);

  return { menuItems, categories, loading, usingFallback };
}
