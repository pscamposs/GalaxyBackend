import mongoose, { ObjectId, Schema } from "mongoose";

const PluginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: {
    type: String,
    required: false,

    default:
      "https://media.forgecdn.net/avatars/thumbnails/989/233/256/256/638501716214297047.png",
  },
  description: {
    type: String,
    require: false,
    default: "<h1>Criar Descrição</h1>",
  },
  category: { type: String, required: true, default: "GERAL" },
  price: { type: Number, required: true },
  file: { type: String, required: true },
  downloads: { type: Number, required: true, default: 0 },
});

export const PluginModel = mongoose.model("Plugin", PluginSchema);
export const fetchPlugins = () => PluginModel.find();
export const getPluginsByIds = (ids: string[]) =>
  PluginModel.find({ _id: { $in: ids } });
export const fetchPlugin = (id: string) => PluginModel.findOne({ _id: id });
export const getPluginsByCategory = (category: string) =>
  PluginModel.find({ category });
export const getPluginsByIDandCategory = (id: string, category: string) =>
  PluginModel.find({ _id: id, category });
export const deletePluginById = (id: string) =>
  PluginModel.deleteOne({ _id: id });

export const createPlugin = (values: Record<string, any>) =>
  new PluginModel(values).save().then((plugin) => plugin.toObject());
