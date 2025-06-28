export class Op {
    public status: string = '';
    public numero: string = '';
    public produto: string = '';
    public quantidade: number = 0;
    public quantidadeApontada: number = 0;
    public quantidadePendente: number = 0;
    public dataInicio!: Date;
    public dataPrevista!: Date;
    public dataEncerramento!: Date;
    public dataPrevistaEncerramento!: Date;
    public apontamentos: Array<Apontamento> = [];
}

export class Apontamento {

    public op: string = '';
    public produto: string = '';
    public quantidadeApont: number = 0;
    public dataInicio!: Date;
    public horaInicio: string = '';
    public dataTermino!: Date;
    public horaTermino: string = '';
    public tempoDecorrido: string = '';
    public observacao: string = '';
    public encerraOp: boolean = false;

}