const pool = require('../models/db');

exports.getAllGroups = async (req, res) => {
  try {
    const [groups] = await pool.query('SELECT * FROM groups');
    res.json(groups); // Return array directly
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM groups WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Group not found' });
    res.json({ success: true, group: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createGroup = async (req, res) => {
  const { owner_id, code, group_number } = req.body;
  if (!owner_id || !code || !group_number) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO groups (owner_id, code, group_number) VALUES (?, ?, ?)',
      [owner_id, code, group_number]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const { owner_id, code, group_number } = req.body;
  try {
    await pool.query(
      'UPDATE groups SET owner_id=?, code=?, group_number=? WHERE id=?',
      [owner_id, code, group_number, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM groups WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Advanced business logic
exports.confirmGroupMember = async (req, res) => {
  // Input: { inviteId }
  const { inviteId } = req.body;
  if (!inviteId) {
    return res.status(400).json({ success: false, error: 'inviteId is required' });
  }
  try {
    // 1. Set owner_confirmed = true for invite
    await pool.query('UPDATE invites SET owner_confirmed = 1 WHERE id = ?', [inviteId]);

    // 2. Fetch invite to get referred_user_id and group_id
    const [[invite]] = await pool.query('SELECT referred_user_id, group_id FROM invites WHERE id = ?', [inviteId]);
    if (!invite) return res.status(404).json({ success: false, error: 'Invite not found' });

    // 3. Fetch group to get group_number
    const [[group]] = await pool.query('SELECT group_number FROM groups WHERE id = ?', [invite.group_id]);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    // 4. If group_number > 1, try to create next group for this user
    if (group.group_number > 1) {
      await exports.createNextGroupIfEligibleInternal(invite.referred_user_id);
    } else if (group.group_number === 1) {
      await exports.createGroupIfNeededInternal(invite.referred_user_id);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Internal helper for group creation logic (used by confirmGroupMember)
exports.createGroupIfNeededInternal = async (userId) => {
  // 1. Fetch user status
  const [[user]] = await pool.query('SELECT status, current_level FROM users WHERE id = ?', [userId]);
  if (!user || user.status !== 'active') return false;
  // 2. Fetch invite for owner_confirmed
  const [[invite]] = await pool.query('SELECT owner_confirmed FROM invites WHERE referred_user_id = ?', [userId]);
  if (!invite || !invite.owner_confirmed) return false;
  // 3. Check if user already has a group
  const [groups] = await pool.query('SELECT * FROM groups WHERE owner_id = ?', [userId]);
  if (!groups || groups.length > 0) return false;
  // 4. Create group_number 1
  const code = generateGroupCode();
  await pool.query('INSERT INTO groups (owner_id, code, group_number) VALUES (?, ?, 1)', [userId, code]);

  // 5. After group creation, check for auto-increment for all levels (1, 2, ...)
  // Get all groups for user, sorted by group_number
  const [allGroups] = await pool.query('SELECT * FROM groups WHERE owner_id = ? ORDER BY group_number ASC', [userId]);
  for (const group of allGroups) {
    // Count verified & owner_confirmed members in this group
    const [[verifiedRow]] = await pool.query(`
      SELECT COUNT(*) as count
      FROM invites i
      JOIN users u ON i.referred_user_id = u.id
      WHERE i.group_id = ? AND i.owner_confirmed = 1 AND u.status = 'active'
    `, [group.id]);
    if ((verifiedRow.count ?? 0) >= 4) {
      // Increment user level if at this group_number
      if (user.current_level === group.group_number) {
        await pool.query('UPDATE users SET current_level = ? WHERE id = ?', [group.group_number + 1, userId]);
      }
    }
  }
  return true;
};

function generateGroupCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

exports.createNextGroupIfEligible = async (req, res) => {
  // Input: { userId }
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }
  try {
    const created = await exports.createNextGroupIfEligibleInternal(userId);
    res.json({ success: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Internal helper for next group creation logic
exports.createNextGroupIfEligibleInternal = async (userId) => {
  // 1. Get all groups for user, sorted by group_number
  const [groups] = await pool.query('SELECT * FROM groups WHERE owner_id = ? ORDER BY group_number ASC', [userId]);
  if (!groups || groups.length === 0) return false;
  if (groups.length >= 3) return false;
  const lastGroup = groups[groups.length - 1];
  const nextGroupNumber = lastGroup.group_number + 1;
  // 2. Count verified & owner_confirmed members in last group
  const [[verifiedRow]] = await pool.query(`
    SELECT COUNT(*) as count
    FROM invites i
    JOIN users u ON i.referred_user_id = u.id
    WHERE i.group_id = ? AND i.owner_confirmed = 1 AND u.status = 'active'
  `, [lastGroup.id]);
  if ((verifiedRow.count ?? 0) < 4) return false;

  // Add this: Update user's level if they've reached 4 verified members
  const [[user]] = await pool.query('SELECT current_level FROM users WHERE id = ?', [userId]);
  if (user && user.current_level === lastGroup.group_number) {
    await pool.query('UPDATE users SET current_level = ? WHERE id = ?', [nextGroupNumber, userId]);
  }

  // 3. Check if next group already exists
  if (groups.some(g => g.group_number === nextGroupNumber)) return false;
  // 4. Only create next group if user is confirmed as member in a group at this level
  const [userInvites] = await pool.query('SELECT group_id FROM invites WHERE referred_user_id = ? AND owner_confirmed = 1', [userId]);
  let confirmedAtLevel = false;
  for (const invite of userInvites) {
    if (!invite.group_id) continue;
    const [[groupData]] = await pool.query('SELECT group_number FROM groups WHERE id = ?', [invite.group_id]);
    if (groupData && groupData.group_number === nextGroupNumber) {
      confirmedAtLevel = true;
      break;
    }
  }
  if (!confirmedAtLevel) return false;
  // 5. Create the next group
  const code = generateGroupCode();
  await pool.query('INSERT INTO groups (owner_id, code, group_number) VALUES (?, ?, ?)', [userId, code, nextGroupNumber]);
  return true;
};

exports.joinGroupAsExistingUser = async (req, res) => {
  // Input: { userId, groupCode }
  const { userId, groupCode } = req.body;
  if (!userId || !groupCode) {
    return res.status(400).json({ success: false, error: 'userId and groupCode are required' });
  }
  try {
    // 1. Fetch user
    const [[user]] = await pool.query('SELECT id, current_level, status FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });

    // 2. Fetch group
    const [[group]] = await pool.query('SELECT id, group_number, owner_id FROM groups WHERE code = ?', [groupCode]);
    if (!group) return res.status(404).json({ success: false, error: 'Groupe introuvable.' });

    // 3. Check level match
    if (user.current_level !== group.group_number) {
      return res.status(400).json({ success: false, error: `Vous devez être au niveau ${group.group_number} pour rejoindre ce groupe.` });
    }

    // 4. Check group is not full (count verified members)
    const [[verifiedRow]] = await pool.query(`
      SELECT COUNT(*) as count
      FROM invites i
      JOIN users u ON i.referred_user_id = u.id
      WHERE i.group_id = ? AND i.owner_confirmed = 1 AND u.status = 'active'
    `, [group.id]);
    if ((verifiedRow.count ?? 0) >= 4) {
      return res.status(400).json({ success: false, error: 'Ce groupe est complet.' });
    }

    // 5. Prevent duplicate invite for this user in this group
    const [[existingInvite]] = await pool.query(
      'SELECT id FROM invites WHERE group_id = ? AND referred_user_id = ? LIMIT 1',
      [group.id, user.id]
    );
    if (existingInvite) {
      return res.status(400).json({ success: false, error: 'Vous avez déjà demandé à rejoindre ce groupe.' });
    }

    // 6. Insert invite (do not update user's invite_code or referred_by)
    // Always set inviter_id to group.owner_id
    await pool.query(
      'INSERT INTO invites (group_id, inviter_id, referred_user_id, owner_confirmed) VALUES (?, ?, ?, ?)',
      [group.id, group.owner_id, user.id, 0]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get group members with user info and owner_confirmed status
exports.getGroupMembers = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT i.id as invite_id, i.owner_confirmed, u.id, u.name, u.email, u.status, u.created_at, u.whatsapp
      FROM invites i
      JOIN users u ON i.referred_user_id = u.id
      WHERE i.group_id = ?
    `, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
