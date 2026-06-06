# 003 — Documentação do contrato de API e regras de negócio

**Data:** 05/06/2026  
**Status:** implementado  
**Contexto:** Antes de iniciar qualquer refatoração do código, decidi documentar formalmente o que o sistema já faz — separando o contrato técnico da API das regras de domínio do negócio.

## O que motivou essa decisão

A auditoria do backend (ADR 002) identificou problemas reais no código, mas revelou algo mais importante: o sistema não tinha documentação que descrevesse *o que deveria funcionar*, independente de como estava implementado.

Refatorar sem essa base seria arriscado — qualquer mudança poderia quebrar comportamentos corretos sem que eu percebesse, porque não havia referência clara do que era esperado.

## A decisão

Criar dois documentos separados antes de tocar em qualquer arquivo de código:

**`contrato-api.md`** — descreve como o backend expõe as regras via HTTP: endpoints, métodos, códigos de resposta, formatos de body e restrições de autenticação. É o contrato entre o servidor e qualquer consumidor — frontend, testes automatizados ou integrações futuras como o n8n.

**`regras-de-negocio.md`** — descreve o que o sistema deve garantir em nível de domínio, sem mencionar frameworks, bibliotecas ou componentes de UI. As regras aqui valem independentemente de onde a operação é iniciada.

## Por que separar os dois documentos

Misturar regras de negócio com detalhes técnicos de HTTP é um erro comum que cria documentação difícil de manter. Quando o frontend muda, o contrato de API pode mudar — mas as regras de negócio não deveriam mudar junto.

Exemplo concreto: `RN-ACESSO-04` diz que *"um Solicitante só pode alterar o status do próprio ticket para Fechado"*. Isso é uma regra de domínio. O fato de que essa regra é aplicada via `PATCH /tickets/:ticketId` com retorno `403` é um detalhe de contrato. São camadas diferentes.

## O que foi registrado

O `regras-de-negocio.md` incluiu um status de implementação explícito para `RN-VIS-01` (filtragem de notas internas para Solicitantes), que está especificada mas ainda não implementada no backend. Documentar lacunas é tão importante quanto documentar o que funciona.

## O que aprendi

- Documentar antes de refatorar força uma leitura cuidadosa do código existente — durante a escrita do contrato, identifiquei inconsistências que não estavam na auditoria automática
- A separação entre *o que o sistema faz* (contrato) e *por que faz* (regras de negócio) é uma prática de análise de sistemas, não apenas de desenvolvimento
- Registrar o que ainda não está implementado é uma forma de honestidade técnica que facilita o planejamento das próximas etapas

## Referências

- `/docs/contrato-api.md`
- `/docs/regras-de-negocio.md`
- `/docs/decisions/002-auditoria-api-backend.md`
