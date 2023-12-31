import {createTheme} from '@rneui/themed';

export const inputStyle = {
  marginTop: 5,
  fontSize: 12,
  color: 'black',
  backgroundColor: '#e4e5e7',
  padding: 8,
};

const theme = createTheme({
  components: {
    Text: {
      style: {
        fontSize: 12,
        color: 'black',
        padding: 5,
      },
    },
    Button: {
      radius: 7,
      buttonStyle: {
        margin: 10,
      },
    },
    Input: {
      style: inputStyle,
    },
    Divider: {
      style: {
        marginVertical: 15,
      },
    },
    Dialog: {
      style: {
        backgroundColor: 'white',
      },
    },
  },
});

export default theme;
