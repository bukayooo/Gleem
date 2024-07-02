import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];
const subscriptionTypes = ['Weekly', 'Biweekly', 'Monthly'];

function SchedulingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as {
    bedrooms: number;
    bathrooms: number;
    extras: {[key: string]: boolean};
    price: number;
  };
  const {bedrooms, bathrooms, extras, price} = routeParams;
  const [currentSubscriptionType, setCurrentSubscriptionType] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [subscribe, setSubscribe] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  const goToAddress = () => {
    navigation.navigate('Address');
  };

  const renderDateButtons = () => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date();
      date.setDate(date.getDate() + i);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short', // Short name of the day
        month: 'short', // Short name of the month
        day: 'numeric', // Numeric day without leading zeros
      });
      dates.push(
        <TouchableOpacity
          key={i}
          style={isSelected ? styles.selectedDateButton : styles.dateButton}
          onPress={() => setSelectedDate(date)}>
          <Text style={styles.dateButtonText}>{formattedDate}</Text>
        </TouchableOpacity>,
      );
    }
    return <ScrollView horizontal>{dates}</ScrollView>;
  };

  const calculateTimeSlots = () => {
    let baseDuration = 60; // Base duration in minutes
    let extraDuration = bedrooms * 30 + bathrooms * 30; // Additional duration based on bedrooms and bathrooms
    Object.keys(extras).forEach(key => {
      if (extras[key]) {
        extraDuration += 15; // Each extra adds 15 minutes
      }
    });

    let totalDuration = baseDuration + extraDuration; // Total cleaning duration
    let slots = [];
    let lastSlotHour = 20 - Math.ceil(totalDuration / 60); // Calculate the starting hour for the last slot

    for (let hour = 8; hour <= lastSlotHour; hour++) {
      let startTime = new Date();
      startTime.setHours(hour, 0, 0, 0);
      let endTime = new Date(startTime.getTime() + totalDuration * 60000); // Calculate ending time

      const isSelected =
        selectedTime && startTime.getTime() === selectedTime.getTime();

      let formattedStartTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      let formattedEndTime = endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });

      slots.push(
        <TouchableOpacity
          key={hour}
          style={isSelected ? styles.selectedTimeSlot : styles.timeSlot}
          onPress={() => setSelectedTime(startTime)}>
          <Text
            style={
              styles.timeSlotText
            }>{`${formattedStartTime} - ${formattedEndTime}`}</Text>
        </TouchableOpacity>,
      );
    }
    return <ScrollView>{slots}</ScrollView>;
  };
  useEffect(() => {
    if (subscribe && currentSubscriptionType && price) {
      setDiscountedPrice(price * 0.85);
    } else {
      setDiscountedPrice(null);
    }
  }, [subscribe, currentSubscriptionType, price]);

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.schedulingContainer}>
        <Text style={styles.schedulingHeader}>Schedule Cleaning</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.dateTimeContainer}>
          <ScrollView horizontal>{renderDateButtons()}</ScrollView>
          {calculateTimeSlots()}
        </View>
        <View style={styles.subscriptionContainer}>
          <View style={styles.subscriptionCheckboxRow}>
            <TouchableOpacity
              style={
                subscribe ? styles.checkboxSelected : styles.checkboxButton
              }
              onPress={() => setSubscribe(!subscribe)}>
              {subscribe && <Text style={styles.checkboxText}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.subscribeLabel}>
              Subscribe for a 15% discount
            </Text>
          </View>
          <View style={styles.subscriptionOptionsGrid}>
            {subscribe &&
              subscriptionTypes.map((type: string) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.subscriptionOption,
                    currentSubscriptionType === type
                      ? styles.selectedSubscriptionOption
                      : null,
                  ]}
                  onPress={() => {
                    setCurrentSubscriptionType(type);
                    setDiscountedPrice(price * 0.85); // Apply discount here
                  }}>
                  <Text
                    style={
                      currentSubscriptionType === type
                        ? styles.selectedSubscriptionText
                        : styles.subscriptionText
                    }>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
        <Text style={styles.priceDisplay}>
          {discountedPrice !== null
            ? `$${discountedPrice.toFixed(2)}`
            : `$${price.toFixed(2)}`}
        </Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            console.log('Confirmed');
          }}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: 'white',
  },
  schedulingContainer: {
    flex: 1,
    alignItems: 'center',

    height: '100%',
  },
  schedulingHeader: {
    padding: 60,
    fontSize: 32,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 20, // Adjust font size here for back button text
  },

  dateTimeContainer: {
    flex: 1,
    flexDirection: 'column',
    margin: 10,
  },
  dateButton: {
    height: 50,
    width: 200,
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
  dateButtonText: {
    fontSize: 22,
  },
  selectedDateButton: {
    height: 50,
    width: 200,
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
    backgroundColor: '#f4f4f4',
  },
  selectedTimeSlot: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    margin: 10, // Outer spacing
    backgroundColor: '#f4f4f4',
  },
  timeSlotContainer: {
    marginTop: 20,
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    margin: 10, // Outer spacing
    backgroundColor: 'white',
  },
  timeSlotText: {
    fontSize: 16,
  },
  subscriptionContainer: {
    flexDirection: 'column',
    marginTop: 20,
    alignItems: 'center',
    fontSize: 24,
  },
  checkboxSelected: {
    height: 24,
    width: 24,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 25, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    backgroundColor: 'black',
  },
  checkboxButton: {
    height: 24,
    width: 24,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 25, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
  },
  checkboxText: {
    color: 'white',
  },
  subscribeLabel: {
    fontSize: 18, // Adjust as needed
  },

  subscriptionCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionOptionsGrid: {
    marginTop: 20,
    flexDirection: 'row',
  },
  subscriptionOption: {
    flexDirection: 'row',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedSubscriptionOption: {
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
    backgroundColor: '#f4f4f4',
  },
  subscriptionText: {
    fontSize: 16, // Adjust as needed
  },
  selectedSubscriptionText: {
    fontSize: 16, // Adjust as needed
  },
  addressForm: {
    marginTop: 20,
    width: '100%',
  },
  cityStateZip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownBox: {},
  dropdownButton: {},
  dropdownButtonText: {},
  dropdownStyle: {},
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 24,
    margin: 10,
    borderColor: '#ccc',
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    backgroundColor: 'white',
  },
  priceDisplay: {
    marginTop: 20,
    fontSize: 24,
  },
  submitButton: {
    backgroundColor: '#a9d0de',
    padding: 15,
    borderRadius: 10, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    margin: 20, // Outer spacing
    fontSize: 24,
  },
  confirmButtonText: {
    // Existing styles
    fontSize: 24, // Adjust as needed
  },
});

export default SchedulingScreen;

