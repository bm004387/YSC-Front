import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

/** Applies OS autofill opt-outs to every input rendered through this component. */
const NoAutofillTextInput = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  TextInputProps
>((props, ref) => (
  <TextInput
    {...props}
    ref={ref}
    autoComplete="off"
    textContentType="none"
    importantForAutofill="no"
    autoCorrect={false}
    spellCheck={false}
  />
));

NoAutofillTextInput.displayName = 'NoAutofillTextInput';

export default NoAutofillTextInput;
