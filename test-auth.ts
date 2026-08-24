import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  projectId: config.projectId
});

async function test() {
  try {
    // We don't have a real token, but we can check if getAuth() throws immediately
    const auth = getAuth();
    console.log('Auth initialized');
    // Try to verify a fake token, it should fail with "auth/argument-error" or similar, NOT permission denied
    await auth.verifyIdToken('fake-token');
  } catch(e) {
    console.log('Error (expected if fake token):', e);
  }
}
test();
