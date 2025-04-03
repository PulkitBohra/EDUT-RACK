import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Input } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainHeader from "@/shared/MainHeader";
import { Divider } from "@chakra-ui/react";
import * as XLSX from "xlsx";

const UploadedFilesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedFiles = [], fileContents = [] } = location.state || {};

    const [processedData, setProcessedData] = useState([]);
    const [thresholdPercent, setThresholdPercent] = useState(50);

    useEffect(() => {
        if (fileContents.length > 0) {
            const transformedData = fileContents.map((fileContent) => {
                if (!fileContent || !fileContent.headers || !fileContent.rows) return null;

                const headers = fileContent.headers.slice(3);
                const dataRows = fileContent.rows.filter(row => row[1] && isNaN(row[1]));
                const marksRow = fileContent.rows[fileContent.rows.length - 1].slice(3);
                const marksDistribution = marksRow.map((val) => parseFloat(val) || 0);
                const totalStudents = dataRows.length;
                const thresholdMarks = marksDistribution.map((mark) => (mark * thresholdPercent) / 100);

                const students = dataRows.map((row) => {
                    const rollNo = row[1];
                    const studentMarks = row.slice(3).map((val) => parseFloat(val) || 0);
                    const totalMarks = studentMarks.reduce((sum, val) => sum + val, 0).toFixed(2);
                    return { rollNo, marks: studentMarks, totalMarks };
                });

                const studentsAboveThreshold = thresholdMarks.map((threshold, index) => {
                    return students.filter(student => student.marks[index] >= threshold).length;
                });

                const percentageAttainment = studentsAboveThreshold.map((numStudents) =>
                    totalStudents > 0 ? (100 * numStudents) / totalStudents : 0
                );

                const attainmentLevel = percentageAttainment.map((percent) => {
                    if (percent > 80) return 3;
                    if (percent >= 40) return 2;
                    return 1;
                });

                return {
                    headers,
                    marksDistribution,
                    students,
                    thresholdMarks,
                    studentsAboveThreshold,
                    totalStudents,
                    percentageAttainment,
                    attainmentLevel
                };
            });

            setProcessedData(transformedData);
        }
    }, [fileContents, thresholdPercent]);

    const downloadExcel = () => {
        const wb = XLSX.utils.book_new();
        
        processedData.forEach((data, fileIndex) => {
            const sheetData = [];

            // Student Data Table
            sheetData.push(["Student Data"]);
            sheetData.push(["Roll No", ...data.headers, "Total Marks"]);
            data.students.forEach(student => {
                sheetData.push([student.rollNo, ...student.marks, student.totalMarks]);
            });

            // Add a blank row for spacing
            sheetData.push([]);
            sheetData.push([]);

            // Attainment Table
            sheetData.push(["Attainment Data"]);
            sheetData.push(["COs", ...data.headers]);
            sheetData.push(["Marks", ...data.marksDistribution]);
            sheetData.push(["Total No. of Students in Class", ...Array(data.headers.length).fill(data.totalStudents - 1)]);
            sheetData.push(["Threshold Marks", ...data.thresholdMarks]);
            sheetData.push(["No. of Students Above Threshold", ...data.studentsAboveThreshold]);
            sheetData.push(["Percentage Attainment", ...data.percentageAttainment.map((p) => p.toFixed(2))]);
            sheetData.push(["Attainment Level", ...data.attainmentLevel]);

            // Add a blank row for spacing
            sheetData.push([]);
            sheetData.push([]);

            // CO-wise Attainment Level Table
            sheetData.push(["CO-wise Attainment Level"]);
            sheetData.push(["CO", "CO wise Attainment Level"]);
            data.headers.forEach((header, i) => {
                sheetData.push([header, data.attainmentLevel[i]]);
            });

            // Convert data to sheet and add to workbook
            const ws = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, `Processed Data ${fileIndex + 1}`);
        });

        XLSX.writeFile(wb, "Processed_Excel_Files.xlsx");
    };

    return (
        <>
            <MainHeader />
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <Card className="w-[900px] bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/30">
                    <CardContent className="flex flex-col items-center w-full">
                        <Text className="text-2xl font-bold text-gray-800 mb-4">Processed Data</Text>

                        <Box className="mb-4">
                            <label className="text-gray-700 font-semibold">Threshold %:</label>
                            <Input type="number" value={thresholdPercent} onChange={(e) => setThresholdPercent(e.target.value)} className="ml-2 border border-gray-300 rounded px-2 py-1 w-20" />
                        </Box>

                        {processedData.length === 0 ? (
                            <Text className="text-gray-500">No valid data found.</Text>
                        ) : (
                            processedData.map((data, fileIndex) => (
                                <Box key={fileIndex} mt={6} className="w-full">
                                    <Text className="text-xl font-semibold text-indigo-600 mb-3">Excel File {fileIndex + 1}</Text>
                                    <Divider borderColor="gray.400" mb={4} />
                                    
                                    {/* Display Student Data */}
                                    <Text className="text-lg font-bold mt-4">Student Data</Text>
                                    <TableContainer>
                                        <Table size="sm">
                                            <Thead>
                                                <Tr>
                                                    <Th>Roll No</Th>
                                                    {data.headers.map((header, i) => <Th key={i}>{header}</Th>)}
                                                    <Th>Total Marks</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {data.students.map((student, i) => (
                                                    <Tr key={i}>
                                                        <Td>{student.rollNo}</Td>
                                                        {student.marks.map((mark, j) => <Td key={j}>{mark}</Td>)}
                                                        <Td>{student.totalMarks}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>

                                                                        {/* Attainment Table */}
                                                                        <TableContainer width="100%" overflowX="auto" mt={6}>
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>COs</Th>
                                                    {data.headers.map((header, i) => (
                                                        <Th key={i} textAlign="center">{header}</Th>
                                                    ))}
                                                </Tr>
                                                <Tr>
                                                    <Th>Marks</Th>
                                                    {data.marksDistribution.map((mark, i) => (
                                                        <Th key={i} textAlign="center">{mark}</Th>
                                                    ))}
                                                </Tr>
                                                <Tr>
                                                    <Th>Total No. of Students in Class</Th>
                                                    <Th colSpan={data.headers.length} textAlign="center">{data.totalStudents-1}</Th>
                                                </Tr>
                                                <Tr>
                                                    <Th>Threshold Marks</Th>
                                                    {data.thresholdMarks.map((mark, i) => (
                                                        <Th key={i} textAlign="center">{mark}</Th>
                                                    ))}
                                                </Tr>
                                                <Tr>
                                                    <Th>No. of Students Above Threshold</Th>
                                                    {data.studentsAboveThreshold.map((count, i) => (
                                                        <Th key={i} textAlign="center">{count}</Th>
                                                    ))}
                                                </Tr>
                                                <Tr>
                                                    <Th>Percentage Attainment</Th>
                                                    {data.percentageAttainment.map((percent, i) => (
                                                        <Th key={i} textAlign="center">{percent.toFixed(2)}</Th>
                                                    ))}
                                                </Tr>
                                                <Tr>
                                                    <Th>CO-Wise Average Percentage Attainment</Th>
                                                    {data.percentageAttainment.map((percent, i) => (
                                                        <Th key={i} textAlign="center">{percent.toFixed(2)}</Th>
                                                    ))}
                                                </Tr>
                                                <Tr>
                                                    <Th>Attainment Level</Th>
                                                    {data.attainmentLevel.map((level, i) => (
                                                        <Th key={i} textAlign="center">{level}</Th>
                                                    ))}
                                                </Tr>
                                            </Thead>
                                        </Table>
                                    </TableContainer>

                                    {/* CO-wise Attainment Level Table */}
                                    <TableContainer width="100%" overflowX="auto" mt={6}>
                                        <Table variant="simple" border="1px solid gray">
                                            <Thead>
                                                <Tr>
                                                    <Th textAlign="center">CO</Th>
                                                    <Th textAlign="center">CO wise Attainment Level</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {data.headers.map((header, i) => (
                                                    <Tr key={i}>
                                                        <Td textAlign="center">{header}</Td>
                                                        <Td textAlign="center">{data.attainmentLevel[i]}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                    <Divider borderColor="gray.400" mb={4} />

                                </Box>
                            ))
                        )}

                        <Button className="mt-4 bg-green-600 text-white hover:bg-green-700" onClick={downloadExcel}>
                            Download Processed Excel
                        </Button>
                        <Button className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => navigate("/")}>Upload More Files</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default UploadedFilesPage;

