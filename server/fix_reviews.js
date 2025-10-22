const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../db/reviews.sqlite');

db.serialize(() => {
  // Update ownership for reviews 8 and 13
  db.run("UPDATE reviews SET ownerId=? WHERE id IN (8,13)", ['bgmgaming09@gmail.com'], (err) => {
    if (err) {
      console.error('Error updating ownership:', err);
    } else {
      console.log('✅ Ownership mis à jour pour reviews 8 et 13');
    }
  });

  // Update review 12: make it public and not draft
  db.run("UPDATE reviews SET isDraft=0, isPrivate=0 WHERE id=12", (err) => {
    if (err) {
      console.error('Error updating review 12:', err);
    } else {
      console.log('✅ Review 12 est maintenant publique et non-draft');
    }
  });

  // Show final state
  setTimeout(() => {
    db.all("SELECT id, name, ownerId, isDraft, isPrivate FROM reviews", (err, rows) => {
      if (err) {
        console.error('Error fetching reviews:', err);
      } else {
        console.log('\n📋 État final des reviews:');
        console.log('ID | Name | Owner | Draft | Private');
        console.log('---|------|-------|-------|--------');
        rows.forEach(r => {
          console.log(`${r.id} | ${r.name} | ${r.ownerId || 'NULL'} | ${r.isDraft} | ${r.isPrivate}`);
        });
      }
      db.close();
    });
  }, 500);
});
