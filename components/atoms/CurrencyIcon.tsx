// For currency icons
import { Image, StyleSheet } from 'react-native';

export const CurrencyIcon = ({ url, size = 20 }: { url: string; size?: number }) => (
  <Image 
    source={{ uri: url }} 
    style={[styles.icon, { width: size, height: size, borderRadius: size/2 }]} 
  />
);

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
}); 