export interface TarefaResponse {
  id: number;
  titulo: string;
  concluida: boolean;
  responsavel?: string;
  dataPrevista?: string;
  concluidaEm?: string;
  criadaEm: string;
  alaId: number;
  role: string;
}

export interface CreateTarefaRequest {
  titulo: string;
  responsavel?: string;
  dataPrevista?: string;
}

export interface PessoaAlaResponse {
  id: number;
  nome: string;
  alaId: number;
}
