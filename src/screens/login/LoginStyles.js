import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    width: width * 0.7,
    height: width * 0.40,
    marginVertical: -42,
    marginLeft: 15,
  },
  logo: {
    width: width * 0.75,
    height: width * 0.35,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  animatedView: {
    marginBottom: 20,
    width: width * 0.8,
  },
  loginButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f78219',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f78219',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#DB4437',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  loginButtonText: {
    color: '#fdfceb',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
  googleButtonText: {
    color: '#f78219',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
});
