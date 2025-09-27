import algosdk from 'algosdk';

// Generate a new dispenser account
const dispenserAccount = algosdk.generateAccount();
const dispenserMnemonic = algosdk.secretKeyToMnemonic(dispenserAccount.sk);

console.log('=== DISPENSER ACCOUNT (for funding deployer during deployment) ===');
console.log('Address:', dispenserAccount.addr);
console.log('Mnemonic:', dispenserMnemonic);
console.log('================================');

// Save to a temporary file for reference
import fs from 'fs';
fs.writeFileSync('.dispenser-account-info.txt', `Address: ${dispenserAccount.addr}\nMnemonic: ${dispenserMnemonic}\n`);
console.log('\nDispenser account info saved to .dispenser-account-info.txt (remember to delete after use for security)');