import { FormControl, Input, FormLabel, Select, Flex, Text, Button, useToast, Spinner } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../shared/MainHeader';

const InputForm = () => {
    const [formData, setFormData] = useState({
        clg_name: '',
        Branch_name: '',
        Course_name: '',
        Course_outcome: '',
        Components: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: 'Success',
                position: 'bottom-left',
                description: 'Proceeding to component naming.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            navigate('/components', { state: { formData } });
        }, 1500);
    };

    const isFormComplete = Object.values(formData).every((val) => val !== '');

    return (
        <>
            <MainHeader />
            <Global styles={{ body: { background: "url('/a.jpg')", backgroundSize: 'cover' } }} />

            <Flex w="100%" minH="100vh" justify="center" alignItems="center" p={6}>
                <Flex w={{ base: "90%", md: "600px" }} bg="white" boxShadow="xl" p={8} borderRadius="lg" flexDirection="column">
                    <Text fontSize="3xl" fontWeight="bold" color="black" textAlign="center" mb={6}>
                        Course Outcome Mapping
                    </Text>

                    <FormControl isRequired>
                        <FormLabel>Select College Name</FormLabel>
                        <Select id='clg_name' placeholder='Select College name' bg="gray.100" mb={4} value={formData.clg_name} onChange={handleChange}>
                            <option>The LNM INSTITUTE OF TECHNOLOGY</option>
                        </Select>

                        <FormLabel>Select Branch</FormLabel>
                        <Select id='Branch_name' placeholder='Select Branch' bg="gray.100" mb={4} value={formData.Branch_name} onChange={handleChange}>
                            <option>B.Tech Computer Science and Engineering</option>
                            <option>B.Tech Communication and Computer Engineering</option>
                            <option>B.Tech Electronics and Communication Engineering</option>
                            <option>Integrated M.Tech and B.Tech Computer Science and Engineering</option>
                            <option>Integrated M.Tech and B.Tech Electronics and Communication Engineering</option>
                            <option>B.Tech Mechanical Engineering</option>
                            <option>Training Program</option>
                        </Select>

                        <FormLabel>Select Course</FormLabel>
                        <Select id='Course_name' placeholder='Select Course' bg="gray.100" mb={4} value={formData.Course_name} onChange={handleChange}>
                            <option>Course 1</option>
                            <option>Course 2</option>
                            <option>Course 3</option>
                            <option>Course 4</option>
                            <option>Course 5</option>
                        </Select>

                        <FormLabel>Enter Number of Course Outcomes</FormLabel>
                        <Select id='Course_outcome' placeholder='Select Outcomes' bg="gray.100" mb={4} value={formData.Course_outcome} onChange={handleChange}>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                        </Select>

                        <FormLabel>Select Number of Components</FormLabel>
                        <Select id='Components' placeholder='Number of Components' bg="gray.100" mb={4} value={formData.Components} onChange={handleChange}>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                        </Select>
                    </FormControl>

                    <Button fontSize="lg" mt={6} colorScheme="blue" onClick={handleSubmit} isDisabled={!isFormComplete} w="full">
                        {isLoading ? <Spinner size="sm" /> : "Next"}
                    </Button>
                </Flex>
            </Flex>
        </>
    );
};

export default InputForm;
