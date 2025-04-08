import React, { useState, useEffect } from "react";
import {
    Box,
    Text,
    Heading,
    Card,
    CardBody,
    Flex,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Divider,
    Collapse,
    Wrap,
    FormControl,
    FormLabel,
    Input,
    WrapItem,
    useColorModeValue,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import MainHeader from "@/shared/MainHeader";
import { Global } from "@emotion/react";

const UploadedFilesPage = () => {
    const location = useLocation();
    const rawFileContents = location.state?.fileContents || {};
    const [processedData, setProcessedData] = useState({});
    const [expandedSheet, setExpandedSheet] = useState(null);
    const [threshold, setThreshold] = useState(50); // Default threshold value

    const tableBg = useColorModeValue("white", "gray.700");
    const headerBg = useColorModeValue("blue.500", "blue.300");
    const headerColor = useColorModeValue("white", "gray.800");
    const stripBg = useColorModeValue("gray.50", "gray.800");

    useEffect(() => {
        const processFiles = () => {
            const finalData = {};

            for (const [sheetName, coData] of Object.entries(rawFileContents)) {
                let studentNames = [];
                let rollNumbers = [];
                let totalMarks = [];

                const sheetEntries = Object.entries(coData);
                for (const [key, value] of sheetEntries) {
                    const keyLower = key.toLowerCase();
                    if (keyLower.includes("name") && !keyLower.includes("co")) {
                        studentNames = Array.isArray(value) ? value : [];
                    } else if (keyLower.includes("roll")) {
                        rollNumbers = Array.isArray(value) ? value : [];
                    } else if (/^total\s*marks?$/.test(keyLower.trim())) {
                        totalMarks = Array.isArray(value) ? value : [];
                    }
                }

                const actualCOs = Object.fromEntries(
                    sheetEntries.filter(([key]) => key.toLowerCase().includes("co"))
                );

                finalData[sheetName] = {
                    coData: actualCOs,
                    studentNames,
                    rollNumbers,
                    totalMarks,
                };
            }

            setProcessedData(finalData);
        };

        processFiles();
    }, [rawFileContents]);

    const toggleSheetDetails = (sheetName) => {
        setExpandedSheet((prev) => (prev === sheetName ? null : sheetName));
    };

    return (
        <>
            <MainHeader />
            <Global
                styles={{
                    body: {
                        background: "url('/b.jpg')",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                    },
                }}
            />

            <Flex
                minH="100vh"
                align="start"
                justify="center"
                bg="rgba(255, 255, 255, 0.6)"
                backdropFilter="blur(1px)"
                px={4}
                py={8}
            >
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: "100%", maxWidth: "1000px" }}
                >
                    <Heading size="xl" textAlign="center" mb={6} color="gray.800">
                        Uploaded CO Analysis
                    </Heading>

                    {Object.keys(processedData).length === 0 ? (
                        <Text textAlign="center" color="red.500">
                            No file contents found. Please upload files first.
                        </Text>
                    ) : (
                        <>
                            <Wrap spacing={4} mb={6} justify="center">
                                {Object.entries(processedData).map(([sheetName], index) => (
                                    <WrapItem key={index}>
                                        <Button
                                            minW="150px"
                                            colorScheme="blue"
                                            color={"blue.600"}
                                            bg={"gray.100"}
                                            _hover={{ bg: "blue.600", color: "white" }}
                                            onClick={() => toggleSheetDetails(sheetName)}
                                            variant={expandedSheet === sheetName ? "solid" : "outline"}
                                        >
                                            {sheetName}
                                        </Button>
                                    </WrapItem>
                                ))}
                            </Wrap>

                            {expandedSheet && (
                                <Collapse in={true} animateOpacity>
                                    <Card mb={6} borderRadius="2xl" bg={tableBg}>
                                        <CardBody>
                                            <Heading size="md" mb={1} color="blue.600">
                                                Sheet: {expandedSheet}
                                            </Heading>
                                            <Divider my={4} />
                                            <Box mt={6} overflowX="auto">
                                                <Table size="sm" variant="striped" bg={stripBg}>
                                                    <Thead bg={headerBg}>
                                                        <Tr>
                                                            <Th color={headerColor}>Roll No</Th>
                                                            <Th color={headerColor}>Name</Th>
                                                            {Object.keys(processedData[expandedSheet].coData).map((coKey) => (
                                                                <Th key={coKey} color={headerColor}>Total of {coKey}</Th>
                                                            ))}
                                                            <Th color={headerColor}>Total Marks</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        <Tr fontWeight="bold" color="gray.200">
                                                            <Td></Td>
                                                            <Td></Td>
                                                            {Object.entries(processedData[expandedSheet].coData).map(([coKey, values]) => (
                                                                <Td key={coKey}>{`Out of ${Array.isArray(values) ? values[1] || "N/A" : "N/A"}`}</Td>
                                                            ))}
                                                            <Td>{`Out of ${processedData[expandedSheet].totalMarks[1] ?? "0"}`}</Td>
                                                        </Tr>
                                                        {processedData[expandedSheet].studentNames.slice(1).map((_, studentIndex) => (
                                                            <Tr key={studentIndex}>
                                                                <Td>{processedData[expandedSheet].rollNumbers[studentIndex+1] || "N/A"}</Td>
                                                                <Td>{processedData[expandedSheet].studentNames[studentIndex + 1] || "N/A"}</Td>
                                                                {Object.entries(processedData[expandedSheet].coData).map(([coKey, values]) => (
                                                                    <Td key={coKey}>{Array.isArray(values) ? values[studentIndex + 2] || "0" : "N/A"}</Td>
                                                                ))}
                                                                <Td>{processedData[expandedSheet].totalMarks[studentIndex + 2] ?? "0"}</Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </Collapse>
                            )}

                            {expandedSheet && processedData[expandedSheet] && (
                                <Box mt={8} overflowX="auto">
                                    <Heading size="xl" mb={2} color="gray.700">
                                        CO Attainment Summary
                                    </Heading>
                                    <Divider my={4} />
                                    {expandedSheet && processedData[expandedSheet] && (
                                        <Box mb={6} maxW="300px">
                                            <FormControl>
                                                <FormLabel fontWeight="bold" color={"black"}>Threshold Percentage</FormLabel>
                                                <Input
                                                    type="number"
                                                    value={threshold}
                                                    min={0}
                                                    max={100}
                                                    onChange={(e) => setThreshold(Number(e.target.value))}
                                                    bg={tableBg}
                                                    placeholder="Enter threshold (e.g., 50)"
                                                />
                                            </FormControl>
                                        </Box>
                                    )}
                                    <Table size="sm" bg={tableBg} borderRadius="xl" boxShadow="md">
                                        <Thead bg={headerBg}>
                                            <Tr>
                                                <Th color={headerColor}>CO</Th>
                                                {Object.keys(processedData[expandedSheet].coData).map((coKey) => (
                                                    <Th key={coKey} color={headerColor}>{coKey}</Th>
                                                ))}
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr><Td fontWeight="bold">Marks</Td>
                                                {Object.values(processedData[expandedSheet].coData).map((arr, idx) => (
                                                    <Td key={`marks-${idx}`}>{arr[1] || 0}</Td>
                                                ))}
                                            </Tr>
                                            <Tr><Td fontWeight="bold">Threshold %</Td>
                                                {Object.values(processedData[expandedSheet].coData).map((_, idx) => (
                                                    <Td key={`threshold-${idx}`}>{threshold}</Td>
                                                ))}
                                            </Tr>
                                            <Tr><Td fontWeight="bold">Threshold Marks</Td>
                                                {Object.values(processedData[expandedSheet].coData).map((arr, idx) => (
                                                    <Td key={`threshold-marks-${idx}`}>{((arr[1] || 0)* (threshold / 100).toFixed(2))}</Td>
                                                ))}
                                            </Tr>
                                            <Tr><Td fontWeight="bold">No. of Students ≥ Threshold</Td>
                                                {Object.values(processedData[expandedSheet].coData).map((arr, idx) => {
                                                    const thresholdmarks = (arr[1] || 0) * (threshold / 100);
                                                    let above = 0;
                                                    if (thresholdmarks > 0) {
                                                        above = arr.slice(2).filter(mark => parseFloat(mark) >= thresholdmarks).length;
                                                    }
                                                    // else{
                                                    //     above=0;
                                                    // }                                                    
                                                    return <Td key={`above-${idx}`}>{above}</Td>;
                                                })}
                                            </Tr>
                                            <Tr><Td fontWeight="bold">Total Students</Td>
                                                {Object.keys(processedData[expandedSheet].coData).map((_, idx) => (
                                                    <Td key={`total-${idx}`}>{processedData[expandedSheet].studentNames.length - 1}</Td>
                                                ))}
                                            </Tr>
                                            <Tr><Td fontWeight="bold">Percentage Attainment</Td>
                                                {Object.values(processedData[expandedSheet].coData).map((arr, idx) => {
                                                    const thresholdmarks = (arr[1] || 0) * (threshold / 100);;
                                                    let above = 0;
                                                    if (thresholdmarks > 0) {
                                                        above = arr.slice(2).filter(mark => parseFloat(mark) >= thresholdmarks).length;
                                                    }
                                                    // else{
                                                    //     above=0;
                                                    // }                                                    
                                                    const total = processedData[expandedSheet].studentNames.length - 1;
                                                    return <Td key={`attainment-${idx}`}>{total > 0 ? ((above / total) * 100).toFixed(2) : "0.00"}</Td>;
                                                })}
                                            </Tr>
                                            <Tr><Td fontWeight="bold">Attainment Level</Td>
                                                {Object.values(processedData[expandedSheet].coData).map((arr, idx) => {
                                                    const thresholdmarks = (arr[1] || 0) * (threshold / 100);
                                                    let above = 0;
                                                    if (thresholdmarks > 0) {
                                                        above = arr.slice(2).filter(mark => parseFloat(mark) >= thresholdmarks).length;
                                                    }
                                                    // else{
                                                    //     above=0;
                                                    // }                                                    
                                                    const total = processedData[expandedSheet].studentNames.length - 1;
                                                    const perc = total > 0 ? ((above / total) * 100).toFixed(2) : "0.00";
                                                    let level = 0;
                                                    if (perc >= 80) level = 3;
                                                    else if (perc <= 40 && perc > 0) level = 1;
                                                    else if (perc >= 40 && perc <= 80) level = 2;
                                                    return <Td key={`level-${idx}`}>{level}</Td>;
                                                })}
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}

                            <Divider my={4} />

                            {expandedSheet && processedData[expandedSheet] && (
                                <Box mt={8} overflowX="auto">
                                    <Heading size="xl" mb={2} color="gray.700">CO Attainment Levels</Heading>
                                    <Table variant="striped" size="sm" bg={tableBg} >
                                        <Thead bg={headerBg}>
                                            <Tr>
                                                <Th color={headerColor}>CO</Th>
                                                <Th color={headerColor}>Attainment Level</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {Object.entries(processedData[expandedSheet].coData).map(([coKey, arr], idx) => {
                                                const thresholdmarks = (arr[1] || 0) * (threshold / 100);;
                                                let above = 0;
                                                if (thresholdmarks > 0) {
                                                    above = arr.slice(2).filter(mark => parseFloat(mark) >= thresholdmarks).length;
                                                }
                                                const total = processedData[expandedSheet].studentNames.length - 1;
                                                const perc = total > 0 ? (above / total) * 100 : 0;
                                                let level = 0;
                                                if (perc > 80) level = 3;
                                                else if (perc <= 40 && perc > 0) level = 1;
                                                else if (perc >= 40 && perc <= 80) level = 2;
                                                return (
                                                    <Tr key={idx}>
                                                        <Td>{coKey}</Td>
                                                        <Td fontWeight="bold">{level}</Td>
                                                    </Tr>
                                                );
                                            })}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </>
                    )}
                </motion.div>
            </Flex>
        </>
    );
};

export default UploadedFilesPage;
