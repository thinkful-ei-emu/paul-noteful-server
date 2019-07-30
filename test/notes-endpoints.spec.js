const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers.js')



describe('Notes Endpoints', function () {
  let db;
  let testFolders = helpers.makeTestFolders();
  let testNotes = helpers.makeTestNotes();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    app.set('db', db);
  });

  /* const cleanNotes = () => db('notes').truncate().then(()=>db('folders').truncate()); */
  before('clean the table', ()=>helpers.cleanTables(db));
  afterEach('clean the table', ()=> helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  describe('XSS attack notes, in various ways',()=>{
    const malBook={
      id:'2252a2b2-b296-4912-b621-a6f2a4db4ac9',
      name:'Naughty naughty very naughty <script>alert("xss");</script>',
      content:'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
      folderid: testFolders[0].id
    };
    beforeEach('insert malicious notes', ()=>{
      return db.into('folders').insert([testFolders[0]])
        .then(()=>{
          return supertest(app)
            .post('/api/notes')
            .set('Authorization', 'bearer ' + process.env.API_TOKEN)
            .send(malBook);
          
          //db.into('notes').insert([malBook]);
        });
    });

    it('removes xss attack content from GET /api/notes/:id', ()=>{
      return supertest(app)
        .get('/api/notes/2252a2b2-b296-4912-b621-a6f2a4db4ac9')
        .set('Authorization', 'bearer ' + process.env.API_TOKEN)
        .expect(200)
        .expect(res=>{
          expect(res.body.name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
          expect(res.body.content).to.eql('Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.');
        });
    });

    it('removes xss attack content from GET /api/notes/', ()=>{
      return supertest(app)
        .get('/api/notes')
        .set('Authorization', 'bearer ' + process.env.API_TOKEN)
        .expect(200)
        .expect(res=>{
          expect(res.body[0].name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
          expect(res.body[0].content).to.eql('Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.');
        });
    });

    it('removes xss attack content from POST /api/notes', ()=>{
      return db('notes').where('id','=',malBook.id)
        .delete()
        .then(()=>{
          return supertest(app)
            .post('/api/notes')
            .set('Authorization', 'bearer ' + process.env.API_TOKEN)
            .send(malBook)
            .expect(201)
            .expect(res=>{
              expect(res.body.name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
              expect(res.body.content).to.eql('Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.');
            });
        });
    });



  });


  describe('DELETE /api/notes/:id', () => {
    context('Given there are articles in the database', () => {
      beforeEach('adding data to table', () => {
        return db.into('folders').insert(testFolders)
          .then(()=>
            db.into('notes')
              .insert(helpers.makeTestNotes())
          );
          
      });

      it('responds with 204 and removes the note', () => {
        const removeid = helpers.makeTestNotes()[0].id;
        let expected = helpers.makeTestNotes().filter(note => note.id !== removeid);
        expected= expected.map(note => {
          return {
            ...note,
            modified: note.modified.toISOString()
          };
        });
        return supertest(app)
          .delete(`/api/notes/${removeid}`)
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(204)
          .then(() =>{
            return supertest(app)
              .get('/api/notes')
              .set('Authorization', 'bearer ' + process.env.API_TOKEN)
              .expect(expected);
          });
      });

      it('responds with 404 if id is there', () => {
        const removeid = '2252a2b2-b296-4912-b621-a6f2a4db4ac9';
        return supertest(app)
          .delete(`/api/notes/${removeid}`)
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(404)
      });

    });
  });


  describe('POST /api/notes', () => {
    beforeEach('insert folders',()=>{
      return db.into('folders').insert(helpers.makeTestFolders());
    });
    it('creates a note, responding with 201 and checks if database has that note', () => {
      const newbook = {
        'id': '51c1abdb-2c50-4597-be66-42502cfab090',
        'name': 'Save the world',
        'folderid': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
        'content': 'Must do it someday, if not me, who else?',
        'modified': new Date('2019-07-30T00:27:02.000Z')
      };
      return supertest(app)
        .post('/api/notes')
        .send(newbook)
        .set('Authorization', 'bearer ' + process.env.API_TOKEN)
        .expect(201)
        .expect(res => {
          newbook.id = res.body.id;
          expect(res.body.id).to.eql(newbook.id);
          expect(res.body.name).to.eql(newbook.name);
          expect(res.body.folderid).to.eql(newbook.folderid);
          expect(res.body.content).to.eql(newbook.content);
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
          return db.select('*').where('id', '=', newbook.id);
        })
        .then(res => {
          expect(res.body.id).to.eql(newbook.id);
          expect(res.body.name).to.eql(newbook.name);
          expect(res.body.folderid).to.eql(newbook.folderid);
          expect(res.body.content).to.eql(newbook.content);
          return null;
        });

    });

    it('creates a note, responding with 201 and checks by GET /api/notes whether it\'s there', () => {
      const newbook = {
        'id': '51c1abdb-2c50-4597-be66-42502cfab090',
        'name': 'Save the world',
        'folderid': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
        'content': 'Must do it someday, if not me, who else?',
        'modified': new Date('2019-07-30T00:27:02.000Z')
      };
      return supertest(app)
        .post('/api/notes')
        .send(newbook)
        .set('Authorization', 'bearer ' + process.env.API_TOKEN)
        .expect(201)
        .expect(res => {
          newbook.id = res.body.id;
          expect(res.body.id).to.eql(newbook.id);
          expect(res.body.name).to.eql(newbook.name);
          expect(res.body.folderid).to.eql(newbook.folderid);
          expect(res.body.content).to.eql(newbook.content);
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
        })
        .then(postRes =>{
          return supertest(app)
            .get(`/api/notes/${newbook.id}`)
            .set('Authorization', 'bearer ' + process.env.API_TOKEN)
            .expect(postRes.body);
        });

    });

    const requiredFields = ['name', 'content', 'folderid'];
    requiredFields.forEach(field => {

      const newbook = {
        'id': '51c1abdb-2c50-4597-be66-42502cfab090',
        'name': 'Save the world',
        'folderid': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
        'content': 'Must do it someday, if not me, who else?',
        'modified': new Date('2019-07-30T00:27:02.000Z')
      };

      delete newbook[field];

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        return supertest(app)
          .post('/api/notes')
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .send(newbook)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  })

  describe('GET /api/notes', () => {
    context('without any data', () => {
      it('calling getAllItems() using /api/notes should give us back an empty array', () => {
        return supertest(app)
          .get('/api/notes')
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').that.has.lengthOf(0);
          });
      });

      it('getById() using /api/notes/:id should give us back 404 error', () => {
        return supertest(app)
          .get('/api/notes/1ad6d87c-1701-43c7-b64f-79aa04420d02')
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(404);
      });

    });
    context('with data', () => {
      beforeEach('adding data to table', () => {
        return db.into('folders').insert(helpers.makeTestFolders())
          .then(()=>{
            return db
            .into('notes')
            .insert(helpers.makeTestNotes());
          });
      });
      it('getAllItems() using /api/notes should give us back all notes', () => {
        return supertest(app)
          .get('/api/notes')
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(200, helpers.makeTestNotes().map(note=>{
            return  {
              ...note, 
              modified:note.modified.toISOString() 
            };
          }));
      });
      it('getById() using /api/notes/:id should give us back the object', () => {
        return supertest(app)
          .get(`/api/notes/${helpers.makeTestNotes()[0].id}`)
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(200, {
            ...helpers.makeTestNotes()[0],
            modified: helpers.makeTestNotes()[0].modified.toISOString()
          });
      });
    });

  });

});




