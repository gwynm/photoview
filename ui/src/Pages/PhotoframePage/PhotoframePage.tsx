import React from 'react'
import AlbumBoxes from '../../components/albumGallery/AlbumBoxes'
import Layout from '../../components/layout/Layout'
import { useQuery, gql } from '@apollo/client'
import {
  myTimeline, myTimelineVariables
} from '../../components/timelineGallery/__generated__/myTimeline'

/* Reuse timeline query to get all media */
const MAX_PHOTOFRAME_SET_SIZE = 9999;
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
  const { data, error } = useQuery<
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

  return (
    <div>
      This is a list of all your media. We have {data?.myTimeline.length} items.
    </div>
  )
}

export default PhotoframePage
