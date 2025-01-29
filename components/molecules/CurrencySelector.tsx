import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CurrencyIcon } from '../atoms/CurrencyIcon';
import { IconButton } from '../atoms/IconButton';

type Currency = {
  id: string;
  name: string;
  icon_url: string;
};

interface CurrencySelectorProps {
  currency?: Currency;
  onPress: () => void;
  placeholder?: string;
}

export const CurrencySelector = ({
  currency,
  onPress,
  placeholder = "Select Currency"
}: CurrencySelectorProps) => (
  <Pressable style={styles.container} onPress={onPress}>
    {currency ? (
      <View style={styles.content}>
        <CurrencyIcon url={currency.icon_url} size={20} />
        <View style={styles.textContainer}>
          <Text style={styles.currencyId}>{currency.id}</Text>
          <Text style={styles.currencyName}>{currency.name}</Text>
        </View>
      </View>
    ) : (
      <Text style={styles.placeholder}>{placeholder}</Text>
    )}
    <IconButton icon="›" onPress={onPress} rotate />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  currencyName: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
}); 