import React, {useEffect, useState} from 'react';
import {StyleSheet, ToastAndroid, View} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import {openAiServiceHandler} from '../../core/service/openAi.service';
import {Button, Dialog, Divider, Icon, Text} from '@rneui/themed';
import {Picker} from '@react-native-picker/picker';
import {ScrollView} from 'react-native-gesture-handler';
import TextArea from '../../shared/components/TextArea';
import {contextService} from '../../core/service/context.service';
import {ContextVariablePicker} from './components/ContextVariablePicker';
import {CoreStore} from '../../core/store/core.store';
import {BotContext, Variable} from '../../shared/contexts.v1';
import Clipboard from '@react-native-clipboard/clipboard';
import {TwoButton} from '../../shared/components/TwoButton';

type InteractionProps = {
  navigation: NavigationProp<any, 'Interaction'>;
};

export function Interaction({navigation}: InteractionProps): JSX.Element {
  const [input, setInput] = useState('');
  const [lastInput, setLastInput] = useState('');
  const [output, setOutput] = useState('');
  const [botContextIdx, setBotContextIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [historyExists, setHistoryExists] = useState(false);
  const [isFlowConversation, setIsFlowConversation] = useState(false);
  const [contextVariables, setContextVariables] = useState<Variable[]>([]);
  const [contexts, setContexts] = useState<BotContext[]>([]);
  const [selectedOptions, setSelectedOptions] = useState(
    {} as {[key: string]: string},
  );
  const [inputPlaceholder, setInputPlaceholder] = useState(
    'De quoi souhaitez-vous parler ?',
  );

  useEffect(() => {
    contextService.getContexts().then(ctx => {
      setContexts(ctx);
    });
    updateChatHistoryState();
  }, []);

  useEffect(() => {
    // défini les entrées par défaut
    // updateBotContextVariableOption(contexts[botContextIdx].variables[0])(0);
    // updateCustomVariableOption(contexts[botContextIdx].variables[0])('');
    if (contexts && contexts.length > botContextIdx) {
      setContextVariables(contexts[botContextIdx].variables);
    } else {
      setContextVariables([]);
    }
  }, [contexts, botContextIdx]);

  useEffect(() => {
    if (
      contexts &&
      contexts.length > botContextIdx &&
      contexts[botContextIdx].placeholder
    ) {
      const suffixe = historyExists ? ' (un conversation est en cours)' : '';
      setInputPlaceholder(
        (contexts[botContextIdx].placeholder || '') + suffixe,
      );
    } else {
      setInputPlaceholder(
        historyExists ? 'Répondre ici ..' : 'De quoi souhaitez-vous parler ?',
      );
    }
  }, [botContextIdx, contexts, historyExists]);

  useEffect(() => {
    setIsFlowConversation(
      contexts &&
        contexts.length > botContextIdx &&
        contexts[botContextIdx].conversationType === 'FLOW',
    );
  }, [botContextIdx, contexts]);

  const updateChatHistoryState = async () => {
    const chatHistoryExists = Boolean(
      await CoreStore.getObject('CHAT_HISTORY'),
    );
    setHistoryExists(chatHistoryExists);
  };

  const clearAndSend = async () => {
    await clearInteraction();
    send();
  };

  const send = async () => {
    setIsLoading(true);
    setLastInput(input);
    setInput('');
    const openAiService = await openAiServiceHandler.getInstance();

    const userOptions = Object.entries(selectedOptions).reduce(
      (prev, [variableKey, value]) => {
        return {
          ...prev,
          [variableKey]: value,
        };
      },
      {},
    );

    const result = await openAiService.write(
      contexts[botContextIdx],
      input,
      userOptions,
    );
    setHistoryExists(true);
    setOutput(result);
    setIsLoading(false);
  };

  const clearInteraction = async () => {
    setHistoryExists(false);
    setIsLoading(true);
    await CoreStore.remove('CHAT_HISTORY');
    setIsLoading(false);
  };

  function onVariableChangeBuilder(
    viariableKey: string,
  ): (selectedOption: string) => void {
    return (optionValue: string) => {
      setSelectedOptions({
        ...selectedOptions,
        [viariableKey]: optionValue,
      });
    };
  }

  const copyLastInput = () => {
    Clipboard.setString(lastInput);
    ToastAndroid.show('Message copié', ToastAndroid.SHORT);
  };

  const copyOutput = () => {
    Clipboard.setString(output);
    ToastAndroid.show('Message copié', ToastAndroid.SHORT);
  };

  const displayWaitingMessage = () => {
    ToastAndroid.show('Chargement en cours..', ToastAndroid.SHORT);
  };

  return (
    <ScrollView>
      <View>
        <View style={styles.iconContainer}>
          <Icon
            name="copy"
            size={20}
            color="#000"
            type="font-awesome"
            onPress={copyLastInput}
          />
        </View>
        <Text style={[styles.messageBoxContainer, styles.odd]}>
          <Text style={styles.messageBox}>{lastInput}</Text>
        </Text>
      </View>
      <View>
        <View style={styles.iconContainer}>
          <Icon
            name="copy"
            size={20}
            color="#000"
            type="font-awesome"
            onPress={copyOutput}
          />
        </View>
        <Text style={[styles.messageBoxContainer, styles.even]}>
          <Text style={styles.messageBox}>{output}</Text>
        </Text>
      </View>
      <Divider />
      <Text style={styles.bold}>Configuration :</Text>
      <Picker selectedValue={botContextIdx} onValueChange={setBotContextIdx}>
        {contexts.map((item, index) => (
          <Picker.Item key={`ctx-${index}`} label={item.name} value={index} />
        ))}
      </Picker>
      {contextVariables.map(variable => (
        <ContextVariablePicker
          key={`${botContextIdx}-${variable.key}`}
          variable={variable}
          onVariableChange={onVariableChangeBuilder(variable.key)}
        />
      ))}
      <TextArea
        nbLines={2}
        placeholder={inputPlaceholder}
        value={input}
        onChangeText={setInput}
      />
      {isFlowConversation || !historyExists ? (
        <Button
          title={historyExists ? 'Répondre' : 'Envoyer'}
          onPress={send}
          disabled={isLoading}
        />
      ) : (
        <TwoButton
          btn1={{title: 'Répondre', onPress: send, disabled: isLoading}}
          btn2={{
            title: 'Nouvelle interaction',
            onPress: clearAndSend,
            disabled: isLoading,
          }}
        />
      )}
      {historyExists ? (
        <Button title="Effacer la conversation" onPress={clearInteraction} />
      ) : (
        ''
      )}

      <Dialog isVisible={isLoading} onBackdropPress={displayWaitingMessage}>
        <Dialog.Loading />
      </Dialog>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bold: {
    paddingLeft: 5,
    fontSize: 14,
    fontWeight: '700',
  },
  messageBoxContainer: {
    padding: 10,
    margin: 2,
    borderStyle: 'solid',
    borderColor: '#000000',
    borderRadius: 5,
  },
  messageBox: {},
  iconContainer: {
    position: 'absolute',
    zIndex: 100,
    top: 10,
    right: 10,
  },
  even: {
    backgroundColor: '#9886c6',
  },
  odd: {
    backgroundColor: '#60499d',
  },
});
