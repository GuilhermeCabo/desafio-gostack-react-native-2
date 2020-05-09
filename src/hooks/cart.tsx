import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from '../pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('@gomarket:products');

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const indexOfProductOnCart = products.findIndex(
        ({ id }) => product.id === id,
      );

      if (indexOfProductOnCart >= 0) {
        const productsCopy = products;
        productsCopy[indexOfProductOnCart].quantity += 1;

        setProducts([...productsCopy]);

        await AsyncStorage.setItem(
          '@gomarket:products',
          JSON.stringify(products),
        );

        return;
      }

      setProducts(previousProducts => [
        ...previousProducts,
        {
          ...product,
          quantity: 1,
        },
      ]);

      await AsyncStorage.setItem(
        '@gomarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const indexOfProductOnCart = products.findIndex(
        product => product.id === id,
      );

      const productsCopy = products;
      productsCopy[indexOfProductOnCart].quantity += 1;

      setProducts([...productsCopy]);

      await AsyncStorage.setItem(
        '@gomarket:products',
        JSON.stringify(productsCopy),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const indexOfProductOnCart = products.findIndex(
        product => product.id === id,
      );

      const productsCopy = products;

      if (productsCopy[indexOfProductOnCart].quantity === 0) return;

      productsCopy[indexOfProductOnCart].quantity -= 1;

      setProducts([...productsCopy]);

      await AsyncStorage.setItem(
        '@gomarket:products',
        JSON.stringify(productsCopy),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
