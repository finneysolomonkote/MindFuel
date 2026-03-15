import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/shopSlice';
import { ShopStackParamList } from '../../types';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

type Props = NativeStackScreenProps<ShopStackParamList, 'Cart'>;

const CartScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.shop);

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  if (loading && cart.items.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 64 }}>🛒</Text>}
        title="Your Cart is Empty"
        message="Add items to your cart to get started"
        actionLabel="Start Shopping"
        onAction={() => navigation.navigate('Shop')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.product.images[0] }} style={styles.image} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))
                  }
                >
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))
                  }
                >
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${cart.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={styles.totalValue}>${cart.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabelBold}>Total</Text>
          <Text style={styles.totalValueBold}>${cart.total.toFixed(2)}</Text>
        </View>
        <Button title="Proceed to Checkout" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  removeText: {
    fontSize: 24,
    color: '#FF6B6B',
    padding: 8,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
  },
  totalLabelBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
});

export default CartScreen;
