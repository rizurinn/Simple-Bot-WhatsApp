const WebSocket = require('ws')
const session_hash = Math.random().toString(36).slice(2);

class TtsBlueArchive {
  constructor() {
    this.wsUrl = "wss://ori-muchim-bluearchivetts.hf.space/queue/join";
  }

  async sendRequest(text, chara = "JP_Airi", speed = 1.2) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.wsUrl);
      let completed = false;

      socket.onopen = () => {
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.msg) {
          case "send_hash":
            socket.send(JSON.stringify({
              session_hash: session_hash,
              fn_index: 0
            }));
            break;
            
          case "send_data":
            socket.send(JSON.stringify({
              session_hash: session_hash,
              fn_index: 0,
              data: [text, chara, speed]
            }));
            break;
            
          case "process_completed":
            completed = true;
            if (msg.output && msg.output.data && msg.output.data[1] && msg.output.data[1].is_file) {
              let audio = msg.output.data[1].name;
              resolve({
                audioUrlsWavNya: `https://ori-muchim-bluearchivetts.hf.space/file=${audio}`
              })
            } else {
              reject("Invalid response format");
            }
            socket.close();
            break;
        }
      };

      socket.onerror = (error) => {
        if (!completed) reject(error);
      };

      socket.onclose = () => {
        if (!completed) reject("Connection closed before completion");
      };
    });
  }
}

const ttsBA = new TtsBlueArchive();

module.exports = ttsBA
