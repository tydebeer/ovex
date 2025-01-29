import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Modal, FlatList, SafeAreaView, Image, Keyboard } from 'react-native';
import { getCurrencies } from '@/services/currencyService';
import { Currency } from '@/interfaces/Currency';
import { BlurView } from 'expo-blur';
import { getQuote } from '@/services/quoteService';
import { RFQuote } from '@/interfaces/RFQuote';
import { getMarkets } from '@/services/marketService';
import { Market } from '@/interfaces/Market';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedDestinationCurrency, setSelectedDestinationCurrency] = useState('');
  const [cryptoCurrencies, setCryptoCurrencies] = useState<Currency[]>([]);
  const [fiatCurrencies, setFiatCurrencies] = useState<Currency[]>([]);
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<RFQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [cryptoData, fiatData, marketsData] = await Promise.all([
        getCurrencies(),
        getCurrencies('fiat'),
        getMarkets()
      ]);
      
      setCryptoCurrencies(cryptoData);
      setFiatCurrencies(fiatData);
      setMarkets(marketsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDestinationCurrencies = (sourceCurrency: string) => {
    if (!sourceCurrency) return [];
    
    const sourceId = sourceCurrency.toLowerCase();
    const availableMarkets = markets.filter(market => 
      market.base_currency === sourceId || market.quote_currency === sourceId
    );

    const destinationIds = new Set(availableMarkets.map(market => {
      return market.base_currency === sourceId ? market.quote_currency : market.base_currency;
    }));

    return [...destinationIds];
  };

  const filteredCurrencies = useMemo(() => { 
    const currencies = activeTab === 'crypto' ? cryptoCurrencies : fiatCurrencies;
    let filtered = currencies;

    if (showCurrencyPicker && isSelectingDestination && selectedCurrency) {
      const availableDestinations = getAvailableDestinationCurrencies(selectedCurrency);
      filtered = filtered.filter(currency => 
        availableDestinations.includes(currency.id.toLowerCase())
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(currency => 
        currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [
    activeTab, 
    searchQuery, 
    cryptoCurrencies, 
    fiatCurrencies, 
    selectedCurrency, 
    isSelectingDestination, 
    showCurrencyPicker, 
    markets
  ]);

  const handleAmountChange = (text: string) => {
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(text) || text === '') {
      setAmount(text);
    }
  };

  const handleCurrencySelect = (currency: string) => {
    if (isSelectingDestination) {
      setSelectedDestinationCurrency(currency);
    } else {
      setSelectedCurrency(currency);
      setSelectedDestinationCurrency('');  // Reset destination when source changes
    }
    setShowCurrencyPicker(false);
    setSearchQuery('');
    setIsSelectingDestination(false);
  };

  const handleSourceCurrencyPress = () => {
    setIsSelectingDestination(false);
    setShowCurrencyPicker(true);
  };

  const handleDestinationCurrencyPress = () => {
    setIsSelectingDestination(true);
    setShowCurrencyPicker(true);
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <Pressable
      style={styles.currencyItem}
      onPress={() => handleCurrencySelect(item.id.toUpperCase())}
    >
      <View style={styles.currencyItemContent}>
        <Image 
          source={{ uri: item.icon_url }} 
          style={styles.currencyIcon} 
        />
        <Text style={styles.currencyText}>
          {item.id.toUpperCase()} {item.name}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );

  const handleClosePicker = () => {
    setShowCurrencyPicker(false);
    setSearchQuery('');
  };

  const getSelectedCurrencyDetails = (currencyId: string) => {
    return cryptoCurrencies.find(c => c.id.toUpperCase() === currencyId) ||
           fiatCurrencies.find(c => c.id.toUpperCase() === currencyId);
  };

  const selectedSourceDetails = getSelectedCurrencyDetails(selectedCurrency);
  const selectedDestDetails = getSelectedCurrencyDetails(selectedDestinationCurrency);

  const fetchQuote = async () => {
    if (!selectedCurrency || !selectedDestinationCurrency || !amount || Number(amount) <= 0) {
      setCurrentQuote(null);
      return;
    }

    setQuoteLoading(true);
    try {
      const isSourceFiat = fiatCurrencies.some(c => c.id.toUpperCase() === selectedCurrency);
      const isDestinationFiat = fiatCurrencies.some(c => c.id.toUpperCase() === selectedDestinationCurrency);
      
      const side = isSourceFiat && !isDestinationFiat ? 'buy' : 'sell';
      
      // Find the correct market pair
      const sourceId = selectedCurrency.toLowerCase();
      const destId = selectedDestinationCurrency.toLowerCase();
      
      const market = markets.find(m => 
        (m.base_currency === sourceId && m.quote_currency === destId) ||
        (m.base_currency === destId && m.quote_currency === sourceId)
      );

      if (!market) {
        throw new Error('Market pair not found');
      }

      const quote = await getQuote({
        market: market.id,
        from_amount: Number(amount),
        side,
      });
      setCurrentQuote(quote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setCurrentQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, selectedCurrency, selectedDestinationCurrency]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading currencies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e222c' }}>
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Convert Currency</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>SOURCE AMOUNT</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>
                {selectedSourceDetails?.symbol || '$'}
              </Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#666"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text style={styles.currencyCode}>{selectedCurrency}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>SOURCE CURRENCY</Text>
            <Pressable 
              style={styles.currencySelector}
              onPress={handleSourceCurrencyPress}
            >
              {selectedCurrency ? (
                <View style={styles.selectedCurrencyContainer}>
                  <Image 
                    source={{ uri: selectedSourceDetails?.icon_url }} 
                    style={styles.selectedCurrencyIcon} 
                  />
                  <Text style={styles.selectedCurrencyText}>
                    {selectedCurrency} {selectedSourceDetails?.name}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectorText}>Select a Source Currency</Text>
              )}
              <Text style={styles.selectorArrow}>▼</Text>
            </Pressable>
          </View>

          {selectedCurrency && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>DESTINATION CURRENCY</Text>
                <Pressable 
                  style={styles.currencySelector}
                  onPress={handleDestinationCurrencyPress}
                >
                  {selectedDestinationCurrency ? (
                    <View style={styles.selectedCurrencyContainer}>
                      <Image 
                        source={{ uri: selectedDestDetails?.icon_url }} 
                        style={styles.selectedCurrencyIcon} 
                      />
                      <Text style={styles.selectedCurrencyText}>
                        {selectedDestinationCurrency} {selectedDestDetails?.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectorText}>Select a Destination Currency</Text>
                  )}
                  <Text style={styles.selectorArrow}>▼</Text>
                </Pressable>
              </View>

              {selectedDestinationCurrency && Number(amount) > 0 && (
                <View style={styles.conversionResult}>
                  {quoteLoading ? (
                    <Text style={styles.conversionText}>Loading quote...</Text>
                  ) : currentQuote ? (
                    <>
                      <Text style={styles.conversionText}>
                        {selectedSourceDetails?.symbol || '$'}
                        {amount} {selectedCurrency} =
                      </Text>
                      <Text style={styles.convertedAmount}>
                        {currentQuote.to_amount} {selectedDestinationCurrency} {selectedDestDetails?.name}
                      </Text>
                      <Text style={styles.rateText}>
                        1 {selectedCurrency} = {currentQuote.rate} {selectedDestinationCurrency}
                      </Text>
                      <Text style={styles.rateText}>
                        1 {selectedDestinationCurrency} = {(1 / Number(currentQuote.rate)).toFixed(2)} {selectedCurrency}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.conversionText}>Unable to fetch quote</Text>
                  )}
                </View>
              )}
            </>
          )}

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
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    height: 60,
    backgroundColor: '#1e222c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: 40,
    width: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    padding: 24,
    textAlign: 'center',
    width: '100%',
    color: '#000',
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  currencyText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
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
  selectedCurrencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCurrencyIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 12,
  },
  selectedCurrencyText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  conversionResult: {
    padding: 16,
    alignItems: 'flex-start',
  },
  conversionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
  },
  convertedAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'left',
  },
  rateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'left',
  },
}); 