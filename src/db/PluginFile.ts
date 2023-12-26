import mongoose from "mongoose";

const PluginSchema = new mongoose.Schema({
  plugin: { type: String, required: true },
  path: { type: String, required: true },
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const PluginFileModel = mongoose.model("PluginFile", PluginSchema);
export const getPluginFileById = (id: string) =>
  PluginFileModel.findOne({ _id: id });
export const getPluginFileByName = (name: string) =>
  PluginFileModel.findOne({ name });
export const deletePluginFileById = (id: string) =>
  PluginFileModel.deleteOne({ _id: id });

export const createPluginFile = (values: Record<string, any>) =>
  new PluginFileModel(values).save().then((plugin) => plugin.toObject());
