const notesService={
  getAllItems(db){
    return db('notes')
      .select('*');
  },
  insertItem(db,newItem){
    return db
      .insert(newItem)
      .into('notes')
      .returning('*')
      .then(rows=>rows[0]);
  },
  getById(db,id){
    return db('notes')
      .select('*')
      .where('id','=',id)
      .first();
  },
  deleteById(db,id){
    return db('notes')
      .where('id','=',id)
      .delete();
  },
  updateById(db,id,uItem){
    return db('notes')
      .where('id','=',id)
      .update(uItem);
  }
  

};


module.exports=notesService;