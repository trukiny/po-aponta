import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProtheusLibCoreModule,ProAppConfigService, ProJsToAdvplService } from '@totvs/protheus-lib-core'; // Importing ProtheusLibCoreModule for Protheus integration

import {
  PoBreadcrumb,
  PoBreadcrumbItem,
  PoInfoModule,
  PoMenuItem,
  PoMenuModule,
  PoPageAction,
  PoPageModule,
  PoTableAction,
  PoTableModule,
  PoModalModule,
  PoToolbarModule,
  PoModalComponent,
  PoButtonModule,
  PoDynamicModule,
  PoDynamicFormField,
  PoDynamicFormFieldChanged,
  PoDynamicFormComponent,
  PoTableColumn,
  PoNotificationModule,
  PoNotificationService,
  PoNotification,
} from '@po-ui/ng-components';
import { Apontamento, Op } from '../models/op';
import { PCPService } from '../services/pcp.services';
import { Subscription } from 'rxjs';
import { poNotificationType, PoPageDynamicTableField } from '@po-ui/ng-templates';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    PoTableModule,
    PoInfoModule,
    PoModalModule,
    PoButtonModule,
    PoDynamicModule,
    PoNotificationModule,
    ProtheusLibCoreModule // Importing ProtheusLibCoreModule for Protheus integration
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy{

  notify = inject(PoNotificationService);
  proAppCfg = inject(ProAppConfigService);
  proAppAdvpl = inject(ProJsToAdvplService);

  @HostListener('window:keydown',['$event'])
  handleKeyBoardEvent(event: KeyboardEvent){
     if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
      event.preventDefault();
    }   
  }

  @ViewChild('modalApontamento') modalApontamentoEl!: PoModalComponent;
  @ViewChild('formApontamento') formApontamentoEl!: PoDynamicFormComponent;

  private pcpService = inject(PCPService);
  private listOps$ = this.pcpService.getListOps();
  private selectedOp$ = this.pcpService.getSelectedOp();
  private interval!: any;
  private sub = new Subscription();
  public selectedOp!: Op;
  public readonly actions: Array<PoPageAction> = [];
  
  public readonly breadcrumb: Array<PoBreadcrumbItem> = [
    {label: 'Home',link: '/home'},
    {label: 'Ordens de produção'},
  ];
  
  public readonly title = 'Ordens de Produção';
  
  public readonly columns: Array<PoTableColumn> = [
    {property: 'status', label: 'Status', type: 'subtitle', width: '15%', subtitles:[
      { value: '1'    , label: 'Não iniciada', color: 'color-10', content: 'N' },
      { value: '2'    , label: 'Iniciada'    , color: 'color-01', content: 'I' },
      { value: '3'    , label: 'Ociosa'      , color: 'color-08', content: 'O' },
      { value: '4'    , label: 'Finalizada'  , color: 'color-07', content: 'F' },
      { value: '5'    , label: 'Cancelada'   , color: 'color-06', content: 'C' }
    ]},
    { property: 'numero'      , label: 'OP'         , type: 'string', width: '20%'  },
    { property: 'produto'     , label: 'Produto'    , type: 'string', width: '40%'  },
    { property: 'unmed'       , label: 'Un. Med.'   , type: 'string', width: '10%'  },
    { property: 'quantidade'  , label: 'Quantidade' , type: 'number', width: '20%'  },
    { property: 'dataPrevista', label: 'Previsão'   , type: 'date'  , width: '20%'  },
  ];

  public items: Array<Op> = [];

  public fieldsApontamento: Array<PoDynamicFormField> = [
    {property: 'dataInicio'         , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Data do inicio'      , label: 'Data do Apontamento' ,readonly: true , type: 'date', format: 'dd/mm/yyyy',divider: 'Apontamento'},
    {property: 'horaInicio'         , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Horário de Inicio'   , label: 'Horário de Inicio'   ,readonly: true , type: 'time'},
    {property: 'dataTermino'        , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Data do Término'     , label: 'Data do Término'     ,readonly: true , type: 'date', format: 'dd/mm/yyyy'},
    {property: 'horaTermino'        , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Horário do Término'  , label: 'Horário do Término'  ,readonly: true , type: 'time'},  
    {property: 'tempoDecorrido'     , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Tempo de Operação'   , label: 'Tempo de Operação'   ,readonly: true , type: 'time'},      
    {property: 'quantidadeApont'    , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Quantidade Produzida', label: 'Quantidade Produzida',readonly: false, type: 'number'},      
    {property: 'op'                 , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Número da OP'        , label: 'Número da OP'        ,readonly: true , divider: 'Ordem de Produção'},
    {property: 'dataOp'             , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Data da OP'          , label: 'Data da OP'          ,readonly: true , type: 'date', format: 'dd/mm/yyyy'},
    {property: 'produto'            , gridColumns: 6 , gridSmColumns: 12, order: 1, placeholder: 'Produto'             , label: 'Produto'             ,readonly: true },
    {property: 'unmed'              , gridColumns: 3 , gridSmColumns: 12, order: 1, placeholder: 'Unidade de Medida'   , label: 'Unidade de Medida'   ,readonly: true },
    {property: 'quantidadePendente' , gridColumns: 3 , gridSmColumns: 12, order: 1, placeholder: 'Saldo a produzir'    , label: 'Saldo a Produzir'    ,readonly: true },
  ];

  public op!: Op;

  public apontamento: any = {
    op: '',
    dataInicio: '',
    horaInicio: '',
    dataTermino: '',
    horaTermino: '',
    quantidadeApont: 1,
    dataOp: '',
    produto: '',
    unmed: '',
    quantidadePendente: 0
  };

  public readonly tableActions: Array<PoTableAction> = [
    {action: this.onActionIniciarApontamento.bind(this), label: 'Ver detalhes', icon: 'an an-info'},
    {action: this.onActionIniciarApontamento.bind(this), label: 'Apontar Produção', icon: 'an an-play-circle'},
  ];

  constructor() {};

  async ngOnInit() {
    
    if(this.proAppCfg.insideProtheus()) {
      
      this.proAppAdvpl.jsToAdvpl('loadOpsLibCore', '');
      const content = await this.aguardarLoadOpsLibCore();
      this.pcpService.loadOpsLibCore(content);

    } else {
      this.pcpService.loadOps();
    }

    const subListOps = this.listOps$.subscribe({next: value => this.items = value});
    const subSelectedOp = this.selectedOp$.subscribe({next: value => this.selectedOp = value});

    this.sub.add(subListOps);
    this.sub.add(subSelectedOp);    
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    localStorage.removeItem('loadOpsLibCore');
  }

  isUndelivered(row: any, index: number) {
    return row.status !== 'delivered';
  }

  aguardarLoadOpsLibCore(): Promise<string> {
    return new Promise((resolve) => {
      const intervalo = setInterval(() => {
        const item = localStorage.getItem('loadOpsLibCore');
        if (item !== null) {
          clearInterval(intervalo);
          resolve(item);
        }
      }, 100); // verifica a cada 100ms
    });
  }

  onActionIniciarApontamento(op: Op) {
    this.pcpService.setSelectedOp(op);
    this.apontamento.op                 = this.selectedOp.numero;
    this.apontamento.dataOp             = new Date(this.selectedOp.dataPrevista);
    this.apontamento.produto            = this.selectedOp.produto;
    this.apontamento.unmed              = this.selectedOp.unmed;
    this.apontamento.quantidadePendente = this.selectedOp.quantidadePendente;
    this.modalApontamentoEl.open();
    console.log('Op selecionada:', this.selectedOp );
    console.log('Apontamento:'   , this.apontamento);
  }

  onButtonIniciarApontamento() {
    
    if(!this.formApontamentoEl.value.tempoDecorrido){
      this.formApontamentoEl.value.dataInicio = new Date(); //this.parseDataBr('27/06/2025');
      this.formApontamentoEl.value.horaInicio = this.getHoraAtual();
    }
    
    this.formApontamentoEl.value.dataTermino = new Date();
    this.formApontamentoEl.value.horaTermino = this.getHoraAtual();

    if(this.interval === null || this.interval === undefined){
      this.interval = setInterval(() => {
        this.formApontamentoEl.value.horaTermino = this.getHoraAtual();
        this.formApontamentoEl.value.tempoDecorrido = this.dfh(this.formApontamentoEl.value.horaInicio,this.formApontamentoEl.value.horaTermino);
        this.formApontamentoEl.value.quantidadeApont = this.formApontamentoEl.value.quantidadeApont + 1;
      },1000)
    }

    const notification: PoNotification = {
      duration: 1000,
      message: 'Apontamento iniciado'
    }

    this.notify.success(notification)
;
  };

  onButtonEncerrarApontamento() {

    if(this.interval === null){

      const notification: PoNotification = {
        duration: 1000,
        message: 'Não há apontamento à paralizar!'
      }

      this.notify.information(notification);
      return

    }

    clearInterval(this.interval);
    this.interval = null;

    const notification: PoNotification = {
      duration: 1000,
      message: 'Apontamento paralizado!'
    }

    this.notify.information(notification);

  }

  onButtonGravarApontamento(){
    
    if(this.interval !== null){
      
      const notification: PoNotification = {
        duration: 1000,
        message:'É necessário parar o apontamento para realizar a gravacao',
      }

      this.notify.warning(notification);
      return

    }

    const notification: PoNotification = {
      duration: 1000,
      message: 'Apontamento gravado com sucesso!!'
    }

    this.notify.success(notification);
    this.pcpService.setSelectedOp(new Op());
    this.modalApontamentoEl.close();

  };

  onButtonCancelarApontamento(){
    
    if(this.interval !== null){
      clearInterval(this.interval);
      this.interval = null;
    }

    this.pcpService.setSelectedOp(new Op());
    this.modalApontamentoEl.close();

  }

  onChangeFieldsApontamento(changedValue: PoDynamicFormFieldChanged) {
    return {
      value: {},
      fields: [],
    }
  }

  private getHoraAtual(){
    
    const data = new Date();
    
    const h = String(data.getHours()).padStart(2, '0');
    const m = String(data.getMinutes()).padStart(2, '0');
    const s = String(data.getSeconds()).padStart(2, '0');

    return `${h}:${m}:${s}`;

  }

  private hm(horaStr: string) {

    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;

  }

  private dfh(h1: string,h2: string){

    const m1 = this.hm(h1);
    const m2 = this.hm(h2);
    const diff = Math.abs(m1 - m2);

    const h = String(Math.floor(diff / 60)).padStart(2, '0');
    const m = String(diff % 60).padStart(2, '0');

    return `${h}:${m}`;   

  }
}
