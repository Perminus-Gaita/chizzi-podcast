import TelegramGroup from '@/models/telegram/group.model';
import { sendBotStatusMessageToGroup } from '@/services/integrations/telegram/group/send-bot-status-message-to-group';

function detectPermissionChanges(oldMember, newMember) {
  const changes = {
    changed: false,
    permissions: {
      canInviteViaLink: false,
      canManageStories: false
    }
  };

  // Handle invite link permission
  if (oldMember.can_invite_users !== newMember.can_invite_users) {
    changes.changed = true;
    changes.permissions.canInviteViaLink = newMember.can_invite_users || false;
  } else {
    changes.permissions.canInviteViaLink = newMember.can_invite_users || false;
  }

  // Handle stories permissions - set to true if any stories permission is granted
  const hasStoriesPermission = 
    newMember.can_post_stories || 
    newMember.can_edit_stories || 
    newMember.can_delete_stories;

  const hadStoriesPermission = 
    oldMember.can_post_stories || 
    oldMember.can_edit_stories || 
    oldMember.can_delete_stories;

  if (hasStoriesPermission !== hadStoriesPermission) {
    changes.changed = true;
    changes.permissions.canManageStories = hasStoriesPermission;
  } else {
    changes.permissions.canManageStories = hasStoriesPermission;
  }

  return changes;
}

export async function handleBotRoleOrPermissionsChange(update) {
  try {
    const chat = update.my_chat_member.chat;
    const oldMember = update.my_chat_member.old_chat_member;
    const newMember = update.my_chat_member.new_chat_member;
    const oldStatus = oldMember.status;
    const newStatus = newMember.status;

    // Only process if the chat is a group or supergroup
    if (chat.type !== 'group' && chat.type !== 'supergroup') {
      return null;
    }

    // Check for role changes
    const isRoleChange = oldStatus !== newStatus;
    const isRoleChangeValid =
      (oldStatus === 'member' && newStatus === 'administrator') ||
      (oldStatus === 'administrator' && newStatus === 'member');

    // Check for permission changes
    const permissionChanges = detectPermissionChanges(oldMember, newMember);

    // If neither role nor permissions changed, or if role change is invalid
    if ((!isRoleChange && !permissionChanges.changed) || (isRoleChange && !isRoleChangeValid)) {
      console.log(`No valid changes detected for chat ${chat.title} (${chat.id})`);
      return null;
    }

    // If changing from member to administrator, ensure permissions are checked
    if (isRoleChange && newStatus === 'member') {
      permissionChanges.permissions.canInviteViaLink = false;
      permissionChanges.permissions.canManageStories = false;
    }

    // Update the group document with the new role and/or permissions
    const updatedGroup = await TelegramGroup.findOneAndUpdate(
      { telegramGroupId: chat.id.toString() },
      {
        wufwufBotRole: newStatus === 'administrator' ? 'admin' : 'member',
        botPermissions: permissionChanges.permissions,
      },
      { new: true, runValidators: true }
    );

    if (!updatedGroup) {
      console.log(`Group ${chat.title} (${chat.id}) not found in database.`);
      return null;
    }

    // Send status message with updated permissions
    await sendBotStatusMessageToGroup(
      chat.id,
      chat.type,
      newStatus,
      permissionChanges.permissions
    );

    // Log changes
    if (isRoleChange) {
      console.log(`Bot role changed from ${oldStatus} to ${newStatus} in chat ${chat.title} (${chat.id})`);
    }
    if (permissionChanges.changed) {
      console.log(`Bot permissions updated in chat ${chat.title} (${chat.id})`, permissionChanges.permissions);
    }

    return updatedGroup;

  } catch (error) {
    console.error('Error handling bot role/permission change:', error);
    throw error;
  }
}