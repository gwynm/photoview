import { gql } from '@apollo/client'
import { saveTokenCookie, getBouncedUrl, saveBouncedUrl } from '../../helpers/authentication'
import styled from 'styled-components'

export const INITIAL_SETUP_QUERY = gql`
  query CheckInitialSetup {
    siteInfo {
      initialSetup
    }
  }
`

export function login(token: string) {
  saveTokenCookie(token)
  const newUrl = getBouncedUrl();
  saveBouncedUrl('/');
  window.location.href = newUrl || '/';
}

export const Container = styled.div.attrs({ className: 'mt-20' })``
