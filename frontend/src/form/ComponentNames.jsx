import { useState } from "react";
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
  Textarea,
  useToast,
  Select,
} from "@chakra-ui/react";
import MainHeader from "../shared/MainHeader";
import { Global } from "@emotion/react";

const ComponentNames = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const { formData } = location.state || {};
  const courseOutcomeCount = parseInt(formData?.Course_outcome) || 0;
  const numComponents = parseInt(formData?.Components, 10) || 0;

  const [componentNames, setComponentNames] = useState(
    Array(numComponents).fill("")
  );
  const [weights, setWeights] = useState(Array(numComponents).fill(""));
  const [errors, setErrors] = useState({
    names: [],
    weights: [],
    totalWeightError: "",
  });

  // Pre-filled (read-only) inputs from previous form
  const [programName] = useState(formData?.Branch_name || "");
  const [courseName] = useState(formData?.Course_name || "");

  // Editable fields
  const [className, setClassName] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [indirectAttainment, setIndirectAttainment] = useState("");

  // CO Statements
  const [coStatements, setCoStatements] = useState(
    Array(courseOutcomeCount).fill("")
  );

  const handleChange = (index, value) => {
    const updated = [...coStatements];
    updated[index] = value;
    setCoStatements(updated);
  };

  const validate = () => {
    const nameErrors = [];
    const weightErrors = [];

    const nameSet = new Set();
    componentNames.forEach((name, idx) => {
      if (nameSet.has(name.trim().toLowerCase())) {
        nameErrors[idx] = "Duplicate name found";
      } else {
        nameSet.add(name.trim().toLowerCase());
        nameErrors[idx] = "";
      }
    });

    let total = 0;
    weights.forEach((w, idx) => {
      if (!/^\d+$/.test(w)) {
        weightErrors[idx] = "Only numbers allowed";
      } else if (parseInt(w, 10) > 100) {
        weightErrors[idx] = "Must be less than 100";
      } else {
        weightErrors[idx] = "";
        total += parseInt(w, 10);
      }
    });

    const totalWeightError =
      total !== 100 ? "Total weightage must equal 100" : "";

    setErrors({ names: nameErrors, weights: weightErrors, totalWeightError });

    return (
      nameErrors.every((e) => !e) &&
      weightErrors.every((e) => !e) &&
      !totalWeightError &&
      className &&
      semester &&
      academicYear &&
      indirectAttainment &&
      coStatements.every((s) => s.trim() !== "")
    );
  };

  const handleSubmit = () => {
    if (validate()) {
      navigate("/upload", {
        state: {
          formData: {
            ...formData,
            Branch_name: programName,
            Course_name: courseName,
            Class: className,
            Semester: semester,
            AcademicYear: academicYear,
            IndirectAttainment: parseFloat(indirectAttainment),
            COcount: courseOutcomeCount,
          },
          componentNames,
          weights: weights.map((w) => parseInt(w, 10)),
          coStatements,
        },
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and fix the highlighted issues.",
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
        <Box
          w={{ base: "90%", md: "600px" }}
          bg="white"
          boxShadow="xl"
          p={6}
          borderRadius="lg"
        >
          <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={6}>
            Enter Component Names and Their Weightage (out of 100)
          </Text>

          {/* Pre-filled values */}
          <FormControl mb={4} isRequired isDisabled>
            <FormLabel>Program (Branch)</FormLabel>
            <Input value={programName} readOnly />
          </FormControl>

          <FormControl mb={4} isRequired isDisabled>
            <FormLabel>Course Name</FormLabel>
            <Input value={courseName} readOnly />
          </FormControl>

          {/* Editable inputs */}
          <FormControl mb={4} isRequired>
            <FormLabel>Class</FormLabel>
            <Select
              placeholder="Select Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Semester</FormLabel>
            <Select
              placeholder="Select Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={`${i + 1}`}>
                  {i + 1}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Academic Year</FormLabel>
            <Select
              placeholder="Select Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              {Array.from(
                { length: new Date().getFullYear() + 2 - 2002 + 1 },
                (_, i) => {
                  const startYear = new Date().getFullYear()  - i;
                  const endYear = startYear + 1;
                  return (
                    <option
                      key={startYear}
                      value={`${startYear}-${endYear.toString().slice(-2)}`}
                    >
                      {`${startYear}-${endYear.toString().slice(-2)}`}
                    </option>
                  );
                }
              )}
            </Select>
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Indirect Attainment (Course-End Survey)</FormLabel>
            <Input
              type="number"
              min="0"
              max="3"
              step="0.01"
              value={indirectAttainment}
              onChange={(e) => setIndirectAttainment(e.target.value)}
            />
          </FormControl>

          {/* CO Statements */}
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            CO Statements
          </Text>
          {coStatements.map((co, index) => (
            <FormControl key={index} mb={3} isRequired>
              <FormLabel>CO{index + 1} Statement</FormLabel>
              <Textarea
                value={co}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            </FormControl>
          ))}

          {/* Component Names and Weights */}
          {componentNames.map((name, index) => (
            <FormControl
              key={index}
              mb={4}
              isRequired
              isInvalid={!!errors.names[index] || !!errors.weights[index]}
            >
              <FormLabel>Component {index + 1} Name</FormLabel>
              <Input
                placeholder={`Component ${index + 1} Name`}
                value={name}
                onChange={(e) => {
                  const updatedNames = [...componentNames];
                  updatedNames[index] = e.target.value;
                  setComponentNames(updatedNames);
                }}
                mb={2}
              />
              {errors.names[index] && (
                <FormErrorMessage>{errors.names[index]}</FormErrorMessage>
              )}

              <Input
                placeholder={`Component ${index + 1} Weightage`}
                value={weights[index]}
                onChange={(e) => {
                  const updatedWeights = [...weights];
                  updatedWeights[index] = e.target.value;
                  setWeights(updatedWeights);
                }}
                type="number"
              />
              {errors.weights[index] && (
                <FormErrorMessage>{errors.weights[index]}</FormErrorMessage>
              )}
            </FormControl>
          ))}

          {errors.totalWeightError && (
            <Text color="red.500" fontSize="sm" mb={3}>
              {errors.totalWeightError}
            </Text>
          )}

          <Button colorScheme="blue" w="full" onClick={handleSubmit}>
            Proceed to Upload
          </Button>
        </Box>
      </Flex>
    </>
  );
};
// export const Branch_name = Branch_name;
// export const Course_name = Course_name ;
// export const classname =classname;
// export const semester = semester;
// export const academicYear =academicYear;
// export const indirectAttainment = indirectAttainment; // Example value
// export const coStatements = coStatements; // Example valu

export default ComponentNames;
