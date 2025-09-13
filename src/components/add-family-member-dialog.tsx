
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { useData } from '@/contexts/data-provider';
import { allFamilyMembers } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';

interface AddFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFamilyMemberDialog({ open, onOpenChange }: AddFamilyMemberDialogProps) {
    const [code, setCode] = useState('');
    const { addFamilyMember } = useData();
    const { toast } = useToast();

    const handleAddMember = () => {
        const member = allFamilyMembers.find(m => m.deviceCode === code);

        if(member) {
            addFamilyMember(member);
            toast({
                title: 'Success!',
                description: `${member.name} has been added to your family members.`,
            });
            onOpenChange(false);
            setCode('');
        } else {
             toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'The device code you entered is not valid. Please try again.',
            });
        }
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Enter the unique device code of the family member you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="device-code" className="text-right">
              Device Code
            </Label>
            <Input id="device-code" value={code} onChange={(e) => setCode(e.target.value)} className="col-span-3" placeholder="e.g. JUNIOR-123" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddMember}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
