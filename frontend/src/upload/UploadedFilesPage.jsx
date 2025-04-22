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

// Custom Table Components
const CustomTable = ({ children, ...props }) => (
  <Table
    size="sm"
    variant="simple"
    bg="white"
    borderRadius="md"
    boxShadow="md"
    borderWidth="1px"
    borderColor="gray.200"
    sx={{
      "th, td": {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }}
    {...props}
  >
    {children}
  </Table>
);

const CustomTh = ({ children, ...props }) => (
  <Th
    fontWeight="bold"
    color="gray.800"
    bg="gray.100"
    borderColor="gray.300"
    textTransform="none"
    fontSize="sm"
    py={3}
    px={4}
    {...props}
  >
    {children}
  </Th>
);

const CustomTd = ({ children, ...props }) => (
  <Td
    fontWeight="medium"
    borderColor="gray.200"
    fontSize="sm"
    py={2}
    px={4}
    {...props}
  >
    {children}
  </Td>
);

const UploadedFilesPage = () => {
  const location = useLocation();
  const rawFileContents = location.state?.fileContents || {};
  const [processedData, setProcessedData] = useState({});
  const [expandedSheet, setExpandedSheet] = useState(null);
  const [threshold, setThreshold] = useState(50);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [courseAttainmentSummaryData, setCourseAttainmentSummaryData] =
    useState({});

  const formData = location.state?.formData || {};
  const componentNames = location.state?.componentNames || [];
  const weights = location.state?.weights || [];
  const coStatements = location.state?.coStatements || [];

  // Extract values
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
      const dataUrl = await toPng(chartElement, {
        backgroundColor: "#FFFFFF",
        quality: 1,
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

    const addWorksheet = (workbook, sheetName, data) => {
      const worksheet = workbook.addWorksheet(sheetName);
      data.forEach((row) => {
        worksheet.addRow(row);
      });

      // Style header row
      if (data.length > 0) {
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
      }

      // Set wrap text for all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { wrapText: true };
        });
      });

      // Auto-fit columns with a minimum width
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50); // Increased max width
      });

      return worksheet;
    };

    // Process each sheet
    Object.keys(processedData).forEach((sheetName) => {
      const sheetData = processedData[sheetName];
      const coKeys = Object.keys(sheetData.coData);

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
      [],
    ];

    const detailedWorksheet = addWorksheet(
      workbook,
      "Detailed CO Analysis",
      detailedCOAnalysisSheet
    );

    // Manually set column widths for specific columns that need more space
    if (detailedWorksheet.columns && detailedWorksheet.columns.length > 1) {
      // Make the CO Statement column wider (column B)
      detailedWorksheet.columns[1].width = 50; // Set a fixed width for statement column

      // Make component columns narrower (columns C, D, etc.)
      componentNames.forEach((_, i) => {
        if (detailedWorksheet.columns[2 + i]) {
          detailedWorksheet.columns[2 + i].width = 15;
        }
      });
    }

    if (chartImage) {
      try {
        const imageId = workbook.addImage({
          base64: chartImage.split(",")[1],
          extension: "png",
        });

        detailedWorksheet.addImage(imageId, {
          tl: { col: 0, row: detailedCOAnalysisSheet.length + 3 },
          ext: { width: 600, height: 350 },
          editAs: "oneCell",
        });

        detailedWorksheet.mergeCells(
          `B${detailedCOAnalysisSheet.length + 3}:G${
            detailedCOAnalysisSheet.length + 18
          }`
        );
      } catch (error) {
        console.error("Error adding image to Excel:", error);
      }
    }

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
                  <Card mb={6} borderRadius="xl" bg={tableBg}>
                    <CardBody>
                      <Heading size="md" mb={4} color="blue.600">
                        Sheet: {expandedSheet}
                      </Heading>
                      <Divider my={4} />
                      <Box mt={6} overflowX="auto">
                        <CustomTable>
                          <Thead>
                            <Tr>
                              <CustomTh>Roll No</CustomTh>
                              <CustomTh>Name</CustomTh>
                              {Object.keys(
                                processedData[expandedSheet].coData
                              ).map((coKey) => (
                                <CustomTh key={coKey}>
                                  Total of {coKey}
                                </CustomTh>
                              ))}
                              <CustomTh>Total Marks</CustomTh>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <CustomTd></CustomTd>
                              <CustomTd></CustomTd>
                              {Object.values(
                                processedData[expandedSheet].coData
                              ).map((arr, idx) => (
                                <CustomTd
                                  key={`marks-${idx}`}
                                  fontWeight="bold"
                                >
                                  {Array.isArray(arr) && arr[1]
                                    ? `Out of ${arr[1]}`
                                    : 0}
                                </CustomTd>
                              ))}
                              <CustomTd fontWeight="bold">{`Out of ${
                                processedData[expandedSheet].totalMarks[1] ??
                                "0"
                              }`}</CustomTd>
                            </Tr>
                            {processedData[expandedSheet].studentNames
                              .slice(1)
                              .map((_, studentIndex) => (
                                <Tr
                                  key={studentIndex}
                                  _hover={{ bg: "gray.50" }}
                                >
                                  <CustomTd>
                                    {processedData[expandedSheet].rollNumbers[
                                      studentIndex + 1
                                    ] || "N/A"}
                                  </CustomTd>
                                  <CustomTd>
                                    {processedData[expandedSheet].studentNames[
                                      studentIndex + 1
                                    ] || "N/A"}
                                  </CustomTd>
                                  {Object.values(
                                    processedData[expandedSheet].coData
                                  ).map((arr, idx) => (
                                    <CustomTd key={`val-${idx}`}>
                                      {Array.isArray(arr)
                                        ? arr[studentIndex + 2] || "0"
                                        : "N/A"}
                                    </CustomTd>
                                  ))}
                                  <CustomTd>
                                    {processedData[expandedSheet].totalMarks[
                                      studentIndex + 2
                                    ] ?? "0"}
                                  </CustomTd>
                                </Tr>
                              ))}
                          </Tbody>
                        </CustomTable>
                      </Box>
                    </CardBody>
                  </Card>
                </Collapse>
              )}

              {expandedSheet && processedData[expandedSheet] && (
                <Box mt={8} overflowX="auto">
                  <Heading size="xl" mb={4} color="gray.700">
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
                  <CustomTable>
                    <Thead>
                      <Tr>
                        <CustomTh>Metric</CustomTh>
                        {Object.keys(processedData[expandedSheet].coData).map(
                          (coKey) => (
                            <CustomTh key={coKey}>{coKey}</CustomTh>
                          )
                        )}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <CustomTd fontWeight="bold">Marks</CustomTd>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => (
                            <CustomTd key={`marks-${idx}`}>
                              {arr[1] || 0}
                            </CustomTd>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <CustomTd fontWeight="bold">Threshold %</CustomTd>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (_, idx) => (
                            <CustomTd key={`threshold-${idx}`}>
                              {threshold}
                            </CustomTd>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <CustomTd fontWeight="bold">Threshold Marks</CustomTd>
                        {Object.values(processedData[expandedSheet].coData).map(
                          (arr, idx) => (
                            <CustomTd key={`threshold-marks-${idx}`}>
                              {(arr[1] || 0) * (threshold / 100).toFixed(2)}
                            </CustomTd>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <CustomTd fontWeight="bold">
                          Students ≥ Threshold
                        </CustomTd>
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
                            return (
                              <CustomTd key={`above-${idx}`}>{above}</CustomTd>
                            );
                          }
                        )}
                      </Tr>
                      <Tr>
                        <CustomTd fontWeight="bold">Total Students</CustomTd>
                        {Object.keys(processedData[expandedSheet].coData).map(
                          (_, idx) => (
                            <CustomTd key={`total-${idx}`}>
                              {processedData[expandedSheet].studentNames
                                .length - 1}
                            </CustomTd>
                          )
                        )}
                      </Tr>
                      <Tr>
                        <CustomTd fontWeight="bold">
                          Percentage Attainment
                        </CustomTd>
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
                              <CustomTd key={`attainment-${idx}`}>
                                {total > 0
                                  ? ((above / total) * 100).toFixed(2)
                                  : "0.00"}
                              </CustomTd>
                            );
                          }
                        )}
                      </Tr>
                      <Tr>
                        <CustomTd fontWeight="bold">Attainment Level</CustomTd>
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
                            return (
                              <CustomTd key={`level-${idx}`}>{level}</CustomTd>
                            );
                          }
                        )}
                      </Tr>
                    </Tbody>
                  </CustomTable>
                </Box>
              )}

              <Divider my={4} />

              {expandedSheet && processedData[expandedSheet] && (
                <Box mt={8} overflowX="auto">
                  <Heading size="xl" mb={4} color="gray.700">
                    CO Attainment Levels
                  </Heading>
                  <CustomTable variant="striped" colorScheme="gray">
                    <Thead>
                      <Tr>
                        <CustomTh>CO</CustomTh>
                        <CustomTh>Attainment Level</CustomTh>
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
                              <CustomTd>{coKey}</CustomTd>
                              <CustomTd fontWeight="bold">{level}</CustomTd>
                            </Tr>
                          );
                        }
                      )}
                    </Tbody>
                  </CustomTable>
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
                  <Heading size="xl" mb={4} color="gray.700">
                    Detailed CO Analysis
                  </Heading>
                  <Divider my={4} />

                  <CustomTable variant="striped" colorScheme="gray">
                    <Thead>
                      <Tr>
                        <CustomTh>CO</CustomTh>
                        <CustomTh>Statement</CustomTh>
                        {componentNames.map((component) => (
                          <CustomTh key={component}>{component}</CustomTh>
                        ))}
                        <CustomTh>Attainment Level</CustomTh>
                        <CustomTh>Indirect Assessment</CustomTh>
                        <CustomTh>Overall Attainment</CustomTh>
                        <CustomTh>Percentage</CustomTh>
                      </Tr>
                      <Tr>
                        <CustomTh></CustomTh>
                        <CustomTh></CustomTh>
                        {componentNames.map((component, i) => (
                          <CustomTh key={`weight-${i}`}>
                            Weight: {(weights[i] / 100).toFixed(3)}
                          </CustomTh>
                        ))}
                        <CustomTh></CustomTh>
                        <CustomTh></CustomTh>
                        <CustomTh></CustomTh>
                        <CustomTh></CustomTh>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {getDetailedAnalysisData().map((row, index) => (
                        <Tr key={index} _hover={{ bg: "gray.50" }}>
                          <CustomTd fontWeight="bold">{row.co}</CustomTd>
                          <CustomTd>{row.statement}</CustomTd>
                          {componentNames.map((component) => (
                            <CustomTd key={`${row.co}-${component}`}>
                              {row.components[component]?.value || 0}
                            </CustomTd>
                          ))}
                          <CustomTd>{row.attainmentLevel.toFixed(2)}</CustomTd>
                          <CustomTd>
                            {row.indirectAssessment.toFixed(2)}
                          </CustomTd>
                          <CustomTd>
                            {row.overallAttainment.toFixed(2)}
                          </CustomTd>
                          <CustomTd>
                            {row.overallPercentage.toFixed(2)}%
                          </CustomTd>
                        </Tr>
                      ))}
                    </Tbody>
                  </CustomTable>

                  <Box mt={8}>
                    <Heading size="md" mb={4} color="gray.700">
                      Attainment Targets
                    </Heading>
                    <CustomTable maxW="300px">
                      <Thead>
                        <Tr>
                          <CustomTh>Target (%)</CustomTh>
                          <CustomTh>CO</CustomTh>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getDetailedAnalysisData().map((row, index) => (
                          <Tr key={`target-${index}`}>
                            <CustomTd>{threshold}</CustomTd>
                            <CustomTd>{row.co}</CustomTd>
                          </Tr>
                        ))}
                      </Tbody>
                    </CustomTable>
                  </Box>

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
                            <Text mb={2} fontWeight="medium">
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
                            <Text fontWeight="medium">
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

                  <Box mt={8}>
                    <Heading size="md" mb={4} color="gray.700">
                      Attainment vs Target
                    </Heading>
                    <Card bg={tableBg} p={4}>
                      <Box
                        id="co-attainment-chart"
                        height="400px"
                        position="relative"
                        zIndex="1"
                        bg="white"
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
