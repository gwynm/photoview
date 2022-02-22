import React, { useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import PresentNavigationOverlay from './PresentNavigationOverlay'
import PresentMedia, { PresentMediaProps_Media } from './PresentMedia'
import { closePresentModeAction, GalleryAction } from '../photoGalleryReducer'

const StyledContainer = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: black;
  color: white;
  top: 0;
  left: 0;
  z-index: 100;
`

const PresentImageDescription = styled.div`
  position: absolute;
  bottom: 0;
  border-radius: 0.3em;
  width: 100%;
  background-color:rgba(0,0,0,0.6);
  color:#ffffff;
  text-align:center;
  z-index:10;
  color: white;
  font-size: 1.2em;
`


const PreventScroll = createGlobalStyle`
  * {
    overflow: hidden !important;
  }
`

type PresentViewProps = {
  className?: string
  imageLoaded?(): void
  activeMedia: PresentMediaProps_Media
  dispatchMedia: React.Dispatch<GalleryAction>
  disableSaveCloseInHistory?: boolean
}

const PresentView = ({
  className,
  imageLoaded,
  activeMedia,
  dispatchMedia,
  disableSaveCloseInHistory,
}: PresentViewProps) => {
  useEffect(() => {
    const keyDownEvent = (e: KeyboardEvent) => {
      if (e.key == 'ArrowRight') {
        e.stopPropagation()
        dispatchMedia({ type: 'nextImage' })
      }

      if (e.key == 'ArrowLeft') {
        e.stopPropagation()
        dispatchMedia({ type: 'previousImage' })
      }

      if (e.key == 'Escape') {
        e.stopPropagation()

        if (disableSaveCloseInHistory === true) {
          dispatchMedia({ type: 'closePresentMode' })
        } else {
          closePresentModeAction({ dispatchMedia })
        }
      }
    }

    document.addEventListener('keydown', keyDownEvent)

    return function cleanup() {
      document.removeEventListener('keydown', keyDownEvent)
    }
  })

  const formattedDate = (inDate: string | null | undefined): string => {
    const dateFormatterOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    const dateFormatter = new Intl.DateTimeFormat(
      'en-US',
      dateFormatterOptions
    )
    if (inDate) {
      return dateFormatter.format(new Date(inDate))
    } else {
      return 'Unknown date'
    }
  }
  
  return (
    <StyledContainer {...className}>
      <PreventScroll />
      <PresentNavigationOverlay
        dispatchMedia={dispatchMedia}
        disableSaveCloseInHistory
      >
        <div>
          <PresentImageDescription>
            {formattedDate(activeMedia.exif?.dateShot)}
            {activeMedia.exif && activeMedia.exif.imageDescription ? ": " + activeMedia.exif.imageDescription : ""}
          </PresentImageDescription>
          <PresentMedia media={activeMedia} imageLoaded={imageLoaded} />
        </div>
      </PresentNavigationOverlay>
    </StyledContainer>
  )
}

export default PresentView
