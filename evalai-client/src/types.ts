export interface UserScores {
  correctness: number;
  clarity: number;
}

export interface ModelResponse {
  modelId: string;
  output: string;
  latencyMs: number;
  tokens: number;
  userScores?: UserScores;
}

export interface PromptResult {
  _id: string;
  text: string;
  responses: ModelResponse[];
}

export interface ModelRanking {
  modelId: string;
  avgScore: number;
}
