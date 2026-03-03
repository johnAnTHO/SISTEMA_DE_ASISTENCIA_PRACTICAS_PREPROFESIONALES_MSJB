const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "¡No se proporcionó un token! Inicia sesión para continuar."
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "¡No autorizado! Tu sesión ha expirado o es inválida."
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

isAdmin = (req, res, next) => {
  if (req.userRole === "ADMIN") {
    next();
    return;
  }
  res.status(403).send({
    message: "¡Requiere rol de Administrador!"
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
};

module.exports = authJwt;
