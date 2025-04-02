import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormControl, Input, FormLabel, Flex, Text, Button, Box } from "@chakra-ui/react";
import MainHeader from "../shared/MainHeader";
import { Global } from '@emotion/react';

const ComponentNames = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { formData } = location.state || {};
    const numComponents = parseInt(formData?.Components, 10) || 0;
    
    const [componentNames, setComponentNames] = useState(Array(numComponents).fill(""));

    const handleChange = (index, value) => {
        const updatedNames = [...componentNames];
        updatedNames[index] = value;
        setComponentNames(updatedNames);
    };

    const handleSubmit = () => {
        navigate("/upload", { state: { formData, componentNames } });
    };

    return (
        <>
            <MainHeader />
            {/* <Global styles={{ body: { background: "url('/e.jpg')", backgroundSize: 'cover', opacity:1 } }} /> */}
            <Global styles={{ body: { position: 'relative', '&::before': { content: '""', position: 'fixed', top: 0, left: 0, width: '100%', 
            height: '100%', background: "url('/e.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat', opacity: 0.85, zIndex: -1 } } }} />

            <Flex w="100%" minH="100vh" justify="center" alignItems="center" p={6}>
                <Box w={{ base: "90%", md: "500px" }} bg="white" boxShadow="xl" p={6} borderRadius="lg">
                    <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={6}>
                        Enter Component Names and Thier Weightage (out of 100)
                    </Text>
                    {componentNames.map((name, index) => (
                        <FormControl key={index} mb={4} isRequired>
                            <FormLabel>Component {index + 1} Name</FormLabel>
                            <Input 
                                placeholder={`Enter name for Component ${index + 1}`} 
                                value={name} 
                                onChange={(e) => handleChange(index, e.target.value)} mb={3}
                            />
                            <Input 
                            placeholder={`Enter Weightage of ${index + 1}`} mb={2}
                            />
                        </FormControl>
                    ))}
                    <Button colorScheme="blue" w="full" onClick={handleSubmit} isDisabled={componentNames.some(name => name === "")}>
                        Proceed to Upload
                    </Button>
                </Box>
            </Flex>
        </>
    );
};

export default ComponentNames;
