import React, { useState } from "react";
import { useToast, Box, Text, VStack } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useLocation } from "react-router-dom";
import MainHeader from "@/shared/MainHeader";
import { Global } from '@emotion/react';

const FileUploadPage = () => {
    const location = useLocation();
    const { componentNames } = location.state || { componentNames: [] };

    const [selectedFiles, setSelectedFiles] = useState(Array(componentNames.length).fill(null));
    const toast = useToast();

    const handleFileChange = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            const updatedFiles = [...selectedFiles];
            updatedFiles[index] = file;
            setSelectedFiles(updatedFiles);

            toast({
                title: "Upload Successful",
                description: `${file.name} uploaded successfully!`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <MainHeader />
            <Global styles={{ body: { background: "url('/b.jpg')", backgroundSize: 'cover' } }} />
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
                                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, index)} />
                                    </label>
                                </Box>
                            ))}

                            <Button className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700">Submit</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default FileUploadPage;
