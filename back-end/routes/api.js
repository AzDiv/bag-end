const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const inviteController = require('../controllers/inviteController');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Registration endpoint (should NOT require authentication)
router.post('/auth/register', require('../controllers/authController').register);

// --- User routes ---
router.get('/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/users/:id', authenticateToken, userController.getUserById);
router.post('/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  userController.createUser
);
router.put('/users/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authenticateToken,
  userController.updateUser
);
router.put('/users/:id/status', authenticateToken, requireAdmin, userController.updateUserStatus);
router.delete('/users/:id', authenticateToken, requireAdmin, userController.deleteUser);
router.get('/users/invite/:inviteCode', userController.getUserByInviteCode);
router.get('/users/:id/with-groups', authenticateToken, userController.getUserWithGroups);
router.get('/users/pending', authenticateToken, requireAdmin, userController.getPendingVerifications);
router.put('/users/:id/plan', authenticateToken, userController.updateUserPlan);
router.patch('/users/:id', authenticateToken, userController.patchUserProfile);
router.get('/users/me', authenticateToken, userController.getCurrentUser);

// --- Group routes ---
router.get('/groups', authenticateToken, requireAdmin, groupController.getAllGroups);
router.get('/groups/:id', authenticateToken, groupController.getGroupById);
router.post('/groups', authenticateToken, groupController.createGroup);
router.put('/groups/:id', authenticateToken, groupController.updateGroup);
router.delete('/groups/:id', authenticateToken, requireAdmin, groupController.deleteGroup);
router.get('/groups/:id/members', authenticateToken, groupController.getGroupMembers);

// --- Invite routes ---
router.get('/invites', authenticateToken, requireAdmin, inviteController.getAllInvites);
router.get('/invites/:id', authenticateToken, inviteController.getInviteById);
router.post('/invites', authenticateToken, inviteController.createInvite);
router.put('/invites/:id', authenticateToken, inviteController.updateInvite);
router.delete('/invites/:id', authenticateToken, requireAdmin, inviteController.deleteInvite);

// --- Admin/Stats/Advanced Business Logic routes ---
router.get('/admin/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/admin/logs', authenticateToken, requireAdmin, adminController.getRecentAdminLogs);
router.get('/admin/missing-next-group', authenticateToken, requireAdmin, adminController.findUsersMissingNextGroup);

// Group/Invite advanced logic
router.post('/groups/confirm-member', authenticateToken, groupController.confirmGroupMember); // body: { inviteId }
router.post('/groups/next-group', authenticateToken, groupController.createNextGroupIfEligible); // body: { userId }
router.post('/groups/join', authenticateToken, groupController.joinGroupAsExistingUser); // body: { userId, groupCode }

module.exports = router;
