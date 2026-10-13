#!/usr/bin/env node
// Générer une fois, puis conserver ces clés dans les variables d'environnement du serveur.
import { generateKeyPairSync } from 'node:crypto';

const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const jwk = privateKey.export({ format: 'jwk' });
const publicKey = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]);
console.log(`APP_PUSH_PUBLIC_KEY=${publicKey.toString('base64url')}`);
console.log(`APP_PUSH_PRIVATE_KEY=${jwk.d}`);
console.log('APP_PUSH_SUBJECT=mailto:organisateur@example.org');
