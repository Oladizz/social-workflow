import * as admin from 'firebase-admin';

let _db: admin.firestore.Firestore | null = null;
export function getDb() {
  if (!_db) {
    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId: 'my-portfolio-7cd72' });
    }
    _db = admin.firestore();
  }
  return _db;
}
