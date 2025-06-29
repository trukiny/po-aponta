import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Op } from "../models/op";

@Injectable({providedIn: 'root'})

export class PCPService {

    private listOps$ = new BehaviorSubject<Array<Op>>([]);
    private selectedOp$ = new BehaviorSubject<Op>(new Op());

    constructor(){}

    public loadOps() {
        let listOps: Array<Op> = [
            { status: '1', numero: '123', produto: 'Produto A',unmed: 'UN', quantidade: 120, quantidadeApontada: 100, quantidadePendente: 20, dataInicio: this.parseDataBr('26/06/2025'), dataPrevista: this.parseDataBr('26/06/2025'), dataEncerramento: this.parseDataBr('26/06/2025'), dataPrevistaEncerramento: this.parseDataBr('26/06/2025'), apontamentos: [] },
            { status: '2', numero: '456', produto: 'Produto B',unmed: 'UN', quantidade: 200, quantidadeApontada: 150, quantidadePendente: 50, dataInicio: this.parseDataBr('26/06/2025'), dataPrevista: this.parseDataBr('26/06/2025'), dataEncerramento: this.parseDataBr('26/06/2025'), dataPrevistaEncerramento: this.parseDataBr('26/06/2025'), apontamentos: [] },
            { status: '3', numero: '789', produto: 'Produto C',unmed: 'UN', quantidade: 150, quantidadeApontada: 100, quantidadePendente: 50, dataInicio: this.parseDataBr('26/06/2025'), dataPrevista: this.parseDataBr('26/06/2025'), dataEncerramento: this.parseDataBr('26/06/2025'), dataPrevistaEncerramento: this.parseDataBr('26/06/2025'), apontamentos: [] }            
        ];

        this.listOps$.next(listOps);
    }

    public  loadOpsLibCore(listOpsParam: string) {
        
        let listOps!: any;
        
        if(listOpsParam){
            listOps = JSON.parse(listOpsParam);
        }

        this.listOps$.next(listOps.listOps);
    }

    public setSelectedOp(op: Op){
        this.selectedOp$.next(op);
    }

    public getListOps(): Observable<Array<Op>> {
        return this.listOps$.asObservable();
    }

    public getSelectedOp(): Observable<Op> {
        return this.selectedOp$.asObservable();
    }

    public parseDataBr(dataStr: string) {
    const [dia, mes, ano] = dataStr.split('/').map(part => parseInt(part,10));
    const newDate = new Date(ano, mes - 1,dia);
    return newDate;
  }    
}