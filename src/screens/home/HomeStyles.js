const { StyleSheet } = require('react-native');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 0,
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 10,
    padding: 15,
    width: 120,
    height: 120,
    backgroundColor: '#007BFF',
  },
  emoji: {
    fontSize: 60,
    color: '#FFF',
  },
  textAbove: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  textBelow: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
