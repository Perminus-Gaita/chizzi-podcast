import { NextResponse } from "next/server";
import { handleBotAddedToAGroup } from "@/services/integrations/telegram/webhook-handlers/handle-bot-added-to-a-group";
import { handleBotRemovedFromAGroup } from "@/services/integrations/telegram/webhook-handlers/handle-bot-removed-from-a-group";
import { handleGroupTypeChange } from "@/services/integrations/telegram/webhook-handlers/handle-group-type-change";
import { handleBotRoleOrPermissionsChange } from '@/services/integrations/telegram/webhook-handlers/handle-bot-role-or-permissions-change';
import { handleMemberJoiningAGroup } from '@/services/integrations/telegram/webhook-handlers/handle-member-joining-a-group';

export async function POST(request) {
  try {
    const update = await request.json();
    console.log(JSON.stringify(update, null, 2));

    // Handle group-to-supergroup migration
    if (update.message) {
      await handleGroupTypeChange(update);
      await handleMemberJoiningAGroup(update);
    }

    // Handle my_chat_member updates
    if (update.my_chat_member) {
      await handleBotAddedToAGroup(update);
      await handleBotRoleOrPermissionsChange(update);
      await handleBotRemovedFromAGroup(update);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}