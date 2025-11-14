import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Priority, UserWithRole } from '@/types/api';

interface NewIssueDialogProps {
    showCreateDialog: boolean;
    setShowCreateDialog: (open: boolean) => void;
    createForm: {
        title: string;
        description: string;
        priorityId: string;
        assigneeId: string;
        tagIds: string[];
    };
    setCreateForm: (form: NewIssueDialogProps['createForm']) => void;
    priorities: Priority[];
    users: UserWithRole[];
    handleCreateIssue: () => void;
}

export default function NewIssueDialog({ showCreateDialog, setShowCreateDialog, createForm, setCreateForm, priorities, users, handleCreateIssue }: NewIssueDialogProps) {
    return (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                    <DialogDescription>Fill out the form below to create a new IT support ticket.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Brief description of the issue" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={createForm.description}
                            onChange={(e) =>
                                setCreateForm({
                                    ...createForm,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Detailed description of the issue..."
                            rows={4}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={createForm.priorityId}
                                onValueChange={(value) =>
                                    setCreateForm({
                                        ...createForm,
                                        priorityId: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map((priority) => (
                                        <SelectItem key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {users.length > 0 && (
                            <div>
                                <Label htmlFor="assignee">Assignee</Label>
                                <Select
                                    value={createForm.assigneeId}
                                    onValueChange={(value) =>
                                        setCreateForm({
                                            ...createForm,
                                            assigneeId: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName} ({user.username})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateIssue}>Create Issue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
