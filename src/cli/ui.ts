import { intro, spinner, note, outro, text } from "@clack/prompts";
import color from "picocolors";

const s = spinner();

export const print = (text: string) => {
  console.log(color.green("◇") + "  " + text);
};

export const printIntro = () => {
  intro(color.bgCyan(color.white(" Whatsapp ChatGPT & DALL-E "));
  note(
    "A Whatsapp bot that uses OpenAI's ChatGPT and DALL-E to generate text and images from a prompt."
  );
  s.start("Starting");
};

const phoneNumber = "+254710881926"; // Define your phone number here

export const printAuthentication = (authMethod: "PhoneNumber", phoneNumber: string) => {
  s.stop("Client is ready!");

  if (authMethod === "PhoneNumber") {
    note("Use the phone number: " + phoneNumber); // Concatenate the message
    s.start("Logging in");
  }
};

export const printAuthenticated = () => {
  s.stop("Session started!");
  s.start("Opening session");
};

export const printAuthenticationFailure = () => {
  s.stop("Authentication failed!");
};

export const printOutro = () => {
  s.stop("Loaded!");
  outro("Whatsapp ChatGPT & DALLE is ready to use.");
};