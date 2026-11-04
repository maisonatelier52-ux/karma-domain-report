import mongoose from 'mongoose';

const DomainSchema = new mongoose.Schema(
  {
    domainName: { type: String, index: true }, // e.g. "morenews.org" (derived from domainLink)
    domainLink: { type: String, required: true, trim: true },
    domainLive: { type: Boolean, required: true },
    doneBy: { type: String, required: true, trim: true, index: true },
    clientArticles: { type: [String], default: [] },
    vercelLink: { type: String, default: '', trim: true },
    githubLink: { type: String, default: '', trim: true },
    searchConsoleLink: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Domain || mongoose.model('Domain', DomainSchema);
