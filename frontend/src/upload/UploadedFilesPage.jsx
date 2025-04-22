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
import COAttainmentChart from "@/components/COAttainmentChart";
import { toPng } from "html-to-image";

const UploadedFilesPage = () => {
  const location = useLocation();
  const rawFileContents = location.state?.fileContents || {};
  const [processedData, setProcessedData] = useState({});
  const [expandedSheet, setExpandedSheet] = useState(null);
  const [threshold, setThreshold] = useState(50); // Default threshold value
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [courseAttainmentSummaryData, setCourseAttainmentSummaryData] =
    useState({});

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
      const attainmentData = {};

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

        // Calculate attainment levels for each CO
        const coKeys = Object.keys(actualCOs);
        coKeys.forEach((co) => {
          const marks = actualCOs[co][1] || 0;
          if (marks === 0) {
            if (!attainmentData[co]) attainmentData[co] = {};
            attainmentData[co][sheetName] = 0;
            return;
          }
          const thresholdMarks = marks * (threshold / 100);
          const above = actualCOs[co]
            .slice(2)
            .filter((mark) => parseFloat(mark) >= thresholdMarks).length;
          const total = studentNames.length - 1;
          const perc = total > 0 ? (above / total) * 100 : 0;
          let level = 0;
          if (perc >= 80) level = 3;
          else if (perc <= 40 && perc > 0) level = 1;
          else if (perc > 40 && perc < 80) level = 2;

          if (!attainmentData[co]) attainmentData[co] = {};
          attainmentData[co][sheetName] = level;
        });
      }

      setProcessedData(finalData);
      setCourseAttainmentSummaryData(attainmentData);
    };

    processFiles();
  }, [rawFileContents, threshold]);

  const toggleSheetDetails = (sheetName) => {
    setExpandedSheet((prev) => (prev === sheetName ? null : sheetName));
  };

  const getDetailedAnalysisData = () => {
    const detailedAnalysisData = [];
    const normalizedWeights = weights.map((w) => w / 100);

    Object.keys(courseAttainmentSummaryData).forEach((co, index) => {
      const coData = courseAttainmentSummaryData[co];
      const rowData = {
        co: `CO${index + 1}`,
        statement: coStatements[index] || `CO Statement for ${co}`,
        components: {},
        attainmentLevel: 0,
        indirectAssessment: indirectAttainment,
        overallAttainment: 0,
        overallPercentage: 0,
      };

      let directAssessmentNumerator = 0;
      let directAssessmentDenominator = 0;

      componentNames.forEach((component, i) => {
        const componentLevel = coData[component] || 0;
        rowData.components[component] = {
          value: componentLevel,
          weight: normalizedWeights[i],
        };

        if (componentLevel > 0) {
          directAssessmentNumerator += componentLevel * normalizedWeights[i];
          directAssessmentDenominator += normalizedWeights[i];
        }
      });

      if (directAssessmentDenominator > 0) {
        rowData.attainmentLevel =
          directAssessmentNumerator / directAssessmentDenominator;
      }

      rowData.overallAttainment =
        0.8 * rowData.attainmentLevel + 0.2 * indirectAttainment;
      rowData.overallPercentage = (rowData.overallAttainment / 3) * 100;

      detailedAnalysisData.push(rowData);
    });

    return detailedAnalysisData;
  };

  const captureChartImage = async () => {
    const chartElement = document.getElementById("co-attainment-chart");
    if (!chartElement) return null;
  
    try {
      // Ensure white background for the capture
      const dataUrl = await toPng(chartElement, {
        backgroundColor: '#FFFFFF', // White background
        quality: 1 // Highest quality
      });
      
      return dataUrl;
    } catch (error) {
      console.error("Error capturing chart:", error);
      return null;
    }
  };

  const downloadAllSheetsAsExcel = async () => {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const normalizedWeights = weights.map((w) => w / 100);
    const chartImage = await captureChartImage();

    // Create a function to add a worksheet with data
    const addWorksheet = (workbook, sheetName, data) => {
      const worksheet = workbook.addWorksheet(sheetName);
      data.forEach((row) => {
        worksheet.addRow(row);
      });
      return worksheet;
    };

    // Process each sheet
    Object.keys(processedData).forEach((sheetName) => {
      const sheetData = processedData[sheetName];
      const coKeys = Object.keys(sheetData.coData);

      // Prepare data for this sheet
      const sheetDataRows = [
        ["Sheet Data"],
        [
          "Roll No",
          "Name",
          ...coKeys.map((co) => `Total of ${co}`),
          "Total Marks",
        ],
        ...Array.from({ length: sheetData.studentNames.length - 1 }, (_, i) => [
          sheetData.rollNumbers[i + 1] || "N/A",
          sheetData.studentNames[i + 1] || "N/A",
          ...coKeys.map((co) => sheetData.coData[co][i + 2] || "0"),
          sheetData.totalMarks[i + 2] || "0",
        ]),
        [],
        [],
        ["CO Attainment Summary"],
        ["", ...coKeys],
        ["Marks", ...coKeys.map((co) => sheetData.coData[co][1] || 0)],
        ["Threshold %", ...coKeys.map(() => threshold)],
        [
          "Threshold Marks",
          ...coKeys.map((co) => {
            const marks = sheetData.coData[co][1] || 0;
            return marks === 0 ? 0 : (marks * (threshold / 100)).toFixed(2);
          }),
        ],
        [
          "Students ≥ Threshold",
          ...coKeys.map((co) => {
            const marks = sheetData.coData[co][1] || 0;
            if (marks === 0) return 0;
            const thresholdMarks = marks * (threshold / 100);
            return sheetData.coData[co]
              .slice(2)
              .filter((mark) => parseFloat(mark) >= thresholdMarks).length;
          }),
        ],
        [
          "Total Students",
          ...coKeys.map(() => sheetData.studentNames.length - 1),
        ],
        [
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
        ],
        [
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
        ],
        [],
        [],
        ["CO Attainment Levels"],
        ["CO", "Attainment Level"],
        ...coKeys.map((co) => {
          const marks = sheetData.coData[co][1] || 0;
          if (marks === 0) return [co, 0];
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
          return [co, level];
        }),
      ];

      addWorksheet(workbook, sheetName, sheetDataRows);
    });

    // Create Detailed CO Analysis sheet
    const detailedAnalysis = getDetailedAnalysisData();
    const detailedCOAnalysisSheet = [
      ["THE LNMIIT JAIPUR"],
      [`Department of ${branchName}`],
      ["Attainment of CO's"],
      [],
      [
        `Program: ${branchName}`,
        `${courseName}`,
        `Class: ${className}`,
        `Semester: ${semester}`,
        `Academic Year: ${academicYear}`,
      ],
      [],
      [],
      [
        "Sr. No.",
        "CO Statement",
        ...componentNames,
        "Attainment Level",
        "Indirect Assessment",
        "Overall Attainment on Scale of 3",
        "Overall Percentage Attainment",
      ],
      [
        "",
        "Weightage",
        ...weights.map((w) => `${(w / 100).toFixed(3)}`),
        "",
        "",
        "",
        "",
      ],
      ...detailedAnalysis.map((row) => [
        row.co,
        row.statement,
        ...componentNames.map((comp) => row.components[comp]?.value || 0),
        row.attainmentLevel.toFixed(2),
        row.indirectAssessment.toFixed(2),
        row.overallAttainment.toFixed(2),
        `${row.overallPercentage.toFixed(2)}%`,
      ]),
      [],
      [],
      ["Attainment Targets"],
      ["Target (%)", "CO"],
      ...detailedAnalysis.map((row) => [threshold, row.co]),
      [],
      [],
      ["Observations"],
      [
        `1. ${
          detailedAnalysis.filter((row) => row.overallPercentage >= threshold)
            .length > 0
            ? `COs (${detailedAnalysis
                .filter((row) => row.overallPercentage >= threshold)
                .map((row) => row.co)
                .join(
                  ", "
                )}) with attainment ≥ ${threshold}% indicate GOOD performance.`
            : `No COs met or exceeded the ${threshold}% target`
        }`,
      ],
      [
        `2. ${
          detailedAnalysis.filter((row) => row.overallPercentage < threshold)
            .length > 0
            ? `COs (${detailedAnalysis
                .filter((row) => row.overallPercentage < threshold)
                .map((row) => row.co)
                .join(
                  ", "
                )}) with attainment < ${threshold}% suggest areas needing improvement.`
            : `All COs met or exceeded the ${threshold}% target`
        }`,
      ],
      [],
      [],
      ["CO Attainment Chart:"],
      [], // Placeholder for image
    ];

    const detailedWorksheet = addWorksheet(
      workbook,
      "Detailed CO Analysis",
      detailedCOAnalysisSheet
    );
    // Add the chart image if available
    if (chartImage) {
      try {
        const imageId = workbook.addImage({
          base64: chartImage.split(',')[1],
          extension: 'png'
        });
  
        // Calculate position - after all content with some spacing
        const imageRow = detailedCOAnalysisSheet.length + 3;
        
        detailedWorksheet.addImage(imageId, {
          tl: { col: 0, row: imageRow }, // Start at column B
          ext: { width: 600, height: 350 },
          editAs: 'oneCell'
        });
  
        // Merge cells to create space for the image
        detailedWorksheet.mergeCells(`B${imageRow}:G${imageRow + 15}`);
        
      } catch (error) {
        console.error("Error adding image to Excel:", error);
      }
    }

    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const data = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
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

              <Divider my={4} />

              <Button
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                colorScheme="teal"
                mt={4}
                mb={6}
                mr={4}
              >
                {showDetailedAnalysis
                  ? "Hide Detailed CO Analysis"
                  : "Show Detailed CO Analysis"}
              </Button>

              {showDetailedAnalysis && (
                <Box mt={8} overflowX="auto">
                  <Heading size="xl" mb={2} color="gray.700">
                    Detailed CO Analysis
                  </Heading>
                  <Divider my={4} />

                  <Table
                    size="sm"
                    bg={tableBg}
                    borderRadius="xl"
                    boxShadow="md"
                  >
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th color={headerColor}>CO</Th>
                        <Th color={headerColor}>Statement</Th>
                        {componentNames.map((component) => (
                          <Th key={component} color={headerColor}>
                            {component}
                          </Th>
                        ))}
                        <Th color={headerColor}>Attainment Level</Th>
                        <Th color={headerColor}>Indirect Assessment</Th>
                        <Th color={headerColor}>Overall Attainment</Th>
                        <Th color={headerColor}>Percentage</Th>
                      </Tr>
                      <Tr>
                        <Th></Th>
                        <Th></Th>
                        {componentNames.map((component, i) => (
                          <Th key={`weight-${i}`} color={headerColor}>
                            Weight: {(weights[i] / 100).toFixed(3)}
                          </Th>
                        ))}
                        <Th></Th>
                        <Th></Th>
                        <Th></Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {getDetailedAnalysisData().map((row, index) => (
                        <Tr key={index}>
                          <Td fontWeight="bold">{row.co}</Td>
                          <Td>{row.statement}</Td>
                          {componentNames.map((component) => (
                            <Td key={`${row.co}-${component}`}>
                              {row.components[component]?.value || 0}
                            </Td>
                          ))}
                          <Td>{row.attainmentLevel.toFixed(2)}</Td>
                          <Td>{row.indirectAssessment.toFixed(2)}</Td>
                          <Td>{row.overallAttainment.toFixed(2)}</Td>
                          <Td>{row.overallPercentage.toFixed(2)}%</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  {/* Add Threshold Table */}
                  <Box mt={8}>
                    <Heading size="md" mb={4} color="gray.700">
                      Attainment Targets
                    </Heading>
                    <Table
                      size="sm"
                      bg={tableBg}
                      borderRadius="xl"
                      boxShadow="md"
                      maxW="300px"
                    >
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th color={headerColor}>Target (%)</Th>
                          <Th color={headerColor}>CO</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getDetailedAnalysisData().map((row, index) => (
                          <Tr key={`target-${index}`}>
                            <Td>{threshold}</Td>
                            <Td>{row.co}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  {/* Add Observations */}
                  <Box mt={8}>
                    <Heading size="md" mb={4} color="gray.700">
                      Observations
                    </Heading>
                    <Card bg={tableBg} p={4}>
                      {(() => {
                        const analysisData = getDetailedAnalysisData();
                        const highAttainmentCOs = analysisData.filter(
                          (row) => row.overallPercentage >= threshold
                        );
                        const lowAttainmentCOs = analysisData.filter(
                          (row) => row.overallPercentage < threshold
                        );

                        return (
                          <>
                            <Text mb={2}>
                              {highAttainmentCOs.length > 0
                                ? `1. COs (${highAttainmentCOs
                                    .map((row) => row.co)
                                    .join(
                                      ", "
                                    )}) with attainment ≥ ${threshold}% ` +
                                  `(ranging from ${Math.min(
                                    ...highAttainmentCOs.map(
                                      (row) => row.overallPercentage
                                    )
                                  ).toFixed(1)}% to ` +
                                  `${Math.max(
                                    ...highAttainmentCOs.map(
                                      (row) => row.overallPercentage
                                    )
                                  ).toFixed(1)}%) indicate GOOD performance.`
                                : `1. No COs met or exceeded the ${threshold}% target`}
                            </Text>
                            <Text>
                              {lowAttainmentCOs.length > 0
                                ? `2. COs (${lowAttainmentCOs
                                    .map((row) => row.co)
                                    .join(
                                      ", "
                                    )}) with attainment < ${threshold}% ` +
                                  `(ranging from ${Math.min(
                                    ...lowAttainmentCOs.map(
                                      (row) => row.overallPercentage
                                    )
                                  ).toFixed(1)}% to ` +
                                  `${Math.max(
                                    ...lowAttainmentCOs.map(
                                      (row) => row.overallPercentage
                                    )
                                  ).toFixed(
                                    1
                                  )}%) suggest areas needing improvement.`
                                : `2. All COs met or exceeded the ${threshold}% target`}
                            </Text>
                          </>
                        );
                      })()}
                    </Card>
                  </Box>

                  {/* Add Bar Graph */}
                  <Box mt={8}>
                    <Heading size="md" mb={4} color="gray.700">
                      Attainment vs Target
                    </Heading>
                    <Card bg={tableBg} p={4}>
                      <Box
                        id="co-attainment-chart"
                        height="400px"
                        position="relative" // Add this
                        zIndex="1" // Add this
                      >
                        <COAttainmentChart
                          data={getDetailedAnalysisData()}
                          threshold={threshold}
                        />
                      </Box>
                    </Card>
                  </Box>
                </Box>
              )}

              <Button
                onClick={downloadAllSheetsAsExcel}
                colorScheme="green"
                mt={4}
                mb={6}
                overflowX="auto"
              >
                Download CO Analysis as Excel
              </Button>
            </>
          )}
        </motion.div>
      </Flex>
    </>
  );
};

export default UploadedFilesPage;
