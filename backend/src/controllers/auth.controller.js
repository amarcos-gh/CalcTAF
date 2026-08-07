import prisma from "../config/prisma.js";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "calctaf_web_secret";

export async function cadastrarUsuario(req, res) {

  try {

    const {

      nome,

      email,

      senha,

      omId

    } = req.body;

    const usuarioExistente =

      await prisma.usuario.findUnique({

        where: {

          email
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

    const senhaHash =

      await bcrypt.hash(

        senha,

        10
      );

    const usuario =

      await prisma.usuario.create({

        data: {

          nome,

          email,

          senha:

            senhaHash,

          omId:

            Number(
              omId
            )
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

export async function loginUsuario(req, res) {

  try {

    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({

      where: { email },

      include: { om: true }

    });

    if (!usuario) {

      return res.status(400).json({
        error: "Usuário não encontrado."
      });

    }

    if (usuario.status === "PENDENTE") {

      return res.status(403).json({
        error:
          "Sua conta ainda está aguardando aprovação do Administrador."
      });

    }

    if (usuario.status === "BLOQUEADO") {

      return res.status(403).json({
        error:
          "Sua conta encontra-se bloqueada. Procure o Administrador."
      });

    }

    if (!usuario.perfil) {

      return res.status(403).json({
        error:
          "Sua conta ainda não possui um perfil de acesso."
      });

    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {

      return res.status(400).json({
        error: "Senha inválida."
      });

    }

    const token = jwt.sign(
      {
        usuarioId: usuario.id,
        perfil: usuario.perfil,
        omId: usuario.omId
      },
      JWT_SECRET,
      {
        expiresIn: "12h"
      }
    );

    return res.json({

      token,

      usuarioId: usuario.id,

      nome: usuario.nome,

      perfil: usuario.perfil,

      omId: usuario.om.id,

      nomeOM: usuario.om.sigla,

      codom: usuario.om.codom,

      subunidade: usuario.subunidade

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

}