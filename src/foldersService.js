const foldersService={
  getAllItems(db){
    return db('folders')
      .select('*');
  },
  insertItem(db,newItem){
    return db('folders')
      .insert(newItem)
      .returning('*')
      .then(rows=>rows[0]);
  },
  getById(db,id){
    return db('folders')
      .select('*')
      .where('id','=',id)
      .first();
  },
  deleteById(db,id){
    return db('folders')
      .where('id','=',id)
      .delete();
  },
  updateById(db,id,uItem){
    return db('folders')
      .where('id','=',id)
      .update(uItem);
  }
  

};


module.exports=foldersService;