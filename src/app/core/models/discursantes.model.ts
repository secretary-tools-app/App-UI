export interface DiscursantesState {
  ataId?: number | null;
  date?: string | null;
  discursante1?: string | null;
  discursante2?: string | null;
  discursante3?: string | null;
  tema?: string | null;
  tema1?: string | null;
  tema2?: string | null;
  tema3?: string | null;
  obs1?: string | null;
  obs2?: string | null;
  obs3?: string | null;
  hinoAbertura?: string | null;
  hinoSacramental?: string | null;
  hinoIntermediario?: string | null;
  hinoEncerramento?: string | null;
  oracaoAbertura?: string | null;
  oracaoEncerramento?: string | null;
}

export interface DiscursanteSugestao {
  nome: string;
  ultimaData?: string | null;
  posicao: string;
}

export interface SaveDiscursantesRequest {
  date: string;
  tema?: string | null;
  discursante1?: string | null;
  discursante2?: string | null;
  discursante3?: string | null;
  outros?: string | null;
  tema1?: string | null;
  tema2?: string | null;
  tema3?: string | null;
  obs1?: string | null;
  obs2?: string | null;
  obs3?: string | null;
  hinoAbertura?: string | null;
  hinoSacramental?: string | null;
  hinoIntermediario?: string | null;
  hinoEncerramento?: string | null;
  oracaoAbertura?: string | null;
  oracaoEncerramento?: string | null;
}
