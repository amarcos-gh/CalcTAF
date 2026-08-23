import prisma from "../config/prisma.js";

import bcrypt from "bcrypt";

import crypto from "crypto";

export async function listarUsuarios(req, res) {

  try {

    const perfil = req.usuario.perfil;

    const omId = req.usuario.omId;

    const where =

      perfil === "GERAL"

        ? {}

        : {

            omId

          };

    const usuarios =

      await prisma.usuario.findMany({

        where,

        include: {

          om: true

        },

        orderBy: {

          nome: "asc"

        }

      });

    return res.json(

      usuarios

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}

export async function criarUsuario(req, res) {

  try {

    const perfilLogado =

      req.usuario.perfil;

    const omLogado =

      req.usuario.omId;

    let {

      nome,

      email,

      senha,

      perfil,

      omId,

      subunidade

    } = req.body;

    const camposObrigatorios = {

      Nome: nome,

      Email: email,

      Senha: senha,

      Perfil: perfil,

      OM: omId

    };

    const faltando =

      Object.entries(

        camposObrigatorios

      )

      .filter(

        ([_, valor]) =>

          valor === null ||

          valor === undefined ||

          (

            typeof valor === "string"

            &&

            !valor.trim()

          )

      )

      .map(

        ([campo]) =>

          campo

      );

    if (

      faltando.length

    ) {

      return res.status(400).json({

        error:

          `Campos obrigatórios não preenchidos: ${faltando.join(", ")}`

      });

    }

    if (

      perfilLogado !== "GERAL" &&
      perfil === "GERAL"

    ) {

      return res.status(403).json({

        error:

          "Somente um usuário GERAL pode criar outro usuário GERAL."

      });

    }

    if (

      perfilLogado !== "GERAL"

    ) {

      omId = omLogado;

    }

    const usuarioExistente =

      await prisma.usuario.findUnique({

        where: {

          email:

            email.trim()

        }

      });

    if (

      usuarioExistente

    ) {

      return res.status(400).json({

        error:

          "E-mail já cadastrado."

      });

    }

    const omExiste =

      await prisma.oM.findFirst({

        where: {

          id:

            Number(

              omId

            )

        }

      });

    if (

      !omExiste

    ) {

      return res.status(400).json({

        error:

          "OM inválida."

      });

    }

    const senhaHash =

      await bcrypt.hash(

        senha,

        10

      );

    const usuario =

      await prisma.usuario.create({

        data: {

          nome:

            nome.trim(),

          email:

            email.trim(),

          senha:

            senhaHash,

          perfil,

          omId:

            Number(

              omId

            ),

          subunidade:
            subunidade
              ? subunidade.trim()
              : null

        },

        include: {

          om: true

        }

      });

    return res.status(201).json(

      usuario

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}

export async function atualizarUsuario(req, res) {

  try {

    const { id } = req.params;

    const perfilLogado = req.usuario.perfil;

    const omLogado = req.usuario.omId;

    let {

      nome,

      email,

      senha,

      perfil,

      omId,

      subunidade

    } = req.body;

    const usuarioAtual =

      await prisma.usuario.findUnique({

        where: {

          id: Number(id)

        },

        include: {

          om: true

        }

      });

        if (!usuarioAtual) {

      return res.status(404).json({

        error:

          "Usuário não encontrado."

      });

    }

        if (
          usuarioAtual.perfil === "GERAL" &&
          perfilLogado !== "GERAL"
        ) {

          return res.status(403).json({

            error:

              "Somente um usuário GERAL pode alterar outro usuário GERAL."

          });

        }

        if (
          perfilLogado === "ADMINISTRADOR" &&
          usuarioAtual.perfil === "ADMINISTRADOR"
        ) {

          return res.status(403).json({

            error:

              "O ADMINISTRADOR não pode alterar outro ADMINISTRADOR. Solicite a atuação do GERAL."

          });

        }

        if (

          perfilLogado !== "GERAL" &&
          usuarioAtual.omId !== omLogado

        ) {

      return res.status(403).json({

        error:

          "Sem permissão para alterar este usuário."

      });

    }

    if (

      perfilLogado !== "GERAL" &&
      perfil === "GERAL"

    ) {

      return res.status(403).json({

        error:

          "Somente um usuário GERAL pode definir o perfil GERAL."

      });

    }

    if (

      perfilLogado !== "GERAL"

    ) {

    if (
        Number(omId) !== Number(omLogado)
      ) {

        return res.status(403).json({

          error:

            "Você não pode alterar a Organização Militar deste usuário."

        });

      }

      omId = omLogado;

    }

    if (

      email &&

      email.trim()

    ) {

      const emailExistente =

        await prisma.usuario.findFirst({

          where: {

            email:

              email.trim(),

            NOT: {

              id:

                Number(id)

            }

          }

        });

      if (

        emailExistente

      ) {

        return res.status(400).json({

          error:

            "Já existe outro usuário com este e-mail."

        });

      }

    }

    const omExiste =

      await prisma.oM.findFirst({

        where: {

          id:

            Number(

              omId

            )

        }

      });

    if (

      !omExiste

    ) {

      return res.status(400).json({

        error:

          "OM inválida."

      });

    }

        const perfilAtualizado =
      perfil !== undefined
        ? perfil
        : usuarioAtual.perfil;

    let statusAtualizado =
      usuarioAtual.status;

    // =====================================================
    // USUÁRIO SEM PERFIL
    // Somente o GERAL ou o ADMINISTRADOR da própria OM
    // poderá atribuir OPERADOR ou AVALIADOR.
    // =====================================================

    if (
      usuarioAtual.perfil === null
    ) {

      if (
        perfilLogado !== "GERAL" &&
        perfilLogado !== "ADMINISTRADOR"
      ) {

        return res.status(403).json({

          error:
            "Sem permissão para atribuir perfil a este usuário."

        });

      }

      if (
        perfilLogado === "ADMINISTRADOR" &&
        perfilAtualizado !== "OPERADOR" &&
        perfilAtualizado !== "AVALIADOR"
      ) {

        return res.status(403).json({

          error:
            "O ADMINISTRADOR pode atribuir somente os perfis OPERADOR e AVALIADOR."

        });

      }

      statusAtualizado =
        req.body.status ||
        usuarioAtual.status;

    }

    // =====================================================
    // GERAL
    // Pode administrar qualquer perfil.
    // Pode definir qualquer Status.
    // =====================================================

    else if (
      perfilLogado === "GERAL"
    ) {

      statusAtualizado =
        req.body.status ||
        usuarioAtual.status;

    }

    // =====================================================
    // ADMINISTRADOR
    // Pode administrar somente OPERADOR e AVALIADOR
    // da própria OM.
    // =====================================================

    else if (
      perfilLogado === "ADMINISTRADOR"
    ) {

      if (
        usuarioAtual.perfil === "OPERADOR" ||
        usuarioAtual.perfil === "AVALIADOR"
      ) {

        if (
          perfilAtualizado !== "OPERADOR" &&
          perfilAtualizado !== "AVALIADOR"
        ) {

          return res.status(403).json({

            error:
              "O ADMINISTRADOR pode administrar somente OPERADOR e AVALIADOR."

          });

        }

        statusAtualizado =
          req.body.status ||
          usuarioAtual.status;

      }

      else {

        return res.status(403).json({

          error:
            "O ADMINISTRADOR não pode administrar este perfil."

        });

      }

    }

    const dadosAtualizacao = {

      nome:

        nome
          ? nome.trim()
          : usuarioAtual.nome,

      email:

        email
          ? email.trim()
          : usuarioAtual.email,

      perfil:

        perfilAtualizado,

      status:

        statusAtualizado,

      omId:

        perfilAtualizado === "GERAL"

          ? usuarioAtual.omId

          : Number(omId),

      subunidade:

        perfilAtualizado === "GERAL"

          ? usuarioAtual.subunidade

          : (

              subunidade !== undefined

                ? subunidade.trim()

                : usuarioAtual.subunidade

            )

    };

    if (

      senha &&

      senha.trim()

    ) {

      dadosAtualizacao.senha =

        await bcrypt.hash(

          senha,

          10

        );

    }

    const usuario =

      await prisma.usuario.update({

        where: {

          id:

            Number(id)

        },

        data:

          dadosAtualizacao,

        include: {

          om: true

        }

      });

    return res.json(

      usuario

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}

export async function excluirUsuario(req, res) {

  try {

    const { id } = req.params;

    const perfilLogado = req.usuario.perfil;

    const omLogado = req.usuario.omId;

    if (

      Number(id) === req.usuario.usuarioId

    ) {

      return res.status(400).json({

        error:

          "Você não pode excluir o próprio usuário."

      });

    }

    const usuario =

      await prisma.usuario.findUnique({

        where: {

          id:

            Number(id)

        }

      });

    if (!usuario) {

      return res.status(404).json({

        error:

          "Usuário não encontrado."

      });

    }

    if (

      perfilLogado !== "GERAL" &&
      usuario.omId !== omLogado

    ) {

      return res.status(403).json({

        error:

          "Sem permissão para excluir este usuário."

      });

    }

    if (

      usuario.perfil === "GERAL" &&
      perfilLogado !== "GERAL"

    ) {

      return res.status(403).json({

        error:

          "Usuário GERAL só pode ser excluído por outro usuário GERAL."

      });

    }

    await prisma.usuario.delete({

      where: {

        id:

          Number(id)

      }

    });

    return res.json({

      message:

        "Usuário excluído com sucesso."

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}

export async function solicitarAcesso(req, res) {

  try {

    const {
      email,
      tipo
    } = req.body;

    if (
      !email ||
      !email.trim()
    ) {

      return res.status(400).json({

        error:
          "Informe o e-mail."

      });

    }

    if (
      tipo !== "NOVA_SENHA" &&
      tipo !== "ATIVACAO_PERFIL"
    ) {

      return res.status(400).json({

        error:
          "Tipo de solicitação inválido."

      });

    }

    const emailNormalizado =
      email.trim().toLowerCase();

    const usuario =
      await prisma.usuario.findUnique({

        where: {

          email:
            emailNormalizado

        }

      });

    /*
    |--------------------------------------------------------------------------
    | USUÁRIO NÃO ENCONTRADO
    |--------------------------------------------------------------------------
    |
    | Não informamos ao solicitante se o e-mail
    | existe ou não no sistema.
    |
    */

    if (!usuario) {

      return res.json({

        message:
          "Se o e-mail estiver cadastrado, a solicitação será processada."

      });

    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAÇÃO DE SOLICITAÇÃO PENDENTE
    |--------------------------------------------------------------------------
    */

    const solicitacaoExistente =
      await prisma.solicitacaoAcesso.findFirst({

        where: {

          email:
            emailNormalizado,

          tipo,

          status:
            "PENDENTE"

        }

      });

    if (
      solicitacaoExistente
    ) {

      return res.json({

        message:
          "Já existe uma solicitação pendente para este e-mail."

      });

    }

    /*
    |--------------------------------------------------------------------------
    | TOKEN
    |--------------------------------------------------------------------------
    */

    const token =
      tipo === "NOVA_SENHA"

        ? crypto.randomBytes(32).toString("hex")

        : null;

    const expiraEm =
      token

        ? new Date(
            Date.now() +
            30 * 60 * 1000
          )

        : null;

    /*
    |--------------------------------------------------------------------------
    | CRIA SOLICITAÇÃO
    |--------------------------------------------------------------------------
    */

    await prisma.solicitacaoAcesso.create({

      data: {

        email:
          emailNormalizado,

        tipo,

        status:
          "PENDENTE",

        token,

        expiraEm

      }

    });

    return res.status(201).json({

      message:
        "Solicitação registrada com sucesso."

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao registrar solicitação."

    });

  }

}

export async function listarSolicitacoesAcesso(req, res) {

  try {

    const solicitacoes =
      await prisma.solicitacaoAcesso.findMany({

        where: {

          status: "PENDENTE"

        },

        orderBy: {

          createdAt: "asc"

        }

      });

    return res.json(

      solicitacoes

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao carregar solicitações de acesso."

    });

  }

}

export async function cancelarSolicitacaoAcesso(req, res) {

  try {

    const id = Number(req.params.id);

    if (!id) {

      return res.status(400).json({

        error:
          "ID da solicitação inválido."

      });

    }

    const solicitacao =
      await prisma.solicitacaoAcesso.findUnique({

        where: {

          id

        }

      });

    if (!solicitacao) {

      return res.status(404).json({

        error:
          "Solicitação não encontrada."

      });

    }

    if (
      solicitacao.status !== "PENDENTE"
    ) {

      return res.status(400).json({

        error:
          "Esta solicitação não está pendente."

      });

    }

    const solicitacaoAtualizada =
      await prisma.solicitacaoAcesso.update({

        where: {

          id

        },

        data: {

          status:
            "CANCELADA"

        }

      });

    return res.json(

      solicitacaoAtualizada

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao cancelar solicitação."

    });

  }

}

export async function atenderNovaSenha(req, res) {

  try {

    const id = Number(req.params.id);

    const {
      senha
    } = req.body;

    if (!id) {

      return res.status(400).json({

        error:
          "ID da solicitação inválido."

      });

    }

    if (
      !senha ||
      !senha.trim()
    ) {

      return res.status(400).json({

        error:
          "Informe a nova senha."

      });

    }

    const solicitacao =
      await prisma.solicitacaoAcesso.findUnique({

        where: {

          id

        }

      });

    if (!solicitacao) {

      return res.status(404).json({

        error:
          "Solicitação não encontrada."

      });

    }

    if (
      solicitacao.status !== "PENDENTE"
    ) {

      return res.status(400).json({

        error:
          "Esta solicitação não está pendente."

      });

    }

    if (
      solicitacao.tipo !== "NOVA_SENHA"
    ) {

      return res.status(400).json({

        error:
          "Esta solicitação não é de nova senha."

      });

    }

    const usuario =
      await prisma.usuario.findUnique({

        where: {

          email:
            solicitacao.email

        }

      });

    if (!usuario) {

      return res.status(404).json({

        error:
          "Usuário não encontrado para esta solicitação."

      });

    }

    const senhaHash =
      await bcrypt.hash(
        senha.trim(),
        10
      );

    const resultado =
      await prisma.$transaction(

        async (tx) => {

          const usuarioAtualizado =
            await tx.usuario.update({

              where: {

                id:
                  usuario.id

              },

              data: {

                senha:
                  senhaHash

              }

            });

          const solicitacaoAtualizada =
            await tx.solicitacaoAcesso.update({

              where: {

                id

              },

              data: {

                status:
                  "ATENDIDA",

                token:
                  null,

                expiraEm:
                  null

              }

            });

          return {

            usuario:
              usuarioAtualizado,

            solicitacao:
              solicitacaoAtualizada

          };

        }

      );

    return res.json({

      message:
        "Nova senha definida com sucesso.",

      solicitacao:
        resultado.solicitacao

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao atender solicitação de nova senha."

    });

  }

}

export async function atenderAtivacaoPerfil(req, res) {

  try {

    const id = Number(req.params.id);

    const {
      perfil
    } = req.body;

    if (!id) {

      return res.status(400).json({

        error:
          "ID da solicitação inválido."

      });

    }

    if (!perfil) {

      return res.status(400).json({

        error:
          "Informe o perfil que será atribuído."

      });

    }

    const perfisPermitidos = [

      "GERAL",

      "ADMINISTRADOR",

      "OPERADOR",

      "AVALIADOR"

    ];

    if (
      !perfisPermitidos.includes(
        perfil
      )
    ) {

      return res.status(400).json({

        error:
          "Perfil inválido."

      });

    }

    const solicitacao =
      await prisma.solicitacaoAcesso.findUnique({

        where: {

          id

        }

      });

    if (!solicitacao) {

      return res.status(404).json({

        error:
          "Solicitação não encontrada."

      });

    }

    if (
      solicitacao.status !== "PENDENTE"
    ) {

      return res.status(400).json({

        error:
          "Esta solicitação não está pendente."

      });

    }

    if (
      solicitacao.tipo !== "ATIVACAO_PERFIL"
    ) {

      return res.status(400).json({

        error:
          "Esta solicitação não é de ativação de perfil."

      });

    }

    const usuario =
      await prisma.usuario.findUnique({

        where: {

          email:
            solicitacao.email

        }

      });

    if (!usuario) {

      return res.status(404).json({

        error:
          "Usuário não encontrado para esta solicitação."

      });

    }

    const resultado =
      await prisma.$transaction(

        async (tx) => {

          const usuarioAtualizado =
            await tx.usuario.update({

              where: {

                id:
                  usuario.id

              },

              data: {

                perfil,

                status:
                  "ATIVO"

              }

            });

          const solicitacaoAtualizada =
            await tx.solicitacaoAcesso.update({

              where: {

                id

              },

              data: {

                status:
                  "ATENDIDA",

                token:
                  null,

                expiraEm:
                  null

              }

            });

          return {

            usuario:
              usuarioAtualizado,

            solicitacao:
              solicitacaoAtualizada

          };

        }

      );

    return res.json({

      message:
        "Perfil ativado com sucesso.",

      solicitacao:
        resultado.solicitacao

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erro ao ativar perfil."

    });

  }

}