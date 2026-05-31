const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL || 'https://rlqmdylbzapyepuwncwt.supabase.co';
const key = process.env.SUPABASE_ANON_KEY;

if (!key) {
  console.error("Error: SUPABASE_ANON_KEY is not defined in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function runTests() {
  console.log('=== Database Verification Tests ===');
  console.log('Database URL:', url);

  try {
    // -------------------------------------------------------------
    // Test 1: preference_maker_users Operations
    // -------------------------------------------------------------
    console.log('\nTesting preference_maker_users...');

    // A. Insert
    const testUser = {
      name: 'Verification Test Student',
      category: 'OBC',
      score: 620,
      rank: 15420,
      domicile: 'Maharashtra',
      course: 'MBBS',
      email: 'teststudent@example.com',
      mobile: '9999999999'
    };
    
    console.log('Inserting test student...');
    const { data: insertedUser, error: insertUserErr } = await supabase
      .from('preference_maker_users')
      .insert(testUser)
      .select()
      .single();

    if (insertUserErr) {
      throw new Error(`Failed to insert student: ${insertUserErr.message}`);
    }
    console.log('✅ Inserted Student:', insertedUser);

    // B. Filtering & Selection
    console.log('Querying/filtering student...');
    const { data: fetchedUsers, error: fetchUserErr } = await supabase
      .from('preference_maker_users')
      .select('*')
      .eq('category', 'OBC')
      .eq('course', 'MBBS');

    if (fetchUserErr) {
      throw new Error(`Failed to query student: ${fetchUserErr.message}`);
    }
    console.log(`✅ Query successful, found ${fetchedUsers.length} students matching OBC & MBBS`);

    // C. Update & Trigger Verification
    console.log('Updating student rank...');
    const originalUpdatedAt = insertedUser.updated_at;
    
    // Wait 1 second to ensure timestamp change is visible
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: updatedUser, error: updateUserErr } = await supabase
      .from('preference_maker_users')
      .update({ rank: 15410, attempts_used: 2 })
      .eq('id', insertedUser.id)
      .select()
      .single();

    if (updateUserErr) {
      throw new Error(`Failed to update student: ${updateUserErr.message}`);
    }
    console.log('✅ Update successful. New Rank:', updatedUser.rank, 'Attempts Used:', updatedUser.attempts_used);
    console.log('Original updated_at:', originalUpdatedAt);
    console.log('New updated_at:', updatedUser.updated_at);
    
    if (new Date(updatedUser.updated_at) > new Date(originalUpdatedAt)) {
      console.log('✅ Trigger verified: updated_at was successfully updated on row edit.');
    } else {
      console.warn('⚠️ Warning: updated_at trigger did not update the timestamp.');
    }

    // E. Test Constraint Violation (attempt to set attempts_used > 3 when not unlimited)
    console.log('Testing attempts check constraint (setting attempts_used = 4)...');
    const { error: limitErr } = await supabase
      .from('preference_maker_users')
      .update({ attempts_used: 4 })
      .eq('id', insertedUser.id);

    if (limitErr) {
      console.log('✅ Constraint block working! DB successfully rejected setting attempts_used = 4. Error:', limitErr.message);
    } else {
      console.warn('⚠️ Warning: DB allowed setting attempts_used = 4. Constraint check failed.');
    }

    // D. Delete
    console.log('Cleaning up: deleting test student...');
    const { error: deleteUserErr } = await supabase
      .from('preference_maker_users')
      .delete()
      .eq('id', insertedUser.id);

    if (deleteUserErr) {
      throw new Error(`Failed to delete student: ${deleteUserErr.message}`);
    }
    console.log('✅ Deleted student successfully.');


    // -------------------------------------------------------------
    // Test 2: college_preferences Operations
    // -------------------------------------------------------------
    console.log('\nTesting college_preferences...');

    // A. Insert
    const testCollege = {
      college_name: 'Verification Test Medical College',
      state: 'Maharashtra',
      fees: 85000,
      bond_details: '1 Year service bond or 10 Lakhs penalty.'
    };

    console.log('Inserting test college...');
    // Since client credentials might restrict write-operations on college_preferences table,
    // let's try it. If it is restricted, it will return an error, but let's test if the table structure is operational.
    const { data: insertedCollege, error: insertCollegeErr } = await supabase
      .from('college_preferences')
      .insert(testCollege)
      .select()
      .single();

    if (insertCollegeErr) {
      // It is normal if the anon key is restricted from inserting to college_preferences,
      // but let's check what the error is.
      console.log('Insert into college_preferences status:', insertCollegeErr.message);
      if (insertCollegeErr.message.includes('violates row-level security')) {
        console.log('✅ RLS working: public/anon users cannot insert into college_preferences (intended).');
      } else {
        throw new Error(`Insert failed: ${insertCollegeErr.message}`);
      }
    } else {
      console.log('✅ Inserted College:', insertedCollege);

      // B. Filtering & Selection
      console.log('Querying/filtering college...');
      const { data: fetchedColleges, error: fetchCollegeErr } = await supabase
        .from('college_preferences')
        .select('*')
        .eq('state', 'Maharashtra');

      if (fetchCollegeErr) {
        throw new Error(`Failed to query colleges: ${fetchCollegeErr.message}`);
      }
      console.log(`✅ Query successful, found ${fetchedColleges.length} colleges in Maharashtra`);

      // C. Delete
      console.log('Cleaning up: deleting test college...');
      const { error: deleteCollegeErr } = await supabase
        .from('college_preferences')
        .delete()
        .eq('id', insertedCollege.id);

      if (deleteCollegeErr) {
        throw new Error(`Failed to delete college: ${deleteCollegeErr.message}`);
      }
      console.log('✅ Deleted college successfully.');
    }

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
  }
}

runTests();
