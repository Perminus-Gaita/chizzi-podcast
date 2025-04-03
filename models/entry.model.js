import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  profilePicture: String,
  username: String,
  platform: String,
  linkToProfile: String,
  linkToPost: String,
  tags: [String],
  progress: {
    tagRiccobeatz: Boolean,
    commentPreferedPackages: Boolean,
    tag3Artist: Boolean,
    dropBars: Boolean,
    recordYourself: Boolean,
  },
  votes: [String],
  giveawayId: { type: mongoose.Schema.Types.ObjectId },
});
const entryModel =
mongoose?.models?.Entry || mongoose.model("Entry", EntrySchema);

export default entryModel;
