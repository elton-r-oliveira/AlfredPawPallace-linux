import { StyleSheet } from 'react-native';
import { themes } from '../../global/themes';

export const style = StyleSheet.create({
  group: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: themes.colors.secundary,
    marginBottom: 8,
    fontFamily: 'Baloo2_700Bold',
  },
  container: {
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  containerDisabled: {
    backgroundColor: '#f5f5f5',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: themes.telaPets.petName,
  },
});
