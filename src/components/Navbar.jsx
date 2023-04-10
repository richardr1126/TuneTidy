import React from 'react';
import { Heading, Image, Box, Flex, HStack, Link, Button } from '@chakra-ui/react';

const NavLink = ({ href, children }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    href={href}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.200',
    }}
  >
    {children}
  </Link>
);

const NavBar = ({ onLogout }) => {
  const handleLogout = () => {
    window.localStorage.removeItem('token');
    window.location.href = '/';
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <Box>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        w="100%"
        mb={8}
        p={4}
        bg="gray.100"
        color="gray.600"
      >
        <Flex alignItems='center'>
          <Image boxSize='3ch' src='/large-logo.png' alt='Tune Tidy Logo' />
          <Heading as='h1' fontSize='2ch' sx={{padding: '0ch 1ch 0ch 0.5ch'}}>TuneTidy</Heading>
          <HStack fontSize='1.75ch' alignItems="center" flexGrow={1}>
            <NavLink href="/home">Home</NavLink>
            <NavLink href="/playlists">Playlist Sort</NavLink>
          </HStack>
        </Flex>
        <Button onClick={handleLogout} backgroundColor='#1DB954' color='black' size="sm">
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default NavBar;