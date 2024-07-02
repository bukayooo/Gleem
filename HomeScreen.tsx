import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {Platform} from 'react-native';

interface Extras {
  WindowCleaning: boolean;
  OvenCleaning: boolean;
  LeatherCleaning: boolean;
  DisinfectSurfaces: boolean;
}

interface Address {
  id: string;
  label: string;
  fullAddress: string;
}

const extraTimeAdjustments: Record<keyof Extras, number> = {
  WindowCleaning: 15,
  OvenCleaning: 30,
  LeatherCleaning: 30,
  DisinfectSurfaces: 15,
};

const getStreetAddress = (fullAddress: string) => {
  return fullAddress.split(',')[0];
};

const HomeScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [extras, setExtras] = useState<Extras>({
    WindowCleaning: false,
    OvenCleaning: false,
    LeatherCleaning: false,
    DisinfectSurfaces: false,
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const BASE_URL =
    Platform.OS === 'ios' ? 'http://127.0.0.1:3000' : 'http://10.0.2.2:3000';

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/addresses`);
      setAddresses(response.data);
      const selectedAddress = response.data.find(
        (address: Address) => address.selected,
      );
      setSelectedAddress(selectedAddress || null);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const saveAddress = async (address: Address) => {
    try {
      await axios.post(`${BASE_URL}/api/v1/addresses`, address);
      fetchAddresses(); // Refresh the list of addresses
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const updateSelectedAddress = async (address: Address) => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/addresses/${address.id}/set_selected`,
      );
      fetchAddresses();
    } catch (error) {
      console.error('Error setting selected address:', error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const toggleExtra = (extra: keyof Extras) => {
    setExtras(prev => ({...prev, [extra]: !prev[extra]}));
  };

  const calculatePrice = (): number => {
    let price = 50 + 25 * bedrooms + 15 * bathrooms;
    Object.keys(extras).forEach(extra => {
      if (extras[extra as keyof Extras]) {
        price += extraTimeAdjustments[extra as keyof Extras];
      }
    });
    return price;
  };

  const goToSchedule = () => {
    navigation.navigate('Schedule', {
      bedrooms,
      bathrooms,
      extras,
      price: calculatePrice(),
      address: selectedAddress,
    });
  };

  const increment = (category: 'bedrooms' | 'bathrooms') => {
    if (category === 'bedrooms') {
      setBedrooms(prev => prev + 1);
    } else {
      setBathrooms(prev => prev + 1);
    }
  };

  const decrement = (category: 'bedrooms' | 'bathrooms') => {
    if (category === 'bedrooms' && bedrooms > 1) {
      setBedrooms(prev => prev - 1);
    } else if (category === 'bathrooms' && bathrooms > 1) {
      setBathrooms(prev => prev - 1);
    }
  };

  const renderHeader = () => (
    <>
      <Text style={styles.homeHeader}>Gleem</Text>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addressButton}>
          <Text>
            {selectedAddress
              ? getStreetAddress(selectedAddress.fullAddress)
              : 'Add an address'}
          </Text>
        </TouchableOpacity>
        <View style={styles.selectorContainer}>
          <View style={styles.selector}>
            <Text style={styles.selectorText}>Bedrooms:</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => decrement('bedrooms')}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberText}>{bedrooms}</Text>
              <TouchableOpacity onPress={() => increment('bedrooms')}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.selector}>
            <Text style={styles.selectorText}>Bathrooms:</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => decrement('bathrooms')}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberText}>{bathrooms}</Text>
              <TouchableOpacity onPress={() => increment('bathrooms')}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  const renderExtras = () => (
    <View style={styles.extrasGrid}>
      {(Object.keys(extras) as Array<keyof Extras>).map(extra => (
        <TouchableOpacity
          key={extra}
          style={[styles.extraOption, extras[extra] && styles.selected]}
          onPress={() => toggleExtra(extra)}>
          <Text style={styles.extraOptionText}>
            {extra.replace(/([A-Z])/g, ' $1').trim()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.priceContainer}>
      <Text style={styles.priceText}>${calculatePrice().toFixed(2)}</Text>
      <TouchableOpacity style={styles.scheduleButton} onPress={goToSchedule}>
        <Text style={styles.scheduleButtonText}>Schedule Cleaning</Text>
      </TouchableOpacity>
    </View>
  );

  const sections = [{title: 'Extras', data: [{}]}];

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({section}) => {
          if (section.title === 'Extras') {
            return renderExtras();
          }
          return null;
        }}
        renderSectionHeader={() => null}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        stickySectionHeadersEnabled={false}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Addresses</Text>
            <View style={styles.placeholderView} />
          </View>
          <View style={styles.modalContent}>
            <GooglePlacesAutocomplete
              placeholder="Search for an address"
              onPress={(data, details = null) => {
                const newAddress = {
                  id: Date.now().toString(),
                  label: 'Custom',
                  fullAddress: data.description,
                };
                saveAddress(newAddress);
                updateSelectedAddress(newAddress);
                setModalVisible(false);
              }}
              query={{
                key: 'AIzaSyDFmVcJ9RE19ikMmiaQPX7pEUOCblmtCDk',
                language: 'en',
              }}
              styles={{
                container: styles.autocompleteContainer,
                textInputContainer: styles.autocompleteInputContainer,
                textInput: styles.autocompleteInput,
                listView: styles.autocompleteListView,
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              debounce={300}
            />
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            {addresses.map(address => (
              <TouchableOpacity
                key={address.id}
                style={styles.savedAddressItem}
                onPress={() => {
                  updateSelectedAddress(address);
                  setModalVisible(false);
                }}>
                <Text style={styles.savedAddressText}>
                  {address.fullAddress}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center', // Center items horizontally
  },
  homeHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center', // Center text
    paddingVertical: 20,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  selectorContainer: {
    width: '100%',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectorText: {
    fontSize: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    padding: 12,
    fontSize: 24,
  },
  numberText: {
    fontSize: 24,
    paddingHorizontal: 10,
  },
  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  extraOption: {
    width: '48%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  extraOptionText: {
    fontSize: 15,
    textAlign: 'center',
  },
  selected: {
    backgroundColor: '#f4f4f4',
  },
  priceContainer: {
    marginTop: 150,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 24,
  },
  scheduleButton: {
    backgroundColor: '#a9d0de',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 10,
  },
  scheduleButtonText: {
    fontSize: 24,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: 24,
  },
  placeholderView: {
    width: 24,
  },
  autocompleteContainer: {
    flex: 0,
    marginBottom: 20,
  },
  autocompleteInputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  autocompleteInput: {
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
  },
  autocompleteListView: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  savedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  savedAddressText: {
    flex: 1,
    fontSize: 14,
  },
});

export default HomeScreen;
