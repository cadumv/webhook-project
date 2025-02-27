const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const schedule = require('node-schedule');

const app = express();
app.use(bodyParser.json());

// Configurações do WhatsApp Cloud API
const PHONE_NUMBER_ID = '338293466043357';
const WHATSAPP_ACCESS_TOKEN = 'EAAF8kaMZCF9oBO0RKZCvMACzkAbafpl1tmaWpepZCQz81yOTmmkZAJ05b3BduprNPmXCRDAEnWV2xJSNAZAVu8OqB6X4jiKkX6hwaeTrW6nx415ck6fKmI3j3bUhmkxrFLBNVWroSkHdO6s7S516kASv1fc54fhtCLHOx05Um7sIcBGlsyDB3DDmZBVwFyZBTKRcAZDZD';

// Token de verificação para o webhook do WhatsApp (igual ao configurado no Meta)
const VERIFY_TOKEN = 'HAPPY';

// Objeto para armazenar dados temporários (para produção, utilize um banco de dados)
const appointments = {};

/**
 * Função para formatar uma data no formato DD/MM/YYYY HH:mm.
 * @param {string | Date} dateInput - A data a ser formatada.
 * @returns {string} Data formatada.
 */
function formatDate(dateInput) {
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Função auxiliar para verificar se duas datas são do mesmo dia.
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Envia mensagem via template "confirmacao_bot" usando o WhatsApp Cloud API.
 * (Esta mensagem é enviada imediatamente ao combinar os webhooks)
 *
 * @param {string} phoneNumber - Número do destinatário.
 * @param {string} dataAgendada - Data formatada que substituirá {{data_agendada}}.
 */
function sendTemplateWhatsAppMessage(phoneNumber, dataAgendada) {
  const whatsappUrl = `https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "confirmacao_bot", // Template de confirmação
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: dataAgendada
            }
          ]
        }
      ]
    }
  };

  axios.post(whatsappUrl, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`Template "confirmacao_bot" enviado para ${phoneNumber}:`, response.data);
  })
  .catch(error => {
    console.error(`Erro ao enviar template "confirmacao_bot" para ${phoneNumber}:`, 
      error.response ? error.response.data : error.message);
  });
}

/**
 * Envia o template "lembrete_hoje_2" que informa "É hoje" com os botões interativos.
 *
 * @param {string} phoneNumber - Número do destinatário.
 * @param {string} nome - Nome do usuário.
 * @param {string} dataAgendada - Data/hora da reunião formatada.
 * @param {string} linkEvento - URL de acesso ao evento.
 */
function sendTemplateHoje2(phoneNumber, nome, dataAgendada, linkEvento) {
  const whatsappUrl = `https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "lembrete_hoje_2",
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nome },
            { type: "text", text: dataAgendada },
            { type: "text", text: linkEvento }
          ]
        }
      ]
    }
  };

  axios.post(whatsappUrl, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`Template "lembrete_hoje_2" enviado para ${phoneNumber}:`, response.data);
  })
  .catch(error => {
    console.error(`Erro ao enviar template "lembrete_hoje_2" para ${phoneNumber}:`, 
      error.response ? error.response.data : error.message);
  });
}

/**
 * Envia o template "lembrete_10min_2" que informa que faltam 10 minutos.
 *
 * @param {string} phoneNumber - Número do destinatário.
 * @param {string} nome - Nome do usuário.
 * @param {string} dataAgendada - Data/hora da reunião formatada.
 * @param {string} linkEvento - URL de acesso ao evento.
 */
