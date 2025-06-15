import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    paddingBottom: 20,
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  calendarContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  selectedDateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#f78219',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButton: {
    backgroundColor: '#f78219',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    marginVertical: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  headerArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f78219',
    paddingHorizontal: 15,
  },
  headerMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});
