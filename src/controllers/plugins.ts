import express from "express";
import fs from "fs";
import {
  createPlugin,
  deletePluginById,
  fetchPlugin,
  fetchPlugins,
  getPluginsByCategory,
  getPluginsByIDandCategory,
} from "../db/Plugins";
import {
  createPluginFile,
  deletePluginFileById,
  getPluginFileByName,
} from "../db/PluginFile";
import { Response } from "../helpers/response";
import { createProduct, editProduct } from "../helpers/stripe";
import { Plugin } from "../helpers/models";
import { getUserFromSession } from "../db/Users";

export const registerPlugin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (req.file) {
      let { name, description, image, price } = req.body;
      if (!name || !price)
        return res
          .status(400)
          .send(new Response("error", "Nome e preço são obrigatórios."));

      const file = req.file;

      const plugin = await createPlugin({
        name,
        description,
        image,
        price,
        file: file.filename,
      });

      createProduct(
        new Plugin(
          plugin?._id.toString(),
          plugin?.name,
          plugin?.price,
          1,
          plugin?.image
        )
      );

      await createPluginFile({
        plugin: plugin._id,
        path: file.destination,
        name: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
      });

      return res
        .status(200)
        .send(new Response("success", "Plugin criado com sucesso."));
    } else {
      return res
        .status(400)
        .send(new Response("error", "Arquivo do plugin não encontrado."));
    }
  } catch (error) {
    return res
      .status(500)
      .send(new Response("error", "Não foi possível registrar o plugin"));
  }
};

export const getAllPlugin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let plugins = await fetchPlugins();

    return res.status(200).json(plugins).end();
  } catch (error) {
    return res
      .status(500)
      .send(new Response("error", "Não foi possível encontrar os plugins"));
  }
};

export const getPluginWithCategory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let category = req.params["category"];

    if (!category) return res.sendStatus(400);
    let plugins = await getPluginsByCategory(category.toUpperCase());

    return res.status(200).json(plugins).end();
  } catch (error) {
    return res
      .status(500)
      .send(new Response("error", "Não foi possível encontrar o plugin"));
  }
};

export const updatePlugin = async (
  req: express.Request,
  res: express.Response
) => {
  let { id, update } = req.body;
  if (!id) return res.sendStatus(400);

  let plugin = await fetchPlugin(id);

  if (!plugin) return res.sendStatus(404);
  update.file = plugin.file;

  plugin
    .updateOne(update)
    .then((e) => {
      editProduct(
        new Plugin(
          plugin?._id.toString(),
          plugin?.name,
          plugin?.price,
          1,
          plugin?.image
        )
      );
      return res
        .status(200)
        .send(new Response("success", "Plugin atualizado com sucesso"));
    })
    .catch((e) => {
      return res
        .status(500)
        .send(new Response("error", "Não foi possível atualizar os plugins"));
    });
};
export const getUserPlugins = async (
  req: express.Request,
  res: express.Response
) => {
  let sessionToken = req?.cookies["g-auth"];
  if (!sessionToken) return res.sendStatus(401);

  let user = await getUserFromSession(sessionToken).select("+plugins");
  if (!user) return res.sendStatus(401);

  let plugins = [];

  for (const id of user.plugins) {
    let plugin = await fetchPlugin(id.toString());
    plugins.push(plugin);
  }

  return res.status(200).json(plugins);
};

export const getUserPluginsWithCategory = async (
  req: express.Request,
  res: express.Response
) => {
  let sessionToken = req?.cookies["g-auth"];
  if (!sessionToken) return res.sendStatus(401);
  let category = req.params["category"];

  let user = await getUserFromSession(sessionToken).select("+plugins");
  if (!user) return res.sendStatus(401);

  let plugins = [];

  for (const id of user.plugins) {
    let plugin = await getPluginsByIDandCategory(id.toString(), category);
    plugins.push(plugin);
  }

  return res.status(200).json(plugins);
};
export const deletePlugin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let pluginId: string = req.params["id"];
    let plugin = await fetchPlugin(pluginId).select("+file");
    if (!plugin)
      return res
        .status(404)
        .send(new Response("error", "Plugin não encontrado."));

    let pluginFile = await getPluginFileByName(plugin.file);

    if (!pluginFile)
      console.log(`Arquivo do plugin ${pluginId} não encontrado.`);

    let file = pluginFile?.path + pluginFile?.name;

    fs.unlink(file, (err) => {
      if (err)
        console.log(
          `Não foi possível deletar o arquivo do plugin ${pluginFile}, ${err}`
        );
    });

    await deletePluginFileById(pluginFile?._id);
    await deletePluginById(pluginId);

    res
      .status(201)
      .send(new Response("success", "Plugin deletado com sucesso."));
  } catch (error) {
    return res.status(500).send(new Response("error", `${error}`));
  }
};

export const downloadPlugin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let pluginId: string = req.params["id"];

    let plugin = await fetchPlugin(pluginId).select("+file");

    if (!plugin)
      return res
        .status(404)
        .send(new Response("error", "Plugin não encontrado."));
    let pluginFile = await getPluginFileByName(plugin?.file);
    let path = pluginFile?.path + pluginFile?.name;

    if (plugin.price > 0) {
      let sessionToken = req?.cookies["g-auth"];
      if (!sessionToken) return res.sendStatus(401);

      let user = await getUserFromSession(sessionToken).select("+plugins");
      if (!user) return res.sendStatus(401);

      if (!user.plugins.includes(pluginId)) return res.sendStatus(401);
      await plugin.updateOne({ downloads: plugin.downloads + 1 });

      return res.download(path, pluginFile?.originalName);
    } else {
      await plugin.updateOne({ downloads: plugin.downloads + 1 });

      return res.download(path, pluginFile?.originalName);
    }
  } catch (error) {
    console.log(error);
    return res.status(404).send(new Response("error", "Plugin não localizado"));
  }
};
