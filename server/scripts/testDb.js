import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

async function check() {
  const atlasURI = process.env.MONGODB_ATLAS_URI;
  const localURI = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';

  let connected = false;
  if (atlasURI) {
    try {
      console.log('Connecting to Atlas...');
      await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Atlas connected:', mongoose.connection.name);
      connected = true;
    } catch (e) {
      console.log('⚠️ Atlas connection failed:', e.message);
    }
  }

  if (!connected) {
    try {
      console.log('Connecting to local MongoDB...');
      await mongoose.connect(localURI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Local MongoDB connected:', mongoose.connection.name);
      connected = true;
    } catch (e) {
      console.log('⚠️ Local MongoDB failed:', e.message);
    }
  }

  if (connected) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Existing collections:', collections.map(c => c.name));
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} docs`);
    }
    await mongoose.disconnect();
  }
}

check();
