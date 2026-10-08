import { setupLogger } from "./logging";

interface RegisterCardParams {
  type: string;
  name: string;
  description: string;
  version: string;
  documentationURL?: string;
}
export function registerCustomCard(params: RegisterCardParams) {
  const { documentationURL, ...card } = params;
  const readmeURL = documentationURL ?? `https://github.com/flixlix/${params.type}`;
  const windowWithCards = window as unknown as Window & {
    customCards: unknown[];
  };
  windowWithCards.customCards = windowWithCards.customCards || [];

  windowWithCards.customCards.push({
    ...card,
    preview: true,
    documentationURL: readmeURL,
  });

  setupLogger({
    name: params.name,
    version: params.version,
    readme: readmeURL,
  });
}
