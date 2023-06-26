module.exports = {
  autenticar() {
    return (req, res, next) => {
      console.log('auticador');
      // console.log(req.session);
      if (req.session && req.session.autenticado) {
        // O usuário está autenticado, permita o acesso à rota
        req.session.timestamp = Date.now();
        next();
      } else {
        // O usuário não está autenticado, redirecione para a página de login
        res.redirect('/usuario/logar');
      }
    };
  },
  criarSessao() {
    const session = require('express-session')

    return session({
      secret: 'Conta do banco',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 600000
      }
    });
  }
}