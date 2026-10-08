import * as ca from "./languages/ca.json";
import * as cs from "./languages/cs.json";
import * as de from "./languages/de.json";
import * as dk from "./languages/dk.json";
import * as en from "./languages/en.json";
import * as es from "./languages/es.json";
import * as fi from "./languages/fi.json";
import * as fr from "./languages/fr.json";
import * as hi from "./languages/hi-IN.json";
import * as it from "./languages/it.json";
import * as nl from "./languages/nl.json";
import * as pl from "./languages/pl.json";
import * as ptBR from "./languages/pt-BR.json";
import * as pt from "./languages/pt-PT.json";
import * as ru from "./languages/ru.json";
import * as sk from "./languages/sk.json";
import * as sv from "./languages/sv.json";
import * as ua from "./languages/ua.json";

const languages: Record<string, unknown> = {
  ca,
  cs,
  en,
  de,
  dk,
  pt,
  pt_BR: ptBR,
  es,
  nl,
  it,
  fr,
  ru,
  fi,
  pl,
  sk,
  sv,
  hi,
  ua,
};

const defaultLang = "en";

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    return key
      .split(".")
      .reduce((o, i) => (o as Record<string, unknown>)[i], languages[lang]) as string;
  } catch {
    return undefined;
  }
}

/* HA only writes selectedLanguage to localStorage when the language was picked in this browser,
   otherwise the language lives in the user profile, so fall back to the running frontend */
const getLanguage = (): string => {
  const stored = localStorage.getItem("selectedLanguage");
  if (stored) return stored;
  const hass = (document.querySelector("home-assistant") as any)?.hass;
  return hass?.locale?.language || hass?.language || navigator.language || defaultLang;
};

export function setupCustomlocalize(key: string) {
  const lang = getLanguage().replace(/['"]+/g, "").replace("-", "_");
  const baseLang = lang.split("_")[0];

  let translated = getTranslatedString(key, lang);
  if (!translated && baseLang) translated = getTranslatedString(key, baseLang);
  if (!translated) translated = getTranslatedString(key, defaultLang);
  return translated ?? key;
}

export default setupCustomlocalize;
