#include 'totvs.ch'

/*/{Protheus.doc} U_CallApp1
    (long_description)
    @type  Function
    @author user
    @since 31/05/2025
    @version version
    @param param_name, param_type, param_descr
    @return return_var, return_type, return_description
    @example
    (examples)
    @see (links_or_references)
    /*/
Function U_POAPONTA()
    fwCallApp("po-aponta")
Return 

/*/{Protheus.doc} nomeStaticFunction
    (long_description)
    @type  Static Function
    @author user
    @since 31/05/2025
    @version version
    @param param_name, param_type, param_descr
    @return return_var, return_type, return_description
    @example
    (examples)
    @see (links_or_references)
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
    @since 27/06/2025
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
        jOp['quantidade'              ] := SC2->C2_QUANT
        jOp['quantidadeApontada'      ] := SC2->C2_QUJE
        jOp['quantidadePendente'      ] := SC2->(C2_QUANT - C2_QUJE)
        jOp['dataInicio'              ] := SC2->C2_DATPRI
        jOp['dataPrevista'            ] := SC2->C2_DATPRI      
        jOp['dataEncerramento'        ] := SC2->C2_DATRF
        jOp['dataPrevistaEncerramento'] := SC2->C2_DATPRF 
        jOp['apontamentos'            ] := array(0)

        aadd(jListOps['listOps'],jOp)

        (cAliasSQL)->(dbSkip())

    Enddo

    (cAliasSQL)->(dbCloseArea())

    cListOpsStr := jListOps:toJson()
    
Return cListOpsStr
