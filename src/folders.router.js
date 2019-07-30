/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const foldersRouter = express.Router();
const foldersService = require('./foldersService');
const logger = require('./logger');
const uuid = require('uuid/v4');
const xss = require('xss');

foldersRouter
  .route('/')
  .get((req, res, next ) => {
    const db = req.app.get('db');
    foldersService.getAllItems(db)
      .then((folders)=>{
        res.json(folders.map(cleanUp));
      })
      .catch(next);
  })
  .post(express.json(), (req, res, next) => {
    const db = req.app.get('db');
    const { name,id } = req.body;
    const required = { name };
    for(const [key,value] of Object.entries(required)){
      if(value == null){
        logger.error(`${key} is required`);
        return res.status(400).send({ error: { message: `Missing '${key}' in request body` }});
      }
    }
    const couldExist={id};
    Object.keys(couldExist).forEach((key)=>{
      if(couldExist[key]){
        required[key]=couldExist[key];
      }
    });
    foldersService.insertItem(db, required)
      .then(insertedB => {
        logger.info(`folder with id ${insertedB.id} created`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${insertedB.id}`))
          .json(cleanUp(insertedB));
      })
      .catch(next);

  });

function cleanUp(folder) {
  return {
    id: folder.id,
    name: xss(folder.name),
  };
}

module.exports = foldersRouter;