import prisma from "../config/prisma.js";

export async function listarOMs(req, res) {

  try {

    const oms =

      await prisma.oM.findMany({

        orderBy: {

          codom: "asc"

        }

      });

    return res.json(

      oms

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        "Erro ao listar OMs."

    });

  }

}

export async function selecionarOM(req, res) {

  try {

    const {

      codom,

      sigla

    } = req.body;

    const om =

      await prisma.oM.upsert({

        where: {

          codom

        },

        update: {

          sigla

        },

        create: {

          codom,

          sigla

        }

      });

    return res.json(

      om

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        "Erro ao salvar OM."

    });

  }

}

export async function criarOM(req, res) {

  try {

    if (

      req.usuario.perfil !== "GERAL"

    ) {

      return res.status(403).json({

        error:

          "Somente usuários GERAL podem cadastrar Organizações Militares."

      });

    }

    const {

      codom,

      sigla,

      cidade,

      uf

    } = req.body;

    const camposObrigatorios = {

      CODOM: codom,

      Sigla: sigla,

      Cidade: cidade,

      UF: uf

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

    const omExistente =

      await prisma.oM.findUnique({

        where: {

          codom:

            codom.trim()

        }

      });

    if (

      omExistente

    ) {

      return res.status(400).json({

        error:

          "Já existe uma Organização Militar com este CODOM."

      });

    }

    const om =

      await prisma.oM.create({

        data: {

          codom:

            codom.trim(),

          sigla:

            sigla.trim(),

          cidade:

            cidade.trim(),

          uf:

            uf.trim().toUpperCase()

        }

      });

    return res.status(201).json(

      om

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}

export async function atualizarOM(req, res) {

  try {

    const { id } = req.params;

    const perfil = req.usuario.perfil;

    const omLogado = req.usuario.omId;

    const omAtual =

      await prisma.oM.findUnique({

        where: {

          id: Number(id)

        }

      });

    if (!omAtual) {

      return res.status(404).json({

        error: "OM não encontrada."

      });

    }

    if (

      perfil !== "GERAL" &&

      perfil !== "ADMINISTRADOR"

    ) {

      return res.status(403).json({

        error: "Sem permissão."

      });

    }

    if (

      perfil === "ADMINISTRADOR" &&

      omAtual.id !== omLogado

    ) {

      return res.status(403).json({

        error: "Você só pode alterar a sua própria OM."

      });

    }

    const {

      codom,

      sigla,

      cidade,

      uf

    } = req.body;

    if (

      codom &&

      codom.trim() !== omAtual.codom

    ) {

      const codomExistente =

        await prisma.oM.findUnique({

          where: {

            codom: codom.trim()

          }

        });

      if (

        codomExistente

      ) {

        return res.status(400).json({

          error:

            "Já existe uma Organização Militar com este CODOM."

        });

      }

    }

    const om =

      await prisma.oM.update({

        where: {

          id: Number(id)

        },

        data: {

          codom:

            codom !== undefined

              ? codom.trim()

              : omAtual.codom,

          sigla:

            sigla !== undefined

              ? sigla.trim()

              : omAtual.sigla,

          cidade:

            cidade !== undefined

              ? cidade.trim()

              : omAtual.cidade,

          uf:

            uf !== undefined

              ? uf.trim().toUpperCase()

              : omAtual.uf

        }

      });

    return res.json(

      om

    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}

export async function excluirOM(req, res) {

  try {

    if (

      req.usuario.perfil !== "GERAL"

    ) {

      return res.status(403).json({

        error:

          "Somente usuários GERAL podem excluir Organizações Militares."

      });

    }

    const { id } = req.params;

    const om =

      await prisma.oM.findUnique({

        where: {

          id: Number(id)

        },

        include: {

          usuarios: true,

          militares: true,

          subunidades: true

        }

      });

    if (!om) {

      return res.status(404).json({

        error:

          "OM não encontrada."

      });

    }

    if (

      om.usuarios.length > 0 ||

      om.militares.length > 0 ||

      om.subunidades.length > 0

    ) {

      return res.status(400).json({

        error:

          "Esta Organização Militar possui registros vinculados e não pode ser excluída."

      });

    }

    await prisma.oM.delete({

      where: {

        id: Number(id)

      }

    });

    return res.json({

      message:

        "Organização Militar excluída com sucesso."

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:

        error.message

    });

  }

}