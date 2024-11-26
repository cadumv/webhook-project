const venom = require('venom-bot');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Para processar requisições JSON

// Cria o cliente Venom-Bot
venom
  .create({
    session: 'session-name', // Nome da sessão (irá criar uma pasta chamada 'session-name')
    folderNameToken: 'tokens', // Pasta para salvar os tokens
    headless: false, // Mostrar o navegador (para debug)
  })
  .then((client) => start(client))
  .catch((error) => console.error('Erro ao iniciar o Venom-Bot:', error));

// Função principal para configurar o Venom-Bot e o servidor webhook
function start(client) {
  console.log('Venom-Bot iniciado com sucesso!');

  // Configura o evento para responder mensagens automaticamente
  client.onMessage((message) => {
    if (message.body === 'Oi') {
      client.sendText(message.from, 'Olá! Este é um teste com Venom-Bot.');
    }
  });

  // Endpoint para enviar mensagens
  app.post('/webhook/send', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).send({
        success: false,
        error: 'Os parâmetros "number" e "message" são obrigatórios!',
      });
    }

    const chatId = `${number}@c.us`; // Formata o número para o padrão do WhatsApp

    try {
      await client.sendText(chatId, message);
      res.send({
        success: true,
        message: 'Mensagem enviada com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // Inicia o servidor na porta 3000
  app.listen(3000, () => {
    console.log('Servidor webhook rodando em http://localhost:3000');
  });
}
