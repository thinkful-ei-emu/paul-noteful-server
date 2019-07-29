/* eslint-disable quotes */
const path = require('path');
const express = require('express');
const notesRouter = express.Router();
const notesService = require('./notesService');
const logger = require('./logger');
const uuid = require('uuid/v4');
const { isWebUri } = require('valid-url');
const xss=require('xss');

notesRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db');
    notesService.getAllItems(db)
      .then(notes => {
        res.json(notes.map(note=>cleanUp(note)));
      })
      .catch(next);
  })
  .post(express.json(), (req, res,next) => {
    //more validation needed
    const db = req.app.get('db');
    const { name, content, folderId } = req.body;
    const required={name, content, folderid:folderId};
    Object.keys(required).forEach((nec)=>{
      if(!required[nec]){
        logger.error(`${nec} is required`);
        return res
          .status(400)
          .json({
            error: { message: `Missing '${nec}' in request body` }
          });
      }
    });

    notesService.insertItem(db, required)
      .then(insertedB => {
        logger.info(`note with id ${insertedB.id} created`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl,`/${insertedB.id}`))
          .json(cleanUp(insertedB));
      })
      .catch(next);
  });

notesRouter
  .route('/:id')
  .all((req, res, next) => {
    notesService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: 'note doesn\'t exist' }
          });
        }
        res.note = note; 
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(cleanUp(res.note));
  })
  .delete((req, res,next) => {
    const db = req.app.get('db');
    const id = req.params.id;
    notesService.deleteById(db, id)
      .then(actual => {
        logger.info(`List with id ${id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })
  /* .patch(express.json(),(req,res,next)=>{
    const db = req.app.get('db');
    const { title, url, description, rating } = req.body;
    const updatednote={ title, url, description, rating };
    if(Object.values(updatednote).filter(Boolean).length===0){
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'url', 'rating' or 'description'`
        }
      });
    }
    notesService.updateById(db,req.params.id,updatednote)
      .then(numRowsAffected =>{
        res.status(204).end();
      })
      .catch(next);
  }) */;


function cleanUp(note){
  return{
    id:note.id,
    name:xss(note.name),
    folderId:note.folderid,
    content:xss(note.content),
    modified:xss(note.modified)
  };
}



module.exports = notesRouter;