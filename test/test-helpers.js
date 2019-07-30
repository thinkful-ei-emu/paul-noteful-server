function makeTestFolders() {
  return [

    {
      'id': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
      'name': 'Super'
    },
    {
      'id': 'f9dbe8ed-001f-47d4-bb9e-eaf4e26ab9f5',
      'name': 'Important'
    },
    {
      'id': 'ba73099b-5a03-4ab8-9866-230c6942db50',
      'name': 'Backlog'
    },
    {
      'id': '6ab30396-4986-43d1-890b-ce7b7fe5bf2b',
      'name': 'Tomorrow'
    }

  ];
}

function makeTestNotes() {
  return [
    {
      'id': '51c1abdb-2c50-4597-be66-42502cfab090',
      'name': 'Save the world',
      'folderid': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
      'content': 'Must do it someday, if not me, who else?',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '802549d4-281c-4193-bfb8-0f916776e19f',
      'name': 'Clean the house',
      'folderid': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
      'content': 'where is superman?',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '39b99be4-ac17-49df-90ea-56611d08f9bb',
      'name': 'Get my marriage certificate',
      'folderid': 'f9dbe8ed-001f-47d4-bb9e-eaf4e26ab9f5',
      'content': 'for taxes, it is why i got married anyway',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '57171a44-23db-4f4d-bca0-a096436534fb',
      'name': 'Pet my loved ones',
      'folderid': 'f9dbe8ed-001f-47d4-bb9e-eaf4e26ab9f5',
      'content': 'you always forget to do it',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '9eab0e79-98a8-406e-ac27-1da158fbec4a',
      'name': 'Get it on at the gym',
      'folderid': 'ba73099b-5a03-4ab8-9866-230c6942db50',
      'content': 'you know how it is',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '2782b1fa-40e7-4081-a7a5-0e3013e6290b',
      'name': 'Catch them All',
      'folderid': 'f9dbe8ed-001f-47d4-bb9e-eaf4e26ab9f5',
      'content': 'For nostalgia, I say, but very fun, I think',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '2a095782-cd72-4b5c-a12c-1e10105d2198',
      'name': 'Gotta stretch my legs',
      'folderid': '6ab30396-4986-43d1-890b-ce7b7fe5bf2b',
      'content': 'lorem ipsum..',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '280ed835-e9f0-4845-905d-1baaed404d5b',
      'name': 'Test',
      'folderid': '1d216f70-0ecf-4dd7-b987-2c08b8e8485e',
      'content': 'yeah so',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    },
    {
      'id': '605d38a2-6012-4ec9-9f36-df6aca8e132d',
      'name': 'Sample Note Name',
      'folderid': '6ab30396-4986-43d1-890b-ce7b7fe5bf2b',
      'content': 'lorem ipsum..',
      'modified': new Date('2019-07-30T00:27:02.000Z')
    }
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      notes,
      folders
      RESTART IDENTITY CASCADE`
  );
}
module.exports = {
  makeTestFolders,
  makeTestNotes,
  cleanTables,
};