// API Types based on OpenAPI specification

export interface Issue {
    id: string;
    title: string;
    description: string;
    statusId: string;
    priorityId: string;
    assigneeId?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    tags?: string[];
    attachments?: Attachment[];
    comments?: string[];
}

export interface UserID {
    id: string;
}

export interface Comment {
    id: string;
    content: string;
    issueId: string;
    userId: string;
    parentCommentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface Tag {
    id: string;
    name: string;
    color?: string;
    description?: string;
}

export interface Status {
    id: string;
    name: string;
    color?: string;
    description?: string;
}

export interface Priority {
    id: string;
    name: string;
    color?: string;
    description?: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    isAdmin: boolean;
    isSupport: boolean;
    isDefault: boolean;
}

export interface Attachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    issueId: string;
    uploadedAt: string;
}

export interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    details: string;
    timestamp: string;
}

export interface UserWithRole {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    role?: Role;
    isActive: true;
    isSuspended: boolean;
    createdAt: string;
}

// DTOs for API requests
export interface CreateIssueDTO {
    title: string;
    description: string;
    priorityId?: string;
    assigneeId?: string;
    tagIds?: string[];
}

export interface UpdateIssueDTO {
    title?: string;
    description?: string;
    statusId?: string;
    priorityId?: string;
    assigneeId?: string;
    tagIds?: string[];
}

export interface CreateCommentDTO {
    content: string;
    issueId: string;
    parentCommentId?: string;
}

export interface UpdateCommentDTO {
    content: string;
}

export interface UpdateUserDTO {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface SuspendUserDTO {
    isSuspended: boolean;
    reason?: string;
}

export interface NotificationUpdateDTO {
    isRead: boolean;
}

// Response wrappers
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Filter/Query types
export interface IssueFilters {
    statusId?: string;
    priorityId?: string;
    assigneeId?: string;
    tagIds?: string[];
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface UserFilters {
    roleId?: string;
    isActive?: boolean;
    isSuspended?: boolean;
    search?: string;
}

export interface NotificationFilters {
    isRead?: boolean;
}
