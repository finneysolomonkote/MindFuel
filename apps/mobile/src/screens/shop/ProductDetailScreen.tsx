import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../store';
import { addToCart } from '../../store/slices/shopSlice';
import { ShopStackParamList, Product } from '../../types';
import { shopApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<ShopStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await shopApi.getProduct(productId);
      setProduct(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      Alert.alert('Success', 'Product added to cart', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) {
    return <LoadingSpinner fullScreen />;
  }

  const isOutOfStock = product.stock === 0;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.images[0] }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>

        {isOutOfStock ? (
          <View style={styles.outOfStockBanner}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : (
          <Text style={styles.stock}>{product.stock} in stock</Text>
        )}

        <Text style={styles.description}>{product.description}</Text>

        {!isOutOfStock && (
          <>
            <View style={styles.quantitySection}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              loading={addingToCart}
              style={styles.addButton}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 8,
  },
  stock: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 16,
  },
  outOfStockBanner: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  quantitySection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#333',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 24,
  },
  addButton: {
    marginBottom: 32,
  },
});

export default ProductDetailScreen;
