import React from 'react';
import {
  Card,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useMediaQuery,
  VStack,
  Text,
  HStack,
  Spinner,
  Avatar,
  Divider,


} from '@chakra-ui/react';


export default function DisplayTracks({ tracks }) {
  // Create a CSS-in-JS object for the data cell styles
  const dataCellStyle = {
    padding: '0.5rem',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    maxWidth: '30rem',
  };

  const [isMobile] = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {!isMobile && (
        <Card mt={3} key='table_card'>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th isNumeric sx={dataCellStyle}>#</Th>
                  <Th sx={dataCellStyle}>Track</Th>
                  <Th sx={dataCellStyle}>Album</Th>
                  <Th sx={dataCellStyle}>Artist</Th>
                </Tr>
              </Thead>
              <Tbody key={'table_body'}>
                {tracks.map((track) => (
                  track.id && (
                    <Tr key={track.id}>
                      <Td isNumeric sx={dataCellStyle}>{track.original_position}</Td>
                      <Td fontWeight={'bold'} sx={dataCellStyle}>
                        <HStack>
                          <Avatar borderRadius={1} size={'sm'} src={track?.album?.images[0]?.url} icon={<Spinner></Spinner>} sx={{margin: '0px'}} />
                          <Text>{track.name}</Text>
                        </HStack>
                      </Td>
                      <Td sx={dataCellStyle}>{track.album.name}</Td>
                      <Td fontWeight={'black'} sx={dataCellStyle}>{track.artists[0].name}</Td>
                    </Tr>
                  )
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      )}
      {isMobile && (
        <VStack align={'left'} mt={2}>
          {tracks.map((track) => (
            track.id && (
              <>
                <Divider key={track.id} />
                <HStack spacing={2}>
                  <Avatar borderRadius={2} size={'md'} src={track?.album?.images[0]?.url} icon={<Spinner></Spinner>} />
                  <Text as={'h3'} fontWeight='bold' fontSize={'md'}>{track.original_position}.</Text>
                  <VStack spacing={0} align={'left'} ml={'0.5rem !important'}>
                    <HStack spacing={0}>
                      <Text as={'h3'} fontWeight="black" fontSize={'md'}>{track.name}</Text>
                    </HStack>
                    <Text as={'h3'} fontSize={'sm'} fontWeight={'semibold'}>{track.album.name}</Text>
                    <Text as={'h3'} fontSize={'sm'}>{track.artists.map((artist) => artist.name).join(', ')}</Text>
                  </VStack>
                </HStack>
              </>
            )
          ))}
        </VStack>
      )}
    </>
  );
}
