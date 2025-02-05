import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, Image, Keyboard, ActivityIndicator } from 'react-native';
import { getCurrencies } from '@/services/currencyService';
import { Currency } from '@/interfaces/Currency';
import { getQuote } from '@/services/quoteService';
import { RFQuote } from '@/interfaces/RFQuote';
import { getMarkets } from '@/services/marketService';
import { Market } from '@/interfaces/Market';
import { CurrencySelector } from '@/components/molecules/CurrencySelector';
import { CurrencyPicker } from '@/components/organisms/CurrencyPicker';
import { Spinner } from '@/components/atoms/Spinner';

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
      setSelectedDestinationCurrency('');
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
    return <Spinner/>;
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

          <View style={styles.contentBox}>
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
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.currencyCode}>{selectedCurrency}</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>SOURCE CURRENCY</Text>
              <CurrencySelector 
                currency={selectedSourceDetails}
                onPress={handleSourceCurrencyPress}
                placeholder="Select a Source Currency"
              />
            </View>

            {selectedCurrency && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>DESTINATION CURRENCY</Text>
                  <CurrencySelector 
                    currency={selectedDestDetails}
                    onPress={handleDestinationCurrencyPress}
                    placeholder="Select a Destination Currency"
                  />
                </View>

                {selectedDestinationCurrency && Number(amount) > 0 && (
                  <View style={styles.conversionResult}>
                    {quoteLoading ? (
                      <Spinner/>
                    ) : currentQuote ? (
                      <>
                        <Text style={styles.conversionText}>
                          {selectedSourceDetails?.symbol || '$'}
                          {amount} {selectedCurrency} =
                        </Text>
                        <Text style={styles.convertedAmount}>
                          <Text style={styles.boldText}>
                            {currentQuote.to_amount} {selectedDestDetails?.name}
                          </Text>
                        </Text>
                        <Text style={styles.rateText}>
                          <Text style={styles.boldText}>
                            1 {selectedCurrency} = {currentQuote.rate} {selectedDestinationCurrency}
                          </Text>
                        </Text>
                        <Text style={styles.rateText}>
                          <Text style={styles.boldText}>
                            1 {selectedDestinationCurrency} = {(1 / Number(currentQuote.rate)).toFixed(2)} {selectedCurrency}
                          </Text>
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.conversionText}>Unable to fetch quote</Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          <CurrencyPicker
            visible={showCurrencyPicker}
            onClose={handleClosePicker}
            onSelect={handleCurrencySelect}
            currencies={filteredCurrencies}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
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
    fontSize: 40,
    fontWeight: 'bold',
    padding: 24,
    paddingTop: 40,
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
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 4,
    fontWeight: '600',
    color: '#000',
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    padding: 0,
    fontWeight: '600',
    color: '#000',
  },
  currencyCode: {
    fontSize: 18,
    color: '#000',
    marginLeft: 8,
    fontWeight: '600',
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCurrencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCurrencyIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10,
  },
  selectedCurrencyText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  currencyId: {
    fontWeight: '600',
  },
  currencyName: {
    color: '#666',
    marginLeft: 4,
  },
  selectorText: {
    fontSize: 16,
    color: '#666',
  },
  selectorArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }], 
  },
  chevron: {
    fontSize: 20,
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
    fontSize: 30,
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
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginBottom: 8,
  },
  currencyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  currencyIcon: {
    width: 16,
    height: 16,
    marginRight: 12,
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 32,
  },
  tab: {
    paddingVertical: 8,
  },
  tabText: {
    color: '#666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingBottom: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    position: 'absolute',
    width: 16,
    height: 16,
    left: 8,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontSize: 16,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    padding: 8,
    paddingLeft: 32,
    fontSize: 16,
    color: '#000',
  },
  conversionResult: {
    padding: 16,
    alignItems: 'flex-start',
  },
  conversionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
    fontWeight: '600',
  },
  convertedAmount: {
    fontSize: 24,
    marginVertical: 8,
    textAlign: 'left',
  },
  rateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'left',
  },
  boldText: {
    fontWeight: '600',
  },
  contentBox: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 