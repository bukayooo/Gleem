import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  SectionList,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import axios from 'axios';
import {Platform} from 'react-native';
import BedroomBathroomPopup from './BedroomBathroomPopup';
interface Extras {
  WindowCleaning: boolean;
  OvenCleaning: boolean;
  LeatherCleaning: boolean;
  DisinfectSurfaces: boolean;
}

interface Address {
  id: string | number;
  label: string;
  full_address: string; // Change this from fullAddress to full_address
  bedrooms: number;
  bathrooms: number;
  selected: boolean;
  created_at: string;
  updated_at: string;
}

const extraTimeAdjustments: Record<keyof Extras, number> = {
  WindowCleaning: 15,
  OvenCleaning: 30,
  LeatherCleaning: 30,
  DisinfectSurfaces: 15,
};

const getStreetAddress = (fullAddress: string | undefined) => {
  if (!fullAddress) {
    return 'Address not available';
  }
  const parts = fullAddress.split(',');
  return (
    parts[0].trim() ||
    fullAddress.split(' ').slice(0, 3).join(' ') ||
    'Address not available'
  );
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

  const [showBedroomBathroomPopup, setShowBedroomBathroomPopup] =
    useState(false);
  const [tempAddress, setTempAddress] = useState<Address | null>(null);

  const [bedroomCount, setBedroomCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  const BASE_URL =
    Platform.OS === 'ios' ? 'http://127.0.0.1:3000' : 'http://10.0.2.2:3000';

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/addresses`);
      console.log('Fetched addresses:', response.data);
      setAddresses(response.data);
      const foundSelectedAddress = response.data.find(
        (address: Address) => address.selected === true,
      );
      if (foundSelectedAddress) {
        console.log('Found selected address:', foundSelectedAddress);
        setSelectedAddress(foundSelectedAddress);
      } else {
        console.log('No selected address found, setting to null');
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  }, [BASE_URL]);

  const saveAddress = async (
    address: Omit<Address, 'id' | 'selected' | 'created_at' | 'updated_at'>,
  ) => {
    console.log('Saving address:', address);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/addresses`,
        {
          address: {
            full_address: address.full_address,
            label: address.label,
            bedrooms: address.bedrooms,
            bathrooms: address.bathrooms,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Save address response:', response.data);
      const savedAddress = response.data;
      setAddresses(prev => [...prev, savedAddress]);
      if (savedAddress.selected) {
        setSelectedAddress(savedAddress);
      } else {
        await updateSelectedAddress(savedAddress);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Request data:', error.config?.data);
      }
    }
  };
  const updateSelectedAddress = async (address: Address) => {
    console.log('Updating selected address:', address);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/addresses/${address.id}/set_selected`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      console.log('Update response:', response.data);
      if (response.data.success) {
        const updatedAddress = response.data.address;
        console.log('Setting new selected address:', updatedAddress);
        setSelectedAddress(updatedAddress);
        setAddresses(prevAddresses =>
          prevAddresses.map(addr =>
            addr.id === updatedAddress.id
              ? updatedAddress
              : {...addr, selected: false},
          ),
        );
      } else {
        console.error(
          'Failed to update selected address:',
          response.data.error,
        );
      }
    } catch (error) {
      console.error('Error setting selected address:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }
    }
  };
  const deleteAddress = async (addressId: string) => {
    try {
      console.log('Deleting address:', addressId);
      const response = await axios.delete(
        `${BASE_URL}/api/v1/addresses/${addressId}`,
      );
      console.log('Delete response:', response.data);
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(null);
      }
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (selectedAddress) {
      const newPrice = calculatePrice();
      console.log('New price calculated:', newPrice);
      // If you have a state for price, update it here
      // setPrice(newPrice);
    }
  }, [selectedAddress, extras]);

  useEffect(() => {
    console.log('selectedAddress changed:', selectedAddress);
  }, [selectedAddress]);

  const toggleExtra = (extra: keyof Extras) => {
    setExtras(prev => ({...prev, [extra]: !prev[extra]}));
  };

  const calculatePrice = (): number => {
    if (!selectedAddress) {
      return 0;
    }
    let price =
      50 + 50 * selectedAddress.bedrooms + 40 * selectedAddress.bathrooms;
    Object.keys(extras).forEach(extra => {
      if (extras[extra as keyof Extras]) {
        price += extraTimeAdjustments[extra as keyof Extras];
      }
    });
    return price;
  };

  const goToSchedule = () => {
    navigation.navigate('Schedule', {
      extras,
      price: calculatePrice(),
      address: selectedAddress,
      bedrooms: selectedAddress?.bedrooms || 1,
      bathrooms: selectedAddress?.bathrooms || 1,
    });
  };

  const handleSaveAddress = async (
    newBedrooms: number,
    newBathrooms: number,
  ) => {
    console.log('handleSaveAddress called with:', newBedrooms, newBathrooms);
    if (tempAddress) {
      console.log('Temp address found:', tempAddress);
      const addressToSave = {
        ...tempAddress,
        bedrooms: newBedrooms,
        bathrooms: newBathrooms,
        full_address: tempAddress.full_address, // Change this line
      };
      console.log('Address to save:', addressToSave);
      await saveAddress(addressToSave);
      setShowBedroomBathroomPopup(false);
      setTempAddress(null);
      setModalVisible(false);
      setBedroomCount(1);
      setBathroomCount(1);
    } else {
      console.log('No temp address found');
    }
  };

  const renderHeader = () => {
    console.log('renderHeader - selectedAddress:', selectedAddress);
    console.log('renderHeader - fullAddress:', selectedAddress?.full_address);

    return (
      <>
        <Text style={styles.homeHeader}>Gleem</Text>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addressButton}>
            <Text>
              {selectedAddress
                ? getStreetAddress(selectedAddress.full_address)
                : 'Add an address'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

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
      {selectedAddress && (
        <Text style={styles.priceText}>${calculatePrice().toFixed(2)}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.scheduleButton,
          !selectedAddress && styles.disabledButton,
        ]}
        onPress={goToSchedule}
        disabled={!selectedAddress}>
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
                console.log('Address selected:', data.description);
                const newAddress = {
                  id: Date.now().toString(),
                  label: 'Custom',
                  fullAddress: data.description,
                  bedrooms: 1,
                  bathrooms: 1,
                };
                console.log('New address object:', newAddress);
                setTempAddress({
                  ...newAddress,
                  full_address: newAddress.fullAddress,
                  selected: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                setBedroomCount(1);
                setBathroomCount(1);
                setShowBedroomBathroomPopup(true);
                setModalVisible(false);
              }}
              query={{
                key: 'AIzaSyDFmVcJ9RE19ikMmiaQPX7pEUOCblmtCDk',
                language: 'en',
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
            />
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            {addresses.map(address => (
              <View key={address.id} style={styles.savedAddressItem}>
                <TouchableOpacity
                  onPress={() => {
                    updateSelectedAddress(address);
                    setModalVisible(false);
                  }}
                  style={styles.savedAddressButton}>
                  <Text style={styles.savedAddressText}>
                    {getStreetAddress(address.full_address)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteAddress(address.id.toString())}
                  style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
      <BedroomBathroomPopup
        visible={showBedroomBathroomPopup}
        onClose={() => {
          console.log('BedroomBathroomPopup closed');
          setShowBedroomBathroomPopup(false);
          setTempAddress(null);
          setBedroomCount(1);
          setBathroomCount(1);
        }}
        onSave={handleSaveAddress}
        initialBedrooms={bedroomCount}
        initialBathrooms={bathroomCount}
      />
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
  disabledButton: {
    opacity: 0.5,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  savedAddressItem: {
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
  savedAddressButton: {
    flex: 1,
    borderRadius: 5,
  },
  savedAddressText: {
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 4,
    backgroundColor: '#ff6b6b',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;


