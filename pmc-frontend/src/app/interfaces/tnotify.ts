export interface TNotify {
    id: number,
    message: string,
    type: 'success' | 'warning' | 'danger' | 'info';
    timeout?: number;
}