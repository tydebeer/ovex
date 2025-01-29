import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getCurrencies } from '@/services/currencyService';

interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await getCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading currencies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Currencies</Text>
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.currencyItem}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 50, // Add safe area for iOS
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  symbol: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  name: {
    fontSize: 16,
  },
}); 