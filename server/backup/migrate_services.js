import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EJSON } from 'bson';
dotenv.config();

async function migrateServicesCollection() {
  console.log('=== COLLECTION #1: SERVICES MIGRATION ===');

  const localUri = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';
  const atlasUri = process.env.MONGODB_ATLAS_URI;

  if (!atlasUri) {
    throw new Error('MONGODB_ATLAS_URI not set in environment.');
  }

  // 1. Connect to LOCAL & READ raw documents and indexes
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const localDb = localConn.db;
  const localDocs = await localDb.collection('services').find({}).toArray();
  const localIndexes = await localDb.collection('services').indexes();
  const localCount = localDocs.length;
  console.log(`[LOCAL] Read ${localCount} documents and ${localIndexes.length} indexes from 'services'`);

  // 2. Connect to ATLAS & Insert exact documents
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  const atlasDb = atlasConn.db;
  const atlasCol = atlasDb.collection('services');

  // Check if Atlas collection already has documents
  const existingAtlasCount = await atlasCol.countDocuments();
  if (existingAtlasCount > 0) {
    console.log(`[ATLAS Warning] 'services' collection already contains ${existingAtlasCount} documents.`);
  }

  // Insert documents exactly if not present
  if (localCount > 0) {
    // Delete any existing documents in Atlas services to ensure 1:1 clean state if re-run
    await atlasCol.deleteMany({});
    await atlasCol.insertMany(localDocs);
    console.log(`[ATLAS] Inserted ${localDocs.length} exact documents into 'services'`);
  }

  // 3. Recreate Indexes on Atlas
  console.log('[ATLAS] Recreating indexes on Atlas services collection...');
  for (const idx of localIndexes) {
    if (idx.name === '_id_') continue; // Skip default _id_ index
    const options = { name: idx.name };
    if (idx.unique) options.unique = true;
    if (idx.sparse) options.sparse = true;
    if (idx.weights) options.weights = idx.weights;
    if (idx.default_language) options.default_language = idx.default_language;

    try {
      await atlasCol.createIndex(idx.key, options);
      console.log(`   - Created index: ${idx.name}`);
    } catch (err) {
      console.warn(`   - Warning creating index ${idx.name}:`, err.message);
    }
  }

  // 4. VERIFICATION
  const atlasCount = await atlasCol.countDocuments();
  const atlasIndexes = await atlasCol.indexes();
  const atlasDocs = await atlasCol.find({}).toArray();

  console.log('\n=== VERIFICATION RESULTS FOR SERVICES ===');
  console.log(`Local Count: ${localCount} | Atlas Count: ${atlasCount}`);
  console.log(`Local Index Count: ${localIndexes.length} | Atlas Index Count: ${atlasIndexes.length}`);

  let mismatches = 0;
  if (localCount !== atlasCount) {
    console.error('❌ COUNT MISMATCH!');
    mismatches++;
  }

  // Document-by-document comparison using EJSON stringification
  for (let i = 0; i < localDocs.length; i++) {
    const localDocEjson = EJSON.stringify(localDocs[i]);
    const atlasDoc = atlasDocs.find(d => String(d._id) === String(localDocs[i]._id));
    
    if (!atlasDoc) {
      console.error(`❌ Document missing in Atlas! _id: ${localDocs[i]._id}`);
      mismatches++;
      continue;
    }

    const atlasDocEjson = EJSON.stringify(atlasDoc);
    if (localDocEjson !== atlasDocEjson) {
      console.error(`❌ Content Mismatch for _id ${localDocs[i]._id}!`);
      console.error('Local:', localDocEjson);
      console.error('Atlas:', atlasDocEjson);
      mismatches++;
    }
  }

  await localConn.close();
  await atlasConn.close();

  if (mismatches === 0) {
    console.log('\n✅ VERIFICATION PASSED: LOCAL services == ATLAS services (100% Match)');
  } else {
    console.error(`\n❌ VERIFICATION FAILED with ${mismatches} issues.`);
    process.exit(1);
  }
}

migrateServicesCollection().catch(err => {
  console.error('Migration Error:', err);
  process.exit(1);
});
