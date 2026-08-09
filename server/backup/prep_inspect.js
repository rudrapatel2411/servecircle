import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { EJSON } from 'bson';

async function performPhase5Prep() {
  console.log('=== STEP 1: LOCAL DATABASE READ-ONLY INSPECTION ===');
  await mongoose.connect('mongodb://localhost:27017/servecircle');
  const db = mongoose.connection.db;
  console.log('Connected to Local DB:', db.databaseName);

  const rawCollections = await db.listCollections().toArray();
  console.log('Detected Collections Count:', rawCollections.length);

  const inventory = [];

  for (const c of rawCollections) {
    const colName = c.name;
    const count = await db.collection(colName).countDocuments();
    const indexes = await db.collection(colName).indexes();
    const sample = await db.collection(colName).findOne();

    inventory.push({
      colName,
      count,
      indexes: indexes.map(i => ({ name: i.name, key: i.key, unique: !!i.unique, sparse: !!i.sparse })),
      sampleKeys: sample ? Object.keys(sample) : []
    });
  }

  console.log('\n=== STEP 2: CURRENT MODEL INSPECTION ===');
  const modelsDir = path.resolve('models');
  const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
  console.log('Found Mongoose Model Files:', modelFiles.length);

  const modelMap = {};
  for (const file of modelFiles) {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const modelMatch = content.match(/mongoose\.model\(['"](\w+)['"]/);
    const modelName = modelMatch ? modelMatch[1] : file.replace('.js', '');
    modelMap[modelName] = { file, contentLength: content.length };
  }

  console.log('\n=== STEP 3 & 4: FRESH EJSON BACKUP & VERIFICATION ===');
  const backupDir = path.resolve('backup/local_db_backup');
  fs.mkdirSync(backupDir, { recursive: true });
  const manifest = { timestamp: new Date().toISOString(), dbName: db.databaseName, collections: {} };

  let totalDocs = 0;
  for (const item of inventory) {
    const docs = await db.collection(item.colName).find({}).toArray();
    const indexes = await db.collection(item.colName).indexes();

    const filePath = path.join(backupDir, item.colName + '.ejson');
    const indexFilePath = path.join(backupDir, item.colName + '.indexes.json');

    fs.writeFileSync(filePath, EJSON.stringify(docs, null, 2));
    fs.writeFileSync(indexFilePath, JSON.stringify(indexes, null, 2));

    manifest.collections[item.colName] = { count: docs.length, file: filePath, indexesFile: indexFilePath };
    totalDocs += docs.length;
  }
  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Verify backup
  let verifyErrors = 0;
  for (const [cName, info] of Object.entries(manifest.collections)) {
    const readDocs = EJSON.parse(fs.readFileSync(info.file, 'utf8'));
    if (readDocs.length !== info.count) {
      console.error('BACKUP VERIFY MISMATCH for', cName, 'Expected:', info.count, 'Got:', readDocs.length);
      verifyErrors++;
    }
  }

  if (verifyErrors === 0) {
    console.log('✅ Local Backup Verified Successfully! Total collections:', inventory.length, '| Total docs:', totalDocs);
  } else {
    console.error('❌ Backup Verification Failed!');
    process.exit(1);
  }

  console.log('\n=== STEP 5 & 6: INVENTORY & DEPENDENCY ANALYSIS ===');
  console.log(JSON.stringify(inventory, null, 2));

  await mongoose.disconnect();
  console.log('\nDisconnected from Local DB cleanly.');
}

performPhase5Prep().catch(err => { console.error('Preparation Error:', err); process.exit(1); });
