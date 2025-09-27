const algosdk = require('algosdk');

// Generate a new account
const account = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

console.log('=== NEW ALGORAND ACCOUNT ===');
console.log('Address:', account.addr);
console.log('Mnemonic:', mnemonic);
console.log('================================');

// Save to a temporary file for reference
const fs = require('fs');
fs.writeFileSync('.new-account-info.txt', `Address: ${account.addr}\nMnemonic: ${mnemonic}\n`);
console.log('\nAccount info saved to .new-account-info.txt (remember to delete after use for security)');