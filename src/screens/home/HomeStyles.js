import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerImage: {
    width: width * 0.95,
    height: height * 0.25,
  },
  titleContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 24,
    color: '#fffde1',
    fontWeight: '700',
  },
  menu: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  card: {
    width: width * 0.42,
    height: width * 0.42,
    backgroundColor: '#f78219',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    shadowColor: '#f78219',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardLabel: {
    color: '#fffde1',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  logout: {
    position: 'absolute',
    bottom: height * 0.05,
    width: '90%',
    backgroundColor: '#f78219',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#f78219',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#fffde1',
    fontSize: 18,
    fontWeight: '700',
  },
});
