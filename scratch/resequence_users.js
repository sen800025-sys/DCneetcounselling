const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

if (!key) {
  console.error("Error: SUPABASE_ANON_KEY is not defined in your environment/dotenv file.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function resequenceUsers() {
  try {
    console.log('1. Fetching all users from preference_maker_users...');
    const { data: users, error: usersErr } = await supabase
      .from('preference_maker_users')
      .select('*')
      .order('id', { ascending: true });

    if (usersErr) throw usersErr;
    console.log(`Found ${users.length} users.`);

    console.log('2. Fetching all lists from preference_maker_lists...');
    const { data: lists, error: listsErr } = await supabase
      .from('preference_maker_lists')
      .select('*')
      .order('id', { ascending: true });

    if (listsErr) throw listsErr;
    console.log(`Found ${lists.length} lists.`);

    if (users.length === 0) {
      console.log('No users to resequence. Exiting.');
      return;
    }

    // Map existing users to new continuous IDs
    const newUsers = users.map((user, index) => {
      return {
        ...user,
        id: index + 1 // continuous ID starting from 1
      };
    });

    console.log('3. Deleting all lists to clear references...');
    // Delete all records by targetting all ids greater than 0
    const { error: delListsErr } = await supabase
      .from('preference_maker_lists')
      .delete()
      .gt('id', 0);

    if (delListsErr) throw delListsErr;
    console.log('Deleted existing lists.');

    console.log('4. Deleting all users...');
    const { error: delUsersErr } = await supabase
      .from('preference_maker_users')
      .delete()
      .gt('id', 0);

    if (delUsersErr) throw delUsersErr;
    console.log('Deleted existing users.');

    console.log('5. Re-inserting users with continuous IDs...');
    // Insert all users
    const { data: insertedUsers, error: insUsersErr } = await supabase
      .from('preference_maker_users')
      .insert(newUsers)
      .select();

    if (insUsersErr) throw insUsersErr;
    console.log(`Successfully re-inserted ${insertedUsers.length} users with continuous IDs.`);

    if (lists.length > 0) {
      console.log('6. Re-inserting preference lists...');
      const { data: insertedLists, error: insListsErr } = await supabase
        .from('preference_maker_lists')
        .insert(lists)
        .select();

      if (insListsErr) throw insListsErr;
      console.log(`Successfully re-inserted ${insertedLists.length} lists.`);
    }

    console.log('✅ Done! Resequencing of preference_maker_users table completed successfully.');
  } catch (err) {
    console.error('❌ Error during resequencing:', err.message || err);
  }
}

resequenceUsers();
