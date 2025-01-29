import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Modal, FlatList, SafeAreaView, Image } from 'react-native';
import { getCurrencies } from '@/services/currencyService';
import { Currency } from '@/interfaces/Currency';
import { BlurView } from 'expo-blur';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('0');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [cryptoCurrencies, setCryptoCurrencies] = useState<Currency[]>([]);
  const [fiatCurrencies, setFiatCurrencies] = useState<Currency[]>([]);
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>('crypto');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllCurrencies();
  }, []);

  const loadAllCurrencies = async () => {
    try {
      const [cryptoData, fiatData] = await Promise.all([
        getCurrencies('coin'),
        getCurrencies('fiat')
      ]);
      setCryptoCurrencies(cryptoData);
      setFiatCurrencies(fiatData);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCurrencies = useMemo(() => {
    const currencies = activeTab === 'crypto' ? cryptoCurrencies : fiatCurrencies;
    if (!searchQuery) return currencies;
    
    return currencies.filter(currency => 
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery, cryptoCurrencies, fiatCurrencies]);

  const handleAmountChange = (text: string) => {
    // Only allow numbers and up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(text) || text === '') {
      setAmount(text);
    }
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <Pressable
      style={styles.currencyItem}
      onPress={() => {
        setSelectedCurrency(item.symbol);
        setShowCurrencyPicker(false);
        setSearchQuery('');
      }}
    >
      <View style={styles.currencyItemContent}>
        <Image 
          source={{ uri: item.icon_url }} 
          style={styles.currencyIcon} 
          //defaultSource={require('@/assets/favicon.png')}
        />
        <View style={styles.currencyInfo}>
          <Text style={styles.currencySymbolText}>{item.id.toUpperCase()}</Text>
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );

  // Clear search when modal closes
  const handleClosePicker = () => {
    setShowCurrencyPicker(false);
    setSearchQuery('');
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
      {/* Placeholder for OVEX logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>OVEX</Text>
      </View>

      <Text style={styles.title}>Convert Currency</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>SOURCE AMOUNT</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <Text style={styles.currencyCode}>{selectedCurrency}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>SOURCE CURRENCY</Text>
        <Pressable 
          style={styles.currencySelector}
          onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
        >
          <Text style={styles.selectorText}>
            {showCurrencyPicker ? 'Select a Source Currency' : 'Select a Source Currency'}
          </Text>
          <Text style={styles.selectorArrow}>▼</Text>
        </Pressable>
      </View>

      <Modal
        visible={showCurrencyPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePicker}
      >
        <BlurView intensity={10} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={handleClosePicker}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>Select Currency</Text>
            </View>

            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === 'crypto' && styles.activeTab]}
                onPress={() => setActiveTab('crypto')}
              >
                <Text style={[styles.tabText, activeTab === 'crypto' && styles.activeTabText]}>Crypto</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'fiat' && styles.activeTab]}
                onPress={() => setActiveTab('fiat')}
              >
                <Text style={[styles.tabText, activeTab === 'fiat' && styles.activeTabText]}>Fiat</Text>
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${activeTab === 'crypto' ? 'Crypto' : 'Currencies'}`}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <FlatList
              data={filteredCurrencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.id}
              style={styles.currencyList}
            />
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    height: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  inputContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    padding: 0,
  },
  currencyCode: {
    fontSize: 18,
    color: '#666',
    marginLeft: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  selectorText: {
    fontSize: 16,
    color: '#666',
  },
  selectorArrow: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 8,
  },
  currencyList: {
    padding: 16,
  },
  currencyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currencyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  currencyIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencySymbolText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    fontSize: 20,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: '#000',
  },
}); 