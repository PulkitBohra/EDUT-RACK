import {
    FormControl,
    Select,
    FormLabel,
    Flex,
    Text,
    Button,
    useToast,
    Spinner
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../shared/MainHeader';

const InputForm = () => {
    const [formData, setFormData] = useState({
        clg_name:"The LNM Institute of Information Technology ",
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
        <Global
          styles={{
            body: {
              background: "url('/a.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "100vh",
              color: "white",
            },
          }}
        />

        <Flex w="100%" minH="100vh" justify="center" alignItems="center" p={6}>
          <Flex
            w={{ base: "90%", md: "600px" }}
            bg="gray.900"
            boxShadow="2xl"
            p={10}
            opacity={0.9}
            borderRadius="2xl"
            flexDirection="column"
          >
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="teal.700"
              textAlign="center"
              mb={6}
            >
              Course Outcome Mapping
            </Text>

            <FormControl isRequired>
              <FormLabel fontWeight="semibold">Select College Name</FormLabel>
              <Select
                id="clg_name"
                bg="white"
                color="black"
                mb={4}
                value={formData.clg_name}
                onChange={handleChange}
                focusBorderColor="teal.500"
              >
                <option value="The LNM Institute of Information Technology ">
                The LNM Institute of Information Technology 
                </option>
              </Select>

              <FormLabel fontWeight="semibold">Select Branch</FormLabel>
              <Select
                id="Branch_name"
                bg="white"
                color="black"
                mb={4}
                value={formData.Branch_name}
                onChange={handleChange}
                focusBorderColor="teal.500"
              >
                <option value="" disabled hidden>
                  Select Branch
                </option>
                <option>B.Tech Computer Science and Engineering</option>
                <option>B.Tech Communication and Computer Engineering</option>
                <option>
                  B.Tech Electronics and Communication Engineering
                </option>
                <option>
                  Integrated M.Tech and B.Tech Computer Science and Engineering
                </option>
                <option>
                  Integrated M.Tech and B.Tech Electronics and Communication
                  Engineering
                </option>
                <option>B.Tech Mechanical Engineering</option>
                <option>Training Program</option>
              </Select>

              <FormLabel fontWeight="semibold">Select Course</FormLabel>
              <Select
                id="Course_name"
                bg="white"
                color="black"
                mb={4}
                value={formData.Course_name}
                onChange={handleChange}
                focusBorderColor="teal.500"
              >
                <option value="" disabled hidden>
                  Select Course
                </option>
                <option>Course 1</option>
                <option>Course 2</option>
                <option>Course 3</option>
                <option>Course 4</option>
                <option>Course 5</option>
              </Select>

              <FormLabel fontWeight="semibold">
                Enter Number of Course Outcomes
              </FormLabel>
              <Select
                id="Course_outcome"
                bg="white"
                color="black"
                mb={4}
                value={formData.Course_outcome}
                onChange={handleChange}
                focusBorderColor="teal.500"
              >
                <option value="" disabled hidden>
                  Select Outcomes
                </option>
                {[...Array(7)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </Select>

              <FormLabel fontWeight="semibold">
                Select Number of Components
              </FormLabel>
              <Select
                id="Components"
                bg="white"
                color="black"
                mb={4}
                value={formData.Components}
                onChange={handleChange}
                focusBorderColor="teal.500"
              >
                <option value="" disabled hidden>
                  Number of Components
                </option>
                {[...Array(7)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </Select>
            </FormControl>

            <Button
              fontSize="lg"
              mt={6}
              bg="teal.700"
              color="white"
              _hover={{ bg: "teal.800" }}
              _active={{ bg: "teal.900" }}
              onClick={handleSubmit}
              isDisabled={!isFormComplete}
              w="full"
              py={6}
              borderRadius="xl"
              transition="all 0.2s ease-in-out"
            >
              {isLoading ? <Spinner size="sm" color="white" /> : "Next"}
            </Button>
          </Flex>
        </Flex>
      </>
    );
};

export default InputForm;