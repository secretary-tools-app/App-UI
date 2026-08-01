// Item de apoio/desobrigação: a pessoa e o chamado/cargo.
export interface ChamadoItem {
  nome: string;
  chamado: string;
}

export interface SacramentalData {
  id?: number;
  ataId: number;
  date?: string | null;
  presidido?: string | null;
  dirigido?: string | null;
  pianista?: string | null;
  regenteMusica?: string | null;
  anuncios?: string[] | null;
  hinoAbertura?: string | null;
  hinoEncerramento?: string | null;
  hinoSacramental?: string | null;
  hinoIntermediario?: string | null;
  oracaoAbertura?: string | null;
  oracaoEncerramento?: string | null;
  recepcionistas?: string | null;
  reconhecemosPresenca?: string[] | null;
  desobrigacoes?: ChamadoItem[] | null;
  apoios?: ChamadoItem[] | null;
  confirmacoesBatismo?: string[] | null;
  apoioMembros?: string[] | null;
  bencaoCriancas?: string[] | null;
  testemunhos?: string[] | null;
  ordenacoes?: ChamadoItem[] | null;
  tema?: string | null;
  discursante1?: string | null;
  discursante2?: string | null;
  ultimoDiscursante?: string | null;
  outros?: string | null;
  tema1?: string | null;
  tema2?: string | null;
  temaUltimo?: string | null;
  obs1?: string | null;
  obs2?: string | null;
  obsUltimo?: string | null;
}
