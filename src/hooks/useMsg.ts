import {useContext} from 'react';

import {MsgContext} from '../context/MsgContext';

const useMsg = () => {
  const context =
    useContext(MsgContext);

  if (!context) {
    throw new Error(
      'useMsg는 MsgProvider 내부에서 사용해야 합니다.',
    );
  }

  return context;
};

export default useMsg;