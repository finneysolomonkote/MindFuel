import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../../store';
import { ordersApi } from '../../services/api';
import { ShopStackParamList } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<ShopStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { cart } = useAppSelector((state) => state.shop);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
  });

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const order = await ordersApi.createOrder(formData, 'razorpay');
      navigation.navigate('OrderSuccess', { orderId: order.id });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Shipping Address</Text>

      <Input
        label="Full Name"
        value={formData.fullName}
        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        placeholder="Enter your full name"
      />

      <Input
        label="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      <Input
        label="Address Line 1"
        value={formData.addressLine1}
        onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
        placeholder="Street address"
      />

      <Input
        label="Address Line 2 (Optional)"
        value={formData.addressLine2}
        onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
        placeholder="Apartment, suite, etc."
      />

      <View style={styles.row}>
        <Input
          label="City"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          placeholder="City"
          style={{ flex: 1, marginRight: 8 }}
        />
        <Input
          label="State"
          value={formData.state}
          onChangeText={(text) => setFormData({ ...formData, state: text })}
          placeholder="State"
          style={{ flex: 1 }}
        />
      </View>

      <Input
        label="Postal Code"
        value={formData.postalCode}
        onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
        placeholder="Postal code"
        keyboardType="numeric"
      />

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>${cart.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Tax</Text>
          <Text>${cart.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>${cart.total.toFixed(2)}</Text>
        </View>
      </View>

      <Button title="Place Order" onPress={handleCheckout} loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  summary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginVertical: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
});

export default CheckoutScreen;
