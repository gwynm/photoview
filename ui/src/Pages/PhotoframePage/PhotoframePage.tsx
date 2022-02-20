import React, { useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  myTimeline, myTimelineVariables
} from '../../components/timelineGallery/__generated__/myTimeline'
import PresentView from '../../components/photoGallery/presentView/PresentView'

/* Reuse timeline query to get all media */
const MAX_PHOTOFRAME_SET_SIZE = 9999;
const PHOTOFRAME_RELOAD_MSEC = 12 * 60 * 60 * 1000; //12 hours
const PHOTOFRAME_FLIP_MSEC = 60 * 1000; //1 minute

const MY_TIMELINE_QUERY = gql`
  query myTimeline(
    $onlyFavorites: Boolean
    $limit: Int
    $offset: Int
    $fromDate: Time
  ) {
    myTimeline(
      onlyFavorites: $onlyFavorites
      fromDate: $fromDate
      paginate: { limit: $limit, offset: $offset }
    ) {
      id
      title
      type
      blurhash
      thumbnail {
        url
        width
        height
      }
      highRes {
        url
        width
        height
      }
      videoWeb {
        url
      }
      favorite
      album {
        id
        title
      }
      exif {
        imageDescription
        dateShot
      }
      date
    }
  }
`

const PhotoframePage = () => {

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const reloadTimer = setTimeout(() => {
      console.log('Reloading page to get latest code updates (and new photos), if any');
      location.reload();
    }, PHOTOFRAME_RELOAD_MSEC);
    return () => clearTimeout(reloadTimer);
  }, []);

  const { data } = useQuery<
    myTimeline,
    myTimelineVariables
  >(MY_TIMELINE_QUERY, {
    variables: {
      onlyFavorites: false,
      fromDate: undefined,
      offset: 0,
      limit: MAX_PHOTOFRAME_SET_SIZE,
    },
  })

  useEffect(() => {
    const flipTimer = setInterval(() => {
      if (data?.myTimeline) {
        const newIndex = Math.floor(Math.random() * data.myTimeline.length);
        setCurrentPhotoIndex(newIndex);
      }
    }, PHOTOFRAME_FLIP_MSEC);
    return () => clearInterval(flipTimer);
  }, []);

  const currentPhoto = data && data.myTimeline[currentPhotoIndex];
  return (
    <div>
      This is a list of all your media. We have {data?.myTimeline.length} items.
      {currentPhoto && <PresentView
        activeMedia={currentPhoto}
        dispatchMedia={() => null}
      />}
    </div>
  )
}

export default PhotoframePage
