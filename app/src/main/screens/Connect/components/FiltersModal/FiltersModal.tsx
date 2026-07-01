import React, { Dispatch, useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import colors from 'styles/colors';
import Modal from 'components/Modal/Modal';
import styles from './FiltersModal.styles';
import Select from 'components/Select/Select';
import Button from 'components/Button/Button';
import { DefinitionType } from 'domain/models/base.model';
import { AGE_OPTIONS, DIAGNOSIS_OPTIONS, GENDER_OPTIONS } from 'constants/map';
import { useGetDefinitions } from 'presentation/services/react-query/definition.query';
import { useGetDesignations } from 'presentation/services/react-query/designation.query';
import { useCountry } from 'presentation/hooks';

type Props = {
  isFiltersOpen: boolean;
  setIsFiltersOpen: Dispatch<boolean>;
  designation: { id: string; label: string }[];
  setDesignation: Dispatch<{ id: string; label: string }[]>;
  age: { id: string; label: string }[];
  setAge: Dispatch<{ id: string; label: string }[]>;
  gender: { id: string; label: string }[];
  setGender: Dispatch<{ id: string; label: string }[]>;
  diagnosisType: { id: string; label: string }[];
  setDiagnosisType: Dispatch<{ id: string; label: string }[]>;
  diagnosisYear: { id: string; label: string }[];
  setDiagnosisYear: Dispatch<{ id: string; label: string }[]>;
  country: { id: string; label: string }[];
  setCountry: Dispatch<{ id: string; label: string }[]>;
  city: string;
  setCity: Dispatch<string>;
};

export default function FiltersModal({
  isFiltersOpen,
  setIsFiltersOpen,
  designation,
  setDesignation,
  age,
  setAge,
  gender,
  setGender,
  diagnosisType,
  setDiagnosisType,
  diagnosisYear,
  setDiagnosisYear,
  country,
  setCountry,
  city,
  setCity,
}: Props) {
  const designations = useGetDesignations();
  const diagnosisTypes = useGetDefinitions(DefinitionType.diagnosisType);

  const { supportedCountries } = useCountry();

  const ROLE_OPTIONS =
    designations.data?.map(designation => ({
      id: designation.description,
      label: designation.description,
    })) || [];
  const CANCER_OPTIONS =
    diagnosisTypes.data?.map(diagnosisType => ({
      id: diagnosisType.description,
      label: diagnosisType.description,
    })) || [];
  const DEFAULT_COUNTRIES = supportedCountries.map(country => ({
    id: country.code,
    label: country.name,
  }));

  const [isCityOnFocus, setIsCityOnFocus] = useState(false);

  function handleClear() {
    setDesignation([]);
    setAge([]);
    setGender([]);
    setDiagnosisType([]);
    setDiagnosisYear([]);
    setCountry(DEFAULT_COUNTRIES ? [...DEFAULT_COUNTRIES] : []);
    setCity('');
    setIsFiltersOpen(false);
  }

  function handleApply() {
    setIsFiltersOpen(false);
  }

  useEffect(() => {
    if (country.length === 0)
      setCountry(DEFAULT_COUNTRIES ? [...DEFAULT_COUNTRIES] : []);
  }, [DEFAULT_COUNTRIES]);

  return (
    <Modal onClose={setIsFiltersOpen} title="Filters" visible={isFiltersOpen}>
      <View style={styles.sectionGap}>
        <View style={styles.fieldGap}>
          <Text style={styles.label}>Role</Text>
          <Select
            options={ROLE_OPTIONS}
            selected={designation}
            onSelect={setDesignation}
          />
        </View>
        <View style={styles.fieldGap}>
          <Text style={styles.label}>Age</Text>
          <Select options={AGE_OPTIONS} selected={age} onSelect={setAge} />
        </View>
        <View style={styles.fieldGap}>
          <Text style={styles.label}>Gender</Text>
          <Select
            options={GENDER_OPTIONS}
            selected={gender}
            onSelect={setGender}
          />
        </View>
        <View style={styles.fieldGap}>
          <Text style={styles.label}>Cancer type</Text>
          <Select
            options={CANCER_OPTIONS}
            selected={diagnosisType}
            onSelect={setDiagnosisType}
          />
        </View>
        <View style={styles.fieldGap}>
          <Text style={styles.label}>Diagnosis year</Text>
          <Select
            options={DIAGNOSIS_OPTIONS}
            selected={diagnosisYear}
            onSelect={setDiagnosisYear}
          />
        </View>
        <View style={{ gap: 8 }}>
          <Text style={styles.label}>City</Text>
          <LinearGradient
            colors={['rgba(178, 93, 149, 1)', 'rgba(255, 162, 60, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.inputGradient}
          >
            <TextInput
              value={city}
              onChangeText={address => setCity(address)}
              placeholder="No Preference"
              style={[
                styles.textInput,
                isCityOnFocus && styles.focusedTextInput,
              ]}
              textContentType="addressCity"
              keyboardType="default"
              placeholderTextColor={colors.neutral[600]}
              onFocus={() => setIsCityOnFocus(true)}
              onBlur={() => {
                setIsCityOnFocus(false);
              }}
            />
          </LinearGradient>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Clear All" type="secondary" onPress={handleClear} />
        <Button title="Apply filters" shape="rounded" onPress={handleApply} />
      </View>
    </Modal>
  );
}
