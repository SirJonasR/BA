export interface CommentResponse {
  text: string;
  authorUsername: string;
  changes: Record<string, string>;
  date: string;
}

export interface CommentPostRequest {
  content: string;
  didTechnologyChange: boolean;
  didTecSwapElementChange: boolean;
}
