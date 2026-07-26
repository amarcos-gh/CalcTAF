import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "calctaf_web_secret";

export default function auth(req, res, next) {

  const authorization =
    req.headers.authorization;

  if (!authorization) {

    return res.status(401).json({
      error: "Token não informado."
    });

  }

  const partes =
    authorization.split(" ");

  if (
    partes.length !== 2 ||
    partes[0] !== "Bearer"
  ) {

    return res.status(401).json({
      error: "Formato do token inválido."
    });

  }

  const token = partes[1];

  try {

    const usuario =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.usuario = usuario;

    next();

  } catch (error) {

    return res.status(401).json({
      error: "Token inválido ou expirado."
    });

  }

}