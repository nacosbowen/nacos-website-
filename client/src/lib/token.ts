let _token: string | null = null;
export const getToken = (): string | null => _token;
export const setToken = (token: string | null): void => { _token = token; };
