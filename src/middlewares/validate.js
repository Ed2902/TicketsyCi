// Debe exportar EXACTAMENTE un export con nombre: validate
export const validate =
  (schema) =>
  (req, _res, next) => {
    // Si no usas zod o el schema es {}, pasa directo
    if (!schema || typeof schema.parse !== 'function') return next();
    try {
      const parsed = schema.parse({
        params: req.params,
        query: req.query,
        body:  req.body,
      });
      req.validated = parsed;
      if (parsed.body) req.body = parsed.body;
      next();
    } catch (e) {
      e.status = 400;
      e.details = e.errors || e.issues;
      next(e);
    }
  };
export default validate;