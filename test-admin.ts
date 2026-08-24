import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  projectId: config.projectId
});

async function test() {
  try {
    const db = getFirestore();
    db.settings({ databaseId: config.firestoreDatabaseId });
    const cols = await db.listCollections();
    console.log('Success! Collections:', cols.map(c => c.id));
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
