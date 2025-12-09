export function getOrgAndPrincipal(req) {

  let orgId = req.user?.orgId
  let principalId = req.user?.principalId

  // 2) Headers (fallback)
  if (!orgId && req.headers['x-org-id']) {
    orgId = String(req.headers['x-org-id'])
  }
  if (!principalId && req.headers['x-principal-id']) {
    principalId = String(req.headers['x-principal-id'])
  }

  // 3) Env en dev (opcional)
  if (!orgId && process.env.DEFAULT_ORG_ID) {
    orgId = process.env.DEFAULT_ORG_ID
  }

  if (!orgId) {
    const error = new Error('orgId es requerido')
    error.status = 400
    throw error
  }

  return { orgId, principalId }
}
