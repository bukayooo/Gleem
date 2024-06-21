import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Extras {
  windowCleaning: boolean;
  ovenCleaning: boolean;
  leatherCleaning: boolean;
  disinfectSurfaces: boolean;
}

const extraTimeAdjustments = {
  windowCleaning: 15,
  ovenCleaning: 30,
  leatherCleaning: 30,
  disinfectSurfaces: 15,
};

const HomeScreen = ({navigation}: {navigation: any}) => {
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [extras, setExtras] = useState<Extras>({
    windowCleaning: false,
    ovenCleaning: false,
    leatherCleaning: false,
    disinfectSurfaces: false,
  });

  const toggleExtra = (extra: keyof Extras) => {
    setExtras({...extras, [extra]: !extras[extra]});
  };

  const calculatePrice = () => {
    let price = 50 + 25 * bedrooms + 15 * bathrooms;
    Object.keys(extras).forEach((extra: keyof Extras) => {
      if (extras[extra]) {
        price +=
          extraTimeAdjustments[extra as keyof typeof extraTimeAdjustments];
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
    });
  };

  function formatCamelCaseToTitle(camelCaseString: string) {
    return camelCaseString
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  const increment = (category: 'bedrooms' | 'bathrooms') => {
    if (category === 'bedrooms') {
      setBedrooms(bedrooms + 1);
    } else if (category === 'bathrooms') {
      setBathrooms(bathrooms + 1);
    }
  };

  const decrement = (category: 'bedrooms' | 'bathrooms') => {
    if (category === 'bedrooms' && bedrooms > 1) {
      setBedrooms(bedrooms - 1);
    } else if (category === 'bathrooms' && bathrooms > 1) {
      setBathrooms(bathrooms - 1);
    }
  };

  return (
    <View style={styles.homeContainer}>
      <Text style={styles.homeHeader}>Gleem</Text>
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
      <View style={styles.extrasGrid}>
        {Object.keys(extras).map(extra => (
          <TouchableOpacity
            key={extra}
            style={[
              styles.extraOption,
              extras[extra as keyof Extras] ? styles.selected : null,
            ]}
            onPress={() => toggleExtra(extra as keyof Extras)}>
            <Text style={styles.extraOptionText}>
              {formatCamelCaseToTitle(extra)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.priceContainer}>
        <View style={styles.priceDisplay}>
          <Text style={styles.priceText}>${calculatePrice().toFixed(2)}</Text>
        </View>
        <TouchableOpacity onPress={goToSchedule} style={styles.scheduleButton}>
          <Text style={styles.scheduleButtonText}>Schedule Cleaning</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  homeHeader: {
    padding: 60,
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectorContainer: {
    marginTop: 20,
    width: '100%',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    margin: 10, // Outer spacing
    backgroundColor: 'white',
  },
  selectorText: {
    fontSize: 24, // Adjust this value as needed
  },
  dropdownBox: {},
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    padding: 12,
    fontSize: 24,
  },
  numberText: {
    fontSize: 24, // Adjust the font size for the number of bedrooms/bathrooms
  },
  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    width: '100%',
  },
  extraOption: {
    width: '20%',
    aspectRatio: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    margin: 10, // Outer spacing
    alignItems: 'center',
    backgroundColor: 'white',
  },
  extraOptionText: {
    fontSize: 15, // Adjust the font size for extra options text
  },
  selected: {
    backgroundColor: '#f4f4f4',
  },
  priceContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  priceDisplay: {
    marginBottom: 20,
  },
  priceText: {
    fontSize: 24, // Adjust the font size for price display
  },
  scheduleButton: {
    backgroundColor: '#a9d0de',
    padding: 15,
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    margin: 10, // Outer spacing
  },
  scheduleButtonText: {
    fontSize: 24, // Adjust the font size for schedule button text
  },
});

export default HomeScreen;
