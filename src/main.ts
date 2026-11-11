import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-angular';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

// The REST API from amplify/backend.ts is published under `custom.API`, which
// Amplify does not register on its own. The section is absent until the backend
// is deployed with that API, so it is read defensively.
type RestApis = Record<string, { endpoint: string; region: string }>;
const restApis = (outputs as typeof outputs & { custom?: { API?: RestApis } }).custom?.API;
if (restApis) {
  const config = Amplify.getConfig();
  Amplify.configure({ ...config, API: { ...config.API, REST: restApis } });
}

I18n.putVocabularies(translations);
I18n.setLanguage('es');

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
