import { Modal, View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconButton } from '../atoms/IconButton';
import { SearchBar } from '../molecules/SearchBar';
import { CurrencyIcon } from '../atoms/CurrencyIcon';

type Currency = {
  id: string;
  name: string;
  icon_url: string;
};

interface CurrencyPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currencyId: string) => void;
  currencies: Currency[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: 'crypto' | 'fiat';
  onTabChange: (tab: 'crypto' | 'fiat') => void;
}

export const CurrencyPicker = ({
  visible,
  onClose,
  onSelect,
  currencies,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}: CurrencyPickerProps) => {
  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <Pressable
      style={styles.currencyItem}
      onPress={() => onSelect(item.id.toUpperCase())}
    >
      <View style={styles.currencyItemContent}>
        <CurrencyIcon url={item.icon_url} size={16} />
        <Text style={styles.currencyText}>
          {item.id.toUpperCase()} {item.name}
        </Text>
        <IconButton icon="›" onPress={() => onSelect(item.id.toUpperCase())} />
      </View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={10} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <IconButton icon="✕" onPress={onClose} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.modalTitle}>Select Currency</Text>
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, { alignSelf: 'flex-end' }]}
              onPress={() => onTabChange('crypto')}
            >
              <Text style={[styles.tabText, activeTab === 'crypto' && styles.activeTabText]}>
                Crypto
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, { alignSelf: 'flex-start' }]}
              onPress={() => onTabChange('fiat')}
            >
              <Text style={[styles.tabText, activeTab === 'fiat' && styles.activeTabText]}>
                Fiat
              </Text>
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={`Search ${activeTab === 'crypto' ? 'Crypto' : 'Currencies'}`}
            />
          </View>

          <FlatList
            data={currencies}
            renderItem={renderCurrencyItem}
            keyExtractor={(item) => item.id}
            style={styles.currencyList}
          />
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});