module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    await db.collection('User').updateMany({}, { $set: { isDelinquentDues: false } })
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    await db.collection('User').updateMany({}, { $unset: { isDelinquentDues: null } })

    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
