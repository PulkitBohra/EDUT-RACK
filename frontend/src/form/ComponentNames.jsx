import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FormControl,
  Input,
  FormLabel,
  Flex,
  Text,
  Button,
  Box,
  FormErrorMessage,
  useToast
} from "@chakra-ui/react";
import MainHeader from "../shared/MainHeader";
import { Global } from "@emotion/react";

const ComponentNames = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { formData } = location.state || {};
  const numComponents = parseInt(formData?.Components, 10) || 0;

  const [componentNames, setComponentNames] = useState(Array(numComponents).fill(""));
  const [weights, setWeights] = useState(Array(numComponents).fill(""));
  const [errors, setErrors] = useState({ names: [], weights: [], totalWeightError: "" });

  // Validate duplicate names and weights
  const validate = () => {
    const nameErrors = [];
    const weightErrors = [];

    // 1. Duplicate name check
    const nameSet = new Set();
    componentNames.forEach((name, idx) => {
      if (nameSet.has(name.trim().toLowerCase())) {
        nameErrors[idx] = "Duplicate name found";
      } else {
        nameSet.add(name.trim().toLowerCase());
        nameErrors[idx] = "";
      }
    });

    // 2. Weight validations
    let total = 0;
    weights.forEach((w, idx) => {
      if (!/^\d+$/.test(w)) {
        weightErrors[idx] = "Only numbers allowed";
      } else if (parseInt(w, 10) >= 100) {
        weightErrors[idx] = "Must be less than 100";
      } else {
        weightErrors[idx] = "";
        total += parseInt(w, 10);
      }
    });

    const totalWeightError = total !== 100 ? "Total weightage must equal 100" : "";

    setErrors({ names: nameErrors, weights: weightErrors, totalWeightError });

    return nameErrors.every(e => !e) &&
           weightErrors.every(e => !e) &&
           !totalWeightError;
  };

  const handleNameChange = (index, value) => {
    const updatedNames = [...componentNames];
    updatedNames[index] = value;
    setComponentNames(updatedNames);
  };

  const handleWeightChange = (index, value) => {
    const updatedWeights = [...weights];
    updatedWeights[index] = value;
    setWeights(updatedWeights);
  };

  const handleSubmit = () => {
    if (validate()) {
      navigate("/upload", {
        state: {
          formData,
          componentNames,
          weights: weights.map(w => parseInt(w, 10))
        },
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted issues.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <MainHeader />
      <Global
        styles={{
          body: {
            position: "relative",
            "&::before": {
              content: '""',
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "url('/e.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.85,
              zIndex: -1,
            },
          },
        }}
      />

      <Flex w="100%" minH="100vh" justify="center" alignItems="center" p={6}>
        <Box w={{ base: "90%", md: "500px" }} bg="white" boxShadow="xl" p={6} borderRadius="lg">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={6}>
            Enter Component Names and Their Weightage (out of 100)
          </Text>
          {componentNames.map((name, index) => (
            <FormControl key={index} mb={4} isRequired isInvalid={!!errors.names[index] || !!errors.weights[index]}>
              <FormLabel>Component {index + 1} Name</FormLabel>
              <Input
                placeholder={`Enter name for Component ${index + 1}`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                mb={2}
              />
              {errors.names[index] && <FormErrorMessage>{errors.names[index]}</FormErrorMessage>}

              <Input
                placeholder={`Enter Weightage of Component ${index + 1}`}
                value={weights[index]}
                onChange={(e) => handleWeightChange(index, e.target.value)}
                mb={1}
                type="number"
              />
              {errors.weights[index] && <FormErrorMessage>{errors.weights[index]}</FormErrorMessage>}
            </FormControl>
          ))}

          {errors.totalWeightError && (
            <Text color="red.500" fontSize="sm" mb={2}>
              {errors.totalWeightError}
            </Text>
          )}

          <Button
            colorScheme="blue"
            w="full"
            onClick={handleSubmit}
            isDisabled={componentNames.some(name => name.trim() === "") || weights.some(w => w === "")}
          >
            Proceed to Upload
          </Button>
        </Box>
      </Flex>
    </>
  );
};

export default ComponentNames;
