import React, { useEffect, useRef, useState } from 'react';
import '../styles/BotRunner.css';

const channelPubSubMap = 'to-client:pub-sub-map' as const;
const channelCurrentBarigaSettings = 'current-settings:bariga' as const;

export default function BotRunner() {
  const [pubsubs, setPubsubs] = useState([] as { channel: string, inputs: Record<string, string>[] }[]);
  const [barigaSettings, setBarigaSettings] = useState({});
  const [messageFromWs, setMessageFromWs] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:7777');
    ws.current.onopen = () => console.log('open');
    ws.current.onmessage = ({ data }) => {
      console.log(data);
      const _data = JSON.parse(data);
      if (_data.channel === channelPubSubMap) setPubsubs(_data.message);
      else if (_data.channel === channelCurrentBarigaSettings) setBarigaSettings(_data.message);
      else setMessageFromWs(JSON.stringify(_data, null, 4));
    }

    return ws.current.close;
  }, [ws]);

  return (<>
    <ul>
      {pubsubs.map((channel, i) => {
        return <li key={i}>
          <form
            style={{ backgroundColor: i % 2 === 0 ? '#90EE90' : '#2E8B57' }}
            onSubmit={(event) => {
              event.preventDefault();
              const data = Object
                .entries(event.target)
                .reduce((acc, [key, { name, value }]) => {
                  if (!/^\d+$/.test(key)) return acc;
                  if (name === 'channel') {
                    acc.channel = value;
                  } else {
                    acc.message = { ...acc.message, [name]: value };
                  }

                  return acc;
                }, { channel: '', message: {} });

              if (!ws.current) alert('No connection');

              ws.current!.send(JSON.stringify(data));

            }}
          >
            <input type='submit' name='channel' value={channel.channel} />
            {
              channel.inputs.map((input, ii) => {
                const [[key, value]] = Object.entries(input);

                return <div key={ii}>
                  <label>{key}</label>
                  <input type='text' name={key} placeholder={value} />
                </div>
              })
            }
          </form>
        </li>
      })}
    </ul>

    <hr />
    <div>
      <h2>Last message:</h2>
      <pre>{messageFromWs}</pre>
    </div>
    <hr />
    <div>
      <h2>Current bariga's settings:</h2>
      <pre>{JSON.stringify(barigaSettings, null, 4)}</pre>
    </div>
    <hr />
    <div>
      <h3>PubSubs:</h3>
      <pre>{JSON.stringify(pubsubs)}</pre>
    </div>
  </>);
}
