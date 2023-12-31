import React, {useEffect, useState} from 'react';
import {ScrollView, StyleProp, TextStyle, ToastAndroid} from 'react-native';
import {CoreStore} from '../../core/store/core.store';
import {Section} from '../../shared/components/Section';
import {openAiServiceHandler} from '../../core/service/openAi.service';
import {NavigationProp} from '@react-navigation/native';
import {styles} from '../../shared/styles/globalStyle';
import {Button, Dialog, Input, Text} from '@rneui/themed';
import TextArea from '../../shared/components/TextArea';

type ParametersProps = {
  navigation: NavigationProp<any, 'ParametersScreen'>;
};

export function Parameters({navigation}: ParametersProps): JSX.Element {
  const [apiKey, setApiKey] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [apiCheckResponse, setApiCheckResponse] = useState('');
  const [apiCheckDialogVisible, setApiCheckDialogVisible] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableModelsDialogVisible, setAvailableModelsDialogVisible] =
    useState(false);

  useEffect(() => {
    updateApiKeyFromStorage();
    updateApiModelFromStorage();
  }, []);

  // gestion de la clé d'API
  const updateApiKeyFromStorage = async () => {
    setApiKey(await CoreStore.getItem('API_KEY'));
  };

  const save = async () => {
    await CoreStore.storeItem('API_KEY', apiKey);
    openAiServiceHandler.rebuild();
    saveApiModel();
    ToastAndroid.show('Enregistrement réussi', ToastAndroid.SHORT);
  };

  // gestion du modèle
  const updateApiModelFromStorage = async () => {
    setApiModel(await CoreStore.getItem('API_MODEL'));
  };

  function saveApiModel() {
    const newApiModel = apiModel || 'gpt-3.5-turbo';
    if (!apiModel) {
      setApiModel(newApiModel);
    }
    CoreStore.storeItem('API_MODEL', newApiModel);
  }

  const apiCheck = async () => {
    setApiCheckDialogVisible(true);
    setApiCheckResponse('Test de connexion en cours..');
    const openAiService = await openAiServiceHandler.getInstance();
    const result = await openAiService.writeRaw(
      `Tu es un ordinateur distant et ton rôle est de confirmer à \`%USERNAME%\` que l'état de la connexion avec lui fonctionne.`,
      `Check, check. Répondez s'il vous plait...`,
      true,
    );
    setApiCheckResponse(result);
  };
  const clearApiCheckDialog = () => {
    setApiCheckDialogVisible(!apiCheckDialogVisible);
  };

  const displayAvailableModels = async () => {
    setAvailableModelsDialogVisible(true);
    setAvailableModels(['Récupération des modèles en cours..']);
    const openAiService = await openAiServiceHandler.getInstance();
    const models = await openAiService.listModels();
    setAvailableModels(models);
  };
  const clearAvailableModelsDialog = () => {
    setAvailableModelsDialogVisible(!availableModelsDialogVisible);
  };

  return (
    <ScrollView>
      <Text style={[styles.fieldTitle]}>{'\n'}Modèle à utiliser</Text>
      <Input
        placeholder="Modèle à utiliser. Laissez vide pour revenir à la valeur par défaut."
        value={apiModel}
        onChangeText={setApiModel}
      />
      <Button
        title="Afficher les modèles disponible"
        onPress={displayAvailableModels}
      />

      <Dialog
        isVisible={availableModelsDialogVisible}
        onBackdropPress={clearAvailableModelsDialog}
        overlayStyle={dialogStyle}>
        <Dialog.Title title="Liste des modèles" />
        <Text style={boldStyle}>
          Attention - Tous les modèles n'ont pas le même coût.{'\n'}
          Se renseigner sur la page "Pricing" du site d'OpenAI.
        </Text>
        <ScrollView>
          <Text></Text>
          {availableModels.map(model => (
            <Text key={model}>{model}</Text>
          ))}
          <Text>
            {'\n'}
            {'\n'}
          </Text>
        </ScrollView>
      </Dialog>

      <Text style={[styles.fieldTitle]}>{'\n'}Clé API d'OpenAI</Text>
      <TextArea
        nbLines={2}
        placeholder="Ajouter votre clé d'API OpenAI ici"
        value={apiKey}
        onChangeText={setApiKey}
      />
      <Button title="Enregistrer" onPress={save} />

      <Section title="API Check">
        Cliquez sur le bouton ci-dessous pour vérifier le bon fonctionnement de
        votre clé d'API.{'\n'}
      </Section>

      <Button title="Vérifier la connexion à l'API" onPress={apiCheck} />
      <Dialog
        isVisible={apiCheckDialogVisible}
        onBackdropPress={clearApiCheckDialog}
        overlayStyle={dialogStyle}>
        <Dialog.Title title="API Check" />
        <Text>{apiCheckResponse}</Text>
      </Dialog>
    </ScrollView>
  );
}

const dialogStyle: StyleProp<TextStyle> = {
  backgroundColor: '#e4e5e7',
};

const boldStyle: StyleProp<TextStyle> = {fontWeight: '700'};
