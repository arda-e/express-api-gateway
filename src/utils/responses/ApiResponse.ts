export interface ApiResponse<T> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  errors?: { field: string; errors: string[] }[];
  links?: {
    [key: string]: { href: string; method?: string };
  };
}
