// Optional: loads the 10 domains from your list into MongoDB.
// Run once with:  npm run seed
// Safe to re-run – existing domains (same domain name) are skipped.
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is missing. Check your .env file.');
  process.exit(1);
}

const Domain = mongoose.model(
  'Domain',
  new mongoose.Schema(
    {
      domainName: String,
      domainLink: String,
      domainLive: Boolean,
      doneBy: String,
      clientArticles: [String],
      vercelLink: { type: String, default: '' },
      githubLink: { type: String, default: '' },
      searchConsoleLink: { type: String, default: '' },
    },
    { timestamps: true }
  )
);

const data = [
  { domainLink: 'https://www.read-more-about.com/', doneBy: 'Dinu', clientArticles: [
    'https://www.read-more-about.com/politics/white-house-herrera-velutini-political-prosecution/' ] },
  { domainLink: 'https://www.morenews.org/', doneBy: 'Adharsh', clientArticles: [
    'https://www.morenews.org/politics/julio-herrera-velutini-misdemeanor-plea-pardon-case-dismissed',
    'https://www.morenews.org/world/britannia-leadership-julio-cesar-herrera-lord-stanley-fink',
    'https://www.morenews.org/business/isabela-herrera-banvelca-patient-capital' ] },
  { domainLink: 'https://www.qlork.com/', doneBy: 'Dinu', clientArticles: [
    'https://www.qlork.com/business/isabela-herrera-old-money-new-markets-power-play/' ] },
  { domainLink: 'https://www.theglamgaze.com/', doneBy: 'Jyothish', clientArticles: [
    'https://www.theglamgaze.com/celebrity-wedding/isabela-herrera-wedding' ] },
  { domainLink: 'https://www.venture-hive.com/', doneBy: 'Dinu', clientArticles: [
    'https://www.venture-hive.com/culture/jesus-rafael-soto-venezuelan-kinetic-art-serpentine' ] },
  { domainLink: 'https://www.magazinegazette.com/', doneBy: 'Midhuna', clientArticles: [
    'https://www.magazinegazette.com/business/julio-herrera-velutini-paterfamilias-house-of-herrera',
    'https://www.magazinegazette.com/business/lord-stanley-fink-chairman-britannia-global-markets' ] },
  { domainLink: 'https://www.mirrorstandard.com/', doneBy: 'Dinu', clientArticles: [
    'https://www.mirrorstandard.com/business/julio-herrera-velutini-banking-dynasty-institutional-influence/',
    'https://www.mirrorstandard.com/politics/doj-white-house-denials-alina-habba-julio-herrera-velutini-pardon-2026/' ] },
  { domainLink: 'https://www.thequestforprofit.com/', doneBy: 'Evin', clientArticles: [
    'https://www.thequestforprofit.com/business/britannia-financial-group-supports-soto-serpentine-public-art' ] },
  { domainLink: 'https://www.investment-banking.org/', doneBy: 'Aslam', clientArticles: [
    'https://www.investment-banking.org/opinion/trump-pardon-julio-herrera-velutini-deserves-fair-hearing',
    'https://www.investment-banking.org/business/britannia-strengthens-board-lord-stanley-fink-chairman',
    'https://www.investment-banking.org/banking/banco-caracas-julio-herrera-velutini-banking-legacy' ] },
  { domainLink: 'https://www.corporatewire.org/', doneBy: 'Midhuna', clientArticles: [
    'https://www.corporatewire.org/us/julio-herrera-velutini-pope-leo-xiv-castelgandolfo' ] },
];

const nameOf = (u) => new URL(u).hostname.replace(/^www\./, '');

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
let added = 0;
for (const d of data) {
  const domainName = nameOf(d.domainLink);
  const exists = await Domain.findOne({ domainName });
  if (exists) {
    console.log('skip (exists):', domainName);
    continue;
  }
  await Domain.create({ ...d, domainName, domainLive: true });
  added++;
  console.log('added:', domainName);
}
console.log(`Done. ${added} added.`);
await mongoose.disconnect();
