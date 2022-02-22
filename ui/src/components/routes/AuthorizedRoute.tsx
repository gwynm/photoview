import { useLazyQuery } from '@apollo/client'
import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { authToken, getBouncedPath, saveBouncedPath } from '../../helpers/authentication'
import { ADMIN_QUERY } from '../layout/Layout'

export const useIsAdmin = () => {
  const [fetchAdminQuery, { data, called }] = useLazyQuery(ADMIN_QUERY)

  useEffect(() => {
    if (authToken() && !called) {
      fetchAdminQuery()
    }
  }, [authToken()])

  if (!authToken()) {
    return false
  }

  return data?.myUser?.admin
}

export const Authorized = ({ children }: { children: JSX.Element }) => {
  const token = authToken()

  return token ? children : null
}

interface AuthorizedRouteProps {
  children: React.ReactNode
}

const AuthorizedRoute = ({ children }: AuthorizedRouteProps) => {
  const token = authToken()
  const bouncedPath = getBouncedPath();
  
  if (!token) {
    saveBouncedPath(window.location.pathname);
    return <Navigate to="/" />
  } else if (bouncedPath) {
    saveBouncedPath('');
    return <Navigate to={bouncedPath} />
  } else {
    return <>{children}</>
  }
}

export default AuthorizedRoute
