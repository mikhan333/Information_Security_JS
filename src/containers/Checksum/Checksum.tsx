import * as React from 'react';

import { ContentBox } from 'components/ContentBox';
import { Alarm } from 'components/Alarm';

import { checksumMethods } from 'libmethods';
import { countChecksum, TypesCheckSum } from 'libmethods/checksum';

export default function() {
  const [method, setMethod] = React.useState(checksumMethods[0]);
  const [text, setText] = React.useState('');
  const [error, setError] = React.useState('');
  const [checksum, setChecksum] = React.useState<TypesCheckSum[] | undefined>();

  const onSubmit = (event: any) => {
    event.preventDefault();
    setError('');

    if (text === '') {
      setError('Введите текст для которого необходимо найти контрольную сумму!');
      return;
    }

    setChecksum(countChecksum(method, text));
  };

  return (
    <>
      <ContentBox title="Контрольная сумма">
        <div>1) Выберите метод нахождения контрольной суммы:</div>
        <select
          value={method.type}
          onChange={(event: any) =>
            setMethod(
              checksumMethods.find(method => method.type === event.target.value) ||
                checksumMethods[0],
            )
          }
        >
          {checksumMethods.map((method, index) => (
            <option value={method.type} key={index}>
              {method.name}
            </option>
          ))}
        </select>
        <div>2) Введите текст для которого требуется найти контрольную сумму:</div>
        <textarea
          rows={10}
          cols={50}
          value={text}
          placeholder="Ваш текст"
          onChange={(event: any) => setText(event.target.value)}
        />
        {error && <Alarm type="error" text={`Ошибка! ${error}`} />}
        <button onClick={onSubmit}>Посчитать контрольную сумму!</button>
      </ContentBox>

      {!error && checksum && (
        <ContentBox title="Ваш результат">
          <div>1) Контрольные суммы:</div>
          <table>
            <thead>
              <tr>
                <th>Алгоритм</th>
                <th>Результат</th>
              </tr>
            </thead>
            <tbody>
              {checksum.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentBox>
      )}
    </>
  );
}
