import React, { useEffect, useRef, useState } from 'react';
import '../styles/BotRunner.css';

const clientChannel = 'to-client:pub-sub-map' as const;

export default function BotRunner() {
  const [pubsubs, setPubsubs] = useState([] as { channel: string, inputs: Record<string, string>[] }[]);
  const [message, setMessage] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://127.0.0.1:7777');
    ws.current.onopen = () => console.log('open');
    ws.current.onmessage = ({ data }) => {
      const { channel, message } = JSON.parse(data);
      if (channel === clientChannel) setPubsubs(message);
      else setMessage(message);
    }

    return ws.current.close;
  }, [ws]);

  return (<>
    <ul>
      {pubsubs.map((channel, i) => {
        return <li key={i}>
          <form style={{ backgroundColor: i % 2 === 0 ? '#90EE90' : '#2E8B57'}}>
            <button>{channel.channel}</button>
            {
              channel.inputs.map((input, ii) => {
                const [[key, value]] = Object.entries(input);

                return <div key={ii}>
                  <label>{key}</label>
                  <input type='text' placeholder={value} />
                </div>
              })
            }
          </form>
        </li>
      })}
    </ul>

    <hr />
    <pre>{message}</pre>
  </>);
}
