import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, Edit3, MessageSquare, MoreVertical, Tag as TagIcon, Trash2, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Comment, Issue, Priority, Status, Tag, UserWithRole } from '@/types/api';
import * as console from 'node:console';

const IssueDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [issue, setIssue] = useState<Issue | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [assignee, setAssignee] = useState<UserWithRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [editingIssue, setEditingIssue] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        statusId: '',
        priorityId: '',
    });

    useEffect(() => {
        if (!id || !token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Update API service token
                apiService.setToken(token);

                // Fetch issue details
                const issueData = await apiService.getIssue(id);
                setIssue(issueData);
                setEditForm({
                    title: issueData.title,
                    description: issueData.description,
                    statusId: issueData.statusId,
                    priorityId: issueData.priorityId,
                });

                // Fetch comments if they exist
                if (issueData.comments) {
                    for (const commentId of issueData.comments) {
                        try {
                            const comment = await apiService.getComment(commentId);
                            setComments((prev) => [...prev, comment]);
                        } catch (error) {
                            console.error('Failed to fetch comment:', error);
                        }
                    }
                }

                // Fetch metadata
                const [statusIds, priorityIds, tagIds] = await Promise.all([apiService.getStatuses(), apiService.getPriorities(), apiService.getTags()]);

                const [statusesData, prioritiesData, tagsData] = await Promise.all([
                    apiService.getMultipleStatuses(statusIds),
                    apiService.getMultiplePriorities(priorityIds),
                    apiService.getMultipleTags(tagIds),
                ]);

                setStatuses(statusesData);
                setPriorities(prioritiesData);
                setTags(tagsData);

                // Fetch assignee if exists
                if (issueData.assigneeId) {
                    try {
                        const assigneeData = await apiService.getUser(issueData.assigneeId);
                        setAssignee(assigneeData);
                    } catch (error) {
                        console.error('Failed to fetch assignee:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch issue:', error);
                toast.error('Failed to load issue details');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token, navigate]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !issue) return;

        try {
            const comment = await apiService.createComment({
                content: newComment,
                issueId: issue.id,
            });
            setComments([...comments, comment]);
            setNewComment('');
            toast.success('Comment added successfully');
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error);
            console.error('Failed to add comment:', error);
        }
    };

    const handleUpdateIssue = async () => {
        if (!issue) return;

        try {
            const updatedIssue = await apiService.updateIssue(issue.id, editForm);
            setIssue(updatedIssue);
            setEditingIssue(false);
            toast.success('Issue updated successfully');
        } catch (error) {
            console.error('Failed to update issue:', error);
        }
    };

    const handleDeleteIssue = async () => {
        if (!issue) return;

        try {
            await apiService.deleteIssue(issue.id);
            toast.success('Issue deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete issue:', error);
        }
    };

    const getStatusBadgeVariant = (status: Status) => {
        switch (status.name.toLowerCase()) {
            case 'open':
                return 'destructive';
            case 'in progress':
                return 'default';
            case 'resolved':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getPriorityIcon = (priority: Priority) => {
        switch (priority.name.toLowerCase()) {
            case 'high':
                return <CheckCircle2 className="text-red-500" />;
            case 'medium':
                return <Clock className="text-yellow-500" />;
            case 'low':
                return <Calendar className="text-green-500" />;
            default:
                return <AlertCircle className="text-gray-500" />;
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/issues">Issues</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem className="hidden md:block">{loading ? 'Loading...' : issue?.title || 'Issue'}</BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ) : issue ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <div className="flex-1" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingIssue(true)}>
                                            <Edit3 className="mr-2 h-4 w-4" />
                                            Edit Issue
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Issue
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure you want to delete this issue? This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteIssue}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Issue Details */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <CardTitle className="text-2xl">{issue.title}</CardTitle>
                                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                Created at {new Date(issue.createdAt).toLocaleDateString()}
                                                {issue.updatedAt !== issue.createdAt && issue.updatedAt !== undefined && <>• Updated {new Date(issue.updatedAt).toLocaleDateString()}</>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {statuses.find((s) => s.id === issue.statusId) && (
                                                <Badge variant={getStatusBadgeVariant(statuses.find((s) => s.id === issue.statusId)!)}>{statuses.find((s) => s.id === issue.statusId)!.name}</Badge>
                                            )}
                                            {priorities.find((p) => p.id === issue.priorityId) && (
                                                <div className="flex items-center gap-1">
                                                    {getPriorityIcon(priorities.find((p) => p.id === issue.priorityId)!)}
                                                    <span className="text-sm">{priorities.find((p) => p.id === issue.priorityId)!.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 font-medium">Description</h4>
                                            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{issue.description}</p>
                                        </div>

                                        {assignee && (
                                            <div>
                                                <h4 className="mb-2 font-medium">Assignee</h4>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={'https://api.dicebear.com/9.x/thumbs/svg?seed=' + user.username} alt={user.username} />
                                                        <AvatarFallback className="text-xs">{assignee.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">
                                                        {assignee.firstName} {assignee.lastName} ({assignee.username})
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {issue.tags && issue.tags.length > 0 && (
                                            <div>
                                                <h4 className="mb-2 font-medium">Tags</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {issue.tags.map((tagId) => {
                                                        const tag = tags.find((t) => t.id === tagId);
                                                        return tag ? (
                                                            <Badge key={tag.id} variant="outline">
                                                                <TagIcon className="mr-1 h-3 w-3" />
                                                                {tag.name}
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Comments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Comments ({comments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {comments.map((comment) => {
                                            return (
                                                <div key={comment.id} className="border-muted space-y-2 border-l-2 pl-4">
                                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4" />
                                                        <span>User {comment.userId}</span>
                                                        <span>•</span>
                                                        <span>{new Date(comment.createdAt).toDateString()}</span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                                </div>
                                            );
                                        })}

                                        {comments.length === 0 && <p className="text-muted-foreground py-4 text-center">No comments yet. Be the first to comment!</p>}

                                        <div className="space-y-2 border-t pt-4">
                                            <Label htmlFor="comment">Add a comment</Label>
                                            <Textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment here..." rows={3} />
                                            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                                                Add Comment
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Edit Issue Dialog */}
                            <Dialog open={editingIssue} onOpenChange={setEditingIssue}>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Edit Issue</DialogTitle>
                                        <DialogDescription>Update the issue details below.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={editForm.title}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        title: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={editForm.description}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        description: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={editForm.statusId}
                                                    onValueChange={(value) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            statusId: value,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statuses.map((status) => (
                                                            <SelectItem key={status.id} value={status.id}>
                                                                {status.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select
                                                    value={editForm.priorityId}
                                                    onValueChange={(value) =>
                                                        setEditForm({
                                                            ...editForm,
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
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingIssue(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdateIssue}>Save Changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">Issue not found</p>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default IssueDetailPage;
