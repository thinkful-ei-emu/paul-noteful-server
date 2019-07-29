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
    const { name } = req.body;
    const required = { name };
    Object.keys(required).forEach((nec) => {
      if (!required[nec]) {
        logger.error(`${nec} is required`);
        return res
          .status(400)
          .json({
            error: { message: `Missing '${nec}' in request body` }
          });
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