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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UploadedFilesPage = () => {
  const location = useLocation();
  const rawFileContents = location.state?.fileContents || {};
  const [processedData, setProcessedData] = useState({});
  const [expandedSheet, setExpandedSheet] = useState(null);
  const [threshold, setThreshold] = useState(50); // Default threshold value

  const formData = location.state?.formData || {};
  const componentNames = location.state?.componentNames || [];
  const weights = location.state?.weights || [];
  const coStatements = location.state?.coStatements || [];

   // Extract the specific values we need
  const branchName = formData?.Branch_name || "Branch Not Provided";
  const courseName = formData?.Course_name || "Course Not Provided";
  const className = formData?.Class || "Class Not Provided";
  const semester = formData?.Semester || "Semester Not Provided";
  const academicYear = formData?.AcademicYear || "Academic Year Not Provided";
  const indirectAttainment = formData?.IndirectAttainment || 0;
  

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

  const downloadAllSheetsAsExcel = () => {
    const workbook = XLSX.utils.book_new();
  const courseAttainmentSummaryData = {};
  const formData = location.state?.formData || {};
  const componentNames = location.state?.componentNames || [];
  const weights = location.state?.weights || [];
  const coStatements = location.state?.coStatements || [];
  
  // Normalize weights to be between 0 and 1
  const normalizedWeights = weights.map(w => w / 100);
    

    Object.keys(processedData).forEach((sheetName) => {
      const sheetData = processedData[sheetName];
      const coKeys = Object.keys(sheetData.coData);
  
      // 1. SHEET DATA
      const headers = [
        "Roll No",
        "Name",
        ...coKeys.map((co) => `Total of ${co}`),
        "Total Marks",
      ];
      const dataRows = [];
  
      for (let i = 1; i < sheetData.studentNames.length; i++) {
        const row = [
          sheetData.rollNumbers[i] || "N/A",
          sheetData.studentNames[i] || "N/A",
          ...coKeys.map((co) => sheetData.coData[co][i + 1] || "0"),
          sheetData.totalMarks[i + 1] || "0",
        ];
        dataRows.push(row);
      }
  
      const sheetSection = [["Sheet Data"], headers, ...dataRows];
  
      // 2. CO ATTAINMENT SUMMARY
      const attainmentSummary = [["CO Attainment Summary"]];
      const summaryHeaders = ["", ...coKeys];
      attainmentSummary.push(summaryHeaders);
  
      const totalMarksRow = [
        "Marks",
        ...coKeys.map((co) => sheetData.coData[co][1] || 0),
      ];
  
      const thresholdRow = ["Threshold %", ...coKeys.map(() => threshold)];
  
      const thresholdMarksRow = [
        "Threshold Marks",
        ...coKeys.map((co) => {
          const marks = sheetData.coData[co][1] || 0;
          return marks === 0 ? 0 : (marks * (threshold / 100)).toFixed(2);
        }),
      ];
  
      const studentsAboveThresholdRow = [
        "Students ≥ Threshold",
        ...coKeys.map((co) => {
          const marks = sheetData.coData[co][1] || 0;
          if (marks === 0) return 0;
          const thresholdMarks = marks * (threshold / 100);
          return sheetData.coData[co]
            .slice(2)
            .filter((mark) => parseFloat(mark) >= thresholdMarks).length;
        }),
      ];
  
      const totalStudentsRow = [
        "Total Students",
        ...coKeys.map(() => sheetData.studentNames.length - 1),
      ];
  
      const percentageRow = [
        "Percentage Attainment",
        ...coKeys.map((co) => {
          const marks = sheetData.coData[co][1] || 0;
          if (marks === 0) return 0;
          const thresholdMarks = marks * (threshold / 100);
          const above = sheetData.coData[co]
            .slice(2)
            .filter((mark) => parseFloat(mark) >= thresholdMarks).length;
          const total = sheetData.studentNames.length - 1;
          return total > 0 ? ((above / total) * 100).toFixed(2) : "0.00";
        }),
      ];
  
      const levelRow = [
        "Attainment Level",
        ...coKeys.map((co) => {
          const marks = sheetData.coData[co][1] || 0;
          if (marks === 0) return 0;
          const thresholdMarks = marks * (threshold / 100);
          const above = sheetData.coData[co]
            .slice(2)
            .filter((mark) => parseFloat(mark) >= thresholdMarks).length;
          const total = sheetData.studentNames.length - 1;
          const perc = total > 0 ? (above / total) * 100 : 0;
          if (perc >= 80) return 3;
          if (perc <= 40 && perc > 0) return 1;
          if (perc > 40 && perc < 80) return 2;
          return 0;
        }),
      ];
  
      attainmentSummary.push(
        totalMarksRow,
        thresholdRow,
        thresholdMarksRow,
        studentsAboveThresholdRow,
        totalStudentsRow,
        percentageRow,
        levelRow
      );
  
      // 3. CO LEVEL SUMMARY
      const levelSummary = [["CO Attainment Levels"], ["CO", "Attainment Level"]];
      const coLevelMap = {};
      coKeys.forEach((co) => {
        const marks = sheetData.coData[co][1] || 0;
        if (marks === 0) {
          levelSummary.push([co, 0]);
          return;
        }
        const thresholdMarks = marks * (threshold / 100);
        const above = sheetData.coData[co]
          .slice(2)
          .filter((mark) => parseFloat(mark) >= thresholdMarks).length;
        const total = sheetData.studentNames.length - 1;
        const perc = total > 0 ? (above / total) * 100 : 0;
        let level = 0;
        if (perc >= 80) level = 3;
        else if (perc <= 40 && perc > 0) level = 1;
        else if (perc > 40 && perc < 80) level = 2;
  
        levelSummary.push([co, level]);

        coLevelMap[co] = level;
        if (!courseAttainmentSummaryData[co])
        courseAttainmentSummaryData[co] = {};
      courseAttainmentSummaryData[co][sheetName] = level;
      });

      
      const finalSheet = [
        ...sheetSection,
        [],
        [],
        ...attainmentSummary,
        [],
        [],
        ...levelSummary,
      ];
  
      const worksheet = XLSX.utils.aoa_to_sheet(finalSheet);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

  // Now create the Detailed CO Analysis sheet
const detailedCOAnalysisSheet = [];

// Add header information
detailedCOAnalysisSheet.push(["THE LNMIIT JAIPUR"]);
detailedCOAnalysisSheet.push([`Department of ${branchName}`]);
detailedCOAnalysisSheet.push(["Attainment of CO's"]);
detailedCOAnalysisSheet.push([]); // Empty row

// Add program information row (merged cells in Excel)
detailedCOAnalysisSheet.push([
  `Program: ${branchName}`,
  `${courseName}`,
  `Class: ${className}`,
  `Semester: ${semester}`,
  `Academic Year: ${academicYear}`
]);

detailedCOAnalysisSheet.push([], []); // Empty rows


detailedCOAnalysisSheet.push([
  " ",
  "",
  "Direct Assessment",
]);

// Create table headers
const tableHeaders = [
  "Sr. No.",
  "CO Statement",
  ...componentNames,
  //"Weightage", // New weightage row
  "Attainment Level", // New column
  //"Direct Assessment",
  "Indirect Assessment",
  "Overall Attainment on Scale of 3",
  "Overall Percentage Attainment"
];

detailedCOAnalysisSheet.push(tableHeaders);

// Add weightage row right after headers
const weightageRow = [
  "", // Empty for Sr. No.
  "Weightage", // Empty for CO Statement
  ...weights.map(w => `${(w/100).toFixed(3)}`), // Weightages for each component
  //"", // Empty for Weightage header
  "", // Empty for Attainment Level
 // "", // Empty for Direct Assessment
  "", // Empty for Indirect Assessment
  "", // Empty for Overall Attainment
  ""  // Empty for Overall Percentage
];
detailedCOAnalysisSheet.push(weightageRow);

// Calculate and add data for each CO
Object.keys(courseAttainmentSummaryData).forEach((co, index) => {
  const coData = courseAttainmentSummaryData[co];
  const rowData = [
    `CO${index + 1}`, // Sr. No. as CO1, CO2, etc.
    coStatements[index] || `CO Statement for ${co}`, // CO Statement
  ];

  // Add component values (Quiz1, Quiz2, etc.)
  componentNames.forEach(component => {
    rowData.push(coData[component] || 0);
  });

  // Add weightage sum (empty cell under weightage header)
  //rowData.push("");

  // Calculate Direct Assessment (weighted average of components where level > 0)
  let directAssessmentNumerator = 0;
  let directAssessmentDenominator = 0;
  let attainmentLevel = 0;
  
  componentNames.forEach((component, i) => {
    const componentLevel = coData[component] || 0;
    if (componentLevel > 0) {
      directAssessmentNumerator += componentLevel * normalizedWeights[i];
      directAssessmentDenominator += normalizedWeights[i];
    }
  });

  if (directAssessmentDenominator > 0) {
    attainmentLevel = directAssessmentNumerator / directAssessmentDenominator;
  }

  // Add Attainment Level
  rowData.push(attainmentLevel.toFixed(2));

  // Add Direct Assessment (same as attainment level in this case)
  //rowData.push(attainmentLevel.toFixed(2));

  // Add Indirect Assessment
  rowData.push(indirectAttainment);
  
  // Calculate Overall Attainment (80% direct + 20% indirect)
  const overallAttainment = (0.8 * attainmentLevel) + (0.2 * indirectAttainment);
  rowData.push(overallAttainment.toFixed(2));
  
  // Calculate Overall Percentage Attainment
  const overallPercentage = (overallAttainment / 3) * 100;
  rowData.push(`${overallPercentage.toFixed(2)}%`);

  detailedCOAnalysisSheet.push(rowData);
});

// Add the Detailed CO Analysis sheet to the workbook
const detailedWorksheet = XLSX.utils.aoa_to_sheet(detailedCOAnalysisSheet);

// Set column widths for better formatting
const colWidths = [
  { wch: 50 },  // Sr. No.
  { wch: 40 },  // CO Statement
  ...componentNames.map(() => ({ wch: 12 })), // Components
  { wch: 12 },  // Weightage
  { wch: 15 },  // Attainment Level
  { wch: 15 },  // Direct Assessment
  { wch: 15 },  // Indirect Assessment
  { wch: 25 },  // Overall Attainment
  { wch: 25 },  // Overall Percentage
];
detailedWorksheet['!cols'] = colWidths;

XLSX.utils.book_append_sheet(workbook, detailedWorksheet, "Detailed CO Analysis");
  // Generate and download the Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  saveAs(data, `Combined_CO_Analysis_${threshold}perc_${timestamp}.xlsx`);
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
                      variant={
                        expandedSheet === sheetName ? "solid" : "outline"
                      }
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
                              {Object.keys(
                                processedData[expandedSheet].coData
                              ).map((coKey) => (
                                <Th key={coKey} color={headerColor}>
                                  Total of {coKey}
                                </Th>
                              ))}
                              <Th color={headerColor}>Total Marks</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr fontWeight="bold" color="gray.200">
                              <Td></Td>
                              <Td></Td>
                              {Object.entries(
                                processedData[expandedSheet].coData
                              ).map(([coKey, values]) => (
                                <Td
                                  key={coKey}
                                  color="gray.800"
                                  fontWeight="semibold"
                                >
                                  {Array.isArray(values) && values[1]
                                    ? `Out of ${values[1]}`
                                    : 0}
                                </Td>
                              ))}
                              <Td
                                color="gray.800"
                                fontWeight="semibold"
                              >{`Out of ${
                                processedData[expandedSheet].totalMarks[1] ??
                                "0"
                              }`}</Td>
                            </Tr>
                            {processedData[expandedSheet].studentNames
                              .slice(1)
                              .map((_, studentIndex) => (
                                <Tr key={studentIndex}>
                                  <Td>
                                    {processedData[expandedSheet].rollNumbers[
                                      studentIndex + 1
                                    ] || "N/A"}
                                  </Td>
                                  <Td>
                                    {processedData[expandedSheet].studentNames[
                                      studentIndex + 1
                                    ] || "N/A"}
                                  </Td>
                                  {Object.entries(
                                    processedData[expandedSheet].coData
                                  ).map(([coKey, values]) => (
                                    <Td key={coKey}>
                                      {Array.isArray(values)
                                        ? values[studentIndex + 2] || "0"
                                        : "N/A"}
                                    </Td>
                                  ))}
                                  <Td>
                                    {processedData[expandedSheet].totalMarks[
                                      studentIndex + 2
                                    ] ?? "0"}
                                  </Td>
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
                        <FormLabel fontWeight="bold" color={"black"}>
                          Threshold Percentage
                        </FormLabel>
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
                  <Table
                    size="sm"
                    bg={tableBg}
                    borderRadius="xl"
                    boxShadow="md"
                  >
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th color={headerColor}>CO</Th>
                        {Object.keys(processedData[expandedSheet].coData).map(
                          (coKey) => (
                            <Th key={coKey} color={headerColor}>
                              {coKey}
                            </Th>
                          )
                        )}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">Marks</Td>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => (
                            <Td key={`marks-${idx}`}>{arr[1] || 0}</Td>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Threshold %</Td>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (_, idx) => (
                            <Td key={`threshold-${idx}`}>{threshold}</Td>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Threshold Marks</Td>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => (
                            <Td key={`threshold-marks-${idx}`}>
                              {(arr[1] || 0) * (threshold / 100).toFixed(2)}
                            </Td>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">No. of Students ≥ Threshold</Td>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => {
                            const thresholdmarks =
                              (arr[1] || 0) * (threshold / 100);
                            let above = 0;
                            if (thresholdmarks > 0) {
                              above = arr
                                .slice(2)
                                .filter(
                                  (mark) => parseFloat(mark) >= thresholdmarks
                                ).length;
                            }
                            // else{
                            //     above=0;
                            // }
                            return <Td key={`above-${idx}`}>{above}</Td>;
                          }
                        )}
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Total Students</Td>
                        {Object.keys(processedData[expandedSheet].coData).map(
                          (_, idx) => (
                            <Td key={`total-${idx}`}>
                              {processedData[expandedSheet].studentNames
                                .length - 1}
                            </Td>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Percentage Attainment</Td>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => {
                            const thresholdmarks =
                              (arr[1] || 0) * (threshold / 100);
                            let above = 0;
                            if (thresholdmarks > 0) {
                              above = arr
                                .slice(2)
                                .filter(
                                  (mark) => parseFloat(mark) >= thresholdmarks
                                ).length;
                            }
                            // else{
                            //     above=0;
                            // }
                            const total =
                              processedData[expandedSheet].studentNames.length -
                              1;
                            return (
                              <Td key={`attainment-${idx}`}>
                                {total > 0
                                  ? ((above / total) * 100).toFixed(2)
                                  : "0.00"}
                              </Td>
                            );
                          }
                        )}
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Attainment Level</Td>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => {
                            const thresholdmarks =
                              (arr[1] || 0) * (threshold / 100);
                            let above = 0;
                            if (thresholdmarks > 0) {
                              above = arr
                                .slice(2)
                                .filter(
                                  (mark) => parseFloat(mark) >= thresholdmarks
                                ).length;
                            }
                            // else{
                            //     above=0;
                            // }
                            const total =
                              processedData[expandedSheet].studentNames.length -
                              1;
                            const perc =
                              total > 0
                                ? ((above / total) * 100).toFixed(2)
                                : "0.00";
                            let level = 0;
                            if (perc >= 80) level = 3;
                            else if (perc <= 40 && perc > 0) level = 1;
                            else if (perc >= 40 && perc <= 80) level = 2;
                            return <Td key={`level-${idx}`}>{level}</Td>;
                          }
                        )}
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
              )}

              <Divider my={4} />

              {expandedSheet && processedData[expandedSheet] && (
                <Box mt={8} overflowX="auto">
                  <Heading size="xl" mb={2} color="gray.700">
                    CO Attainment Levels
                  </Heading>
                  <Table variant="striped" size="sm" bg={tableBg}>
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th color={headerColor}>CO</Th>
                        <Th color={headerColor}>Attainment Level</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(processedData[expandedSheet].coData).map(
                        ([coKey, arr], idx) => {
                          const thresholdmarks =
                            (arr[1] || 0) * (threshold / 100);
                          let above = 0;
                          if (thresholdmarks > 0) {
                            above = arr
                              .slice(2)
                              .filter(
                                (mark) => parseFloat(mark) >= thresholdmarks
                              ).length;
                          }
                          const total =
                            processedData[expandedSheet].studentNames.length -
                            1;
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
                        }
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </>
          )}
        </motion.div>
        <Button onClick={downloadAllSheetsAsExcel} colorScheme="green" mt={4}>
            Download CO Analysis as Excel
          </Button>
      </Flex>
    </>
  );
};

export default UploadedFilesPage;
