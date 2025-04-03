// components/workspace/PermissionsInfo.jsx
import React from 'react';
import { Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const PermissionsInfo = ({ showPermissions, handleClosePermissions }) => (
  <Dialog open={showPermissions} onOpenChange={handleClosePermissions}>
    <DialogContent className="sm:max-w-[425px] bg-light dark:bg-dark">
      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            <h3 className="text-sm md:text-lg font-semibold">
              Understanding Permissions
            </h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="font-semibold min-w-[70px]">Admin</div>
              <div>
                Can manage workspace settings, invite members, and modify
                permissions
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-semibold min-w-[70px]">Editor</div>
              <div>
                Can create, edit, and publish content within the workspace
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-semibold min-w-[70px]">Viewer</div>
              <div>Can only view content and cannot make any changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>
);