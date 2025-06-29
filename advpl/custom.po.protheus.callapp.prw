#include 'totvs.ch'

/*/{Protheus.doc} U_POAPONTA
    Exemplo de funcionamento da biblioteca po-lib-core
    @type  Function
    @author Klaus Wolfgram
    @since 28/06/2025
    @version 1.0
    /*/
Function U_POAPONTA()
    fwCallApp("po-aponta")
Return 

/*/{Protheus.doc} jsToAdvpl
    Funcao estatica usada para receber e enviar mensagens para o app angular.
    @type  Static Function
    @author Klaus Wolfgram
    @since 28/06/2025
    @version 1.0  
    /*/
Static Function jsToAdvpl(oWebChannel, cType, cContent)

    do case 

        case cType == 'mensagemjs'
            // Exemplo de mensagem
            // oWebChannel:sendMessage({type: 'mensagemjs', content: 'Mensagem de teste'})
            fwAlertInfo(cContent, "Mensagem JS")
        
        case cType == 'mensagemProtheus'     
            oWebChannel:advplToJs('mensagemProtheus','Olá do Protheus!')

        case cType == 'loadOpsLibCore'
            cContent := fnLoadOps()
            oWebChannel:advplToJs('loadOpsLibCore',cContent)
            
    end case
    
Return .T.

/*/{Protheus.doc} fnLoadOps
    Executa a listagem de ops em forma de string json para envio à app poui usando protheus lib core
    @type  Static Function
    @author Klaus Wolfgram
    @since 28/06/2025
    @version 1.0
    /*/
Static Function fnLoadOps()

    Local cListOpsStr := ''
    Local cAliasSQL   := ''
    Local cSQL        := ''
    Local jOp         := jsonObject():new()
    Local jListOps    := jsonObject():new()

    cSQL              := "SELECT R_E_C_N_O_ RECNO FROM " + retSQLName("SC2") + " SC2 WHERE SC2.D_E_L_E_T_ = ' ' AND C2_DATRF = ' ' ORDER BY C2_FILIAL, C2_NUM DESC, C2_ITEM, C2_SEQUEN"
    cAliasSQL         := mpSysOpenQuery(cSQL)

    jListOps['listOps'] := array(0)

    While !(cAliasSQL)->(eof())

        SC2->(dbSetOrder(1),dbGoTo((cAliasSQL)->RECNO))
        SB1->(dbSetOrder(1),dbSeek(xFilial(alias())+SC2->C2_PRODUTO))

        jOp                             := jsonObject():new()
        jOp['status'                  ] := if(SC2->C2_QUJE == 0,'1','2')
        jOp['numero'                  ] := SC2->(C2_FILIAL+C2_NUM+C2_ITEM+C2_SEQUEN)
        jOp['produto'                 ] := SB1->(alltrim(B1_DESC))
        jOp['unmed'                   ] := SB1->B1_UM
        jOp['quantidade'              ] := SC2->C2_QUANT
        jOp['quantidadeApontada'      ] := SC2->C2_QUJE
        jOp['quantidadePendente'      ] := SC2->(C2_QUANT - C2_QUJE)
        jOp['dataInicio'              ] := SC2->C2_DATPRI
        jOp['dataPrevista'            ] := SC2->(if(empty(C2_DATPRI),date(),C2_DATPRI))      
        jOp['dataEncerramento'        ] := SC2->C2_DATRF
        jOp['dataPrevistaEncerramento'] := SC2->C2_DATPRF 
        jOp['apontamentos'            ] := array(0)

        aadd(jListOps['listOps'],jOp)

        (cAliasSQL)->(dbSkip())

    Enddo

    (cAliasSQL)->(dbCloseArea())

    cListOpsStr := jListOps:toJson()
    
Return cListOpsStr
