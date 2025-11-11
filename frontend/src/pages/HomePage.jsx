import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Flex } from "@chakra-ui/react"; // Chakra UI components
import Navbar from "@/shared/Navbar";
import { Button } from "@/components/ui/button"; // ShadCN UI Button

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <Box className="h-screen w-screen overflow-hidden relative">
      <Navbar />
      <main className="w-full h-screen relative">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://lnmiit.ac.in/wp-content/uploads/2024/02/lnmiit_view.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay Content */}
        <Flex
          className="absolute inset-0 bg-black/40"
          align="center"
          justify="center"
          direction="column"
          textAlign="center"
          color="white"
          px={6}
        >
          <Heading
            as="h1"
            size="4xl"
            fontWeight="bold"
            className="tracking-wide drop-shadow-lg"
          >
            Igniting Minds,
          </Heading>
          <Heading
            as="h1"
            size="4xl"
            fontWeight="bold"
            className="tracking-wide drop-shadow-lg"
          >
            Empowering Future
          </Heading>
        </Flex>
      </main>
    </Box>
  );
};

export default HomePage;
