import * as React from 'react';

import { ContentBox } from 'components/ContentBox';
import { Alarm } from 'components/Alarm';

import { CIPHER_METHOD, ENCRYPTED_DATA, ENCRYPTED_DATA_BASE64 } from 'config';

import { Method } from 'store';
import { asymmetricEncryptionMethods } from 'libmethods';
import { getDecryptedText, AsymmetricDecryptionResult } from 'libmethods/encryption/asymmetric';

import Base64 from 'utils/base64';

export default function() {
  const [isJsonMode, setIsJsonMode] = React.useState(false);
  const [json, setJson] = React.useState('');

  const [method, setMethod] = React.useState<Method>(asymmetricEncryptionMethods[0]);
  const [key, setKey] = React.useState('');
  const [encryptedText, setEncryptedText] = React.useState('');
  const [error, setError] = React.useState('');
  const [decryptedText, setDecryptedText] = React.useState('');

  React.useEffect(() => {
    json !== '' && parseJson(json);
  }, [json]);

  function parseJson(json: string) {
    let objectJson = {};

    try {
      objectJson = JSON.parse(json);
    } catch (e) {
      setError('JSON не валидный!');
    }

    // @ts-ignore
    const methodName = objectJson[CIPHER_METHOD] === undefined ? '' : objectJson[CIPHER_METHOD];
    const method: Method = asymmetricEncryptionMethods.find(
      method => method.name === methodName,
    ) || {
      name: '',
      type: '',
    };
    setMethod(method);

    let encryptedText: string = '';
    // @ts-ignore
    if (objectJson[ENCRYPTED_DATA_BASE64] === undefined) {
      // @ts-ignore
      encryptedText = objectJson[ENCRYPTED_DATA] === undefined ? '' : objectJson[ENCRYPTED_DATA];
    } else {
      // @ts-ignore
      encryptedText = Base64.decode(objectJson[ENCRYPTED_DATA_BASE64]);
    }
    setEncryptedText(encryptedText);
  }

  const setResult = () => {
    const decryptionResult: AsymmetricDecryptionResult = getDecryptedText(
      method,
      key,
      encryptedText,
    );
    setError(decryptionResult.error);
    !decryptionResult.error && setDecryptedText(decryptionResult.decryptedText);
  };

  const onSubmit = (event: any) => {
    event.preventDefault();
    setError('');

    if (key === '') {
      setError('Введите ключ расшифрования!');
      return;
    }

    if (encryptedText === '') {
      setError('Введите закрытый текст!');
      return;
    }

    setResult();
  };

  const onSubmitJson = (json: string) => {
    setError('');

    if (key === '') {
      setError('Введите ключ расшифрования!');
      return;
    }

    if (method.name === '') {
      setError(`Введите метод шифрования в JSON (свойство: ${CIPHER_METHOD})!`);
      return;
    }

    if (encryptedText === '') {
      setError(
        `Введите текст в JSON, который необходимо расшифровать (свойство: ${ENCRYPTED_DATA})!`,
      );
      return;
    }

    setResult();
  };

  return (
    <>
      <ContentBox title="Ассинхронное расшифрование">
        <span>0) Выберите решим расшифрования:</span>
        <button
          onClick={() => {
            setIsJsonMode(!isJsonMode);
            setError('');
            setDecryptedText('');
          }}
        >
          {isJsonMode
            ? 'Перейти в режим обычного расшифрования'
            : 'Перейти в режим расшифрования JSON'}
        </button>
        {isJsonMode ? (
          <>
            <span>1) Введите JSON для ассинхронного расшифрования:</span>
            <textarea
              value={json}
              placeholder="Ваш JSON для расшифрования"
              onChange={(event: any) => setJson(event.target.value)}
            />
            <span>2) Введите ключ для ассинхронного расшифрования:</span>
            <input
              value={key}
              placeholder="Ваш ключ"
              onChange={(event: any) => setKey(event.target.value)}
            />
            {error && <Alarm type="error" text={`Ошибка! ${error}`} />}
            <button onClick={() => onSubmitJson(json)}>Расшифровать!</button>
          </>
        ) : (
          <>
            <span>1) Выберите метод ассинхронного расшифрования:</span>
            <select
              value={method.type}
              onChange={(event: any) =>
                setMethod(
                  asymmetricEncryptionMethods.find(method => method.type === event.target.value) ||
                    asymmetricEncryptionMethods[0],
                )
              }
            >
              {asymmetricEncryptionMethods.map((method, index) => (
                <option value={method.type} key={index}>
                  {method.name}
                </option>
              ))}
            </select>
            <span>2) Введите ключ для расшифрования:</span>
            <input
              value={key}
              placeholder="Ваш ключ"
              onChange={(event: any) => setKey(event.target.value)}
            />
            <span>3) Введите закрытый текст, который хотите расшифровать:</span>
            <textarea
              value={encryptedText}
              placeholder="Ваш закрытый текст"
              onChange={(event: any) => setEncryptedText(event.target.value)}
            />
            {error && <Alarm type="error" text={`Ошибка! ${error}`} />}
            <button onClick={onSubmit}>Расшифровать!</button>
          </>
        )}
      </ContentBox>

      {!error && decryptedText && (
        <ContentBox title="Ваш результат">
          <span>1) Открытый текст:</span>
          <textarea value={decryptedText} onChange={() => {}} />
        </ContentBox>
      )}
    </>
  );
}
