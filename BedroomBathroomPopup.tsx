import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';

interface BedroomBathroomPopupProps {
  visible: boolean;
  onClose: () => void;
  onSave: (bedrooms: number, bathrooms: number) => void;
  initialBedrooms?: number;
  initialBathrooms?: number;
}

const BedroomBathroomPopup: React.FC<BedroomBathroomPopupProps> = ({
  visible,
  onClose,
  onSave,
  initialBedrooms = 1,
  initialBathrooms = 1,
}) => {
  const [bedrooms, setBedrooms] = useState(initialBedrooms);
  const [bathrooms, setBathrooms] = useState(initialBathrooms);

  useEffect(() => {
    if (visible) {
      setBedrooms(initialBedrooms);
      setBathrooms(initialBathrooms);
    }
  }, [visible, initialBedrooms, initialBathrooms]);

  const increment = (type: 'bedrooms' | 'bathrooms') => {
    if (type === 'bedrooms') {
      setBedrooms(prev => prev + 1);
    } else {
      setBathrooms(prev => prev + 1);
    }
  };

  const decrement = (type: 'bedrooms' | 'bathrooms') => {
    if (type === 'bedrooms' && bedrooms > 1) {
      setBedrooms(prev => prev - 1);
    } else if (type === 'bathrooms' && bathrooms > 1) {
      setBathrooms(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave(bedrooms, bathrooms);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.popupContainer}>
          <Text style={styles.title}>Select Bedrooms and Bathrooms</Text>
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Bedrooms:</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => decrement('bedrooms')}>
                <Text style={styles.counterButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterText}>{bedrooms}</Text>
              <TouchableOpacity onPress={() => increment('bedrooms')}>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Bathrooms:</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => decrement('bathrooms')}>
                <Text style={styles.counterButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterText}>{bathrooms}</Text>
              <TouchableOpacity onPress={() => increment('bathrooms')}>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    fontSize: 24,
    paddingHorizontal: 10,
  },
  counterText: {
    fontSize: 18,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#a9d0de',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default BedroomBathroomPopup;
