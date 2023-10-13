import qrcode from "qrcode-terminal";
import { Client, Message, Events, LocalAuth } from "whatsapp-web.js";
import { startsWithIgnoreCase } from "./utils";
import config from "./config";
import constants from "./constants";
import { handleMessageGPT } from "./handlers/gpt";
import { handleMessageDALLE } from "./handlers/dalle";
import { handleMessageAIConfig } from "./handlers/ai-config";
import * as cli from "./cli/ui";

// Import the authentication code from a separate module
import {
  printIntro,
  printAuthentication,
  printAuthenticated,
  printAuthenticationFailure,
  printOutro,
} from "./cli/ui"; // Replace "authe" with the actual module name

// Handles message
async function handleIncomingMessage(message: Message) {
  const messageString = message.body;

  if (!config.prefixEnabled) {
    // GPT (only <prompt>)
    await handleMessageGPT(message, messageString);
    return;
  }

  // GPT (!gpt <prompt>)
  if (startsWithIgnoreCase(messageString, config.gptPrefix)) {
    const prompt = messageString.substring(config.gptPrefix.length + 1);
    await handleMessageGPT(message, prompt);
    return;
  }

  // DALLE (!dalle <prompt>)
  if (startsWithIgnoreCase(messageString, config.dallePrefix)) {
    const prompt = messageString.substring(config.dallePrefix.length + 1);
    await handleMessageDALLE(message, prompt);
    return;
  }

  // AiConfig (!config <args>)
  if (startsWithIgnoreCase(messageString, config.aiConfigPrefix)) {
    const prompt = messageString.substring(config.aiConfigPrefix.length + 1);
    await handleMessageAIConfig(message, prompt);
    return;
  }
}

// Entrypoint
const start = async () => {
  printIntro();

  // WhatsApp Client
  const client = new Client({
    puppeteer: {
      args: ["--no-sandbox"],
    },
    authStrategy: new LocalAuth({
      clientId: undefined,
      dataPath: constants.sessionPath,
    }),
  });

  // WhatsApp auth
  client.on(Events.QR_RECEIVED, (qr: string) => {
    qrcode.generate(qr, { small: true }, (qrcode: string) => {
      printAuthentication("QRCode", qrcode);
    });
  });

  // WhatsApp loading
  client.on(Events.LOADING_SCREEN, (percent) => {
    if (percent == "0") {
      cli.printLoading();
    }
  });

  client.on(Events.AUTHENTICATED, () => {
    printAuthenticated();
  });

  client.on(Events.AUTHENTICATION_FAILURE, () => {
    printAuthenticationFailure();
  });

  // WhatsApp ready
  client.on(Events.READY, () => {
    printOutro();
  });

  // WhatsApp message
  client.on(Events.MESSAGE_RECEIVED, async (message: any) => {
    // Ignore if message is from status broadcast
    if (message.from == constants.statusBroadcast) return;

    // Ignore if message is empty or media
    if (message.body.length == 0) return;
    if (message.hasMedia) return;

    // Ignore if it's a quoted message, (e.g. GPT reply)
    if (message.hasQuotedMsg) return;

    await handleIncomingMessage(message);
  });

  // Reply to own message
  client.on(Events.MESSAGE_CREATE, async (message: Message) => {
    // Ignore if message is from status broadcast
    if (message.from == constants.statusBroadcast) return;

    // Ignore if message is empty or media
    if (message.body.length == 0) return;
    if (message.hasMedia) return;

    // Ignore if it's a quoted message, (e.g. GPT reply)
    if (message.hasQuotedMsg) return;

    // Ignore if it's not from me
    if (!message.fromMe) return;

    await handleIncomingMessage(message);
  });

  // WhatsApp initialization
  client.initialize();
};

start();