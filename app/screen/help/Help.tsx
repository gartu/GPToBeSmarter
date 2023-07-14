import React, {useEffect} from 'react';
import {Button, View} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import screens from '../screens';
import {Section} from '../../shared/components/Section';

type HelpProps = {
  navigation: NavigationProp<any, 'Help'>;
};

export function Help({navigation}: HelpProps): JSX.Element {
  useEffect(() => {}, []);

  const openParameters = async () => {
    navigation.navigate(screens.parameters);
  };

  return (
    <View>
      <Section title="Créer un compte OpenAI">TODO</Section>
      <Section title="Activer le mode payant">TODO</Section>
      <Section title="Créer votre clé d'API">TODO</Section>
      <Button title="Insérer ma clé d'API" onPress={openParameters} />
      <Section title="Utilisation">TODO</Section>
    </View>
  );
}