function sendTemplate10Min2(phoneNumber, nome, dataAgendada, linkEvento) {
  const whatsappUrl = `https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "lembrete_10min_2",
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nome },
            { type: "text", text: dataAgendada },
            { type: "text", text: linkEvento }
          ]
        }
      ]
    }
  };

  axios.post(whatsappUrl, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`Template "lembrete_10min_2" enviado para ${phoneNumber}:`, response.data);
  })
  .catch(error => {
    console.error(`Erro ao enviar template "lembrete_10min_2" para ${phoneNumber}:`, 
      error.response ? error.response.data : error.message);
  });
}

/**
 * Envia uma mensagem de texto simples via WhatsApp (para lembretes, se necessário).
 *
 * @param {string} phoneNumber - Número do destinatário.
 * @param {string} message - Texto da mensagem.
 */
function sendTextWhatsAppMessage(phoneNumber, message) {
  const whatsappUrl = `https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`;
  axios.post(whatsappUrl, {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: { body: message }
  }, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`Mensagem enviada para ${phoneNumber}:`, response.data);
  })
  .catch(error => {
    console.error(`Erro ao enviar mensagem para ${phoneNumber}:`, 
      error.response ? error.response.data : error.message);
  });
}

/**
 * Combina os dados dos webhooks do Calendly e Typeform para o mesmo email.
 * Quando ambos estiverem disponíveis, envia a mensagem de confirmação via template
 * e agenda os lembretes adicionais:
 * - Template "lembrete_hoje_2" às 8h da manhã do dia da reunião.
 * - Template "lembrete_10min_2" 10 minutos antes do início da reunião.
 *
 * @param {object} appointment - Dados combinados dos webhooks.
 */
function scheduleWhatsAppReminders(appointment) {
  const typeform = appointment.typeform || {};
  const calendly = appointment.calendly;
  const phoneNumber = typeform.phoneNumber;
  const nome = typeform.name || "";

  if (!phoneNumber || !calendly || !calendly.eventDateTime || !calendly.eventLink) {
    console.error("Dados incompletos para agendamento dos lembretes.");
    console.log("phoneNumber:", phoneNumber, "calendly:", calendly);
    return;
  }

  const eventTime = new Date(calendly.eventDateTime);
  const now = new Date();
  const timezone = calendly.timezone || "America/Sao_Paulo";
  const dataAgendada = formatDate(eventTime); // Data formatada em DD/MM/YYYY HH:mm

  // Envia a mensagem de confirmação imediatamente usando o template "confirmacao_bot"
  sendTemplateWhatsAppMessage(phoneNumber, dataAgendada);

  // Agenda o template "lembrete_hoje_2" para as 8h da manhã do dia da reunião
  let meetingDay8 = new Date(eventTime);
  meetingDay8.setHours(8, 0, 0, 0);
  if (meetingDay8 > now) {
    schedule.scheduleJob(meetingDay8, () => {
      sendTemplateHoje2(phoneNumber, nome, dataAgendada, calendly.eventLink);
    });
  } else if (isSameDay(now, eventTime)) {
    // Se a reunião é hoje e já passou das 8h, envia imediatamente
    sendTemplateHoje2(phoneNumber, nome, dataAgendada, calendly.eventLink);
  }

  // Agenda o template "lembrete_10min_2" 10 minutos antes do evento
  const tenMinutesBefore = new Date(eventTime.getTime() - 10 * 60 * 1000);
  if (tenMinutesBefore > now) {
    schedule.scheduleJob(tenMinutesBefore, () => {
      sendTemplate10Min2(phoneNumber, nome, dataAgendada, calendly.eventLink);
    });
  }
}

/**
 * Endpoint para receber webhooks do Calendly e Typeform.
 * URL (via Cloudflare Tunnel): https://webhook.anticriseacademy.com.br/webhook
 */
app.post('/webhook', (req, res) => {
  console.log('Recebido webhook (Calendly/Typeform):', JSON.stringify(req.body, null, 2));

  // Se for Calendly (identificado pela propriedade "payload")
  if (req.body.payload) {
    // Processa somente se o evento for "invitee.created"
    if (req.body.event !== "invitee.created") {
      console.log("Evento Calendly ignorado:", req.body.event);
      return res.sendStatus(200);
    }
    const payload = req.body.payload;
    const calendlyData = {
      email: payload.email,
      eventDateTime: payload.scheduled_event && payload.scheduled_event.start_time,
      eventLink: payload.scheduled_event && payload.scheduled_event.location && payload.scheduled_event.location.join_url,
      rescheduleUrl: payload.reschedule_url,
      textReminderNumber: payload.text_reminder_number,
      eventMembershipsEmail: (payload.scheduled_event && payload.scheduled_event.event_memberships && payload.scheduled_event.event_memberships.length > 0)
        ? payload.scheduled_event.event_memberships[0].user_email
        : null,
      timezone: payload.timezone || "America/Sao_Paulo"
    };

    if (!calendlyData.email) {
      console.error("Email não encontrado no payload do Calendly.");
      return res.status(400).send("Email não encontrado no Calendly");
    }

    if (!appointments[calendlyData.email]) {
      appointments[calendlyData.email] = {};
    }
    appointments[calendlyData.email].calendly = calendlyData;
    console.log(`Dados do Calendly armazenados para ${calendlyData.email}`);

    if (appointments[calendlyData.email].typeform) {
      scheduleWhatsAppReminders(appointments[calendlyData.email]);
    }
    return res.sendStatus(200);

  // Se for Typeform (identificado pela propriedade "form_response")
  } else if (req.body.form_response) {
    const formResponse = req.body.form_response;
    let email, phoneNumber, name;
    if (formResponse.hidden) {
      email = formResponse.hidden.email;
      phoneNumber = formResponse.hidden.phone;
      name = formResponse.hidden.name;
    }
    if (!email || !phoneNumber || !name) {
      const answers = formResponse.answers || [];
      answers.forEach(answer => {
        if (!email && answer.type === "email" && answer.email) {
          email = answer.email;
        }
        if (!phoneNumber && answer.type === "phone_number" && answer.phone_number) {
          phoneNumber = answer.phone_number;
        }
        if (!name && answer.type === "text" && answer.field && answer.field.type === "short_text") {
          name = answer.text;
        }
      });
    }
    if (!email || !phoneNumber) {
      console.error("Email ou telefone não encontrados no payload do Typeform.");
      return res.status(400).send("Email ou telefone não encontrados no Typeform");
    }
    const typeformData = { email, phoneNumber, name };
    if (!appointments[email]) {
      appointments[email] = {};
    }
    appointments[email].typeform = typeformData;
    console.log(`Dados do Typeform armazenados para ${email}`);

    if (appointments[email].calendly) {
      scheduleWhatsAppReminders(appointments[email]);
    }
    return res.sendStatus(200);

  } else {
    console.error("Payload desconhecido recebido:", JSON.stringify(req.body, null, 2));
    return res.sendStatus(200);
  }
});

/**
 * Endpoint para verificação e recepção de webhooks do WhatsApp (interações).
 * URL (via Cloudflare Tunnel): https://whatsapp.anticriseacademy.com.br/whatsapp
 */
app.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook do WhatsApp verificado com sucesso!');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

app.post('/whatsapp', async (req, res) => {
  console.log('Recebido webhook do WhatsApp:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);

  if (req.body.entry && req.body.entry.length > 0) {
    const entry = req.body.entry[0];
    if (entry.changes && entry.changes.length > 0) {
      for (const change of entry.changes) {
        const value = change.value;
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            let buttonReply = null;
            if (message.type === 'interactive' && message.interactive && message.interactive.type === 'button_reply') {
              buttonReply = message.interactive.button_reply;
            } else if (message.type === 'button' && message.button) {
              buttonReply = message.button;
            }
            if (buttonReply) {
              console.log('Botão clicado:', buttonReply);
              // Se o botão clicado for "Sim, confirmo"
              if ((buttonReply.text && buttonReply.text === "Sim, confirmo") ||
                  (buttonReply.payload && buttonReply.payload === "Sim, confirmo")) {
                const fromNumber = value.contacts && value.contacts[0] && value.contacts[0].wa_id;
                const profileName = (value.contacts && value.contacts[0].profile && value.contacts[0].profile.name) || "Desconhecido";
                
                let appointmentFound = null;
                for (const key in appointments) {
                  if (appointments[key].typeform && appointments[key].typeform.phoneNumber.replace('+','') === fromNumber.replace('+','')) {
                    appointmentFound = appointments[key];
                    break;
                  }
                }
                
                if (appointmentFound) {
                  const payloadParaOutraPlataforma = {
                    email: appointmentFound.typeform.email,
                    nome: appointmentFound.typeform.name,
                    telefone: appointmentFound.typeform.phoneNumber,
                    data_agendamento: formatDate(appointmentFound.calendly.eventDateTime),
                    user_email: appointmentFound.calendly.eventMembershipsEmail,
                    join_url: appointmentFound.calendly.eventLink,
                    reschedule_url: appointmentFound.calendly.rescheduleUrl
                  };

                  let retries = 0;
                  const maxRetries = 3;
                  async function sendWebhook() {
                    try {
                      const response = await axios.post(
                        "https://functions-api.clint.digital/endpoints/integration/webhook/a167816e-0eed-4ea2-9fbf-7ae28b56dfbc",
                        payloadParaOutraPlataforma,
                        { headers: { 'Content-Type': 'application/json' } }
                      );
                      console.log("Webhook (confirmação) enviado com sucesso:", response.data);
                    } catch (error) {
                      retries++;
                      console.error(`Erro ao enviar webhook (confirmação, tentativa ${retries}):`, error.response ? error.response.data : error.message);
                      if (retries < maxRetries) {
                        setTimeout(sendWebhook, 3000);
                      } else {
                        console.error("Webhook de confirmação desativado após 3 tentativas falhas consecutivas.");
                      }
                    }
                  }
                  sendWebhook();
                } else {
                  console.error("Não foi encontrado um appointment correspondente para o número:", fromNumber);
                }
              }
              // Se o botão clicado for "Preciso reagendar."
              else if ((buttonReply.text && buttonReply.text === "Preciso reagendar.") ||
                       (buttonReply.payload && buttonReply.payload === "Preciso reagendar.")) {
                const fromNumber = value.contacts && value.contacts[0] && value.contacts[0].wa_id;
                const profileName = (value.contacts && value.contacts[0].profile && value.contacts[0].profile.name) || "Desconhecido";
                
                let appointmentFound = null;
                for (const key in appointments) {
                  if (appointments[key].typeform && appointments[key].typeform.phoneNumber.replace('+','') === fromNumber.replace('+','')) {
                    appointmentFound = appointments[key];
                    break;
                  }
                }
                
                if (appointmentFound) {
                  const payloadParaOutraPlataforma = {
                    email: appointmentFound.typeform.email,
                    nome: appointmentFound.typeform.name,
                    telefone: appointmentFound.typeform.phoneNumber,
                    data_agendamento: formatDate(appointmentFound.calendly.eventDateTime),
                    user_email: appointmentFound.calendly.eventMembershipsEmail,
                    join_url: appointmentFound.calendly.eventLink,
                    reschedule_url: appointmentFound.calendly.rescheduleUrl
                  };

                  let retries = 0;
                  const maxRetries = 3;
                  async function sendWebhook() {
                    try {
                      const response = await axios.post(
                        "https://functions-api.clint.digital/endpoints/integration/webhook/0f8210cd-c17a-4c86-b616-6a6c318aa0b6",
                        payloadParaOutraPlataforma,
                        { headers: { 'Content-Type': 'application/json' } }
                      );
                      console.log("Webhook (reagendamento) enviado com sucesso:", response.data);
                    } catch (error) {
                      retries++;
                      console.error(`Erro ao enviar webhook (reagendamento, tentativa ${retries}):`, error.response ? error.response.data : error.message);
                      if (retries < maxRetries) {
                        setTimeout(sendWebhook, 3000);
                      } else {
                        console.error("Webhook de reagendamento desativado após 3 tentativas falhas consecutivas.");
                      }
                    }
                  }
                  sendWebhook();
                  
                  // Envia também o template de reagendamento "reagendamento_reuniao"
                  sendTemplateReagendamentoMessage(appointmentFound.typeform.phoneNumber, appointmentFound.calendly.rescheduleUrl);
                } else {
                  console.error("Não foi encontrado um appointment correspondente para o número:", fromNumber);
                }
              }
            }
            if (message.type === 'text') {
              console.log('Mensagem de texto recebida:', message.text.body);
            }
          }
        }
      }
    }
  }
});

function sendTemplateReagendamentoMessage(phoneNumber, linkReagendamento) {
  const whatsappUrl = `https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "reagendamento_reuniao", // Nome do template de reagendamento
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: linkReagendamento
            }
          ]
        }
      ]
    }
  };

  axios.post(whatsappUrl, payload, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`Template "reagendamento_reuniao" enviado para ${phoneNumber}:`, response.data);
  })
  .catch(error => {
    console.error(`Erro ao enviar template "reagendamento_reuniao" para ${phoneNumber}:`, 
      error.response ? error.response.data : error.message);
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Webhook Calendly/Typeform disponível em: https://webhook.anticriseacademy.com.br/webhook`);
  console.log(`Webhook WhatsApp disponível em: https://whatsapp.anticriseacademy.com.br/whatsapp`);
});
