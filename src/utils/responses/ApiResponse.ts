export interface ApiResponse<T> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  links?: {
    [key: string]: { href: string; method?: string };
  };
}
