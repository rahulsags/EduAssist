// Script to check if the build deployed successfully
const https = require('https');

console.log('🔍 Checking deployment status...');

// Replace with your actual Vercel deployment URL
const url = 'https://eduassist-vercel.app';

https.get(url, (res) => {
  console.log(`🚀 Deployment status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Deployment successful! Your EduAssist platform is now live.');
    console.log(`Visit: ${url}`);
  } else {
    console.log('⚠️ Deployment might have issues. Check the Vercel dashboard.');
  }
}).on('error', (e) => {
  console.error('❌ Error checking deployment status:', e.message);
});
