export default function autorizar(...perfisPermitidos) {

  return (req, res, next) => {

    console.log(
      "AUTORIZAÇÃO:",
      req.method,
      req.originalUrl,
      "perfil:",
      req.usuario?.perfil
    );

    if (!req.usuario) {

      return res.status(401).json({
        error: "Usuário não autenticado."
      });

    }

    // Perfil GERAL possui acesso total
    if (req.usuario.perfil === "GERAL") {

      return next();

    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {

      return res.status(403).json({
        error: "Você não possui permissão para acessar este recurso."
      });

    }

    next();

  };

}