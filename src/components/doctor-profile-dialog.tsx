
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
import { useEffect, useState } from 'react';
import { useData } from '@/contexts/data-provider';
import { useToast } from '@/hooks/use-toast';

interface DoctorProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorProfileDialog({ open, onOpenChange }: DoctorProfileDialogProps) {
    const { currentDoctor, updateCurrentDoctor } = useData();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [degree, setDegree] = useState('');
    const [specialty, setSpecialty] = useState('');

    useEffect(() => {
        if (currentDoctor) {
            setName(currentDoctor.name);
            setDegree(currentDoctor.degree);
            setSpecialty(currentDoctor.specialty || '');
        }
    }, [currentDoctor, open]);


    const handleSaveChanges = () => {
        if (!currentDoctor) return;
        
        updateCurrentDoctor({
            name,
            degree,
            specialty,
        });

        toast({
            title: 'Profile Updated',
            description: 'Your profile information has been saved.',
        });
        onOpenChange(false);
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Your Profile</DialogTitle>
          <DialogDescription>
            Make changes to your professional profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="degree" className="text-right">
              Degree
            </Label>
            <Input id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialty" className="text-right">
              Specialty
            </Label>
            <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
