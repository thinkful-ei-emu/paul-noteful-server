const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers.js');

describe('Folders Endpoints', function () {
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

  before('clean the table', () => helpers.cleanTables(db));
  afterEach('clean the table', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  describe('GET', () => {
    context('has data', () => {
      beforeEach('inserting folders into db', () => {
        return db.into('folders').insert(testFolders);
      });
      it('returns all folders with the endpoint, GET /api/folders', () => {
        return supertest(app)
          .get('/api/folders')
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .expect(200, testFolders);
      });
    });
  });

  describe('POST', () => {
    it('adds a folder with the endpoint, POST /api/folders', () => {
      return supertest(app)
        .post('/api/folders')
        .set('Authorization', 'bearer ' + process.env.API_TOKEN)
        .send(testFolders[0])
        .expect(res=>{
          expect(res.body.name).to.eql(testFolders[0].name);
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        });
    });

    const requiredFields=['name'];
    requiredFields.forEach(field=>{
      const newFolder={
        id:'1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
        name:'test'
      };
      delete newFolder[field];
      it(`responds with 400 and an error message when the '${field}' is missing`,()=>{
        return supertest(app)
          .post('/api/folders')
          .set('Authorization', 'bearer ' + process.env.API_TOKEN)
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

  });


});