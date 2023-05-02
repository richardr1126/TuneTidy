// Importing necessary dependencies and components
import { Component } from 'react';
import SpotifyAPI from 'spotify-web-api-js';
import {
  Box,
  Text,
  Spinner,
  Image,
  Center,
  Heading,
  Button,
  Wrap,
} from '@chakra-ui/react';
import TracksList from './TracksList';
import { sortByName,
  sortByOriginalPostion,
  sortByTempo,
  sortByDanceability,
  sortByEnergy,
  sortByValence,
  sortByLoudness,
  sortByAcousticness,
  sortByInstrumentalness,
  sortBySpeechiness,
  sortByAlbumName,
  sortByArtistName,
  sortByLiveness,
  sortByRelease,
  sortByPopularity,
  sortByDateAdded,
} from '../Sorter';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';


// Creating a new instance of the Spotify API
const spotify = new SpotifyAPI();

class PlaylistEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: true,
      playlist: this.props.playlist,
      tracks: null,
      sorter: 'original_position',
      sortOrder: 'asc',
    };
    // Binding the functions to the component's scope
    this.fetchPlaylistTracks = this.fetchPlaylistTracks.bind(this);
    this.redirectLogin = this.redirectLogin.bind(this);
    this.displaySortButtons = this.displaySortButtons.bind(this);
  }

  //A function to redirect the user to login page when they are not authenticated or their token has expired
  redirectLogin() {
    this.setState({
      loggedIn: false,
    });

    window.localStorage.removeItem("token");
    window.localStorage.removeItem("tokenExpiration");
    window.location.href = "/";
  }

  // A function to fetch user's top tracks using Spotify Web API
  fetchPlaylistTracks() {
    const id = this.state.playlist.id;
    console.log('id: ', id);

    //https://jmperezperez.com/spotify-web-api-js/
    spotify.getPlaylistTracks(id, { limit: 50 })
      .then(async (data) => {
        console.log('Fetched tracks');
        let combinedTracks = data.items;
        const totalTracks = data.total;

        if (totalTracks > 50) {
          for (let offset = 50; offset < totalTracks; offset += 50) {
            try {
              const additionalData = await spotify.getPlaylistTracks(id, { limit: 50, offset });
              console.log('Fetching more tracks...');
              combinedTracks = combinedTracks.concat(additionalData.items);
            } catch (error) {
              console.log("Error fetching more tracks from playlist:", error);
              this.redirectLogin();
              return;
            }
          }
        }

        //full list of tracks, in a simple json object
        combinedTracks = combinedTracks.map((track) => {
          return {
            ...track.track,
            added_at: track.added_at,
          };
        });
        

        //list of track ids
        const trackIds = combinedTracks.map((track) => track.id);
        //put track ids into chunks of 100
        const trackIdChunks = {};
        for (let i = 0; i < trackIds.length; i += 100) {
          const chunkIndex = i / 100;
          trackIdChunks[chunkIndex] = trackIds.slice(i, i + 100);
        }

        const trackFeatures = [];
        for (const trackIds of Object.values(trackIdChunks)) {
          const chunk = await spotify.getAudioFeaturesForTracks(trackIds);
          trackFeatures.push(...chunk.audio_features); // Destructure the audio_features array
        }

        //console.log(trackFeatures);

        //Combine the track objects with their audio features
        let counter = 0;
        combinedTracks = combinedTracks.map((track, index) => {
          counter++;
          return {
            ...track,
            ...trackFeatures[index],
            original_position: counter,
          };
        });
        console.log(combinedTracks);

        this.setState({
          tracks: combinedTracks,
        });
      })
      .catch((error) => {
        console.log("Error fetching tracks from playlist:", error);
        this.redirectLogin();
      });
  }



  // A lifecycle method to check if the user is authenticated and fetch their top artists
  componentDidMount() {
    const token = window.localStorage.getItem("token");
    const tokenExpiration = window.localStorage.getItem("tokenExpiration");
    console.log(this.state.playlist.id);

    if (token && tokenExpiration > Date.now()) {
      this.setState({
        loggedIn: true,
      });

      spotify.setAccessToken(token);
      this.fetchPlaylistTracks();


    } else {
      this.setState({
        loggedIn: false,
      });
      // Redirect user to homepage
      this.props.obs.notify({ message: 'Spotify Token Expired\nPlease login again in with your Spotify account', status: 'warning' });
      this.setState({
        loggedIn: false,
      });
      // Redirect user to homepage
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    }
  }

  displaySortButtons() {
    const { sorter, sortOrder } = this.state;

    const getNextSortOrder = () => {
      return sortOrder === 'asc' ? 'desc' : 'asc';
    };

    const applySorting = (newSorter, sortingFunction) => {
      const newSortOrder = newSorter === sorter ? getNextSortOrder() : 'asc';
      this.setState({
        sorter: newSorter,
        sortOrder: newSortOrder,
        tracks: sortingFunction(this.state.tracks, newSortOrder),
      });
    };

    return (
      <Wrap mt={1.5}>
        <Text>Sort by:</Text>
        <Button size={'sm'} onClick={() => applySorting('original_position', sortByOriginalPostion)} isActive={sorter === 'original_position'}>
          #
          {sorter === 'original_position' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('track_name', sortByName)} isActive={sorter === 'track_name'}>
          Track Name
          {sorter === 'track_name' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('album_name', sortByAlbumName)} isActive={sorter === 'album_name'}>
          Album Name
          {sorter === 'album_name' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('artist_name', sortByArtistName)} isActive={sorter === 'artist_name'}>
          Artist Name
          {sorter === 'artist_name' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('release_date', sortByRelease)} isActive={sorter === 'release_date'}>
          Release Date
          {sorter === 'release_date' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('added_at', sortByDateAdded)} isActive={sorter === 'added_at'}>
          Date Added
          {sorter === 'added_at' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('popularity', sortByPopularity)} isActive={sorter === 'popularity'}>
          Popularity
          {sorter === 'popularity' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('tempo', sortByTempo)} isActive={sorter === 'tempo'}>
          Tempo
          {sorter === 'tempo' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('acousticness', sortByAcousticness)} isActive={sorter === 'acousticness'}>
          Acousticness
          {sorter === 'acousticness' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('danceability', sortByDanceability)} isActive={sorter === 'danceability'}>
          Danceability
          {sorter === 'danceability' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('energy', sortByEnergy)} isActive={sorter === 'energy'}>
          Energy
          {sorter === 'energy' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('instrumentalness', sortByInstrumentalness)} isActive={sorter === 'instrumentalness'}>
          Instrumentalness
          {sorter === 'instrumentalness' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('liveness', sortByLiveness)} isActive={sorter === 'liveness'}>
          Liveness
          {sorter === 'liveness' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('loudness', sortByLoudness)} isActive={sorter === 'loudness'}>
          Loudness
          {sorter === 'loudness' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('speechiness', sortBySpeechiness)} isActive={sorter === 'speechiness'}>
          Speechiness
          {sorter === 'speechiness' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
        <Button size={'sm'} onClick={() => applySorting('valence', sortByValence)} isActive={sorter === 'valence'}>
          Valence
          {sorter === 'valence' && (sortOrder === 'asc' ? <TriangleUpIcon ml={1} /> : <TriangleDownIcon ml={1} />)}
        </Button>
      </Wrap>
      
    );
  }




  // A function to render the content of the widget
  render() {
    const { playlist, tracks } = this.state;

    if (playlist && tracks) {
      // Returning JSX for the UI with dynamic values passed as props or state
      return (

        <Center>
          <Box
            rounded={'sm'}
            my={3}
            mx={[0, 3]}
            overflow={'hidden'}
            bg="white"
            border={'1px'}
            borderColor="black"
            boxShadow={'6px 6px 0 black'}>
            <Box borderBottom={'1px'} borderColor="black">
              <Image
                src={playlist.images[0]?.url}
                fallback={
                  <>
                    {playlist.images.length !== 0 ? (
                      <Center p={100}><Box>
                        <Spinner />
                      </Box></Center>
                    ) : (
                      <Image src='/playlist_placeholder.png' alt='No cover art' w={'full'} h={64} />
                    )}
                  </>
                }
                alt={playlist.name + ' image'}
                roundedTop={'sm'}
                objectFit="cover"
                h={64}
                w="full"
              />
            </Box>
            <Box p={4}>


              <Heading color={'black'} fontSize={'2xl'}>
                {playlist.name}
              </Heading>


              {playlist.description && (
                <Text color={'gray.500'}>
                  {playlist.description}
                </Text>

              )}

              {/* Sorting buttons */}

              {this.displaySortButtons()}

              {/* Tracks list */}
              <TracksList tracks={tracks} />
            </Box>
          </Box>
        </Center>

      );
    } else {
      // Returning a spinner component while the data is being fetched
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={150}>
          <Spinner size="lg" />
        </Box>
      );
    }
  }
}

export default PlaylistEditor;
