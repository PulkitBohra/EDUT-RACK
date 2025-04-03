import React, { useState } from "react";
import { useToast, Box, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import MainHeader from "@/shared/MainHeader";
import { Global } from "@emotion/react";

const FileUploadPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { componentNames } = location.state || { componentNames: [] };

    const [selectedFiles, setSelectedFiles] = useState(Array(componentNames.length).fill(null));
    const [fileContents, setFileContents] = useState(Array(componentNames.length).fill(null));
    const toast = useToast();

    const handleFileChange = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            const updatedFiles = [...selectedFiles];
            updatedFiles[index] = file;
            setSelectedFiles(updatedFiles);

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Extracting headers and rows separately for correct alignment
                const range = XLSX.utils.decode_range(sheet["!ref"]);
                const headers = [];
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
                    headers.push(cell ? XLSX.utils.format_cell(cell) : `Column ${C + 1}`);
                }

                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const updatedContents = [...fileContents];
                updatedContents[index] = { headers, rows: jsonData.slice(1) }; // Skip header row in rows
                setFileContents(updatedContents);
            };
            reader.readAsArrayBuffer(file);

            toast({
                title: "Upload Successful",
                description: `${file.name} uploaded successfully!`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleSubmit = () => {
        navigate("/uploaded-files", { state: { selectedFiles, fileContents } });
    };

    return (
        <>
            <MainHeader />
            <Global styles={{ body: { background: "url('/b.jpg')", backgroundSize: "cover" } }} />
            <div className="min-h-screen flex items-center justify-center ">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="w-[400px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/30">
                        <CardContent className="flex flex-col items-center">
                            <Text className="text-2xl font-bold text-gray-800 mb-4">Upload Files</Text>

                            {componentNames.map((name, index) => (
                                <Box key={index} mt={4} className="w-full">
                                    <Text fontSize="md" fontWeight="semibold">{name} - Upload File</Text>
                                    <label className="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-indigo-500 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-all cursor-pointer">
                                        <UploadCloud size={32} className="text-indigo-600 mb-2" />
                                        <Text className="text-gray-600">Click or Drag & Drop</Text>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => handleFileChange(e, index)}
                                            accept=".xlsx, .xls, .csv"
                                        />
                                    </label>
                                    {selectedFiles[index] && (
                                        <Text fontSize="sm" color="green.500" mt={2}>{selectedFiles[index].name}</Text>
                                    )}
                                </Box>
                            ))}

                            <Button className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSubmit}>
                                View Uploaded Files
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default FileUploadPage;
