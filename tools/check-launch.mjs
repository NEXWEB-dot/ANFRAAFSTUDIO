import { productionConfig } from './production-config.mjs';
try {
  productionConfig(process.env);
  console.log('Public settings pass. Live credentials, catalog, policies and staging order checks are still required.');
} catch (error) {
  console.error(`NOT READY: public production settings are incomplete.\n${error.message}`);
  process.exitCode = 1;
}
