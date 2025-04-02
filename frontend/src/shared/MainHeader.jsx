import { Flex, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // Use React Router's Link
import React from 'react';

const MainHeader = () => {
    return (
        <Flex
            bg="#1e1e1e"
            w="full"
            h={"85px"}
            px={3}
            alignItems="center"
            justifyContent="space-between"
        >
            {/* Logo Section */}
            <Flex alignItems="center">
                <Image src="/logo_LNMIIT.jpg" alt="LNMIIT Logo" w={"147px"} h={"55px"} />
            </Flex>

            {/* Navigation Links */}
            <Flex gap={6}>
                <Flex>
                    <Link to="/" style={{ color: "white", fontSize: "lg", textDecoration: "none" }} >
                        Home
                    </Link>
                </Flex>
                <Flex>
                    <Link to="/" style={{ color: "white", fontSize: "lg", textDecoration: "none" }}>
                        About
                    </Link>
                </Flex>
                <Flex>
                    <Link to="/" style={{ color: "white", fontSize: "lg", textDecoration: "none" }}>
                        Sign Out
                    </Link>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default MainHeader;
