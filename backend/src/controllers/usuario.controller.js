import prisma from "../config/prisma.js";

import bcrypt from "bcrypt";

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

      perfilLogado !== "GERAL"

      &&

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

    if (
      usuarioAtual.perfil === "GERAL" &&
      perfilLogado !== "GERAL"
    ) {
      return res.status(403).json({
        error: "Somente um usuário GERAL pode alterar outro usuário GERAL."
      });
    }

    if (!usuarioAtual) {

      return res.status(404).json({

        error:

          "Usuário não encontrado."

      });

    }

    if (

      perfilLogado !== "GERAL"

      &&

      usuarioAtual.omId !== omLogado

    ) {

      return res.status(403).json({

        error:

          "Sem permissão para alterar este usuário."

      });

    }

    if (

      perfilLogado !== "GERAL"

      &&

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

    const perfilAtualizado = perfil || usuarioAtual.perfil;

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

            perfilAtualizado === "GERAL"

              ? "ATIVO"

              : (req.body.status || usuarioAtual.status),

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

      perfilLogado !== "GERAL"

      &&

      usuario.omId !== omLogado

    ) {

      return res.status(403).json({

        error:

          "Sem permissão para excluir este usuário."

      });

    }

    if (

      usuario.perfil === "GERAL"

      &&

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