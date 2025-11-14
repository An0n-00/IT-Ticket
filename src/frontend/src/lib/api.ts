import type {
    AuditLog,
    Comment,
    CreateCommentDTO,
    CreateIssueDTO,
    Issue,
    Notification,
    NotificationUpdateDTO,
    Priority,
    Role,
    Status,
    SuspendUserDTO,
    Tag,
    UpdateCommentDTO,
    UpdateIssueDTO,
    UpdateUserDTO,
    UserID,
    UserWithRole,
} from '@/types/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class ApiService {
    private token: string | null = null;

    constructor() {
        // Initialize token from localStorage
        this.token = localStorage.getItem('token');
    }

    // Authentication
    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Get current token
    getToken(): string | null {
        // Always check localStorage for the latest token if we don't have one
        if (!this.token) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    // Issues
    async getIssues(): Promise<string[]> {
        return this.request<string[]>('/api/issue');
    }

    async getAllIssues(): Promise<string[]> {
        return this.request<string[]>('/api/issue/all');
    }

    async getIssue(id: string): Promise<Issue> {
        return this.request<Issue>(`/api/issue/${id}`);
    }

    async createIssue(data: CreateIssueDTO): Promise<Issue> {
        return this.request<Issue>('/api/issue', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateIssue(id: string, data: UpdateIssueDTO): Promise<Issue> {
        return this.request<Issue>(`/api/issue/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteIssue(id: string): Promise<void> {
        return this.request<void>(`/api/issue/${id}`, {
            method: 'DELETE',
        });
    }

    // Comments
    async createComment(data: CreateCommentDTO): Promise<Comment> {
        return this.request<Comment>('/api/comment', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getComment(id: string): Promise<Comment> {
        return this.request<Comment>(`/api/comment/${id}`);
    }

    async updateComment(id: string, data: UpdateCommentDTO): Promise<Comment> {
        return this.request<Comment>(`/api/comment/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteComment(id: string): Promise<void> {
        return this.request<void>(`/api/comment/${id}`, {
            method: 'DELETE',
        });
    }

    // Users
    async getCurrentUserId(): Promise<UserID> {
        return this.request<UserID>('/api/user');
    }

    async getUser(id: string): Promise<UserWithRole> {
        return this.request<UserWithRole>(`/api/user/${id}`);
    }

    async getAllUsers(): Promise<UserWithRole[]> {
        return this.request<UserWithRole[]>('/api/user/all');
    }

    async updateUser(id: string, data: UpdateUserDTO): Promise<UserWithRole> {
        return this.request<UserWithRole>(`/api/user/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteUser(id: string): Promise<void> {
        return this.request<void>(`/api/user/${id}`, {
            method: 'DELETE',
        });
    }

    async elevateUser(id: string): Promise<UserWithRole> {
        return this.request<UserWithRole>(`/api/user/${id}/elevate`, {
            method: 'POST',
        });
    }

    async suspendUser(id: string, data: SuspendUserDTO): Promise<UserWithRole> {
        return this.request<UserWithRole>(`/api/user/${id}/suspend`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Notifications
    async getNotifications(): Promise<string[]> {
        return this.request<string[]>(`/api/notification`);
    }

    async getNotification(id: string): Promise<Notification> {
        return this.request<Notification>(`/api/notification/${id}`);
    }

    async updateNotification(id: string, data: NotificationUpdateDTO): Promise<Notification> {
        return this.request<Notification>(`/api/notification/${id}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Tags
    async getTags(): Promise<string[]> {
        return this.request<string[]>('/api/tag');
    }

    async getTag(id: string): Promise<Tag> {
        return this.request<Tag>(`/api/tag/${id}`);
    }

    // Status
    async getStatuses(): Promise<string[]> {
        return this.request<string[]>('/api/status');
    }

    async getStatus(id: string): Promise<Status> {
        return this.request<Status>(`/api/status/${id}`);
    }

    // Priority
    async getPriorities(): Promise<string[]> {
        return this.request<string[]>('/api/priority');
    }

    async getPriority(id: string): Promise<Priority> {
        return this.request<Priority>(`/api/priority/${id}`);
    }

    // Roles
    async getRoles(): Promise<string[]> {
        return this.request<string[]>('/api/role');
    }

    async getRole(id: string): Promise<Role> {
        return this.request<Role>(`/api/role/${id}`);
    }

    // Audit Logs
    async getAuditLogs(): Promise<string[]> {
        return this.request<string[]>('/api/auditlog');
    }

    async getAuditLog(id: string): Promise<AuditLog> {
        return this.request<AuditLog>(`/api/auditlog/${id}`);
    }

    // Utility methods for bulk operations
    async getMultipleIssues(ids: string[]): Promise<Issue[]> {
        const promises = ids.map((id) => this.getIssue(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((issue): issue is Issue => issue !== null);
    }

    async getMultipleUsers(ids: string[]): Promise<UserWithRole[]> {
        const promises = ids.map((id) => this.getUser(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((user): user is UserWithRole => user !== null);
    }

    async getMultipleNotifications(ids: string[]): Promise<Notification[]> {
        const promises = ids.map((id) => this.getNotification(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((notification): notification is Notification => notification !== null);
    }

    async getMultipleTags(ids: string[]): Promise<Tag[]> {
        const promises = ids.map((id) => this.getTag(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((tag): tag is Tag => tag !== null);
    }

    async getMultipleStatuses(ids: string[]): Promise<Status[]> {
        const promises = ids.map((id) => this.getStatus(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((status): status is Status => status !== null);
    }

    async getMultiplePriorities(ids: string[]): Promise<Priority[]> {
        const promises = ids.map((id) => this.getPriority(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((priority): priority is Priority => priority !== null);
    }

    async getMultipleRoles(ids: string[]): Promise<Role[]> {
        const promises = ids.map((id) => this.getRole(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((role): role is Role => role !== null);
    }

    async getMultipleAuditLogs(ids: string[]): Promise<AuditLog[]> {
        const promises = ids.map((id) => this.getAuditLog(id).catch(() => null));
        const results = await Promise.all(promises);
        return results.filter((log): log is AuditLog => log !== null);
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;
        const currentToken = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP ${response.status}`;
                throw new Error(errorMessage);
            }

            // Handle empty responses
            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                console.error('API Error:', endpoint, error.message);
                throw error;
            }
            console.error(`Unknown API Error (${endpoint}):`, error);
            throw new Error('Unknown error occurred');
        }
    }
}

export const apiService = new ApiService();
export default apiService;
